import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/AppShell";
import { ATIVIDADES, OBJETIVOS, type Atividade, type Objetivo } from "@/lib/nutrition";
import { today, useProfile } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Seu perfil — HelpNutri" }, { name: "description", content: "Configure seu perfil." }] }),
  component: Onboarding,
});

function Choice<T extends string>({ value, onChange, options }: { value: T | ""; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map(([k, label]) => (
        <button type="button" key={k} onClick={() => onChange(k)}
          className={cn("rounded-xl border px-4 py-3 text-left text-sm font-medium transition", value === k ? "border-primary bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-secondary")}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Onboarding() {
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [f, setF] = useState({ nome: "", idade: "", sexo: "" as "" | "masculino" | "feminino", peso: "", altura: "", nivel_atividade: "" as "" | Atividade, objetivo: "" as "" | Objetivo });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setF((s) => ({
      ...s, nome: profile.nome || s.nome,
      idade: profile.idade?.toString() ?? "", sexo: (profile.sexo as never) ?? "", peso: profile.peso?.toString() ?? "",
      altura: profile.altura?.toString() ?? "", nivel_atividade: (profile.nivel_atividade as never) ?? "", objetivo: (profile.objetivo as never) ?? "",
    }));
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.sexo || !f.nivel_atividade || !f.objetivo) { toast.error("Preencha todas as opções"); return; }
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const id = u.user!.id;
    const { error } = await supabase.from("profiles").upsert({
      id, email: u.user!.email ?? null, nome: f.nome, idade: Number(f.idade), sexo: f.sexo, peso: Number(f.peso), altura: Number(f.altura),
      nivel_atividade: f.nivel_atividade, objetivo: f.objetivo,
    });
    if (!error && !profile?.peso) await supabase.from("weight_history").insert({ peso: Number(f.peso), data: today() });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await qc.invalidateQueries();
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-background bg-glow px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Logo />
        <h1 className="mt-8 text-3xl font-bold">Vamos montar seu plano</h1>
        <p className="mt-2 text-muted-foreground">Usamos esses dados para calcular suas metas diárias.</p>
        <form onSubmit={save} className="mt-8 space-y-6 rounded-3xl border bg-gradient-surface p-6 shadow-card">
          <div className="space-y-2"><Label>Nome</Label><Input required value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2"><Label>Idade</Label><Input type="number" min={12} max={100} required value={f.idade} onChange={(e) => setF({ ...f, idade: e.target.value })} /></div>
            <div className="space-y-2"><Label>Peso (kg)</Label><Input type="number" step="0.1" min={30} max={300} required value={f.peso} onChange={(e) => setF({ ...f, peso: e.target.value })} /></div>
            <div className="space-y-2"><Label>Altura (cm)</Label><Input type="number" min={120} max={230} required value={f.altura} onChange={(e) => setF({ ...f, altura: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Sexo</Label><Choice value={f.sexo} onChange={(v) => setF({ ...f, sexo: v })} options={[["masculino", "Masculino"], ["feminino", "Feminino"]]} /></div>
          <div className="space-y-2"><Label>Nível de atividade</Label><Choice value={f.nivel_atividade} onChange={(v) => setF({ ...f, nivel_atividade: v })} options={Object.entries(ATIVIDADES).map(([k, v]) => [k as Atividade, v.label])} /></div>
          <div className="space-y-2"><Label>Objetivo</Label><Choice value={f.objetivo} onChange={(v) => setF({ ...f, objetivo: v })} options={Object.entries(OBJETIVOS).map(([k, v]) => [k as Objetivo, v.label])} /></div>
          <Button type="submit" size="lg" className="w-full shadow-glow" disabled={saving}>Calcular minhas metas</Button>
        </form>
      </div>
    </div>
  );
}
