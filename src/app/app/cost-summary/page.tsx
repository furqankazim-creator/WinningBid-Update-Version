"use client";
import { PageHeader, Card, Label } from "@/components/ui";
import { useScopedStore, fmtMoney } from "@/store/useStore";
import { totals } from "@/lib/pricing";

export default function CostSummary() {
  const { costLines, margin } = useScopedStore();
  const t = totals(costLines, margin);
  return (
    <div className="font-sans">
      <PageHeader title="Cost Summary" sub="Roll-up of the price build-up. Edit lines in Pricing → Price build-up." />
      <div className="grid gap-3 md:grid-cols-4">
        {[["Base cost", t.base], ["Contingency", t.cont], ["Total cost", t.cost], ["Submission price", t.price]].map(([l, v], i) => <Card key={l as string} className="p-4"><Label>{l as string}</Label><p className={`mt-1 font-display text-2xl ${i === 3 ? "text-app-accent" : "text-app-text"}`}>{fmtMoney(v as number)}</p></Card>)}
      </div>
      <Card className="mt-6 p-5">
        <Label className="mb-4">By category</Label>
        <div className="space-y-3">{t.byCat.map(([c, v]) => <div key={c}><div className="flex justify-between text-xs"><span className="text-app-text">{c}</span><span className="text-app-muted">{fmtMoney(v)} · {((v / t.base) * 100).toFixed(1)}%</span></div><div className="mt-1 h-1.5 w-full rounded bg-app-border"><div className="h-1.5 rounded bg-app-accent" style={{ width: `${(v / t.base) * 100}%` }} /></div></div>)}</div>
      </Card>
      <Card className="mt-4 p-5 text-[13px]"><div className="flex justify-between border-b border-app-border py-2"><span className="text-app-muted">Margin</span><span className="text-app-text">{margin}% · {fmtMoney(t.marginValue)}</span></div><div className="flex justify-between py-2"><span className="text-app-muted">Contingency as % of base</span><span className="text-app-text">{((t.cont / t.base) * 100).toFixed(1)}%</span></div></Card>
    </div>
  );
}
