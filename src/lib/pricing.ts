import type { CostLine } from "@/store/types";
export const lineTotal = (l: CostLine) => l.qty * l.rate;
export const lineCont = (l: CostLine) => lineTotal(l) * (l.contingency / 100);
export function totals(lines: CostLine[], margin: number) {
  const base = lines.reduce((a, l) => a + lineTotal(l), 0);
  const cont = lines.reduce((a, l) => a + lineCont(l), 0);
  const cost = base + cont;
  const price = cost / (1 - margin / 100);
  const byCat = Object.entries(lines.reduce<Record<string, number>>((a, l) => { a[l.category] = (a[l.category] || 0) + lineTotal(l); return a; }, {})).sort((a, b) => b[1] - a[1]);
  return { base, cont, cost, price, marginValue: price - cost, byCat };
}
