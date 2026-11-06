"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { brand } from "@/config/brand";
import { apiEnabled, authApi, setSession, ApiError } from "@/lib/api";

export function AuthCard({ mode }: { mode: "sign-in" | "sign-up" }) { return <Suspense><AuthCardInner mode={mode} /></Suspense>; }

function AuthCardInner({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter(); const params = useSearchParams();
  const inviteToken = params.get("invite") || ""; const expired = params.get("expired");
  const [form, setForm] = useState({ name: "", email: "", password: "", organisation: "" });
  const [invite, setInvite] = useState<{ email: string; role: string; organisation: string } | null>(null);
  const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  useEffect(() => { if (inviteToken && apiEnabled()) authApi.invite(inviteToken).then((i) => { setInvite(i); setForm((f) => ({ ...f, email: i.email })); }).catch((e) => setErr(e.message)); }, [inviteToken]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setBusy(true);
    try {
      if (!apiEnabled()) { // demo mode — no backend configured
        localStorage.setItem("vq.session", JSON.stringify({ token: "", user: { id: "demo", name: form.name || form.email.split("@")[0], email: form.email, role: "Super Admin", orgId: "demo" }, org: { id: "demo", name: "Demo organisation", plan: "Team", currency: "USD", industries: [], seeded: true } }));
        router.push("/app"); return;
      }
      const s = mode === "sign-in" ? await authApi.login(form.email, form.password) : await authApi.signup({ name: form.name, email: form.email, password: form.password, organisation: inviteToken ? undefined : form.organisation, invite: inviteToken || undefined });
      setSession(s); router.push("/app");
    } catch (e) { setErr(e instanceof ApiError ? e.message : "Could not reach the API server"); } finally { setBusy(false); }
  };
  const field = "w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ink dark-card";
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md border border-line bg-white/60 p-8 dark-card">
        <Link href="/" className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center border border-ink font-display text-lg">{brand.logoLetter}</span><span className="eyebrow">{brand.company.toUpperCase()}</span></Link>
        <h1 className="mt-8 font-display text-3xl">{mode === "sign-in" ? "Welcome back." : invite ? `Join ${invite.organisation}` : "Create your organisation."}</h1>
        <p className="mt-2 text-sm text-muted">{mode === "sign-in" ? `Sign in to your ${brand.company} workspace.` : invite ? `You were invited as ${invite.role}.` : "Your organisation is created and you can invite your team. 3-day trial, no charge until it ends."}</p>
        {expired && <p className="mt-3 text-xs text-accent">Your session expired — please sign in again.</p>}
        {!apiEnabled() && process.env.NODE_ENV !== "production" && <p className="mt-3 rounded border border-line px-3 py-2 text-xs text-muted">Demo mode: no API configured (NEXT_PUBLIC_API_URL). Any email/password opens the sample workspace stored in this browser.</p>}
        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "sign-up" && <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className={field} />}
          {mode === "sign-up" && !inviteToken && <input required value={form.organisation} onChange={(e) => setForm({ ...form, organisation: e.target.value })} placeholder="Organisation name" className={field} />}
          <input required type="email" value={form.email} readOnly={!!invite} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Work email" className={field} />
          <input required type="password" minLength={mode === "sign-up" ? 8 : 1} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={mode === "sign-up" ? "Password (min 8 characters)" : "Password"} className={field} />
          {err && <p className="text-sm text-[#c2413a]">{err}</p>}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-sm bg-navy py-2.5 text-sm text-cream hover:bg-ink disabled:opacity-60">{busy && <Loader2 size={14} className="animate-spin" />}{mode === "sign-in" ? "Sign in" : invite ? "Accept invite & create account" : "Create organisation"}</button>
        </form>
        <p className="mt-6 text-sm text-muted">{mode === "sign-in" ? <>No account? <Link href="/sign-up" className="text-accent underline">Start free</Link></> : <>Already have an account? <Link href="/sign-in" className="text-accent underline">Sign in</Link></>}</p>
      </div>
    </div>
  );
}
