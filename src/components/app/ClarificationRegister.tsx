"use client";
import { useMemo, useState } from "react";
import { Modal, Field, Input, Select, Textarea, Button, PageHeader, Empty } from "@/components/ui";
import { RegisterToolbar, SearchFilter, PendingBar, TrustScore, GroupHeader, exportCSV, exportWord } from "./shared";
import { ReviewCard } from "./ReviewCard";
import { useScopedStore } from "@/store/useStore";
import type { Clarification } from "@/store/types";
import { useIndustry } from "@/lib/useIndustries";

export function ClarificationRegister({ title, filter }: { title: string; filter?: (c: Clarification) => boolean }) {
  const s = useScopedStore();
  const ind = useIndustry(s.tenders.find((x) => x.id === s.activeTenderId)?.industry || "other");
  const items = useMemo(() => (filter ? s.clarifications.filter(filter) : s.clarifications), [s.clarifications, filter]);
  const [q, setQ] = useState(""); const [cat, setCat] = useState("All"); const [st, setSt] = useState("All");
  const [add, setAdd] = useState(false); const [imp, setImp] = useState<null | "import" | "ingest">(null); const [gen, setGen] = useState(false); const [genErr, setGenErr] = useState<string | null>(null);
  const [form, setForm] = useState({ ref: "", category: "Technical" as Clarification["category"], title: "", analysis: "" });
  const list = items.filter((c) => (c.title + c.analysis).toLowerCase().includes(q.toLowerCase()) && (cat === "All" || c.category === cat) && (st === "All" || c.status === st));
  const pending = items.filter((c) => c.pending).length;
  const groups = ["Technical", "Commercial", "Contractual"].map((g) => ({ g, rows: list.filter((c) => c.category === g) })).filter((x) => x.rows.length);
  const rows = () => list.map((c) => ({ No: c.n, Ref: c.ref, Category: c.category, Clarification: c.title, Analysis: c.analysis, Status: c.status, Assignee: c.assignee, Due: c.due, "Client answer": c.clientAnswer || "" }));

  return (
    <div className="font-sans">
      <PageHeader title={title} sub={`${items.length} item(s) · ${pending} pending review`} />
      {genErr && <p className="mb-3 rounded border border-app-red/40 bg-app-red/10 px-3 py-2 text-xs text-app-red">{genErr}</p>}
      <RegisterToolbar onWord={() => exportWord("clarifications", title, rows())} onExcel={() => exportCSV("clarifications", rows())} onImport={() => setImp("import")} onIngest={() => setImp("ingest")} onAdd={() => setAdd(true)} onGenerate={async () => { setGen(true); setGenErr(await s.runTenderAnalysis(s.activeTenderId)); setGen(false); }} generating={gen} />
      <div className="grid gap-5 xl:grid-cols-[1fr_260px]">
        <div>
          <SearchFilter q={q} setQ={setQ}>
            <Select value={cat} onChange={(e) => setCat(e.target.value)}>{["All", "Technical", "Commercial", "Contractual"].map((x) => <option key={x}>{x}</option>)}</Select>
            <Select value={st} onChange={(e) => setSt(e.target.value)}>{["All", "Draft", "Internal Review", "Approved", "Answered", "Closed"].map((x) => <option key={x}>{x}</option>)}</Select>
          </SearchFilter>
          <PendingBar count={pending} noun="clarifications" onAcceptAll={s.acceptAllClarifications} onRejectAll={s.rejectAllClarifications} />
          {groups.length === 0 && <Empty title="No clarifications match." body="Generate from the ITT or add one manually." />}
          {groups.map(({ g, rows }) => (
            <div key={g}>
              <GroupHeader label={g} count={rows.length} />
              <div className="space-y-3">{rows.map((c) => (
                <ReviewCard key={c.id} kind="clarification" n={c.n} ref={c.ref} confidence={c.confidence} flag={c.flag} round={c.round} category={c.category} kicker="Proposed clarification" title={c.title} analysis={c.analysis} pending={c.pending} status={c.status} assignee={c.assignee} due={c.due} clientAnswer={c.clientAnswer} ourReply={c.ourReply}
                  onChange={(p) => s.updateClarification(c.id, p)} onAccept={() => s.acceptClarification(c.id)} onReject={() => s.rejectClarification(c.id)} onDelete={() => s.deleteClarification(c.id)} />
              ))}</div>
            </div>
          ))}
        </div>
        <div><TrustScore items={items} /></div>
      </div>

      <Modal open={add} onClose={() => setAdd(false)} title="Add clarification">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); s.addClarification(form); setAdd(false); setForm({ ref: "", category: "Technical", title: "", analysis: "" }); }}>
          <div className="grid grid-cols-2 gap-3"><Field label="ITT reference"><Input required className="w-full" placeholder="ITT §4.2" value={form.ref} onChange={(e) => setForm({ ...form, ref: e.target.value })} /></Field><Field label="Category"><Select className="w-full" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Clarification["category"] })}><option>Technical</option><option>Commercial</option><option>Contractual</option></Select></Field></div>
          {(ind.questionTemplates || []).length > 0 && <Field label={`${ind.name} question templates`}><Select className="w-full" value="" onChange={(e) => e.target.value && setForm({ ...form, title: e.target.value })}><option value="">Pick a template…</option>{ind.questionTemplates!.map((q) => <option key={q}>{q}</option>)}</Select></Field>}
          <Field label="Clarification"><Input required className="w-full" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Question / analysis"><Textarea className="w-full" value={form.analysis} onChange={(e) => setForm({ ...form, analysis: e.target.value })} /></Field>
          <div className="flex justify-end"><Button variant="primary">Add</Button></div>
        </form>
      </Modal>
      <Modal open={!!imp} onClose={() => setImp(null)} title={imp === "import" ? "Import answers" : "Ingest answers"} sub={imp === "import" ? "Upload the client's returned clarification sheet (xlsx/csv). Answers are matched by reference number." : "Paste the client's email or minutes; answers are extracted and matched to open clarifications."}>
        {imp === "import" ? <Input type="file" accept=".xlsx,.csv" className="w-full" onChange={() => setImp(null)} /> : <Textarea className="w-full min-h-[140px]" placeholder="Paste text…" />}
        <div className="mt-3 flex justify-end"><Button variant="primary" onClick={() => setImp(null)}>{imp === "import" ? "Import" : "Ingest"}</Button></div>
      </Modal>
    </div>
  );
}
