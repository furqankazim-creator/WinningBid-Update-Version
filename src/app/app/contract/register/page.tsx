"use client";
import { useState } from "react";
import { Modal, Field, Input, Select, Textarea, Button, PageHeader, Empty } from "@/components/ui";
import { RegisterToolbar, SearchFilter, PendingBar, TrustScore, GroupHeader, exportCSV, exportWord } from "@/components/app/shared";
import { ReviewCard } from "@/components/app/ReviewCard";
import { useScopedStore } from "@/store/useStore";
import type { Clause } from "@/store/types";

export default function ContractRegister() {
  const s = useScopedStore();
  const [q, setQ] = useState(""); const [rel, setRel] = useState("All"); const [add, setAdd] = useState(false); const [imp, setImp] = useState(false); const [gen, setGen] = useState(false); const [genErr, setGenErr] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Clause>>({ ref: "", title: "", category: "Liability", relevance: "Medium", markup: "", analysis: "" });
  const list = s.clauses.filter((c) => (c.title + c.markup + c.analysis + c.ref).toLowerCase().includes(q.toLowerCase()) && (rel === "All" || c.relevance === rel));
  const pending = s.clauses.filter((c) => c.pending).length;
  const cats = Array.from(new Set(list.map((c) => c.category)));
  const rows = () => list.map((c) => ({ No: c.n, Clause: c.ref, Title: c.title, Category: c.category, Relevance: c.relevance, "Proposed markup": c.markup, Analysis: c.analysis, Status: c.status }));

  return (
    <div className="font-sans">
      <PageHeader title="Contract Register" sub={`${s.clauses.length} clause(s) · ${pending} pending review`} />
      {genErr && <p className="mb-3 rounded border border-app-red/40 bg-app-red/10 px-3 py-2 text-xs text-app-red">{genErr}</p>}
      <RegisterToolbar onWord={() => exportWord("contract-register", "Contract Register", rows())} onExcel={() => exportCSV("contract-register", rows())} onImport={() => setImp(true)} importLabel="Import edits" onAdd={() => setAdd(true)} addLabel="Add entry" onGenerate={async () => { setGen(true); setGenErr(await s.runTenderAnalysis(s.activeTenderId)); setGen(false); }} generating={gen} />
      <div className="grid gap-5 xl:grid-cols-[1fr_260px]">
        <div>
          <SearchFilter q={q} setQ={setQ}><Select value={rel} onChange={(e) => setRel(e.target.value)}>{["All", "High", "Medium", "Low"].map((x) => <option key={x}>{x}</option>)}</Select></SearchFilter>
          <PendingBar count={pending} noun="clauses" onAcceptAll={s.acceptAllClauses} onRejectAll={s.rejectAllClauses} />
          {list.length === 0 && <Empty title="No clauses match." />}
          {cats.map((cat) => { const rows = list.filter((c) => c.category === cat); return (
            <div key={cat}>
              <GroupHeader label={cat} count={rows.length} />
              <div className="space-y-3">{rows.map((c) => (
                <ReviewCard key={c.id} kind="clause" n={c.n} ref={c.ref} confidence={c.confidence} relevance={c.relevance} category={c.category} kicker="Proposed markup" title={c.markup} analysis={c.analysis} pending={c.pending} status={c.status} transcript={`"${c.title}" — as written in the contract at ${c.ref}.`}
                  onChange={(p) => s.updateClause(c.id, p)} onAccept={() => s.acceptClause(c.id)} onReject={() => s.rejectClause(c.id)} onDelete={() => s.rejectClause(c.id)} />
              ))}</div>
            </div>
          ); })}
        </div>
        <div><TrustScore items={s.clauses} /></div>
      </div>
      <Modal open={add} onClose={() => setAdd(false)} title="Add clause entry">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); s.addClause(form); setAdd(false); }}>
          <div className="grid grid-cols-2 gap-3"><Field label="Clause ref"><Input required className="w-full" placeholder="§12.1" value={form.ref} onChange={(e) => setForm({ ...form, ref: e.target.value })} /></Field><Field label="Category"><Select className="w-full" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{["Liability", "Payment", "LD & Delay", "Insurance", "Variations", "Termination", "IP", "Other"].map((x) => <option key={x}>{x}</option>)}</Select></Field></div>
          <Field label="Title"><Input required className="w-full" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Relevance"><Select className="w-full" value={form.relevance} onChange={(e) => setForm({ ...form, relevance: e.target.value as Clause["relevance"] })}><option>High</option><option>Medium</option><option>Low</option></Select></Field>
          <Field label="Proposed markup"><Textarea className="w-full" value={form.markup} onChange={(e) => setForm({ ...form, markup: e.target.value })} /></Field>
          <Field label="Analysis"><Textarea className="w-full" value={form.analysis} onChange={(e) => setForm({ ...form, analysis: e.target.value })} /></Field>
          <div className="flex justify-end"><Button variant="primary">Add</Button></div>
        </form>
      </Modal>
      <Modal open={imp} onClose={() => setImp(false)} title="Import edits" sub="Upload the marked-up contract (docx) or register (xlsx); edits are matched by clause number.">
        <Input type="file" accept=".docx,.xlsx,.csv" className="w-full" onChange={() => setImp(false)} />
      </Modal>
    </div>
  );
}
