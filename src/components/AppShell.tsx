import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Utensils, Dumbbell, TrendingUp, LogOut, Leaf, Droplets, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { profileComplete, useProfile } from "@/lib/data";

const NAV = [
  { to: "/dashboard", label: "Início", icon: LayoutDashboard },
  { to: "/refeicoes", label: "Refeições", icon: Utensils },
  { to: "/exercicios", label: "Exercícios", icon: Dumbbell },
  { to: "/evolucao", label: "Evolução", icon: TrendingUp },
  { to: "/agua", label: "Água", icon: Droplets },
] as const;

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
        <Leaf className="h-5 w-5 text-primary-foreground" />
      </span>
      <span className="font-display text-lg font-bold">Help<span className="text-primary">Nutri</span></span>
    </div>
  );
}

export function AppShell() {
  const { data: profile, isLoading } = useProfile();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!isLoading && !profileComplete(profile) && pathname !== "/onboarding") {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [isLoading, profile, pathname, navigate]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (pathname === "/onboarding") return <Outlet />;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-sidebar p-5 lg:flex">
        <Logo />
        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground"
              activeProps={{ className: "bg-sidebar-accent text-foreground" }}>
              <Icon className="h-5 w-5" /> {label}
            </Link>
          ))}
        </nav>
        <div className="border-t pt-4">
          <Button asChild variant="ghost" className="mb-3 w-full justify-start"><Link to="/perfil"><Settings />Perfil e configurações</Link></Button>
          <p className="truncate text-sm font-semibold">{profile?.nome || "Você"}</p>
          <p className="truncate text-xs text-muted-foreground">{profile?.email}</p>
          <Button variant="ghost" onClick={signOut} className="mt-3 justify-start px-0 text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <div className="flex shrink-0 items-center gap-1">
        <Button asChild size="icon" variant="ghost"><Link to="/perfil" aria-label="Perfil e configurações" title="Perfil e configurações"><Settings /></Link></Button>
        <Button size="icon" variant="ghost" onClick={signOut} aria-label="Sair" title="Sair" className="text-muted-foreground hover:text-destructive">
          <LogOut className="h-5 w-5" />
        </Button>
        </div>
      </header>

      <main className="mx-auto min-w-0 max-w-6xl px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 lg:ml-64 lg:px-8 lg:pb-10 lg:pt-10">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex min-w-0 flex-col items-center gap-1 py-3 text-[11px] font-medium text-muted-foreground"
            activeProps={{ className: "text-primary" }}>
            <Icon className="h-5 w-5" /> {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
