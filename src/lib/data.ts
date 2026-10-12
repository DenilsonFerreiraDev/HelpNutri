import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { calcMetaCalorica, calcMetaProteina, calcTDEE, calcTMB, type Atividade, type Objetivo, type Sexo } from "./nutrition";

export type Profile = Tables<"profiles">;
export type Meal = Tables<"meals">;
export type Workout = Tables<"workouts">;
export type Weight = Tables<"weight_history">;

export const today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
export const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

async function uid() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Não autenticado");
  return data.user.id;
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const id = await uid();
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useList<T extends "meals" | "workouts" | "weight_history" | "water_intake">(table: T, sinceDays = 60) {
  return useQuery({
    queryKey: [table, sinceDays],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .gte("data", daysAgo(sinceDays))
        .order("data", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tables<T>[];
    },
  });
}

export function useInsert<T extends "meals" | "workouts" | "weight_history" | "water_intake">(table: T) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: TablesInsert<T>) => {
      const { error } = await supabase.from(table).insert(row as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
  });
}

export function useDelete(table: "meals" | "workouts" | "weight_history" | "water_intake") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
  });
}

export function profileComplete(p: Profile | null | undefined) {
  return !!(p && p.idade && p.sexo && p.peso && p.altura && p.objetivo && p.nivel_atividade);
}

export function metas(p: Profile, pesoAtual?: number) {
  const peso = pesoAtual ?? Number(p.peso);
  const tmb = calcTMB({ sexo: p.sexo as Sexo, peso, altura: Number(p.altura), idade: Number(p.idade) });
  const tdee = calcTDEE(tmb, p.nivel_atividade as Atividade);
  const meta = calcMetaCalorica(tdee, p.objetivo as Objetivo);
  const proteina = calcMetaProteina(peso, p.objetivo as Objetivo);
  return { tmb, tdee, meta, proteina, peso };
}
