"use client";
import { useMemo, useState } from "react";
import { ShieldCheck, ShieldAlert, FileSearch, BookMarked, Brain, CheckCircle2, XCircle, AlertTriangle, ScanText, FileText } from "lucide-react";
import { Card, Badge, Button, Input, Label, SectionTitle, Select } from "@/components/ui";
import { useStore } from "@/store/useStore";
import type { VFinding, VIssue, VRegistryItem } from "@/store/types";
import { cn } from "@/lib/cn";
import { useReportScore } from "@/components/app/ReportExports";

const vTone = (v: VFinding["verdict"]) => (v === "Conforms" ? "green" : v === "Conflicts" ? "red" : v === "Reference only" ? "blue" : "outline");
const sevTone = (v: VIssue["severity"]) => (v === "High" ? "red" : v === "Medium" ? "yellow" : v === "Low" ? "outline" : "blue");
const statusLabel: Record<VRegistryItem["status"], string> = { "verified-in-library": "Verified in library", "not-in-library": "Not in library", "outside-library-scope": "Outside library scope", "project-doc-provided": "Project doc provided", "project-doc-missing": "Project doc missing" };
const statusTone = (v: VRegistryItem["status"]) => (v === "verified-in-library" || v === "project-doc-provided" ? "green" : v === "not-in-library" || v === "project-doc-missing" ? "yellow" : "outline");
const ranges = (p: number[]) => { const s = [...p].sort((a, b) => a - b); const o: string[] = []; let a = s[0], b = s[0]; for (let i = 1; i <= s.length; i++) { if (s[i] === b + 1) { b = s[i]; continue; } o.push(a === b ? `${a}` : `${a}–${b}`); a = b = s[i]; } return o.join(", "); };
const Check = ({ ok, label }: { ok: boolean | null; label: string }) => ok === null ? <span className="text-app-dim" title={`${label}: not applicable`}>–</span> : ok ? <span className="text-app-green" title={`${label}: verified`}>✓</span> : <span className="text-app-red" title={`${label}: FAILED`}>✗</span>;

