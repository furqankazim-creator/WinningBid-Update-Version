"use client";
import Link from "next/link";
import { CheckSquare, ShieldAlert, AlertTriangle, MessageSquare, SlidersHorizontal, Presentation, Users } from "lucide-react";
import { Card, Label, SectionTitle } from "@/components/ui";
import { useStore, severity } from "@/store/useStore";
import { cn } from "@/lib/cn";

export default function Dashboard() {
  const s = useStore();
  const pct = (a: number, b: number) => (b ? a / b : 0);
  const hiClauses = s.clauses.filter((c) => c.relevance === "High"); const hiResolved = hiClauses.filter((c) => c.status === "Approved" || c.status === "Closed");
  const hiRisks = s.risks.filter((r) => r.kind === "Risk" && ["High", "Very High"].includes(severity(r.postProbability, r.postImpact))); const openHi = hiRisks.filter((r) => r.status === "Open");
  const reviewed = s.clarifications.filter((c) => !c.pending && c.status !== "Draft");
  const approvedDl = s.deliverables.filter((d) => d.status === "Approved");
  const factors = [
    { icon: CheckSquare, label: "Deliverables approved", w: 25, v: pct(approvedDl.length, s.deliverables.length), sub: `${approvedDl.length} of ${s.deliverables.length} approved`, href: "/app/deliverables" },
    { icon: ShieldAlert, label: "High-risk clauses resolved", w: 20, v: pct(hiResolved.length, hiClauses.length), sub: `${hiClauses.length - hiResolved.length} unresolved high-risk clauses`, href: "/app/contract/register" },
    { icon: AlertTriangle, label: "Open high-impact risks", w: 20, v: 1 - pct(openHi.length, hiRisks.length || 1), sub: `${openHi.length} open high-impact risks`, href: "/app/risks/register" },
    { icon: MessageSquare, label: "Clarifications reviewed", w: 15, v: pct(reviewed.length, s.clarifications.length), sub: `${s.clarifications.filter((c) => c.pending).length} pending review`, href: "/app/clarifications/register" },
    { icon: SlidersHorizontal, label: "Pricing configured", w: 10, v: s.costLines.length ? 1 : 0, sub: `Margin: ${s.margin}%`, href: "/app/pricing/build-up" },
    { icon: Presentation, label: "Presentations approved", w: 10, v: 0, sub: "Not yet approved", href: "/app/presentations/approval" },
  ];
  const score = Math.round(factors.reduce((a, f) => a + f.w * f.v, 0));
  const tone = (v: number) => (v >= 0.8 ? "green" : v >= 0.4 ? "yellow" : "red");
  const attention = [hiClauses.length - hiResolved.length > 0 && `${hiClauses.length - hiResolved.length} high-risk clauses still Pending`, openHi.length > 0 && `${openHi.length} open high-impact risks`, s.clarifications.filter((c) => c.pending).length > 0 && `${s.clarifications.filter((c) => c.pending).length} clarifications need review`].filter(Boolean) as string[];
  const tasks = [...s.qualifications.map((q) => q.task), ...s.deliverables.map((d) => (d.status === "Approved" ? "Done" : d.status === "Not started" ? "To do" : "In progress"))];
  const count = (k: string) => tasks.filter((t) => t === k).length;

  return (
    <div className="font-sans">
      <Card className="p-6">
        <div className="flex items-end gap-3"><span className={cn("font-display text-6xl", score < 50 ? "text-app-red" : score < 80 ? "text-app-yellow" : "text-app-green")}>{score}%</span><span className="mb-3 text-sm text-app-muted">submission readiness</span></div>
        <div className="mt-5 space-y-4">{factors.map((f) => (
          <Link key={f.label} href={f.href} className="block">
            <div className="flex items-center justify-between text-[13px]"><span className="flex items-center gap-2 text-app-text"><f.icon size={13} className="text-app-muted" />{f.label} <span className="text-app-muted">({f.w}%)</span></span><span className={cn("text-xs", f.v > 0 ? "text-app-green" : "text-app-red")}>+{Math.round(f.w * f.v)}%</span></div>
            <div className="mt-1.5 h-1 w-full rounded bg-app-border"><div className={cn("h-1 rounded", f.v >= 0.8 ? "bg-app-green" : f.v >= 0.4 ? "bg-app-yellow" : "bg-app-yellow")} style={{ width: `${f.v * 100}%` }} /></div>
            <p className="mt-1 text-[11px] text-app-dim">{f.sub}</p>
          </Link>
        ))}</div>
      </Card>
      <div className="mt-6"><SectionTitle>Needs attention</SectionTitle><div className="space-y-2">{attention.length === 0 && <Card className="px-4 py-3 text-xs text-app-muted">Nothing outstanding.</Card>}{attention.map((a) => <Card key={a} className="flex items-center gap-2 px-4 py-3 text-[13px] text-app-text"><span className="h-1.5 w-1.5 rounded-full bg-app-yellow" />{a}</Card>)}</div></div>
      <Card className="mt-6 p-5">
        <div className="flex items-center gap-2"><Users size={13} className="text-app-muted" /><Label className="text-app-text">Progress</Label></div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">{[["To do", count("To do"), "text-app-blue"], ["In progress", count("In progress"), "text-app-purple"], ["Blocked", 0, "text-app-red"], ["Done", count("Done"), "text-app-green"]].map(([l, v, c]) => <Card key={l as string} className="bg-app-bg p-4 text-center"><p className={cn("font-display text-2xl", c as string)}>{v as number}</p><Label className="mt-1">{l as string}</Label></Card>)}</div>
        <Label className="mt-5">By assignee</Label>
        <div className="mt-2 flex justify-between text-xs text-app-muted"><span>Unassigned</span><span>{tasks.length} items</span></div>
      </Card>
    </div>
  );
}
