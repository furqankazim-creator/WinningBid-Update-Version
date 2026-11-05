"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Lock, Plus, Send } from "lucide-react";
import { Card, Badge, Button, Input, Textarea, Field, PageHeader, Label, Table } from "@/components/ui";
import { useStore } from "@/store/useStore";
import { totals } from "@/lib/pricing";
import { money } from "@/components/app/charts";

export default function PricingVersions() {
  const { id } = useParams<{ id: string }>(); const s = useStore();
  const t = s.tenders.find((x) => x.id === id)!;
  const vs = s.priceVersions.filter((p) => p.tenderId === id).sort((a, b) => a.version - b.version);
  const cost = totals(s.costLines, s.margin).cost;
  const [f, setF] = useState({ margin: s.margin, discount: 0, tax: 0, validity: "90 days", paymentTerms: "", assumptions: "" });
  const price = (cost / (1 - f.margin / 100)) * (1 - f.discount / 100) * (1 + f.tax / 100);
  const locked = vs.find((v) => v.locked);
  return (
    <div>
      <PageHeader title="Pricing" sub={`Cost from Price build-up: ${money(cost, t.currency)}. Approved prices are locked; any change creates a new version.`} right={<Link href="/app/pricing/build-up" className="text-xs text-app-accent">Edit cost build-up →</Link>} />
      <Table head={["Version", "Cost", "Margin", "Discount", "Tax", "Final price", "Validity", "Payment terms", "Status", ""]}>
        {vs.map((v) => <tr key={v.id}><td className="px-3 py-2 font-mono text-app-text">v{v.version}</td><td className="px-3 py-2 text-app-muted">{money(v.cost, t.currency)}</td><td className="px-3 py-2 text-app-muted">{v.margin}%</td><td className="px-3 py-2 text-app-muted">{v.discount}%</td><td className="px-3 py-2 text-app-muted">{v.tax}%</td><td className="px-3 py-2 text-app-text">{money(v.price, t.currency)}</td><td className="px-3 py-2 text-app-muted">{v.validity}</td><td className="px-3 py-2 text-xs text-app-muted">{v.paymentTerms}</td><td className="px-3 py-2">{v.locked ? <Badge tone="green"><Lock size={10} /> Locked · {v.approvedBy}</Badge> : <Badge tone="outline">Draft</Badge>}</td>
          <td className="px-3 py-2"><div className="flex gap-1">{!v.locked && !locked && <Button size="sm" variant="outline" onClick={() => s.requestApproval({ tenderId: id, subject: `Price v${v.version} — ${money(v.price, t.currency)} @ ${v.margin}%`, kind: "Pricing", requestedBy: s.currentUser, approver: s.users.find((u) => u.role === "Executive")?.name || "Executive", reason: "" })}><Send size={10} /> Request approval</Button>}{!v.locked && !locked && s.approvals.some((a) => a.tenderId === id && a.kind === "Pricing" && a.status === "Approved" && a.subject.startsWith(`Price v${v.version}`)) && <Button size="sm" variant="primary" onClick={() => s.lockPrice(v.id)}><Lock size={10} /> Lock approved price</Button>}</div></td></tr>)}
        {vs.length === 0 && <tr><td colSpan={10} className="px-3 py-6 text-center text-xs text-app-dim">No price versions yet.</td></tr>}
      </Table>
      <Card className="mt-5 p-4">
        <Label className="mb-3">{locked ? `v${locked.version} is locked — creating a change produces v${vs.length + 1}` : `New price version v${vs.length + 1}`}</Label>
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="Target margin %"><Input type="number" className="w-full" value={f.margin} onChange={(e) => setF({ ...f, margin: +e.target.value })} /></Field>
          <Field label="Discount %"><Input type="number" className="w-full" value={f.discount} onChange={(e) => setF({ ...f, discount: +e.target.value })} /></Field>
          <Field label="Tax %"><Input type="number" className="w-full" value={f.tax} onChange={(e) => setF({ ...f, tax: +e.target.value })} /></Field>
          <Field label="Price validity"><Input className="w-full" value={f.validity} onChange={(e) => setF({ ...f, validity: e.target.value })} /></Field>
        </div>
        <Field label="Payment terms" className="mt-3"><Input className="w-full" value={f.paymentTerms} onChange={(e) => setF({ ...f, paymentTerms: e.target.value })} placeholder="e.g. 10% advance, milestones, 60 days" /></Field>
        <Field label="Commercial assumptions" className="mt-3"><Textarea className="w-full" value={f.assumptions} onChange={(e) => setF({ ...f, assumptions: e.target.value })} /></Field>
        <div className="mt-4 flex items-center justify-between"><div><Label>Final price</Label><p className="font-display text-2xl text-app-accent">{money(price, t.currency)}</p><p className="text-[11px] text-app-dim">{t.currency} · cost {money(cost, t.currency)} · markup {(((price - cost) / cost) * 100).toFixed(1)}%</p></div><Button variant="primary" onClick={() => s.createPriceVersion(id, { cost, margin: f.margin, discount: f.discount, tax: f.tax, price, validity: f.validity, paymentTerms: f.paymentTerms, assumptions: f.assumptions })}><Plus size={13} /> Create version v{vs.length + 1}</Button></div>
      </Card>
    </div>
  );
}
