import { describe, expect, it } from "vitest";
import { entryGrams, estimateMeal, searchFoods } from "./foods";

describe("food estimates", () => {
  it("estimates 200g rice, 150g grilled chicken and 1 banana", () => {
    expect(estimateMeal([
      { foodId: "arroz", quantity: 200, unit: "g" },
      { foodId: "frango", quantity: 150, unit: "g" },
      { foodId: "banana", quantity: 1, unit: "unidade" },
    ])).toEqual({ calorias: 577, proteinas: 54.3, carboidratos: 77.6, gorduras: 4.2 });
  });
  it("converts household quantities to edible weight", () => {
    expect(entryGrams({ foodId: "ovo", quantity: 2, unit: "unidade" })).toBe(100);
  });
  it("estimates drinks by volume", () => {
    expect(estimateMeal([{ foodId: "refrigerante", quantity: 1, unit: "lata" }])).toEqual({ calorias: 147, proteinas: 0, carboidratos: 36.8, gorduras: 0 });
  });
  it("rejects zero, negative and nonfinite quantities", () => {
    for (const quantity of [0, -1, NaN, Infinity]) expect(() => estimateMeal([{ foodId: "arroz", quantity, unit: "g" }])).toThrow();
  });
  it("does not silently estimate unrecognized foods or units", () => {
    expect(() => estimateMeal([{ foodId: "unknown", quantity: 1, unit: "g" }])).toThrow();
    expect(() => estimateMeal([{ foodId: "arroz", quantity: 1, unit: "unidade" }])).toThrow();
  });
  it("finds Brazilian names without accents", () => {
    expect(searchFoods("feijao").map((f) => f.id)).toContain("feijao");
    expect(searchFoods("maca").map((f) => f.id)).toContain("maca");
  });
});