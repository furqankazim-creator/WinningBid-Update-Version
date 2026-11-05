"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUI } from "./ui-state";
import { ChatPanel } from "./ChatPanel";
import { apiEnabled, getSession, useRole } from "@/lib/api";
import { canAccess } from "./nav";
import { hydrate, start } from "@/store/sync";

// Client-only shell: guards the workspace behind a session, hydrates the store from the API (or seeds a new org),
// starts change-sync, and swaps the main content for the agent chat when the sidebar is in Chat mode.
export function AppShell({ children }: { children: React.ReactNode }) {
  const { mode } = useUI(); const router = useRouter(); const pathname = usePathname(); const role = useRole();
  const [state, setState] = useState<"boot" | "loading" | "ready" | "error">("boot"); const [msg, setMsg] = useState("");
  useEffect(() => {
    const sess = getSession();
    if (!sess) { router.replace("/sign-in"); return; }
    if (!apiEnabled()) { setState("ready"); return; }
    setState("loading");
    hydrate().then((r) => { setMsg(r === "seeded" ? "Workspace created with sample data" : ""); start(); setState("ready"); }).catch((e) => { setMsg(e instanceof Error ? e.message : "Could not load your workspace"); setState("error"); });
  }, [router]);
  const blocked = state === "ready" && apiEnabled() && !!role && !canAccess(role, pathname);
  useEffect(() => { if (blocked) router.replace("/app"); }, [blocked, router]);
  if (blocked) return <main className="flex flex-1 items-center justify-center bg-app-bg font-sans text-xs text-app-muted">Your role ({role}) does not have access to this page.</main>;
  if (state === "boot" || state === "loading") return <main className="flex flex-1 items-center justify-center bg-app-bg font-sans text-xs text-app-muted"><Loader2 size={14} className="mr-2 animate-spin text-app-accent" />{state === "loading" ? "Loading your organisation…" : ""}</main>;
  if (state === "error") return <main className="flex flex-1 flex-col items-center justify-center gap-3 bg-app-bg font-sans text-sm text-app-text"><p>{msg}</p><button onClick={() => location.reload()} className="rounded bg-app-accent px-3 py-1.5 text-xs text-white">Retry</button></main>;
  return <main className="app-scroll flex-1 overflow-y-auto print:overflow-visible print:h-auto bg-app-bg">{mode === "chat" ? <ChatPanel /> : <div className="fade-up mx-auto max-w-[1400px] px-6 py-6">{msg && <p className="mb-3 rounded border border-app-green/30 bg-app-green/10 px-3 py-2 font-sans text-xs text-app-green">{msg}</p>}{children}</div>}</main>;
}
