"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Card, Badge, Button, Textarea, PageHeader, Label, Select } from "@/components/ui";
import { useStore } from "@/store/useStore";
import { useIndustry } from "@/lib/useIndustries";

// Engineering workspace is template-driven: sections come from the tender's industry template.
export default function Engineering() {
  const { id } = useParams<{ id: string }>(); const s = useStore();
  const t = s.tenders.find((x) => x.id === id)!; const ind = useIndustry(t.industry);
  const key = (sec: string) => `eng:${sec}`;
  const [status, setStatus] = useState<Record<string, string>>({}); const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <PageHeader title="Engineering" sub={`${ind.icon} ${ind.name} template · ${ind.engineeringSections.length} sections. Change the industry on Overview to switch templates.`} right={<Button variant="primary" disabled={s.analysisBusy} onClick={async () => setErr(await s.draftEngineering(t.id, ind.engineeringSections))}>{s.analysisBusy ? "Drafting…" : "AI draft inputs"}</Button>} />
      {err && <p className="mb-3 rounded border border-app-red/40 bg-app-red/10 px-3 py-2 text-xs text-app-red">{err}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {ind.engineeringSections.map((sec) => (
          <Card key={sec} className="p-4">
            <div className="flex items-center justify-between"><p className="text-[13px] font-semibold text-app-text">{sec}</p><Select className="py-0.5 text-xs" value={t.metadata[key(sec) + ":status"] || "Not started"} onChange={(e) => { s.updateTender(t.id, { metadata: { ...t.metadata, [key(sec) + ":status"]: e.target.value } }); setStatus({ ...status, [sec]: e.target.value }); }}>{["Not started", "In progress", "For review", "Approved"].map((x) => <option key={x}>{x}</option>)}</Select></div>
            <Textarea className="mt-2 w-full min-h-[110px]" placeholder={`Notes, deliverables and inputs for ${sec}…`} value={t.metadata[key(sec)] || ""} onChange={(e) => s.updateTender(t.id, { metadata: { ...t.metadata, [key(sec)]: e.target.value } })} />
          </Card>
        ))}
      </div>
      <Label className="mt-4">Deliverables produced here feed the Deliverables checklist and the Technical Proposal. <Badge tone="outline">Template: {ind.name}</Badge></Label>
    </div>
  );
}
