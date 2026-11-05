"use client";
import { useState } from "react";
import { PageHeader, Card, Label, Button } from "@/components/ui";
import { useScopedStore } from "@/store/useStore";
import { cn } from "@/lib/cn";

export default function MatrixPage() {
  const { risks } = useScopedStore();
  const [post, setPost] = useState(false);
  const cell = (p: number, i: number) => risks.filter((r) => (post ? r.postProbability : r.probability) === p && (post ? r.postImpact : r.impact) === i);
  const color = (p: number, i: number) => { const s = p * i; return s >= 16 ? "bg-app-red/30" : s >= 10 ? "bg-app-red/15" : s >= 5 ? "bg-app-yellow/15" : "bg-app-green/10"; };
  return (
    <div className="font-sans">
      <PageHeader title="5×5 Matrix" sub="Probability × impact. Click a cell's risk number to jump to the register." right={<div className="flex rounded border border-app-border p-0.5"><Button size="sm" variant={post ? "ghost" : "primary"} onClick={() => setPost(false)}>Pre-mitigation</Button><Button size="sm" variant={post ? "primary" : "ghost"} onClick={() => setPost(true)}>Post-mitigation</Button></div>} />
      <Card className="inline-block p-5">
        <div className="flex">
          <div className="flex flex-col justify-between py-1 pr-2"><Label className="[writing-mode:vertical-rl] rotate-180">Probability →</Label></div>
          <div>
            {[5, 4, 3, 2, 1].map((p) => (
              <div key={p} className="flex">
                <span className="flex w-6 items-center justify-center font-mono text-[11px] text-app-muted">{p}</span>
                {[1, 2, 3, 4, 5].map((i) => { const rs = cell(p, i); return (
                  <div key={i} className={cn("m-0.5 flex h-20 w-24 flex-wrap content-start gap-1 rounded border border-app-border p-1.5", color(p, i))}>
                    {rs.map((r) => <a key={r.id} href="/app/risks/register" title={r.title} className={cn("flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px]", r.kind === "Risk" ? "bg-app-panel text-app-text" : "bg-app-green/40 text-white")}>{r.n}</a>)}
                  </div>
                ); })}
              </div>
            ))}
            <div className="ml-6 flex">{[1, 2, 3, 4, 5].map((i) => <span key={i} className="m-0.5 w-24 text-center font-mono text-[11px] text-app-muted">{i}</span>)}</div>
            <Label className="mt-1 text-center">Impact →</Label>
          </div>
        </div>
      </Card>
      <div className="mt-4 flex gap-4 text-xs text-app-muted"><span><span className="mr-1 inline-block h-3 w-3 rounded bg-app-red/30 align-middle" />Very High (≥16)</span><span><span className="mr-1 inline-block h-3 w-3 rounded bg-app-red/15 align-middle" />High (10–15)</span><span><span className="mr-1 inline-block h-3 w-3 rounded bg-app-yellow/15 align-middle" />Medium (5–9)</span><span><span className="mr-1 inline-block h-3 w-3 rounded bg-app-green/10 align-middle" />Low (&lt;5)</span></div>
    </div>
  );
}
