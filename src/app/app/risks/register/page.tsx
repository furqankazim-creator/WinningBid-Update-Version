"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, Undo2, Sparkles, Upload } from "lucide-react";
import { Modal, Field, Input, Select, Textarea, Button, PageHeader, Badge, Label } from "@/components/ui";
import { exportCSV, exportWord } from "@/components/app/shared";
import { SeverityText } from "@/components/app/Severity";
import { contributors } from "@/store/seed";
import { useScopedStore, fmtMoney } from "@/store/useStore";
import type { Risk } from "@/store/types";
import { useIndustry } from "@/lib/useIndustries";

export default function RiskRegister() {
  const s = useScopedStore();
  const ind = useIndustry(s.tenders.find((x) => x.id === s.activeTenderId)?.industry || "other");
  const [cat, setCat] = useState("All"); const [kind, setKind] = useState("All"); const [edit, setEdit] = useState<Partial<Risk> | null>(null); const [gen, setGen] = useState(false); const [genErr, setGenErr] = useState<string | null>(null);
  const list = s.risks.filter((r) => (cat === "All" || r.category === cat) && (kind === "All" || r.kind === kind));
  const cats = Array.from(new Set([...ind.riskCategories, ...s.risks.map((r) => r.category)]));
  const rows = () => list.map((r) => ({ No: r.n, Type: r.kind, Title: r.title, Description: r.description, Category: r.category, P: r.probability, I: r.impact, "Post P": r.postProbability, "Post I": r.postImpact, Owner: r.owner, Status: r.status, Mitigation: r.mitigation, Contingency: r.contingency }));
  const save = () => { if (!edit) return; if (edit.id) s.updateRisk(edit.id, edit); else s.addRisk(edit); setEdit(null); };

  return (
    <div className="font-sans">
      <PageHeader title="Risks & Opportunities · Register" sub={`${s.risks.length} item(s) · ${s.risks.filter((r) => r.status === "Open").length} open · risk categories from the ${ind.name} template`} right={<>
        <Button variant="outline" onClick={() => exportWord("risk-register", "Risk Register", rows())}>Word</Button><Button variant="outline" onClick={() => exportCSV("risk-register", rows())}>Excel</Button>
        <Button variant="outline"><Upload size={13} /> Import edits</Button><Button variant="outline" onClick={() => setEdit({ kind: "Risk", probability: 3, impact: 3, postProbability: 2, postImpact: 2, category: "Commercial" })}><Plus size={13} /> Add entry</Button>
        <Button variant="primary" onClick={async () => { setGen(true); setGenErr(await s.runTenderAnalysis(s.activeTenderId)); setGen(false); }} disabled={gen}><Sparkles size={13} /> {gen ? "Generating…" : "Generate"}</Button></>} />
      {genErr && <p className="mb-3 rounded border border-app-red/40 bg-app-red/10 px-3 py-2 text-xs text-app-red">{genErr}</p>}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Label>Category</Label><Select value={cat} onChange={(e) => setCat(e.target.value)}><option>All</option>{cats.map((c) => <option key={c}>{c}</option>)}</Select>
        <Label>Type</Label><Select value={kind} onChange={(e) => setKind(e.target.value)}><option>All</option><option>Risk</option><option>Opportunity</option></Select>
      </div>
      <div className="overflow-x-auto rounded border border-app-border">
        <table className="w-full text-left text-[13px]">
          <thead><tr className="border-b border-app-border bg-app-panel-2">{["#", "Risk", "Description", "Cat.", "Severity", "Post-mit severity", "Owner", "Status", "Actions"].map((h) => <th key={h} className="px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-app-muted">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-app-border">
            {list.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="px-3 py-3 font-mono text-[11px] text-app-muted">{String(r.n).padStart(3, "0")}</td>
                <td className="px-3 py-3 max-w-[180px]"><Badge tone={r.kind === "Risk" ? "outline" : "green"}>{r.kind}</Badge><p className="mt-1.5 font-medium text-app-text">{r.title}</p></td>
                <td className="px-3 py-3 max-w-md text-xs text-app-muted">{r.description}{r.mitigation && <p className="mt-1 text-app-dim">Mitigation: {r.mitigation}</p>}</td>
                <td className="px-3 py-3 text-xs text-app-muted">{r.category}</td>
                <td className="px-3 py-3"><SeverityText p={r.probability} i={r.impact} /><p className="font-mono text-[10px] text-app-dim">P{r.probability} × I{r.impact}</p></td>
                <td className="px-3 py-3"><SeverityText p={r.postProbability} i={r.postImpact} /><p className="font-mono text-[10px] text-app-dim">P{r.postProbability} × I{r.postImpact}</p></td>
                <td className="px-3 py-3 text-xs text-app-text">{r.owner || <span className="text-app-dim">—</span>}</td>
                <td className="px-3 py-3"><button onClick={() => s.updateRisk(r.id, { status: r.status === "Open" ? "Closed" : "Open" })}><Badge tone={r.status === "Open" ? "outline" : "green"}>{r.status}</Badge></button></td>
                <td className="px-3 py-3"><div className="flex gap-2 text-app-muted"><button className="hover:text-app-text" title="Revert"><Undo2 size={13} /></button><button onClick={() => setEdit(r)} className="hover:text-app-text"><Pencil size={13} /></button><button onClick={() => s.deleteRisk(r.id)} className="hover:text-app-red"><Trash2 size={13} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-app-muted">Total contingency allocated: <span className="text-app-text">{fmtMoney(list.reduce((a, r) => a + r.contingency, 0))}</span></p>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit entry" : "Add entry"} wide>
        {edit && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); save(); }}>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Type"><Select className="w-full" value={edit.kind} onChange={(e) => setEdit({ ...edit, kind: e.target.value as Risk["kind"] })}><option>Risk</option><option>Opportunity</option></Select></Field>
              <Field label="Category"><Select className="w-full" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>{cats.map((c) => <option key={c}>{c}</option>)}</Select></Field>
              <Field label="Owner"><Select className="w-full" value={edit.owner || ""} onChange={(e) => setEdit({ ...edit, owner: e.target.value })}><option value="">Unassigned</option>{contributors.filter((c) => c.name !== "TenderOS").map((c) => <option key={c.name}>{c.name}</option>)}</Select></Field>
            </div>
            <Field label="Title"><Input required className="w-full" value={edit.title || ""} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field>
            <Field label="Description"><Textarea className="w-full" value={edit.description || ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
            <div className="grid gap-3 sm:grid-cols-5">
              {(["probability", "impact", "postProbability", "postImpact"] as const).map((k) => <Field key={k} label={k.replace("post", "post ").replace("Probability", "P").replace("Impact", "I")}><Select className="w-full" value={edit[k]} onChange={(e) => setEdit({ ...edit, [k]: +e.target.value })}>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}</Select></Field>)}
              <Field label="Contingency (CAD)"><Input type="number" className="w-full" value={edit.contingency ?? 0} onChange={(e) => setEdit({ ...edit, contingency: +e.target.value })} /></Field>
            </div>
            <Field label="Mitigation / recommended position"><Textarea className="w-full" value={edit.mitigation || ""} onChange={(e) => setEdit({ ...edit, mitigation: e.target.value })} /></Field>
            <div className="flex justify-end"><Button variant="primary">Save</Button></div>
          </form>
        )}
      </Modal>
    </div>
  );
}
