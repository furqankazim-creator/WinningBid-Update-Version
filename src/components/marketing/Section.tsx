import { cn } from "@/lib/cn";

export function Section({ children, className, dark }: { children: React.ReactNode; className?: string; dark?: boolean }) {
  return (
    <section className={cn(dark ? "bg-navy text-cream" : "bg-cream text-ink", className)}>
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("eyebrow reveal text-accent", className)}>{children}</p>;
}

export function NumberedCard({ n, title, body, dark, delay }: { n: string; title: string; body: string; dark?: boolean; delay?: number }) {
  return (
    <div data-delay={delay} className={cn("reveal card-lift rounded-lg border p-6", dark ? "border-cream/15 bg-white/[0.03]" : "border-line bg-white/40 dark-card")}>
      <span className="eyebrow inline-flex h-7 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">{n}</span>
      <h3 className="mt-3 font-display text-xl">{title}</h3>
      <p className={cn("mt-2 text-[15px] leading-relaxed", dark ? "text-cream/70" : "text-muted")}>{body}</p>
    </div>
  );
}
