import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Beef, Activity, LineChart, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HelpNutri — Controle de déficit calórico, dieta e treino" },
      { name: "description", content: "Acompanhe calorias, proteínas, exercícios e evolução de peso para emagrecer e definir com metas calculadas para você." },
      { property: "og:title", content: "HelpNutri — Seu parceiro no déficit calórico" },
      { property: "og:description", content: "Metas de calorias e proteínas, registro de refeições, cardio, musculação e gráficos de evolução." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Flame, title: "Meta calórica", text: "TMB, TDEE e meta calculadas a partir do seu perfil." },
  { icon: Beef, title: "Proteínas", text: "Meta diária baseada no seu peso corporal." },
  { icon: Activity, title: "Exercícios", text: "Cardio e musculação com estimativa de gasto." },
  { icon: LineChart, title: "Evolução", text: "Gráficos de peso, consumo e déficit semanal." },
  { icon: Trophy, title: "Score diário", text: "Pontuação de 0 a 100 para manter a constância." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background bg-glow">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <Button asChild variant="ghost"><Link to="/auth">Entrar</Link></Button>
      </header>
      <section className="mx-auto max-w-4xl px-5 pb-16 pt-14 text-center md:pt-24">
        <span className="inline-block rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">Emagrecimento • Definição • Déficit calórico</span>
        <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-6xl">
          Controle seu déficit.<br /><span className="text-gradient">Veja seu corpo mudar.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground md:text-lg">
          Registre refeições e treinos, siga metas personalizadas e acompanhe sua evolução em um só lugar.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="shadow-glow"><Link to="/auth">Começar grátis <ArrowRight /></Link></Button>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-20 sm:grid-cols-2 lg:grid-cols-5">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border bg-gradient-surface p-5 shadow-card">
            <Icon className="h-6 w-6 text-primary" />
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
