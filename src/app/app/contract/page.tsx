"use client";
import { ShieldAlert, Award, AlertTriangle, History } from "lucide-react";
import { Stat, PageHeader } from "@/components/ui";
import { ContributorHeatmap } from "@/components/app/shared";
import { RecentList } from "@/components/app/OverviewRecent";
import { useScopedStore } from "@/store/useStore";

export default function ContractOverview() {
  const { clauses: k, qualifications: q } = useScopedStore();
  const byAuthor = Object.entries(k.reduce<Record<string, string[]>>((a, x) => { (a[x.author] ||= []).push(x.createdAt); return a; }, {})).map(([name, dates]) => ({ name, dates })).sort((a, b) => b.dates.length - a.dates.length);
  return (
    <div>
      <PageHeader title="Contract Analysis" sub={`${k.length} clause(s) · ${q.length} qualification(s)`} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Stat value={k.length} label="Contract register" sub={`${k.filter((x) => x.relevance === "High").length} high relevance · ${k.filter((x) => x.pending).length} pending`} icon={<ShieldAlert size={12} />} />
        <Stat value={q.length} label="Qualifications" sub={`${q.filter((x) => x.pending).length} pending review`} icon={<Award size={12} />} />
        <Stat value={k.filter((x) => x.relevance === "High").length} label="High relevance" icon={<AlertTriangle size={12} />} accent />
        <Stat value={k.filter((x) => x.pending).length + q.filter((x) => x.pending).length} label="Pending review" icon={<History size={12} />} accent />
      </div>
      <div className="mt-6"><ContributorHeatmap rows={byAuthor} noun="items" /></div>
      <RecentList title="Recent clauses" href="/app/contract/register" rows={k.slice(0, 6).map((x) => ({ id: x.id, title: `${x.ref} - ${x.title}`, sub: x.category, right: `${x.relevance} relevance`, tone: x.relevance === "High" ? "text-app-red" : undefined }))} />
    </div>
  );
}
