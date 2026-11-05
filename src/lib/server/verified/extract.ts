import { OCR_MARK, boilerplateSet, mergePage, vocabulary } from "./ocr-merge";

import { serviceHeaders } from "../guard";
export const STANDARDS_API = process.env.STANDARDS_API_URL || "http://localhost:4005";

export interface OcrStats { available: boolean; used: boolean; pagesOcred: number; recoveredLines: number; unusablePages: number[]; avgConfidence: number; note?: string; }
export interface ExtractResult { name: string; text: string; pages: number; ocr: OcrStats; boilerplateLines: number; }
export type ExtractEvent = { stage: "text" | "ocr" | "merge"; done: number; total: number; msg: string };

const TEXT_EXT = /\.(txt|md|csv|tsv|json|xml|html?|rtf|log)$/;
const noOcr = (note: string, available = false): OcrStats => ({ available, used: false, pagesOcred: 0, recoveredLines: 0, unusablePages: [], avgConfidence: 0, note });

type OcrPages = Map<number, { text: string; confidence: number }>;
/** Optional on-disk cache (set OCR_CACHE_DIR) so re-analysing the same file never repeats minutes of OCR. */
async function cached(buf: Buffer, pages: string): Promise<{ file: string; hit: OcrPages | null } | null> {
  const dir = process.env.OCR_CACHE_DIR; if (!dir) return null;
  const { createHash } = await import("crypto"); const fs = await import("fs"); const path = await import("path");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${createHash("sha1").update(buf).update(pages).digest("hex")}.json`);
  if (fs.existsSync(file)) return { file, hit: new Map(JSON.parse(fs.readFileSync(file, "utf8")) as [number, { text: string; confidence: number }][]) };
  return { file, hit: null };
}

async function ocrPdf(buf: Buffer, name: string, pages: string, hiPages: string, onPage: (done: number, total: number) => void): Promise<{ pages: OcrPages; error?: string }> {
  const c = await cached(buf, pages);
  if (c?.hit) { onPage(c.hit.size, c.hit.size); return { pages: c.hit }; }
  const r = await ocrPdfLive(buf, name, pages, hiPages, onPage);
  if (c && r.pages.size && !r.error) (await import("fs")).writeFileSync(c.file, JSON.stringify([...r.pages]));
  return r;
}

async function ocrPdfLive(buf: Buffer, name: string, pages: string, hiPages: string, onPage: (done: number, total: number) => void): Promise<{ pages: OcrPages; error?: string }> {
  const out: OcrPages = new Map();
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buf)], { type: "application/pdf" }), name);
  form.append("pages", pages);
  if (hiPages) form.append("hiPages", hiPages);
  let res: Response;
  try { res = await fetch(`${STANDARDS_API}/api/ocr/pdf`, { method: "POST", body: form, headers: serviceHeaders() }); }
  catch (e) { return { pages: out, error: `OCR service not reachable at ${STANDARDS_API} (${e instanceof Error ? e.message : "fetch failed"})` }; }
  if (!res.ok || !res.body) { const j = await res.json().catch(() => ({})); return { pages: out, error: j.error || `OCR service HTTP ${res.status}` }; }
  const reader = res.body.getReader(); const dec = new TextDecoder(); let buffer = ""; let total = 0; let error: string | undefined;
  for (;;) {
    const { value, done } = await reader.read(); if (done) break;
    buffer += dec.decode(value, { stream: true });
    let i: number;
    while ((i = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, i); buffer = buffer.slice(i + 1); if (!line.trim()) continue;
      const o = JSON.parse(line);
      if (o.type === "start") total = o.total;
      else if (o.type === "page") { out.set(o.page, { text: o.text || "", confidence: o.confidence || 0 }); onPage(out.size, total); }
      else if (o.type === "error") error = o.error;
    }
  }
  return { pages: out, error };
}

export async function extractFile(file: File, emit: (e: ExtractEvent) => void = () => {}): Promise<ExtractResult> {
  const buf = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const r = await mammoth.extractRawText({ buffer: buf });
    return { name: file.name, text: r.value, pages: Math.max(1, Math.round(r.value.length / 3000)), ocr: noOcr("not a PDF"), boilerplateLines: 0 };
  }
  if (name.endsWith(".xlsx") || name.endsWith(".xlsm")) {
    // Spreadsheets (BOQ / MTO / price schedules): one block per sheet, one line per row, cells joined with " | ".
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf as unknown as ArrayBuffer);
    const blocks: string[] = [];
    wb.eachSheet((ws) => {
      const rows: string[] = [];
      ws.eachRow({ includeEmpty: false }, (row) => {
        const cells: string[] = [];
        row.eachCell({ includeEmpty: true }, (c) => { let t = ""; try { t = c.text; } catch { t = String(c.value ?? ""); } cells.push(t.replace(/\s+/g, " ").trim()); });
        while (cells.length && !cells[cells.length - 1]) cells.pop();
        if (cells.some(Boolean)) rows.push(cells.join(" | "));
      });
      if (rows.length) blocks.push(`Sheet: ${ws.name}\n${rows.join("\n")}`);
    });
    const text = blocks.join("\n\n");
    if (!text.trim()) throw new Error("The spreadsheet has no readable cells.");
    return { name: file.name, text, pages: Math.max(1, blocks.length), ocr: noOcr("spreadsheet"), boilerplateLines: 0 };
  }
  if (!name.endsWith(".pdf")) {
    if (TEXT_EXT.test(name)) return { name: file.name, text: buf.toString("utf8"), pages: 1, ocr: noOcr("plain text"), boilerplateLines: 0 };
    throw new Error(`Unsupported file type "${name.split(".").pop()}" — upload PDF, DOCX, XLSX or plain-text files (convert .doc/.xls/images first)`);
  }

  // 1) text layer (unpdf = maintained pdf.js; pdf-parse's 2018 pdf.js fails with "bad XRef entry" under Next)
  emit({ stage: "text", done: 0, total: 1, msg: "Reading the PDF text layer…" });
  const { getDocumentProxy, extractText } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  const { totalPages, text } = await extractText(pdf, { mergePages: false });
  const layer = text.map((t) => t.split("\n").map((l) => l.trim()).filter(Boolean));

  // 2) title blocks / headers / footers (recur on >= half the pages) are removed before anything else sees the text
  const bp = boilerplateSet(layer);
  const mask = (l: string) => l.replace(/\d+/g, "#");
  const bpLines: string[] = []; const seenMask = new Set<string>();
  let boilerplateLines = 0;
  const clean = layer.map((lines) => lines.filter((l) => {
    if (!bp.has(mask(l))) return true;
    boilerplateLines++; if (!seenMask.has(mask(l))) { seenMask.add(mask(l)); bpLines.push(l); }
    return false;
  }));
  const titleBlock = [...new Set((layer[0] || []).filter((l) => bp.has(mask(l))))].join(" · ").slice(0, 900);
  if (titleBlock && clean[0]) clean[0] = [...clean[0], `Title block: ${titleBlock}`]; // client name, job order, drawing number live here
  emit({ stage: "text", done: 1, total: 1, msg: `Text layer read: ${totalPages} pages` });

  // 3) OCR cross-check (recovers text the text layer cannot return, and scanned pages)
  const unreadable = clean.map((l, i) => (layer[i].join(" ").length < 100 ? i + 1 : 0)).filter(Boolean);
  const wanted = totalPages <= 200 ? "all" : unreadable.join(",");
  let ocr: OcrStats = noOcr("OCR skipped");
  const pageText: string[][] = clean.map((l) => l);
  if (wanted === "all" || unreadable.length) {
    const vocab = vocabulary(clean);
    const total = wanted === "all" ? totalPages : unreadable.length;
    emit({ stage: "ocr", done: 0, total, msg: `OCR cross-check of ${total} page(s)…` });
    const { pages: ocrPages, error } = await ocrPdf(buf, file.name, wanted, unreadable.join(","), (d, t) => emit({ stage: "ocr", done: d, total: t || total, msg: `OCR page ${d}/${t || total}` }));
    if (!ocrPages.size) ocr = noOcr(error || "OCR returned no pages", false);
    else {
      let recovered = 0, confSum = 0; const unusable: number[] = [];
      emit({ stage: "merge", done: 0, total: ocrPages.size, msg: "Merging OCR with the text layer…" });
      for (const [page, o] of ocrPages) {
        const m = mergePage(clean[page - 1] || [], o.text, o.confidence, vocab, bpLines);
        confSum += o.confidence;
        if (!m.usable) { if (layer[page - 1].join(" ").length < 100) unusable.push(page); continue; }
        if (m.recovered) { pageText[page - 1] = m.lines; recovered += m.recovered; }
      }
      ocr = { available: true, used: true, pagesOcred: ocrPages.size, recoveredLines: recovered, unusablePages: unusable.sort((a, b) => a - b), avgConfidence: Math.round(confSum / ocrPages.size), note: error };
    }
  } else ocr = noOcr("every page has a text layer and the file is too large for a full OCR pass", true);

  const merged = pageText.map((lines, i) => `\n\n[[PAGE ${i + 1}]]\n${lines.join("\n")}`).join("");
  return { name: file.name, text: merged, pages: totalPages, ocr, boilerplateLines };
}

export { OCR_MARK };
