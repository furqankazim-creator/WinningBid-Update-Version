"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button, Card, Badge, Input, Select, Modal, Field, PageHeader, Textarea } from "@/components/ui";
import { useStore, filterByIndustry } from "@/store/useStore";
import { useIndustries } from "@/lib/useIndustries";
import { regions } from "@/lib/industries";
import type { Company } from "@/store/types";

export default function Companies() {
  const s = useStore(); const industries = useIndustries();
  const [q, setQ] = useState(""); const [type, setType] = useState("All"); const [open, setOpen] = useState(false);
  const [f, setF] = useState<Partial<Company> & { name: string }>({ name: "", industry: "other", type: "Prospect", region: "Global", country: "", subIndustry: "", website: "", notes: "" });
  const list = filterByIndustry(s.companies, s.industryFilter).filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) && (type === "All" || c.type === type));
  const iname = (id: string) => industries.find((i) => i.id === id)?.name || id;
  return (
    <div className="font-sans">
      <PageHeader title="Companies" sub={`${s.companies.length} companies · clients, partners, competitors and prospects`} right={<Button variant="primary" onClick={() => setOpen(true)}><Plus size={13} /> Add company</Button>} />
      <div className="mb-4 flex flex-wrap gap-2"><div className="relative flex-1 min-w-[240px]"><Search size={13} className="absolute left-2.5 top-2.5 text-app-dim" /><Input className="w-full pl-8" placeholder="Search companies…" value={q} onChange={(e) => setQ(e.target.value)} /></div><Select value={type} onChange={(e) => setType(e.target.value)}>{["All", "Client", "Prospect", "Partner", "Competitor"].map((x) => <option key={x}>{x}</option>)}</Select></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => { const opps = s.opportunities.filter((o) => o.companyId === c.id); return (
          <Link key={c.id} href={`/app/companies/${c.id}`}><Card className="h-full p-4 hover:border-app-border-2">
            <div className="flex items-start justify-between"><h2 className="text-[15px] font-semibold text-app-text">{c.name}</h2><Badge tone={c.type === "Client" ? "green" : c.type === "Competitor" ? "red" : c.type === "Partner" ? "blue" : "outline"}>{c.type}</Badge></div>
            <p className="mt-1 text-xs text-app-muted">{iname(c.industry)}{c.subIndustry && ` · ${c.subIndustry}`} · {c.country || c.region}</p>
            <p className="mt-2 line-clamp-2 text-xs text-app-dim">{c.notes || "—"}</p>
            <div className="mt-3 flex gap-3 text-[11px] text-app-muted"><span>{s.contacts.filter((x) => x.companyId === c.id).length} contacts</span><span>{opps.length} opportunities</span><span>{s.tenders.filter((t) => t.companyId === c.id).length} tenders</span></div>
          </Card></Link>
        ); })}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Add company">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); s.addCompany(f); setOpen(false); }}>
          <Field label="Name"><Input required className="w-full" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type"><Select className="w-full" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as Company["type"] })}>{["Client", "Prospect", "Partner", "Competitor"].map((x) => <option key={x}>{x}</option>)}</Select></Field>
            <Field label="Industry"><Select className="w-full" value={f.industry} onChange={(e) => setF({ ...f, industry: e.target.value, subIndustry: "" })}>{industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</Select></Field>
            <Field label="Sub-industry / service"><Select className="w-full" value={f.subIndustry} onChange={(e) => setF({ ...f, subIndustry: e.target.value })}><option value="">—</option>{industries.find((i) => i.id === f.industry)?.services.map((x) => <option key={x}>{x}</option>)}</Select></Field>
            <Field label="Region"><Select className="w-full" value={f.region} onChange={(e) => setF({ ...f, region: e.target.value })}>{regions.map((r) => <option key={r}>{r}</option>)}</Select></Field>
            <Field label="Country"><Input className="w-full" value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} /></Field>
            <Field label="Website"><Input className="w-full" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></Field>
          </div>
          <Field label="Notes"><Textarea className="w-full" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
          <div className="flex justify-end"><Button variant="primary">Create</Button></div>
        </form>
      </Modal>
    </div>
  );
}
