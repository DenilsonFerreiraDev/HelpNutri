export type Nutrients = { calorias: number; proteinas: number; carboidratos: number; gorduras: number };
export type Portion = { label: string; grams: number };
export type Food = { id: string; nome: string; aliases: string; nutrients: Nutrients; portions: Portion[]; liquid?: boolean };

// Prepared/edible weights. Approximate reference values per 100 g (100 ml for
// drinks, density approximated as 1 g/ml). Recipes, brands and portions vary.
// Primary reference: TACO/NEPA UNICAMP, 4th edition:
// https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf
const food = (id: string, nome: string, aliases: string, values: [number, number, number, number], portions: Portion[], liquid = false): Food => ({
  id, nome, aliases, nutrients: { calorias: values[0], proteinas: values[1], carboidratos: values[2], gorduras: values[3] }, portions, liquid,
});
export const FOODS: Food[] = [
  food("arroz", "Arroz branco cozido", "arroz rice", [128, 2.5, 28.1, 0.2], [{ label: "colher de sopa", grams: 25 }]),
  food("arroz-integral", "Arroz integral cozido", "arroz", [124, 2.6, 25.8, 1], [{ label: "colher de sopa", grams: 25 }]),
  food("feijao", "Feijão carioca cozido", "feijao beans", [76, 4.8, 13.6, 0.5], [{ label: "concha", grams: 100 }]),
  food("feijao-preto", "Feijão preto cozido", "feijao", [77, 4.5, 14, 0.5], [{ label: "concha", grams: 100 }]),
  food("frango", "Peito de frango grelhado", "frango chicken", [159, 32, 0, 2.5], [{ label: "filé", grams: 100 }]),
  food("carne", "Carne bovina — patinho grelhado", "carne bife beef", [219, 35.9, 0, 7.3], [{ label: "bife", grams: 100 }]),
  food("ovo", "Ovo cozido", "ovos eggs", [146, 13.3, 0.6, 9.5], [{ label: "unidade", grams: 50 }]),
  food("pao", "Pão francês", "pao bread", [300, 8, 58.6, 3.1], [{ label: "unidade", grams: 50 }]),
  food("pao-forma", "Pão de forma", "pao", [253, 9.4, 49.9, 3.7], [{ label: "fatia", grams: 25 }]),
  food("leite", "Leite integral", "leite milk", [60, 3.2, 4.7, 3.3], [{ label: "copo", grams: 200 }], true),
  food("aveia", "Aveia em flocos", "aveia oats", [394, 13.9, 66.6, 8.5], [{ label: "colher de sopa", grams: 15 }]),
  food("banana", "Banana nanica", "banana", [92, 1.4, 23.8, 0.1], [{ label: "unidade", grams: 90 }]),
  food("maca", "Maçã Fuji", "maca apple", [56, 0.3, 15.2, 0], [{ label: "unidade", grams: 130 }]),
  // Cooked plain pasta is an approximate standard preparation, without sauce.
  food("macarrao", "Macarrão cozido sem molho", "massa pasta macarrao", [131, 4.6, 27.2, 0.8], [{ label: "xícara", grams: 140 }]),
  food("batata-doce", "Batata-doce cozida", "batata sweet potato", [77, 0.6, 18.4, 0.1], [{ label: "fatia média", grams: 50 }]),
  food("queijo", "Queijo muçarela", "queijo mussarela cheese", [330, 22.6, 3, 25.2], [{ label: "fatia", grams: 30 }]),
  food("queijo-minas", "Queijo minas frescal", "queijo", [264, 17.4, 3.2, 20.2], [{ label: "fatia", grams: 30 }]),
  food("picanha", "Picanha grelhada com gordura", "churrasco carne barbecue", [289, 26.4, 0, 20.2], [{ label: "fatia", grams: 100 }]),
  food("linguica", "Linguiça suína grelhada", "churrasco linguica", [296, 23.2, 0, 21.9], [{ label: "unidade", grams: 60 }]),
  food("refrigerante", "Refrigerante de cola", "refri soda refrigerante", [42, 0, 10.5, 0], [{ label: "lata", grams: 350 }, { label: "copo", grams: 200 }], true),
  food("refrigerante-zero", "Refrigerante zero", "refri soda refrigerante", [0, 0, 0, 0], [{ label: "lata", grams: 350 }, { label: "copo", grams: 200 }], true),
  food("pao-queijo", "Pão de queijo assado", "salgado lanche snack", [363, 5.1, 34.2, 22.7], [{ label: "unidade pequena", grams: 20 }]),
  food("coxinha", "Coxinha de frango frita", "salgado lanche snack", [283, 9.6, 34.5, 11.8], [{ label: "unidade média", grams: 80 }]),
  food("pastel", "Pastel de carne frito", "salgado lanche snack", [388, 10.1, 43.8, 20.1], [{ label: "unidade média", grams: 100 }]),
  food("biscoito", "Biscoito cream cracker", "bolacha lanche snack", [432, 10.1, 68.7, 14.4], [{ label: "unidade", grams: 6 }]),
  food("batata-frita", "Batata frita", "lanche snack", [267, 5, 35.6, 13.1], [{ label: "porção pequena", grams: 100 }]),
];

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
export function searchFoods(query: string) {
  const terms = normalize(query).split(/\s+/);
  return FOODS.filter((item) => terms.every((term) => normalize(`${item.nome} ${item.aliases}`).includes(term)));
}
export type FoodEntry = { foodId: string; quantity: number; unit: string };
export function entryGrams(entry: FoodEntry) {
  const item = FOODS.find((f) => f.id === entry.foodId);
  if (!item || !Number.isFinite(entry.quantity) || entry.quantity <= 0) throw new Error("Informe uma quantidade maior que zero.");
  const portion = item.portions.find((p) => p.label === entry.unit);
  if (entry.unit !== (item.liquid ? "ml" : "g") && !portion) throw new Error("Porção inválida.");
  return entry.quantity * (portion?.grams ?? 1);
}
export function estimateMeal(entries: FoodEntry[]): Nutrients {
  const totals: Nutrients = { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 };
  for (const entry of entries) {
    const item = FOODS.find((f) => f.id === entry.foodId);
    if (!item) throw new Error("Alimento não encontrado.");
    const ratio = entryGrams(entry) / 100;
    for (const key of Object.keys(totals) as (keyof Nutrients)[]) totals[key] += item.nutrients[key] * ratio;
  }
  return { calorias: Math.round(totals.calorias), proteinas: Math.round(totals.proteinas * 10) / 10, carboidratos: Math.round(totals.carboidratos * 10) / 10, gorduras: Math.round(totals.gorduras * 10) / 10 };
}