"use client";
import { useState } from "react";
import { Plus, Trash2, Send, FileText } from "lucide-react";
import { PageHeader, Card, Badge, Button, Label, Modal, Field, Input, Select, Textarea } from "@/components/ui";
import { useScopedStore } from "@/store/useStore";
import { money } from "@/components/app/charts";
import type { ProcPackage, Quotation } from "@/store/types";

const flow: ProcPackage["status"][] = ["Requirement", "RFQ sent", "Quotations", "Evaluation", "Approval", "Purchased"];

export default function Proposals() {
  const s = useScopedStore();
  const t = s.tenders.find((x) => x.id === s.activeTenderId);
  const [addPk, setAddPk] = useState(false); const [pf, setPf] = useState<Partial<ProcPackage> & { name: string }>({ name: "", category: "Material", requirement: "" });
  const [quoteFor, setQuoteFor] = useState<string | null>(null); const [qf, setQf] = useState<Omit<Quotation, "id" | "receivedAt" | "packageId">>({ vendorId: s.vendors[0]?.id || "", price: 0, currency: t?.currency || "USD", leadWeeks: 4, quality: 3, compliance: 90, scope: "Full", notes: "" });
  return (
    <div className="font-sans">
      <PageHeader title="Procurement · Packages & quotations" sub="Requirement → RFQ → Suppliers → Quotations → Evaluation → Approval → Purchase. Any category: material, equipment, software, services, subcontractors, logistics." right={<Button variant="primary" onClick={() => setAddPk(true)}><Plus size={13} /> New package</Button>} />
      <div className="mb-4 flex flex-wrap gap-1">{flow.map((f, i) => <span key={f} className="rounded-sm bg-app-panel-2 px-2 py-1 text-[11px] text-app-muted">{i + 1}. {f} <span className="ml-1 font-mono text-app-text">{s.procPackages.filter((p) => p.status === f).length}</span></span>)}</div>
      {s.procPackages.map((pk) => { const qs = s.quotations.filter((q) => q.packageId === pk.id); return (
        <Card key={pk.id} className="mb-4 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div><div className="flex items-center gap-2"><p className="text-[15px] font-semibold text-app-text">{pk.name}</p><Badge tone="outline">{pk.category}</Badge><Badge tone={pk.status === "Purchased" ? "green" : pk.status === "Approval" ? "purple" : "accent"}>{pk.status}</Badge></div><p className="mt-1 text-xs text-app-muted">{pk.requirement}</p></div>
            <div className="flex items-center gap-2"><Select className="py-1 text-xs" value={pk.status} onChange={(e) => s.updatePackage(pk.id, { status: e.target.value as ProcPackage["status"] })}>{flow.map((f) => <option key={f}>{f}</option>)}</Select>{pk.status === "Requirement" && <Button size="sm" variant="outline" onClick={() => s.updatePackage(pk.id, { status: "RFQ sent" })}><Send size={11} /> Send RFQ</Button>}<Button size="sm" variant="outline" onClick={() => setQuoteFor(pk.id)}><Plus size={11} /> Quotation</Button><button onClick={() => s.deletePackage(pk.id)} className="text-app-dim hover:text-app-red"><Trash2 size={13} /></button></div>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-3">{qs.map((q) => { const v = s.vendors.find((x) => x.id === q.vendorId); return <div key={q.id} className="rounded border border-app-border bg-app-bg p-3"><div className="flex items-start justify-between"><p className="text-[13px] font-semibold text-app-text">{v?.name || q.vendorId}</p><div className="flex gap-1 text-app-muted"><FileText size={12} /><button onClick={() => s.deleteQuotation(q.id)} className="hover:text-app-red"><Trash2 size={12} /></button></div></div><p className="mt-1 font-display text-lg text-app-text">{money(q.price, q.currency)}</p><div className="mt-1 flex flex-wrap gap-1"><Badge tone="outline">{q.leadWeeks} wks</Badge><Badge tone={q.compliance >= 90 ? "green" : "yellow"}>{q.compliance}% compliant</Badge><Badge tone="outline">Q {q.quality}/5</Badge><Badge tone="outline">{q.scope}</Badge></div><p className="mt-1 text-[11px] text-app-muted">{q.notes}</p></div>; })}{qs.length === 0 && <p className="text-xs text-app-dim">No quotations received.</p>}</div>
        </Card>
      ); })}
      {s.procPackages.length === 0 && <Card className="p-8 text-center text-xs text-app-dim">No procurement packages for this tender.</Card>}

      <Modal open={addPk} onClose={() => setAddPk(false)} title="New procurement package">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); s.addPackage(pf); setAddPk(false); setPf({ name: "", category: "Material", requirement: "" }); }}>
          <Field label="Package"><Input required className="w-full" value={pf.name} onChange={(e) => setPf({ ...pf, name: e.target.value })} /></Field>
          <Field label="Category"><Select className="w-full" value={pf.category} onChange={(e) => setPf({ ...pf, category: e.target.value as ProcPackage["category"] })}>{["Material", "Equipment", "Software", "Services", "Subcontractors", "Logistics", "Other"].map((x) => <option key={x}>{x}</option>)}</Select></Field>
          <Field label="Requirement"><Textarea className="w-full" value={pf.requirement} onChange={(e) => setPf({ ...pf, requirement: e.target.value })} /></Field>
          <div className="flex justify-end"><Button variant="primary">Create</Button></div>
        </form>
      </Modal>
      <Modal open={!!quoteFor} onClose={() => setQuoteFor(null)} title="Record quotation" sub="Enter the supplier's quotation as received.">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (quoteFor) s.addQuotation({ ...qf, packageId: quoteFor }); setQuoteFor(null); }}>
          <Field label="Supplier / partner"><Select className="w-full" value={qf.vendorId} onChange={(e) => setQf({ ...qf, vendorId: e.target.value })}>{s.vendors.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.type || "Vendor"})</option>)}</Select></Field>
          <div className="grid grid-cols-3 gap-3"><Field label="Price"><Input type="number" className="w-full" value={qf.price} onChange={(e) => setQf({ ...qf, price: +e.target.value })} /></Field><Field label="Currency"><Input className="w-full" value={qf.currency} onChange={(e) => setQf({ ...qf, currency: e.target.value })} /></Field><Field label="Lead (weeks)"><Input type="number" className="w-full" value={qf.leadWeeks} onChange={(e) => setQf({ ...qf, leadWeeks: +e.target.value })} /></Field>
            <Field label="Quality (1–5)"><Select className="w-full" value={qf.quality} onChange={(e) => setQf({ ...qf, quality: +e.target.value as Quotation["quality"] })}>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}</Select></Field><Field label="Technical compliance %"><Input type="number" className="w-full" value={qf.compliance} onChange={(e) => setQf({ ...qf, compliance: +e.target.value })} /></Field><Field label="Scope"><Input className="w-full" value={qf.scope} onChange={(e) => setQf({ ...qf, scope: e.target.value })} /></Field></div>
          <Field label="Notes"><Textarea className="w-full" value={qf.notes} onChange={(e) => setQf({ ...qf, notes: e.target.value })} /></Field>
          <div className="flex justify-end"><Button variant="primary">Save quotation</Button></div>
        </form>
      </Modal>
      <Label className="mt-2">Vendors come from the shared Vendors & Partners directory.</Label>
    </div>
  );
}
