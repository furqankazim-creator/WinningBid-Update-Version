"use client";
import { PageHeader, Card, Table, Label } from "@/components/ui";
import { useScopedStore, fmtMoney, severity } from "@/store/useStore";

export default function ContingencyPage() {
  const { risks, costLines } = useScopedStore();
  const base = costLines.reduce((a, l) => a + l.qty * l.rate, 0);
  const lineCont = costLines.reduce((a, l) => a + l.qty * l.rate * (l.contingency / 100), 0);
  const riskCont = risks.filter((r) => r.kind === "Risk" && r.status !== "Closed").reduce((a, r) => a + r.contingency, 0);
  const expected = risks.filter((r) => r.kind === "Risk" && r.status !== "Closed").reduce((a, r) => a + r.contingency * (r.postProbability / 5), 0);
  return (
    <div className="font-sans">
      <PageHeader title="Contingency" sub="Risk-based contingency versus line-item contingency. Apply contingency once, not at both levels." />
      <div className="grid gap-3 md:grid-cols-4">
        {[["Base cost", base], ["Line-item contingency", lineCont], ["Risk-based contingency", riskCont], ["Probability-weighted", expected]].map(([l, v]) => <Card key={l as string} className="p-4"><Label>{l as string}</Label><p className="mt-1 font-display text-2xl text-app-text">{fmtMoney(v as number)}</p><p className="text-[11px] text-app-dim">{(((v as number) / base) * 100).toFixed(1)}% of base</p></Card>)}
      </div>
      <div className="mt-6">
        <Table head={["#", "Risk", "Post-mit severity", "Allocation", "Weighted"]}>
          {risks.filter((r) => r.kind === "Risk").map((r) => <tr key={r.id}><td className="px-3 py-2 font-mono text-[11px] text-app-muted">{r.n}</td><td className="px-3 py-2 text-app-text">{r.title}</td><td className="px-3 py-2 text-xs text-app-muted">{severity(r.postProbability, r.postImpact)}</td><td className="px-3 py-2 text-app-text">{fmtMoney(r.contingency)}</td><td className="px-3 py-2 text-app-muted">{fmtMoney(r.contingency * (r.postProbability / 5))}</td></tr>)}
        </Table>
      </div>
    </div>
  );
}
