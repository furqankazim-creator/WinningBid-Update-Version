"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Input, Select, Table, PageHeader, Badge, Field, Card, Label } from "@/components/ui";
import { useStore } from "@/store/useStore";
import type { Capability } from "@/store/types";

export default function Capabilities() {
  const s = useStore();
  const [f, setF] = useState<Omit<Capability, "id">>({ name: "", category: "Certification", value: "Yes", expiry: "", evidence: "" });
  const expired = s.capabilities.filter((c) => c.expiry && new Date(c.expiry) < new Date());
  const soon = s.capabilities.filter((c) => c.expiry && new Date(c.expiry) >= new Date() && new Date(c.expiry).getTime() - Date.now() < 90 * 86400000);
  return (
    <div className="font-sans">
      <PageHeader title="Our capabilities" sub="Organisation profile used for capability matching against tender requirements: certifications, licences, experience, equipment, personnel, partners." />
      <div className="mb-4 grid gap-3 sm:grid-cols-3"><Card className="p-4"><Label>Capabilities</Label><p className="font-display text-2xl text-app-text">{s.capabilities.length}</p></Card><Card className="p-4"><Label>Expired</Label><p className="font-display text-2xl text-app-red">{expired.length}</p></Card><Card className="p-4"><Label>Expiring ≤ 90 days</Label><p className="font-display text-2xl text-app-yellow">{soon.length}</p></Card></div>
      <Card className="mb-4 flex flex-wrap items-end gap-2 p-4">
        <Field label="Capability"><Input className="w-64" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. ISO 14001" /></Field>
        <Field label="Category"><Select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{["Certification", "Licensing", "Experience", "Equipment", "Personnel", "Financial", "Partner", "Local content", "Other"].map((x) => <option key={x}>{x}</option>)}</Select></Field>
        <Field label="Value"><Input className="w-32" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} placeholder="Yes / 3 / Grade 1" /></Field>
        <Field label="Expiry"><Input type="date" value={f.expiry} onChange={(e) => setF({ ...f, expiry: e.target.value })} /></Field>
        <Field label="Evidence"><Input className="w-48" value={f.evidence} onChange={(e) => setF({ ...f, evidence: e.target.value })} /></Field>
        <Button variant="primary" onClick={() => { if (f.name) s.addCapability(f); setF({ ...f, name: "", value: "Yes", evidence: "" }); }}><Plus size={13} /> Add</Button>
      </Card>
      <Table head={["Capability", "Category", "Value", "Expiry", "Evidence", ""]}>
        {s.capabilities.map((c) => { const exp = c.expiry && new Date(c.expiry) < new Date(); return <tr key={c.id}><td className="px-3 py-2 text-app-text">{c.name}</td><td className="px-3 py-2"><Badge tone="outline">{c.category}</Badge></td><td className="px-3 py-2"><Input className="w-32 border-0 bg-transparent py-1" value={c.value} onChange={(e) => s.updateCapability(c.id, { value: e.target.value })} /></td><td className="px-3 py-2"><span className={exp ? "text-app-red" : "text-app-muted"}>{c.expiry || "—"}{exp && " (expired)"}</span></td><td className="px-3 py-2"><Input className="w-full border-0 bg-transparent py-1 text-xs" value={c.evidence} onChange={(e) => s.updateCapability(c.id, { evidence: e.target.value })} /></td><td className="px-3 py-2"><button onClick={() => s.deleteCapability(c.id)} className="text-app-dim hover:text-app-red"><Trash2 size={12} /></button></td></tr>; })}
      </Table>
    </div>
  );
}
