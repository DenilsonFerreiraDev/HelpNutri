import type { Nutrients } from "./foods";
import { OBJETIVOS, type Objetivo } from "./nutrition";

/** Refeições principais por dia usadas para dividir a meta diária de proteína. */
export const REFEICOES_POR_DIA = 4;

export function analyzeMeal(estimates: Nutrients, metaProteinaDiaria: number, objetivo: Objetivo): string {
  const metaRefeicao = metaProteinaDiaria / REFEICOES_POR_DIA;
  if (estimates.proteinas >= metaRefeicao) {
    return `Boa quantidade de proteínas para um objetivo de ${OBJETIVOS[objetivo].label.toLowerCase()}.`;
  }
  return `Proteína abaixo da meta recomendada (cerca de ${Math.round(metaRefeicao)}g por refeição).`;
}
