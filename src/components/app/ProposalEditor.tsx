"use client";
import { useState } from "react";
import { Sparkles, Plus, Trash2, Send, Check, GripVertical } from "lucide-react";
import { Card, Badge, Button, Input, Textarea, Select, PageHeader, Label } from "@/components/ui";
import { useStore } from "@/store/useStore";
import type { ProposalSection } from "@/store/types";
import { cn } from "@/lib/cn";

const tone = (st: ProposalSection["status"]) => st === "Approved" ? "green" : st === "In Review" ? "purple" : st === "AI Draft" ? "accent" : "outline";

export function ProposalEditor({ tenderId, kind, templateSections, title }: { tenderId: string; kind: "technical" | "commercial"; templateSections: string[]; title: string }) {
  const s = useStore();
  const secs = s.proposalSections.filter((p) => p.tenderId === tenderId && p.kind === kind).sort((a, b) => a.order - b.order);
  const [sel, setSel] = useState<string | null>(secs[0]?.id || null); const [newTitle, setNewTitle] = useState(""); const [drafting, setDrafting] = useState(false); const [err, setErr] = useState<string | null>(null);
  const cur = secs.find((x) => x.id === sel) || secs[0];
  const missing = templateSections.filter((t) => !secs.some((x) => x.title === t));
  const approvedPct = secs.length ? Math.round((secs.filter((x) => x.status === "Approved").length / secs.length) * 100) : 0;
  const exportDoc = () => { const html = `<html><head><meta charset="utf-8"></head><body style="font-family:Georgia">${secs.map((x) => `<h2>${x.title}</h2><p>${x.body.replace(/\n/g, "<br/>")}</p>`).join("")}</body></html>`; const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([html], { type: "application/msword" })); a.download = `${title}.doc`; a.click(); };
  return (
    <div>
      <PageHeader title={title} sub={`${secs.length} sections · ${approvedPct}% approved · workflow: AI Draft → Human Edit → Review → Approval`} right={<><Button variant="outline" onClick={async () => { setDrafting(true); setErr(await s.draftProposal(tenderId, kind, missing.length ? missing : templateSections)); setDrafting(false); }} disabled={drafting}><Sparkles size={13} /> {drafting ? "Drafting… (20–60 s)" : missing.length ? `AI draft ${missing.length} missing sections` : "All sections drafted"}</Button><Button variant="outline" onClick={exportDoc}>Export DOCX</Button><Button variant="primary" onClick={() => { secs.filter((x) => x.status === "Human Edited").forEach((x) => s.updateProposalSection(x.id, { status: "In Review" })); s.addReview({ tenderId, stage: kind === "technical" ? "Technical Review" : "Commercial Review", reviewer: s.users.find((u) => u.role === (kind === "technical" ? "Technical Manager" : "Commercial Manager"))?.name || "", status: "Pending", comment: `${title} submitted for review` }); }}><Send size={13} /> Send to review</Button></>} />
      {err && <p className="mb-3 rounded border border-app-red/40 bg-app-red/10 px-3 py-2 text-xs text-app-red">{err}</p>}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div>
          <Card className="divide-y divide-app-border">
            {secs.map((x) => <button key={x.id} onClick={() => setSel(x.id)} className={cn("flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] hover:bg-app-panel-2", cur?.id === x.id && "bg-app-panel-2")}><GripVertical size={12} className="text-app-dim" /><span className="flex-1 truncate text-app-text">{x.title}</span><Badge tone={tone(x.status)}>{x.status}</Badge></button>)}
            {secs.length === 0 && <p className="p-4 text-xs text-app-dim">No sections yet. Use AI draft or add one.</p>}
          </Card>
          <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (newTitle) s.addProposalSection({ tenderId, kind, title: newTitle, body: "", status: "Human Edited" }); setNewTitle(""); }}><Select className="flex-1" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}><option value="">Add section…</option>{missing.map((m) => <option key={m}>{m}</option>)}<option value="Custom section">Custom section</option></Select><Button variant="outline"><Plus size={12} /></Button></form>
        </div>
        {cur ? (
          <Card className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><Input className="flex-1 border-0 bg-transparent font-display text-lg" value={cur.title} onChange={(e) => s.updateProposalSection(cur.id, { title: e.target.value, status: cur.status })} /><div className="flex items-center gap-2"><Badge tone={tone(cur.status)}>{cur.status}</Badge><Select className="py-1 text-xs" value={cur.status} onChange={(e) => s.updateProposalSection(cur.id, { status: e.target.value as ProposalSection["status"] })}>{["AI Draft", "Human Edited", "In Review", "Approved"].map((x) => <option key={x}>{x}</option>)}</Select><button onClick={() => { s.deleteProposalSection(cur.id); setSel(null); }} className="text-app-dim hover:text-app-red"><Trash2 size={13} /></button></div></div>
            {cur.status === "AI Draft" && <p className="mt-2 rounded border border-app-accent/30 bg-app-accent/5 px-3 py-2 text-[11px] text-app-accent">AI draft — verify every claim against source documents before editing status. Editing the text marks it Human Edited.</p>}
            <Textarea className="mt-3 min-h-[380px] w-full leading-relaxed" value={cur.body} onChange={(e) => s.updateProposalSection(cur.id, { body: e.target.value })} />
            <div className="mt-3 flex items-center justify-between"><Label>{cur.body.split(/\s+/).filter(Boolean).length} words</Label><Button size="sm" variant="primary" onClick={() => s.updateProposalSection(cur.id, { status: "Approved" })} disabled={cur.status === "Approved"}><Check size={11} /> Approve section</Button></div>
          </Card>
        ) : <Card className="p-8 text-center text-xs text-app-dim">Select or create a section.</Card>}
      </div>
    </div>
  );
}
