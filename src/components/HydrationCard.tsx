import { Link } from "@tanstack/react-router";
import { Droplets, Plus } from "lucide-react";
import { toast } from "sonner";
import { today, useInsert, useList, useProfile } from "@/lib/data";
import { DEFAULT_HYDRATION_GOAL_ML, formatLiters, GLASS_ML } from "@/lib/hydration";
import { StatCard, Bar } from "@/components/StatCard";
import { Button } from "@/components/ui/button";

export function HydrationCard() {
  const profile = useProfile();
  const water = useList("water_intake", 1);
  const insert = useInsert("water_intake");
  const total = (water.data ?? []).filter((r) => r.data === today()).reduce((sum, r) => sum + r.amount_ml, 0);
  const goal = profile.data?.hydration_goal_ml ?? DEFAULT_HYDRATION_GOAL_ML;
  async function addGlass() {
    try { await insert.mutateAsync({ amount_ml: GLASS_ML, data: today() }); toast.success("Copo registrado"); }
    catch { toast.error("Não foi possível registrar a água. Tente novamente."); }
  }
  return <StatCard icon={Droplets} tone="accent" label="Água de hoje" value={water.isLoading ? "…" : <>{formatLiters(total)} <span className="text-base text-muted-foreground">/ {formatLiters(goal)} L</span></>}>
    <Bar value={total} max={goal} tone="accent" />
    {water.isError && <p role="alert" className="mt-2 text-xs text-destructive">Não foi possível carregar os registros.</p>}
    <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
      <Button type="button" size="sm" variant="secondary" onClick={addGlass} disabled={insert.isPending || water.isError || water.isLoading}><Plus />Copo · 250 ml</Button>
      <Link to="/agua" className="text-xs text-accent">Ver registros →</Link>
    </div>
  </StatCard>;
}