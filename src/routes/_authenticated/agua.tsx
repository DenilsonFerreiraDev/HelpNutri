import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Droplets, Plus, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import { today, useDelete, useInsert, useList, useProfile } from "@/lib/data";
import { DEFAULT_HYDRATION_GOAL_ML, formatLiters, hydrationProgress, waterMl, type WaterUnit } from "@/lib/hydration";
import { Bar, PageTitle, Panel } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/agua")({
  head: () => ({ meta: [{ title: "Água e hidratação — HelpNutri" }, { name: "description", content: "Registre copos e litros de água e acompanhe sua hidratação diária." }, { property: "og:title", content: "Água e hidratação — HelpNutri" }, { property: "og:description", content: "Seu consumo de água e progresso diário no HelpNutri." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: WaterPage,
});

function WaterPage() {
  const profile = useProfile();
  const records = useList("water_intake", 30);
  const insert = useInsert("water_intake");
  const remove = useDelete("water_intake");
  const [day, setDay] = useState(today);
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<WaterUnit>("glasses");
  const selected = (records.data ?? []).filter((r) => r.data === day);
  const total = selected.reduce((sum, r) => sum + r.amount_ml, 0);
  const goal = profile.data?.hydration_goal_ml ?? DEFAULT_HYDRATION_GOAL_ML;
  const progress = hydrationProgress(total, goal);
  async function add(e: React.FormEvent) {
    e.preventDefault();
    try { await insert.mutateAsync({ amount_ml: waterMl(Number(quantity), unit), data: day }); toast.success("Água registrada"); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Não foi possível registrar a água."); }
  }
  async function deleteRecord(id: string) {
    try { await remove.mutateAsync(id); toast.success("Registro removido"); }
    catch { toast.error("Não foi possível remover o registro."); }
  }
  return <><PageTitle title="Água e hidratação" subtitle="Seu consumo diário de água." />
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <Panel title="Registrar água"><form onSubmit={add} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="water-date">Data</Label><Input id="water-date" type="date" min={new Date(Date.now() - 30 * 86400000).toLocaleDateString("en-CA")} max={today()} required value={day} onChange={(e) => setDay(e.target.value)} /></div>
        <Tabs value={unit} onValueChange={(v) => { setUnit(v as WaterUnit); setQuantity(v === "glasses" ? "1" : "0.5"); }}><TabsList className="grid w-full grid-cols-2"><TabsTrigger value="glasses">Copos</TabsTrigger><TabsTrigger value="liters">Litros</TabsTrigger></TabsList></Tabs>
        <div className="space-y-2"><Label htmlFor="water-quantity">{unit === "glasses" ? "Quantidade de copos (250 ml)" : "Quantidade em litros"}</Label><Input id="water-quantity" type="number" required min={unit === "glasses" ? "0.25" : "0.01"} step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
        <Button type="submit" className="w-full" disabled={insert.isPending}><Plus />{insert.isPending ? "Salvando…" : "Registrar água"}</Button>
      </form></Panel>
      <div className="min-w-0 space-y-5">
        <Panel title={day === today() ? "Hidratação de hoje" : "Hidratação do dia"}>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><div className="min-w-0"><p className="text-3xl font-bold text-accent">{records.isLoading ? "…" : formatLiters(total)} <span className="text-base font-normal text-muted-foreground">/ {formatLiters(goal)} L</span></p><p className="mt-2 text-sm text-muted-foreground">{progress.remaining === 0 ? "Meta de hidratação atingida" : `Faltam ${formatLiters(progress.remaining)} L`}</p></div><Droplets className="h-9 w-9 shrink-0 text-accent" /></div>
          <Bar value={total} max={goal} tone="accent" /><p className="mt-2 text-xs text-muted-foreground">{progress.percent}% da meta</p>
          <Button asChild variant="link" className="mt-2 px-0"><Link to="/perfil"><Settings />Ajustar meta diária</Link></Button>
        </Panel>
        <Panel title="Registros do dia">
          {records.isLoading && <p className="text-sm text-muted-foreground">Carregando registros…</p>}
          {records.isError && <p role="alert" className="text-destructive">Não foi possível carregar os registros. <Button variant="link" onClick={() => records.refetch()}>Tentar novamente</Button></p>}
          {!records.isLoading && !records.isError && !selected.length && <p className="text-sm text-muted-foreground">Nenhuma água registrada neste dia.</p>}
          <ul className="divide-y">{selected.map((r) => <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3"><div className="min-w-0"><p className="font-semibold">{r.amount_ml} ml</p><p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p></div><Button variant="ghost" size="icon" aria-label={`Excluir registro de ${r.amount_ml} ml`} title="Excluir registro" disabled={remove.isPending} onClick={() => deleteRecord(r.id)}><Trash2 className="text-muted-foreground" /></Button></li>)}</ul>
        </Panel>
      </div>
    </div>
  </>;
}