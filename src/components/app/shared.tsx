"use client";
import { useState } from "react";
import { FileText, Table2, Upload, Download, Plus, Sparkles, Search, Filter, ChevronDown, Check, X } from "lucide-react";
import { Button, Card, Label, Input, Badge } from "@/components/ui";
import { contributors } from "@/store/seed";
import { cn } from "@/lib/cn";

/** Toolbar shown on every register: Word / Excel export, import, add, generate. */
export function RegisterToolbar({ onWord, onExcel, onImport, importLabel = "Import answers", onIngest, onAdd, addLabel = "Add", onGenerate, generating }: {
  onWord?: () => void; onExcel?: () => void; onImport?: () => void; importLabel?: string; onIngest?: () => void; onAdd?: () => void; addLabel?: string; onGenerate?: () => void; generating?: boolean;
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {onWord && <Button variant="outline" onClick={onWord}><FileText size={13} /> Word</Button>}
      {onExcel && <Button variant="outline" onClick={onExcel}><Table2 size={13} /> Excel</Button>}
      {onImport && <Button variant="outline" onClick={onImport}><Upload size={13} /> {importLabel}</Button>}
      {onIngest && <Button variant="outline" onClick={onIngest}><Download size={13} /> Ingest answers</Button>}
      {onAdd && <Button variant="outline" onClick={onAdd}><Plus size={13} /> {addLabel}</Button>}
      {onGenerate && <Button variant="primary" onClick={onGenerate} disabled={generating}><Sparkles size={13} /> {generating ? "Generating…" : "Generate"}</Button>}
    </div>
  );
}

