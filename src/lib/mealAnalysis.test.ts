import { describe, expect, it } from "vitest";
import { analyzeMeal } from "./mealAnalysis";

describe("meal analysis", () => {
  it("praises a protein-rich meal for a fat-loss goal", () => {
    expect(analyzeMeal({ calorias: 577, proteinas: 54.3, carboidratos: 77.6, gorduras: 4.2 }, 160, "perder"))
      .toBe("Boa quantidade de proteínas para um objetivo de perder gordura.");
  });
  it("warns when protein is below the per-meal share of the daily target", () => {
    expect(analyzeMeal({ calorias: 200, proteinas: 5, carboidratos: 40, gorduras: 2 }, 160, "perder"))
      .toBe("Proteína abaixo da meta recomendada (cerca de 40g por refeição).");
  });
});
