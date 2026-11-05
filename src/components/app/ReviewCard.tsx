"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, Check, Sparkles, Undo2 } from "lucide-react";
import { Badge, Button, Label, Input, Select, Textarea, confidenceTone } from "@/components/ui";
import { RelevanceBadge } from "./shared";
import { contributors } from "@/store/seed";
import { cn } from "@/lib/cn";

const STATUSES = ["Draft", "Internal Review", "Approved", "Answered", "Closed"];
const CLAUSE_STATUSES = ["Pending", "Approved", "Rejected", "Closed"];

export interface ReviewCardProps {
  n: number; ref: string; confidence: "High" | "Medium" | "Low"; flag?: string; round?: number; category: string; relevance?: "High" | "Medium" | "Low";
  kicker: string; title: string; analysis: string; pending: boolean; status: string; assignee?: string; due?: string; clientAnswer?: string; ourReply?: string; transcript?: string;
  kind: "clarification" | "clause";
  onChange: (patch: Record<string, unknown>) => void; onAccept: () => void; onReject: () => void; onDelete: () => void;
}

export function ReviewCard(p: ReviewCardProps) {
  const [edit, setEdit] = useState(false);
  const [showSrc, setShowSrc] = useState(false);
  const [showTx, setShowTx] = useState(false);
  const [ca, setCa] = useState(false); const [or, setOr] = useState(false);
  const [wa, setWa] = useState(false);
  const [draft, setDraft] = useState({ title: p.title, analysis: p.analysis });
  const statuses = p.kind === "clause" ? CLAUSE_STATUSES : STATUSES;

  return (
    <div className={cn("rounded border bg-app-panel p-4 font-sans", p.pending ? "border-l-2 border-app-border border-l-app-accent" : "border-app-border")}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[11px] text-app-muted">{String(p.n).padStart(3, "0")}</span>
        <Badge tone="accent">{p.ref}</Badge>
        <Badge tone={confidenceTone(p.confidence)}>● {p.confidence} Confidence</Badge>
        {p.flag && <Badge tone="red">{p.flag}</Badge>}
        {p.relevance && <RelevanceBadge r={p.relevance} />}
        {p.round && <span className="font-mono text-[11px] text-app-muted">R{p.round}</span>}
        <Badge tone="outline">{p.category.toUpperCase()}</Badge>
      </div>
      <Label className="mt-3">{p.kicker}</Label>
      {edit ? (
        <div className="mt-1 space-y-2">
          <Input className="w-full" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <Textarea className="w-full" value={draft.analysis} onChange={(e) => setDraft({ ...draft, analysis: e.target.value })} />
          <div className="flex gap-2"><Button size="sm" variant="primary" onClick={() => { p.onChange({ title: draft.title, analysis: draft.analysis, ...(p.kind === "clause" ? { markup: draft.title } : {}) }); setEdit(false); }}>Save</Button><Button size="sm" variant="outline" onClick={() => setEdit(false)}>Cancel</Button></div>
        </div>
      ) : (
        <>
          <p className="mt-1 text-[15px] font-medium leading-snug text-app-text">{p.title}</p>
          <Label className="mt-3">Analysis</Label>
          <p className="mt-1 text-xs leading-relaxed text-app-muted">{p.analysis}</p>
        </>
      )}
      {p.transcript && <button onClick={() => setShowTx(!showTx)} className="mt-3 flex items-center gap-1 text-[11px] text-app-muted hover:text-app-text">Literal transcript {showTx ? <ChevronDown size={11} /> : <ChevronRight size={11} />}</button>}
      {showTx && <p className="mt-1 border-l border-app-border pl-3 text-[11px] italic text-app-dim">{p.transcript}</p>}

      <Label className="mt-3">Conversation</Label>
      <div className="mt-1 flex gap-4 text-[11px] text-app-blue">
        <button onClick={() => setCa(!ca)} className="flex items-center gap-1 hover:underline"><Plus size={11} /> Client answer</button>
        <button onClick={() => setOr(!or)} className="flex items-center gap-1 hover:underline"><Plus size={11} /> Our reply</button>
      </div>
      {(ca || p.clientAnswer) && <Textarea placeholder="Paste the client's answer…" className="mt-2 w-full min-h-[56px]" defaultValue={p.clientAnswer} onBlur={(e) => p.onChange({ clientAnswer: e.target.value, ...(e.target.value && p.kind === "clarification" ? { status: "Answered" } : {}) })} />}
      {(or || p.ourReply) && <Textarea placeholder="Our reply…" className="mt-2 w-full min-h-[56px]" defaultValue={p.ourReply} onBlur={(e) => p.onChange({ ourReply: e.target.value })} />}
      <button onClick={() => setShowSrc(!showSrc)} className="mt-2 flex items-center gap-1 text-[11px] text-app-muted hover:text-app-text">1 source used {showSrc ? <ChevronDown size={11} /> : <ChevronRight size={11} />}</button>
      {showSrc && <p className="mt-1 text-[11px] text-app-dim">ITT Volume 2 - Scope of Work.docx · {p.ref} · p. {3 + p.n}</p>}

      <div className="mt-3 h-px bg-app-border" />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Select value={p.status} onChange={(e) => p.onChange({ status: e.target.value })} className={cn("py-1 text-xs", p.status === "Draft" || p.status === "Pending" ? "text-app-accent" : p.status === "Approved" ? "text-app-green" : "")}>{statuses.map((s) => <option key={s}>{s}</option>)}</Select>
          {p.kind === "clarification" && <>
            <Select value={p.assignee || ""} onChange={(e) => p.onChange({ assignee: e.target.value })} className="py-1 text-xs"><option value="">Unassigned</option>{contributors.filter((c) => c.name !== "TenderOS").map((c) => <option key={c.name}>{c.name}</option>)}</Select>
            <Input type="date" value={p.due || ""} onChange={(e) => p.onChange({ due: e.target.value })} className="py-1 text-xs" />
          </>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setWa(!wa)}><Sparkles size={11} /> Writing actions <ChevronDown size={11} /></Button>
            {wa && <div className="absolute right-0 z-10 mt-1 w-44 rounded border border-app-border-2 bg-app-panel py-1 shadow-xl">{["Tighten wording", "Make more formal", "Add clause citation", "Translate to client format", "Shorten"].map((a) => <button key={a} onClick={() => { setWa(false); p.onChange({ analysis: `${p.analysis} [${a} — simulated; connect an LLM to apply]` }); }} className="block w-full px-3 py-1.5 text-left text-xs text-app-text hover:bg-app-panel-2">{a}</button>)}</div>}
          </div>
          <Button variant="outline" size="sm" onClick={() => { setDraft({ title: p.title, analysis: p.analysis }); setEdit(true); }}><Pencil size={11} /> Edit</Button>
          {p.pending ? <>
            <Button variant="outline" size="sm" onClick={p.onReject}><Trash2 size={11} /> Reject</Button>
            <Button variant="primary" size="sm" onClick={p.onAccept}><Check size={11} /> Accept</Button>
          </> : <>
            <Button variant="outline" size="sm" onClick={() => p.onChange({ status: p.kind === "clause" ? "Pending" : "Draft" })}><Undo2 size={11} /> Undo</Button>
            <Button variant="outline" size="sm" onClick={p.onDelete}><Trash2 size={11} /> Delete</Button>
          </>}
        </div>
      </div>
    </div>
  );
}
