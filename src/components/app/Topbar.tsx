"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock, Search, Bell, Filter, Cloud, CloudOff, LogOut } from "lucide-react";
import { apiEnabled, setSession, useRole } from "@/lib/api";
import { syncStatus } from "@/store/sync";
import { AppThemeToggle } from "@/components/marketing/Theme";
import { useStore, daysLeft, dueLabel } from "@/store/useStore";
import { allPagesFor } from "./nav";
import { useUI } from "./ui-state";
import { useIndustries } from "@/lib/useIndustries";
import { useI18n, LanguageToggle } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { tenders, activeTenderId, industryFilter, setIndustryFilter, notifications, markRead, org } = useStore();
  const { setPalette } = useUI();
  const { t, lang } = useI18n();
  const industries = useIndustries();
  const [bell, setBell] = useState(false); const [, tick] = useState(0);
  useEffect(() => { const l = () => tick((n) => n + 1); syncStatus.listeners.add(l); return () => { syncStatus.listeners.delete(l); }; }, []);
  const tender = tenders.find((t) => t.id === activeTenderId);
  const role = useRole(); const page = allPagesFor(activeTenderId, role).find((p) => p.href === pathname);
  const rawCrumb = page ? page.label : pathname.split("/").pop();
  const crumb = rawCrumb ? t(rawCrumb, rawCrumb) : "";
  const days = tender?.closing ? daysLeft(tender.closing) : null;
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-app-border bg-app-bg px-4 font-sans">
      <div className="flex min-w-0 items-center gap-2 text-xs">
        <button onClick={() => router.back()} className="p-1 text-app-dim hover:text-app-text"><ChevronLeft size={15} /></button>
        <button onClick={() => router.forward()} className="p-1 text-app-dim hover:text-app-text"><ChevronRight size={15} /></button>
        <span className="mx-2 truncate text-app-muted">{org.name}</span>
        {tender && <><ChevronRight size={12} className="text-app-dim rtl:rotate-180" /><Link href={`/app/tenders/${tender.id}`} className="truncate text-app-muted hover:text-app-text">{tender.name}</Link></>}
        <ChevronRight size={12} className="text-app-dim rtl:rotate-180" />
        <span className="truncate text-app-text font-medium">{crumb}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden items-center md:flex">
          <Filter size={12} className="pointer-events-none absolute left-2 rtl:left-auto rtl:right-2 text-app-muted" />
          <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} className="appearance-none rounded border border-app-border bg-app-panel py-1 pl-7 pr-6 rtl:pl-6 rtl:pr-7 text-xs text-app-text outline-none">
            <option value="all">{t("All Industries")}</option>
            {industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        {days !== null && <span className="flex items-center gap-1 text-xs text-app-muted" title={`Closing ${tender?.closing}`}><Clock size={12} />{dueLabel(tender!.closing)}</span>}
        <div className="relative">
          <button onClick={() => setBell(!bell)} className="relative rounded border border-app-border p-1.5 text-app-muted hover:text-app-text"><Bell size={13} />{unread > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-app-accent px-1 font-mono text-[9px] text-white">{unread}</span>}</button>
          {bell && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 z-40 mt-1 w-96 rounded border border-app-border-2 bg-app-panel shadow-2xl" onMouseLeave={() => setBell(false)}>
              <div className="flex items-center justify-between border-b border-app-border px-3 py-2"><span className="text-xs font-semibold text-app-text">{t("Notifications")}</span><button onClick={() => markRead()} className="text-[11px] text-app-accent">{t("Mark all read")}</button></div>
              <div className="app-scroll max-h-80 overflow-y-auto">
                {notifications.slice(0, 20).map((n) => <Link key={n.id} href={n.href} onClick={() => { markRead(n.id); setBell(false); }} className={cn("block border-b border-app-border px-3 py-2 hover:bg-app-panel-2", !n.read && "bg-app-accent/5")}><p className="font-mono text-[10px] uppercase tracking-wider text-app-accent">{n.kind}</p><p className="text-xs text-app-text">{n.text}</p><p className="text-[10px] text-app-dim">{new Date(n.at).toLocaleString()}</p></Link>)}
              </div>
            </div>
          )}
        </div>
        <LanguageToggle />
        <AppThemeToggle className="flex items-center gap-1 rounded border border-app-border px-1.5 py-1.5 text-xs text-app-muted hover:text-app-text" />
        <button onClick={() => setPalette(true)} title={t("Search")} className="rounded border border-app-border p-1.5 text-app-muted hover:text-app-text"><Search size={13} /></button>
        <span title={apiEnabled() ? (syncStatus.lastError ? `${t("Error")}: ${syncStatus.lastError}` : syncStatus.pending ? t("Saving…") : t("Saved")) : t("Local")} className={cn("flex items-center gap-1 text-[11px]", !apiEnabled() ? "text-app-dim" : syncStatus.lastError ? "text-app-red" : syncStatus.pending ? "text-app-yellow" : "text-app-green")}>{apiEnabled() ? <Cloud size={13} /> : <CloudOff size={13} />}<span className="hidden lg:inline">{!apiEnabled() ? t("Local") : syncStatus.lastError ? t("Error") : syncStatus.pending ? t("Saving…") : t("Saved")}</span></span>
        {role && <span title={role === "Bidder" ? "Bidder — you see only your own workspaces and documents" : `Signed in as ${role}`} className={cn("rounded border px-2 py-1 text-[11px] font-medium", role === "Super Admin" ? "border-app-accent/40 bg-app-accent/10 text-app-accent" : "border-app-border text-app-muted")}>{role}{!apiEnabled() ? " (Demo)" : ""}</span>}
        <button onClick={() => { setSession(null); router.push("/sign-in"); }} title={t("Sign out")} className="rounded border border-app-border p-1.5 text-app-muted hover:text-app-text"><LogOut size={13} /></button>
      </div>
    </header>
  );
}
