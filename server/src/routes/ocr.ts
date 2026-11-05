import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

/**
 * POST /api/ocr/pdf  (multipart: file, pages?="1,2,5-9" | "all", scale?=1.5, hiPages?="82-98" rendered at scale 2.2 — dense scanned pages)
 * Renders PDF pages and OCRs them (tesseract, English, bundled model — fully offline).
 * Streams newline-delimited JSON: {type:"start",total} · {type:"page",page,text,confidence} · {type:"done"}.
 * Why it exists: some PDFs carry text the text layer cannot return (outlined/bold runs, scanned pages).
 */
export const ocr = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });

const WORKERS = Math.max(1, Math.min(3, Number(process.env.OCR_WORKERS) || 3));

function parsePages(spec: string, total: number): number[] {
  if (!spec) return [];
  if (spec === "all") return Array.from({ length: total }, (_, i) => i + 1);
  const out = new Set<number>();
  for (const part of spec.split(",")) {
    const m = /^(\d+)(?:-(\d+))?$/.exec(part.trim());
    if (!m) continue;
    for (let n = Number(m[1]); n <= Number(m[2] || m[1]); n++) if (n >= 1 && n <= total) out.add(n);
  }
  return [...out].sort((a, b) => a - b);
}

ocr.get("/status", async (_req, res) => {
  try {
    await import("@napi-rs/canvas"); await import("tesseract.js"); await import("unpdf");
    res.json({ available: true, workers: WORKERS });
  } catch (e: any) { res.json({ available: false, reason: String(e?.message || e).split("\n")[0] }); }
});

ocr.post("/pdf", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file missing" });
  let tesseract: typeof import("tesseract.js"), unpdf: typeof import("unpdf");
  try { tesseract = await import("tesseract.js"); unpdf = await import("unpdf"); await import("@napi-rs/canvas"); }
  catch (e: any) { return res.status(501).json({ error: `OCR not available on ${process.platform}-${process.arch}: ${String(e?.message || e).split("\n")[0]}` }); }

  res.setHeader("content-type", "application/x-ndjson; charset=utf-8");
  res.setHeader("cache-control", "no-cache");
  res.flushHeaders?.();
  const send = (o: unknown) => res.write(JSON.stringify(o) + "\n");
  let aborted = false; res.on("close", () => { if (!res.writableEnded) aborted = true; });

  try {
    const pdf = await unpdf.getDocumentProxy(new Uint8Array(req.file.buffer));
    const pages = parsePages(String(req.body?.pages || "all"), pdf.numPages);
    const scale = Math.min(3, Math.max(1.5, Number(req.body?.scale) || 1.5));
    const hi = new Set(parsePages(String(req.body?.hiPages || ""), pdf.numPages));
    send({ type: "start", total: pages.length, pdfPages: pdf.numPages });
    const langPath = path.dirname(fileURLToPath(import.meta.resolve("@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz"))) /* fileURLToPath, not URL.pathname: that gives "/E:/…" on Windows and Tesseract resolved it to E:E:… */;
    const workers = await Promise.all(Array.from({ length: Math.min(WORKERS, pages.length) }, () => tesseract.createWorker("eng", 1, { langPath, gzip: true, cachePath: path.join(process.cwd(), "data", "ocr-cache") })));
    let next = 0;
    await Promise.all(workers.map(async (w) => {
      while (!aborted) {
        const i = next++; if (i >= pages.length) break;
        const page = pages[i];
        try {
          const img = await unpdf.renderPageAsImage(pdf, page, { canvasImport: () => import("@napi-rs/canvas"), scale: hi.has(page) ? 2.2 : scale });
          const { data } = await w.recognize(Buffer.from(img));
          send({ type: "page", page, text: data.text, confidence: Math.round(data.confidence) });
        } catch (e: any) { send({ type: "page", page, text: "", confidence: 0, error: String(e?.message || e).split("\n")[0] }); }
      }
    }));
    await Promise.all(workers.map((w) => w.terminate()));
    send({ type: "done" });
  } catch (e: any) { send({ type: "error", error: String(e?.message || e).split("\n")[0] }); }
  res.end();
});
