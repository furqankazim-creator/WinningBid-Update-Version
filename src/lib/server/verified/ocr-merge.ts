/**
 * Merges the PDF text layer with OCR so nothing the text layer silently dropped is lost — without ever replacing an
 * accurate text-layer line by a noisier OCR line unless the OCR line is strictly more complete.
 * Every line that comes from OCR is prefixed with OCR_MARK so downstream steps (and the reviewer) can tell it apart.
 */
export const OCR_MARK = "";

const alnum = (s: string) => s.toLowerCase().replace(/[‐-―−]/g, "-").replace(/[^a-z0-9]+/g, "");
const mask = (l: string) => l.replace(/\d+/g, "#");
const grams = (s: string) => { const a = alnum(s); const g = new Set<string>(); for (let i = 0; i + 5 <= a.length; i++) g.add(a.slice(i, i + 5)); return { a, g }; };
/** share of x's 5-grams that also occur in y */
const cov = (x: { g: Set<string> }, y: { g: Set<string> }) => { if (!x.g.size) return 0; let n = 0; for (const t of x.g) if (y.g.has(t)) n++; return n / x.g.size; };
const words = (s: string) => s.toLowerCase().match(/[a-z]{3,}/g) || [];

export interface PageMerge { lines: string[]; recovered: number; usable: boolean; confidence: number; }

/** Lines that recur (digits masked) on at least half of the readable pages: title blocks, headers, footers. */
export function boilerplateSet(pagesLines: string[][]): Set<string> {
  const readable = pagesLines.filter((l) => l.join(" ").length >= 100);
  const drop = new Set<string>();
  if (readable.length < 6) return drop;
  const count = new Map<string, number>();
  for (const lines of readable) for (const l of new Set(lines.map(mask))) count.set(l, (count.get(l) || 0) + 1);
  for (const [l, c] of count) if (c >= readable.length * 0.5) drop.add(l);
  return drop;
}

export function vocabulary(pagesLines: string[][]): Set<string> {
  const v = new Set<string>(); for (const lines of pagesLines) for (const l of lines) for (const w of words(l)) v.add(w); return v;
}

/** strip sidebar/border noise that OCR glues to the start or end of a real line */
function cleanOcrLine(raw: string, vocab: Set<string>, scanned: boolean): string {
  const t = raw.replace(/[|¦]+/g, " ").replace(/\s+/g, " ").trim();
  const toks = t.split(" ");
  // on text pages OCR glues sidebar noise to the line start; scanned pages have no sidebar, so only single characters are dropped there
  while (toks.length > 3 && (toks[0].length <= 1 || (!scanned && !/^[\u201c"'(\d]/.test(toks[0]) && toks[0].length <= 5 && vocab.size && !vocab.has(toks[0].toLowerCase().replace(/[^a-z]/g, ""))))) toks.shift();
  while (toks.length > 3 && (toks[toks.length - 1].length <= 1 || /^[|=~_.\-]+$/.test(toks[toks.length - 1]))) toks.pop();
  return toks.join(" ");
}

function looksLikeText(line: string, vocab: Set<string>, requireVocab: boolean): boolean {
  if (!requireVocab && /^(LUP\s*NO|Old\s*LUP|Log Date|Status|Proponent|Title|Brief Description)\b/i.test(line)) return true; // permit-letter header fields
  const toks = line.split(" ").filter(Boolean);
  if (toks.length < 3) return false;
  const letters = line.replace(/[^A-Za-z]/g, "").length;
  if (letters / Math.max(1, line.replace(/\s/g, "").length) < 0.6) return false;
  const w = words(line); if (w.length < 2) return false;
  if (requireVocab) { const known = w.filter((x) => vocab.has(x)).length; if (known / w.length < 0.6) return false; }
  return true;
}

/**
 * @param layer        text-layer lines of the page (boilerplate already removed)
 * @param ocrText      raw OCR output of the page
 * @param boilerplate  title-block / header lines (so OCR copies of them are discarded)
 */
export function mergePage(layer: string[], ocrText: string, confidence: number, vocab: Set<string>, boilerplate: string[]): PageMerge {
  const layerInfo = layer.map((l) => ({ l, ...grams(l) }));
  const bp = boilerplate.map((b) => grams(b));
  const scanned = layer.join(" ").length < 100;
  // a scanned page is only trusted when OCR itself is confident; on text pages OCR only fills gaps
  if (scanned && confidence < 60) return { lines: [], recovered: 0, usable: false, confidence };
  const ocrLines = ocrText.split("\n").map((l) => cleanOcrLine(l, vocab, scanned)).filter((l) => l && looksLikeText(l, vocab, !scanned));
  if (scanned) return { lines: ocrLines.map((l) => OCR_MARK + l), recovered: ocrLines.length, usable: ocrLines.length > 0, confidence };

  const out: string[] = []; let j = 0; let recovered = 0;
  for (const o of ocrLines) {
    const og = grams(o);
    if (og.a.length < 12) continue;
    if (bp.some((b) => cov(b, og) >= 0.6 || cov(og, b) >= 0.8)) continue; // OCR copy of a title block / header
    let best = -1, bestCov = 0;
    for (let k = j; k < Math.min(layerInfo.length, j + 14); k++) {
      if (layerInfo[k].a.length < 12) continue;
      const c = cov(layerInfo[k], og);
      if (c > bestCov) { bestCov = c; best = k; }
    }
    if (best >= 0 && bestCov >= 0.75) {
      for (let k = j; k < best; k++) out.push(layerInfo[k].l);        // layer lines OCR skipped keep their place
      if (og.a.length - layerInfo[best].a.length >= 8) { out.push(OCR_MARK + o); recovered++; } // OCR is the more complete line
      else out.push(layerInfo[best].l);
      j = best + 1; continue;
    }
    // OCR line contained in a longer layer line → already present
    let inside = false;
    for (let k = j; k < Math.min(layerInfo.length, j + 14) && !inside; k++) if (cov(og, layerInfo[k]) >= 0.6) { for (let m = j; m <= k; m++) out.push(layerInfo[m].l); j = k + 1; inside = true; }
    if (inside) continue;
    out.push(OCR_MARK + o); recovered++;                                 // genuinely missing from the text layer
  }
  for (let k = j; k < layerInfo.length; k++) out.push(layerInfo[k].l);
  return { lines: out, recovered, usable: true, confidence };
}
