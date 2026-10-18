import { useState } from "react";
import { Plus, RotateCcw, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { today, useInsert, useProfile, metas, profileComplete } from "@/lib/data";
import { FOODS, estimateMeal, searchFoods, type FoodEntry, type Nutrients } from "@/lib/foods";
import { analyzeMeal } from "@/lib/mealAnalysis";
import type { Objetivo } from "@/lib/nutrition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATS = ["Café da manhã", "Almoço", "Jantar", "Lanche"];
const NUTRIENTS: [keyof Nutrients, string, string][] = [["calorias", "Calorias", "kcal"], ["proteinas", "Proteínas", "g"], ["carboidratos", "Carboidratos", "g"], ["gorduras", "Gorduras", "g"]];
type Row = FoodEntry & { key: number };

export function MealForm() {
  const ins = useInsert("meals");
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("Almoço");
  const [data, setData] = useState(today);
  const [horario, setHorario] = useState("");
  const [query, setQuery] = useState("");
  const [foodId, setFoodId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("g");
  const [rows, setRows] = useState<Row[]>([]);
  const [nextKey, setNextKey] = useState(0);
  const [manual, setManual] = useState(false);
  const [adjusted, setAdjusted] = useState<Record<keyof Nutrients, string> | null>(null);
  const item = FOODS.find((f) => f.id === foodId);
  const estimates = estimateMeal(rows);
  const results = searchFoods(query);
  const displayed = adjusted ?? Object.fromEntries(NUTRIENTS.map(([key]) => [key, String(estimates[key])])) as Record<keyof Nutrients, string>;

  function resetAdjustment() { setManual(false); setAdjusted(null); }
  function pick(id: string) {
    const selected = FOODS.find((f) => f.id === id);
    if (!selected) return;
    setFoodId(id); setQuantity(""); setUnit(selected.liquid ? "ml" : "g");
  }
  function add() {
    if (!item) { toast.error("Escolha um alimento."); return; }
    const entry = { foodId, quantity: Number(quantity), unit, key: nextKey };
    try { estimateMeal([entry]); } catch (err) { toast.error((err as Error).message); return; }
    setRows([...rows, entry]); setNextKey(nextKey + 1); resetAdjustment();
    setFoodId(""); setQuery(""); setQuantity("");
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!rows.length && !manual) { toast.error("Adicione pelo menos um alimento."); return; }
    if (foodId) { toast.error("Adicione o alimento selecionado antes de salvar."); return; }
    const totals = Object.fromEntries(NUTRIENTS.map(([key]) => [key, Number(displayed[key])])) as Nutrients;
    if (NUTRIENTS.some(([key]) => !displayed[key].trim() || !Number.isFinite(totals[key]) || totals[key] < 0)) {
      toast.error("Revise os valores nutricionais."); return;
    }
    try {
      await ins.mutateAsync({ nome: nome.trim(), categoria, data, horario: horario || null, ...totals });
      toast.success("Refeição registrada");
      setNome(""); setRows([]); setQuery(""); setFoodId(""); setQuantity(""); resetAdjustment();
    } catch (err) { toast.error((err as Error).message); }
  }

  return <form onSubmit={save} className="space-y-5">
    <div className="space-y-1.5"><Label htmlFor="meal-name">Nome da refeição</Label><Input id="meal-name" required maxLength={160} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Almoço de hoje" /></div>
    <div className="space-y-1.5"><Label htmlFor="meal-category">Categoria</Label><Select value={categoria} onValueChange={setCategoria}><SelectTrigger id="meal-category"><SelectValue /></SelectTrigger><SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>

    <fieldset className="min-w-0 space-y-3 border-t pt-4">
      <legend className="pr-2 text-sm font-semibold">Alimentos consumidos</legend>
      <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Buscar alimento" className="pl-9" placeholder="Buscar arroz, frango, banana…" value={query} onChange={(e) => { setQuery(e.target.value); setFoodId(""); }} /></div>
      <Select value={foodId} onValueChange={pick}>
        <SelectTrigger aria-label="Alimento" className="w-full min-w-0 [&>span]:truncate"><SelectValue placeholder="Selecione um alimento" /></SelectTrigger>
        <SelectContent>{results.map((f) => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent>
      </Select>
      {results.length === 0 && <p className="text-xs text-muted-foreground">Alimento não encontrado. Você pode ajustar os valores manualmente abaixo.</p>}
      {item && <>
        <div className="grid grid-cols-[minmax(0,1fr)_44px] items-end gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_44px]">
          <div className="col-span-2 space-y-1.5 sm:col-span-1"><Label htmlFor="food-quantity">Quantidade</Label><Input id="food-quantity" type="number" min="0.1" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="200" /></div>
          <div className="min-w-0 space-y-1.5"><Label htmlFor="food-unit">Medida</Label><Select value={unit} onValueChange={setUnit}><SelectTrigger id="food-unit" className="w-full min-w-0 [&>span]:truncate"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={item.liquid ? "ml" : "g"}>{item.liquid ? "ml" : "g"}</SelectItem>{item.portions.map((p) => <SelectItem key={p.label} value={p.label}>{p.label}</SelectItem>)}</SelectContent></Select></div>
          <Button type="button" size="icon" onClick={add} aria-label="Adicionar alimento" title="Adicionar alimento"><Plus /></Button>
        </div>
        <p className="text-xs text-muted-foreground">{unit === "g" || unit === "ml" ? "Quantidade do alimento pronto para consumo." : `1 ${unit} ≈ ${item.portions.find((p) => p.label === unit)?.grams} ${item.liquid ? "ml" : "g"}`}</p>
      </>}
      <ul className="divide-y">
        {rows.map((row) => { const food = FOODS.find((f) => f.id === row.foodId); return <li key={row.key} className="flex items-center gap-2 py-2.5">
          <div className="min-w-0 flex-1"><p className="text-sm font-medium break-words">{food?.nome}</p><p className="text-xs text-muted-foreground">{row.quantity} {row.unit} · {estimateMeal([row]).calorias} kcal</p></div>
          <Button variant="ghost" size="icon" type="button" aria-label={`Remover ${food?.nome}`} title="Remover alimento" onClick={() => { setRows(rows.filter((r) => r.key !== row.key)); resetAdjustment(); }}><Trash2 className="text-muted-foreground" /></Button>
        </li>; })}
      </ul>
    </fieldset>

    <section className="space-y-3 border-t pt-4" aria-label="Revisão nutricional">
      <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">{manual ? "Valores ajustados" : "Estimativa nutricional"}</h3>{manual && rows.length > 0 && <Button type="button" size="icon" variant="ghost" title="Restaurar estimativa" aria-label="Restaurar estimativa" onClick={resetAdjustment}><RotateCcw /></Button>}</div>
      <div className="grid grid-cols-2 gap-3" aria-live="polite">
        {NUTRIENTS.map(([key, label, suffix]) => <div key={key} className="space-y-1">
          <Label htmlFor={`nutrition-${key}`} className="text-xs text-muted-foreground">{label} ({suffix})</Label>
          {manual ? <Input id={`nutrition-${key}`} type="number" required min={0} step="0.1" value={displayed[key]} onChange={(e) => setAdjusted({ ...displayed, [key]: e.target.value })} /> : <p id={`nutrition-${key}`} className="text-xl font-semibold tabular-nums">{estimates[key]} <span className="text-xs font-normal text-muted-foreground">{suffix}</span></p>}
        </div>)}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">Valores aproximados por porção, com referência na TACO/UNICAMP. Preparo, marcas e medidas podem variar.</p>
      <div className="flex items-center gap-2"><Switch id="manual-nutrition" checked={manual} onCheckedChange={(checked) => { setManual(checked); setAdjusted(checked ? { ...displayed } : null); }} /><Label htmlFor="manual-nutrition" className="text-sm">Ajustar valores manualmente</Label></div>
    </section>
    <div className="grid gap-3 border-t pt-4 sm:grid-cols-2">
      <div className="space-y-1.5"><Label htmlFor="meal-date">Data</Label><Input id="meal-date" type="date" required value={data} onChange={(e) => setData(e.target.value)} /></div>
      <div className="space-y-1.5"><Label htmlFor="meal-time">Horário</Label><Input id="meal-time" type="time" value={horario} onChange={(e) => setHorario(e.target.value)} /></div>
    </div>
    <Button type="submit" className="w-full" disabled={ins.isPending || (!rows.length && !manual)}>{ins.isPending ? "Salvando…" : "Salvar refeição"}</Button>
  </form>;
}