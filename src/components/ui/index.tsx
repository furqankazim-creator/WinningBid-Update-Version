"use client";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";
import { useEffect } from "react";

export function Button({ variant = "ghost", size = "md", className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" | "danger" | "success"; size?: "sm" | "md" }) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm font-sans transition-colors disabled:opacity-50 whitespace-nowrap",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-[13px]",
        variant === "primary" && "bg-app-accent text-white hover:brightness-110",
        variant === "ghost" && "text-app-text hover:bg-app-panel-2",
        variant === "outline" && "border border-app-border-2 bg-app-panel text-app-text hover:border-app-muted",
        variant === "danger" && "border border-app-border-2 text-app-text hover:border-app-red hover:text-app-red",
        variant === "success" && "bg-app-accent text-white hover:brightness-110",
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded border border-app-border bg-app-panel", className)} {...rest}>{children}</div>;
}

export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: "neutral" | "accent" | "green" | "yellow" | "red" | "purple" | "blue" | "outline"; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-sans text-[11px] leading-4",
      tone === "neutral" && "border-app-border-2 bg-app-panel-2 text-app-text",
      tone === "outline" && "border-app-border-2 text-app-muted",
      tone === "accent" && "border-app-accent/50 bg-app-accent/15 text-app-accent",
      tone === "green" && "border-app-green/40 bg-app-green/10 text-app-green",
      tone === "yellow" && "border-app-yellow/40 bg-app-yellow/10 text-app-yellow",
      tone === "red" && "border-app-red/40 bg-app-red/10 text-app-red",
      tone === "purple" && "border-app-purple/40 bg-app-purple/10 text-app-purple",
      tone === "blue" && "border-app-blue/40 bg-app-blue/10 text-app-blue",
      className)}>{children}</span>
  );
}

export function confidenceTone(c: "High" | "Medium" | "Low") { return c === "High" ? "green" : c === "Medium" ? "yellow" : "red"; }

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("font-mono text-[10px] uppercase tracking-[0.14em] text-app-muted", className)}>{children}</p>;
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-app-text">{children}</p>
      {right && <div className="text-[11px] text-app-muted">{right}</div>}
    </div>
  );
}

export function PageHeader({ title, sub, right }: { title: string; sub?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl text-app-text">{title}</h1>
        {sub && <p className="mt-1 text-xs text-app-muted">{sub}</p>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}

const control = "rounded-sm border border-app-border-2 bg-app-bg px-2.5 py-1.5 font-sans text-[13px] text-app-text outline-none focus:border-app-muted placeholder:text-app-dim";
export function Input({ className, ...p }: React.InputHTMLAttributes<HTMLInputElement>) { return <input className={cn(control, className)} {...p} />; }
export function Textarea({ className, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={cn(control, "min-h-[80px]", className)} {...p} />; }
export function Select({ className, children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) { return <select className={cn(control, "pr-6", className)} {...p}>{children}</select>; }

export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={cn("block", className)}><Label className="mb-1">{label}</Label>{children}</label>;
}

export function Modal({ open, onClose, title, sub, children, wide }: { open: boolean; onClose: () => void; title?: string; sub?: string; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-[8vh]" onClick={onClose}>
      <div className={cn("fade-up w-full rounded border border-app-border-2 bg-app-panel shadow-2xl", wide ? "max-w-3xl" : "max-w-md")} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="flex items-start justify-between border-b border-app-border px-4 py-3">
            <div><p className="font-sans text-sm font-semibold text-app-accent">{title}</p>{sub && <p className="mt-0.5 text-xs text-app-muted">{sub}</p>}</div>
            <button onClick={onClose} className="text-app-muted hover:text-app-text"><X size={16} /></button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export function Stat({ value, label, sub, icon, accent }: { value: React.ReactNode; label: string; sub?: string; icon?: React.ReactNode; accent?: boolean }) {
  return (
    <Card className="p-5">
      <p className={cn("font-display text-3xl", accent ? "text-app-accent" : "text-app-text")}>{value}</p>
      <div className="my-3 h-px bg-app-border" />
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-app-muted">{icon}{label}</div>
      {sub && <p className="mt-1 text-[11px] text-app-dim">{sub}</p>}
    </Card>
  );
}

export function Empty({ icon, title, body }: { icon?: React.ReactNode; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="text-app-dim">{icon}</div>
      <p className="mt-3 text-sm text-app-muted">{title}</p>
      {body && <p className="mt-1 max-w-md text-xs text-app-dim">{body}</p>}
    </div>
  );
}

export function ProgressBar({ value, tone = "accent", className }: { value: number; tone?: "accent" | "green" | "yellow" | "red"; className?: string }) {
  const c = { accent: "bg-app-accent", green: "bg-app-green", yellow: "bg-app-yellow", red: "bg-app-red" }[tone];
  return <div className={cn("h-1 w-full rounded-full bg-app-border", className)}><div className={cn("h-1 rounded-full", c)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded border border-app-border">
      <table className="w-full text-left font-sans text-[13px]">
        <thead><tr className="border-b border-app-border bg-app-panel-2">{head.map((h) => <th key={h} className="px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-app-muted">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-app-border">{children}</tbody>
      </table>
    </div>
  );
}
