"use client";
import { useState } from "react";
import { Input, Table, PageHeader, Badge } from "@/components/ui";
import { useStore } from "@/store/useStore";
import { exportCSV } from "@/components/app/shared";
import { Button } from "@/components/ui";

export default function Audit() {
  const s = useStore(); const [q, setQ] = useState("");
  const list = s.auditLog.filter((a) => (a.user + a.action + a.entity + a.detail).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="font-sans">
      <PageHeader title="Audit trail" sub="Immutable record of who created, edited, approved, rejected, priced, submitted or changed status. Entries cannot be edited or deleted from the UI." right={<Button variant="outline" onClick={() => exportCSV("audit-log", list.map((a) => ({ At: a.at, User: a.user, Action: a.action, Entity: a.entity, Id: a.entityId, Detail: a.detail })))}>Export CSV</Button>} />
      <Input className="mb-4 w-full max-w-md" placeholder="Filter by user, action, entity…" value={q} onChange={(e) => setQ(e.target.value)} />
      <Table head={["Timestamp", "User", "Action", "Entity", "Detail"]}>
        {list.map((a) => <tr key={a.id}><td className="px-3 py-2 font-mono text-[11px] text-app-muted">{new Date(a.at).toLocaleString()}</td><td className="px-3 py-2 text-app-text">{a.user}</td><td className="px-3 py-2"><Badge tone={/approve|lock/i.test(a.action) ? "green" : /reject|delete/i.test(a.action) ? "red" : "outline"}>{a.action}</Badge></td><td className="px-3 py-2 text-app-muted">{a.entity} <span className="font-mono text-[10px] text-app-dim">{a.entityId}</span></td><td className="px-3 py-2 text-xs text-app-text">{a.detail}</td></tr>)}
      </Table>
    </div>
  );
}
