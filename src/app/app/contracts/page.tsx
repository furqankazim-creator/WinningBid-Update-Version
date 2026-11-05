"use client";
import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { Card, Badge, Button, Input, Select, Field, PageHeader, Label, Empty } from "@/components/ui";
import { useStore } from "@/store/useStore";
import { money } from "@/components/app/charts";
import { contractTerms } from "@/lib/industries";
import type { Contract } from "@/store/types";

export default function Contracts() {
  const s = useStore();
  return (
    <div className="font-sans">
      <PageHeader title="Contracts" sub={`${s.contracts.length} contract(s) · created from awarded tenders. Invoicing and payments are not yet in scope.`} />
      {s.contracts.length === 0 && <Empty title="No contracts yet." body="Record a tender result as Awarded, then create the contract from the Result tab." />}
      <div className="space-y-4">
        {s.contracts.map((c) => { const t = s.tenders.find((x) => x.id === c.tenderId); const proj = s.projects.find((p) => p.tenderId === c.tenderId); return (
          <Card key={c.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-[15px] font-semibold text-app-text">{c.name}</h2><p className="text-xs text-app-muted">{c.client} · {t && <Link href={`/app/tenders/${t.id}`} className="text-app-accent">{t.reference}</Link>}</p></div><div className="flex items-center gap-2"><Badge tone={c.status === "Active" || c.status === "Signed" ? "green" : "outline"}>{c.status}</Badge>{!proj && <Button size="sm" variant="outline" onClick={() => s.convertToProject(c.tenderId)}><FolderKanban size={11} /> Convert to project</Button>}{proj && <Link href="/app/projects" className="text-xs text-app-accent">Project →</Link>}</div></div>
            <div className="mt-3 grid gap-3 sm:grid-cols-5">
              <Field label="Value"><Input type="number" className="w-full" value={c.value} onChange={(e) => s.updateContract(c.id, { value: +e.target.value })} /></Field>
              <Field label="Status"><Select className="w-full" value={c.status} onChange={(e) => s.updateContract(c.id, { status: e.target.value as Contract["status"] })}>{["Draft", "Signed", "Active", "Closed"].map((x) => <option key={x}>{x}</option>)}</Select></Field>
              <Field label="Signed"><Input type="date" className="w-full" value={c.signed} onChange={(e) => s.updateContract(c.id, { signed: e.target.value })} /></Field>
              <Field label="Start"><Input type="date" className="w-full" value={c.start} onChange={(e) => s.updateContract(c.id, { start: e.target.value })} /></Field>
              <Field label="End"><Input type="date" className="w-full" value={c.end} onChange={(e) => s.updateContract(c.id, { end: e.target.value })} /></Field>
            </div>
            <Label className="mt-4 mb-2">Key terms · {money(c.value, c.currency)}</Label>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{contractTerms.map((term) => <div key={term} className="rounded border border-app-border bg-app-bg px-3 py-2"><p className="text-[10px] uppercase tracking-wider text-app-dim">{term}</p><Input className="mt-0.5 w-full border-0 bg-transparent px-0 py-0.5 text-xs" value={c.terms[term] || ""} placeholder="—" onChange={(e) => s.updateContract(c.id, { terms: { ...c.terms, [term]: e.target.value } })} /></div>)}</div>
          </Card>
        ); })}
      </div>
    </div>
  );
}
