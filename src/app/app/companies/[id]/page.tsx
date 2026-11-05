"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Trash2, Globe, MapPin } from "lucide-react";
import { Button, Card, Badge, Label, Input, Select, Textarea, Modal, Field, SectionTitle } from "@/components/ui";
import { useStore } from "@/store/useStore";
import { useIndustries } from "@/lib/useIndustries";
import { money } from "@/components/app/charts";
import type { Activity, Contact } from "@/store/types";

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>(); const router = useRouter();
  const s = useStore(); const industries = useIndustries();
  const c = s.companies.find((x) => x.id === id);
  const [contactOpen, setContactOpen] = useState(false); const [cf, setCf] = useState<Omit<Contact, "id" | "companyId">>({ name: "", title: "", email: "", phone: "", role: "", notes: "" });
  const [act, setAct] = useState<{ kind: Activity["kind"]; text: string }>({ kind: "Note", text: "" });
  if (!c) return <p className="text-sm text-app-muted">Company not found.</p>;
  const contacts = s.contacts.filter((x) => x.companyId === c.id); const opps = s.opportunities.filter((o) => o.companyId === c.id); const tenders = s.tenders.filter((t) => t.companyId === c.id);
  const acts = s.activities.filter((a) => (a.entity === "company" && a.entityId === c.id) || (a.entity === "opportunity" && opps.some((o) => o.id === a.entityId)));
  return (
    <div className="font-sans">
      <Link href="/app/companies" className="mb-4 flex items-center gap-1 text-xs text-app-muted hover:text-app-text"><ChevronLeft size={13} /> Companies</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><div className="flex items-center gap-2"><h1 className="font-display text-2xl text-app-text">{c.name}</h1><Badge tone={c.type === "Client" ? "green" : c.type === "Competitor" ? "red" : "outline"}>{c.type}</Badge></div>
          <p className="mt-1 flex flex-wrap gap-3 text-xs text-app-muted"><span>{industries.find((i) => i.id === c.industry)?.name}{c.subIndustry && ` · ${c.subIndustry}`}</span><span className="flex items-center gap-1"><MapPin size={11} />{c.country}, {c.region}</span>{c.website && <span className="flex items-center gap-1"><Globe size={11} />{c.website}</span>}</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => { const oid = s.addOpportunity({ name: `${c.name} — new opportunity`, companyId: c.id }); router.push(`/app/opportunities?focus=${oid}`); }}><Plus size={13} /> Opportunity</Button><Button variant="danger" onClick={() => { if (confirm("Delete company?")) { s.deleteCompany(c.id); router.push("/app/companies"); } }}><Trash2 size={13} /></Button></div>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div><SectionTitle right={<button onClick={() => setContactOpen(true)} className="flex items-center gap-1 text-app-accent"><Plus size={11} /> Add contact</button>}>Contacts</SectionTitle>
            <Card className="divide-y divide-app-border">{contacts.map((x) => <div key={x.id} className="flex items-center justify-between px-4 py-2.5 text-[13px]"><div><p className="text-app-text">{x.name} <span className="text-app-muted">· {x.title}</span></p><p className="text-[11px] text-app-dim">{x.email} · {x.phone} · {x.role}</p></div><button onClick={() => s.deleteContact(x.id)} className="text-app-dim hover:text-app-red"><Trash2 size={12} /></button></div>)}{contacts.length === 0 && <p className="px-4 py-4 text-xs text-app-dim">No contacts yet.</p>}</Card></div>
          <div><SectionTitle>Opportunities & tenders</SectionTitle>
            <Card className="divide-y divide-app-border">{opps.map((o) => <Link key={o.id} href="/app/opportunities" className="flex items-center justify-between px-4 py-2.5 text-[13px] hover:bg-app-panel-2"><div><p className="text-app-text">{o.name}</p><p className="text-[11px] text-app-dim">{o.service} · {o.probability}% · {o.owner}</p></div><div className="text-right"><Badge tone="outline">{o.stage}</Badge><p className="mt-1 text-[11px] text-app-muted">{money(o.value, o.currency)}</p></div></Link>)}{tenders.filter((t) => !opps.some((o) => o.tenderId === t.id)).map((t) => <Link key={t.id} href={`/app/tenders/${t.id}`} className="flex items-center justify-between px-4 py-2.5 text-[13px] hover:bg-app-panel-2"><p className="text-app-text">{t.name}</p><Badge tone="outline">{t.stage}</Badge></Link>)}{opps.length + tenders.length === 0 && <p className="px-4 py-4 text-xs text-app-dim">Nothing yet.</p>}</Card></div>
          <div><SectionTitle>Activity & communication history</SectionTitle>
            <form className="mb-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (act.text) s.addActivity({ entity: "company", entityId: c.id, ...act }); setAct({ kind: "Note", text: "" }); }}><Select value={act.kind} onChange={(e) => setAct({ ...act, kind: e.target.value as Activity["kind"] })}>{["Note", "Call", "Meeting", "Email", "WhatsApp"].map((k) => <option key={k}>{k}</option>)}</Select><Input className="flex-1" placeholder="Log an activity…" value={act.text} onChange={(e) => setAct({ ...act, text: e.target.value })} /><Button variant="outline">Log</Button></form>
            <Card className="divide-y divide-app-border">{acts.map((a) => <div key={a.id} className="px-4 py-2.5 text-[13px]"><div className="flex justify-between"><Badge tone="outline">{a.kind}</Badge><span className="text-[11px] text-app-dim">{a.by} · {new Date(a.at).toLocaleString()}</span></div><p className="mt-1 text-app-text">{a.text}</p></div>)}{acts.length === 0 && <p className="px-4 py-4 text-xs text-app-dim">No activity logged.</p>}</Card></div>
        </div>
        <div className="space-y-3">
          <Card className="p-4"><Label>Profile</Label>
            <div className="mt-2 space-y-2 text-[13px]">
              <Field label="Type"><Select className="w-full" value={c.type} onChange={(e) => s.updateCompany(c.id, { type: e.target.value as typeof c.type })}>{["Client", "Prospect", "Partner", "Competitor"].map((x) => <option key={x}>{x}</option>)}</Select></Field>
              <Field label="Industry"><Select className="w-full" value={c.industry} onChange={(e) => s.updateCompany(c.id, { industry: e.target.value })}>{industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</Select></Field>
              <Field label="Services"><Input className="w-full" value={c.services.join(", ")} onChange={(e) => s.updateCompany(c.id, { services: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></Field>
              <Field label="Certifications"><Input className="w-full" value={c.certifications.join(", ")} onChange={(e) => s.updateCompany(c.id, { certifications: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></Field>
              <Field label="Notes"><Textarea className="w-full" value={c.notes} onChange={(e) => s.updateCompany(c.id, { notes: e.target.value })} /></Field>
            </div></Card>
          <Card className="p-4"><Label>Relationship value</Label><p className="mt-1 font-display text-xl text-app-text">{money(opps.reduce((a, o) => a + o.value, 0))}</p><p className="text-[11px] text-app-dim">{opps.length} opportunities · {tenders.length} tenders · since {new Date(c.createdAt).getFullYear()}</p></Card>
        </div>
      </div>
      <Modal open={contactOpen} onClose={() => setContactOpen(false)} title="Add contact">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); s.addContact({ ...cf, companyId: c.id }); setContactOpen(false); }}>
          <div className="grid grid-cols-2 gap-3">{(["name", "title", "email", "phone", "role"] as const).map((k) => <Field key={k} label={k}><Input required={k === "name"} className="w-full" value={cf[k]} onChange={(e) => setCf({ ...cf, [k]: e.target.value })} /></Field>)}</div>
          <div className="flex justify-end"><Button variant="primary">Add</Button></div>
        </form>
      </Modal>
    </div>
  );
}
