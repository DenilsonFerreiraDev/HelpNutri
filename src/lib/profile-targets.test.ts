import { expect, it } from "vitest";
import { metas, type Profile } from "./data";

const profile: Profile = { id: "test", nome: "Teste", email: null, created_at: "", idade: 30, peso: 80, altura: 180, sexo: "masculino", nivel_atividade: "moderado", objetivo: "perder", hydration_goal_ml: 2000 };
it("recalculates calorie and protein targets after profile edits", () => {
  expect(metas(profile)).toMatchObject({ meta: 2251, proteina: 160 });
  expect(metas({ ...profile, idade: 35, peso: 75, altura: 175, nivel_atividade: "leve", objetivo: "manter" })).toMatchObject({ meta: 2280, proteina: 120 });
});