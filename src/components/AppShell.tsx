import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Utensils, Dumbbell, TrendingUp, LogOut, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { profileComplete, useProfile } from "@/lib/data";

const NAV = [
  { to: "/dashboard", label: "Início", icon: LayoutDashboard },
  { to: "/refeicoes", label: "Refeições", icon: Utensils },
  { to: "/exercicios", label: "Exercícios", icon: Dumbbell },
  { to: "/evolucao", label: "Evolução", icon: TrendingUp },
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
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-sidebar p-5 md:flex">
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
          <p className="truncate text-sm font-semibold">{profile?.nome || "Você"}</p>
          <p className="truncate text-xs text-muted-foreground">{profile?.email}</p>
          <button onClick={signOut} className="mt-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur md:hidden">
        <Logo />
        <button onClick={signOut} aria-label="Sair" className="rounded-lg p-2 text-muted-foreground hover:text-destructive">
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:ml-64 md:px-10 md:pb-10 md:pt-10">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground"
            activeProps={{ className: "text-primary" }}>
            <Icon className="h-5 w-5" /> {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
