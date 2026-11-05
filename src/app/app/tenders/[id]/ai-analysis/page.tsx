"use client";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Sparkles, FileText, AlertTriangle } from "lucide-react";
import { Card, Label, Badge, Button, SectionTitle, Modal } from "@/components/ui";
import { RunEstimate } from "@/components/app/shared";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { contractTerms } from "@/lib/industries";
import { cn } from "@/lib/cn";
import { PrintableReport } from "@/components/app/PrintableReport";
import { VerifiedReportView } from "@/components/app/VerifiedReportView";
import { ExcelButton } from "@/components/app/ReportExports";

export default function AIAnalysis() {
  const { id } = useParams<{ id: string }>(); const s = useStore();
  const sum = s.aiSummaries.find((x) => x.tenderId === id);
  const [open, setOpen] = useState(false); const [running, setRunning] = useState(false); const [model, setModel] = useState(s.profile.model as string); const [err, setErr] = useState<string | null>(null); const [depth, setDepth] = useState<"standard" | "deep">("standard"); const prog = s.analysisProgress;
  const docs = s.docs.filter((d) => (d.tenderId ?? "t1") === id);
  const indexed = docs.filter((d) => d.status === "INDEXED" && d.text);
  const autoTriggered = useRef(false);

  const run = async () => { setRunning(true); setErr(null); const e = await s.runTenderAnalysis(id, depth); if (e) setErr(e); setRunning(false); if (!e) setOpen(false); };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("start") === "1" && !sum && !s.analysisBusy && indexed.length > 0 && !autoTriggered.current) {
      autoTriggered.current = true;
      void run();
    }
  }, [sum, s.analysisBusy, indexed.length]);

  const gTone = (g: string) => (g === "GO" ? "green" : g === "NO-GO" ? "red" : g === "CONDITIONAL GO" ? "yellow" : "outline");
  return (
    <>
      <div className="print:hidden">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-display text-xl text-app-text">AI Document Intelligence</h2><p className="text-xs text-app-muted">{sum ? `Generated ${new Date(sum.generatedAt).toLocaleString()} · model ${sum.model} · every finding cites its source and needs human verification` : "No analysis yet. Upload documents, then analyse."}</p></div>
          <div className="flex gap-2">
            {sum && <ExcelButton tenderId={id} />}
            {sum && <Button variant="outline" onClick={() => window.print()}><FileText size={13} /> Download PDF Report</Button>}
            <Button variant="primary" onClick={() => setOpen(true)}><Sparkles size={13} /> {sum ? "Re-analyse documents" : "Analyze Documents"}</Button>
          </div>
        </div>

        {/* Source Documents Chips */}
        {indexed.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded border border-app-border bg-app-panel px-3 py-2 text-xs">
            <span className="font-semibold text-app-muted flex items-center gap-1.5">
              <FileText size={13} className="text-app-accent" />
              Tender Documents ({indexed.length}):
            </span>
            {indexed.map((d) => (
              <span
                key={d.id}
                className="flex items-center gap-1 rounded bg-app-panel-2 px-2 py-0.5 font-mono text-[11px] text-app-text border border-app-border"
              >
                {d.name}
                <span className="text-[10px] text-app-dim">({d.pages || 1} pp)</span>
              </span>
            ))}
          </div>
        )}

        {/* Notice if multiple documents uploaded after previous analysis */}
        {sum && indexed.length > (sum.report?.docs?.length || 1) && (
          <Card className="mb-4 flex flex-wrap items-center justify-between gap-3 border-app-yellow/40 bg-app-yellow/5 p-3 text-xs">
            <div className="flex items-center gap-2 text-app-text">
              <AlertTriangle size={15} className="shrink-0 text-app-yellow" />
              <span>
                You have {indexed.length} documents uploaded. Click <b>Re-analyse documents</b> to update the AI review with all files.
              </span>
            </div>
            <Button size="sm" variant="primary" onClick={run} disabled={running || s.analysisBusy} className="gap-1 text-xs">
              <Sparkles size={11} /> {running || s.analysisBusy ? "Analysing…" : "Re-analyse All Documents"}
            </Button>
          </Card>
        )}
        {err && <Card className="mb-4 border-app-red/40 p-3 text-xs text-app-red">{err}</Card>}
        {s.analysisBusy && <Card className="mb-4 border-app-accent/40 p-4"><div className="flex items-center justify-between text-xs"><span className="text-app-text flex items-center gap-2"><Sparkles size={14} className="animate-spin text-app-accent" />{prog?.msg || "Starting…"}</span><span className="font-mono text-app-dim">{prog?.pct ?? 0}%</span></div><div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-app-panel-2"><div className="h-full bg-app-accent transition-all" style={{ width: `${prog?.pct ?? 0}%` }} /></div><p className="mt-2 text-[11px] text-app-dim">Keep this tab open. The AI reads your tender documents, checks citations and requirements against the master library.</p></Card>}
        {!sum && !s.analysisBusy && (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-app-border-2 bg-app-panel">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-app-accent/10 text-app-accent">
              <Sparkles size={32} />
            </div>
            <h3 className="font-display text-xl text-app-text">
              {indexed.length ? "Ready for AI Document Intelligence" : "No Indexed Documents Found"}
            </h3>
            <p className="mt-2 max-w-lg text-xs leading-relaxed text-app-muted">
              {indexed.length
                ? `${indexed.length} document(s) with ${indexed.reduce((a, d) => a + (d.pages || 0), 0)} pages are indexed. Click below to run AI analysis and extract executive summaries, verified requirements, contract terms, clarifications, and risk logs.`
                : "Upload your ITT, RFP, SOW, or specifications under Documents first so they can be indexed and analyzed."}
            </p>
            {indexed.length > 0 ? (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="primary"
                  onClick={run}
                  disabled={running || s.analysisBusy}
                  className="gap-2 px-6 py-2.5 text-sm font-semibold shadow-lg shadow-app-accent/20"
                >
                  <Sparkles size={16} />
                  {running || s.analysisBusy ? "Starting Analysis…" : "Run Full AI Analysis"}
                </Button>
                <Button variant="outline" onClick={() => setOpen(true)} className="text-xs">
                  Configure Options
                </Button>
              </div>
            ) : (
              <div className="mt-6">
                <Link href="/app/documents">
                  <Button variant="outline" size="sm">
                    Go to Documents
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        )}
        {sum && (
          <div className="space-y-4">
            <Card className="border-app-accent/40 p-4"><div className="flex items-center justify-between"><Label>Bid recommendation (AI — requires Go/No-Go decision)</Label><Badge tone={gTone(sum.recommendation.verdict)}>{sum.recommendation.verdict}</Badge></div><p className="mt-2 text-[13px] leading-relaxed text-app-text">{sum.recommendation.reasoning}</p><p className="mt-2 text-[11px] text-app-dim">This is a recommendation with reasoning, not a decision. Record the decision in Go/No-Go; management may override with a reason.</p></Card>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(sum.sections).filter(([, v]) => v.length).map(([k, v]) => <Card key={k} className={cn("p-4", (k === "Missing Information" || k === "Potential Risks") && "border-app-yellow/30", k === "Questions for Client" && "border-app-blue/30")}><Label className="mb-2">{k}</Label><ul className="space-y-1.5 text-[13px] text-app-text">{v.map((x, i) => <li key={i} className="flex gap-2"><span className="text-app-accent">—</span>{typeof x === "object" ? JSON.stringify(x) : x}</li>)}</ul></Card>)}
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {[["Requirements", s.requirements.filter((r) => r.tenderId === id).length, `${s.requirements.filter((r) => r.tenderId === id && r.status === "Needs Verification").length} to verify`, `/app/tenders/${id}/requirements`], ["Clarifications", s.clarifications.filter((c) => (c.tenderId ?? "t1") === id).length, `${s.clarifications.filter((c) => (c.tenderId ?? "t1") === id && c.pending).length} AI drafts`, "/app/clarifications/register"], ["Contract clauses", s.clauses.filter((c) => (c.tenderId ?? "t1") === id).length, `${s.clauses.filter((c) => (c.tenderId ?? "t1") === id && c.pending).length} pending`, "/app/contract/register"], ["Risks", s.risks.filter((r) => (r.tenderId ?? "t1") === id).length, `${s.risks.filter((r) => (r.tenderId ?? "t1") === id && r.status === "Open").length} open`, "/app/risks/register"]].map(([l, n, sub, href]) => <Link key={String(l)} href={String(href)}><Card className="p-3 hover:border-app-border-2"><Label>{l}</Label><p className="font-display text-2xl text-app-text">{n}</p><p className="text-[11px] text-app-dim">{sub}</p></Card></Link>)}
            </div>
            <div><SectionTitle right={`${sum.contractTerms.length} of ${contractTerms.length} standard terms reviewed`}>Contract / terms analysis</SectionTitle>
              <Card className="divide-y divide-app-border">
                {contractTerms.map((term) => { const f = sum.contractTerms.find((x) => x.term === term); return (
                  <div key={term} className="flex items-start justify-between gap-4 px-4 py-2.5 text-[13px]">
                    <div className="w-44 shrink-0 text-app-muted">{term}</div>
                    <div className="flex-1">{f ? <><p className="text-app-text">{f.finding}</p><p className="mt-0.5 flex items-center gap-1 text-[11px] text-app-dim"><FileText size={10} /> {f.source}</p></> : <p className="text-[11px] italic text-app-dim">Not found in indexed documents — verify manually.</p>}</div>
                    {f && <Badge tone={f.risk === "High" ? "red" : f.risk === "Medium" ? "yellow" : "green"}>{f.risk}</Badge>}
                  </div>
                ); })}
              </Card></div>
            <VerifiedReportView tenderId={id} />
            <Card className="flex items-start gap-3 p-4 text-xs text-app-muted"><AlertTriangle size={14} className="mt-0.5 shrink-0 text-app-yellow" />The system never presents AI assumptions as confirmed facts. Extracted requirements are listed under Requirements with status <em>Needs Verification</em> until a reviewer approves, edits or rejects them. Every run is recorded in Administration → AI Governance.</Card>
          </div>
        )}
        <Modal open={open} onClose={() => setOpen(false)} title="Analyze documents" sub="Extracts general information, requirements with citations, contract terms and a reasoned recommendation.">
          <RunEstimate docs={indexed} model={model} setModel={setModel} />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">{([["standard", "Standard", "≈ 40 key requirements judged against the library · ≈ 6–8 min on the free tier"], ["deep", "Deep", "≈ 120 requirements judged · ≈ 20–25 min on the free tier"]] as const).map(([v, t, d]) => <button key={v} type="button" onClick={() => setDepth(v)} className={cn("rounded border p-3 text-left text-xs", depth === v ? "border-app-accent bg-app-accent/10" : "border-app-border hover:border-app-border-2")}><p className="font-semibold text-app-text">{t}</p><p className="mt-0.5 text-app-muted">{d}</p></button>)}</div>
          <p className="mt-3 text-[11px] text-app-muted">Outputs are written as AI drafts: requirements → Needs Verification, clauses & clarifications → pending review, risks/compliance/deliverables → open. Nothing is marked approved automatically.</p>
          <div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" onClick={run} disabled={running || !indexed.length}><Sparkles size={13} /> {running ? "Analysing… see progress above" : "Run verified analysis"}</Button></div>
        </Modal>
      </div>
      <PrintableReport tenderId={id} />
    </>
  );
}
