import { describe, it, expect } from "vitest";
import { calcTMB, calcTDEE, calcMetaCalorica, calcMetaProteina, calcScore, calcMusculacao } from "./nutrition";

describe("nutrition", () => {
  it("TMB Mifflin-St Jeor masculino", () => {
    expect(calcTMB({ sexo: "masculino", peso: 80, altura: 180, idade: 30 })).toBe(1780);
  });
  it("TMB feminino", () => {
    expect(calcTMB({ sexo: "feminino", peso: 60, altura: 165, idade: 25 })).toBe(1345);
  });
  it("TDEE moderado", () => {
    expect(calcTDEE(1780, "moderado")).toBe(2759);
  });
  it("déficit de 500 para perder gordura", () => {
    expect(calcMetaCalorica(2759, "perder")).toBe(2259);
  });
  it("superávit de 300 para ganhar massa", () => {
    expect(calcMetaCalorica(2759, "ganhar")).toBe(3059);
  });
  it("proteína 2g/kg para perder gordura", () => {
    expect(calcMetaProteina(80, "perder")).toBe(160);
  });
  it("score soma 25 por critério", () => {
    expect(calcScore({ metaCaloricaOk: true, metaProteinaOk: false, exercicio: true, registroAlimentar: true })).toBe(75);
  });
  it("musculação alta 60min 80kg", () => {
    expect(calcMusculacao({ intensidade: "alta", duracao: 60, peso: 80 })).toBe(480);
  });
});
