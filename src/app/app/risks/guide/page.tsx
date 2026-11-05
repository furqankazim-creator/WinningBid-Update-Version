import { PageHeader, Card } from "@/components/ui";
const rows = [["1", "Rare (<10%)", "Negligible (<0.5% CV)"], ["2", "Unlikely (10–30%)", "Minor (0.5–2% CV)"], ["3", "Possible (30–50%)", "Moderate (2–5% CV)"], ["4", "Likely (50–80%)", "Major (5–10% CV)"], ["5", "Almost certain (>80%)", "Severe (>10% CV or walk-away)"]];
export default function GuidePage() {
  return (
    <div className="font-sans">
      <PageHeader title="Risk scoring guide" sub="How probability and impact are scored on this tender. CV = contract value." />
      <Card className="overflow-hidden"><table className="w-full text-left text-[13px]"><thead><tr className="border-b border-app-border bg-app-panel-2">{["Score", "Probability", "Impact"].map((h) => <th key={h} className="px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-app-muted">{h}</th>)}</tr></thead><tbody className="divide-y divide-app-border">{rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "px-4 py-3 font-display text-lg text-app-accent" : "px-4 py-3 text-app-text"}>{c}</td>)}</tr>)}</tbody></table></Card>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Card className="p-4 text-[13px] leading-relaxed text-app-muted"><p className="font-semibold text-app-text">Pre- vs post-mitigation</p>Score every item twice: as found in the ITT, and after the mitigation you will actually commit to in the bid. Only post-mitigation scores drive contingency.</Card>
        <Card className="p-4 text-[13px] leading-relaxed text-app-muted"><p className="font-semibold text-app-text">Walk-away items</p>Anything scoring 5 on impact after mitigation is a walk-away candidate and must be raised as a Deviation in the Qualifications register.</Card>
      </div>
    </div>
  );
}
