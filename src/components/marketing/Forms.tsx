"use client";
import { useState } from "react";
import { cn } from "@/lib/cn";

export function DemoForm({ dark }: { dark?: boolean }) {
  const [sent, setSent] = useState(false);
  const field = cn("w-full border bg-transparent px-3 py-2.5 text-sm outline-none", dark ? "border-cream/30 placeholder:text-cream/40 focus:border-cream" : "border-line placeholder:text-muted focus:border-ink");
  if (sent) return <p className={cn("border p-6 font-display text-lg", dark ? "border-cream/20" : "border-line")}>Thanks — we&apos;ll be in touch within one business day.</p>;
  return (
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
      <input required placeholder="Full name" className={field} />
      <input required type="email" placeholder="Work email" className={field} />
      <input placeholder="Company" className={cn(field, "sm:col-span-2")} />
      <textarea placeholder="Tell us about your next tender" rows={3} className={cn(field, "sm:col-span-2")} />
      <button className="rounded-sm bg-accent px-5 py-2.5 text-sm font-medium text-white hover:brightness-110 sm:col-span-2 sm:w-max">Request a Demo</button>
    </form>
  );
}

export function SubscribeForm() {
  const [sent, setSent] = useState(false);
  if (sent) return <p className="text-sm text-cream/80">Subscribed. The next issue lands in your inbox.</p>;
  return (
    <form className="flex max-w-md gap-2" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
      <input required type="email" placeholder="you@company.com" className="w-full border border-cream/30 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-cream/40 focus:border-cream" />
      <button className="rounded-sm bg-accent px-5 py-2.5 text-sm font-medium text-white hover:brightness-110">Subscribe</button>
    </form>
  );
}

export function FAQ({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((it, i) => (
        <button key={i} onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-start justify-between gap-6 py-5 text-left">
          <div>
            <p className="font-display text-lg">{it.q}</p>
            {open === i && <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted">{it.a}</p>}
          </div>
          <span className="font-mono text-xl text-accent">{open === i ? "–" : "+"}</span>
        </button>
      ))}
    </div>
  );
}
