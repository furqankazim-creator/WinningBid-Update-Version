import type { TakeoffItem } from "@/store/types";

/**
 * SOW / BOQ takeoff. Quantities are never invented:
 *  - spreadsheets are read row by row with no AI (header row detected, quantity must be a number);
 *  - for PDF / Word the AI proposes items, then CODE keeps only those whose quote exists verbatim in the source
 *    and records whether the quantity really appears in that quote. The page number is found by code, not by the AI.
 * Every item starts as "Needs Verification"; a person approves it before it reaches pricing.
 */
export type Ask = (system: string, user: string) => Promise<{ items?: unknown[] }>;
export interface TakeoffOut { items: TakeoffItem[]; warnings: string[]; pagesRead: number; pagesSkipped: number }

let seq = 0;
const nid = () => `tk_${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const norm = (s: string) => s.toLowerCase().replace(/[ ‐-―]/g, (c) => (c === " " ? " " : "-")).replace(/[“”"'`’]/g, "").replace(/\s+/g, " ").trim();

export function parseNumber(v: string): number | null {
  const t = v.replace(/[,\s]/g, "").replace(/^[A-Z]{3}|SAR|USD|\$/gi, "");
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  const n = Number(t); return Number.isFinite(n) ? n : null;
}

// ---------- spreadsheets ----------
type Col = "code" | "desc" | "qty" | "unit" | "rate";
const HEAD: Record<Col, RegExp> = {
  code: /^(item|item\s*(no|number|code|ref)\.?|no\.?|ref\.?|s\/?n|sr\.?\s*no\.?|code|sl\.?\s*no\.?)$/i,
  desc: /^(description|item\s*description|particulars|scope|material|work\s*item|details?|item\s*name)$/i,
  qty: /^(qty\.?|quantity|qnty|total\s*qty\.?|nos\.?|no\.?\s*of\s*units)$/i,
  unit: /^(unit|uom|u\.?o\.?m\.?|units)$/i,
  rate: /^(rate|unit\s*rate|unit\s*price|price|rate\s*\(.*\))$/i,
};
const LUMP = /^(ls|l\.?s\.?|lot|lump\s*sum|sum|item)$/i;

export function takeoffFromSheets(text: string): TakeoffOut | null {
  const blocks = text.split(/\n\s*\n(?=Sheet: )/).filter((b) => b.startsWith("Sheet: "));
  if (!blocks.length) return null;
  const items: TakeoffItem[] = []; const warnings: string[] = []; let rowsRead = 0; let used = 0;
  for (const b of blocks) {
    const lines = b.split("\n"); const sheet = lines[0].slice(7).trim();
    const rows = lines.slice(1).map((l) => l.split(" | ").map((c) => c.trim()));
    let h = -1; let col: Partial<Record<Col, number>> = {};
    for (let i = 0; i < Math.min(rows.length, 25); i++) {
      const c: Partial<Record<Col, number>> = {};
      rows[i].forEach((cell, ix) => { for (const k of Object.keys(HEAD) as Col[]) if (c[k] === undefined && HEAD[k].test(cell)) c[k] = ix; });
      if (c.desc !== undefined && c.qty !== undefined) { h = i; col = c; break; }
    }
    if (h < 0) { warnings.push(`Sheet "${sheet}": no header row with Description and Quantity columns — skipped.`); continue; }
    used++; let section = "Uncategorised";
    for (const r of rows.slice(h + 1)) {
      rowsRead++;
      const desc = (r[col.desc!] || "").trim(); if (!desc) continue;
      const qraw = (r[col.qty!] || "").trim();
      const others = r.filter((c, ix) => ix !== col.desc && c).length;
      if (!qraw && others <= 1) { section = desc.slice(0, 80); continue; } // section heading row
      let qty = parseNumber(qraw); let unit = (col.unit !== undefined ? r[col.unit] : "") || "";
      if (qty === null && LUMP.test(qraw || unit)) { qty = 1; unit = unit || "lump sum"; }
      if (qty === null) { if (qraw) warnings.push(`Sheet "${sheet}": "${desc.slice(0, 50)}" has a non-numeric quantity "${qraw}" — not imported.`); continue; }
      if (qty <= 0) continue;
      const rate = col.rate !== undefined ? parseNumber(r[col.rate] || "") ?? 0 : 0;
      const quote = r.join(" | ");
      items.push({ id: nid(), code: (col.code !== undefined ? r[col.code] : "") || `R${items.length + 1}`, description: desc, qty, unit: unit || "ea", category: section, rate, clause: `Sheet: ${sheet}`, quote, source: "spreadsheet", checks: { quoteFound: true, qtyInQuote: true }, status: "Needs Verification" });
    }
  }
  if (!used) return { items: [], warnings, pagesRead: blocks.length, pagesSkipped: blocks.length };
  if (!items.length) warnings.push("A header row was found but no rows with a numeric quantity.");
  return { items, warnings, pagesRead: used, pagesSkipped: blocks.length - used };
}

