"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Button, Card, Badge, Label, Modal, Field, Input, Textarea, Select } from "@/components/ui";
import { useStore } from "@/store/useStore";
import { avg } from "@/lib/vendors";
import { partnerTypes } from "@/lib/industries";
import { useIndustries } from "@/lib/useIndustries";
import { money } from "@/components/app/charts";

export default function VendorDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { vendors, addRating, deleteRating, updateVendor, deleteVendor } = useStore();
  const v = vendors.find((x) => x.id === id); const industries = useIndustries();
  const [cert, setCert] = useState({ name: "", expiry: "" });
  const [rate, setRate] = useState(false);
  const [edit, setEdit] = useState(false);
  const [r, setR] = useState({ project: "", date: new Date().toISOString().slice(0, 10), price: 3, quality: 3, schedule: 3, hse: 3, comment: "" });
  const [f, setF] = useState({ name: v?.name || "", categories: v?.categories.join(", ") || "", notes: v?.notes || "" });
  if (!v) return <p className="text-sm text-app-muted">Vendor not found.</p>;
  const a = avg(v);

  return (
    <div className="font-sans">
      <Link href="/app/vendors" className="mb-4 flex items-center gap-1 text-xs text-app-muted hover:text-app-text"><ChevronLeft size={13} /> Back to directory</Link>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl text-app-text">{v.name}</h1>
          <div className="mt-2 flex gap-1.5">{v.categories.map((c) => <Badge key={c}>{c}</Badge>)}</div>
          <p className="mt-2 flex items-center gap-1 text-xs text-app-muted">{a ? <><Star size={12} className="fill-app-yellow text-app-yellow" /><span className="text-app-text">{a}</span> ({v.ratings.length} rating{v.ratings.length > 1 ? "s" : ""})</> : "No ratings yet"}</p>
        </div>
        <div className="flex gap-2"><button onClick={() => setEdit(true)} className="text-app-muted hover:text-app-text"><Pencil size={14} /></button><button onClick={() => { if (confirm("Delete vendor?")) { deleteVendor(v.id); router.push("/app/vendors"); } }} className="text-app-muted hover:text-app-red"><Trash2 size={14} /></button></div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="p-4">
          <Label className="mb-2">Partner profile</Label>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Type"><Select className="w-full" value={v.type || "Supplier"} onChange={(e) => updateVendor(v.id, { type: e.target.value })}>{partnerTypes.map((x) => <option key={x}>{x}</option>)}</Select></Field>
            <Field label="Industry"><Select className="w-full" value={v.industry || "other"} onChange={(e) => updateVendor(v.id, { industry: e.target.value })}>{industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</Select></Field>
            <Field label="Country"><Input className="w-full" value={v.country || ""} onChange={(e) => updateVendor(v.id, { country: e.target.value })} /></Field>
            <Field label="Products"><Input className="w-full" value={(v.products || []).join(", ")} onChange={(e) => updateVendor(v.id, { products: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></Field>
            <Field label="Licences"><Input className="w-full" value={(v.licences || []).join(", ")} onChange={(e) => updateVendor(v.id, { licences: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></Field>
            <Field label="Equipment"><Input className="w-full" value={(v.equipment || []).join(", ")} onChange={(e) => updateVendor(v.id, { equipment: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></Field>
            <Field label="Employees"><Input type="number" className="w-full" value={v.employees || 0} onChange={(e) => updateVendor(v.id, { employees: +e.target.value })} /></Field>
            <Field label="Revenue (USD)"><Input type="number" className="w-full" value={v.revenue || 0} onChange={(e) => updateVendor(v.id, { revenue: +e.target.value })} /></Field>
            <div><Label>Track record</Label><p className="mt-1 text-[13px] text-app-text">{v.previousBids || 0} previous bids · {v.contracts || 0} contracts{v.revenue ? ` · ${money(v.revenue)}` : ""}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <Label className="mb-2">Certifications & expiry</Label>
          <div className="space-y-1">{(v.certifications || []).map((c, i) => { const exp = c.expiry && new Date(c.expiry) < new Date(); return <div key={i} className="flex items-center justify-between text-xs"><span className="text-app-text">{c.name}</span><span className="flex items-center gap-2"><span className={exp ? "text-app-red" : "text-app-muted"}>{c.expiry || "no expiry"}{exp && " · expired"}</span><button onClick={() => updateVendor(v.id, { certifications: (v.certifications || []).filter((_, k) => k !== i) })} className="text-app-dim hover:text-app-red"><Trash2 size={11} /></button></span></div>; })}{!(v.certifications || []).length && <p className="text-xs text-app-dim">None recorded.</p>}</div>
          <form className="mt-3 flex gap-1" onSubmit={(e) => { e.preventDefault(); if (cert.name) updateVendor(v.id, { certifications: [...(v.certifications || []), cert] }); setCert({ name: "", expiry: "" }); }}><Input className="flex-1 py-1 text-xs" placeholder="ISO 14001" value={cert.name} onChange={(e) => setCert({ ...cert, name: e.target.value })} /><Input type="date" className="py-1 text-xs" value={cert.expiry} onChange={(e) => setCert({ ...cert, expiry: e.target.value })} /><Button size="sm" variant="outline"><Plus size={11} /></Button></form>
        </Card>
      </div>
      <Label className="mt-6">Notes</Label>
      <p className="mt-1 text-[13px] text-app-text">{v.notes || <span className="text-app-dim">No notes.</span>}</p>
      <div className="mt-6 mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold text-app-text">Rating history</h2><Button variant="outline" onClick={() => setRate(true)}><Plus size={13} /> Add rating</Button></div>
      <div className="space-y-2">
        {v.ratings.map((x) => (
          <Card key={x.id} className="p-4">
            <div className="flex items-start justify-between"><p className="text-[13px] font-semibold text-app-text">{x.project}</p><span className="flex items-center gap-3 text-xs text-app-muted">{x.date}<button onClick={() => deleteRating(v.id, x.id)} className="hover:text-app-red"><Trash2 size={12} /></button></span></div>
            <p className="mt-2 flex gap-4 text-xs text-app-muted"><span>Price: <span className="text-app-text">{x.price}/5</span></span><span>Quality: <span className="text-app-text">{x.quality}/5</span></span><span>Schedule: <span className="text-app-text">{x.schedule}/5</span></span><span>HSE: <span className="text-app-text">{x.hse}/5</span></span></p>
            <p className="mt-2 text-xs text-app-text">{x.comment}</p>
          </Card>
        ))}
        {v.ratings.length === 0 && <p className="text-xs text-app-dim">No ratings yet. Rate this vendor after a project to build the track record.</p>}
      </div>

      <Modal open={rate} onClose={() => setRate(false)} title="Add rating" sub="Score 1–5 on each dimension.">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); addRating(v.id, r); setRate(false); }}>
          <Field label="Project"><Input required className="w-full" value={r.project} onChange={(e) => setR({ ...r, project: e.target.value })} placeholder="e.g. Terra Nova Phase 2 (2024)" /></Field>
          <Field label="Date"><Input type="date" className="w-full" value={r.date} onChange={(e) => setR({ ...r, date: e.target.value })} /></Field>
          <div className="grid grid-cols-4 gap-2">{(["price", "quality", "schedule", "hse"] as const).map((k) => <Field key={k} label={k.toUpperCase()}><Select className="w-full" value={r[k]} onChange={(e) => setR({ ...r, [k]: +e.target.value })}>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}</Select></Field>)}</div>
          <Field label="Comment"><Textarea className="w-full" value={r.comment} onChange={(e) => setR({ ...r, comment: e.target.value })} /></Field>
          <div className="flex justify-end"><Button variant="primary">Save rating</Button></div>
        </form>
      </Modal>
      <Modal open={edit} onClose={() => setEdit(false)} title="Edit vendor">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); updateVendor(v.id, { name: f.name, categories: f.categories.split(",").map((s) => s.trim()).filter(Boolean), notes: f.notes }); setEdit(false); }}>
          <Field label="Name"><Input className="w-full" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Categories"><Input className="w-full" value={f.categories} onChange={(e) => setF({ ...f, categories: e.target.value })} /></Field>
          <Field label="Notes"><Textarea className="w-full" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
          <div className="flex justify-end"><Button variant="primary">Save</Button></div>
        </form>
      </Modal>
    </div>
  );
}
