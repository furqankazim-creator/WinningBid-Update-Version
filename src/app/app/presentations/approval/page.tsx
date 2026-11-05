"use client";
import { Deck } from "@/components/app/Deck";
import { useScopedStore, fmtMoney } from "@/store/useStore";
import { totals } from "@/lib/pricing";
export default function Page() {
  const { costLines, margin, risks, qualifications } = useScopedStore(); const p = totals(costLines, margin);
  return <Deck approvable title="Bid Approval" sub="Go / no-go pack for the tender board." slides={[
    { title: "Decision requested", bullets: [`Approve submission at ${fmtMoney(p.price)} (${margin}% margin)`, "Approve walk-away positions on uncapped liability and LDs", "Approve vessel spread commitment"] },
    { title: "Contingency & exposure", bullets: [`Line contingency ${fmtMoney(p.cont)}`, `Risk-based contingency ${fmtMoney(risks.reduce((a, r) => a + r.contingency, 0))}`, "Peak funding requirement — see Cashflow"] },
    { title: "Deviations submitted", bullets: qualifications.filter((q) => q.type === "Deviation").map((q) => `${q.ref}: ${q.text}`) },
  ]} />;
}
