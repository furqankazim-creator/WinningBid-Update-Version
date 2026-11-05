"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, ArrowUpRight, Trash2 } from "lucide-react";
import { Button, Card, Badge, Input, Select, ProgressBar, PageHeader } from "@/components/ui";
import { useStore, filterByIndustry, daysLeft, dueLabel, tenderHealth } from "@/store/useStore";
import { useUI } from "@/components/app/ui-state";
import { useIndustries } from "@/lib/useIndustries";
import { tenderTypes } from "@/lib/industries";
import { money } from "@/components/app/charts";
import { cn } from "@/lib/cn";

export default function TendersPage() {
  const s = useStore(); const router = useRouter(); const { setPalette } = useUI(); const industries = useIndustries();
  const [q, setQ] = useState(""); const [type, setType] = useState("All"); const [status, setStatus] = useState("Active");
  const list = filterByIndustry(s.tenders, s.industryFilter).filter((t) => (t.name + t.client + t.reference).toLowerCase().includes(q.toLowerCase()) && (type === "All" || t.tenderType === type) && (status === "All" || (status === "Active" ? t.status === "Active Campaign" : t.status === status)));
  const gTone = (g: string) => (g === "GO" ? "green" : g === "NO-GO" ? "red" : g === "CONDITIONAL GO" ? "yellow" : "outline");
  return (
    <div className="font-sans">
      <PageHeader title="Tender Workspaces" sub={`${list.length} shown · ${s.tenders.length} total`} right={<Button variant="primary" onClick={() => setPalette(true)}><Plus size={13} /> New tender</Button>} />
      <div className="mb-4 flex flex-wrap gap-2"><div className="relative flex-1 min-w-[240px]"><Search size={13} className="absolute left-2.5 top-2.5 text-app-dim" /><Input className="w-full pl-8" placeholder="Search by name, reference or client…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Select value={type} onChange={(e) => setType(e.target.value)}><option>All</option>{tenderTypes.map((x) => <option key={x}>{x}</option>)}</Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>{["Active", "Won", "Lost", "Archived", "All"].map((x) => <option key={x}>{x}</option>)}</Select></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((t) => { const h = tenderHealth(s, t.id); const ind = industries.find((i) => i.id === t.industry); return (
          <Card key={t.id} className={cn("p-5", t.id === s.activeTenderId && "border-app-text/50")}>
            <div className="flex items-start justify-between text-xs"><span className="text-app-muted">{t.client}</span><span className="flex items-center gap-2"><Badge tone="outline">{t.tenderType}</Badge><button onClick={() => { if (confirm(`Delete ${t.name}?`)) s.deleteTender(t.id); }} className="text-app-dim hover:text-app-red"><Trash2 size={12} /></button></span></div>
            <Link href={`/app/tenders/${t.id}`} onClick={() => s.setActiveTender(t.id)}><h2 className="mt-2 font-display text-lg text-app-accent hover:underline">{t.name}</h2></Link>
            <p className="font-mono text-[11px] text-app-muted">{t.reference} · {ind?.icon} {ind?.name} · {t.service}</p>
            <p className="mt-2 line-clamp-2 min-h-[32px] text-xs text-app-muted">{t.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5"><Badge tone="outline">{t.stage}</Badge><Badge tone={gTone(t.goNoGo)}>{t.goNoGo}</Badge><Badge tone={h.score >= 70 ? "green" : h.score >= 40 ? "yellow" : "red"}>Health {h.score}</Badge></div>
            <div className="mt-3 flex justify-between text-xs"><span className="text-app-muted">Value: <span className="text-app-green">{money(t.value, t.currency)}</span></span><span className="text-app-muted">Closing: <span className="text-app-text">{t.closing || "—"}</span>{t.closing && <span className={cn("ml-1 font-mono", daysLeft(t.closing) <= 30 ? "text-app-red" : "text-app-dim")}>({dueLabel(t.closing)})</span>}</span></div>
            <div className="mt-4 flex items-center justify-between"><div className="flex items-center gap-2 text-xs text-app-muted">Owner: <span className="text-app-text">{t.owner}</span></div><Button variant="primary" size="sm" onClick={() => { s.setActiveTender(t.id); router.push(`/app/tenders/${t.id}`); }}>Open workspace <ArrowUpRight size={12} /></Button></div>
            <ProgressBar value={h.score} tone={h.score >= 70 ? "green" : h.score >= 40 ? "yellow" : "red"} className="mt-3" />
          </Card>
        ); })}
      </div>
    </div>
  );
}
