import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Beef, Activity, TrendingDown, Scale, CheckCircle2, AlertTriangle, Trophy } from "lucide-react";
import { metas, today, useList, useProfile } from "@/lib/data";
import { calcScore, metaCaloricaAtingida, OBJETIVOS, type Objetivo } from "@/lib/nutrition";
import { Bar, PageTitle, Panel, StatCard } from "@/components/StatCard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — HelpNutri" }, { name: "description", content: "Seu resumo diário." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: profile } = useProfile();
  const meals = useList("meals", 1).data ?? [];
  const workouts = useList("workouts", 1).data ?? [];
  const weights = useList("weight_history", 365).data ?? [];
  if (!profile?.peso) return null;

  const pesoAtual = weights[0] ? Number(weights[0].peso) : Number(profile.peso);
  const m = metas(profile, pesoAtual);
  const d = today();
  const mealsHoje = meals.filter((x) => x.data === d);
  const kcal = mealsHoje.reduce((s, x) => s + Number(x.calorias), 0);
  const prot = mealsHoje.reduce((s, x) => s + Number(x.proteinas), 0);
  const gasto = workouts.filter((x) => x.data === d).reduce((s, x) => s + Number(x.calorias_gastas), 0);
  const saldo = Math.round(kcal - (m.tdee + gasto));
  const objetivo = profile.objetivo as Objetivo;
  const calOk = metaCaloricaAtingida(kcal, m.meta, objetivo);
  const protOk = prot >= m.proteina;
  const score = calcScore({ metaCaloricaOk: calOk, metaProteinaOk: protOk, exercicio: gasto > 0, registroAlimentar: mealsHoje.length > 0 });

  return (
    <>
      <PageTitle title={`Olá, ${profile.nome?.split(" ")[0] || "atleta"} 👋`} subtitle={`Objetivo: ${OBJETIVOS[objetivo].label}`} />

      <div className={`mb-5 flex items-center gap-3 rounded-2xl border p-4 ${calOk ? "border-success/40 bg-success/10" : "border-warning/40 bg-warning/10"}`}>
        {calOk ? <CheckCircle2 className="h-6 w-6 text-success" /> : <AlertTriangle className="h-6 w-6 text-warning" />}
        <div className="flex-1">
          <p className="font-semibold">{calOk ? (objetivo === "perder" ? "Déficit atingido" : "Meta atingida") : "Meta não atingida"}</p>
          <p className="text-xs text-muted-foreground">{mealsHoje.length === 0 ? "Registre sua primeira refeição de hoje." : `Meta do dia: ${m.meta} kcal`}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border bg-gradient-primary p-5 text-primary-foreground shadow-glow sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-sm font-medium"><Trophy className="h-5 w-5" /> Score diário</div>
          <div className="mt-3 font-display text-5xl font-extrabold">{score}<span className="text-2xl opacity-70">/100</span></div>
          <ul className="mt-3 space-y-0.5 text-xs opacity-90">
            <li>{calOk ? "✓" : "○"} Meta calórica</li>
            <li>{protOk ? "✓" : "○"} Meta de proteínas</li>
            <li>{gasto > 0 ? "✓" : "○"} Exercício registrado</li>
            <li>{mealsHoje.length > 0 ? "✓" : "○"} Registro alimentar</li>
          </ul>
        </div>
        <StatCard icon={Flame} label="Calorias consumidas" value={<>{Math.round(kcal)} <span className="text-base text-muted-foreground">/ {m.meta} kcal</span></>}>
          <Bar value={kcal} max={m.meta} />
        </StatCard>
        <StatCard icon={Beef} tone="accent" label="Proteínas consumidas" value={<>{Math.round(prot)}g <span className="text-base text-muted-foreground">/ {m.proteina}g</span></>}>
          <Bar value={prot} max={m.proteina} tone="accent" />
        </StatCard>
        <StatCard icon={Activity} tone="warning" label="Gasto em exercícios" value={`${Math.round(gasto)} kcal`} hint={<Link to="/exercicios" className="text-accent">Registrar treino →</Link>} />
        <StatCard icon={TrendingDown} tone={saldo <= 0 ? "primary" : "destructive"} label="Saldo calórico atual" value={`${saldo > 0 ? "+" : ""}${saldo} kcal`} hint="Consumo − (TDEE + exercícios)" />
        <StatCard icon={Scale} tone="accent" label="Peso atual" value={`${pesoAtual} kg`} hint={weights[0] ? `Registrado em ${new Date(weights[0].data + "T12:00").toLocaleDateString("pt-BR")}` : undefined} />
      </div>

      <Panel title="Seus cálculos" className="mt-5">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[["TMB", `${m.tmb} kcal`], ["TDEE", `${m.tdee} kcal`], ["Meta calórica", `${m.meta} kcal`], ["Meta de proteínas", `${m.proteina} g`]].map(([k, v]) => (
            <div key={k}><p className="text-xs text-muted-foreground">{k}</p><p className="font-display text-lg font-semibold">{v}</p></div>
          ))}
        </div>
        <Link to="/onboarding" className="mt-4 inline-block text-xs text-accent">Atualizar perfil →</Link>
      </Panel>
    </>
  );
}
