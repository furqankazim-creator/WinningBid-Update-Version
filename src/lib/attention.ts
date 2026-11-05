import type { useStore } from "@/store/useStore";
import { tenderHealth, dueLabel, daysLeft, scoped } from "@/store/useStore";

type S = ReturnType<typeof useStore.getState>;
export type Sev = "high" | "medium" | "low";
export interface Attention { key: string; sev: Sev; title: string; detail: string; href: string; cta: string; }

/**
 * What a tender owner should look at next, derived only from the tender's real records.
 * Shared by the Overview ("Needs attention") and the Action Board ("Suggested actions") so they always agree.
 */
export function deriveAttention(s: S, tenderId: string): Attention[] {
  const t = s.tenders.find((x) => x.id === tenderId); if (!t) return [];
  const w = (p: string) => `/app/tenders/${tenderId}${p}`;
  const sum = s.aiSummaries.find((a) => a.tenderId === tenderId); const rep = sum?.report;
  const docs = scoped(s.docs, tenderId); const indexed = docs.filter((d) => d.status === "INDEXED" && d.text);
  const reqs = s.requirements.filter((r) => r.tenderId === tenderId); const reqReviewed = reqs.filter((r) => r.status !== "Needs Verification").length;
  const comp = s.complianceItems.filter((c) => c.tenderId === tenderId);
  const risks = scoped(s.risks, tenderId).filter((r) => r.kind === "Risk"); const hiRisks = risks.filter((r) => r.status === "Open" && r.probability * r.impact >= 10);
  const clar = scoped(s.clarifications, tenderId);
  const pv = s.priceVersions.filter((p) => p.tenderId === tenderId); const locked = pv.find((p) => p.locked);
  const pendingApprovals = s.approvals.filter((a) => a.tenderId === tenderId && a.status === "Pending");
  const h = tenderHealth(s, tenderId); const days = t.closing ? daysLeft(t.closing) : null; const overdue = !!t.closing && new Date(t.closing).getTime() < Date.now() - 86400000;
  const pages = docs.reduce((a, d) => a + (d.pages || 0), 0);
  const att: Attention[] = [];
  const add = (key: string, a: Omit<Attention, "key">) => { att.push({ key, ...a }); };
  if (t.closing && overdue) add("k0", { sev: "high", title: "Submission deadline has passed", detail: `Closing date ${t.closing} is ${dueLabel(t.closing)}. Confirm the deadline, or mark the tender Lost/Withdrawn.`, href: w(""), cta: "Edit deadline" });
  else if (t.closing && days !== null && days <= 14) add("k1", { sev: "high", title: `Only ${dueLabel(t.closing, true)} to the deadline`, detail: `Submission closes ${t.closing}. Readiness is ${h.score}/100.`, href: w("/reviews"), cta: "Open reviews" });
  if (!t.closing) add("k2", { sev: "medium", title: "No submission deadline recorded", detail: "Without a deadline the countdown, health and reminders cannot work.", href: w(""), cta: "Set deadline" });
  if (!docs.length) add("k3", { sev: "high", title: "No tender documents uploaded", detail: "Upload the ITT / RFP / SOW (PDF or DOCX) so the requirements, compliance and risks can be extracted.", href: "/app/documents", cta: "Upload documents" });
  else if (!sum) add("k4", { sev: "high", title: "AI analysis has not been run", detail: `${indexed.length} document(s), ${pages} page(s) are ready for the verified analysis.`, href: w("/ai-analysis"), cta: "Run analysis" });
  if (rep?.aiErrors?.length) add("k5", { sev: "high", title: `${rep.aiErrors.length} AI step(s) failed in the last analysis`, detail: `${rep.aiErrors[0].slice(0, 130)}… The report is incomplete — re-run when the provider is available.`, href: w("/ai-analysis"), cta: "Review & re-run" });
  if (rep && rep.coverage.unreadablePages.length) add("k6", { sev: "high", title: `${rep.coverage.unreadablePages.length} page(s) could not be read`, detail: `Pages ${rep.coverage.unreadablePages.slice(0, 8).join(", ")}${rep.coverage.unreadablePages.length > 8 ? "…" : ""} are not part of the analysis. Provide a readable copy and review them manually.`, href: w("/ai-analysis"), cta: "See coverage" });
  const hiIssues = rep?.issues.filter((i) => i.severity === "High" && i.kind !== "unreadable-pages" && i.kind !== "ai-unavailable") || [];
  if (hiIssues.length) add("k7", { sev: "high", title: `${hiIssues.length} high-severity inconsistency(ies) in the tender`, detail: hiIssues.slice(0, 3).map((i) => i.title).join(" · "), href: w("/ai-analysis"), cta: "View findings" });
  const conflicts = rep?.findings.filter((f) => f.verdict === "Conflicts" && !rep.approvals[f.id]) || [];
  if (conflicts.length) add("k8", { sev: "high", title: `${conflicts.length} library conflict(s) await review`, detail: "A requirement appears to contradict a standard in your library. Approve it as a clarification or reject it.", href: w("/ai-analysis"), cta: "Review conflicts" });
  if (t.goNoGo === "Pending") add("k9", { sev: "medium", title: "Go / No-Go decision is pending", detail: "Score the 15 criteria to get a recommendation and request management approval.", href: w("/go-no-go"), cta: "Open Go / No-Go" });
  const pendingReqs = reqs.length - reqReviewed;
  if (pendingReqs > 0) add("k10", { sev: "medium", title: `${pendingReqs} requirement(s) need verification`, detail: `${reqReviewed} of ${reqs.length} reviewed. AI-extracted requirements do not count until a reviewer approves them.`, href: w("/requirements"), cta: "Verify requirements" });
  const missing = comp.filter((c) => ["Missing", "Expired", "Non-Compliant"].includes(c.status));
  if (missing.length) add("k11", { sev: "high", title: `${missing.length} compliance item(s) missing, expired or non-compliant`, detail: missing.slice(0, 2).map((c) => c.item.slice(0, 60)).join(" · "), href: w("/compliance"), cta: "Open compliance" });
  if (hiRisks.length) add("k12", { sev: "medium", title: `${hiRisks.length} open high-severity risk(s)`, detail: hiRisks.slice(0, 2).map((r) => r.title).join(" · "), href: "/app/risks/register", cta: "Risk register" });
  if (!pv.length) add("k13", { sev: "low", title: "No price version yet", detail: "Build the cost base and create the first priced version.", href: w("/pricing"), cta: "Open pricing" });
  else if (!locked) add("k14", { sev: "low", title: "Price is not locked", detail: `Latest draft v${pv[pv.length - 1].version}. Lock it once approved — any later change creates a new version.`, href: w("/pricing"), cta: "Open pricing" });
  const draftClar = clar.filter((c) => c.pending || c.status === "Draft").length;
  if (draftClar) add("k15", { sev: "low", title: `${draftClar} clarification question(s) still in draft`, detail: "Send them to the client before the clarification deadline.", href: "/app/clarifications/register", cta: "Open register" });
  if (pendingApprovals.length) add("k16", { sev: "medium", title: `${pendingApprovals.length} approval(s) waiting`, detail: pendingApprovals.slice(0, 2).map((a) => a.subject).join(" · "), href: "/app/approvals", cta: "Open approvals" });
  const order: Record<Sev, number> = { high: 0, medium: 1, low: 2 };
  return att.sort((a, b) => order[a.sev] - order[b.sev]);
}
