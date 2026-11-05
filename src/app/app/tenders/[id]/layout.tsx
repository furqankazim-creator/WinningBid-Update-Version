"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Clock, Building2, Tag, Wallet, User, Activity } from "lucide-react";
import { Badge, Card, Label, ProgressBar } from "@/components/ui";
import { useStore, daysLeft, dueLabel, tenderHealth, scoped } from "@/store/useStore";
import { useIndustry } from "@/lib/useIndustries";
import { money } from "@/components/app/charts";
import { cn } from "@/lib/cn";

export default function TenderLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>(); const pathname = usePathname();
  const s = useStore(); const t = s.tenders.find((x) => x.id === id);
  const ind = useIndustry(t?.industry || "other");
  useEffect(() => { if (t && s.activeTenderId !== t.id) s.setActiveTender(t.id); }, [t, s]);
  if (!t) return <p className="text-sm text-app-muted">Tender not found.</p>;
  const w = (p: string) => `/app/tenders/${t.id}${p}`;
  const tabs = [
    ["Overview", w("")],
    ["Documents", "/app/documents"],
    ["AI Analysis", w("/ai-analysis")],
    ["Requirements", w("/requirements")],
    ["Compliance", w("/compliance")],
    ["Go/No-Go", w("/go-no-go")],
    ["Technical", w("/technical")],
    ["Pricing", w("/pricing")],
  ];
  const h = tenderHealth(s, t.id);
  const days = t.closing ? daysLeft(t.closing) : null;
  const gTone = t.goNoGo === "GO" ? "green" : t.goNoGo === "NO-GO" ? "red" : t.goNoGo === "CONDITIONAL GO" ? "yellow" : "outline";
  const aiPending = s.requirements.filter((r) => r.tenderId === t.id && r.status === "Needs Verification").length + scoped(s.clarifications, t.id).filter((c) => c.pending).length + scoped(s.clauses, t.id).filter((c) => c.pending).length;
  const missingDocs = s.complianceItems.filter((c) => c.tenderId === t.id && ["Missing", "Expired"].includes(c.status));
  const hiRisks = scoped(s.risks, t.id).filter((r) => r.kind === "Risk" && r.status === "Open" && r.probability * r.impact >= 10).length;
  const pv = s.priceVersions.filter((p) => p.tenderId === t.id); const locked = pv.find((p) => p.locked);
  const revs = s.reviews.filter((r) => r.tenderId === t.id); const readiness = Math.round((revs.filter((r) => r.status === "Approved").length / Math.max(revs.length, 7)) * 100);

  return (
    <div className="font-sans">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <div className="flex flex-wrap items-center gap-2"><h1 className="font-display text-2xl text-app-text">{t.name}</h1><Badge tone="outline">{t.tenderType}</Badge><Badge tone="outline">{t.stage}</Badge><Badge tone={gTone}>{t.goNoGo}</Badge></div>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-app-muted"><span className="font-mono">{t.reference || "no ref"}</span><span className="flex items-center gap-1"><Building2 size={11} /> {t.client}</span><span className="flex items-center gap-1"><Tag size={11} /> {ind.icon} {ind.name} · {t.service}</span><span className="flex items-center gap-1"><Wallet size={11} /> {money(t.value, t.currency)}</span><span className="flex items-center gap-1"><User size={11} /> {t.owner}</span>{days !== null && <span className={cn("flex items-center gap-1", days <= 30 ? "text-app-red" : "")}><Clock size={11} /> {t.closing} · {days}d</span>}</p>
        </div>
        <div className="flex items-center gap-3 rounded border border-app-border bg-app-panel px-4 py-2"><Activity size={14} className="text-app-muted" /><div><Label>Tender health</Label><p className={cn("font-display text-2xl leading-none", h.score >= 70 ? "text-app-green" : h.score >= 40 ? "text-app-yellow" : "text-app-red")}>{h.score}<span className="text-xs text-app-muted">/100</span></p></div></div>
      </div>
      <div className="app-scroll -mx-1 mb-5 flex gap-1 overflow-x-auto border-b border-app-border px-1 print:hidden">
        {tabs.map(([l, href]) => { const active = pathname === href; return <Link key={l} href={href} className={cn("whitespace-nowrap border-b-2 px-3 py-2 text-xs", active ? "border-app-accent text-app-text" : "border-transparent text-app-muted hover:text-app-text")}>{l}</Link>; })}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
        <div className="min-w-0 print:w-full">{children}</div>
        <aside className="space-y-3 print:hidden">
          <Card className="p-4"><Label>Deadline</Label><p className={cn("mt-1 font-display text-xl", days !== null && days <= 30 ? "text-app-red" : "text-app-text")}>{days !== null ? dueLabel(t.closing, true) : "—"}</p><p className="text-[11px] text-app-dim">{t.closing || "not set"}</p></Card>
          <Card className="p-4"><Label>Tender health · {h.score}/100</Label><div className="mt-2 space-y-2">{h.factors.map((f) => <div key={f.label} title={f.hint}><div className="flex justify-between text-[11px]"><span className="text-app-text">{f.label}</span><span className="text-app-muted">{f.na ? "n/a" : `${f.value}%`}</span></div><ProgressBar value={f.na ? 0 : f.value} tone={f.value >= 70 ? "green" : f.value >= 40 ? "yellow" : "red"} className="mt-0.5" /></div>)}</div></Card>
          <Link href={w("/go-no-go")}><Card className="p-4 hover:border-app-border-2"><Label>Go / No-Go</Label><p className="mt-1 flex items-center gap-2"><Badge tone={gTone}>{t.goNoGo}</Badge></p>{t.goNoGoReason && <p className="mt-1 text-[11px] text-app-dim">{t.goNoGoReason}</p>}</Card></Link>
          <Link href={w("/requirements")}><Card className="p-4 hover:border-app-border-2"><Label>AI review</Label><p className={cn("mt-1 font-display text-xl", aiPending ? "text-app-accent" : "text-app-text")}>{aiPending}</p><p className="text-[11px] text-app-dim">findings need human verification</p></Card></Link>
          <Link href={w("/compliance")}><Card className="p-4 hover:border-app-border-2"><Label>Missing documents</Label><p className={cn("mt-1 font-display text-xl", missingDocs.length ? "text-app-red" : "text-app-green")}>{missingDocs.length}</p>{missingDocs.slice(0, 3).map((m) => <p key={m.id} className="text-[11px] text-app-dim">• {m.item} ({m.status})</p>)}</Card></Link>
          <Link href="/app/risks/register"><Card className="p-4 hover:border-app-border-2"><Label>Risk</Label><p className={cn("mt-1 font-display text-xl", hiRisks ? "text-app-yellow" : "text-app-text")}>{hiRisks}</p><p className="text-[11px] text-app-dim">open high-severity risks</p></Card></Link>
          <Link href={w("/pricing")}><Card className="p-4 hover:border-app-border-2"><Label>Pricing status</Label><p className="mt-1 text-[13px] text-app-text">{locked ? `v${locked.version} locked · ${money(locked.price, t.currency)}` : pv.length ? `v${pv[pv.length - 1].version} draft · ${money(pv[pv.length - 1].price, t.currency)}` : "No price version"}</p></Card></Link>
          <Link href="/app/submission"><Card className="p-4 hover:border-app-border-2"><Label>Submission readiness</Label><p className="mt-1 font-display text-xl text-app-text">{readiness}%</p><ProgressBar value={readiness} tone={readiness >= 70 ? "green" : "yellow"} className="mt-1" /></Card></Link>
        </aside>
      </div>
    </div>
  );
}
