import { NextRequest } from "next/server";
import { guard } from "@/lib/server/guard";
import { extractTakeoff, type Ask } from "@/lib/server/takeoff";
import { completeJSON, provider, providerLabel } from "@/lib/server/llm";
import { extractFile } from "@/lib/server/verified/extract";
import { runVerifiedPipeline } from "@/lib/server/verified/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 3600;

const MAX_CHARS = 12_000; // single-document "general information" extraction only; tender review reads the whole document

const SYSTEM = `You are the document-intelligence engine of BidWinning, a tender & bid platform used by contractors across industries.
You read tender documents (ITT/RFP/RFQ/SOW/contracts) and return STRICT JSON only — no prose outside the JSON.
Rules: every finding must cite where it comes from (page marker [[PAGE n]] and the section/clause number as written). Never invent facts; if something is not stated, write "not stated". Quantities and numbers must be quoted exactly. Keep each text field concise (max ~60 words).`;

const DOC_SCHEMA = `Return JSON: {"Title":"","Reference":"","Client":"","Issuer":"","Project":"","Industry":"","Location":"","Dates":"","Value":"","Currency":"","Duration":"","Tender type":"","Document type":"","Pages":"","Key sections":""}. Use "not stated" where absent.`;

/** Newline-delimited JSON stream: progress events, then one result (or error). Aborts when the client disconnects. */
function stream(req: NextRequest, run: (send: (o: unknown) => void, aborted: () => boolean) => Promise<void>) {
  const enc = new TextEncoder(); let closed = false;
  const body = new ReadableStream({
    async start(ctrl) {
      const send = (o: unknown) => { if (closed) return; try { ctrl.enqueue(enc.encode(JSON.stringify(o) + "\n")); } catch { closed = true; } };
      const beat = setInterval(() => send({ type: "ping" }), 8000);
      try { await run(send, () => closed || req.signal.aborted); }
      catch (e) { if (!(e instanceof Error && e.message === "cancelled")) send({ type: "error", error: e instanceof Error ? e.message : "analysis failed" }); }
      finally { clearInterval(beat); if (!closed) { closed = true; try { ctrl.close(); } catch { /* already closed */ } } }
    },
    cancel() { closed = true; },
  });
  return new Response(body, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-cache, no-transform", "x-accel-buffering": "no" } });
}

export async function POST(req: NextRequest) {
  const denied = await guard(req, "analyze", 10); if (denied) return denied;
  const ct = req.headers.get("content-type") || "";
  let text = "", name = "document", mode = "tender"; let context: Record<string, unknown> = {}; let depth: "standard" | "deep" = "standard";

  // ---- file upload: text-layer extraction + OCR cross-check, streamed (needs no AI key)
  if (ct.includes("multipart/form-data")) {
    let file: unknown; let m = "extract";
    try { const form = await req.formData(); file = form.get("file"); m = String(form.get("mode") || "extract"); }
    catch (e) { return Response.json({ error: `Could not read file: ${e instanceof Error ? e.message : "unknown"}` }, { status: 400 }); }
    if (!(file instanceof File)) return Response.json({ error: "file missing" }, { status: 400 });
    if (m !== "extract") return Response.json({ error: "unsupported mode for upload" }, { status: 400 });
    return stream(req, async (send) => {
      const r = await extractFile(file, (e) => send({ type: "progress", ...e }));
      if (!r.text.replace(/\[\[PAGE \d+\]\]/g, "").replace(//g, "").trim()) throw new Error("No extractable text — the pages are images and OCR could not read them reliably (is the API server on port 4005 running?)");
      send({ type: "result", name: r.name, text: r.text, pages: r.pages, ocr: r.ocr, boilerplateLines: r.boilerplateLines });
    });
  }

  try { const body = await req.json(); text = String(body.text || ""); name = body.name || name; mode = body.mode || "tender"; context = body.context || {}; depth = body.depth === "deep" ? "deep" : "standard"; }
  catch (e) { return Response.json({ error: `Could not read request: ${e instanceof Error ? e.message : "unknown"}` }, { status: 400 }); }
  if (mode === "takeoff") {
    // Quantity takeoff from a SOW / BOQ / MTO: spreadsheets need no AI; PDF/Word use the AI but every item is checked in code.
    if (!text.trim()) return Response.json({ error: "No extractable text (scanned PDF? re-upload so OCR can run)." }, { status: 422 });
    return stream(req, async (send, aborted) => {
      const ask: Ask = (system, user) => completeJSON<{ items?: unknown[] }>(system, user, 4000);
      const r = await extractTakeoff(text, ask, { aborted, progress: (done, total) => send({ type: "progress", stage: "takeoff", done, total, msg: total ? `Reading section ${Math.min(done + 1, total)} of ${total}…` : "Reading…" }) });
      send({ type: "result", ...r, provider: providerLabel() });
    });
  }
  if (!provider()) return Response.json({ error: "no_credentials" }, { status: 503 });

  if (mode === "draft") {
    // Draft prose sections (proposal / engineering) grounded in the workspace context + document text.
    const body = context as { sections?: string[]; kind?: string; tender?: unknown; facts?: unknown };
    const sections = (body.sections || []).slice(0, 12);
    if (!sections.length) return Response.json({ error: "sections[] required" }, { status: 400 });
    try {
      const out = await completeJSON<{ sections: { title: string; body: string }[] }>(
        `You draft ${body.kind || "technical proposal"} sections for a bidder. Write in confident, specific, professional prose grounded ONLY in the supplied tender facts and document text; where a fact is unknown write "[to confirm: …]". 120–220 words per section, plain paragraphs (no headings inside). Return strict JSON.`,
        `Return JSON {"sections":[{"title":"","body":""}]} for these titles: ${JSON.stringify(sections)}.\n\nTENDER FACTS: ${JSON.stringify(body.tender || {})}\nWORKSPACE FACTS: ${JSON.stringify(body.facts || {})}\n\nDOCUMENT TEXT:\n${text.replace(//g, "").slice(0, 15_000) || "(none indexed)"}`, 3000);
      return Response.json({ sections: out.sections || [], provider: providerLabel() });
    } catch (e) { return Response.json({ error: e instanceof Error ? e.message : "draft failed" }, { status: 502 }); }
  }
  if (!text.trim()) return Response.json({ error: "No extractable text (scanned PDF? re-upload so OCR can run)." }, { status: 422 });

  if (mode === "document") {
    const clipped = text.replace(//g, "").replace(/\[\[PAGE \d+\]\]/g, " ").slice(0, MAX_CHARS);
    try {
      const analysis = await completeJSON<Record<string, string>>(SYSTEM, `${DOC_SCHEMA}\n\nDOCUMENT "${name}":\n${clipped}`, 1500);
      return Response.json({ name, text, analysis, provider: providerLabel() });
    } catch (e) { return Response.json({ error: e instanceof Error ? e.message : "analysis failed" }, { status: 502 }); }
  }

  // ---- full verified tender review (streams progress, then the result)
  return stream(req, async (send, aborted) => {
    const result = await runVerifiedPipeline(text, name, { depth, aborted }, (e) => send(e));
    send({ type: "result", result, provider: providerLabel(), chars: text.length });
  });
}
