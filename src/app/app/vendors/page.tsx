"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Save, X, Search, Star } from "lucide-react";
import { Button, Card, Field, Input, Textarea, Select, PageHeader } from "@/components/ui";
import { useStore } from "@/store/useStore";
import { avg } from "@/lib/vendors";
import { partnerTypes } from "@/lib/industries";
import { useIndustries } from "@/lib/useIndustries";

export default function VendorsPage() {
  const { vendors, addVendor } = useStore(); const industries = useIndustries();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", categories: "", notes: "", type: "Supplier", industry: "other", country: "" });
  const [ptype, setPtype] = useState("All types");
  const [q, setQ] = useState(""); const [cat, setCat] = useState("All categories"); const [rating, setRating] = useState("Any rating");
  const cats = useMemo(() => Array.from(new Set(vendors.flatMap((v) => v.categories))).sort(), [vendors]);
  const list = vendors.filter((v) => v.name.toLowerCase().includes(q.toLowerCase()) && (ptype === "All types" || v.type === ptype) && (cat === "All categories" || v.categories.includes(cat)) && (rating === "Any rating" || (avg(v) ? +avg(v)! >= +rating : false)));

  return (
    <div className="font-sans">
      <PageHeader title="Vendors & Partners" sub={`${vendors.length} partner(s) · contractors, suppliers, manufacturers, consultants, subcontractors, JV & technology partners`} right={<Button variant="primary" onClick={() => setAdding(true)}><Plus size={14} /> Add vendor</Button>} />
      {adding && (
        <Card className="mb-4 p-4">
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); addVendor({ name: form.name, type: form.type, industry: form.industry, country: form.country, categories: form.categories.split(",").map((s) => s.trim()).filter(Boolean), notes: form.notes }); setForm({ name: "", categories: "", notes: "", type: "Supplier", industry: "other", country: "" }); setAdding(false); }}>
            <Field label="Vendor name"><Input required autoFocus className="w-full" placeholder="e.g. Hengtong Marine" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Partner type"><Select className="w-full" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{partnerTypes.map((x) => <option key={x}>{x}</option>)}</Select></Field>
              <Field label="Industry"><Select className="w-full" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}>{industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</Select></Field>
              <Field label="Country"><Input className="w-full" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
            </div>
            <Field label="Categories / services (comma-separated)"><Input className="w-full" placeholder="e.g. flexible-pipes, vessels, survey" value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} /></Field>
            <Field label="Notes"><Textarea className="w-full" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            <div className="flex gap-2"><Button variant="ghost"><Save size={13} /> Save</Button><Button type="button" variant="outline" onClick={() => setAdding(false)}><X size={13} /> Cancel</Button></div>
          </form>
        </Card>
      )}
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[240px]"><Search size={13} className="absolute left-2.5 top-2.5 text-app-dim" /><Input className="w-full pl-8" placeholder="Search vendors by name..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Select value={ptype} onChange={(e) => setPtype(e.target.value)}><option>All types</option>{partnerTypes.map((x) => <option key={x}>{x}</option>)}</Select>
        <Select value={cat} onChange={(e) => setCat(e.target.value)}><option>All categories</option>{cats.map((c) => <option key={c}>{c}</option>)}</Select>
        <Select value={rating} onChange={(e) => setRating(e.target.value)}><option>Any rating</option><option value="4">4+ stars</option><option value="3">3+ stars</option></Select>
      </div>
      <div className="space-y-2">
        {list.map((v) => { const a = avg(v); return (
          <Link key={v.id} href={`/app/vendors/${v.id}`}><Card className="flex items-center justify-between px-4 py-3 hover:border-app-border-2">
            <span className="flex items-center gap-2 text-[13px] font-medium text-app-text">{v.name}{v.type && <span className="rounded-sm border border-app-border-2 px-1.5 py-0.5 text-[10px] text-app-muted">{v.type}</span>}{v.certifications?.some((c) => c.expiry && new Date(c.expiry) < new Date()) && <span className="rounded-sm border border-app-red/40 px-1.5 py-0.5 text-[10px] text-app-red">expired cert</span>}</span>
            <span className="flex items-center gap-3 text-xs text-app-muted">{industries.find((i) => i.id === v.industry)?.name}{v.country && ` · ${v.country}`} · {v.categories.join(", ")}{a ? <span className="flex items-center gap-1 text-app-text"><Star size={12} className="fill-app-yellow text-app-yellow" />{a} <span className="text-app-muted">({v.ratings.length} rating{v.ratings.length > 1 ? "s" : ""})</span></span> : <span className="text-app-dim">No ratings yet</span>}</span>
          </Card></Link>
        ); })}
        {list.length === 0 && <p className="py-10 text-center text-xs text-app-dim">No vendors match.</p>}
      </div>
    </div>
  );
}
