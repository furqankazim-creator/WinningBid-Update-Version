"use client";
import { PageHeader, Table, Label, Card } from "@/components/ui";
import { useScopedStore } from "@/store/useStore";
import { money } from "@/components/app/charts";
import { cn } from "@/lib/cn";

export default function Tabulation() {
  const s = useScopedStore();
  return (
    <div className="font-sans">
      <PageHeader title="Bid tabulation" sub="Side-by-side comparison on price, lead time, scope and technical compliance." />
      {s.procPackages.map((pk) => { const qs = s.quotations.filter((q) => q.packageId === pk.id); if (!qs.length) return null; const low = Math.min(...qs.map((x) => x.price)); const v = (id: string) => s.vendors.find((x) => x.id === id)?.name || id; return (
        <div key={pk.id} className="mb-6"><Label className="mb-2">{pk.name}</Label>
          <Table head={["Criterion", ...qs.map((x) => v(x.vendorId))]}>
            <tr><td className="px-3 py-2 text-app-muted">Price</td>{qs.map((x) => <td key={x.id} className={cn("px-3 py-2", x.price === low ? "text-app-green" : "text-app-text")}>{money(x.price, x.currency)}{x.price !== low && <span className="ml-1 text-[11px] text-app-dim">+{(((x.price - low) / low) * 100).toFixed(1)}%</span>}</td>)}</tr>
            <tr><td className="px-3 py-2 text-app-muted">Lead time</td>{qs.map((x) => <td key={x.id} className="px-3 py-2 text-app-text">{x.leadWeeks} weeks</td>)}</tr>
            <tr><td className="px-3 py-2 text-app-muted">Quality</td>{qs.map((x) => <td key={x.id} className="px-3 py-2 text-app-text">{["", "Low", "Below avg", "Medium", "High", "Excellent"][x.quality]}</td>)}</tr>
            <tr><td className="px-3 py-2 text-app-muted">Scope</td>{qs.map((x) => <td key={x.id} className="px-3 py-2 text-app-text">{x.scope}</td>)}</tr>
            <tr><td className="px-3 py-2 text-app-muted">Technical compliance</td>{qs.map((x) => <td key={x.id} className={cn("px-3 py-2", x.compliance >= 90 ? "text-app-green" : "text-app-yellow")}>{x.compliance}%</td>)}</tr>
            <tr><td className="px-3 py-2 text-app-muted">Notes</td>{qs.map((x) => <td key={x.id} className="px-3 py-2 text-xs text-app-muted">{x.notes}</td>)}</tr>
          </Table></div>
      ); })}
      {!s.quotations.some((q) => s.procPackages.some((p) => p.id === q.packageId)) && <Card className="p-8 text-center text-xs text-app-dim">No quotations to tabulate yet.</Card>}
    </div>
  );
}
