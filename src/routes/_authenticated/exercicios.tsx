import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Dumbbell, HeartPulse, Trash2 } from "lucide-react";
import { today, useDelete, useInsert, useList, useProfile } from "@/lib/data";
import { CARDIO_TIPOS, GRUPOS_MUSCULARES, INTENSIDADES, calcCardio, calcMusculacao, type CardioTipo, type Intensidade } from "@/lib/nutrition";
import { PageTitle, Panel } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/exercicios")({
  head: () => ({ meta: [{ title: "Exercícios — HelpNutri" }, { name: "description", content: "Registre cardio e musculação." }] }),
  component: Exercicios,
});

function Exercicios() {
  const { data: profile } = useProfile();
  const weights = useList("weight_history", 365).data ?? [];
  const peso = weights[0] ? Number(weights[0].peso) : Number(profile?.peso ?? 70);
  const list = useList("workouts", 60).data ?? [];
  const ins = useInsert("workouts");
  const del = useDelete("workouts");

  const [c, setC] = useState({ tipo: "caminhada" as CardioTipo, duracao: "30", velocidade: "", inclinacao: "", data: today() });
  const [m, setM] = useState({ grupo: "Peito", intensidade: "moderada" as Intensidade, duracao: "60", data: today() });

  const cardioKcal = c.duracao ? calcCardio({ tipo: c.tipo, duracao: Number(c.duracao), peso, velocidade: Number(c.velocidade) || null, inclinacao: Number(c.inclinacao) || null }) : 0;
  const muscKcal = m.duracao ? calcMusculacao({ intensidade: m.intensidade, duracao: Number(m.duracao), peso }) : 0;

  async function save(row: Parameters<typeof ins.mutateAsync>[0]) {
    try { await ins.mutateAsync(row); toast.success("Treino registrado"); } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <>
      <PageTitle title="Exercícios" subtitle="Estimativa de gasto baseada no seu peso atual." />
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Panel>
          <Tabs defaultValue="cardio">
            <TabsList className="mb-4 grid w-full grid-cols-2"><TabsTrigger value="cardio">Cardio</TabsTrigger><TabsTrigger value="musc">Musculação</TabsTrigger></TabsList>
            <TabsContent value="cardio">
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); save({ categoria: "cardio", tipo: c.tipo, duracao: Number(c.duracao), velocidade: Number(c.velocidade) || null, inclinacao: Number(c.inclinacao) || null, calorias_gastas: cardioKcal, data: c.data }); }}>
                <div className="space-y-1.5"><Label>Tipo</Label>
                  <Select value={c.tipo} onValueChange={(v) => setC({ ...c, tipo: v as CardioTipo })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(CARDIO_TIPOS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Duração (min)</Label><Input type="number" min={1} required value={c.duracao} onChange={(e) => setC({ ...c, duracao: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Data</Label><Input type="date" required value={c.data} onChange={(e) => setC({ ...c, data: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Velocidade (km/h)</Label><Input type="number" step="0.1" min={0} placeholder="Opcional" value={c.velocidade} onChange={(e) => setC({ ...c, velocidade: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Inclinação (%)</Label><Input type="number" step="0.5" min={0} placeholder="Opcional" value={c.inclinacao} onChange={(e) => setC({ ...c, inclinacao: e.target.value })} /></div>
                </div>
                <p className="rounded-xl bg-primary/10 p-3 text-sm">Estimativa: <b className="text-primary">{cardioKcal} kcal</b></p>
                <Button type="submit" className="w-full" disabled={ins.isPending}>Registrar cardio</Button>
              </form>
            </TabsContent>
            <TabsContent value="musc">
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); save({ categoria: "musculacao", tipo: m.grupo, intensidade: m.intensidade, duracao: Number(m.duracao), calorias_gastas: muscKcal, data: m.data }); }}>
                <div className="space-y-1.5"><Label>Grupo muscular</Label>
                  <Select value={m.grupo} onValueChange={(v) => setM({ ...m, grupo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{GRUPOS_MUSCULARES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Intensidade</Label>
                  <Select value={m.intensidade} onValueChange={(v) => setM({ ...m, intensidade: v as Intensidade })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(INTENSIDADES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Duração (min)</Label><Input type="number" min={1} required value={m.duracao} onChange={(e) => setM({ ...m, duracao: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Data</Label><Input type="date" required value={m.data} onChange={(e) => setM({ ...m, data: e.target.value })} /></div>
                </div>
                <p className="rounded-xl bg-primary/10 p-3 text-sm">Estimativa: <b className="text-primary">{muscKcal} kcal</b></p>
                <Button type="submit" className="w-full" disabled={ins.isPending}>Registrar treino</Button>
              </form>
            </TabsContent>
          </Tabs>
        </Panel>
        <Panel title="Histórico">
          {list.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nenhum treino registrado ainda.</p>}
          <ul className="divide-y rounded-xl border empty:hidden">
            {list.map((w) => {
              const cardio = w.categoria === "cardio";
              const Icon = cardio ? HeartPulse : Dumbbell;
              return (
                <li key={w.id} className="flex items-center gap-3 p-3">
                  <span className={`grid h-9 w-9 place-items-center rounded-lg ${cardio ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"}`}><Icon className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{cardio ? CARDIO_TIPOS[w.tipo as CardioTipo]?.label ?? w.tipo : `Musculação · ${w.tipo}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(w.data + "T12:00").toLocaleDateString("pt-BR")} · {w.duracao} min
                      {w.velocidade ? ` · ${w.velocidade} km/h` : ""}{w.inclinacao ? ` · ${w.inclinacao}%` : ""}
                      {w.intensidade ? ` · ${INTENSIDADES[w.intensidade as Intensidade]?.label}` : ""}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{Number(w.calorias_gastas)} kcal</p>
                  <button aria-label="Excluir" onClick={() => del.mutate(w.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </>
  );
}
