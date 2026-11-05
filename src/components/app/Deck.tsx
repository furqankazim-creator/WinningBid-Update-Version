"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Download, Sparkles, Check } from "lucide-react";
import { PageHeader, Card, Button, Badge } from "@/components/ui";
import { cn } from "@/lib/cn";

export interface Slide { title: string; bullets: string[]; }
export function Deck({ title, sub, slides, approvable }: { title: string; sub: string; slides: Slide[]; approvable?: boolean }) {
  const [i, setI] = useState(0); const [approved, setApproved] = useState(false);
  const s = slides[i];
  return (
    <div className="font-sans">
      <PageHeader title={title} sub={sub} right={<>{approvable && <Button variant={approved ? "outline" : "primary"} onClick={() => setApproved(!approved)}><Check size={13} /> {approved ? "Approved" : "Approve deck"}</Button>}<Button variant="outline"><Sparkles size={13} /> Regenerate</Button><Button variant="outline" onClick={() => window.print()}><Download size={13} /> Export PPTX</Button></>} />
      <Card className="aspect-[16/9] max-h-[520px] w-full overflow-hidden bg-[#0e2233] p-10 text-cream">
        <p className="eyebrow text-accent">{title} · {i + 1}/{slides.length}</p>
        <h2 className="mt-4 font-display text-3xl">{s.title}</h2>
        <ul className="mt-6 space-y-2 text-[15px] leading-relaxed text-cream/85">{s.bullets.map((b) => <li key={b} className="flex gap-3"><span className="text-accent">—</span>{b}</li>)}</ul>
      </Card>
      <div className="mt-3 flex items-center justify-between">
        <Button variant="outline" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}><ChevronLeft size={13} /> Prev</Button>
        <div className="flex gap-1">{slides.map((_, k) => <button key={k} onClick={() => setI(k)} className={cn("h-1.5 w-6 rounded", k === i ? "bg-app-accent" : "bg-app-border")} />)}</div>
        <Button variant="outline" onClick={() => setI(Math.min(slides.length - 1, i + 1))} disabled={i === slides.length - 1}>Next <ChevronRight size={13} /></Button>
      </div>
      {approved && <Badge tone="green" className="mt-3">Approved for management review</Badge>}
    </div>
  );
}
