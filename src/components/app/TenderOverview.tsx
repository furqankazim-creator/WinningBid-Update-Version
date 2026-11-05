"use client";
import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, CircleDashed, FileText, Flag, ListChecks, Scale, ShieldCheck, Sparkles, ClipboardCheck, Coins, PenLine, Layers, BookMarked } from "lucide-react";
import { Card, Badge, Label, SectionTitle, ProgressBar } from "@/components/ui";
import { Donut, BarChart, Kpi, money } from "@/components/app/charts";
import { useStore, tenderHealth, dueLabel, daysLeft, scoped } from "@/store/useStore";
import { useReportScore } from "@/components/app/ReportExports";
import { cn } from "@/lib/cn";
import type { TenderStage } from "@/store/types";

import { deriveAttention, type Sev } from "@/lib/attention";
const SEV: Record<Sev, { dot: string; label: string; tone: "red" | "yellow" | "blue" }> = { high: { dot: "bg-app-red", label: "Critical", tone: "red" }, medium: { dot: "bg-app-yellow", label: "Important", tone: "yellow" }, low: { dot: "bg-app-blue", label: "Suggested", tone: "blue" } };
const LIFECYCLE: TenderStage[] = ["Analysis", "Qualification", "Go/No-Go", "Bid Preparation", "Review", "Approval", "Submitted", "Awarded"];
const tone = (v: number) => (v >= 70 ? "green" : v >= 40 ? "yellow" : "red") as "green" | "yellow" | "red";

