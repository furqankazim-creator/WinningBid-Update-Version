"use client";
import { Award } from "lucide-react";
import { PageHeader, Card, Label, Input, ProgressBar, Button, Badge } from "@/components/ui";
import { useScopedStore } from "@/store/useStore";
import { scoreQuotes } from "@/components/app/procurement";

export default function Evaluate() {
  const s = useScopedStore();
  return (
    <div className="font-sans">
      <PageHeader title="Evaluate & rank" sub="Weighted technical + commercial evaluation. AI may recommend; the award recommendation is a human action that requests Procurement approval." />
      {s.procPackages.map((pk) => { const qs = s.quotations.filter((q) => q.packageId === pk.id); const ranked = scoreQuotes(pk, qs); const w = pk.weights; return (
        <Card key={pk.id} className="mb-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[15px] font-semibold text-app-text">{pk.name}</p><Badge tone={pk.status === "Purchased" ? "green" : pk.status === "Approval" ? "purple" : "outline"}>{pk.status}</Badge></div>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">{(["price", "lead", "quality", "compliance"] as const).map((k) => <label key={k}><Label>{k} weight</Label><Input type="number" className="mt-1 w-full py-1" value={w[k]} onChange={(e) => s.updatePackage(pk.id, { weights: { ...w, [k]: +e.target.value } })} /></label>)}</div>
          <div className="mt-3 space-y-2">{ranked.map((x, i) => { const v = s.vendors.find((y) => y.id === x.vendorId); return <div key={x.id} className="flex items-center gap-4 rounded border border-app-border bg-app-bg px-3 py-2"><span className="w-5 font-display text-lg text-app-muted">{i + 1}</span><div className="flex-1"><div className="flex justify-between text-[13px]"><span className={i === 0 ? "text-app-accent" : "text-app-text"}>{v?.name}{pk.recommendedVendorId === x.vendorId && <Badge tone="green" className="ml-2">recommended</Badge>}</span><span className="text-app-muted">{x.score}</span></div><ProgressBar value={x.score} tone={i === 0 ? "accent" : "green"} className="mt-1" /></div>{pk.status !== "Purchased" && pk.recommendedVendorId !== x.vendorId && <Button size="sm" variant="outline" onClick={() => s.awardPackage(pk.id, x.vendorId)}><Award size={11} /> Recommend award</Button>}</div>; })}{ranked.length === 0 && <p className="text-xs text-app-dim">No quotations yet.</p>}</div>
        </Card>
      ); })}
    </div>
  );
}
