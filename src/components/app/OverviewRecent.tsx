"use client";
import Link from "next/link";
import { Card, SectionTitle } from "@/components/ui";
import { cn } from "@/lib/cn";

export function RecentList({ title, href, rows }: { title: string; href: string; rows: { id: string; title: string; sub: string; right: string; tone?: string }[] }) {
  return (
    <div className="mt-6 font-sans">
      <SectionTitle>{title}</SectionTitle>
      <Card className="divide-y divide-app-border">
        {rows.map((r) => (
          <Link key={r.id} href={href} className="flex items-center justify-between px-4 py-3 hover:bg-app-panel-2">
            <div><p className="text-[13px] text-app-text">{r.title}</p><p className="text-[11px] text-app-muted">{r.sub}</p></div>
            <span className={cn("text-xs", r.tone || "text-app-muted")}>{r.right}</span>
          </Link>
        ))}
      </Card>
    </div>
  );
}
