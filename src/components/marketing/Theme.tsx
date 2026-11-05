"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sun, Moon, Monitor, Palette, Check } from "lucide-react";
import { cn } from "@/lib/cn";

export type Mode = "light" | "dark" | "system";
export const accents = [
  { id: "orange", label: "Ember", hex: "#c8772e" }, { id: "blue", label: "Ocean", hex: "#2f7de1" }, { id: "emerald", label: "Emerald", hex: "#17a673" },
  { id: "violet", label: "Violet", hex: "#7c5cf6" }, { id: "rose", label: "Rose", hex: "#e2507a" },
];

function apply(mode: Mode, accent: string) {
  const root = document.documentElement;
  const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.setAttribute("data-theme", dark ? "dark" : "light");
  root.setAttribute("data-accent", accent);
}

/** Inline boot script — runs before paint to avoid a theme or direction flash. */
export const themeBootScript = `try{var q=new URLSearchParams(location.search);if(q.get("theme"))localStorage.setItem("vq.mode",q.get("theme"));if(q.get("accent"))localStorage.setItem("vq.accent",q.get("accent"));var m=localStorage.getItem("vq.mode")||"light",a=localStorage.getItem("vq.accent")||"orange",d=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light");document.documentElement.setAttribute("data-accent",a);if(q.get("app"))localStorage.setItem("vq.appMode",q.get("app"));if(q.get("demo")==="1"&&!localStorage.getItem("vq.session"))localStorage.setItem("vq.session",JSON.stringify({token:"",user:{id:"demo",name:"Demo User",email:"demo@vendoriq.app",role:"Organization Admin",orgId:"demo"},org:{id:"demo",name:"Demo organisation",plan:"Team",currency:"USD",industries:[],seeded:true}}));var w=localStorage.getItem("vq.appMode")||"dark";document.documentElement.setAttribute("data-app-theme",w);var l=localStorage.getItem("vendoriq.lang")||localStorage.getItem("vendoriq.sow.lang")||"en";document.documentElement.setAttribute("lang",l);document.documentElement.setAttribute("dir",l==="ar"?"rtl":"ltr");if(l==="ar"){document.documentElement.classList.add("is-rtl")}}catch(e){}`;

export function ThemeControls({ compact }: { compact?: boolean }) {
  const [mode, setMode] = useState<Mode>("light"); const [accent, setAccent] = useState("orange"); const [open, setOpen] = useState(false); const [loaded, setLoaded] = useState(false);
  useEffect(() => { try { setMode((localStorage.getItem("vq.mode") as Mode) || "light"); setAccent(localStorage.getItem("vq.accent") || "orange"); } catch {} setLoaded(true); }, []);
  // Only apply after the stored preference is loaded — the boot script already painted the right theme.
  useEffect(() => { if (!loaded) return; apply(mode, accent); try { localStorage.setItem("vq.mode", mode); localStorage.setItem("vq.accent", accent); } catch {} }, [mode, accent, loaded]);
  const next: Record<Mode, Mode> = { light: "dark", dark: "system", system: "light" };
  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;
  return (
    <div className="relative flex items-center gap-1">
      <button onClick={() => setMode(next[mode])} title={`Theme: ${mode}`} className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink hover:border-accent hover:text-accent"><Icon size={14} /></button>
      <button onClick={() => setOpen(!open)} title="Accent colour" className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink hover:border-accent hover:text-accent"><Palette size={14} /></button>
      {open && (
        <div className={cn("absolute right-0 top-10 z-50 flex gap-2 rounded-full border border-line bg-cream p-2 shadow-xl", compact && "left-0 right-auto")} onMouseLeave={() => setOpen(false)}>
          {accents.map((a) => <button key={a.id} onClick={() => { setAccent(a.id); setOpen(false); }} title={a.label} className="relative flex h-6 w-6 items-center justify-center rounded-full ring-offset-2 ring-offset-cream transition-transform hover:scale-110" style={{ background: a.hex, boxShadow: accent === a.id ? `0 0 0 2px var(--bravo-cream), 0 0 0 4px ${a.hex}` : undefined }}>{accent === a.id && <Check size={12} className="text-white" />}</button>)}
        </div>
      )}
    </div>
  );
}

/** Adds .in to .reveal elements as they enter the viewport. */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
    const scan = () => document.querySelectorAll<HTMLElement>(".reveal:not(.in)").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan); mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [pathname]);
  return null;
}


/** Workspace (/app) light/dark toggle — independent of the landing theme. */
export function AppThemeToggle({ className }: { className?: string }) {
  const [mode, setMode] = useState<"dark" | "light">("dark");
  useEffect(() => { try { setMode((localStorage.getItem("vq.appMode") as "dark" | "light") || "dark"); } catch {} }, []);
  const toggle = () => { const next = mode === "dark" ? "light" : "dark"; setMode(next); document.documentElement.setAttribute("data-app-theme", next); try { localStorage.setItem("vq.appMode", next); } catch {} };
  return <button onClick={toggle} title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`} className={className}>{mode === "dark" ? <Sun size={13} /> : <Moon size={13} />}<span className="hidden xl:inline">{mode === "dark" ? "Light" : "Dark"}</span></button>;
}
