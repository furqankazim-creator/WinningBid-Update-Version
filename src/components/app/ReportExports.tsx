"use client";
import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui";
import { useStore, tenderHealth, scoped } from "@/store/useStore";
import { reportScore, type ReportScore } from "@/lib/reportScore";
import { authFetch } from "@/lib/authFetch";

/** The one place that turns store records into the Report Score — used by the page, the PDF and the Excel export. */
export function useReportScore(tenderId: string): ReportScore | null {
  const s = useStore(); const sum = s.aiSummaries.find((x) => x.tenderId === tenderId); const rep = sum?.report;
  if (!sum || !rep) return null;
  const reqs = s.requirements.filter((r) => r.tenderId === tenderId);
  return reportScore(rep, {
    facts: (sum.sections["Executive Summary"]?.length || 0) + (sum.sections["Scope Summary"]?.length || 0) > 0,
    recommendation: sum.recommendation.verdict !== "Pending",
    risks: scoped(s.risks, tenderId).length > 0, clarifications: scoped(s.clarifications, tenderId).length > 0, contractTerms: sum.contractTerms.length > 0,
  }, { requirementsReviewed: reqs.filter((r) => r.status !== "Needs Verification").length, requirementsTotal: reqs.length });
}

export function ExcelButton({ tenderId }: { tenderId: string }) {
  const s = useStore(); const score = useReportScore(tenderId); const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const sum = s.aiSummaries.find((x) => x.tenderId === tenderId); const t = s.tenders.find((x) => x.id === tenderId);
  if (!sum || !t) return null;
  const go = async () => {
    setBusy(true); setErr(null);
    try {
      const h = tenderHealth(s, tenderId);
      const payload = {
        tender: { name: t.name, client: t.client, reference: t.reference, industry: t.industry, closing: t.closing, stage: t.stage, goNoGo: t.goNoGo, value: t.value, currency: t.currency },
        generatedAt: sum.generatedAt, model: sum.model, recommendation: sum.recommendation, sections: sum.sections, report: sum.report, score, health: h,
        requirements: s.requirements.filter((r) => r.tenderId === tenderId), compliance: s.complianceItems.filter((c) => c.tenderId === tenderId),
        risks: scoped(s.risks, tenderId).map((r) => ({ title: r.title, description: r.description, category: r.category, probability: r.probability, impact: r.impact, mitigation: r.mitigation, status: r.status })),
        clarifications: scoped(s.clarifications, tenderId).map((c) => ({ title: c.title, analysis: c.analysis, category: c.category, status: c.status, ref: c.ref })),
        deliverables: scoped(s.deliverables, tenderId).map((d) => ({ name: d.name, type: d.type, status: d.status })), contractTerms: sum.contractTerms,
      };
      const res = await authFetch("/api/report/xlsx", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`);
      const url = URL.createObjectURL(await res.blob()); const a = document.createElement("a");
      a.href = url; a.download = `BidWinning_${t.name.replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 60)}_analysis.xlsx`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (e) { setErr(e instanceof Error ? e.message : "export failed"); } finally { setBusy(false); }
  };
  return <span className="inline-flex items-center gap-2"><Button variant="outline" onClick={go} disabled={busy}><FileSpreadsheet size={13} /> {busy ? "Building Excel…" : "Download Excel"}</Button>{err && <span className="text-[11px] text-app-red">{err}</span>}</span>;
}
