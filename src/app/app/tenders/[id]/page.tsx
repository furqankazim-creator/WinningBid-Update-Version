"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, Label, SectionTitle, Badge, Select, Input, Field, Textarea } from "@/components/ui";
import { useStore } from "@/store/useStore";
import { useIndustries } from "@/lib/useIndustries";
import { tenderTypes, regions } from "@/lib/industries";
import type { TenderStage } from "@/store/types";
import { TenderOverview } from "@/components/app/TenderOverview";
import { formatDistanceToNow } from "date-fns";

const stages: TenderStage[] = ["Analysis", "Qualification", "Go/No-Go", "Bid Preparation", "Review", "Approval", "Submitted", "Under Evaluation", "Clarification", "Negotiation", "Awarded", "Rejected", "Withdrawn", "Cancelled"];

export default function Overview() {
  const { id } = useParams<{ id: string }>(); const s = useStore(); const industries = useIndustries();
  const t = s.tenders.find((x) => x.id === id)!; const ind = industries.find((i) => i.id === t.industry);
  const up = (p: Partial<typeof t>) => s.updateTender(t.id, p);
  const acts = s.activities.filter((a) => (a.entity === "tender" && a.entityId === t.id) || (a.entity === "opportunity" && a.entityId === t.opportunityId));
  const audit = s.auditLog.filter((a) => a.entityId === t.id || s.priceVersions.some((p) => p.tenderId === t.id && p.id === a.entityId) || s.approvals.some((p) => p.tenderId === t.id && p.id === a.entityId)).slice(0, 8);
  const checks = [t.reference, t.client, t.closing, t.value > 0, t.industry !== "other", t.service, t.region, t.owner, t.description]; const filled = checks.filter(Boolean).length;
  return (
    <div className="space-y-6">
      <TenderOverview tenderId={t.id} />
      <div className="pt-1"><SectionTitle right={<span className="text-[11px] text-app-dim">edits save automatically</span>}>Tender record</SectionTitle></div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4"><SectionTitle right={<span className="text-[11px] text-app-dim">{filled}/{checks.length} fields complete</span>}>Tender details</SectionTitle>
          <div className="mb-4 h-1.5 overflow-hidden rounded bg-app-panel-2"><div className={filled === checks.length ? "h-full bg-app-green" : "h-full bg-app-accent"} style={{ width: `${Math.round((filled / checks.length) * 100)}%` }} /></div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Reference"><Input className="w-full" value={t.reference} onChange={(e) => up({ reference: e.target.value })} /></Field>
            <Field label="Tender type"><Select className="w-full" value={t.tenderType} onChange={(e) => up({ tenderType: e.target.value })}>{tenderTypes.map((x) => <option key={x}>{x}</option>)}</Select></Field>
            <Field label="Industry"><Select className="w-full" value={t.industry} onChange={(e) => up({ industry: e.target.value, service: "" })}>{industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</Select></Field>
            <Field label="Service"><Select className="w-full" value={t.service} onChange={(e) => up({ service: e.target.value })}><option value="">—</option>{ind?.services.map((x) => <option key={x}>{x}</option>)}</Select></Field>
            <Field label="Region"><Select className="w-full" value={t.region} onChange={(e) => up({ region: e.target.value })}>{regions.map((r) => <option key={r}>{r}</option>)}</Select></Field>
            <Field label="Owner"><Select className="w-full" value={t.owner} onChange={(e) => up({ owner: e.target.value })}>{s.users.map((u) => <option key={u.id}>{u.name}</option>)}</Select></Field>
            <Field label="Estimated value"><Input type="number" className="w-full" value={t.value} onChange={(e) => up({ value: +e.target.value })} /></Field>
            <Field label="Currency"><Select className="w-full" value={t.currency} onChange={(e) => up({ currency: e.target.value })}>{["USD", "EUR", "GBP", "CAD", "AED", "SAR", "INR", "NOK"].map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Submission deadline"><Input type="date" className="w-full" value={t.closing} onChange={(e) => up({ closing: e.target.value })} /></Field>
            <Field label="Stage"><Select className="w-full" value={t.stage} onChange={(e) => up({ stage: e.target.value as TenderStage })}>{stages.map((x) => <option key={x}>{x}</option>)}</Select></Field>
          </div>
          {(ind?.customFields || []).length > 0 && <div className="mt-4"><Label className="mb-2">{ind?.name} fields</Label><div className="grid grid-cols-2 gap-3">{ind!.customFields!.map((f) => <Field key={f} label={f}><Input className="w-full" value={t.metadata[f] || ""} onChange={(e) => up({ metadata: { ...t.metadata, [f]: e.target.value } })} /></Field>)}</div></div>}
          <Field label="Scope / description" className="mt-3"><Textarea className="w-full" value={t.description} onChange={(e) => up({ description: e.target.value })} /></Field>
        </Card>
        <div className="space-y-4">
          <Card className="p-4"><SectionTitle>Client</SectionTitle>{t.companyId ? <Link href={`/app/companies/${t.companyId}`} className="text-[13px] text-app-accent hover:underline">{t.client}</Link> : <p className="text-[13px] text-app-text">{t.client}</p>}<p className="mt-1 text-xs text-app-muted">{s.contacts.filter((c) => c.companyId === t.companyId).map((c) => `${c.name} (${c.role})`).join(" · ") || "No contacts linked"}</p>{t.opportunityId && <p className="mt-2 text-[11px] text-app-dim">From opportunity: {s.opportunities.find((o) => o.id === t.opportunityId)?.name}</p>}</Card>
          <Card className="p-4"><SectionTitle>Industry template · {ind?.icon} {ind?.name}</SectionTitle><p className="text-xs text-app-muted">Applied to this workspace: {ind?.compliance.length} compliance items, {ind?.costCategories.length} cost categories, {ind?.riskCategories.length} risk categories, {ind?.engineeringSections.length} engineering sections. <Link href="/app/admin/templates" className="text-app-accent">Edit templates</Link></p><div className="mt-2 flex flex-wrap gap-1">{ind?.requirementFocus.map((f) => <Badge key={f} tone="outline">{f}</Badge>)}</div></Card>
          <Card className="p-4"><SectionTitle>Recent activity</SectionTitle><div className="space-y-2 text-xs">{[...acts.map((a) => ({ id: a.id, at: a.at, text: `${a.kind}: ${a.text}`, by: a.by })), ...audit.map((a) => ({ id: a.id, at: a.at, text: `${a.action} ${a.entity}: ${a.detail}`, by: a.user }))].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8).map((a) => <div key={a.id} className="relative border-l border-app-border pl-3"><span className="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-app-accent" /><p className="text-app-text">{a.text}</p><p className="text-[10px] text-app-dim">{a.by} · {formatDistanceToNow(new Date(a.at), { addSuffix: true })}</p></div>)}{acts.length + audit.length === 0 && <p className="text-app-dim">No activity yet.</p>}</div></Card>
        </div>
      </div>
    </div>
  );
}
