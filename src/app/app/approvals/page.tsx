"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Card, Badge, Button, Textarea, PageHeader } from "@/components/ui";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/cn";

export default function Approvals() {
  const s = useStore(); const [tab, setTab] = useState<"Pending" | "Approved" | "Rejected">("Pending"); const [reason, setReason] = useState<Record<string, string>>({});
  const list = s.approvals.filter((a) => a.status === tab);
  return (
    <div className="font-sans">
      <PageHeader title="Approvals" sub="Management approvals for Go/No-Go, pricing, proposals, procurement awards and submission. Decisions are audited." />
      <div className="mb-4 flex w-max gap-1 rounded border border-app-border p-0.5">{(["Pending", "Approved", "Rejected"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={cn("rounded-sm px-3 py-1 text-xs", tab === t ? "bg-app-panel-2 text-app-text" : "text-app-muted")}>{t} <span className="font-mono text-[10px]">{s.approvals.filter((a) => a.status === t).length}</span></button>)}</div>
      <div className="space-y-2">
        {list.map((a) => { const t = s.tenders.find((x) => x.id === a.tenderId); return (
          <Card key={a.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2"><div><div className="flex items-center gap-2"><Badge tone="outline">{a.kind}</Badge><p className="text-[13px] font-semibold text-app-text">{a.subject}</p></div><p className="mt-1 text-[11px] text-app-muted">{t && <Link href={`/app/tenders/${t.id}`} className="text-app-accent hover:underline">{t.name}</Link>} · requested by {a.requestedBy} · approver {a.approver} · {new Date(a.at).toLocaleString()}</p>{a.reason && <p className="mt-1 text-xs text-app-text">{a.reason}</p>}</div><Badge tone={a.status === "Approved" ? "green" : a.status === "Rejected" ? "red" : "yellow"}>{a.status}</Badge></div>
            {a.status === "Pending" && <div className="mt-3 flex flex-wrap items-end gap-2"><Textarea className="min-h-[40px] flex-1" placeholder="Decision reason…" value={reason[a.id] || ""} onChange={(e) => setReason({ ...reason, [a.id]: e.target.value })} /><Button size="sm" variant="primary" onClick={() => s.decideApproval(a.id, "Approved", reason[a.id] || "")}><Check size={11} /> Approve</Button><Button size="sm" variant="outline" onClick={() => s.decideApproval(a.id, "Rejected", reason[a.id] || "")}><X size={11} /> Reject</Button></div>}
          </Card>
        ); })}
        {list.length === 0 && <Card className="p-8 text-center text-xs text-app-dim">Nothing {tab.toLowerCase()}.</Card>}
      </div>
    </div>
  );
}
