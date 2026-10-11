export type Sexo = "masculino" | "feminino";
export type Atividade = "sedentario" | "leve" | "moderado" | "muito";
export type Objetivo = "perder" | "manter" | "ganhar";

export const ATIVIDADES: Record<Atividade, { label: string; fator: number }> = {
  sedentario: { label: "Sedentário", fator: 1.2 },
  leve: { label: "Levemente ativo", fator: 1.375 },
  moderado: { label: "Moderadamente ativo", fator: 1.55 },
  muito: { label: "Muito ativo", fator: 1.725 },
};

export const OBJETIVOS: Record<Objetivo, { label: string; ajuste: number; proteinaGKg: number }> = {
  perder: { label: "Perder gordura", ajuste: -500, proteinaGKg: 2.0 },
  manter: { label: "Manter peso", ajuste: 0, proteinaGKg: 1.6 },
  ganhar: { label: "Ganhar massa muscular", ajuste: 300, proteinaGKg: 2.0 },
};

/** Mifflin-St Jeor */
export function calcTMB(p: { sexo: Sexo; peso: number; altura: number; idade: number }) {
  const base = 10 * p.peso + 6.25 * p.altura - 5 * p.idade;
  return Math.round(p.sexo === "masculino" ? base + 5 : base - 161);
}

export function calcTDEE(tmb: number, atividade: Atividade) {
  return Math.round(tmb * ATIVIDADES[atividade].fator);
}

export function calcMetaCalorica(tdee: number, objetivo: Objetivo) {
  return Math.round(tdee + OBJETIVOS[objetivo].ajuste);
}

export function calcMetaProteina(peso: number, objetivo: Objetivo) {
  return Math.round(peso * OBJETIVOS[objetivo].proteinaGKg);
}

export const CARDIO_TIPOS = {
  caminhada: { label: "Caminhada", met: 3.5 },
  corrida: { label: "Corrida", met: 9.8 },
  esteira: { label: "Esteira", met: 5 },
  bicicleta: { label: "Bicicleta", met: 7 },
  eliptico: { label: "Elíptico", met: 5 },
} as const;
export type CardioTipo = keyof typeof CARDIO_TIPOS;

export const INTENSIDADES = {
  leve: { label: "Leve", met: 3.5 },
  moderada: { label: "Moderada", met: 5 },
  alta: { label: "Alta", met: 6 },
} as const;
export type Intensidade = keyof typeof INTENSIDADES;

export const GRUPOS_MUSCULARES = [
  "Peito", "Costas", "Pernas", "Ombros", "Bíceps", "Tríceps", "Abdômen", "Corpo inteiro",
];

const kcal = (met: number, peso: number, min: number) => Math.round((met * peso * min) / 60);

export function calcCardio(p: { tipo: CardioTipo; duracao: number; peso: number; velocidade?: number | null; inclinacao?: number | null }) {
  let met: number = CARDIO_TIPOS[p.tipo].met;
  const v = p.velocidade ?? 0;
  if (v > 0 && ["caminhada", "corrida", "esteira"].includes(p.tipo)) {
    met = v < 7 ? 1 + v * 0.65 : v * 1.0; // aproximação MET por km/h
  }
  if (p.inclinacao && p.inclinacao > 0) met += p.inclinacao * 0.35;
  return kcal(met, p.peso, p.duracao);
}

export function calcMusculacao(p: { intensidade: Intensidade; duracao: number; peso: number }) {
  return kcal(INTENSIDADES[p.intensidade].met, p.peso, p.duracao);
}

/** Score diário: 25 pontos por critério */
export function calcScore(p: { metaCaloricaOk: boolean; metaProteinaOk: boolean; exercicio: boolean; registroAlimentar: boolean }) {
  return (p.metaCaloricaOk ? 25 : 0) + (p.metaProteinaOk ? 25 : 0) + (p.exercicio ? 25 : 0) + (p.registroAlimentar ? 25 : 0);
}

/** Meta calórica atingida: há registro e consumo não excede a meta (perder/manter) ou alcança a meta (ganhar) */
export function metaCaloricaAtingida(consumido: number, meta: number, objetivo: Objetivo) {
  if (consumido <= 0) return false;
  if (objetivo === "ganhar") return consumido >= meta;
  if (objetivo === "manter") return Math.abs(consumido - meta) <= meta * 0.1;
  return consumido <= meta;
}
