"use client";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader, Button, Input, Table } from "@/components/ui";
import { useScopedStore, fmtMoney } from "@/store/useStore";
import { totals } from "@/lib/pricing";

export default function MilestonesPage() {
  const { milestones, updateMilestone, addMilestone, deleteMilestone, costLines, margin } = useScopedStore();
  const price = totals(costLines, margin).price;
  const sum = milestones.reduce((a, m) => a + m.pct, 0);
  return (
    <div className="font-sans">
      <PageHeader title="Payment milestones" sub={`Per Schedule 4. Allocated ${sum}% of ${fmtMoney(price)}`} right={<Button variant="outline" onClick={addMilestone}><Plus size={13} /> Add milestone</Button>} />
      {sum !== 100 && <p className="mb-3 text-xs text-app-yellow">Milestones sum to {sum}% — should be 100%.</p>}
      <Table head={["Milestone", "Date", "%", "Amount", ""]}>
        {milestones.map((m) => <tr key={m.id}>
          <td className="px-3 py-1.5"><Input className="w-full border-0 bg-transparent" value={m.name} onChange={(e) => updateMilestone(m.id, { name: e.target.value })} /></td>
          <td className="px-3 py-1.5"><Input type="date" className="border-0 bg-transparent" value={m.date} onChange={(e) => updateMilestone(m.id, { date: e.target.value })} /></td>
          <td className="px-3 py-1.5"><Input type="number" className="w-20 border-0 bg-transparent text-right" value={m.pct} onChange={(e) => updateMilestone(m.id, { pct: +e.target.value })} /></td>
          <td className="px-3 py-1.5 text-app-text">{fmtMoney(price * m.pct / 100)}</td>
          <td className="px-3 py-1.5"><button onClick={() => deleteMilestone(m.id)} className="text-app-dim hover:text-app-red"><Trash2 size={13} /></button></td>
        </tr>)}
      </Table>
    </div>
  );
}
