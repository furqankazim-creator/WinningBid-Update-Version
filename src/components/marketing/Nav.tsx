"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { ThemeControls } from "./Theme";
import { useI18n, MarketingLanguageToggle } from "@/lib/i18n";

const links = [
  { href: "/platform", key: "Platform" },
  { href: "/industries", key: "Industries" },
  { href: "/crm", key: "CRM" },
  { href: "/pricing", key: "Pricing" },
  { href: "/what-we-do", key: "About" },
];

export function Nav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [depth, setDepth] = useState(0);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // "Depth" counter: scroll progress mapped to metres, matching the ocean-descent theme.
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? window.scrollY / max : 0;
      setDepth(Math.round(pct * 2850));
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("sticky top-0 z-50 border-b transition-colors", scrolled ? "bg-cream/95 backdrop-blur border-line" : "bg-cream border-transparent")}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <span className="eyebrow hidden text-muted md:inline tabular-nums" title="scroll progress">{Math.round(depth / 28.5)}%</span>
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center border border-ink font-display text-lg text-ink">{brand.logoLetter}</span>
            <span className="eyebrow text-ink">{brand.company.toUpperCase()}</span>
          </Link>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={cn("text-[15px] text-ink/80 hover:text-ink font-medium", pathname.startsWith(l.href) && "text-accent")}>
              {t(l.key)}
            </Link>
          ))}
          <Link href="/sign-in" className="text-[15px] text-ink/80 hover:text-ink font-medium">{t("Login")}</Link>
          <MarketingLanguageToggle />
          <ThemeControls />
          <Link href="/sign-up" className="rounded-full bg-accent px-4 py-2 text-sm text-white shadow-[0_8px_24px_-10px_var(--bravo-accent)] transition-transform hover:scale-[1.03] font-medium">{t("Get Started")}</Link>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <MarketingLanguageToggle />
          <ThemeControls compact />
          <button onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && (
        <div className="border-t border-line bg-cream px-4 py-4 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2 text-ink font-medium">{t(l.key)}</Link>
          ))}
          <Link href="/sign-in" onClick={() => setOpen(false)} className="block py-2 text-ink font-medium">{t("Login")}</Link>
          <Link href="/sign-up" onClick={() => setOpen(false)} className="block py-2 text-accent font-semibold">{t("Get Started")}</Link>
        </div>
      )}
    </header>
  );
}
