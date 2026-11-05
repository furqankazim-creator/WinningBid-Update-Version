import type { ProcPackage, Quotation } from "@/store/types";
/** Weighted score 0–100: price and lead relative to the best quote; quality /5; compliance %. */
export function scoreQuotes(pk: ProcPackage, quotes: Quotation[]) {
  if (!quotes.length) return [];
  const lo = Math.min(...quotes.map((q) => q.price)), ll = Math.min(...quotes.map((q) => q.leadWeeks));
  const w = pk.weights; const tot = w.price + w.lead + w.quality + w.compliance || 1;
  return quotes.map((q) => ({ ...q, score: Math.round((((lo / q.price) * w.price) + ((ll / q.leadWeeks) * w.lead) + ((q.quality / 5) * w.quality) + ((q.compliance / 100) * w.compliance)) / tot * 100) })).sort((a, b) => b.score - a.score);
}
