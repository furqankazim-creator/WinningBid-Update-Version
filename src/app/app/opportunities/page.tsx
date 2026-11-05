"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ArrowRight, Trash2, List, Kanban } from "lucide-react";
import { Button, Card, Badge, Input, Select, Modal, Field, PageHeader, Textarea, Table } from "@/components/ui";
import { useStore, filterByIndustry } from "@/store/useStore";
import { useIndustries } from "@/lib/useIndustries";
import { money } from "@/components/app/charts";
import { regions } from "@/lib/industries";
import type { Opportunity, OppStage } from "@/store/types";
import { cn } from "@/lib/cn";

const stages: OppStage[] = ["Lead", "Prospect", "Qualified", "Opportunity", "Tender", "Bid", "Won", "Lost"];

export default function Opportunities() {
  const s = useStore(); const router = useRouter(); const industries = useIndustries();
  const [view, setView] = useState<"board" | "list">("board"); const [open, setOpen] = useState(false); const [edit, setEdit] = useState<Opportunity | null>(null); const [drag, setDrag] = useState<string | null>(null);
  const [f, setF] = useState<Partial<Opportunity> & { name: string; companyId: string }>({ name: "", companyId: s.companies[0]?.id || "", industry: s.companies[0]?.industry || "other", service: "", region: "Global", value: 0, currency: "USD", probability: 10, expectedAward: "", source: "", notes: "" });
  const list = filterByIndustry(s.opportunities, s.industryFilter);
  const co = (id: string) => s.companies.find((c) => c.id === id)?.name || "—";
  const move = (id: string, stage: OppStage) => { if (stage === "Tender" || stage === "Bid") { const o = s.opportunities.find((x) => x.id === id); if (o && !o.tenderId) { s.convertOpportunityToTender(id); } } s.updateOpportunity(id, { stage }); };

  return (
    <div className="font-sans">
      <PageHeader title="Opportunities" sub={`${list.length} in pipeline · ${money(list.filter((o) => !["Won", "Lost"].includes(o.stage)).reduce((a, o) => a + o.value * o.probability / 100, 0))} weighted`} right={<><div className="flex rounded border border-app-border p-0.5"><Button size="sm" variant={view === "board" ? "primary" : "ghost"} onClick={() => setView("board")}><Kanban size={12} /></Button><Button size="sm" variant={view === "list" ? "primary" : "ghost"} onClick={() => setView("list")}><List size={12} /></Button></div><Button variant="primary" onClick={() => setOpen(true)}><Plus size={13} /> New opportunity</Button></>} />
      {view === "board" ? (
        <div className="app-scroll flex gap-3 overflow-x-auto pb-2">
          {stages.map((st) => { const items = list.filter((o) => o.stage === st); return (
            <div key={st} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag) move(drag, st); setDrag(null); }} className={cn("w-64 shrink-0 rounded border border-app-border p-2.5", st === "Won" ? "col-tint-complete" : st === "Lost" ? "col-tint-lost" : "bg-app-panel")}>
              <div className="mb-2 flex items-center justify-between text-xs"><span className={cn(st === "Won" ? "text-app-green" : st === "Lost" ? "text-app-red" : "text-app-text")}>{st}</span><span className="font-mono text-app-muted">{items.length} · {money(items.reduce((a, o) => a + o.value, 0))}</span></div>
              {items.map((o) => (
                <div key={o.id} draggable onDragStart={() => setDrag(o.id)} onClick={() => setEdit(o)} className="mb-2 cursor-grab rounded border border-app-border-2 bg-app-bg p-2.5 hover:border-app-muted">
                  <p className="text-[13px] font-medium text-app-text">{o.name}</p><p className="text-[11px] text-app-muted">{co(o.companyId)}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px]"><span className="text-app-text">{money(o.value, o.currency)}</span><span className="text-app-muted">{o.probability}% · {money(o.value * o.probability / 100, o.currency)}</span></div>
                  <div className="mt-2 flex items-center justify-between"><Badge tone="outline">{industries.find((i) => i.id === o.industry)?.name}</Badge>{o.tenderId && <Link href={`/app/tenders/${o.tenderId}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-[11px] text-app-accent">Workspace <ArrowRight size={10} /></Link>}</div>
                </div>
              ))}
            </div>
          ); })}
        </div>
      ) : (
        <Table head={["Opportunity", "Client", "Industry", "Stage", "Value", "Prob.", "Weighted", "Award", "Owner", ""]}>
          {list.map((o) => <tr key={o.id} className="cursor-pointer hover:bg-app-panel-2" onClick={() => setEdit(o)}><td className="px-3 py-2 text-app-text">{o.name}</td><td className="px-3 py-2 text-app-muted">{co(o.companyId)}</td><td className="px-3 py-2 text-app-muted">{industries.find((i) => i.id === o.industry)?.name}</td><td className="px-3 py-2"><Badge tone="outline">{o.stage}</Badge></td><td className="px-3 py-2 text-app-text">{money(o.value, o.currency)}</td><td className="px-3 py-2 text-app-muted">{o.probability}%</td><td className="px-3 py-2 text-app-muted">{money(o.value * o.probability / 100, o.currency)}</td><td className="px-3 py-2 text-app-muted">{o.expectedAward}</td><td className="px-3 py-2 text-app-muted">{o.owner}</td><td className="px-3 py-2">{o.tenderId && <Link href={`/app/tenders/${o.tenderId}`} className="text-app-accent"><ArrowRight size={12} /></Link>}</td></tr>)}
        </Table>
      )}

      <Modal open={open || !!edit} onClose={() => { setOpen(false); setEdit(null); }} title={edit ? "Opportunity" : "New opportunity"} wide>
        {(() => { const v = edit || f; const set = (p: Partial<Opportunity>) => (edit ? setEdit({ ...edit, ...p }) : setF({ ...f, ...p })); const ind = industries.find((i) => i.id === v.industry); return (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (edit) s.updateOpportunity(edit.id, edit); else s.addOpportunity(f); setOpen(false); setEdit(null); }}>
            <Field label="Opportunity name"><Input required className="w-full" value={v.name} onChange={(e) => set({ name: e.target.value })} /></Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Client"><Select className="w-full" value={v.companyId} onChange={(e) => { const c = s.companies.find((x) => x.id === e.target.value); set({ companyId: e.target.value, industry: c?.industry || v.industry, region: c?.region || v.region }); }}>{s.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
              <Field label="Industry"><Select className="w-full" value={v.industry} onChange={(e) => set({ industry: e.target.value, service: "" })}>{industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</Select></Field>
              <Field label="Service"><Select className="w-full" value={v.service} onChange={(e) => set({ service: e.target.value })}><option value="">—</option>{ind?.services.map((x) => <option key={x}>{x}</option>)}</Select></Field>
              <Field label="Region"><Select className="w-full" value={v.region} onChange={(e) => set({ region: e.target.value })}>{regions.map((r) => <option key={r}>{r}</option>)}</Select></Field>
              <Field label="Estimated value"><Input type="number" className="w-full" value={v.value} onChange={(e) => set({ value: +e.target.value })} /></Field>
              <Field label="Currency"><Select className="w-full" value={v.currency} onChange={(e) => set({ currency: e.target.value })}>{["USD", "EUR", "GBP", "CAD", "AED", "SAR", "INR"].map((c) => <option key={c}>{c}</option>)}</Select></Field>
              <Field label="Probability %"><Input type="number" min={0} max={100} className="w-full" value={v.probability} onChange={(e) => set({ probability: +e.target.value })} /></Field>
              <Field label="Expected award"><Input type="date" className="w-full" value={v.expectedAward} onChange={(e) => set({ expectedAward: e.target.value })} /></Field>
              <Field label="Expected start"><Input type="date" className="w-full" value={v.expectedStart || ""} onChange={(e) => set({ expectedStart: e.target.value })} /></Field>
              <Field label="Owner"><Select className="w-full" value={v.owner || s.currentUser} onChange={(e) => set({ owner: e.target.value })}>{s.users.map((u) => <option key={u.id}>{u.name}</option>)}</Select></Field>
              <Field label="Source"><Input className="w-full" value={v.source} onChange={(e) => set({ source: e.target.value })} /></Field>
              {edit && <Field label="Stage"><Select className="w-full" value={edit.stage} onChange={(e) => setEdit({ ...edit, stage: e.target.value as OppStage })}>{stages.map((x) => <option key={x}>{x}</option>)}</Select></Field>}
            </div>
            <Field label="Notes"><Textarea className="w-full" value={v.notes} onChange={(e) => set({ notes: e.target.value })} /></Field>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">{edit && <Button type="button" variant="danger" onClick={() => { s.deleteOpportunity(edit.id); setEdit(null); }}><Trash2 size={12} /> Delete</Button>}{edit && !edit.tenderId && <Button type="button" variant="outline" onClick={() => { const id = s.convertOpportunityToTender(edit.id); setEdit(null); router.push(`/app/tenders/${id}`); }}>Open Tender Workspace <ArrowRight size={12} /></Button>}</div>
              <Button variant="primary">{edit ? "Save" : "Create"}</Button>
            </div>
          </form>
        ); })()}
      </Modal>
    </div>
  );
}
