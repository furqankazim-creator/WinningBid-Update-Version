"use client";
import { Plus, Trash2, Lock } from "lucide-react";
import { PageHeader, Button, Input, Select, Card, Label } from "@/components/ui";
import { exportCSV } from "@/components/app/shared";
import { useScopedStore, fmtMoney } from "@/store/useStore";
import { totals, lineTotal, lineCont } from "@/lib/pricing";
import { useIndustry } from "@/lib/useIndustries";

export default function BuildUp() {
  const { costLines, updateCostLine, addCostLine, deleteCostLine, margin, setMargin, tenders, activeTenderId } = useScopedStore();
  const tender = tenders.find((x) => x.id === activeTenderId); const ind = useIndustry(tender?.industry || "other");
  const cats = Array.from(new Set([...ind.costCategories, ...costLines.map((l) => l.category)]));
  const t = totals(costLines, margin);
  const cell = "w-full bg-transparent px-2 py-1.5 text-[13px] text-app-text outline-none focus:bg-app-panel-2";
  return (
    <div className="font-sans">
      <PageHeader title="Price build-up" sub={`Line-item costing with contingency flags. Cost categories from the ${ind.name} template. Your numbers, cited and locked.`} right={<><Button variant="outline" onClick={() => exportCSV("price-build-up", costLines.map((l) => ({ WBS: l.wbs, Description: l.description, Category: l.category, Qty: l.qty, Unit: l.unit, Rate: l.rate, Total: lineTotal(l), "Cont %": l.contingency })))}>Excel</Button><Button variant="outline" onClick={addCostLine}><Plus size={13} /> Add line</Button><Button variant="primary"><Lock size={13} /> Lock baseline</Button></>} />
      <div className="overflow-x-auto rounded border border-app-border">
        <table className="w-full text-left">
          <thead><tr className="border-b border-app-border bg-app-panel-2">{["WBS", "Description", "Category", "Qty", "Unit", "Rate", "Total", "Cont %", "Cont.", ""].map((h) => <th key={h} className="px-2 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-app-muted">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-app-border">
            {costLines.map((l) => (
              <tr key={l.id}>
                <td className="w-16"><input className={`${cell} font-mono`} value={l.wbs} onChange={(e) => updateCostLine(l.id, { wbs: e.target.value })} /></td>
                <td className="min-w-[240px]"><input className={cell} value={l.description} onChange={(e) => updateCostLine(l.id, { description: e.target.value })} /></td>
                <td className="w-36"><Select className="w-full border-0 bg-transparent py-1" value={l.category} onChange={(e) => updateCostLine(l.id, { category: e.target.value })}>{cats.map((c) => <option key={c}>{c}</option>)}</Select></td>
                <td className="w-24"><input type="number" className={`${cell} text-right`} value={l.qty} onChange={(e) => updateCostLine(l.id, { qty: +e.target.value })} /></td>
                <td className="w-24"><input className={cell} value={l.unit} onChange={(e) => updateCostLine(l.id, { unit: e.target.value })} /></td>
                <td className="w-32"><input type="number" className={`${cell} text-right`} value={l.rate} onChange={(e) => updateCostLine(l.id, { rate: +e.target.value })} /></td>
                <td className="w-36 px-2 text-right text-[13px] text-app-text">{fmtMoney(lineTotal(l))}</td>
                <td className="w-20"><input type="number" className={`${cell} text-right ${l.contingency >= 10 ? "text-app-yellow" : ""}`} value={l.contingency} onChange={(e) => updateCostLine(l.id, { contingency: +e.target.value })} /></td>
                <td className="w-32 px-2 text-right text-xs text-app-muted">{fmtMoney(lineCont(l))}</td>
                <td className="w-8"><button onClick={() => deleteCostLine(l.id)} className="px-2 text-app-dim hover:text-app-red"><Trash2 size={13} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        <Card className="p-4"><Label>Base</Label><p className="mt-1 font-display text-xl text-app-text">{fmtMoney(t.base)}</p></Card>
        <Card className="p-4"><Label>Contingency</Label><p className="mt-1 font-display text-xl text-app-text">{fmtMoney(t.cont)}</p></Card>
        <Card className="p-4"><Label>Total cost</Label><p className="mt-1 font-display text-xl text-app-text">{fmtMoney(t.cost)}</p></Card>
        <Card className="p-4"><Label>Margin %</Label><div className="mt-1 flex items-center gap-2"><Input type="number" className="w-20 py-1" value={margin} onChange={(e) => setMargin(+e.target.value)} /><span className="text-xs text-app-muted">{fmtMoney(t.marginValue)}</span></div></Card>
        <Card className="border-app-accent/50 p-4"><Label>Submission price</Label><p className="mt-1 font-display text-xl text-app-accent">{fmtMoney(t.price)}</p></Card>
      </div>
    </div>
  );
}