export function VerifiedReportView({ tenderId }: { tenderId: string }) {
  const s = useStore(); const sum = s.aiSummaries.find((x) => x.tenderId === tenderId); const rep = sum?.report; const sc = useReportScore(tenderId);
  const [filter, setFilter] = useState("all"); const [regFilter, setRegFilter] = useState("all"); const [regQ, setRegQ] = useState(""); const [showAllReg, setShowAllReg] = useState(false);
  const [docFilter, setDocFilter] = useState("all");
  const findings = rep?.findings || [];
  const docList = useMemo(() => Array.from(new Set(findings.map((f) => f.doc).filter(Boolean))), [findings]);
  const shown = useMemo(() => findings.filter((f) => {
    if (docFilter !== "all" && f.doc !== docFilter) return false;
    if (filter === "all") return true;
    if (filter === "review") return f.needsReview;
    if (filter === "pending") return !rep?.approvals[f.id];
    if (filter === "Conflicts") return f.verdict === "Conflicts";
    if (filter === "Conforms") return f.verdict === "Conforms";
    if (filter === "Reference") return f.verdict === "Reference only";
    return f.verdict === "Not covered in library";
  }), [findings, filter, docFilter, rep]);
  const reg = useMemo(() => (rep?.registry || []).filter((r) => (regFilter === "all" || r.status === regFilter) && (!regQ || r.code.toLowerCase().includes(regQ.toLowerCase()) || r.titleInTender.toLowerCase().includes(regQ.toLowerCase()))), [rep, regFilter, regQ]);
  if (!rep) return sum ? <Card className="p-4 text-xs text-app-muted">This analysis was produced by an older version without library verification. Re-analyse the documents to produce the verified report.</Card> : null;
  const approved = Object.values(rep.approvals).filter((a) => a.decision === "Approved").length; const rejected = Object.values(rep.approvals).filter((a) => a.decision === "Rejected").length;
  const c = rep.coverage; const warn = c.unreadablePages.length > 0 || !!rep.library.unavailable || rep.stats.failedChecks > 0 || rep.stats.aiStatementsDropped > 0;

  return (
    <div className="space-y-4">
      {(rep.aiErrors?.length || 0) > 0 && <Card className="border-app-red/50 p-4"><p className="flex items-center gap-2 text-sm font-semibold text-app-red"><ShieldAlert size={14} /> {rep.aiErrors!.length} AI step(s) failed — this report is incomplete</p><ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-app-muted">{rep.aiErrors!.map((e, i) => <li key={i}>{e}</li>)}</ul><p className="mt-2 text-[11px] text-app-dim">Nothing below was invented to fill the gap: affected items are simply absent or marked as not judged. Re-run the analysis when the provider quota resets, or add another API key / model in .env.local.</p></Card>}
      {sc && <Card className="p-4"><div className="flex flex-wrap items-center gap-4"><div className={cn("flex h-20 w-20 flex-col items-center justify-center rounded-full border-4", sc.score >= 70 ? "border-app-green" : sc.score >= 50 ? "border-app-yellow" : "border-app-red")}><span className="font-display text-2xl text-app-text">{sc.score}</span><span className="text-[9px] uppercase text-app-dim">of 100</span></div><div className="min-w-[220px] flex-1"><Label>Report score</Label><p className="font-display text-xl text-app-text">Grade {sc.grade} · {sc.label}</p><p className="text-[11px] text-app-dim">How complete, verified and trustworthy this analysis is. Not the bid&apos;s attractiveness (see Tender Health) — defects found in the tender never lower it.</p></div></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{sc.parts.map((p) => <div key={p.key} title={p.detail}><div className="flex justify-between text-[11px]"><span className="text-app-text">{p.label}</span><span className="font-mono text-app-muted">{Math.round(p.score)} <span className="text-app-dim">×{p.weight}%</span></span></div><div className="mt-1 h-1.5 overflow-hidden rounded bg-app-panel-2"><div className={cn("h-full", p.score >= 70 ? "bg-app-green" : p.score >= 40 ? "bg-app-yellow" : "bg-app-red")} style={{ width: `${Math.round(p.score)}%` }} /></div><p className="mt-1 text-[10px] leading-snug text-app-dim">{p.detail}</p></div>)}</div>
        {sc.limits.length > 0 && <div className="mt-4 border-t border-app-border pt-3"><Label>What limits the score — and how to raise it</Label><ul className="mt-1.5 list-disc space-y-1 pl-5 text-[12px] text-app-muted">{sc.limits.map((l, i) => <li key={i}>{l}</li>)}</ul></div>}</Card>}
      <Card className={cn("p-4", warn ? "border-app-yellow/40" : "border-app-green/30")}>
        <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><ShieldCheck size={15} className="text-app-green" /><Label>Verified compliance report — provenance &amp; coverage</Label></div><Badge tone="outline">{rep.depth === "deep" ? "Deep" : "Standard"} depth</Badge></div>
        <div className="mt-3 grid gap-3 text-[12px] sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-app-dim">Pages read</p><p className="font-display text-xl text-app-text">{c.pagesRead}<span className="text-sm text-app-dim"> / {c.pagesTotal}</span></p>{c.unreadablePages.length > 0 && <p className="text-[11px] text-app-yellow">Unreadable: {ranges(c.unreadablePages)}</p>}{c.ocrRecoveredLines > 0 && <p className="flex items-center gap-1 text-[11px] text-app-dim"><ScanText size={10} /> {c.ocrRecoveredLines} lines recovered by OCR</p>}</div>
          <div><p className="text-app-dim">Requirements (exact quotes)</p><p className="font-display text-xl text-app-text">{c.statements}</p><p className="text-[11px] text-app-dim">{c.judged} judged against the library{c.duplicatesMerged ? ` · ${c.duplicatesMerged} duplicates merged` : ""}</p></div>
          <div><p className="text-app-dim">Saudi Aramco references verified</p><p className="font-display text-xl text-app-text">{c.codesVerified}<span className="text-sm text-app-dim"> / {rep.registry.filter((r) => r.kind.startsWith("aramco")).length}</span></p><p className="text-[11px] text-app-dim">in your library · {c.codesCited} references cited in total</p></div>
          <div><p className="text-app-dim">Library used</p><p className="text-app-text">v{rep.library.version} · {rep.library.rows.toLocaleString()} rows</p><p className="text-[11px] text-app-dim">{rep.library.codedStandards} coded standards{rep.library.indexedAt ? ` · indexed ${new Date(rep.library.indexedAt).toLocaleDateString()}` : ""}</p></div>
        </div>
        <p className="mt-3 text-[11px] text-app-dim">Model {rep.model} · prompt {rep.promptVersion} · {rep.stats.aiCalls} AI calls in {rep.stats.seconds}s · generated {new Date(rep.generatedAt).toLocaleString()} · AI-assisted, human-verified: nothing below counts until a reviewer approves it.</p>
        {(rep.stats.aiStatementsDropped > 0 || rep.stats.failedChecks > 0) && <p className="mt-1 flex items-start gap-1.5 text-[11px] text-app-yellow"><AlertTriangle size={11} className="mt-0.5 shrink-0" />The verification layer rejected {rep.stats.aiStatementsDropped} AI statement(s) whose quotation was not found in the source and downgraded {rep.stats.failedChecks} AI judgement(s) whose rule citation could not be confirmed — that is the checks working, not an error.</p>}
        {rep.library.unavailable && <p className="mt-1 flex items-start gap-1.5 text-[11px] text-app-red"><ShieldAlert size={11} className="mt-0.5 shrink-0" />Library unavailable: {rep.library.unavailable}. No standard could be verified in this run.</p>}
      </Card>

      <div>
        <SectionTitle right={<span className="text-[11px] text-app-dim">{approved} approved · {rejected} rejected · {findings.length - approved - rejected} pending</span>}>Library-checked findings</SectionTitle>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          {docList.length > 1 && (
            <Select value={docFilter} onChange={(e) => setDocFilter(e.target.value)} className="py-1 text-xs font-medium">
              <option value="all">All documents ({findings.length})</option>
              {docList.map((d) => (
                <option key={d} value={d}>
                  {d} ({findings.filter((f) => f.doc === d).length})
                </option>
              ))}
            </Select>
          )}
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="py-1 text-xs"><option value="all">All verdicts ({findings.length})</option><option value="review">Needs review ({findings.filter((f) => f.needsReview).length})</option><option value="pending">Pending approval</option><option value="Conflicts">Conflicts ({rep.stats.conflicts})</option><option value="Conforms">Conforms ({rep.stats.conforms})</option><option value="Reference">Reference only ({rep.stats.referenceOnly || 0})</option><option value="Not covered">Not covered in library ({rep.stats.notCovered})</option></Select>
          <span className="text-app-dim">Verdicts come only from the retrieved library text. “Reference only” = the tender just cites the standard; “Not covered” = no rule in your library addresses the requirement.</span>
        </div>
        <Card className="divide-y divide-app-border">
          {shown.length === 0 && <p className="p-4 text-xs text-app-dim">No findings match this filter.</p>}
          {shown.map((f) => { const ap = rep.approvals[f.id]; return (
            <div key={f.id} className="grid gap-3 px-4 py-3 text-[13px] lg:grid-cols-[1fr_1fr_auto]">
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge tone={vTone(f.verdict)}>{f.verdict}</Badge>
                  {f.doc && (
                    <span title={f.doc}>
                      <Badge tone="outline" className="text-[10px] text-app-accent flex items-center gap-1 max-w-[200px] truncate">
                        <FileText size={10} /> {f.doc}
                      </Badge>
                    </span>
                  )}
                  <span className="font-mono text-[11px] text-app-dim">p.{f.page} · §{f.section} · {f.category}</span>
                  {f.ocr && <Badge tone="yellow">OCR</Badge>}
                </div>
                <p className="text-app-text">“{f.quote.length > 320 ? f.quote.slice(0, 320) + "…" : f.quote}”</p>
              </div>
              <div>
                {f.standardName ? <><p className="text-[11px] font-semibold text-app-accent">{f.standardName}</p><p className="mt-0.5 text-[12px] italic text-app-muted">“{f.ruleQuote}”</p></> : null}
                <p className="mt-1 text-[12px] text-app-text">{f.reasoning}</p>
                {f.knowledge && <p className="mt-1.5 rounded border border-dashed border-app-border px-2 py-1 text-[11px] text-app-muted"><Brain size={10} className="mr-1 inline" /><b>AI knowledge (unverified):</b> {f.knowledge}</p>}
                {f.note && <p className="mt-1 text-[11px] text-app-yellow">{f.note}</p>}
                <p className="mt-1 flex flex-wrap gap-x-3 text-[10px] text-app-dim">Confidence {f.confidence} · quote <Check ok={f.checks.quote} label="Quote exists in source" /> · rule text <Check ok={f.checks.ruleQuote} label="Rule quotation exists in rule" /> · rule id <Check ok={f.checks.ruleExists} label="Rule exists in database" /> · active revision <Check ok={f.checks.ruleActive} label="Rule is the active revision" /></p>
              </div>
              <div className="flex flex-col items-start gap-1 lg:items-end">
                {ap ? <><Badge tone={ap.decision === "Approved" ? "green" : "red"}>{ap.decision}</Badge><p className="text-[10px] text-app-dim">{ap.by} · {new Date(ap.at).toLocaleDateString()}</p><button className="text-[10px] text-app-dim underline" onClick={() => s.reviewFinding(tenderId, f.id, null)}>undo</button></>
                  : <div className="flex gap-1.5"><Button size="sm" variant="outline" onClick={() => s.reviewFinding(tenderId, f.id, "Approved")}><CheckCircle2 size={11} /> Approve</Button><Button size="sm" variant="outline" onClick={() => s.reviewFinding(tenderId, f.id, "Rejected")}><XCircle size={11} /> Reject</Button></div>}
                {f.needsReview && !ap && <p className="text-[10px] text-app-yellow">needs review</p>}
              </div>
            </div>
          ); })}
        </Card>
        {findings.length < c.statements && <p className="mt-1.5 text-[11px] text-app-dim">{findings.length} of {c.statements} requirements were judged against the library (selected by relevance — {rep.depth === "standard" ? "run Deep depth to judge more" : "deep depth"}). All {c.statements} are listed with exact quotes under Requirements.</p>}
      </div>

      <div>
        <SectionTitle right={<span className="text-[11px] text-app-dim">{rep.issues.length} finding(s) · found by code, no AI</span>}>Consistency &amp; coverage findings</SectionTitle>
        <Card className="divide-y divide-app-border">
          {rep.issues.length === 0 && <p className="p-4 text-xs text-app-dim">No internal inconsistencies detected.</p>}
          {[...rep.issues].sort((a, b) => ["High", "Medium", "Low", "Info"].indexOf(a.severity) - ["High", "Medium", "Low", "Info"].indexOf(b.severity)).map((i) => (
            <details key={i.id} className="group px-4 py-2.5 text-[13px]"><summary className="flex cursor-pointer list-none items-start gap-2"><Badge tone={sevTone(i.severity)}>{i.severity}</Badge><span className="flex-1 text-app-text">{i.title}{i.pages.length > 0 && <span className="ml-2 font-mono text-[11px] text-app-dim">p.{ranges(i.pages.slice(0, 40))}</span>}</span></summary>
              <p className="mt-1.5 pl-1 text-[12px] text-app-muted">{i.detail}</p>
              {i.items && i.items.length > 0 && <ul className="mt-1.5 max-h-48 list-disc space-y-0.5 overflow-auto pl-5 text-[11px] text-app-dim">{i.items.slice(0, 80).map((x, k) => <li key={k}>{x}</li>)}{i.items.length > 80 && <li>… {i.items.length - 80} more</li>}</ul>}
            </details>
          ))}
        </Card>
      </div>

      <div>
        <SectionTitle right={<span className="text-[11px] text-app-dim">{rep.registry.length} references</span>}><span className="flex items-center gap-2"><BookMarked size={13} /> Standards register — every cited reference checked against the library</span></SectionTitle>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <Select value={regFilter} onChange={(e) => setRegFilter(e.target.value)} className="py-1 text-xs"><option value="all">All statuses</option>{(Object.keys(statusLabel) as VRegistryItem["status"][]).map((k) => <option key={k} value={k}>{statusLabel[k]} ({rep.registry.filter((r) => r.status === k).length})</option>)}</Select>
          <Input className="w-48 py-1 text-xs" placeholder="Search code or title…" value={regQ} onChange={(e) => setRegQ(e.target.value)} />
        </div>
        <Card className="overflow-hidden">
          <table className="w-full text-left text-xs"><thead className="bg-app-panel-2 text-[10px] uppercase tracking-wider text-app-dim"><tr><th className="px-3 py-2">Reference</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Library file (active revision)</th><th className="px-3 py-2">Cited on</th><th className="px-3 py-2">Title in tender</th></tr></thead>
            <tbody className="divide-y divide-app-border">{(showAllReg ? reg : reg.slice(0, 60)).map((r) => (
              <tr key={r.code}><td className="px-3 py-1.5 font-mono text-app-text">{r.code}</td><td className="px-3 py-1.5"><Badge tone={statusTone(r.status)}>{statusLabel[r.status]}</Badge></td><td className="px-3 py-1.5 text-app-muted">{r.libraryName || "—"}{r.revisions.length > 1 ? <span className="ml-1 text-[10px] text-app-dim">({r.revisions.length} revisions)</span> : null}</td><td className="px-3 py-1.5 font-mono text-[11px] text-app-dim">p.{ranges(r.citations.map((x) => x.page))}{r.listedInSection6 ? "" : " · not in §6"}</td><td className="px-3 py-1.5 text-app-dim">{r.titleInTender || "—"}</td></tr>
            ))}</tbody></table>
          {reg.length > 60 && <button className="w-full border-t border-app-border py-2 text-[11px] text-app-accent" onClick={() => setShowAllReg(!showAllReg)}>{showAllReg ? "Show fewer" : `Show all ${reg.length}`}</button>}
        </Card>
      </div>

      <div>
        <SectionTitle><span className="flex items-center gap-2"><Brain size={13} /> AI knowledge of standards &amp; laws — unverified leads</span></SectionTitle>
        <Card className="border-dashed p-4">
          <p className="flex items-start gap-1.5 text-[11px] text-app-yellow"><AlertTriangle size={11} className="mt-0.5 shrink-0" />{rep.knowledge.disclaimer}</p>
          {rep.knowledge.editions.length > 0 && <div className="mt-3"><Label>Edition currency of cited standards</Label><ul className="mt-1.5 space-y-1 text-[12px]">{rep.knowledge.editions.map((e, i) => <li key={i} className="flex gap-2"><Badge tone={e.status === "Superseded" ? "red" : e.status === "Current" ? "green" : "outline"}>{e.status}</Badge><span className="text-app-text"><b>{e.code}</b> (cited: {e.cited}) — {e.note}</span></li>)}</ul></div>}
          {rep.knowledge.omitted.length > 0 && <div className="mt-3"><Label>Standards / laws that normally apply but are not cited in the tender</Label><ul className="mt-1.5 space-y-1.5 text-[12px]">{rep.knowledge.omitted.map((o, i) => <li key={i} className="text-app-text"><span className="flex flex-wrap items-center gap-2"><b>{o.name}</b>{o.code && <span className="font-mono text-[11px] text-app-dim">{o.code}</span>}<Badge tone="outline">{o.jurisdiction}</Badge>{o.libraryVerified ? <Badge tone="green">exists in library: {o.libraryName}</Badge> : <Badge tone="yellow">not verified</Badge>}</span><span className="block text-app-muted">{o.reason}</span>{o.libraryRule && <span className="block text-[11px] italic text-app-dim">Library text: “{o.libraryRule.slice(0, 220)}…”</span>}</li>)}</ul></div>}
          {rep.knowledge.editions.length === 0 && rep.knowledge.omitted.length === 0 && <p className="mt-2 text-xs text-app-dim">The AI returned no knowledge-based notes for this run.</p>}
        </Card>
      </div>

      <Card className="p-4 text-[11px] leading-relaxed text-app-muted"><p className="mb-1 flex items-center gap-1.5 font-semibold text-app-text"><FileSearch size={12} /> How this report was made</p>
        1) The document is split into pages and numbered clauses (code). 2) Every “shall/must” sentence is extracted with its exact quote, page and clause (code). 3) For each key requirement the library is searched (vector + keyword + direct citation) and the top rules are retrieved; superseded revisions and project documents are excluded. 4) The AI judges each requirement using only those rules and must quote the rule. 5) Code re-checks every quote against the source page, every rule against the database and its revision status; failures are downgraded or dropped. 6) Findings wait for a human to approve or reject them. 7) This report is assembled from those verified records, stamped with the library version, model and prompt version.</Card>
    </div>
  );
}
