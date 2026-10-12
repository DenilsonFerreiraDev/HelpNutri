import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Utensils } from "lucide-react";
import { today, useDelete, useInsert, useList } from "@/lib/data";
import { PageTitle, Panel } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/refeicoes")({
  head: () => ({ meta: [{ title: "Refeições — HelpNutri" }, { name: "description", content: "Registre suas refeições." }] }),
  component: Refeicoes,
});

const CATS = ["Café da manhã", "Almoço", "Jantar", "Lanche"];
const empty = () => ({ nome: "", categoria: "Almoço", calorias: "", proteinas: "", carboidratos: "", gorduras: "", data: today(), horario: new Date().toTimeString().slice(0, 5) });

function Refeicoes() {
  const meals = useList("meals", 60).data ?? [];
  const ins = useInsert("meals");
  const del = useDelete("meals");
  const [f, setF] = useState(empty());
  const set = (k: keyof ReturnType<typeof empty>) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await ins.mutateAsync({
        nome: f.nome, categoria: f.categoria, calorias: Number(f.calorias), proteinas: Number(f.proteinas),
        carboidratos: f.carboidratos ? Number(f.carboidratos) : null, gorduras: f.gorduras ? Number(f.gorduras) : null,
        data: f.data, horario: f.horario || null,
      });
      toast.success("Refeição registrada");
      setF({ ...empty(), categoria: f.categoria, data: f.data });
    } catch (err) { toast.error((err as Error).message); }
  }

  const groups = meals.reduce<Record<string, typeof meals>>((acc, m) => ((acc[m.data] ??= []).push(m), acc), {});

  return (
    <>
      <PageTitle title="Refeições" subtitle="Adicione o que você comeu hoje." />
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Panel title="Nova refeição">
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5"><Label>Nome da refeição</Label><Input required value={f.nome} onChange={set("nome")} placeholder="Ex: Frango com arroz" /></div>
            <div className="space-y-1.5"><Label>Categoria</Label>
              <Select value={f.categoria} onValueChange={(v) => setF({ ...f, categoria: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Calorias (kcal)</Label><Input type="number" min={0} required value={f.calorias} onChange={set("calorias")} /></div>
              <div className="space-y-1.5"><Label>Proteínas (g)</Label><Input type="number" min={0} step="0.1" required value={f.proteinas} onChange={set("proteinas")} /></div>
              <div className="space-y-1.5"><Label>Carboidratos (g)</Label><Input type="number" min={0} step="0.1" value={f.carboidratos} onChange={set("carboidratos")} placeholder="Opcional" /></div>
              <div className="space-y-1.5"><Label>Gorduras (g)</Label><Input type="number" min={0} step="0.1" value={f.gorduras} onChange={set("gorduras")} placeholder="Opcional" /></div>
              <div className="space-y-1.5"><Label>Data</Label><Input type="date" required value={f.data} onChange={set("data")} /></div>
              <div className="space-y-1.5"><Label>Horário</Label><Input type="time" value={f.horario} onChange={set("horario")} /></div>
            </div>
            <Button type="submit" className="w-full" disabled={ins.isPending}>Adicionar refeição</Button>
          </form>
        </Panel>
        <Panel title="Histórico">
          {meals.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma refeição registrada ainda.</p>}
          <div className="space-y-5">
            {Object.entries(groups).map(([data, list]) => (
              <div key={data}>
                <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                  <span>{new Date(data + "T12:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" })}</span>
                  <span>{Math.round(list.reduce((s, x) => s + Number(x.calorias), 0))} kcal · {Math.round(list.reduce((s, x) => s + Number(x.proteinas), 0))}g prot</span>
                </div>
                <ul className="divide-y rounded-xl border">
                  {list.map((m) => (
                    <li key={m.id} className="flex items-center gap-3 p-3">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Utensils className="h-4 w-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{m.nome}</p>
                        <p className="text-xs text-muted-foreground">{m.categoria}{m.horario ? ` · ${m.horario.slice(0, 5)}` : ""}{m.carboidratos != null ? ` · C ${m.carboidratos}g` : ""}{m.gorduras != null ? ` · G ${m.gorduras}g` : ""}</p>
                      </div>
                      <div className="text-right text-sm"><p className="font-semibold">{Number(m.calorias)} kcal</p><p className="text-xs text-accent">{Number(m.proteinas)}g</p></div>
                      <button aria-label="Excluir" onClick={() => del.mutate(m.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
