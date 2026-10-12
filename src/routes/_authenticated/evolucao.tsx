import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { daysAgo, metas, today, useDelete, useInsert, useList, useProfile } from "@/lib/data";
import { PageTitle, Panel } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/evolucao")({
  head: () => ({ meta: [{ title: "Evolução — HelpNutri" }, { name: "description", content: "Gráficos de peso e consumo." }] }),
  component: Evolucao,
});

const axis = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false };
const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" } };
const fmt = (d: string) => new Date(d + "T12:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

function Evolucao() {
  const { data: profile } = useProfile();
  const weights = useList("weight_history", 365).data ?? [];
  const meals = useList("meals", 7).data ?? [];
  const workouts = useList("workouts", 7).data ?? [];
  const ins = useInsert("weight_history");
  const del = useDelete("weight_history");
  const [peso, setPeso] = useState("");
  const [data, setData] = useState(today());

  const tdee = profile?.peso ? metas(profile, weights[0] ? Number(weights[0].peso) : undefined).tdee : 0;
  const week = Array.from({ length: 7 }, (_, i) => daysAgo(6 - i)).map((d) => {
    const kcal = meals.filter((m) => m.data === d).reduce((s, m) => s + Number(m.calorias), 0);
    const prot = meals.filter((m) => m.data === d).reduce((s, m) => s + Number(m.proteinas), 0);
    const gasto = workouts.filter((w) => w.data === d).reduce((s, w) => s + Number(w.calorias_gastas), 0);
    return { dia: fmt(d), kcal: Math.round(kcal), prot: Math.round(prot), saldo: kcal ? Math.round(kcal - tdee - gasto) : 0 };
  });
  const pesoSerie = [...weights].reverse().map((w) => ({ dia: fmt(w.data), peso: Number(w.peso) }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try { await ins.mutateAsync({ peso: Number(peso), data }); setPeso(""); toast.success("Peso registrado"); }
    catch (err) { toast.error((err as Error).message); }
  }

  return (
    <>
      <PageTitle title="Evolução" subtitle="Acompanhe seu progresso ao longo do tempo." />
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Panel title="Registrar peso">
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5"><Label>Peso (kg)</Label><Input type="number" step="0.1" min={30} max={300} required value={peso} onChange={(e) => setPeso(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Data</Label><Input type="date" required value={data} onChange={(e) => setData(e.target.value)} /></div>
            <Button type="submit" className="w-full" disabled={ins.isPending}>Salvar</Button>
          </form>
          <ul className="mt-5 max-h-64 divide-y overflow-auto rounded-xl border empty:hidden">
            {weights.map((w) => (
              <li key={w.id} className="flex items-center justify-between p-2.5 text-sm">
                <span className="text-muted-foreground">{new Date(w.data + "T12:00").toLocaleDateString("pt-BR")}</span>
                <span className="flex items-center gap-2 font-semibold">{Number(w.peso)} kg
                  <button aria-label="Excluir" onClick={() => del.mutate(w.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Evolução de peso">
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={pesoSerie}>
                <defs><linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="dia" {...axis} /><YAxis domain={["dataMin - 1", "dataMax + 1"]} width={36} {...axis} />
                <Tooltip {...tip} />
                <Area type="monotone" dataKey="peso" stroke="var(--primary)" strokeWidth={2.5} fill="url(#gp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel title="Calorias na semana">
          <div className="h-52"><ResponsiveContainer><BarChart data={week}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="dia" {...axis} /><YAxis width={36} {...axis} /><Tooltip {...tip} cursor={{ fill: "var(--secondary)" }} /><Bar dataKey="kcal" name="kcal" fill="var(--primary)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Proteínas na semana">
          <div className="h-52"><ResponsiveContainer><BarChart data={week}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="dia" {...axis} /><YAxis width={36} {...axis} /><Tooltip {...tip} cursor={{ fill: "var(--secondary)" }} /><Bar dataKey="prot" name="g" fill="var(--accent)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Déficit semanal">
          <div className="h-52"><ResponsiveContainer><BarChart data={week}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="dia" {...axis} /><YAxis width={40} {...axis} /><Tooltip {...tip} cursor={{ fill: "var(--secondary)" }} /><ReferenceLine y={0} stroke="var(--muted-foreground)" />
            <Bar dataKey="saldo" name="kcal" radius={[6, 6, 6, 6]}>{week.map((w, i) => <Cell key={i} fill={w.saldo <= 0 ? "var(--primary)" : "var(--destructive)"} />)}</Bar>
          </BarChart></ResponsiveContainer></div>
        </Panel>
      </div>
    </>
  );
}
