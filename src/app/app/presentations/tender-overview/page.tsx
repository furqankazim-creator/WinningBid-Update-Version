"use client";
import { Deck } from "@/components/app/Deck";
import { useScopedStore, fmtMoney } from "@/store/useStore";
import { totals } from "@/lib/pricing";
export default function Page() {
  const { tenders, activeTenderId, risks, clarifications, costLines, margin } = useScopedStore();
  const t = tenders.find((x) => x.id === activeTenderId)!; const p = totals(costLines, margin);
  return <Deck title="Tender Overview" sub="Management presentation generated from the workspace." slides={[
    { title: t.name, bullets: [`Client: ${t.client}`, t.description, `Submission: ${t.closing}`, `Scope: ${t.scope} · ${t.bidder}`] },
    { title: "Commercial position", bullets: [`Total cost ${fmtMoney(p.cost)} incl. ${fmtMoney(p.cont)} contingency`, `Margin ${margin}% → submission price ${fmtMoney(p.price)}`, `${costLines.length} priced lines, baseline locked`] },
    { title: "Key risks", bullets: risks.filter((r) => r.kind === "Risk").slice(0, 4).map((r) => `${r.title} — ${r.mitigation}`) },
    { title: "Open clarifications", bullets: clarifications.filter((c) => c.status !== "Answered" && c.status !== "Closed").slice(0, 5).map((c) => `${c.ref} ${c.title}`) },
    { title: "Recommendation", bullets: ["Proceed to submission subject to acceptance of liability cap deviation", "Hedge copper exposure at award", "Secure flexible pipe slot with LOI"] },
  ]} />;
}