// ---------- PDF / Word (AI proposes, code verifies) ----------
const QTY_HINT = /(\bqty\b|quantit|\bnos?\b\.?|\bea\b|each|\bsets?\b|\blot\b|\bunits?\b|\bpcs\b|pieces|\bm[23²³]?\b|\bkm\b|\bkg\b|\btons?\b|\bltrs?\b|litres?|\bnumber of\b|\bsupply\b|\binstall)/i;
const SYSTEM = `You extract a material take-off (MTO / bill of quantities) from tender scope-of-work text.
Rules:
- Return ONLY items for which the text states an explicit number of something to supply, install, provide or construct. Never infer, add up or estimate a quantity.
- "quote" MUST be copied verbatim from the text (one sentence or one table row, at most 250 characters) and MUST contain the quantity as written.
- "qty" is that number as a plain number. "unit" is the unit as written (EA, m, set, lot...). "category" is a short trade/section name. "clause" is the clause/table reference if shown, else "".
- If the text has no such items return {"items":[]}.
Return STRICT JSON: {"items":[{"code":"","description":"","qty":0,"unit":"","category":"","clause":"","quote":""}]}`;

function splitPages(text: string): { page?: number; text: string }[] {
  const clean = text.replace(/\u0000/g, "");
  const parts = clean.split(/\[\[PAGE (\d+)\]\]/);
  if (parts.length > 1) { const out: { page?: number; text: string }[] = []; for (let i = 1; i < parts.length; i += 2) out.push({ page: Number(parts[i]), text: parts[i + 1] || "" }); return out; }
  const paras = clean.split(/\n{2,}/); const out: { page?: number; text: string }[] = []; let cur = "";
  for (const p of paras) { if (cur.length + p.length > 3500 && cur) { out.push({ text: cur }); cur = ""; } cur += (cur ? "\n\n" : "") + p; }
  if (cur.trim()) out.push({ text: cur });
  return out;
}

export function qtyAppearsIn(quote: string, qty: number): boolean {
  const toks = quote.match(/\d[\d,]*(?:\.\d+)?/g) || [];
  return toks.some((t) => parseNumber(t) === qty);
}