export function SearchFilter({ q, setQ, children }: { q: string; setQ: (v: string) => void; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[220px]">
        <Search size={13} className="absolute left-2.5 top-2.5 text-app-dim" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="w-full pl-8" />
      </div>
      {children && <Button variant="outline" onClick={() => setOpen(!open)}><Filter size={13} /> Filters <ChevronDown size={12} /></Button>}
      {open && <div className="flex w-full flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function PendingBar({ count, noun, onAcceptAll, onRejectAll }: { count: number; noun: string; onAcceptAll: () => void; onRejectAll: () => void }) {
  if (!count) return null;
  return (
    <Card className="mb-4 flex items-center justify-between px-4 py-2.5">
      <p className="font-sans text-xs text-app-accent">{count} {noun} pending review</p>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={onAcceptAll}><Check size={12} /> Accept all</Button>
        <Button variant="outline" size="sm" onClick={onRejectAll}><X size={12} /> Reject all</Button>
      </div>
    </Card>
  );
}

export function TrustScore({ items }: { items: { confidence: "High" | "Medium" | "Low"; flag?: string }[] }) {
  const n = items.length || 1;
  const hi = items.filter((i) => i.confidence === "High").length, med = items.filter((i) => i.confidence === "Medium").length, lo = items.filter((i) => i.confidence === "Low").length;
  const score = Math.round(((hi * 1 + med * 0.5) / n) * 100);
  const flagged = items.filter((i) => i.flag).length;
  return (
    <Card className="p-4 font-sans">
      <Label>AI trust score</Label>
      <p className="mt-1 font-display text-4xl text-app-text">{score}<span className="text-sm text-app-muted">/100</span></p>
      <p className="mt-1 text-[11px] text-app-muted">{score}% of AI items are cited and worth asking the client{flagged ? ` · ${flagged} flagged answer-internally` : ""}</p>
      <div className="mt-4 space-y-3">
        {[["High Confidence", hi, "bg-app-green", "text-app-green"], ["Medium Confidence", med, "bg-app-yellow", "text-app-yellow"], ["Low Confidence", lo, "bg-app-red", "text-app-red"]].map(([l, v, bg, tc]) => (
          <div key={l as string}>
            <div className="flex justify-between text-[11px]"><span className={tc as string}>{l}</span><span className="text-app-muted">{Math.round(((v as number) / n) * 100)}% · {v as number}</span></div>
            <div className="mt-1 h-0.5 w-full bg-app-border"><div className={cn("h-0.5", bg as string)} style={{ width: `${((v as number) / n) * 100}%` }} /></div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** 30-day contributor heatmap, GitHub style. */
export function ContributorHeatmap({ rows, noun = "items" }: { rows: { name: string; dates: string[] }[]; noun?: string }) {
  const days = Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (29 - i)); return d; });
  const key = (d: Date) => d.toISOString().slice(0, 10);
  return (
    <Card className="p-4 font-sans">
      <Label className="mb-3">Top contributors · last 30 days</Label>
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="ml-[150px] mb-1 flex gap-[5px]">{days.map((d) => <span key={key(d)} className="w-[18px] text-center font-mono text-[9px] text-app-dim">{"SMTWTFS"[d.getDay()]}</span>)}</div>
          {rows.map((r) => {
            const c = contributors.find((x) => x.name === r.name) || { initials: r.name.slice(0, 2).toUpperCase(), color: "#5c6b78" };
            return (
              <div key={r.name} className="mb-1.5 flex items-center">
                <div className="flex w-[150px] items-center gap-2 text-xs text-app-text"><span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-white" style={{ background: c.color }}>{c.initials}</span>{r.name}</div>
                <div className="flex gap-[5px]">{days.map((d) => { const hit = r.dates.some((x) => x.slice(0, 10) === key(d)); return <span key={key(d)} className={cn("h-[14px] w-[18px] rounded-[2px]", !hit && "app-heat-empty")} style={hit ? { background: c.color } : undefined} />; })}</div>
                <span className="ml-3 text-[11px] text-app-dim">{r.dates.length} {noun}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export function GroupHeader({ label, count }: { label: string; count: number }) {
  return <div className="mb-3 mt-6 flex items-center gap-2 first:mt-0"><ChevronDown size={13} className="text-app-muted" /><span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-app-text">{label}</span><span className="font-mono text-[10px] text-app-accent">{count}</span><div className="h-px flex-1 bg-app-border" /></div>;
}

export function RelevanceBadge({ r }: { r: "High" | "Medium" | "Low" }) {
  return <Badge tone={r === "High" ? "red" : r === "Medium" ? "outline" : "outline"}>{r} relevance</Badge>;
}

/** Client-side export helpers (CSV for Excel, HTML-as-.doc for Word). */
export function exportCSV(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  download(`${name}.csv`, [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n"), "text/csv");
}
export function exportWord(name: string, title: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const html = `<html><head><meta charset="utf-8"><style>body{font-family:Georgia}table{border-collapse:collapse}td,th{border:1px solid #999;padding:4px 6px;font-size:11pt;vertical-align:top}</style></head><body><h1>${title}</h1><table><tr>${cols.map((c) => `<th>${c}</th>`).join("")}</tr>${rows.map((r) => `<tr>${cols.map((c) => `<td>${String(r[c] ?? "")}</td>`).join("")}</tr>`).join("")}</table></body></html>`;
  download(`${name}.doc`, html, "application/msword");
}
function download(filename: string, content: string, type: string) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = filename; a.click(); URL.revokeObjectURL(a.href);
}

/** Simulated AI run modal body: shows docs read, token/cost estimate, model selector. */
export function RunEstimate({ docs, model, setModel }: { docs: { name: string; kind: string }[]; model: string; setModel: (m: string) => void }) {
  return (
    <>
      <Label className="mb-2">Documents to read ({docs.length}/{docs.length})</Label>
      <div className="space-y-1.5">
        {docs.map((d) => <div key={d.name} className="flex items-center justify-between rounded border border-app-border bg-app-bg px-3 py-2 font-sans text-xs text-app-text"><span className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-[#c8772e]" /><FileText size={12} className="text-app-muted" />{d.name}</span><span className="text-app-dim">{d.kind}</span></div>)}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="font-mono text-[11px] text-app-muted">~{(docs.length * 252).toLocaleString()}k tok · ~${(docs.length * 0.12).toFixed(2)} · $0.00 this month</p>
        <select value={model} onChange={(e) => setModel(e.target.value)} className="rounded-sm border border-app-border-2 bg-app-bg px-2 py-1 font-sans text-xs text-app-text"><option>Lite</option><option>Max</option></select>
      </div>
    </>
  );
}
