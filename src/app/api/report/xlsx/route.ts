import { NextRequest } from "next/server";
import { guard } from "@/lib/server/guard";
import ExcelJS from "exceljs";
import type { VerifiedReport, Requirement, ComplianceItem } from "@/store/types";
import type { ReportScore } from "@/lib/reportScore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Payload {
  tender: { name: string; client: string; reference: string; industry: string; closing: string; stage: string; goNoGo: string; value: number; currency: string };
  generatedAt: string; model: string; recommendation?: { verdict: string; reasoning: string };
  sections: Record<string, string[]>; report?: VerifiedReport; score?: ReportScore; health: { score: number; factors: { label: string; value: number; na?: boolean; hint?: string }[] };
  requirements: Requirement[]; compliance: ComplianceItem[];
  risks: { title: string; description: string; category: string; probability: number; impact: number; mitigation: string; status: string }[];
  clarifications: { title: string; analysis: string; category: string; status: string; ref: string }[];
  deliverables: { name: string; type: string; status: string }[]; contractTerms: { term: string; finding: string; risk: string; source: string }[];
}

const DARK = "FF1F2937", WHITE = "FFFFFFFF";
const fills: Record<string, string> = { Conforms: "FFD1FAE5", Conflicts: "FFFECACA", "Reference only": "FFDBEAFE", "Not covered in library": "FFE5E7EB", High: "FFFECACA", Medium: "FFFEF3C7", Low: "FFE0F2FE", Info: "FFF3F4F6", "verified-in-library": "FFD1FAE5", "not-in-library": "FFFEF3C7", "outside-library-scope": "FFE5E7EB", "project-doc-provided": "FFD1FAE5", "project-doc-missing": "FFFEF3C7", Approved: "FFD1FAE5", Rejected: "FFFECACA", Compliant: "FFD1FAE5", "Non-Compliant": "FFFECACA", Missing: "FFFECACA", "Needs Verification": "FFFEF3C7", "Needs Review": "FFFEF3C7" };

function sheet(wb: ExcelJS.Workbook, name: string, cols: { header: string; key: string; width: number; wrap?: boolean }[], rows: Record<string, unknown>[], colorKeys: string[] = []) {
  const ws = wb.addWorksheet(name, { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = cols.map((c) => ({ header: c.header, key: c.key, width: c.width }));
  const h = ws.getRow(1); h.height = 22;
  h.eachCell((c) => { c.font = { bold: true, color: { argb: WHITE } }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } }; c.alignment = { vertical: "middle", wrapText: true }; });
  for (const r of rows) {
    const row = ws.addRow(r);
    row.alignment = { vertical: "top", wrapText: true };
    for (const k of colorKeys) { const v = String(r[k] ?? ""); if (fills[v]) row.getCell(k).fill = { type: "pattern", pattern: "solid", fgColor: { argb: fills[v] } }; }
  }
  if (rows.length) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: cols.length } };
  return ws;
}

