"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Plus, Check, X, Pencil, Trash2, FileText, Sparkles, MessageSquare } from "lucide-react";
import { Card, Badge, Button, Input, Select, Textarea, Modal, Field, Label, confidenceTone } from "@/components/ui";
import { useStore } from "@/store/useStore";
import { requirementCategories } from "@/lib/industries";
import type { Requirement } from "@/store/types";
import { cn } from "@/lib/cn";

const statusTone = (st: Requirement["status"]) => st === "Approved" || st === "Compliant" ? "green" : st === "Rejected" || st === "Non-Compliant" ? "red" : st === "Partial" ? "yellow" : "accent";

export default function Requirements() {
  const { id } = useParams<{ id: string }>(); const s = useStore();
  const [cat, setCat] = useState("All"); const [st, setSt] = useState("All"); const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Partial<Requirement> | null>(null); const [limit, setLimit] = useState(80);
  const all = s.requirements.filter((r) => r.tenderId === id);
  const list = all.filter((r) => (cat === "All" || r.category === cat) && (st === "All" || r.status === st) && (r.text + r.clause).toLowerCase().includes(q.toLowerCase()));
  const pending = all.filter((r) => r.status === "Needs Verification").length;
  const cats = Array.from(new Set(all.map((r) => r.category)));
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-display text-xl text-app-text">Requirements</h2><p className="text-xs text-app-muted">{all.length} requirements · {pending} need verification · {all.filter((r) => r.ai).length} AI-extracted</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => void s.runTenderAnalysis(id)} disabled={s.analysisBusy}><Sparkles size={13} /> {s.analysisBusy ? "Analysing…" : "Re-extract from documents"}</Button><Button variant="primary" onClick={() => setEdit({ tenderId: id, category: "Technical", priority: "Must", status: "Needs Verification" })}><Plus size={13} /> Add requirement</Button></div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2"><Input className="flex-1 min-w-[200px]" placeholder="Search text or clause…" value={q} onChange={(e) => setQ(e.target.value)} /><Select value={cat} onChange={(e) => setCat(e.target.value)}><option>All</option>{cats.map((c) => <option key={c}>{c}</option>)}</Select><Select value={st} onChange={(e) => setSt(e.target.value)}>{["All", "Needs Verification", "Approved", "Rejected", "Compliant", "Partial", "Non-Compliant"].map((x) => <option key={x}>{x}</option>)}</Select></div>
      {pending > 0 && <Card className="mb-4 flex items-center justify-between px-4 py-2.5"><p className="text-xs text-app-accent">{pending} AI-extracted requirement(s) awaiting verification</p><Button size="sm" variant="primary" onClick={() => all.filter((r) => r.status === "Needs Verification").forEach((r) => s.updateRequirement(r.id, { status: "Approved", reviewer: s.currentUser }))}><Check size={12} /> Approve all</Button></Card>}
      <div className="space-y-2">
        {list.slice(0, limit).map((r) => (
          <Card key={r.id} className={cn("p-4", r.status === "Needs Verification" && "border-l-2 border-l-app-accent")}>
            <div className="flex flex-wrap items-center gap-1.5"><Badge tone="outline">{r.category}</Badge><Badge tone={r.priority === "Must" ? "red" : r.priority === "Should" ? "yellow" : "outline"}>{r.priority}</Badge>{r.ai && <Badge tone={confidenceTone(r.confidence)}>● AI · {r.confidence}</Badge>}<Badge tone={statusTone(r.status)}>{r.status}</Badge>{r.deadline && <Badge tone="outline">due {r.deadline}</Badge>}</div>
            <p className="mt-2 text-[14px] text-app-text">{r.text}</p>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 text-[11px] text-app-dim"><span className="flex items-center gap-1"><FileText size={10} /> {r.sourceDoc}</span><span>Page {r.page}</span><span>Section {r.section}</span><span>Clause {r.clause}</span>{r.evidence && <span>Evidence: {r.evidence}</span>}{r.reviewer && <span>Reviewer: {r.reviewer}</span>}</p>
            {r.comments && <p className="mt-1.5 flex items-start gap-1 text-xs text-app-muted"><MessageSquare size={11} className="mt-0.5" /> {r.comments}</p>}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-app-border pt-2">
              <Select className="py-1 text-xs" value={r.reviewer} onChange={(e) => s.updateRequirement(r.id, { reviewer: e.target.value })}><option value="">Assign reviewer…</option>{s.users.map((u) => <option key={u.id}>{u.name}</option>)}</Select>
              <div className="flex gap-1.5">
                {r.status === "Needs Verification" && <><Button size="sm" variant="primary" onClick={() => s.updateRequirement(r.id, { status: "Approved", reviewer: r.reviewer || s.currentUser })}><Check size={11} /> Approve</Button><Button size="sm" variant="outline" onClick={() => s.updateRequirement(r.id, { status: "Rejected" })}><X size={11} /> Reject</Button></>}
                {r.status !== "Needs Verification" && <Select className="py-1 text-xs" value={r.status} onChange={(e) => s.updateRequirement(r.id, { status: e.target.value as Requirement["status"] })}>{["Approved", "Compliant", "Partial", "Non-Compliant", "Rejected", "Needs Verification"].map((x) => <option key={x}>{x}</option>)}</Select>}
                <Button size="sm" variant="outline" onClick={() => setEdit(r)}><Pencil size={11} /> Edit</Button>
                <Button size="sm" variant="outline" onClick={() => s.deleteRequirement(r.id)}><Trash2 size={11} /></Button>
              </div>
            </div>
          </Card>
        ))}
        {list.length > limit && <Card className="p-3 text-center"><Button variant="outline" size="sm" onClick={() => setLimit(limit + 120)}>Show 120 more ({list.length - limit} remaining)</Button></Card>}
        {list.length === 0 && <Card className="p-8 text-center text-xs text-app-dim">No requirements. Run AI Analysis or add manually.</Card>}
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit requirement" : "Add requirement"} wide>
        {edit && <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (edit.id) s.updateRequirement(edit.id, edit); else s.addRequirement(edit as Requirement); setEdit(null); }}>
          <Field label="Requirement"><Textarea required className="w-full" value={edit.text || ""} onChange={(e) => setEdit({ ...edit, text: e.target.value })} /></Field>
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label="Category"><Select className="w-full" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>{requirementCategories.map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Priority"><Select className="w-full" value={edit.priority} onChange={(e) => setEdit({ ...edit, priority: e.target.value as Requirement["priority"] })}><option>Must</option><option>Should</option><option>Could</option></Select></Field>
            <Field label="Source document"><Input className="w-full" value={edit.sourceDoc || ""} onChange={(e) => setEdit({ ...edit, sourceDoc: e.target.value })} /></Field>
            <Field label="Page"><Input type="number" className="w-full" value={edit.page || 0} onChange={(e) => setEdit({ ...edit, page: +e.target.value })} /></Field>
            <Field label="Section"><Input className="w-full" value={edit.section || ""} onChange={(e) => setEdit({ ...edit, section: e.target.value })} /></Field>
            <Field label="Clause"><Input className="w-full" value={edit.clause || ""} onChange={(e) => setEdit({ ...edit, clause: e.target.value })} /></Field>
            <Field label="Deadline"><Input type="date" className="w-full" value={edit.deadline || ""} onChange={(e) => setEdit({ ...edit, deadline: e.target.value })} /></Field>
            <Field label="Evidence required"><Input className="w-full" value={edit.evidence || ""} onChange={(e) => setEdit({ ...edit, evidence: e.target.value })} /></Field>
          </div>
          <Field label="Comments"><Textarea className="w-full" value={edit.comments || ""} onChange={(e) => setEdit({ ...edit, comments: e.target.value })} /></Field>
          <div className="flex justify-end"><Button variant="primary">Save</Button></div>
        </form>}
      </Modal>
      <Label className="mt-4">Statuses map to compliance: Compliant / Partial / Non-Compliant feed the Compliance tab and Tender Health.</Label>
    </div>
  );
}
