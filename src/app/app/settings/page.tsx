"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, KeyRound, LogOut, SlidersHorizontal, User } from "lucide-react";
import { Badge, Button, Card, Field, Input, Label, PageHeader, Select } from "@/components/ui";
import { AppThemeToggle } from "@/components/marketing/Theme";
import { LanguageToggle } from "@/lib/i18n";
import { useStore } from "@/store/useStore";
import { api, apiEnabled, authApi, getSession, isAdminRole, setSession, useRole } from "@/lib/api";
import { cn } from "@/lib/cn";

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "SAR", "AED", "NOK"];
const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
const when = (d?: string) => (d ? new Date(d).toLocaleString() : "—");

/** One settings page for every role: personal sections for all users, organisation settings only for administrators. */
export default function SettingsPage() {
  const role = useRole(); const router = useRouter(); const s = useStore();
  const sess = getSession(); const me = sess?.user; const live = apiEnabled();
  const admin = !live || isAdminRole(role);
  const tabs = [{ id: "profile", label: "Profile", icon: User }, ...(live ? [{ id: "security", label: "Security", icon: KeyRound }] : []), { id: "preferences", label: "Preferences", icon: SlidersHorizontal }, ...(admin ? [{ id: "organisation", label: "Organisation", icon: Building2 }] : [])];
  const [tab, setTab] = useState("profile");

  const [form, setForm] = useState({ name: me?.name || s.profile.name, company: me?.company || "", title: me?.title || "", phone: me?.phone || "" });
  const [msg, setMsg] = useState<{ tab: string; ok: boolean; text: string } | null>(null);
  const flash = (t: string, ok: boolean, text: string) => { setMsg({ tab: t, ok, text }); setTimeout(() => setMsg(null), 3500); };
  const say = (t: string) => msg?.tab === t && <span className={cn("text-xs", msg.ok ? "text-app-green" : "text-app-red")}>{msg.text}</span>;
  const errText = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");

  const saveProfile = async () => {
    if (!form.name.trim()) return flash("profile", false, "Name is required");
    try {
      if (live) { const r = await authApi.updateProfile(form); const cur = getSession(); if (cur) setSession({ ...cur, user: { ...cur.user, ...r.user } }); }
      s.updateProfile({ name: form.name }); useStore.setState({ currentUser: form.name });
      flash("profile", true, "Profile saved");
    } catch (e) { flash("profile", false, errText(e)); }
  };

  const [em, setEm] = useState({ email: me?.email || s.profile.email, password: "" });
  const saveEmail = async () => {
    try { const r = await authApi.changeEmail(em.email, em.password); const cur = getSession(); if (cur) setSession({ ...cur, user: { ...cur.user, ...r.user } }); s.updateProfile({ email: r.user.email }); setEm({ email: r.user.email, password: "" }); flash("security", true, "Sign-in email updated"); } catch (e) { flash("security", false, errText(e)); }
  };
  const [pw, setPw] = useState({ current: "", next: "", again: "" });
  const savePw = async () => {
    if (pw.next !== pw.again) return flash("security", false, "New passwords do not match");
    try { await authApi.changePassword(pw.current, pw.next); setPw({ current: "", next: "", again: "" }); flash("security", true, "Password changed"); } catch (e) { flash("security", false, errText(e)); }
  };

  const [orgForm, setOrgForm] = useState({ name: s.org.name, currency: s.org.currency });
  const saveOrg = async () => {
    if (!orgForm.name.trim()) return flash("organisation", false, "Organisation name is required");
    try {
      if (live) await api("/api/org", { method: "PATCH", json: orgForm });
      useStore.setState({ org: { ...s.org, ...orgForm } }); flash("organisation", true, "Organisation saved");
    } catch (e) { flash("organisation", false, errText(e)); }
  };

  const profileProgress = Math.round([form.name, form.company, form.title, form.phone].filter(Boolean).length / 4 * 100);
  const signOut = () => { setSession(null); router.push("/sign-in"); };
  const isBidder = role === "Bidder";

  return (
    <div className="font-sans">
      <PageHeader title="Settings" sub={live ? `${me?.email} · ${role}${s.org.name ? ` · ${s.org.name}` : ""}` : "Demo mode — changes stay in this browser"} />
      <div className="flex flex-col gap-6 md:flex-row">
        <nav className="flex shrink-0 gap-1 md:w-48 md:flex-col">{tabs.map((t) => <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex items-center gap-2 rounded px-3 py-2 text-left text-[13px]", tab === t.id ? "bg-app-panel-2 font-medium text-app-accent" : "text-app-text hover:bg-app-panel")}><t.icon size={14} />{t.label}</button>)}
          <button onClick={signOut} className="flex items-center gap-2 rounded px-3 py-2 text-left text-[13px] text-app-red hover:bg-app-panel md:mt-4"><LogOut size={14} />Sign out</button></nav>

        <div className="min-w-0 max-w-2xl flex-1 space-y-4">
          {tab === "profile" && <>
            <Card className="flex items-center gap-4 p-5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-app-accent bg-app-accent/10 font-display text-xl text-app-accent">{initials(form.name)}</span>
              <div className="min-w-0"><p className="truncate font-display text-lg text-app-text">{form.name || "—"}</p><p className="truncate text-xs text-app-muted">{me?.email || s.profile.email}</p><div className="mt-1 flex flex-wrap gap-1.5">{role && <Badge tone="accent">{role}</Badge>}{live && <Badge tone="outline">{s.org.name}</Badge>}</div></div>
            </Card>
            <Card className="space-y-4 p-5">
              <Label>Personal details</Label>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name"><Input className="w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                <Field label="Job title"><Input className="w-full" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Bid Manager" /></Field>
                <Field label="Company"><Input className="w-full" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
                <Field label="Phone"><Input className="w-full" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+966 …" /></Field>
              </div>
              <div className="rounded border border-app-border bg-app-panel/50 p-3">
                <div className="mb-2 flex items-center justify-between text-[11px] text-app-muted"><span>Profile completion</span><span>{profileProgress}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-app-border"><div className="h-full rounded-full bg-app-accent transition-all" style={{ width: `${profileProgress}%` }} /></div>
              </div>
              <div className="flex items-center gap-3"><Button variant="primary" onClick={saveProfile}>Save profile</Button>{say("profile")}</div>
            </Card>
            {live && <Card className="grid gap-3 p-5 text-[13px] sm:grid-cols-2"><div><Label>Role</Label><p className="mt-1 text-app-text">{role}</p><p className="text-[11px] text-app-dim">{isBidder ? "Set by your administrator. You can see only your own workspaces and documents." : "Set by the Super Admin."}</p></div><div><Label>Account</Label><p className="mt-1 text-app-text">Member since {me?.createdAt ? new Date(me.createdAt).toLocaleDateString() : "—"}</p><p className="text-[11px] text-app-dim">Last sign-in {when(me?.lastLoginAt)}</p></div></Card>}
            {isBidder && <Card className="p-5 text-[13px]"><Label>My data</Label><p className="mt-1 text-app-text">{s.tenders.length} workspace{s.tenders.length === 1 ? "" : "s"} · {s.docs.length} document{s.docs.length === 1 ? "" : "s"}</p><p className="text-[11px] text-app-dim">Saved to your account on the server; visible only to you and your administrators.</p></Card>}
          </>}

          {tab === "security" && <>
            <Card className="space-y-4 p-5">
              <Label>Sign-in email</Label>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Email"><Input type="email" className="w-full" value={em.email} onChange={(e) => setEm({ ...em, email: e.target.value })} /></Field><Field label="Current password (to confirm)"><Input type="password" className="w-full" value={em.password} onChange={(e) => setEm({ ...em, password: e.target.value })} /></Field></div>
              <div className="flex items-center gap-3"><Button variant="primary" onClick={saveEmail} disabled={!em.password || em.email === me?.email}>Update email</Button></div>
            </Card>
            <Card className="space-y-4 p-5">
              <Label>Change password</Label>
              <div className="grid gap-4 sm:grid-cols-3"><Field label="Current"><Input type="password" className="w-full" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field><Field label="New (min 8)"><Input type="password" className="w-full" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field><Field label="Repeat new"><Input type="password" className="w-full" value={pw.again} onChange={(e) => setPw({ ...pw, again: e.target.value })} /></Field></div>
              <div className="flex items-center gap-3"><Button variant="primary" onClick={savePw} disabled={!pw.current || pw.next.length < 8}>Change password</Button>{say("security")}</div>
            </Card>
          </>}

          {tab === "preferences" && <Card className="space-y-5 p-5">
            <div><Label className="mb-1">Appearance</Label><AppThemeToggle className="flex items-center gap-2 rounded-sm border border-app-border-2 px-3 py-1.5 font-sans text-[13px] text-app-text" /></div>
            <div><Label className="mb-1">Language</Label><LanguageToggle /></div>
            <Field label="Default AI model"><Select className="w-full max-w-xs" value={s.profile.model} onChange={(e) => s.updateProfile({ model: e.target.value as "Lite" | "Max" })}><option value="Lite">Lite — faster</option><option value="Max">Max — more thorough</option></Select></Field>
            {!live && <div className="border-t border-app-border pt-4"><Button variant="danger" onClick={() => { if (confirm("Reset all demo data to seed state?")) s.reset(); }}>Reset demo data</Button></div>}
          </Card>}

          {tab === "organisation" && <Card className="space-y-4 p-5">
            <Label>Organisation</Label>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Name"><Input className="w-full" value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} /></Field><Field label="Base currency"><Select className="w-full" value={orgForm.currency} onChange={(e) => setOrgForm({ ...orgForm, currency: e.target.value })}>{[...new Set([orgForm.currency, ...CURRENCIES])].map((c) => <option key={c}>{c}</option>)}</Select></Field></div>
            <p className="text-[11px] text-app-dim">Plan: {s.org.plan}. Manage people under Administration → Users &amp; Roles{role === "Super Admin" ? ", or all organisations in the Platform Console" : ""}.</p>
            <div className="flex items-center gap-3"><Button variant="primary" onClick={saveOrg}>Save organisation</Button>{say("organisation")}</div>
          </Card>}
        </div>
      </div>
    </div>
  );
}
