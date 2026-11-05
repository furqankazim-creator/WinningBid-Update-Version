"use client";
import { PageHeader, Card, Label } from "@/components/ui";
import { useScopedStore } from "@/store/useStore";
import { money } from "@/components/app/charts";

export default function Benchmark() {
  const s = useScopedStore();
  return (
    <div className="font-sans">
      <PageHeader title="Procurement benchmark" sub="Each quotation against the package's own quote range and historical rates (vendor ratings). Add market ranges as you collect them." />
      {s.procPackages.map((pk) => { const qs = s.quotations.filter((q) => q.packageId === pk.id); if (!qs.length) return null; const lo = Math.min(...qs.map((q) => q.price)), hi = Math.max(...qs.map((q) => q.price)); const min = lo * 0.9, max = hi * 1.1; const x = (v: number) => ((v - min) / (max - min || 1)) * 100; const avg = qs.reduce((a, q) => a + q.price, 0) / qs.length; return (
        <Card key={pk.id} className="mb-4 p-4"><div className="flex justify-between"><Label>{pk.name}</Label><Label>average {money(avg, qs[0].currency)} · spread {(((hi - lo) / lo) * 100).toFixed(0)}%</Label></div>
          <div className="relative mt-6 h-12">
            <div className="absolute top-4 h-3 rounded bg-app-blue/25" style={{ left: `${x(lo)}%`, width: `${x(hi) - x(lo)}%` }} />
            <div className="absolute top-2 h-7 w-0.5 bg-app-accent" style={{ left: `${x(avg)}%` }} />
            {qs.map((q) => <div key={q.id} className="absolute top-0 flex flex-col items-center" style={{ left: `${x(q.price)}%` }}><span className="h-11 w-0.5 bg-app-text" /><span className="mt-1 whitespace-nowrap font-mono text-[9px] text-app-muted">{s.vendors.find((v) => v.id === q.vendorId)?.name.split(" ")[0]} · {money(q.price, q.currency)}</span></div>)}
          </div></Card>
      ); })}
    </div>
  );
}
