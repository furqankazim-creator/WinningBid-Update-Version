"use client";
/**
 * Server sync for the zustand store.
 *  - hydrate(): pull the org snapshot (or seed a brand-new org with the demo dataset), users and audit trail.
 *  - start(): subscribe to the store; when a synced collection's array reference changes, debounce and PUT the
 *    whole collection to /api/data/:collection/sync (last-write-wins per collection). Settings go to /settings.
 */
import { api, apiEnabled, getSession, setSession, authApi } from "@/lib/api";
import { useStore } from "./useStore";

export const SYNCED = ["tenders", "actions", "projects", "vendors", "docs", "clarifications", "clauses", "qualifications", "risks", "deliverables", "costLines", "milestones", "lessons", "companies", "contacts", "opportunities", "activities", "requirements", "complianceItems", "capabilities", "aiSummaries", "reviews", "approvals", "priceVersions", "proposalSections", "bidResults", "inquiries", "contracts", "aiLog", "notifications", "customIndustries", "procPackages", "quotations", "submissions", "chat"] as const;
type Synced = (typeof SYNCED)[number];
const SETTINGS = ["margin", "profile", "lastExtraction"] as const;

let started = false; let hydrated = false; const last: Partial<Record<string, unknown>> = {}; const timers: Partial<Record<string, ReturnType<typeof setTimeout>>> = {};
export const syncStatus = { pending: 0, lastError: "" as string, listeners: new Set<() => void>() };
const emit = () => syncStatus.listeners.forEach((l) => l());

export async function hydrate(): Promise<"seeded" | "loaded"> {
  let sess = getSession(); if (!apiEnabled() || !sess) return "loaded";
  try { const me = await authApi.me(); sess = { ...sess, user: me.user, org: me.org }; setSession(sess); } catch (e) { if (e instanceof Error && /account_disabled|invalid_token|unauthenticated/.test(e.message)) { setSession(null); location.href = "/sign-in?expired=1"; } }
  const [snap, orgInfo] = await Promise.all([
    api<{ collections: Record<string, unknown[]>; settings: Record<string, unknown> }>("/api/data/state"),
    api<{ org: { name: string; plan: string; currency: string; industries: string[]; seeded: boolean }; users: { id: string; name: string; email: string; role: string; active: boolean }[] }>("/api/org"),
  ]);
  const st = useStore.getState();
  const patch: Record<string, unknown> = { currentUser: sess.user.name, org: { id: sess.org.id, name: orgInfo.org.name, industries: orgInfo.org.industries, plan: orgInfo.org.plan, currency: orgInfo.org.currency }, users: orgInfo.users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, active: u.active })), profile: { ...st.profile, name: sess.user.name, email: sess.user.email } };
  const empty = SYNCED.every((c) => !(snap.collections[c] || []).length);
  let result: "seeded" | "loaded" = "loaded";
  if (empty) {
    // Empty organisation: push the demo dataset so every page has content, then mark the org seeded.
    for (const c of SYNCED) { const docs = (st as unknown as Record<string, unknown[]>)[c] || []; if (docs.length) await api(`/api/data/${c}/sync`, { method: "PUT", json: { docs, full: true } }); last[c] = docs; }
    await api("/api/data/settings", { method: "PUT", json: { margin: st.margin, profile: patch.profile, lastExtraction: st.lastExtraction } });
    await api("/api/org", { method: "PATCH", json: { seeded: true } });
    result = "seeded";
  } else {
    for (const c of SYNCED) { patch[c] = snap.collections[c] || []; last[c] = patch[c]; }
    for (const k of SETTINGS) if (snap.settings[k] !== undefined) patch[k] = k === "profile" ? { ...(snap.settings.profile as object), name: sess.user.name, email: sess.user.email } : snap.settings[k];
    const tenders = patch.tenders as { id: string }[]; if (!tenders.some((t) => t.id === st.activeTenderId)) patch.activeTenderId = tenders[0]?.id || "";
  }
  try { const audit = await api<{ id: string; at: string; user: string; action: string; entity: string; entityId: string; detail: string }[]>("/api/org/audit"); if (audit.length) patch.auditLog = audit; } catch {}
  useStore.setState(patch as never);
  for (const k of SETTINGS) last[k] = (useStore.getState() as unknown as Record<string, unknown>)[k];
  hydrated = true; return result;
}

export function start() {
  if (started || !apiEnabled()) return; started = true;
  useStore.subscribe((s) => {
    if (!hydrated || !getSession()) return;
    const state = s as unknown as Record<string, unknown>;
    for (const c of SYNCED) if (state[c] !== last[c]) { last[c] = state[c]; schedule(c, () => api(`/api/data/${c}/sync`, { method: "PUT", json: { docs: state[c], full: true } })); }
    if (SETTINGS.some((k) => state[k] !== last[k])) { SETTINGS.forEach((k) => (last[k] = state[k])); schedule("settings", () => api("/api/data/settings", { method: "PUT", json: Object.fromEntries(SETTINGS.map((k) => [k, useStore.getState()[k as keyof typeof s]])) })); }
  });
}

function schedule(key: string, fn: () => Promise<unknown>) {
  if (timers[key]) clearTimeout(timers[key]); else { syncStatus.pending++; emit(); }
  timers[key] = setTimeout(async () => { delete timers[key]; try { await fn(); syncStatus.lastError = ""; } catch (e) { syncStatus.lastError = e instanceof Error ? e.message : "sync failed"; } finally { syncStatus.pending = Math.max(0, syncStatus.pending - 1); emit(); } }, 800);
}

/** Append an immutable audit entry server-side (local store keeps its own copy for display). */
export function pushAudit(e: { action: string; entity: string; entityId: string; detail: string }) { if (apiEnabled() && getSession()) api("/api/org/audit", { method: "POST", json: e }).catch(() => {}); }
