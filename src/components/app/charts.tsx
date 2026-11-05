"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Label } from "@/components/ui";
import { cn } from "@/lib/cn";

/** Categorical palette, fixed order, validated for the dark app surface (#141414) — never cycled. */
export const series = ["#d95926", "#3987e5", "#199e70", "#c98500", "#d55181", "#9085e9"];
const seriesFor = (i: number) => series[Math.min(i, series.length - 1)];

export function money(n: number, cur = "USD") { return new Intl.NumberFormat("en-US", { style: "currency", currency: cur, notation: "compact", maximumFractionDigits: 1 }).format(n); }

function useMounted() { const [m, setM] = useState(false); useEffect(() => { const id = requestAnimationFrame(() => setM(true)); return () => cancelAnimationFrame(id); }, []); return m; }

function Tooltip({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return <div className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded border border-app-border-2 bg-app-bg/95 px-2.5 py-1.5 font-sans text-[11px] text-app-text shadow-xl backdrop-blur" style={{ left: x, top: y - 8 }}>{children}</div>;
}

export type Datum = { label: string; value: number };

/** Horizontal bars: thin marks, rounded data-end, animated width, hover tooltip, direct labels in text tokens. */
export function BarChart({ title, data, fmt = (n: number) => n.toLocaleString(), max: maxIn, showPct }: { title: string; data: Datum[]; fmt?: (n: number) => string; max?: number; showPct?: boolean }) {
  const mounted = useMounted(); const [hover, setHover] = useState<number | null>(null);
  const max = maxIn ?? Math.max(1, ...data.map((d) => d.value)); const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const rows = data.slice(0, 8);
  return (
    <Card className="p-4 font-sans">
      <Label className="mb-3">{title}</Label>
      {rows.length === 0 && <p className="text-xs text-app-dim">No data.</p>}
      <div className="space-y-2.5">{rows.map((d, i) => (
        <div key={d.label} className="group relative" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
          <div className="flex justify-between text-[11px]"><span className="truncate text-app-text">{d.label}</span><span className={cn("ml-2 shrink-0 tabular-nums transition-colors", hover === i ? "text-app-text" : "text-app-muted")}>{fmt(d.value)}{showPct && <span className="ml-1 text-app-dim">{Math.round((d.value / total) * 100)}%</span>}</span></div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-app-border/70">
            <div className="h-2 rounded-full transition-[width,filter] duration-700 ease-out" style={{ width: mounted ? `${(d.value / max) * 100}%` : "0%", background: seriesFor(i), transitionDelay: `${i * 60}ms`, filter: hover === i ? "brightness(1.2)" : undefined }} />
          </div>
        </div>
      ))}</div>
      {data.length > 8 && <p className="mt-2 text-[10px] text-app-dim">+{data.length - 8} more folded</p>}
    </Card>
  );
}

/** Vertical columns with baseline, animated growth, gaps between bars, hover tooltip and legend-free direct labels. */
export function ColumnChart({ title, data, fmt = (n: number) => n.toLocaleString(), colorByIndex = true, accent }: { title: string; data: Datum[]; fmt?: (n: number) => string; colorByIndex?: boolean; accent?: string }) {
  const mounted = useMounted(); const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const W = 320, H = 150, padL = 8, padB = 24, padT = 8; const n = data.length || 1; const slot = (W - padL * 2) / n; const bw = Math.min(28, slot * 0.6);
  const ticks = [0, 0.5, 1];
  return (
    <Card className="relative p-4 font-sans">
      <Label className="mb-2">{title}</Label>
      {data.length === 0 ? <p className="text-xs text-app-dim">No data.</p> : (
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
            {ticks.map((t) => <line key={t} x1={padL} x2={W - padL} y1={padT + (1 - t) * (H - padT - padB)} y2={padT + (1 - t) * (H - padT - padB)} style={{ stroke: "var(--app-border)" }} strokeDasharray={t === 0 ? undefined : "2 4"} />)}
            {data.map((d, i) => { const h = (d.value / max) * (H - padT - padB); const x = padL + i * slot + (slot - bw) / 2; const y = H - padB - h; const c = accent || (colorByIndex ? seriesFor(i) : series[0]); return (
              <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <rect x={padL + i * slot} y={padT} width={slot} height={H - padT - padB} fill="transparent" />
                <rect x={x} width={bw} rx={4} y={mounted ? y : H - padB} height={mounted ? Math.max(h, d.value ? 4 : 0) : 0} fill={c} opacity={hover === null || hover === i ? 1 : 0.45} style={{ transition: `y .7s cubic-bezier(.2,.8,.2,1) ${i * 60}ms, height .7s cubic-bezier(.2,.8,.2,1) ${i * 60}ms, opacity .2s` }} />
                <text x={x + bw / 2} y={H - padB + 14} textAnchor="middle" fontSize="9" style={{ fill: "var(--app-muted)" }} fontFamily="var(--font-mono)">{d.label.length > 9 ? d.label.slice(0, 8) + "…" : d.label}</text>
                {(hover === i || data.length <= 6) && <text x={x + bw / 2} y={y - 5} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" style={{ fill: "var(--app-text)", opacity: mounted ? 1 : 0, transition: "opacity .4s .6s" }}>{fmt(d.value)}</text>}
              </g>
            ); })}
          </svg>
        </div>
      )}
    </Card>
  );
}

/** Donut with animated arcs, hover emphasis and a legend (identity never color-alone). */
export function Donut({ title, data, center, sub }: { title: string; data: Datum[]; center?: string; sub?: string }) {
  const mounted = useMounted(); const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((a, d) => a + d.value, 0) || 1; const r = 42, c = 2 * Math.PI * r; let acc = 0;
  return (
    <Card className="p-4 font-sans">
      <Label className="mb-3">{title}</Label>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 100 100" className="h-32 w-32 shrink-0">
          <circle cx="50" cy="50" r={r} fill="none" style={{ stroke: "var(--app-border)" }} strokeWidth="11" />
          {data.map((d, i) => { const len = (d.value / total) * c - 1.5; const off = -acc; acc += (d.value / total) * c; return <circle key={d.label} cx="50" cy="50" r={r} fill="none" stroke={seriesFor(i)} strokeWidth={hover === i ? 13 : 11} strokeLinecap="round" strokeDasharray={mounted ? `${Math.max(len, 0)} ${c}` : `0 ${c}`} strokeDashoffset={off} transform="rotate(-90 50 50)" opacity={hover === null || hover === i ? 1 : 0.4} style={{ transition: `stroke-dasharray .9s cubic-bezier(.2,.8,.2,1) ${i * 80}ms, opacity .2s, stroke-width .2s` }} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />; })}
          <text x="50" y="50" textAnchor="middle" fontSize="15" style={{ fill: "var(--app-text)" }} fontFamily="var(--font-display)">{hover !== null ? data[hover].value : center ?? total}</text>
          <text x="50" y="62" textAnchor="middle" fontSize="6.5" style={{ fill: "var(--app-muted)" }} fontFamily="var(--font-mono)">{hover !== null ? data[hover].label.slice(0, 16) : sub ?? ""}</text>
        </svg>
        <div className="space-y-1.5 text-[11px]">{data.map((d, i) => <button key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className={cn("flex w-full items-center gap-2 text-left transition-opacity", hover !== null && hover !== i && "opacity-50")}><span className="h-2.5 w-2.5 rounded-sm" style={{ background: seriesFor(i) }} /><span className="text-app-text">{d.label}</span><span className="ml-auto pl-3 tabular-nums text-app-muted">{d.value} <span className="text-app-dim">· {Math.round((d.value / total) * 100)}%</span></span></button>)}</div>
      </div>
    </Card>
  );
}

/** Area/line over time with crosshair + tooltip. Points: {label, value}. */
export function AreaChart({ title, data, fmt = (n: number) => n.toLocaleString(), color = series[0], sub }: { title: string; data: Datum[]; fmt?: (n: number) => string; color?: string; sub?: string }) {
  const mounted = useMounted(); const ref = useRef<HTMLDivElement>(null); const [hover, setHover] = useState<number | null>(null);
  const W = 640, H = 180, padL = 8, padR = 8, padT = 12, padB = 22;
  const max = Math.max(1, ...data.map((d) => d.value)); const n = data.length;
  const pts = useMemo(() => data.map((d, i) => ({ x: padL + (n > 1 ? (i / (n - 1)) * (W - padL - padR) : (W / 2)), y: padT + (1 - d.value / max) * (H - padT - padB) })), [data, max, n]);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
  const area = pts.length ? `${path} L${pts[pts.length - 1].x},${H - padB} L${pts[0].x},${H - padB} Z` : "";
  const onMove = (e: React.MouseEvent) => { const rect = ref.current?.getBoundingClientRect(); if (!rect || !n) return; const px = ((e.clientX - rect.left) / rect.width) * W; let best = 0; pts.forEach((p, i) => { if (Math.abs(p.x - px) < Math.abs(pts[best].x - px)) best = i; }); setHover(best); };
  return (
    <Card className="p-4 font-sans">
      <div className="mb-2 flex items-baseline justify-between"><Label>{title}</Label>{sub && <span className="text-[10px] text-app-dim">{sub}</span>}</div>
      {n === 0 ? <p className="text-xs text-app-dim">No data.</p> : (
        <div ref={ref} className="relative" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
            <defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.35" /><stop offset="100%" stopColor={color} stopOpacity="0.02" /></linearGradient></defs>
            {[0, 0.5, 1].map((t) => <line key={t} x1={padL} x2={W - padR} y1={padT + (1 - t) * (H - padT - padB)} y2={padT + (1 - t) * (H - padT - padB)} style={{ stroke: "var(--app-border)" }} strokeDasharray={t === 0 ? undefined : "2 4"} />)}
            <path d={area} fill="url(#areaFill)" style={{ opacity: mounted ? 1 : 0, transition: "opacity 1s .3s" }} />
            <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={mounted ? 0 : 1} style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)" }} />
            {hover !== null && <><line x1={pts[hover].x} x2={pts[hover].x} y1={padT} y2={H - padB} style={{ stroke: "var(--app-border-2)" }} /><circle cx={pts[hover].x} cy={pts[hover].y} r="4.5" fill={color} style={{ stroke: "var(--app-panel)" }} strokeWidth="2" /></>}
            {data.map((d, i) => (i % Math.ceil(n / 8) === 0 || i === n - 1) && <text key={i} x={pts[i].x} y={H - 6} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fontSize="9" style={{ fill: "var(--app-muted)" }} fontFamily="var(--font-mono)">{d.label}</text>)}
          </svg>
          {hover !== null && <Tooltip x={(pts[hover].x / W) * (ref.current?.clientWidth || W)} y={(pts[hover].y / H) * (ref.current?.clientHeight || H)}><span className="text-app-muted">{data[hover].label}</span> · <span className="font-semibold">{fmt(data[hover].value)}</span></Tooltip>}
        </div>
      )}
    </Card>
  );
}

/** KPI tile with animated count-up and optional delta. */
export function Kpi({ label, value, sub, tone, delta }: { label: string; value: React.ReactNode; sub?: string; tone?: "accent" | "green" | "red" | "yellow"; delta?: number }) {
  const c = tone === "accent" ? "text-app-accent" : tone === "green" ? "text-app-green" : tone === "red" ? "text-app-red" : tone === "yellow" ? "text-app-yellow" : "text-app-text";
  return (
    <Card className="group relative overflow-hidden p-4 font-sans transition-colors hover:border-app-border-2">
      <div className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity group-hover:opacity-100" style={{ background: `linear-gradient(90deg, transparent, ${tone === "accent" ? "#c8772e" : tone === "green" ? "#3ec48a" : tone === "red" ? "#e5534b" : tone === "yellow" ? "#e3b23c" : "#3987e5"}, transparent)` }} />
      <Label>{label}</Label>
      <p className={`mt-1 font-display text-2xl tabular-nums ${c}`}>{typeof value === "number" ? <CountUp to={value} /> : value}</p>
      <div className="flex items-center justify-between">{sub && <p className="text-[11px] text-app-dim">{sub}</p>}{delta !== undefined && <span className={cn("text-[11px] tabular-nums", delta >= 0 ? "text-app-green" : "text-app-red")}>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%</span>}</div>
    </Card>
  );
}

export function CountUp({ to, duration = 900 }: { to: number; duration?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => { let raf = 0; const t0 = performance.now(); const tick = (t: number) => { const p = Math.min(1, (t - t0) / duration); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf); }, [to, duration]);
  return <>{v.toLocaleString()}</>;
}
