"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Pencil, Check, Trash2, ChevronDown, Eraser, Loader2, WifiOff } from "lucide-react";
import { Badge, Button, confidenceTone } from "@/components/ui";
import { useUI } from "./ui-state";
import { useScopedStore } from "@/store/useStore";
import { agents } from "@/store/seed";

export function ChatPanel() {
  const { agent } = useUI();
  const s = useScopedStore();
  const a = agents.find((x) => x.id === agent) || agents[0];
  const [text, setText] = useState("");
  const [queueOpen, setQueueOpen] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const msgs = s.chat.filter((m) => m.agent === a.id);
  const lastLen = msgs[msgs.length - 1]?.text.length ?? 0;
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length, lastLen]);
  const tender = s.tenders.find((x) => x.id === s.activeTenderId);
  const quick: Record<string, string[]> = {
    "tender-manager": ["Summarise where this bid stands and the next three actions", "What is blocking Go/No-Go?", "Which review stages are still open?"],
    clarifications: ["Draft two clarifications for the biggest gaps in the ITT", "Which requirements conflict with each other?", "Rewrite clarification 001 in the client's format"],
    contract: ["Which clauses are walk-away items and why?", "Propose a fallback position on liability", "Summarise payment and bond terms with sources"],
    risk: ["Which open risks should move to the deviation register?", "Recommend contingency per risk", "What did we learn on past bids that applies here?"],
    cost: ["Sanity-check the cost build-up for double-counted contingency", "Which cost lines lack a supplier quote?", "Explain the current price version"],
    deliverables: ["Which ITT deliverables are missing or unassigned?", "Build a submission checklist from the requirements", "What do we need for compliance evidence?"],
    engineering: ["Outline the methodology section from the scope", "Which technical requirements need verification?", "List standards referenced in the documents"],
  };
  const send = (msg: string) => { if (!msg.trim() || s.chatBusy) return; s.sendChat(a.id, msg.trim()); setText(""); };

  const queue = [
    ...s.clarifications.filter((c) => c.pending).map((c) => ({ id: c.id, kind: "Clarification", title: c.title, body: c.analysis, trust: c.confidence, accept: () => s.acceptClarification(c.id), reject: () => s.rejectClarification(c.id), href: "/app/clarifications/register" })),
    ...s.clauses.filter((c) => c.pending).map((c) => ({ id: c.id, kind: "Contract clause", title: `${c.ref} ${c.title}`, body: c.analysis, trust: c.confidence, accept: () => s.acceptClause(c.id), reject: () => s.rejectClause(c.id), href: "/app/contract/register" })),
    ...s.qualifications.filter((q) => q.pending).map((q) => ({ id: q.id, kind: "Qualification", title: q.text, body: q.rationale, trust: q.trust, accept: () => s.acceptQualification(q.id), reject: () => s.rejectQualification(q.id), href: "/app/contract/qualifications" })),
  ];

  return (
    <div className="flex h-full flex-col font-sans">
      <div className="flex items-center gap-3 border-b border-app-border px-6 py-3">
        <span className="text-2xl">{a.emoji}</span>
        <div className="flex-1"><p className="text-sm font-semibold text-app-text">{a.name}</p><p className="text-xs text-app-muted">{a.sub} · {tender?.name}</p></div>
        {msgs.length > 0 && <Button variant="outline" size="sm" onClick={() => s.clearChat(a.id)}><Eraser size={11} /> Clear</Button>}
      </div>
      <div className="app-scroll flex-1 overflow-y-auto px-6 py-4">
        <div className="mb-4 rounded border border-app-border bg-app-panel px-4 py-3">
          <p className="text-xs text-app-blue">Review the pending AI drafts in the Agent Hub</p>
          <p className="text-[11px] text-app-dim">Drafts only count once a human accepts them.</p>
        </div>
        <p className="mb-4 text-[13px] leading-relaxed text-app-text">
          I read the indexed ITT and drafted the items below. Everything is cited to a clause and stays visually distinct as <em>Draft</em> until you accept or edit it. Ask me to redraft, tighten a position, or explain a citation.
        </p>
        <button onClick={() => setQueueOpen(!queueOpen)} className="mb-2 flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-app-muted"><ChevronDown size={12} className={queueOpen ? "" : "-rotate-90"} /> Review queue · {queue.length}</button>
        {queueOpen && (
          <div className="space-y-3">
            {queue.length === 0 && <p className="text-xs text-app-dim">Queue is empty. Generate from any register to add drafts.</p>}
            {queue.map((q) => (
              <div key={q.id} className="rounded border border-app-border bg-app-panel p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5"><Badge tone="outline">{q.kind}</Badge><Badge tone="accent">Draft</Badge><Badge tone={confidenceTone(q.trust)}>● {q.trust} trust</Badge></div>
                  <div className="flex shrink-0 gap-1 text-app-muted">
                    <a href={q.href} className="p-1 hover:text-app-text" title="Edit in register"><Pencil size={13} /></a>
                    <button onClick={q.accept} className="p-1 hover:text-app-green" title="Accept"><Check size={13} /></button>
                    <button onClick={q.reject} className="p-1 hover:text-app-red" title="Reject"><Trash2 size={13} /></button>
                  </div>
                </div>
                <p className="mt-2 text-[13px] font-semibold text-app-text">{q.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-app-muted">{q.body}</p>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 space-y-3">
          {msgs.length === 0 && (
            <div className="rounded border border-dashed border-app-border p-4">
              <p className="text-xs text-app-muted">Ask {a.name} anything about this tender. Replies are grounded in the workspace data (documents, requirements, registers, pricing) and cite their sources.</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{(quick[a.id] || quick["tender-manager"]).map((q) => <button key={q} onClick={() => send(q)} className="rounded-sm border border-app-border-2 px-2 py-1 text-[11px] text-app-text hover:border-app-accent hover:text-app-accent">{q}</button>)}</div>
            </div>
          )}
          {msgs.map((m) => (
            <div key={m.id} className={m.role === "user" ? "ml-auto max-w-[80%] rounded bg-app-panel-2 px-3 py-2 text-[13px] text-app-text" : "max-w-[85%] rounded border border-app-border bg-app-panel px-3 py-2 text-[13px] text-app-text"}>
              {m.role === "assistant" && <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-app-dim"><span>{a.emoji} {a.name}</span>{m.simulated && <span className="flex items-center gap-1 text-app-yellow"><WifiOff size={10} /> offline</span>}{m.streaming && <Loader2 size={10} className="animate-spin text-app-accent" />}</div>}
              <Markdown text={m.text || (m.streaming ? "…" : "")} />
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="border-t border-app-border p-4">
        <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); (e.currentTarget.form as HTMLFormElement).requestSubmit(); } }} placeholder={`Ask ${a.name}...`} rows={2} className="w-full resize-none rounded border border-app-border bg-app-panel px-3 py-2 text-[13px] text-app-text outline-none placeholder:text-app-dim focus:border-app-border-2" />
        <div className="mt-2 flex items-center justify-between"><span className="text-[10px] text-app-dim">Enter to send · Shift+Enter for a new line · replies are drafts until a human accepts them</span><Button variant="primary" disabled={!text.trim() || s.chatBusy}>{s.chatBusy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Send</Button></div>
      </form>
    </div>
  );
}


/** Minimal markdown: **bold**, `code`, bullet lines, numbered lines, paragraphs. Enough for agent replies without a dependency. */
function Markdown({ text }: { text: string }) {
  const inline = (s: string) => s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => part.startsWith("**") ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong> : part.startsWith("`") ? <code key={i} className="rounded bg-app-bg px-1 font-mono text-[12px]">{part.slice(1, -1)}</code> : part);
  const lines = text.replace(/\\n/g, "\n").split("\n");
  return (
    <div className="space-y-1 leading-relaxed">
      {lines.map((l, i) => {
        if (/^\s*[-•*]\s+/.test(l)) return <div key={i} className="flex gap-2 pl-1"><span className="text-app-accent">•</span><span>{inline(l.replace(/^\s*[-•*]\s+/, ""))}</span></div>;
        if (/^\s*\d+[.)]\s+/.test(l)) return <div key={i} className="flex gap-2 pl-1"><span className="font-mono text-app-muted">{l.match(/^\s*(\d+)/)![1]}.</span><span>{inline(l.replace(/^\s*\d+[.)]\s+/, ""))}</span></div>;
        if (/^#{1,3}\s/.test(l)) return <p key={i} className="pt-1 font-semibold text-app-text">{inline(l.replace(/^#{1,3}\s/, ""))}</p>;
        if (!l.trim()) return <div key={i} className="h-1" />;
        return <p key={i}>{inline(l)}</p>;
      })}
    </div>
  );
}
