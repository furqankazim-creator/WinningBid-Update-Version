"use client";
import { useState } from "react";
import { ArrowLeft, User, SlidersHorizontal, Sparkles, GraduationCap, Bot, CreditCard } from "lucide-react";
import { Button, Input, Field, Select, Label } from "@/components/ui";
import { useUI } from "./ui-state";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/cn";
import { brand } from "@/config/brand";
import { apiEnabled, authApi, setSession } from "@/lib/api";
import { useRouter } from "next/navigation";
import { AppThemeToggle } from "@/components/marketing/Theme";

const tabs = [
  { id: "profile", label: "Profile", icon: User }, { id: "preferences", label: "Preferences", icon: SlidersHorizontal }, { id: "skills", label: "Skills", icon: Sparkles },
  { id: "rules", label: "Learned rules", icon: GraduationCap }, { id: "assistant", label: "Assistant", icon: Bot }, { id: "billing", label: "Billing", icon: CreditCard },
];

export function SettingsModal() {
  const { settings, setSettings } = useUI();
  const { profile, updateProfile, reset } = useStore();
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false); const router = useRouter();
  const [pw, setPw] = useState({ current: "", next: "" }); const [pwMsg, setPwMsg] = useState("");
  if (!settings) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-[8vh] font-sans" onClick={() => setSettings(false)}>
      <div className="fade-up flex h-[520px] w-full max-w-3xl overflow-hidden rounded border border-app-border-2 bg-app-panel shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-44 shrink-0 border-r border-app-border bg-app-bg p-3">
          <button onClick={() => setSettings(false)} className="mb-4 flex items-center gap-2 px-2 text-xs text-app-text"><ArrowLeft size={13} /> Back</button>
          <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-app-dim">Settings</p>
          {tabs.map((t) => <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[13px]", tab === t.id ? "text-app-accent" : "text-app-text hover:bg-app-panel")}><t.icon size={14} />{t.label}</button>)}
        </div>
        <div className="app-scroll flex-1 overflow-y-auto p-7">
          {tab === "profile" && (
            <>
              <h2 className="font-display text-2xl text-app-text">Profile</h2>
              <p className="mb-6 mt-1 text-xs text-app-muted">Manage your personal information.</p>
              <div className="max-w-md space-y-4">
                <Field label="Display name"><Input className="w-full py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                <Field label="Email"><Input className="w-full py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                <Button variant="primary" onClick={() => { updateProfile(form); setSaved(true); setTimeout(() => setSaved(false), 1500); }}>{saved ? "Saved" : "Save changes"}</Button>
                {apiEnabled() && <div className="border-t border-app-border pt-4">
                  <Label className="mb-2">Change password</Label>
                  <div className="grid grid-cols-2 gap-2"><Input type="password" placeholder="Current" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /><Input type="password" placeholder="New (min 8)" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></div>
                  <div className="mt-2 flex items-center gap-3"><Button variant="outline" onClick={async () => { try { await authApi.changePassword(pw.current, pw.next); setPwMsg("Password changed"); setPw({ current: "", next: "" }); } catch (e) { setPwMsg(e instanceof Error ? e.message : "failed"); } }}>Update password</Button><span className="text-xs text-app-muted">{pwMsg}</span></div>
                </div>}
                <div className="border-t border-app-border pt-4"><Button variant="danger" onClick={() => { setSession(null); setSettings(false); router.push("/sign-in"); }}>Sign out</Button></div>
              </div>
            </>
          )}
          {tab === "preferences" && (
            <>
              <h2 className="font-display text-2xl text-app-text">Preferences</h2>
              <p className="mb-6 mt-1 text-xs text-app-muted">Defaults for this workspace.</p>
              <div className="max-w-md space-y-4">
                <Field label="Default model"><Select className="w-full" value={profile.model} onChange={(e) => updateProfile({ model: e.target.value as "Lite" | "Max" })}><option>Lite</option><option>Max</option></Select></Field>
                <div><Label className="mb-1">Workspace appearance</Label><AppThemeToggle className="flex items-center gap-2 rounded-sm border border-app-border-2 px-3 py-1.5 font-sans text-[13px] text-app-text" /></div>
                <Field label="Currency"><Select className="w-full" defaultValue="CAD"><option>CAD</option><option>USD</option><option>EUR</option><option>NOK</option></Select></Field>
                <div className="pt-4"><Button variant="danger" onClick={() => { if (confirm("Reset all demo data to seed state?")) reset(); }}>Reset demo data</Button></div>
              </div>
            </>
          )}
          {tab === "skills" && <Info title="Skills" body={`Skills are reusable instructions the ${brand.company} agents follow when drafting. Add house style, clarification templates and pricing conventions here.`} items={["Clarification log — client format (Crescent Power)", "Risk register — 5×5 with pre/post mitigation", "Deviation register — commercial position sheet"]} />}
          {tab === "rules" && <Info title="Learned rules" body="Rules the assistant has learned from your edits and accepted drafts. Review or remove them at any time." items={["Always cite ITT section for each clarification", "Cap LDs at 10% as default position", "Use CAD unless the ITT states otherwise"]} />}
          {tab === "assistant" && <Info title="Assistant" body="Control how much the assistant does on its own." items={["Suggest next actions on the Action Board — on", "Auto-draft clarifications after document upload — off", "Show AI trust score on registers — on"]} />}
          {tab === "billing" && (
            <>
              <h2 className="font-display text-2xl text-app-text">Billing</h2>
              <p className="mb-6 mt-1 text-xs text-app-muted">Team plan · trial</p>
              <div className="max-w-md space-y-3 rounded border border-app-border bg-app-bg p-4 text-[13px] text-app-text">
                <div className="flex justify-between"><span>Plan</span><span>Team — $499/month</span></div>
                <div className="flex justify-between"><span>Trial ends</span><span>in 3 days</span></div>
                <div className="flex justify-between"><span>AI credits used</span><span>412 / 5,000</span></div>
                <div className="flex gap-2 pt-2"><Button variant="outline">Change plan</Button><Button variant="danger">Cancel subscription</Button></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ title, body, items }: { title: string; body: string; items: string[] }) {
  return (
    <>
      <h2 className="font-display text-2xl text-app-text">{title}</h2>
      <p className="mb-6 mt-1 text-xs text-app-muted">{body}</p>
      <ul className="max-w-md divide-y divide-app-border rounded border border-app-border">{items.map((i) => <li key={i} className="px-3 py-2.5 text-[13px] text-app-text">{i}</li>)}</ul>
    </>
  );
}
