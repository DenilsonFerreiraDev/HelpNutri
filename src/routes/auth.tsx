import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/AppShell";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — HelpNutri" },
      { name: "description", content: "Entre ou crie sua conta no HelpNutri." },
      { property: "og:title", content: "Entrar — HelpNutri" },
      { property: "og:description", content: "Acesse sua conta HelpNutri." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/dashboard" }); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { if (s) navigate({ to: "/dashboard" }); });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password: senha,
          options: { emailRedirectTo: window.location.origin + "/dashboard", data: { nome } },
        });
        if (error) throw error;
        if (!data.session) toast.success("Conta criada! Confirme seu e-mail para entrar.");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
        if (error) throw error;
        toast.success("Enviamos um link de recuperação para seu e-mail.");
        setMode("login");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("Não foi possível entrar com Google");
  }

  const title = mode === "login" ? "Bem-vindo de volta" : mode === "signup" ? "Crie sua conta" : "Recuperar senha";

  return (
    <div className="grid min-h-screen place-items-center bg-background bg-glow px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-3xl border bg-gradient-surface p-6 shadow-card">
          <h1 className="text-2xl font-bold">{title}</h1>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-2"><Label htmlFor="nome">Nome</Label><Input id="nome" required value={nome} onChange={(e) => setNome(e.target.value)} /></div>
            )}
            <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            {mode !== "forgot" && (
              <div className="space-y-2"><Label htmlFor="senha">Senha</Label><Input id="senha" type="password" minLength={6} required value={senha} onChange={(e) => setSenha(e.target.value)} /></div>
            )}
            {mode === "login" && (
              <button type="button" onClick={() => setMode("forgot")} className="text-xs text-accent hover:underline">Esqueci minha senha</button>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {mode === "login" ? "Entrar" : mode === "signup" ? "Cadastrar" : "Enviar link"}
            </Button>
          </form>
          {mode !== "forgot" && (
            <>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />ou<span className="h-px flex-1 bg-border" /></div>
              <Button variant="outline" className="w-full" onClick={google}>Continuar com Google</Button>
            </>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Já tem conta? " : mode === "login" ? "Ainda não tem conta? " : ""}
            <button className="font-semibold text-primary hover:underline" onClick={() => setMode(mode === "signup" ? "login" : mode === "login" ? "signup" : "login")}>
              {mode === "signup" ? "Entrar" : mode === "login" ? "Cadastre-se" : "Voltar ao login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
