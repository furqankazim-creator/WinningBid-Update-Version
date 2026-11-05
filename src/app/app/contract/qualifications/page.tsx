"use client";
import { useState } from "react";
import { Plus, Link2, Check, Pencil, Trash2, Wand2 } from "lucide-react";
import { Modal, Field, Input, Select, Textarea, Button, PageHeader, Badge, Label, confidenceTone } from "@/components/ui";
import { RegisterToolbar, PendingBar, exportCSV, exportWord } from "@/components/app/shared";
import { contributors } from "@/store/seed";
import { useScopedStore } from "@/store/useStore";
import type { Qualification } from "@/store/types";
import { cn } from "@/lib/cn";

export default function QualificationsPage() {
  const s = useScopedStore();
  const [cat, setCat] = useState("All"); const [type, setType] = useState("All"); const [add, setAdd] = useState(false); const [imp, setImp] = useState(false);
  const [edit, setEdit] = useState<Qualification | null>(null);
  const [form, setForm] = useState<Partial<Qualification>>({ ref: "", text: "", rationale: "", category: "Technical", type: "Qualification" });
  const list = s.qualifications.filter((q) => (cat === "All" || q.category === cat) && (type === "All" || q.type === type));
  const pending = list.filter((q) => q.pending); const accepted = list.filter((q) => !q.pending);
  const rows = () => list.map((q) => ({ No: q.n, Ref: q.ref, Qualification: q.text, Rationale: q.rationale, Category: q.category, Type: q.type, Status: q.status, Assignee: q.assignee, Due: q.due }));

  const Row = ({ q }: { q: Qualification }) => (
    <tr className="align-top">
      <td className="px-3 py-3 font-mono text-[11px] text-app-muted">{String(q.n).padStart(3, "0")}</td>
      <td className="px-3 py-3">
        <div className="flex flex-wrap gap-1.5"><Badge tone="accent">{q.ref}</Badge>{q.draft && <Badge tone="outline">Draft</Badge>}<Badge tone={confidenceTone(q.trust)}>● {q.trust} trust</Badge>{q.linked && <Badge tone="accent"><Link2 size={10} /> {q.linked}</Badge>}</div>
        <p className="mt-2 max-w-xl text-[13px] font-medium leading-snug text-app-text">{q.text}</p>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-app-muted">{q.rationale}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <div><Label>Technical impact</Label><Input className="mt-0.5 w-full py-1 text-xs" value={q.technicalImpact || ""} placeholder="—" onChange={(e) => s.updateQualification(q.id, { technicalImpact: e.target.value })} /></div>
          <div><Label>Commercial impact</Label><Input className="mt-0.5 w-full py-1 text-xs" value={q.commercialImpact || ""} placeholder="—" onChange={(e) => s.updateQualification(q.id, { commercialImpact: e.target.value })} /></div>
          <div><Label>Risk · approval</Label><div className="mt-0.5 flex gap-1"><Select className="py-1 text-xs" value={q.risk || ""} onChange={(e) => s.updateQualification(q.id, { risk: e.target.value as Qualification["risk"] })}><option value="">Risk</option><option>High</option><option>Medium</option><option>Low</option></Select><Select className="py-1 text-xs" value={q.approval || "Not requested"} onChange={(e) => s.updateQualification(q.id, { approval: e.target.value as Qualification["approval"] })}>{["Not requested", "Pending", "Approved", "Rejected"].map((x) => <option key={x}>{x}</option>)}</Select></div></div>
        </div>
        <Label className="mt-3">Conversation</Label>
        <div className="mt-1 flex gap-4 text-[11px] text-app-blue"><button className="flex items-center gap-1"><Plus size={11} /> Client answer</button><button className="flex items-center gap-1"><Plus size={11} /> Our reply</button></div>
        <div className="mt-3 flex flex-wrap gap-2 border-t border-app-border pt-3">
          <Select value={q.assignee} onChange={(e) => s.updateQualification(q.id, { assignee: e.target.value })} className="py-1 text-xs"><option value="">Unassigned</option>{contributors.filter((c) => c.name !== "TenderOS").map((c) => <option key={c.name}>{c.name}</option>)}</Select>
          <Input type="date" value={q.due} onChange={(e) => s.updateQualification(q.id, { due: e.target.value })} className="py-1 text-xs" />
          <Select value={q.task} onChange={(e) => s.updateQualification(q.id, { task: e.target.value as Qualification["task"] })} className="py-1 text-xs"><option>To do</option><option>In progress</option><option>Done</option></Select>
        </div>
      </td>
      <td className="px-3 py-3"><Badge tone="outline">{q.category}</Badge></td>
      <td className="px-3 py-3"><Badge tone="outline">{q.type}</Badge></td>
      <td className="px-3 py-3"><button onClick={() => s.updateQualification(q.id, { status: q.status === "Open" ? "Closed" : "Open" })}><Badge tone={q.status === "Open" ? "outline" : "green"}>{q.status}</Badge></button></td>
      <td className="px-3 py-3">
        <div className="flex gap-2 text-app-muted">
          <button title="Writing actions" className="hover:text-app-text"><Wand2 size={13} /></button>
          {q.pending && <button title="Accept" onClick={() => s.acceptQualification(q.id)} className="hover:text-app-green"><Check size={13} /></button>}
          <button title="Edit" onClick={() => setEdit(q)} className="hover:text-app-text"><Pencil size={13} /></button>
          <button title="Delete" onClick={() => s.rejectQualification(q.id)} className="hover:text-app-red"><Trash2 size={13} /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="font-sans">
      <PageHeader title="Qualifications & Deviations" sub={`${s.qualifications.length} item(s) · ${pending.length} pending review`} right={<>
        <RegisterToolbar onWord={() => exportWord("qualifications", "Qualifications & Deviations", rows())} onExcel={() => exportCSV("qualifications", rows())} onImport={() => setImp(true)} />
        <Button variant="primary" className="-mt-5" onClick={() => setAdd(true)}><Plus size={13} /> Add qualification</Button></>} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Label>Category</Label><Select value={cat} onChange={(e) => setCat(e.target.value)}>{["All", "Technical", "Commercial", "Contractual"].map((x) => <option key={x}>{x}</option>)}</Select>
        <Label>Type</Label><Select value={type} onChange={(e) => setType(e.target.value)}>{["All", "Qualification", "Deviation"].map((x) => <option key={x}>{x}</option>)}</Select>
      </div>
      <PendingBar count={pending.length} noun="qualifications" onAcceptAll={s.acceptAllQualifications} onRejectAll={s.rejectAllQualifications} />
      <div className="overflow-x-auto rounded border border-app-border">
        <table className="w-full text-left text-[13px]">
          <thead><tr className="border-b border-app-border bg-app-panel-2">{["#", "Qualification", "Category", "Type", "Status", "Actions"].map((h) => <th key={h} className="px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-app-muted">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-app-border">
            {pending.length > 0 && <tr><td colSpan={6} className={cn("bg-app-panel px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-app-accent")}>Pending review ({pending.length})</td></tr>}
            {pending.map((q) => <Row key={q.id} q={q} />)}
            <tr><td colSpan={6} className="bg-app-panel px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-app-muted">Accepted / manual ({accepted.length})</td></tr>
            {accepted.map((q) => <Row key={q.id} q={q} />)}
          </tbody>
        </table>
      </div>
      <Modal open={add || !!edit} onClose={() => { setAdd(false); setEdit(null); }} title={edit ? "Edit qualification" : "Add qualification"}>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (edit) s.updateQualification(edit.id, edit); else s.addQualification(form); setAdd(false); setEdit(null); }}>
          {(() => { const v = edit || form; const set = (p: Partial<Qualification>) => (edit ? setEdit({ ...edit, ...p }) : setForm({ ...form, ...p })); return <>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Ref"><Input required className="w-full" value={v.ref} onChange={(e) => set({ ref: e.target.value })} /></Field>
              <Field label="Category"><Select className="w-full" value={v.category} onChange={(e) => set({ category: e.target.value as Qualification["category"] })}><option>Technical</option><option>Commercial</option><option>Contractual</option></Select></Field>
              <Field label="Type"><Select className="w-full" value={v.type} onChange={(e) => set({ type: e.target.value as Qualification["type"] })}><option>Qualification</option><option>Deviation</option></Select></Field>
            </div>
            <Field label="Qualification text"><Textarea required className="w-full" value={v.text} onChange={(e) => set({ text: e.target.value })} /></Field>
            <Field label="Rationale"><Textarea className="w-full" value={v.rationale} onChange={(e) => set({ rationale: e.target.value })} /></Field>
          </>; })()}
          <div className="flex justify-end"><Button variant="primary">{edit ? "Save" : "Add"}</Button></div>
        </form>
      </Modal>
      <Modal open={imp} onClose={() => setImp(false)} title="Import answers" sub="Upload the client's response to the deviation register."><Input type="file" accept=".xlsx,.csv,.docx" className="w-full" onChange={() => setImp(false)} /></Modal>
    </div>
  );
}
