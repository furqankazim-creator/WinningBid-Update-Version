"use client";
import { Deck } from "@/components/app/Deck";
import { useScopedStore } from "@/store/useStore";
export default function Page() {
  const { deliverables, qualifications } = useScopedStore();
  return <Deck title="Technical Overview" sub="Execution methodology for the technical review board." slides={[
    { title: "Scope & interfaces", bullets: ["2 × 4.2 km dynamic umbilicals", "3 × 6 km 8\" flexible flowlines", "HDD shore approach through consolidated bedrock", "Tie-in to existing manifold at KP 0"] },
    { title: "Installation methodology", bullets: ["DP2 pipelay vessel, reel-lay", "Mechanical trenching in rocky zones (clarification 002 accepted)", "Ice management vessel on standby Mar–Jul"] },
    { title: "Technical deliverables", bullets: deliverables.filter((d) => d.type === "Technical").map((d) => `${d.name} — ${d.status}`) },
    { title: "Technical qualifications", bullets: qualifications.filter((q) => q.category === "Technical").map((q) => q.text) },
  ]} />;
}