export async function POST(req: NextRequest) {
  const denied = await guard(req, "xlsx", 20); if (denied) return denied;
  let d: Payload;
  try { d = await req.json(); } catch { return Response.json({ error: "invalid payload" }, { status: 400 }); }
  const wb = new ExcelJS.Workbook(); wb.creator = "BidWinning"; wb.created = new Date();
  const rep = d.report; const sc = d.score;

  // ---- Summary
  const ws = wb.addWorksheet("Summary", { views: [{ showGridLines: false }] });
  ws.columns = [{ width: 30 }, { width: 18 }, { width: 14 }, { width: 90 }];
  const title = ws.addRow([`BidWinning — Verified Tender Analysis: ${d.tender.name}`]); title.font = { bold: true, size: 16 }; ws.mergeCells(title.number, 1, title.number, 4);
  ws.addRow([`AI-assisted, human-verified. Generated ${new Date(d.generatedAt).toLocaleString()}${rep ? ` · ${rep.model} · prompt ${rep.promptVersion}` : ""}`]).font = { italic: true, color: { argb: "FF6B7280" } };
  ws.addRow([]);
  const kv = (k: string, v: unknown) => { const r = ws.addRow([k, v as string]); r.getCell(1).font = { bold: true }; ws.mergeCells(r.number, 2, r.number, 4); r.getCell(2).alignment = { wrapText: true, vertical: "top", horizontal: "left" }; return r; };
  kv("Client", d.tender.client); kv("Reference", d.tender.reference); kv("Industry / stage", `${d.tender.industry} · ${d.tender.stage}`); kv("Submission deadline", d.tender.closing || "not stated"); kv("Go / No-Go", d.tender.goNoGo);
  kv("AI recommendation", d.recommendation ? `${d.recommendation.verdict} — ${d.recommendation.reasoning}` : "not produced");
  if (sc) {
    ws.addRow([]); const hr = ws.addRow(["REPORT SCORE", `${sc.score} / 100`, `Grade ${sc.grade}`, sc.label]); hr.font = { bold: true, size: 13 };
    hr.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: sc.score >= 70 ? "FFD1FAE5" : sc.score >= 50 ? "FFFEF3C7" : "FFFECACA" } };
    const ph = ws.addRow(["Component", "Score (0–100)", "Weight %", "Detail"]); ph.font = { bold: true, color: { argb: WHITE } }; ph.eachCell((c) => { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } }; });
    for (const p of sc.parts) { const r = ws.addRow([p.label, Math.round(p.score), p.weight, p.detail]); r.getCell(4).alignment = { wrapText: true, vertical: "top" }; }
    if (sc.limits.length) { ws.addRow([]); ws.addRow(["What limits the score"]).font = { bold: true }; for (const l of sc.limits) { const r = ws.addRow(["•", l]); ws.mergeCells(r.number, 2, r.number, 4); r.getCell(2).alignment = { wrapText: true, vertical: "top" }; } }
    ws.addRow([]); const note = ws.addRow(["The Report Score measures how complete, verified and trustworthy this analysis is. It is not Tender Health (bid readiness) and defects found in the tender do not lower it."]); ws.mergeCells(note.number, 1, note.number, 4); note.font = { italic: true, color: { argb: "FF6B7280" } };
  }
  ws.addRow([]); const th = ws.addRow(["TENDER HEALTH", `${d.health.score} / 100`]); th.font = { bold: true, size: 13 };
  for (const f of d.health.factors) { const r = ws.addRow([f.label, f.na ? "n/a" : f.value, "%", f.hint || ""]); r.getCell(4).alignment = { wrapText: true }; }
  if (rep) {
    ws.addRow([]); ws.addRow(["PROVENANCE & COVERAGE"]).font = { bold: true, size: 13 };
    kv("Library used", `v${rep.library.version} · ${rep.library.rows.toLocaleString()} rows · ${rep.library.codedStandards} coded standards${rep.library.indexedAt ? ` · indexed ${new Date(rep.library.indexedAt).toLocaleDateString()}` : ""}${rep.library.unavailable ? ` · UNAVAILABLE: ${rep.library.unavailable}` : ""}`);
    kv("Pages", `${rep.coverage.pagesRead} of ${rep.coverage.pagesTotal} read${rep.coverage.unreadablePages.length ? ` — NOT read: ${rep.coverage.unreadablePages.join(", ")}` : ""}${rep.coverage.ocrRecoveredLines ? ` · ${rep.coverage.ocrRecoveredLines} lines recovered by OCR` : ""}`);
    kv("Requirements", `${rep.coverage.statements} extracted with exact quotes · ${rep.coverage.judged} judged against the library (${rep.stats.conforms} conform · ${rep.stats.conflicts} conflict · ${rep.stats.referenceOnly || 0} reference-only · ${rep.stats.notCovered} not covered)`);
    kv("Cited references", `${rep.coverage.codesVerified} of ${rep.coverage.codesCited} verified in the library`);
    kv("Automatic checks", `${rep.stats.aiStatementsDropped} AI statement(s) dropped (quote not found) · ${rep.stats.failedChecks} AI judgement(s) downgraded · ${rep.stats.aiCalls} AI calls in ${rep.stats.seconds}s`);
    if (rep.aiErrors?.length) kv("AI FAILURES", rep.aiErrors.join("\n"));
  }
  for (const [k, v] of Object.entries(d.sections)) if (v.length) { ws.addRow([]); ws.addRow([k.toUpperCase()]).font = { bold: true }; for (const x of v) { const r = ws.addRow(["•", x]); ws.mergeCells(r.number, 2, r.number, 4); r.getCell(2).alignment = { wrapText: true, vertical: "top" }; } }

  // ---- Requirements (every extracted requirement, verbatim)
  const libCheck = new Map((rep?.findings || []).map((f) => [f.statementId, f]));
  sheet(wb, "Requirements", [
    { header: "#", key: "n", width: 6 }, { header: "Category", key: "category", width: 15 }, { header: "Priority", key: "priority", width: 9 }, { header: "Requirement (verbatim quote)", key: "text", width: 90 },
    { header: "Document", key: "doc", width: 28 }, { header: "Page", key: "page", width: 7 }, { header: "Clause", key: "clause", width: 10 }, { header: "Section", key: "section", width: 34 },
    { header: "Status", key: "status", width: 16 }, { header: "Reviewer", key: "reviewer", width: 16 }, { header: "Library check", key: "lib", width: 26 }, { header: "Comments", key: "comments", width: 50 },
  ], d.requirements.map((r, i) => ({ n: i + 1, category: r.category, priority: r.priority, text: r.text, doc: r.sourceDoc, page: r.page, clause: r.clause, section: r.section, status: r.status, reviewer: r.reviewer, lib: (r.comments.match(/Library check: ([^·]+)/)?.[1] || "").trim(), comments: r.comments })), ["status"]);

  // ---- Compliance
  sheet(wb, "Compliance", [
    { header: "#", key: "n", width: 6 }, { header: "Compliance item / obligation", key: "item", width: 80 }, { header: "Status", key: "status", width: 18 }, { header: "Owner", key: "owner", width: 16 }, { header: "Evidence", key: "evidence", width: 36 }, { header: "Source / notes", key: "notes", width: 60 },
  ], d.compliance.map((c, i) => ({ n: i + 1, item: c.item, status: c.status, owner: c.owner, evidence: c.evidence, notes: c.notes })), ["status"]);

  if (rep) {
    sheet(wb, "Library findings", [
      { header: "Verdict", key: "verdict", width: 20 }, { header: "Page", key: "page", width: 7 }, { header: "Clause", key: "section", width: 10 }, { header: "Category", key: "category", width: 14 }, { header: "Requirement (verbatim)", key: "quote", width: 70 },
      { header: "Library standard", key: "std", width: 26 }, { header: "Rule quotation (from library)", key: "ruleQuote", width: 50 }, { header: "Reasoning", key: "reasoning", width: 50 }, { header: "Confidence", key: "conf", width: 11 },
      { header: "Checks (quote / rule text / rule id / active)", key: "checks", width: 26 }, { header: "AI knowledge note (UNVERIFIED)", key: "knowledge", width: 44 }, { header: "Review", key: "review", width: 12 }, { header: "Reviewed by", key: "by", width: 16 }, { header: "Date", key: "at", width: 12 },
    ], rep.findings.map((f) => { const a = rep.approvals[f.id]; const t = (v: boolean | null) => (v === null ? "–" : v ? "✓" : "✗"); return { verdict: f.verdict, page: f.page, section: f.section, category: f.category, quote: f.quote, std: f.standardName || "", ruleQuote: f.ruleQuote || "", reasoning: f.reasoning, conf: f.confidence, checks: `${t(f.checks.quote)} ${t(f.checks.ruleQuote)} ${t(f.checks.ruleExists)} ${t(f.checks.ruleActive)}`, knowledge: f.knowledge || "", review: a?.decision || "Pending", by: a?.by || "", at: a ? new Date(a.at).toLocaleDateString() : "" }; }), ["verdict", "review"]);

    sheet(wb, "Standards register", [
      { header: "Reference", key: "code", width: 22 }, { header: "Type", key: "kind", width: 22 }, { header: "Status", key: "status", width: 22 }, { header: "Library file (active revision)", key: "lib", width: 34 }, { header: "Year", key: "year", width: 7 }, { header: "Revisions in library", key: "revs", width: 9 },
      { header: "Cited on pages", key: "pages", width: 22 }, { header: "In standards list", key: "listed", width: 12 }, { header: "Title in tender", key: "title", width: 50 },
    ], rep.registry.map((r) => ({ code: r.code, kind: r.kind, status: r.status, lib: r.libraryName || "", year: r.libraryYear ?? "", revs: r.revisions.length, pages: [...new Set(r.citations.map((c) => c.page))].sort((a, b) => a - b).join(", "), listed: r.listedInSection6 ? "yes" : "NO", title: r.titleInTender })), ["status"]);

    sheet(wb, "Consistency issues", [
      { header: "Severity", key: "sev", width: 10 }, { header: "Type", key: "kind", width: 24 }, { header: "Finding", key: "title", width: 56 }, { header: "Detail", key: "detail", width: 80 }, { header: "Pages", key: "pages", width: 18 }, { header: "Items", key: "items", width: 70 },
    ], rep.issues.map((i) => ({ sev: i.severity, kind: i.kind, title: i.title, detail: i.detail, pages: i.pages.slice(0, 30).join(", "), items: (i.items || []).join("\n") })), ["sev"]);

    sheet(wb, "AI knowledge (unverified)", [
      { header: "Type", key: "t", width: 16 }, { header: "Standard / law", key: "name", width: 44 }, { header: "Detail", key: "d", width: 70 }, { header: "Exists in library?", key: "lib", width: 36 },
    ], [
      ...rep.knowledge.editions.map((e) => ({ t: "Edition check", name: `${e.code} (cited: ${e.cited})`, d: `${e.status} — ${e.note}`, lib: "" })),
      ...rep.knowledge.omitted.map((o) => ({ t: "Not cited in tender", name: `${o.name}${o.code ? ` (${o.code})` : ""} [${o.jurisdiction}]`, d: o.reason, lib: o.libraryVerified ? `yes: ${o.libraryName}` : "not verified" })),
    ]);
  }

  sheet(wb, "Risks", [{ header: "Risk", key: "title", width: 40 }, { header: "Description", key: "description", width: 70 }, { header: "Category", key: "category", width: 16 }, { header: "P (1-5)", key: "probability", width: 9 }, { header: "I (1-5)", key: "impact", width: 9 }, { header: "Score", key: "score", width: 8 }, { header: "Mitigation", key: "mitigation", width: 60 }, { header: "Status", key: "status", width: 12 }],
    d.risks.map((r) => ({ ...r, score: r.probability * r.impact })));
  sheet(wb, "Clarifications", [{ header: "Ref", key: "ref", width: 14 }, { header: "Title", key: "title", width: 50 }, { header: "Question / analysis", key: "analysis", width: 100 }, { header: "Category", key: "category", width: 14 }, { header: "Status", key: "status", width: 12 }], d.clarifications);
  sheet(wb, "Deliverables", [{ header: "Deliverable", key: "name", width: 80 }, { header: "Type", key: "type", width: 14 }, { header: "Status", key: "status", width: 14 }], d.deliverables);
  sheet(wb, "Contract terms", [{ header: "Term", key: "term", width: 24 }, { header: "Finding (verbatim)", key: "finding", width: 100 }, { header: "Risk", key: "risk", width: 9 }, { header: "Source", key: "source", width: 18 }], d.contractTerms, ["risk"]);

  const buf = await wb.xlsx.writeBuffer();
  const safe = d.tender.name.replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 60) || "tender";
  return new Response(buf as ArrayBuffer, { headers: { "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "content-disposition": `attachment; filename="BidWinning_${safe}_analysis.xlsx"` } });
}
