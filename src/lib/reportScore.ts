import type { VerifiedReport } from "@/store/types";

/**
 * Report Score — how complete, verified and trustworthy THIS ANALYSIS REPORT is (0–100).
 * It is NOT the bid's attractiveness and NOT Tender Health; defects found in the tender never lower it (finding them is the job).
 * One definition shared by the AI Analysis page, the PDF and the Excel export.
 */
export interface ScorePart { key: string; label: string; weight: number; score: number; detail: string; }
export interface ReportScore { score: number; grade: "A" | "B" | "C" | "D"; label: string; parts: ScorePart[]; limits: string[]; }
export interface ReportOutputs { facts: boolean; recommendation: boolean; risks: boolean; clarifications: boolean; contractTerms: boolean; }
export interface ReviewProgress { requirementsReviewed: number; requirementsTotal: number; }

const clamp = (n: number) => Math.max(0, Math.min(100, n));
const pct = (a: number, b: number) => (b > 0 ? a / b : 0);

export function reportScore(rep: VerifiedReport, out: ReportOutputs, rv: ReviewProgress): ReportScore {
  const c = rep.coverage; const st = rep.stats; const f = rep.findings;
  const aramco = rep.registry.filter((r) => r.kind.startsWith("aramco"));
  const stepsFailed = (rep.aiErrors || []).length;

  const coverage = clamp(pct(c.pagesRead, c.pagesTotal) * 100);
  const judged = f.length + (st.judgeFailed || 0);
  const checkScore = judged + st.aiStatementsDropped > 0 ? 1 - (st.failedChecks + st.aiStatementsDropped) / (judged + st.aiStatementsDropped + st.failedChecks) : 0;
  const verification = clamp((0.6 * Math.max(0, 1 - stepsFailed / 4) + 0.4 * Math.max(0, checkScore)) * 100);
  const ruleBacked = pct(f.filter((x) => x.ruleId).length, f.length);
  const judgedShare = Math.min(1, pct(c.judged, Math.min(c.statements, 120)));
  const grounding = clamp((0.35 * pct(c.codesVerified, aramco.length || 1) + 0.35 * ruleBacked + 0.3 * judgedShare) * 100);
  const reviewedF = Object.keys(rep.approvals).length;
  const review = clamp((0.5 * pct(reviewedF, f.length) + 0.5 * pct(rv.requirementsReviewed, rv.requirementsTotal)) * 100);
  const done = Object.values(out).filter(Boolean).length;
  const completeness = clamp((done / 5) * 100);

  const parts: ScorePart[] = [
    { key: "coverage", label: "Document coverage", weight: 25, score: coverage, detail: `${c.pagesRead} of ${c.pagesTotal} pages read${c.unreadablePages.length ? ` · ${c.unreadablePages.length} unreadable` : ""}${c.ocrRecoveredLines ? ` · ${c.ocrRecoveredLines} OCR-recovered lines` : ""}` },
    { key: "verification", label: "Verification integrity", weight: 25, score: verification, detail: `${4 - stepsFailed} of 4 AI steps succeeded · ${st.failedChecks} citation(s) downgraded · ${st.aiStatementsDropped} statement(s) dropped by the quote check` },
    { key: "grounding", label: "Library grounding", weight: 20, score: grounding, detail: `${c.codesVerified} of ${aramco.length} cited Saudi Aramco references verified · ${f.filter((x) => x.ruleId).length} of ${f.length} judged findings rest on a library rule · ${c.judged} of ${c.statements} requirements judged` },
    { key: "review", label: "Human review", weight: 20, score: review, detail: `${reviewedF} of ${f.length} findings and ${rv.requirementsReviewed} of ${rv.requirementsTotal} requirements approved/rejected` },
    { key: "completeness", label: "Output completeness", weight: 10, score: completeness, detail: `${done} of 5 sections produced (facts, recommendation, risks, clarifications, contract terms)` },
  ];
  const score = Math.round(parts.reduce((a, p) => a + (p.score * p.weight) / 100, 0));
  const grade = score >= 85 ? "A" : score >= 70 ? "B" : score >= 50 ? "C" : "D";
  const label = grade === "A" ? "Audit-ready" : grade === "B" ? "Reliable — finish the review" : grade === "C" ? "Partial — gaps remain" : "Incomplete";

  const limits: string[] = [];
  if (coverage < 95) limits.push(`${c.unreadablePages.length} page(s) could not be read (${c.unreadablePages.slice(0, 6).join(", ")}${c.unreadablePages.length > 6 ? "…" : ""}) — supply a readable copy of those pages.`);
  if (stepsFailed) limits.push(`${stepsFailed} AI step(s) failed (${(rep.aiErrors || [])[0]?.slice(0, 110)}…) — re-run the analysis when the AI quota resets or add another API key.`);
  if (grounding < 60) limits.push(`Only ${c.codesVerified} of ${aramco.length} cited references exist in your library and ${c.judged} requirements were judged — add the missing standards to the Master Library and/or run Deep depth.`);
  if (review < 50) limits.push("Most findings and requirements are still unreviewed — approve or reject them (Approvals feed this score and the PDF).");
  if (completeness < 100) limits.push("Some report sections were not produced (see failed AI steps above).");
  return { score, grade, label, parts, limits };
}
