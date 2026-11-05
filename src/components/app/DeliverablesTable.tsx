"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader, Badge, Button, Select, Input, Table, ProgressBar } from "@/components/ui";
import { contributors } from "@/store/seed";
import { useScopedStore } from "@/store/useStore";
import type { Deliverable } from "@/store/types";

export function DeliverablesTable({ type }: { type?: Deliverable["type"] }) {
  const { deliverables, updateDeliverable, addDeliverable, deleteDeliverable } = useScopedStore();
  const [name, setName] = useState("");
  const list = deliverables.filter((d) => !type || d.type === type);
  const approved = list.filter((d) => d.status === "Approved").length;
  return (
    <div className="font-sans">
      <PageHeader title={type ? `Deliverables · ${type}` : "Deliverables Checklist"} sub={`${list.length} required by the ITT · ${approved} approved`} right={<div className="flex items-center gap-2"><ProgressBar value={(approved / (list.length || 1)) * 100} tone="green" className="w-32" /><span className="text-xs text-app-muted">{Math.round((approved / (list.length || 1)) * 100)}%</span></div>} />
      <form className="mb-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (name) addDeliverable(name, type || "Technical"); setName(""); }}><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add a deliverable…" className="flex-1" /><Button variant="outline"><Plus size={13} /> Add</Button></form>
      <Table head={["#", "Deliverable", "Type", "Owner", "Due", "Status", ""]}>
        {list.map((d) => (
          <tr key={d.id}>
            <td className="px-3 py-2 font-mono text-[11px] text-app-muted">{String(d.n).padStart(2, "0")}</td>
            <td className="px-3 py-2 text-app-text">{d.name}</td>
            <td className="px-3 py-2"><Badge tone="outline">{d.type}</Badge></td>
            <td className="px-3 py-2"><Select value={d.owner} onChange={(e) => updateDeliverable(d.id, { owner: e.target.value })} className="py-1 text-xs"><option value="">Unassigned</option>{contributors.filter((c) => c.name !== "TenderOS").map((c) => <option key={c.name}>{c.name}</option>)}</Select></td>
            <td className="px-3 py-2"><Input type="date" value={d.due} onChange={(e) => updateDeliverable(d.id, { due: e.target.value })} className="py-1 text-xs" /></td>
            <td className="px-3 py-2"><Select value={d.status} onChange={(e) => updateDeliverable(d.id, { status: e.target.value as Deliverable["status"] })} className={`py-1 text-xs ${d.status === "Approved" ? "text-app-green" : d.status === "Review" ? "text-app-purple" : ""}`}>{["Not started", "Drafting", "Review", "Approved"].map((s) => <option key={s}>{s}</option>)}</Select></td>
            <td className="px-3 py-2"><button onClick={() => deleteDeliverable(d.id)} className="text-app-dim hover:text-app-red"><Trash2 size={13} /></button></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