export function TenderOverview({ tenderId }: { tenderId: string }) {
  const s = useStore(); const score = useReportScore(tenderId); const [all, setAll] = useState(false);
  const t = s.tenders.find((x) => x.id === tenderId); if (!t) return null;
  const w = (p: string) => `/app/tenders/${tenderId}${p}`;
  const sum = s.aiSummaries.find((a) => a.tenderId === tenderId); const rep = sum?.report;
  const docs = scoped(s.docs, tenderId); const indexed = docs.filter((d) => d.status === "INDEXED" && d.text);
  const reqs = s.requirements.filter((r) => r.tenderId === tenderId); const reqReviewed = reqs.filter((r) => r.status !== "Needs Verification").length;
  const comp = s.complianceItems.filter((c) => c.tenderId === tenderId);
  const risks = scoped(s.risks, tenderId).filter((r) => r.kind === "Risk"); const hiRisks = risks.filter((r) => r.status === "Open" && r.probability * r.impact >= 10);
  const clar = scoped(s.clarifications, tenderId); const dels = scoped(s.deliverables, tenderId);
  const tech = s.proposalSections.filter((p) => p.tenderId === tenderId && p.kind === "technical"); const comm = s.proposalSections.filter((p) => p.tenderId === tenderId && p.kind === "commercial");
  const pv = s.priceVersions.filter((p) => p.tenderId === tenderId); const locked = pv.find((p) => p.locked);
  const revs = s.reviews.filter((r) => r.tenderId === tenderId); const pendingApprovals = s.approvals.filter((a) => a.tenderId === tenderId && a.status === "Pending");
  const h = tenderHealth(s, tenderId); const days = t.closing ? daysLeft(t.closing) : null; const overdue = !!t.closing && new Date(t.closing).getTime() < Date.now() - 86400000;
  const pages = docs.reduce((a, d) => a + (d.pages || 0), 0);
  const aramcoRefs = rep ? rep.registry.filter((r) => r.kind.startsWith("aramco")).length : 0; // only these can exist in the library; international codes and project drawings cannot

  // ---- what needs attention: derived from real records (shared with the Action Board)
  const att = deriveAttention(s, tenderId);
  const shown = all ? att : att.slice(0, 5);

  // ---- progress by workstream (real counts)
  const stream = (label: string, icon: React.ReactNode, value: number, detail: string, href: string, na = false) => ({ label, icon, value, detail, href, na });
  const judged = rep ? rep.findings.filter((f) => f.verdict === "Conforms" || f.verdict === "Conflicts") : [];
  const streams = [
    stream("Documents", <FileText size={13} />, rep ? Math.round((rep.coverage.pagesRead / Math.max(1, rep.coverage.pagesTotal)) * 100) : docs.length ? Math.round((indexed.length / docs.length) * 100) : 0, docs.length ? `${indexed.length} of ${docs.length} indexed · ${pages} pages${rep ? ` · ${rep.coverage.pagesRead} read` : ""}` : "none uploaded", "/app/documents"),
    stream("Requirements", <ListChecks size={13} />, reqs.length ? Math.round((reqReviewed / reqs.length) * 100) : 0, reqs.length ? `${reqReviewed} of ${reqs.length} verified by a reviewer` : "not extracted yet", w("/requirements")),
    stream("Compliance", <ShieldCheck size={13} />, comp.length ? Math.round((comp.filter((c) => c.status === "Compliant").length / comp.length) * 100) : 0, comp.length ? `${comp.filter((c) => c.status === "Compliant").length} of ${comp.length} compliant` : "no items", w("/compliance")),
    stream("Library check", <BookMarked size={13} />, judged.length ? Math.round((judged.filter((f) => f.verdict === "Conforms").length / judged.length) * 100) : 0, judged.length ? `${judged.filter((f) => f.verdict === "Conforms").length} conform · ${judged.filter((f) => f.verdict === "Conflicts").length} conflict` : "nothing judged yet", w("/ai-analysis"), !judged.length),
    stream("Technical proposal", <PenLine size={13} />, tech.length ? Math.round((tech.filter((p) => p.status !== "AI Draft").length / tech.length) * 100) : 0, tech.length ? `${tech.filter((p) => p.status === "Approved").length} approved · ${tech.filter((p) => p.status !== "AI Draft").length}/${tech.length} past draft` : "not started", w("/technical")),
    stream("Commercial proposal", <Layers size={13} />, comm.length ? Math.round((comm.filter((p) => p.status !== "AI Draft").length / comm.length) * 100) : 0, comm.length ? `${comm.filter((p) => p.status === "Approved").length} approved · ${comm.filter((p) => p.status !== "AI Draft").length}/${comm.length} past draft` : "not started", w("/commercial")),
    stream("Pricing", <Coins size={13} />, locked ? 100 : pv.length ? 60 : 0, locked ? `v${locked.version} locked · ${money(locked.price, t.currency)}` : pv.length ? `draft v${pv[pv.length - 1].version} · ${money(pv[pv.length - 1].price, t.currency)}` : "no price version", w("/pricing")),
    stream("Reviews", <ClipboardCheck size={13} />, Math.round((revs.filter((r) => r.status === "Approved").length / Math.max(revs.length, 7)) * 100), `${revs.filter((r) => r.status === "Approved").length} of ${Math.max(revs.length, 7)} stages approved`, w("/reviews")),
  ];

  // ---- lifecycle
  const cur = LIFECYCLE.indexOf((["Rejected", "Under Evaluation", "Clarification", "Negotiation"].includes(t.stage) ? "Submitted" : t.stage) as TenderStage);
  const byCat = Object.entries(reqs.reduce<Record<string, number>>((a, r) => { a[r.category] = (a[r.category] || 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label, value }));
  const verdictData = rep ? [{ label: "Conforms", value: rep.stats.conforms }, { label: "Conflicts", value: rep.stats.conflicts }, { label: "Reference only", value: rep.stats.referenceOnly || 0 }, { label: "Not covered", value: rep.stats.notCovered }].filter((d) => d.value > 0) : [];
  const topIssues = (rep?.issues || []).filter((i) => i.severity === "High" || i.severity === "Medium").sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "High" ? -1 : 1)).slice(0, 5);
  const gTone = t.goNoGo === "GO" ? "green" : t.goNoGo === "NO-GO" ? "red" : t.goNoGo === "CONDITIONAL GO" ? "yellow" : "outline";
  const highlights = [...(sum?.sections["Executive Summary"] || []), ...(sum?.sections["Scope Summary"] || [])].slice(0, 4);
  const dates = sum?.sections["Important Dates"] || [];

  return (
    <div className="space-y-5">
      {/* lifecycle */}
      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><Label>Bid lifecycle</Label><span className="text-[11px] text-app-dim">Stage: <b className="text-app-text">{t.stage}</b>{t.stage === "Rejected" ? " — tender lost" : t.stage === "Awarded" ? " — tender won" : ""}</span></div>
        <ol className="flex items-start">{LIFECYCLE.map((st, i) => { const done = i < cur, now = i === cur; return (
          <li key={st} className="flex min-w-0 flex-1 flex-col items-center text-center"><div className="flex w-full items-center">
            <span className={cn("h-px flex-1", i === 0 ? "opacity-0" : done || now ? "bg-app-green/60" : "bg-app-border")} />
            <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px]", done ? "border-app-green bg-app-green/15 text-app-green" : now ? "border-app-accent bg-app-accent/20 text-app-accent ring-4 ring-app-accent/10" : "border-app-border text-app-dim")}>{done ? <CheckCircle2 size={13} /> : i + 1}</span>
            <span className={cn("h-px flex-1", i === LIFECYCLE.length - 1 ? "opacity-0" : done ? "bg-app-green/60" : "bg-app-border")} /></div>
            <span className={cn("mt-1.5 px-0.5 text-[10px] leading-tight", now ? "font-semibold text-app-text" : done ? "text-app-muted" : "text-app-dim")}>{st}</span></li>); })}</ol>
      </Card>

      {/* headline KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <Kpi label="Estimated value" value={t.value ? money(t.value, t.currency) : "Not set"} sub={`${t.tenderType} · ${t.region}`} tone={t.value ? undefined : "yellow"} />
        <Kpi label="Documents" value={docs.length} sub={docs.length ? `${pages} pages · ${indexed.length} indexed${rep?.coverage.unreadablePages.length ? ` · ${rep.coverage.unreadablePages.length} unreadable` : ""}` : "none uploaded"} tone={docs.length ? undefined : "red"} />
        <Kpi label="Requirements" value={reqs.length} sub={`${reqReviewed} verified · ${reqs.filter((r) => r.priority === "Must").length} mandatory`} />
        <Kpi label="Standards verified" value={rep ? `${rep.coverage.codesVerified}/${aramcoRefs}` : "—"} sub={rep ? `Saudi Aramco references in your library · ${rep.coverage.codesCited} refs cited in total` : "run the analysis"} tone={rep ? (rep.coverage.codesVerified / Math.max(1, aramcoRefs) >= 0.7 ? "green" : "yellow") : undefined} />
        <Kpi label="Report score" value={score ? `${score.score}` : "—"} sub={score ? `Grade ${score.grade} · ${score.label}` : "no analysis yet"} tone={score ? tone(score.score) === "green" ? "green" : tone(score.score) === "yellow" ? "yellow" : "red" : undefined} />
        <Kpi label="Clarifications" value={clar.length} sub={`${clar.filter((c) => c.pending || c.status === "Draft").length} still in draft · ${dels.length} deliverables`} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        {/* attention */}
        <div>
          <SectionTitle right={<span className="text-[11px] text-app-dim">{att.filter((a) => a.sev === "high").length} critical · {att.length} total</span>}>Needs attention</SectionTitle>
          <Card className="divide-y divide-app-border">
            {att.length === 0 && <div className="flex items-center gap-3 p-5 text-[13px] text-app-muted"><CheckCircle2 size={18} className="text-app-green" /> Nothing needs attention right now — every tracked item is on track.</div>}
            {shown.map((a, i) => (
              <Link key={i} href={a.href} className="group flex items-start gap-3 px-4 py-3 hover:bg-app-panel-2">
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", SEV[a.sev].dot)} />
                <div className="min-w-0 flex-1"><p className="flex flex-wrap items-center gap-2 text-[13px] text-app-text">{a.title}<Badge tone={SEV[a.sev].tone}>{SEV[a.sev].label}</Badge></p><p className="mt-0.5 text-[12px] leading-snug text-app-muted">{a.detail}</p></div>
                <span className="mt-0.5 flex shrink-0 items-center gap-1 text-[11px] text-app-accent opacity-80 group-hover:opacity-100">{a.cta} <ArrowRight size={11} /></span>
              </Link>))}
            {att.length > 5 && <button className="w-full py-2 text-[11px] text-app-accent hover:bg-app-panel-2" onClick={() => setAll(!all)}>{all ? "Show fewer" : `Show all ${att.length}`}</button>}
          </Card>
        </div>

        {/* recommendation */}
        <div>
          <SectionTitle>Bid recommendation</SectionTitle>
          <Card className="space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-2"><Scale size={14} className="text-app-muted" /><span className="text-[11px] text-app-dim">Management decision</span><Badge tone={gTone}>{t.goNoGo}</Badge>{sum && <><span className="text-[11px] text-app-dim">· AI suggests</span><Badge tone={sum.recommendation.verdict === "GO" ? "green" : sum.recommendation.verdict === "NO-GO" ? "red" : sum.recommendation.verdict === "CONDITIONAL GO" ? "yellow" : "outline"}>{sum.recommendation.verdict === "Pending" ? "not produced" : sum.recommendation.verdict}</Badge></>}</div>
            {sum ? <p className="text-[12.5px] leading-relaxed text-app-text">{sum.recommendation.reasoning}</p> : <p className="text-[12.5px] text-app-muted">No AI recommendation yet. Run the document analysis, then score the Go/No-Go criteria.</p>}
            {t.goNoGoReason && <p className="border-t border-app-border pt-2 text-[11px] text-app-dim">Decision note: {t.goNoGoReason}</p>}
            <p className="text-[10px] text-app-dim">The AI recommendation is advisory. The Go/No-Go decision is recorded by management.</p>
            <Link href={w("/go-no-go")} className="inline-flex items-center gap-1 text-[11px] text-app-accent hover:underline">Open Go / No-Go <ArrowRight size={11} /></Link>
          </Card>
        </div>
      </div>

      {/* workstreams */}
      <div>
        <SectionTitle right={<span className="text-[11px] text-app-dim">counts come from your records, not estimates</span>}>Progress by workstream</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {streams.map((x) => (
            <Link key={x.label} href={x.href}><Card className="group h-full p-4 transition-colors hover:border-app-border-2">
              <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-[12px] text-app-text"><span className="text-app-muted">{x.icon}</span>{x.label}</span><span className="font-mono text-[11px] text-app-muted">{x.na ? "n/a" : `${x.value}%`}</span></div>
              <ProgressBar value={x.na ? 0 : x.value} tone={tone(x.value)} className="mt-2" />
              <p className="mt-2 flex items-center justify-between text-[11px] leading-snug text-app-dim"><span>{x.detail}</span><ArrowRight size={11} className="shrink-0 opacity-0 group-hover:opacity-100" /></p>
            </Card></Link>))}
        </div>
      </div>

      {/* analysis snapshot */}
      {rep ? (
        <div className="space-y-4">
          <SectionTitle right={<Link href={w("/ai-analysis")} className="flex items-center gap-1 text-[11px] text-app-accent hover:underline">Full analysis <ArrowRight size={11} /></Link>}>Analysis snapshot</SectionTitle>
          <div className="grid gap-4 lg:grid-cols-3">
            {verdictData.length > 0 ? <Donut title="Library check of key requirements" data={verdictData} center={`${rep.coverage.judged}`} sub="judged" /> : <Card className="p-4 text-xs text-app-dim">No requirement was judged against the library.</Card>}
            <BarChart title="Requirements by category" data={byCat} />
            <Card className="p-4"><Label className="mb-2">Coverage &amp; provenance</Label>
              <dl className="space-y-1.5 text-[12px]">
                {([["Pages read", `${rep.coverage.pagesRead} of ${rep.coverage.pagesTotal}`], ["Requirements extracted", `${rep.coverage.statements} (exact quotes)`], ["Aramco refs verified", `${rep.coverage.codesVerified} of ${aramcoRefs} (${rep.coverage.codesCited} refs in total)`], ["OCR-recovered lines", String(rep.coverage.ocrRecoveredLines)], ["Library", `v${rep.library.version} · ${rep.library.rows.toLocaleString()} rows`], ["Model", rep.model.replace("groq:", "")], ["Analysed", new Date(rep.generatedAt).toLocaleDateString()]] as const).map(([k, v]) => <div key={k} className="flex justify-between gap-3 border-b border-app-border/60 pb-1"><dt className="text-app-dim">{k}</dt><dd className="text-right text-app-text">{v}</dd></div>)}
              </dl></Card>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-4"><Label className="mb-2 flex items-center gap-1.5"><Flag size={11} /> Critical findings</Label>
              {topIssues.length === 0 ? <p className="text-xs text-app-dim">No high or medium findings.</p> : <ul className="space-y-2">{topIssues.map((i) => <li key={i.id} className="flex items-start gap-2 text-[12.5px]"><AlertTriangle size={13} className={cn("mt-0.5 shrink-0", i.severity === "High" ? "text-app-red" : "text-app-yellow")} /><span className="text-app-text">{i.title}{i.pages.length > 0 && <span className="ml-1.5 font-mono text-[10px] text-app-dim">p.{i.pages.slice(0, 5).join(", ")}</span>}</span></li>)}</ul>}</Card>
            <Card className="p-4"><Label className="mb-2 flex items-center gap-1.5"><Sparkles size={11} /> Scope &amp; key facts</Label>
              {highlights.length ? <ul className="space-y-1.5 text-[12.5px] text-app-text">{highlights.map((x, i) => <li key={i} className="flex gap-2"><span className="text-app-accent">•</span>{x}</li>)}</ul> : <p className="text-xs text-app-dim">No summary was produced (see the AI Analysis tab).</p>}
              {dates.length > 0 && <div className="mt-3 border-t border-app-border pt-2"><p className="mb-1 text-[10px] uppercase tracking-wide text-app-dim">Important dates</p><ul className="space-y-1 text-[12px] text-app-muted">{dates.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}</Card>
          </div>
        </div>
      ) : sum ? (
        <div className="space-y-3">
          <SectionTitle right={<Link href={w("/ai-analysis")} className="flex items-center gap-1 text-[11px] text-app-accent hover:underline">AI analysis <ArrowRight size={11} /></Link>}>Analysis highlights</SectionTitle>
          <Card className="p-4"><Label className="mb-2 flex items-center gap-1.5"><Sparkles size={11} /> Scope &amp; key facts</Label>
            {highlights.length ? <ul className="space-y-1.5 text-[12.5px] text-app-text">{highlights.map((x, i) => <li key={i} className="flex gap-2"><span className="text-app-accent">•</span>{x}</li>)}</ul> : <p className="text-xs text-app-dim">No summary bullets were produced.</p>}
            {dates.length > 0 && <div className="mt-3 border-t border-app-border pt-2"><p className="mb-1 text-[10px] uppercase tracking-wide text-app-dim">Important dates</p><ul className="space-y-1 text-[12px] text-app-muted">{dates.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
            <p className="mt-3 text-[11px] text-app-dim">This summary comes from an earlier analysis without library verification. Re-run the analysis to add coverage, library conformance and the report score here.</p></Card>
        </div>
      ) : docs.length > 0 && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-dashed p-5"><div className="flex items-center gap-3"><CircleDashed size={20} className="text-app-muted" /><div><p className="text-[13px] text-app-text">No analysis snapshot yet</p><p className="text-xs text-app-muted">Run the verified analysis to see coverage, library conformance, critical findings and key facts here.</p></div></div><Link href={w("/ai-analysis")} className="rounded-sm bg-app-accent px-3 py-1.5 text-xs text-white hover:opacity-90">Run analysis</Link></Card>
      )}
    </div>
  );
}
