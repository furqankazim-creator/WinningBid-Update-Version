"use client";
import Link from "next/link";
import { Layers } from "lucide-react";
import { Card, Empty, PageHeader, Select, Input, ProgressBar, Badge, Label } from "@/components/ui";
import { useStore } from "@/store/useStore";
import { money } from "@/components/app/charts";
import type { Project } from "@/store/types";

export default function ProjectsPage() {
  const s = useStore();
  return (
    <div className="font-sans">
      <PageHeader title="Projects" sub={`${s.projects.length} project(s) · created by converting a won tender or a contract. Post-award tracking; invoicing and payments deferred.`} />
      {s.projects.length === 0 ? <Empty icon={<Layers size={28} />} title="No projects yet." body="Record a tender as Awarded (Result tab), then use Convert to Project from Result, Contracts or Submission." /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {s.projects.map((p) => { const t = s.tenders.find((x) => x.id === p.tenderId); const c = s.contracts.find((x) => x.id === p.contractId || x.tenderId === p.tenderId); return (
            <Card key={p.id} className="p-5">
              <p className="text-xs text-app-muted">{t?.client}</p><h2 className="mt-1 font-display text-lg text-app-accent">{p.name}</h2>
              <p className="mt-1 text-[11px] text-app-dim">{t && <Link href={`/app/tenders/${t.id}`} className="hover:text-app-text">{t.reference}</Link>}{c && ` · contract ${money(c.value, c.currency)}`}</p>
              <div className="mt-3 flex items-center gap-2"><Label>Status</Label><Select className="py-0.5 text-xs" value={p.status} onChange={(e) => s.updateProject(p.id, { status: e.target.value as Project["status"] })}>{["Mobilising", "In progress", "On hold", "Complete"].map((x) => <option key={x}>{x}</option>)}</Select><Badge tone={p.status === "Complete" ? "green" : "outline"}>{p.status}</Badge></div>
              <div className="mt-3 flex items-center gap-2"><Label>Progress</Label><Input type="number" min={0} max={100} className="w-16 py-0.5 text-xs" value={p.progress} onChange={(e) => s.updateProject(p.id, { progress: +e.target.value })} /><ProgressBar value={p.progress} tone="green" className="flex-1" /></div>
              <p className="mt-3 text-[11px] text-app-dim">Created {new Date(p.createdAt).toLocaleDateString()}</p>
            </Card>
          ); })}
        </div>
      )}
    </div>
  );
}
