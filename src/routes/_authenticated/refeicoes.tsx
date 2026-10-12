import { createFileRoute } from "@tanstack/react-router";
import { Trash2, Utensils } from "lucide-react";
import { useDelete, useList } from "@/lib/data";
import { PageTitle, Panel } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { MealForm } from "@/components/MealForm";

export const Route = createFileRoute("/_authenticated/refeicoes")({
  head: () => ({ meta: [{ title: "Refeições — HelpNutri" }, { name: "description", content: "Registre alimentos e quantidades com estimativas nutricionais revisáveis." }, { property: "og:title", content: "Refeições — HelpNutri" }, { property: "og:description", content: "Registre alimentos e quantidades com estimativas nutricionais revisáveis." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Refeicoes,
});

function Refeicoes() {
  const mealsQuery = useList("meals", 60);
  const meals = mealsQuery.data ?? [];
  const del = useDelete("meals");

  const groups = meals.reduce<Record<string, typeof meals>>((acc, m) => ((acc[m.data] ??= []).push(m), acc), {});

  return (
    <>
      <PageTitle title="Refeições" subtitle="Adicione o que você comeu hoje." />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        <Panel title="Nova refeição">
          <MealForm />
        </Panel>
        <Panel title="Histórico">
          {mealsQuery.isLoading && <p className="py-10 text-center text-sm text-muted-foreground">Carregando refeições…</p>}
          {mealsQuery.isError && <p role="alert" className="py-4 text-sm text-destructive">Não foi possível carregar o histórico.</p>}
          {!mealsQuery.isLoading && !mealsQuery.isError && meals.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma refeição registrada ainda.</p>}
          <div className="space-y-5">
            {Object.entries(groups).map(([data, list]) => (
              <div key={data}>
                <div className="mb-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-[minmax(0,1fr)_auto]">
                  <span>{new Date(data + "T12:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" })}</span>
                  <span>{Math.round(list.reduce((s, x) => s + Number(x.calorias), 0))} kcal · {Math.round(list.reduce((s, x) => s + Number(x.proteinas), 0))}g prot</span>
                </div>
                <ul className="divide-y rounded-xl border">
                  {list.map((m) => (
                    <li key={m.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 p-3 sm:flex sm:gap-3">
                      <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary sm:grid"><Utensils className="h-4 w-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-medium">{m.nome}</p>
                        <p className="text-xs text-muted-foreground">{m.categoria}{m.horario ? ` · ${m.horario.slice(0, 5)}` : ""}{m.carboidratos != null ? ` · C ${m.carboidratos}g` : ""}{m.gorduras != null ? ` · G ${m.gorduras}g` : ""}</p>
                      </div>
                      <div className="shrink-0 text-right text-sm"><p className="font-semibold">{Number(m.calorias)} kcal</p><p className="text-xs text-accent">{Number(m.proteinas)}g</p></div>
                       <Button variant="ghost" size="icon" aria-label={`Excluir ${m.nome}`} title="Excluir refeição" disabled={del.isPending} onClick={() => del.mutate(m.id)} className="shrink-0 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
