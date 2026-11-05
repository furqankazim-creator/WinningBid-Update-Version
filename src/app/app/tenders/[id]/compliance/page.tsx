"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2, LayoutTemplate, Check, X, HelpCircle, Minus, Clock, AlertCircle } from "lucide-react";
import { Card, Badge, Button, Input, Select, PageHeader, SectionTitle, Table, Label } from "@/components/ui";
import { useStore } from "@/store/useStore";
import { useIndustry } from "@/lib/useIndustries";
import type { ComplianceStatus } from "@/store/types";
import { cn } from "@/lib/cn";

const statuses: ComplianceStatus[] = ["Compliant", "Partially Compliant", "Non-Compliant", "Missing", "Expired", "Unknown", "Needs Review"];
const tone = (st: ComplianceStatus) => st === "Compliant" ? "green" : st === "Non-Compliant" || st === "Missing" || st === "Expired" ? "red" : st === "Partially Compliant" || st === "Needs Review" ? "yellow" : "outline";

export default function Compliance() {
  const { id } = useParams<{ id: string }>(); const s = useStore();
  const t = s.tenders.find((x) => x.id === id)!; const ind = useIndustry(t.industry);
  const [name, setName] = useState("");
  const items = s.complianceItems.filter((c) => c.tenderId === id);
  const reqs = s.requirements.filter((r) => r.tenderId === id);
  const pct = items.length ? Math.round((items.filter((c) => c.status === "Compliant").length / items.length) * 100) : 0;
  // Capability matching: compare requirement/compliance items against org capabilities by fuzzy name match.
  const match = (item: string) => { const cap = s.capabilities.find((c) => item.toLowerCase().includes(c.name.toLowerCase().split(" ")[0].toLowerCase()) || c.name.toLowerCase().includes(item.toLowerCase().split(" ")[0])); if (!cap) return { label: "UNKNOWN", icon: HelpCircle, tone: "outline" as const, cap }; if (cap.expiry && new Date(cap.expiry) < new Date()) return { label: "EXPIRED", icon: Clock, tone: "red" as const, cap }; if (/^(yes|true|available)/i.test(cap.value)) return { label: "MATCHED", icon: Check, tone: "green" as const, cap }; if (/unknown|^\?/i.test(cap.value) || !cap.value) return { label: "NEEDS VERIFICATION", icon: AlertCircle, tone: "yellow" as const, cap }; return { label: "PARTIAL", icon: Minus, tone: "yellow" as const, cap }; };
  return (
    <div>
      <PageHeader title="Compliance" sub={`${ind.name} template · ${items.length} items · ${pct}% compliant`} right={<><Button variant="outline" onClick={() => s.applyComplianceTemplate(id, ind.compliance)}><LayoutTemplate size={13} /> Apply {ind.name} template</Button></>} />
      <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-7">{statuses.map((st) => <Card key={st} className="p-2 text-center"><p className={cn("font-display text-xl", `text-app-${tone(st) === "outline" ? "muted" : tone(st)}`)}>{items.filter((c) => c.status === st).length}</p><p className="text-[9px] uppercase tracking-wider text-app-dim">{st}</p></Card>)}</div>
      <form className="mb-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (name) s.addComplianceItem({ tenderId: id, item: name }); setName(""); }}><Input className="flex-1" placeholder="Add compliance item…" value={name} onChange={(e) => setName(e.target.value)} /><Button variant="outline"><Plus size={13} /> Add</Button></form>
      <Table head={["Item", "Status", "Evidence", "Expiry", "Owner", "Notes", ""]}>
        {items.map((c) => <tr key={c.id}>
          <td className="px-3 py-2 text-app-text">{c.item}</td>
          <td className="px-3 py-2"><Select className={cn("py-1 text-xs", `text-app-${tone(c.status) === "outline" ? "muted" : tone(c.status)}`)} value={c.status} onChange={(e) => s.updateComplianceItem(c.id, { status: e.target.value as ComplianceStatus })}>{statuses.map((x) => <option key={x}>{x}</option>)}</Select></td>
          <td className="px-3 py-2"><Input className="w-full border-0 bg-transparent py-1 text-xs" value={c.evidence} placeholder="cert #, document…" onChange={(e) => s.updateComplianceItem(c.id, { evidence: e.target.value })} /></td>
          <td className="px-3 py-2"><Input type="date" className="border-0 bg-transparent py-1 text-xs" value={c.expiry || ""} onChange={(e) => s.updateComplianceItem(c.id, { expiry: e.target.value, status: e.target.value && new Date(e.target.value) < new Date() ? "Expired" : c.status })} /></td>
          <td className="px-3 py-2"><Select className="py-1 text-xs" value={c.owner} onChange={(e) => s.updateComplianceItem(c.id, { owner: e.target.value })}><option value="">—</option>{s.users.map((u) => <option key={u.id}>{u.name}</option>)}</Select></td>
          <td className="px-3 py-2"><Input className="w-full border-0 bg-transparent py-1 text-xs" value={c.notes} onChange={(e) => s.updateComplianceItem(c.id, { notes: e.target.value })} /></td>
          <td className="px-3 py-2"><button onClick={() => s.deleteComplianceItem(c.id)} className="text-app-dim hover:text-app-red"><Trash2 size={12} /></button></td>
        </tr>)}
      </Table>
      <div className="mt-8"><SectionTitle right="tender requirements vs. Our Capabilities">Capability matching</SectionTitle>
        <Card className="divide-y divide-app-border">
          {[...reqs.filter((r) => ["Experience", "Certification", "Licensing", "Equipment", "Local content", "HSE", "Data/privacy", "Security", "Quality"].includes(r.category)).map((r) => ({ key: r.id, item: r.text, cat: r.category })), ...items.filter((c) => !reqs.some((r) => r.text.includes(c.item))).map((c) => ({ key: c.id, item: c.item, cat: "Compliance" }))].map((x) => { const m = match(x.item); return (
            <div key={x.key} className="flex items-center justify-between gap-4 px-4 py-2.5 text-[13px]"><div><p className="text-app-text">{x.item}</p><p className="text-[11px] text-app-dim">{x.cat}{m.cap && ` · we have: ${m.cap.name} = ${m.cap.value}${m.cap.expiry ? ` (exp. ${m.cap.expiry})` : ""}`}</p></div><Badge tone={m.tone}><m.icon size={10} /> {m.label}</Badge></div>
          ); })}
        </Card>
        <Label className="mt-2">Maintain the organisation profile under Tender Intelligence → Our Capabilities. Matching is indicative; confirm each item before Go/No-Go.</Label></div>
    </div>
  );
}
