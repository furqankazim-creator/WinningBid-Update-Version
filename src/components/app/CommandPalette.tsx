"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, ArrowRight } from "lucide-react";
import { Modal, Input, Field, Button } from "@/components/ui";
import { allPagesFor } from "./nav";
import { useRole } from "@/lib/api";
import { useIndustries } from "@/lib/useIndustries";
import { tenderTypes } from "@/lib/industries";
import { useUI } from "./ui-state";
import { useStore } from "@/store/useStore";

export function CommandPalette() {
  const router = useRouter();
  const { palette, setPalette } = useUI();
  const { tenders, activeTenderId, setActiveTender, addTender, companies, contacts, opportunities, requirements, vendors } = useStore();
  const industries = useIndustries();
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const blank = { name: "", client: "", closing: "", description: "", industry: "other", tenderType: "Tender", reference: "", value: "" };
  const [form, setForm] = useState(blank);
  const today = new Date().toISOString().slice(0, 10);
  const matchedCompany = companies.find((c) => c.name.trim().toLowerCase() === form.client.trim().toLowerCase());

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette(true); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [setPalette]);
  useEffect(() => { if (!palette) { setQ(""); setCreating(false); setForm(blank); } }, [palette]); // eslint-disable-line react-hooks/exhaustive-deps

  const role = useRole();
  const results = useMemo(() => {
    const s = q.toLowerCase();
    const pages = allPagesFor(activeTenderId, role).filter((p) => p.label.toLowerCase().includes(s)).slice(0, 6);
    const ts = tenders.filter((t) => (t.name + t.client + t.reference).toLowerCase().includes(s));
    const hits = s.length < 2 ? [] : [
      ...companies.filter((c) => c.name.toLowerCase().includes(s)).map((c) => ({ id: c.id, label: c.name, kind: "Company", href: `/app/companies/${c.id}` })),
      ...contacts.filter((c) => c.name.toLowerCase().includes(s)).map((c) => ({ id: c.id, label: c.name, kind: "Contact", href: "/app/contacts" })),
      ...opportunities.filter((o) => o.name.toLowerCase().includes(s)).map((o) => ({ id: o.id, label: o.name, kind: "Opportunity", href: "/app/opportunities" })),
      ...vendors.filter((v) => v.name.toLowerCase().includes(s)).map((v) => ({ id: v.id, label: v.name, kind: "Vendor", href: `/app/vendors/${v.id}` })),
      ...requirements.filter((r) => (r.text + r.clause).toLowerCase().includes(s)).map((r) => ({ id: r.id, label: `§${r.clause} ${r.text.slice(0, 60)}`, kind: "Requirement", href: `/app/tenders/${r.tenderId}/requirements` })),
    ].slice(0, 8);
    return { pages, ts, hits };
  }, [q, tenders, activeTenderId, companies, contacts, opportunities, vendors, requirements, role]);

  const go = (href: string) => { setPalette(false); router.push(href); };

  return (
    <Modal open={palette} onClose={() => setPalette(false)} wide={creating}>
      {creating ? (
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); const id = addTender({ ...form, value: Number(form.value) || 0 }); setPalette(false); router.push(`/app/tenders/${id}`); }}>
          <p className="font-sans text-sm font-semibold text-app-accent">Create a tender</p>
          <Field label="Tender name"><Input required autoFocus className="w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Bay du Nord Flowlines EPCI" /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Client"><Input className="w-full" list="vq-company-names" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Start typing a company…" /><datalist id="vq-company-names">{companies.map((c) => <option key={c.id} value={c.name} />)}</datalist>{form.client.trim() && <p className="mt-1 text-[11px] text-app-dim">{matchedCompany ? `Linked to CRM company: ${matchedCompany.name}` : "Not in Companies — tender will not be linked to a CRM account"}</p>}</Field>
            <Field label="Submission deadline"><Input type="date" min={today} className="w-full" value={form.closing} onChange={(e) => setForm({ ...form, closing: e.target.value })} /></Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Industry"><select className="w-full rounded-sm border border-app-border-2 bg-app-bg px-2.5 py-1.5 font-sans text-[13px] text-app-text" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}>{industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select></Field>
            <Field label="Tender type"><select className="w-full rounded-sm border border-app-border-2 bg-app-bg px-2.5 py-1.5 font-sans text-[13px] text-app-text" value={form.tenderType} onChange={(e) => setForm({ ...form, tenderType: e.target.value })}>{tenderTypes.map((x) => <option key={x}>{x}</option>)}</select></Field>
            <Field label="Reference"><Input className="w-full" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></Field>
          </div>
          <Field label="Estimated value"><Input type="number" min={0} step="any" className="w-full" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="0" /></Field>
          <Field label="Scope"><Input className="w-full" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setCreating(false)}>Back</Button><Button variant="primary">Create workspace</Button></div>
        </form>
      ) : (
        <div>
          <div className="flex items-center gap-2 border-b border-app-border pb-3">
            <Search size={14} className="text-app-muted" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies, tenders, requirements, pages… or create" className="flex-1 bg-transparent font-sans text-sm text-app-text outline-none placeholder:text-app-dim" />
            <kbd className="rounded border border-app-border px-1 font-mono text-[10px] text-app-dim">Esc</kbd>
          </div>
          <button onClick={() => setCreating(true)} className="mt-2 flex w-full items-center gap-2 rounded px-2 py-2 text-left font-sans text-[13px] text-app-accent hover:bg-app-panel-2"><Plus size={14} /> Create a new tender workspace</button>
          {results.ts.length > 0 && <p className="mt-2 px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-app-dim">Tenders</p>}
          {results.ts.map((t) => <button key={t.id} onClick={() => { setActiveTender(t.id); go(`/app/tenders/${t.id}`); }} className="flex w-full items-center justify-between rounded px-2 py-2 text-left font-sans text-[13px] text-app-text hover:bg-app-panel-2">{t.name}<span className="text-xs text-app-dim">{t.reference} · {t.client}</span></button>)}
          {results.hits.length > 0 && <p className="mt-2 px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-app-dim">Records</p>}
          {results.hits.map((h) => <button key={h.kind + h.id} onClick={() => go(h.href)} className="flex w-full items-center justify-between rounded px-2 py-2 text-left font-sans text-[13px] text-app-text hover:bg-app-panel-2"><span className="truncate">{h.label}</span><span className="ml-2 shrink-0 text-xs text-app-dim">{h.kind}</span></button>)}
          <p className="mt-2 px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-app-dim">Pages</p>
          {results.pages.map((p) => <button key={p.href} onClick={() => go(p.href)} className="flex w-full items-center justify-between rounded px-2 py-2 text-left font-sans text-[13px] text-app-text hover:bg-app-panel-2">{p.label}<ArrowRight size={12} className="text-app-dim" /></button>)}
        </div>
      )}
    </Modal>
  );
}
