"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, ShieldCheck, Scale, Lock, FileSearch, Play, CheckCircle2, Bot } from "lucide-react";
import { brand } from "@/config/brand";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const lifecycle = ["DISCOVER", "QUALIFY", "ANALYZE", "DECIDE", "PLAN", "ENGINEER", "PROCURE", "COST", "PRICE", "PROPOSE", "REVIEW", "APPROVE", "SUBMIT", "WIN", "CONTRACT", "PROJECT", "LEARN"];
const health = [["Requirements", 95], ["Compliance", 80], ["Documents", 90], ["Technical", 85], ["Commercial", 75], ["Pricing", 70], ["Risk", 68], ["Submission", 76]] as const;

function Counter({ to, suffix = "", duration = 1400 }: { to: number; suffix?: string; duration?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => { let raf = 0; const t0 = performance.now(); const tick = (t: number) => { const p = Math.min(1, (t - t0) / duration); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf); }, [to, duration]);
  return <>{v.toLocaleString()}{suffix}</>;
}

export function Hero() {
  const { t, lang, isRtl } = useI18n();
  const [tab, setTab] = useState(0);
  useEffect(() => { const id = setInterval(() => setTab((t) => (t + 1) % 3), 4200); return () => clearInterval(id); }, []);

  const previewTabs = [t("Health", "Health"), t("AI drafts"), t("Decision")];

  return (
    <section className="relative overflow-hidden bg-cream text-ink">
      <div className="grid-bg absolute inset-0" />
      <div className="hero-blob hero-blob-a -left-32 -top-32 h-[520px] w-[520px]" style={{ background: "var(--bravo-accent)" }} />
      <div className="hero-blob hero-blob-b right-[-10%] top-[10%] h-[460px] w-[460px]" style={{ background: "#5b93c4" }} />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 md:pb-24 md:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <div className="reveal in inline-flex items-center gap-2 rounded-full border border-line bg-white/50 px-3 py-1 text-xs text-muted backdrop-blur dark-card">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full rounded-full bg-accent" style={{ animation: "pulse-ring 1.8s ease-out infinite" }} /><span className="relative inline-flex h-2 w-2 rounded-full bg-accent" /></span>
              {brand.tagline} · {t("multi-industry")}
            </div>

            {lang === "ar" ? (
              <h1 className="reveal in mt-6 font-display text-4xl leading-[1.15] tracking-tight md:text-6xl font-bold" data-delay="1">
                ضاعف فرص فوزك بالمناقصات مع <span className="gradient-text">ذكاء اصطناعي موثق بالمصادر</span>.
              </h1>
            ) : (
              <h1 className="reveal in mt-6 font-display text-5xl leading-[1.02] tracking-tight md:text-7xl" data-delay="1">
                Win more bids with <span className="gradient-text">AI that shows its sources</span>.
              </h1>
            )}

            <p className="reveal in mt-6 max-w-xl text-lg leading-relaxed text-muted md:text-xl" data-delay="2">
              {t("Hero Subtitle")}
            </p>
            <div className="reveal in mt-8 flex flex-wrap items-center gap-3" data-delay="3">
              <Link href="/sign-up" className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-white shadow-[0_14px_40px_-14px_var(--bravo-accent)] transition-transform hover:scale-[1.03] font-medium">{t("Get Started")} <ArrowRight size={16} className={cn("transition-transform group-hover:translate-x-0.5", isRtl && "rotate-180 group-hover:-translate-x-0.5")} /></Link>
              <Link href="#demo" className="inline-flex items-center gap-2 rounded-full border border-ink/30 px-6 py-3 hover:border-ink font-medium"><Play size={14} /> {t("Request Demo")}</Link>
              <Link href="/platform" className="inline-flex items-center gap-2 px-3 py-3 text-accent hover:underline font-medium">{t("Explore Platform")} <ArrowRight size={14} className={cn(isRtl && "rotate-180")} /></Link>
            </div>
            <div className="reveal in mt-10 grid grid-cols-3 gap-6 border-t border-line pt-6" data-delay="4">
              {[["25+", t("industry templates")], ["15", t("Go / No-Go criteria")], ["20", t("workspace tabs")]].map(([v, l]) => <div key={l}><p className="font-display text-3xl text-ink"><Counter to={parseInt(v)} suffix={v.endsWith("+") ? "+" : ""} /></p><p className="text-xs uppercase tracking-wider text-muted">{l}</p></div>)}
            </div>
            <div className="reveal in mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted" data-delay="5">
              <span className="flex items-center gap-2"><FileSearch size={15} className="text-accent" /> {t("Source-cited AI")}</span>
              <span className="flex items-center gap-2"><ShieldCheck size={15} className="text-accent" /> {t("Configurable compliance")}</span>
              <span className="flex items-center gap-2"><Scale size={15} className="text-accent" /> {t("Scored Go / No-Go")}</span>
              <span className="flex items-center gap-2"><Lock size={15} className="text-accent" /> {t("Locked, versioned pricing")}</span>
            </div>
          </div>

          {/* Product preview stack */}
          <div className="relative h-[560px]">
            <div className="floaty absolute left-0 rtl:left-auto rtl:right-0 top-4 w-[78%] rounded-xl border border-line bg-white/80 p-5 shadow-2xl backdrop-blur dark-card">
              <div className="flex items-center justify-between"><p className="eyebrow text-muted">{t("Tender workspace · RFP")}</p><span className="rounded-full bg-[#1c7c4a]/15 px-2 py-0.5 text-xs font-medium text-[#1c7c4a]">GO</span></div>
              <p className="mt-2 font-display text-xl">{lang === "ar" ? "مشروع ربط الطريق الدائري — التقاطعات والجسور" : "Ring Road Phase 3 — Interchanges"}</p>
              <p className="text-sm text-muted">{lang === "ar" ? "وزارة النقل والخدمات اللوجستية · بنية تحتية · 74.0M دولار · 65 يوماً" : "Ministry of Transport · Infrastructure · USD 74.0M · 65 days"}</p>
              <div className="mt-4 flex items-end gap-2"><span className="font-display text-5xl text-accent"><Counter to={82} /></span><span className="mb-2 text-sm text-muted">/100 {t("tender health")}</span></div>
              <div className="mt-3 space-y-2 text-sm">
                {health.map(([l, v], i) => <div key={l}><div className="flex justify-between text-xs text-muted"><span>{t(l, l)}</span><span>{v}%</span></div><div className="mt-1 h-1.5 w-full rounded-full bg-line"><div className="bar-grow h-1.5 rounded-full bg-accent" style={{ width: `${v}%`, animationDelay: `${0.3 + i * 0.08}s` }} /></div></div>)}
              </div>
            </div>
            <div className="floaty-2 absolute right-0 rtl:right-auto rtl:left-0 top-[58%] w-[60%] rounded-xl border border-line bg-white/85 p-4 shadow-2xl backdrop-blur dark-card">
              <div className="flex items-center gap-2 text-xs text-muted"><Bot size={13} className="text-accent" /> {t("Contract & commercial lead")}</div>
              {[
                [lang === "ar" ? "بند 11.3 خسائر تبعية غير محددة السقف" : "§11.3 Uncapped consequential loss", lang === "ar" ? "عالي" : "High"],
                [lang === "ar" ? "بند 14.2 غرامات تأخير بلا حد أقصى" : "§14.2 LDs — no cap", lang === "ar" ? "عالي" : "High"],
                [lang === "ar" ? "بند 18.4 تقديم الضمان خلال 7 أيام" : "§18.4 Bond in 7 days", lang === "ar" ? "متوسط" : "Medium"]
              ].map(([c, r], i) => <div key={c} className="reveal in mt-2 flex items-center justify-between rounded-lg border border-line px-3 py-2 text-xs" data-delay={String(i + 1)}><span className="truncate text-ink">{c}</span><span className={r === "High" || r === "عالي" ? "rounded-full bg-[#e5534b]/15 px-2 py-0.5 text-[#c2413a]" : "rounded-full bg-[#e3b23c]/20 px-2 py-0.5 text-[#9a7414]"}>{r}</span></div>)}
              <p className="mt-2 flex items-center gap-1 text-[11px] text-muted"><Sparkles size={11} className="text-accent" /> {t("3 drafts cited to GCC p.71–88 · awaiting human review")}</p>
            </div>
            <div className="floaty-3 absolute -left-2 rtl:-left-auto rtl:-right-2 top-[80%] w-[44%] rounded-xl border border-line bg-white/85 p-4 shadow-2xl backdrop-blur dark-card">
              <p className="eyebrow text-muted">{t("Go / No-Go")}</p>
              <div className="mt-2 flex gap-1">{[5, 4, 5, 4, 3, 4, 4, 3, 4, 3].map((n, i) => <span key={i} className="h-5 w-3 rounded-sm" style={{ background: n >= 4 ? "#1c7c4a" : "#e3b23c", opacity: 0.85 }} />)}</div>
              <p className="mt-2 flex items-center gap-1 text-xs text-ink"><CheckCircle2 size={13} className="text-[#1c7c4a]" /> {t("78/100 · GO · override logged")}</p>
            </div>
            <div className="absolute right-6 rtl:right-auto rtl:left-6 top-0 flex gap-1 rounded-full border border-line bg-white/70 p-1 text-[10px] backdrop-blur dark-card">
              {previewTabs.map((label, i) => <span key={label} className={`rounded-full px-2 py-0.5 transition-colors ${tab === i ? "bg-accent text-white" : "text-muted"}`}>{label}</span>)}
            </div>
          </div>
        </div>
      </div>
      {/* lifecycle ribbon */}
      <div className="relative border-y border-line bg-white/40 py-3 dark-card">
        <div className="flex w-max gap-10 whitespace-nowrap marquee">
          {[...lifecycle, ...lifecycle].map((l, i) => <span key={i} className="eyebrow flex items-center gap-3 text-ink/70"><span className="h-1.5 w-1.5 rounded-full bg-accent" />{t(l, l)}</span>)}
        </div>
      </div>
    </section>
  );
}
