"use client";
import { MessageSquare, Layers, History, FileEdit } from "lucide-react";
import { Stat, PageHeader } from "@/components/ui";
import { ContributorHeatmap } from "@/components/app/shared";
import { RecentList } from "@/components/app/OverviewRecent";
import { useScopedStore } from "@/store/useStore";

export default function ClarificationsOverview() {
  const { clarifications: c } = useScopedStore();
  const latest = c.filter((x) => ["Approved", "Answered", "Closed"].includes(x.status));
  const byAuthor = Object.entries(c.reduce<Record<string, string[]>>((a, x) => { (a[x.author] ||= []).push(x.createdAt); return a; }, {})).map(([name, dates]) => ({ name, dates })).sort((a, b) => b.dates.length - a.dates.length);
  return (
    <div>
      <PageHeader title="Clarifications" sub={`${c.length} item(s) total`} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Stat value={c.length} label="Clarification register" sub={`${c.filter((x) => x.status === "Draft").length} draft · ${c.filter((x) => x.status === "Internal Review").length} internal review`} icon={<MessageSquare size={12} />} />
        <Stat value={latest.length} label="Latest" sub="approved / answered / closed" icon={<Layers size={12} />} />
        <Stat value={c.filter((x) => x.pending).length} label="Pending AI review" icon={<History size={12} />} accent />
        <Stat value={c.filter((x) => x.status === "Draft").length} label="Drafts" sub="status = Draft" icon={<FileEdit size={12} />} />
      </div>
      <div className="mt-6"><ContributorHeatmap rows={byAuthor} noun="clarifications" /></div>
      <RecentList title="Recent clarifications" href="/app/clarifications/register" rows={c.slice(0, 6).map((x) => ({ id: x.id, title: x.title, sub: x.category, right: x.status, tone: x.status === "Approved" ? "text-app-green" : undefined }))} />
    </div>
  );
}