export async function takeoffFromText(text: string, ask: Ask, opts: { maxChunks?: number; progress?: (done: number, total: number) => void; aborted?: () => boolean } = {}): Promise<TakeoffOut> {
  const pages = splitPages(text).filter((p) => p.text.trim());
  const useful = pages.filter((p) => /\d/.test(p.text) && QTY_HINT.test(p.text));
  const warnings: string[] = []; const maxChunks = opts.maxChunks ?? 30;
  // group useful pages into chunks of ~6k characters
  const chunks: { pages: typeof pages; text: string }[] = []; let cur: typeof pages = []; let len = 0;
  for (const p of useful) { if (len + p.text.length > 6000 && cur.length) { chunks.push({ pages: cur, text: cur.map((x) => (x.page ? `[[PAGE ${x.page}]]\n` : "") + x.text).join("\n") }); cur = []; len = 0; } cur.push(p); len += p.text.length; }
  if (cur.length) chunks.push({ pages: cur, text: cur.map((x) => (x.page ? `[[PAGE ${x.page}]]\n` : "") + x.text).join("\n") });
  let skippedChunks = 0;
  if (chunks.length > maxChunks) { skippedChunks = chunks.length - maxChunks; warnings.push(`Document is large: only the first ${maxChunks} of ${chunks.length} text sections were read for quantities (${skippedChunks} not read). Split the file or re-run on the rest.`); chunks.length = maxChunks; }

  const items: TakeoffItem[] = []; const seen = new Set<string>(); let dropped = 0; let failed = 0;
  for (let i = 0; i < chunks.length; i++) {
    if (opts.aborted?.()) throw new Error("cancelled");
    opts.progress?.(i, chunks.length);
    const c = chunks[i]; const cn = norm(c.text);
    let out: { items?: unknown[] };
    try { out = await ask(SYSTEM, `TEXT:\n${c.text}`); } catch (e) { failed++; if (e instanceof Error && e.message === "no_credentials") throw e; continue; }
    for (const raw of out.items || []) {
      const r = raw as Record<string, unknown>;
      const quote = String(r.quote || "").trim(); const desc = String(r.description || "").trim(); const qty = typeof r.qty === "number" ? r.qty : parseNumber(String(r.qty ?? ""));
      if (!quote || !desc || qty === null || qty <= 0) { dropped++; continue; }
      if (!cn.includes(norm(quote))) { dropped++; continue; } // quote must exist verbatim in the source
      const page = c.pages.find((p) => norm(p.text).includes(norm(quote)))?.page;
      const unit = norm(String(r.unit || "")); const k1 = `d|${norm(desc)}|${unit}|${qty}`, k2 = `q|${norm(quote)}|${unit}|${qty}`; // same words, or the same source line again
      if (seen.has(k1) || seen.has(k2)) continue; seen.add(k1); seen.add(k2);
      items.push({ id: nid(), code: String(r.code || "").trim() || `A${items.length + 1}`, description: desc, qty, unit: String(r.unit || "ea").trim() || "ea", category: String(r.category || "Uncategorised").trim() || "Uncategorised", rate: 0, page, clause: String(r.clause || "").trim() || undefined, quote, source: "ai", checks: { quoteFound: true, qtyInQuote: qtyAppearsIn(quote, qty) }, status: "Needs Verification" });
    }
  }
  opts.progress?.(chunks.length, chunks.length);
  if (dropped) warnings.push(`${dropped} item(s) proposed by the AI were discarded because their quote was not found in the document or had no valid quantity.`);
  if (failed) warnings.push(`${failed} section(s) could not be read (AI error or rate limit) — run again to retry.`);
  const flagged = items.filter((i) => !i.checks.qtyInQuote).length;
  if (flagged) warnings.push(`${flagged} item(s) have a quantity that is not written as a number in the quote (e.g. in words) — check them against the page.`);
  if (!items.length && !failed) warnings.push("No lines with an explicit quantity were found. If this is a scanned or drawing-only document, upload a BOQ/MTO spreadsheet or a text PDF.");
  return { items, warnings, pagesRead: pages.length - 0, pagesSkipped: pages.length - useful.length };
}

export async function extractTakeoff(text: string, ask: Ask, opts?: Parameters<typeof takeoffFromText>[2]): Promise<TakeoffOut> {
  const sheets = takeoffFromSheets(text);
  if (sheets && (sheets.items.length || !/\[\[PAGE \d+\]\]/.test(text))) return sheets;
  return takeoffFromText(text, ask, opts);
}
