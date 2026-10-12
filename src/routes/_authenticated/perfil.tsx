import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { metas, useList, useProfile, type Profile } from "@/lib/data";
import { ATIVIDADES, OBJETIVOS, type Atividade, type Objetivo } from "@/lib/nutrition";
import { formatLiters, waterMl } from "@/lib/hydration";
import { PageTitle, Panel } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({ meta: [{ title: "Perfil e configurações — HelpNutri" }, { name: "description", content: "Atualize seu perfil, metas nutricionais e objetivo diário de hidratação." }, { property: "og:title", content: "Perfil e configurações — HelpNutri" }, { property: "og:description", content: "Seu perfil e suas metas pessoais no HelpNutri." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const query = useProfile();
  const weights = useList("weight_history", 365);
  if (query.isLoading || weights.isLoading) return <p className="text-muted-foreground">Carregando perfil…</p>;
  if (query.isError || weights.isError) return <p role="alert" className="text-destructive">Não foi possível carregar o perfil. <Button variant="link" onClick={() => { query.refetch(); weights.refetch(); }}>Tentar novamente</Button></p>;
  if (!query.data) return null;
  const weight = Number(weights.data?.[0]?.peso ?? query.data.peso);
  return <><PageTitle title="Perfil e configurações" subtitle={query.data.nome} /><ProfileEditor key={`${query.data.id}-${query.data.idade}-${query.data.altura}-${weight}-${query.data.nivel_atividade}-${query.data.objetivo}-${query.data.hydration_goal_ml}`} profile={query.data} weight={weight} /></>;
}

function ProfileEditor({ profile, weight }: { profile: Profile; weight: number }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ idade: String(profile.idade), peso: String(weight), altura: String(profile.altura), atividade: profile.nivel_atividade as Atividade, objetivo: profile.objetivo as Objetivo, agua: String(profile.hydration_goal_ml / 1000) });
  const [saving, setSaving] = useState(false);
  const preview = Number(f.idade) > 0 && Number(f.peso) > 0 && Number(f.altura) > 0 ? metas({ ...profile, idade: Number(f.idade), peso: Number(f.peso), altura: Number(f.altura), nivel_atividade: f.atividade, objetivo: f.objetivo }) : null;
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.rpc("update_profile_settings", { p_age: Number(f.idade), p_weight: Number(f.peso), p_height: Number(f.altura), p_activity: f.atividade, p_goal: f.objetivo, p_hydration_goal: waterMl(Number(f.agua), "liters") });
      if (error) throw error;
      await Promise.all([qc.invalidateQueries({ queryKey: ["profile"] }), qc.invalidateQueries({ queryKey: ["weight_history"] })]);
      toast.success("Perfil atualizado e metas recalculadas");
    } catch { toast.error("Não foi possível atualizar o perfil. Revise os dados e tente novamente."); }
    finally { setSaving(false); }
  }
  return <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
    <Panel title="Dados pessoais"><form onSubmit={save} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2"><Label htmlFor="profile-age">Idade</Label><Input id="profile-age" type="number" min={12} max={100} required value={f.idade} onChange={(e) => setF({ ...f, idade: e.target.value })} /></div>
        <div className="space-y-2"><Label htmlFor="profile-weight">Peso (kg)</Label><Input id="profile-weight" type="number" step="0.1" min={30} max={300} required value={f.peso} onChange={(e) => setF({ ...f, peso: e.target.value })} /></div>
        <div className="space-y-2"><Label htmlFor="profile-height">Altura (cm)</Label><Input id="profile-height" type="number" min={120} max={230} required value={f.altura} onChange={(e) => setF({ ...f, altura: e.target.value })} /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="profile-activity">Nível de atividade</Label><Select value={f.atividade} onValueChange={(v) => setF({ ...f, atividade: v as Atividade })}><SelectTrigger id="profile-activity" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(ATIVIDADES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="profile-goal">Objetivo</Label><Select value={f.objetivo} onValueChange={(v) => setF({ ...f, objetivo: v as Objetivo })}><SelectTrigger id="profile-goal" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(OBJETIVOS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2 border-t pt-5"><Label htmlFor="profile-water">Meta diária de água (L)</Label><Input id="profile-water" type="number" step="0.05" min="0.05" required value={f.agua} onChange={(e) => setF({ ...f, agua: e.target.value })} /></div>
      <Button type="submit" disabled={saving} className="w-full sm:w-auto"><Save />{saving ? "Salvando…" : "Salvar alterações"}</Button>
    </form></Panel>
    <Panel title="Metas diárias"><dl className="space-y-5" aria-live="polite">
      <div><dt className="text-sm text-muted-foreground">Calorias</dt><dd className="mt-1 text-2xl font-bold text-primary">{preview?.meta ?? "—"} kcal</dd></div>
      <div><dt className="text-sm text-muted-foreground">Proteínas</dt><dd className="mt-1 text-2xl font-bold text-accent">{preview?.proteina ?? "—"} g</dd></div>
      <div><dt className="text-sm text-muted-foreground">Água</dt><dd className="mt-1 text-2xl font-bold">{formatLiters(Number(f.agua) * 1000)} L</dd></div>
    </dl></Panel>
  </div>;
}