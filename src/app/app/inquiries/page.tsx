"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Mail, Globe, Link2, Plus, XCircle, Sparkles } from "lucide-react";
import { Button, Card, Badge, Label, Select, PageHeader } from "@/components/ui";
import { useStore } from "@/store/useStore";
import type { Inquiry } from "@/store/types";
import { cn } from "@/lib/cn";

const Icon = ({ c }: { c: Inquiry["channel"] }) => c === "WhatsApp" ? <MessageCircle size={13} className="text-app-green" /> : c === "Email" ? <Mail size={13} className="text-app-blue" /> : <Globe size={13} className="text-app-purple" />;

export default function Inquiries() {
  const s = useStore(); const router = useRouter();
  const [tab, setTab] = useState<"New" | "Inquiry" | "Attached" | "Ignored">("New");
  const [link, setLink] = useState<Record<string, string>>({});
  const list = s.inquiries.filter((i) => i.status === tab);
  const createOpp = (i: Inquiry) => {
    let coId = s.companies.find((c) => c.name.toLowerCase() === i.company.toLowerCase())?.id;
    if (!coId) coId = s.addCompany({ name: i.company, industry: i.extracted?.industry || "other", type: "Prospect" });
    const oid = s.addOpportunity({ name: i.extracted?.requirement || i.subject, companyId: coId, industry: i.extracted?.industry, expectedAward: i.extracted?.deadline, value: i.extracted?.value, source: i.channel, notes: i.body });
    s.markInquiry(i.id, "Attached", { opportunityId: oid }); s.audit("Inquiry → Opportunity", "Inquiry", i.id, i.subject); router.push("/app/opportunities");
  };
  return (
    <div className="font-sans">
      <PageHeader title="Inquiries" sub="Incoming WhatsApp, email and website messages routed by n8n. Not every message is an inquiry — classify before creating records." />
      <div className="mb-4 flex gap-1 rounded border border-app-border p-0.5 w-max">{(["New", "Inquiry", "Attached", "Ignored"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={cn("rounded-sm px-3 py-1 text-xs", tab === t ? "bg-app-panel-2 text-app-text" : "text-app-muted")}>{t} <span className="font-mono text-[10px]">{s.inquiries.filter((i) => i.status === t).length}</span></button>)}</div>
      <div className="space-y-3">
        {list.length === 0 && <Card className="p-6 text-center text-xs text-app-dim">Nothing here.</Card>}
        {list.map((i) => (
          <Card key={i.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3"><Icon c={i.channel} /><div><p className="text-[13px] font-semibold text-app-text">{i.subject}</p><p className="text-[11px] text-app-muted">{i.from} · {i.company} · {new Date(i.receivedAt).toLocaleString()}</p><p className="mt-2 max-w-2xl text-xs text-app-text">{i.body}</p></div></div>
              <Badge tone={i.status === "New" ? "accent" : i.status === "Attached" ? "green" : "outline"}>{i.status}</Badge>
            </div>
            {i.extracted && <div className="mt-3 rounded border border-app-border bg-app-bg p-3"><Label className="mb-1 flex items-center gap-1"><Sparkles size={10} /> AI extracted · needs verification</Label><div className="flex flex-wrap gap-1.5">{Object.entries(i.extracted).map(([k, v]) => <Badge key={k} tone="outline">{k}: {String(v)}</Badge>)}</div></div>}
            {i.status !== "Attached" && i.status !== "Ignored" && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {i.status === "New" && <Button size="sm" variant="outline" onClick={() => s.markInquiry(i.id, "Inquiry")}>Mark as Inquiry</Button>}
                <Button size="sm" variant="primary" onClick={() => createOpp(i)}><Plus size={12} /> Create new opportunity</Button>
                <Select className="py-1 text-xs" value={link[i.id] || ""} onChange={(e) => setLink({ ...link, [i.id]: e.target.value })}><option value="">Attach to existing…</option><optgroup label="Tenders">{s.tenders.map((t) => <option key={t.id} value={`t:${t.id}`}>{t.reference} {t.name}</option>)}</optgroup><optgroup label="Opportunities">{s.opportunities.map((o) => <option key={o.id} value={`o:${o.id}`}>{o.name}</option>)}</optgroup></Select>
                <Button size="sm" variant="outline" disabled={!link[i.id]} onClick={() => { const [k, id] = link[i.id].split(":"); s.markInquiry(i.id, "Attached", k === "t" ? { tenderId: id } : { opportunityId: id }); s.addActivity({ entity: k === "t" ? "tender" : "opportunity", entityId: id, kind: i.channel === "Website" ? "Email" : i.channel, text: `${i.subject}: ${i.body}` }); s.audit("Inquiry attached", "Inquiry", i.id, link[i.id]); }}><Link2 size={12} /> Attach</Button>
                <Button size="sm" variant="ghost" onClick={() => s.markInquiry(i.id, "Ignored")}><XCircle size={12} /> Not an inquiry</Button>
              </div>
            )}
            {i.status === "Attached" && <p className="mt-2 text-[11px] text-app-muted">Attached to {i.linkedTenderId ? s.tenders.find((t) => t.id === i.linkedTenderId)?.name : s.opportunities.find((o) => o.id === i.linkedOpportunityId)?.name}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
