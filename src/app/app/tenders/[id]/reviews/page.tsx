"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Check, X, RotateCcw, Plus, MessageSquare } from "lucide-react";
import { Card, Badge, Button, Select, Textarea, PageHeader, Label, Field } from "@/components/ui";
import { useStore } from "@/store/useStore";
import { reviewStages } from "@/lib/industries";
import type { Review } from "@/store/types";

const tone = (st: Review["status"]) => st === "Approved" ? "green" : st === "Rejected" ? "red" : st === "Revision requested" ? "yellow" : "outline";

export default function Reviews() {
  const { id } = useParams<{ id: string }>(); const s = useStore();
  const list = s.reviews.filter((r) => r.tenderId === id);
  const [f, setF] = useState({ stage: reviewStages[0] as string, reviewer: s.users[0]?.name || "" });
  const [comment, setComment] = useState<Record<string, string>>({});
  return (
    <div>
      <PageHeader title="Reviews" sub="Every stage must be approved before submission. Every action is written to the audit trail." />
      <div className="mb-5 grid gap-2 sm:grid-cols-4 lg:grid-cols-7">{reviewStages.map((st) => { const r = list.filter((x) => x.stage === st); const last = r[r.length - 1]; return <Card key={st} className="p-3"><p className="text-[11px] text-app-muted">{st}</p><Badge tone={last ? tone(last.status) : "outline"} className="mt-1">{last?.status || "Not assigned"}</Badge></Card>; })}</div>
      <Card className="mb-5 flex flex-wrap items-end gap-3 p-4">
        <Field label="Stage"><Select value={f.stage} onChange={(e) => setF({ ...f, stage: e.target.value })}>{reviewStages.map((x) => <option key={x}>{x}</option>)}</Select></Field>
        <Field label="Reviewer"><Select value={f.reviewer} onChange={(e) => setF({ ...f, reviewer: e.target.value })}>{s.users.map((u) => <option key={u.id}>{u.name} ({u.role})</option>)}</Select></Field>
        <Button variant="primary" onClick={() => { s.addReview({ tenderId: id, ...f, status: "Pending", comment: "" }); s.notify("Review assigned", `${f.stage} assigned to ${f.reviewer}`, `/app/tenders/${id}/reviews`); }}><Plus size={13} /> Assign review</Button>
      </Card>
      <div className="space-y-2">
        {list.slice().reverse().map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><p className="text-[13px] font-semibold text-app-text">{r.stage}</p><Badge tone={tone(r.status)}>{r.status}</Badge></div><p className="text-[11px] text-app-dim">{r.reviewer} · {new Date(r.at).toLocaleString()}</p></div>
            {r.comment && <p className="mt-2 flex items-start gap-1 text-xs text-app-muted"><MessageSquare size={11} className="mt-0.5" /> {r.comment}</p>}
            {r.status === "Pending" && <div className="mt-3 flex flex-wrap items-end gap-2"><Textarea className="min-h-[40px] flex-1" placeholder="Reviewer comment…" value={comment[r.id] || ""} onChange={(e) => setComment({ ...comment, [r.id]: e.target.value })} />
              <Button size="sm" variant="primary" onClick={() => s.updateReview(r.id, { status: "Approved", comment: comment[r.id] || "" })}><Check size={11} /> Approve</Button>
              <Button size="sm" variant="outline" onClick={() => s.updateReview(r.id, { status: "Revision requested", comment: comment[r.id] || "" })}><RotateCcw size={11} /> Request revision</Button>
              <Button size="sm" variant="outline" onClick={() => s.updateReview(r.id, { status: "Rejected", comment: comment[r.id] || "" })}><X size={11} /> Reject</Button></div>}
            {r.status === "Revision requested" && <Button size="sm" variant="outline" className="mt-2" onClick={() => s.updateReview(r.id, { status: "Pending" })}>Resubmit for review</Button>}
          </Card>
        ))}
        {list.length === 0 && <Card className="p-8 text-center text-xs text-app-dim">No reviews assigned.</Card>}
      </div>
      <Label className="mt-4">Reviewers can Approve, Reject, Edit, Comment, Request Revision or Assign. Reviews feed Submission readiness.</Label>
    </div>
  );
}
