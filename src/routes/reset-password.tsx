import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/AppShell";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nova senha — HelpNutri" },
      { name: "description", content: "Defina uma nova senha para sua conta HelpNutri." },
      { property: "og:title", content: "Nova senha — HelpNutri" },
      { property: "og:description", content: "Redefina sua senha." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Senha atualizada!");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background bg-glow px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <form onSubmit={submit} className="space-y-4 rounded-3xl border bg-gradient-surface p-6 shadow-card">
          <h1 className="text-2xl font-bold">Definir nova senha</h1>
          <div className="space-y-2"><Label htmlFor="s">Nova senha</Label><Input id="s" type="password" minLength={6} required value={senha} onChange={(e) => setSenha(e.target.value)} /></div>
          <Button type="submit" className="w-full" disabled={loading}>Salvar</Button>
        </form>
      </div>
    </div>
  );
}
