"use client";
import { PageHeader, Card, Label } from "@/components/ui";
import { useScopedStore, fmtMoney } from "@/store/useStore";
import { totals } from "@/lib/pricing";

export default function CashflowPage() {
  const { milestones, costLines, margin } = useScopedStore();
  const t = totals(costLines, margin);
  const ms = [...milestones].filter((m) => m.date).sort((a, b) => a.date.localeCompare(b.date));
  if (!ms.length) return <div className="font-sans"><PageHeader title="Cashflow" /><p className="text-xs text-app-muted">Add dated milestones to see the cashflow curve.</p></div>;
  // Spread cost evenly over the schedule; income lands on milestones. Cumulative curves.
  const start = new Date(ms[0].date).getTime(), end = new Date(ms[ms.length - 1].date).getTime();
  const months: { label: string; inFlow: number; out: number }[] = [];
  const n = Math.max(1, Math.round((end - start) / (30 * 86400000)));
  for (let i = 0; i <= n; i++) { const d = new Date(start + i * 30 * 86400000); months.push({ label: d.toLocaleDateString("en", { month: "short", year: "2-digit" }), inFlow: 0, out: t.cost / (n + 1) }); }
  ms.forEach((m) => { const i = Math.min(n, Math.round((new Date(m.date).getTime() - start) / (30 * 86400000))); months[i].inFlow += t.price * m.pct / 100; });
  let ci = 0, co = 0; const pts = months.map((m) => { ci += m.inFlow; co += m.out; return { ...m, ci, co, net: ci - co }; });
  const max = Math.max(...pts.map((p) => Math.max(p.ci, p.co))); const min = Math.min(0, ...pts.map((p) => p.net));
  const W = 900, H = 260, pad = 30; const x = (i: number) => pad + (i / n) * (W - 2 * pad); const y = (v: number) => H - pad - ((v - min) / (max - min || 1)) * (H - 2 * pad);
  const path = (k: "ci" | "co" | "net") => pts.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p[k])}`).join(" ");
  const worst = Math.min(...pts.map((p) => p.net));
  return (
    <div className="font-sans">
      <PageHeader title="Cashflow" sub="Cumulative income (milestones) vs. cost (spread linearly). Negative net = working capital you must fund." />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Card className="p-4"><Label>Peak funding requirement</Label><p className="mt-1 font-display text-2xl text-app-red">{fmtMoney(worst)}</p></Card>
        <Card className="p-4"><Label>Final net</Label><p className="mt-1 font-display text-2xl text-app-green">{fmtMoney(pts[pts.length - 1].net)}</p></Card>
        <Card className="p-4"><Label>Duration</Label><p className="mt-1 font-display text-2xl text-app-text">{n} months</p></Card>
      </div>
      <Card className="p-4"><svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <line x1={pad} x2={W - pad} y1={y(0)} y2={y(0)} style={{ stroke: "var(--app-border-2)" }} />
        <path d={path("co")} fill="none" stroke="#e5534b" strokeWidth="2" /><path d={path("ci")} fill="none" stroke="#3ec48a" strokeWidth="2" /><path d={path("net")} fill="none" stroke="#c8772e" strokeWidth="2" strokeDasharray="4 3" />
        {pts.filter((_, i) => i % Math.ceil(n / 8) === 0).map((p, i) => <text key={i} x={x(pts.indexOf(p))} y={H - 8} fontSize="10" style={{ fill: "var(--app-muted)" }} textAnchor="middle" fontFamily="monospace">{p.label}</text>)}
      </svg><div className="mt-2 flex gap-4 text-xs text-app-muted"><span className="text-app-green">■ Cumulative income</span><span className="text-app-red">■ Cumulative cost</span><span className="text-app-accent">┄ Net</span></div></Card>
    </div>
  );
}
