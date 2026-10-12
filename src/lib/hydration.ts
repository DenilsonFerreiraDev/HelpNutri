export const GLASS_ML = 250;
export const DEFAULT_HYDRATION_GOAL_ML = 2000;
export type WaterUnit = "glasses" | "liters";

export function waterMl(quantity: number, unit: WaterUnit) {
  const ml = Math.round(quantity * (unit === "glasses" ? GLASS_ML : 1000));
  if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isSafeInteger(ml) || ml <= 0 || ml > 2147483647) throw new Error("Informe uma quantidade válida de água.");
  return ml;
}

export function hydrationProgress(consumed: number, goal: number) {
  return { percent: goal > 0 ? Math.min(100, Math.round(consumed / goal * 100)) : 0, remaining: Math.max(0, goal - consumed) };
}

export const formatLiters = (ml: number) => (ml / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 3 });