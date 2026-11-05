"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Pencil, Plus, Bot, Play, CheckCircle2, Circle, Settings2, ArrowRight, MessageSquare, ShieldAlert, AlertTriangle, ScrollText, BarChart3, FileCheck, Trash2 } from "lucide-react";
import { Button, Card, Badge, Modal, Field, Input, Select, SectionTitle } from "@/components/ui";
import { useScopedStore } from "@/store/useStore";
import type { ActionStatus } from "@/store/types";
import { agents } from "@/store/seed";
import { cn } from "@/lib/cn";

const columns: { id: ActionStatus; label: string; color: string; bg: string }[] = [
  { id: "backlog", label: "Backlog", color: "text-app-text", bg: "col-tint-backlog" },
  { id: "ready", label: "Ready", color: "text-app-yellow", bg: "col-tint-ready" },
  { id: "in_progress", label: "In progress", color: "text-app-accent", bg: "col-tint-progress" },
  { id: "waiting", label: "Waiting for review", color: "text-app-purple", bg: "col-tint-waiting" },
  { id: "complete", label: "Complete", color: "text-app-green", bg: "col-tint-complete" },
];

const quickActions = [
  { icon: MessageSquare, title: "Write Clarifications", body: "Draft technical and commercial questions to send to the client.", href: "/app/clarifications/register" },
  { icon: ShieldAlert, title: "Analyse Contract", body: "Identify risk clauses, deviations, and redline opportunities.", href: "/app/contract/register" },
  { icon: AlertTriangle, title: "Risks & Opportunities", body: "Build the risk register with probability × impact scoring.", href: "/app/risks/register" },
  { icon: ScrollText, title: "Qualifications & Deviations", body: "Draft your deviation register against the ITT requirements.", href: "/app/contract/qualifications" },
  { icon: BarChart3, title: "Cost Breakdown", body: "Structure direct costs, subcontractors, and contingency.", href: "/app/pricing/build-up" },
  { icon: FileCheck, title: "Deliverables Checklist", body: "Track every submission item required by the ITT.", href: "/app/deliverables" },
];

export default function HomePage() {
  const { tenders, activeTenderId, actions, addAction, moveAction, deleteAction, docs, updateTender } = useScopedStore();
  const tender = tenders.find((t) => t.id === activeTenderId);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [form, setForm] = useState({ title: "", agent: agents[0].name });
  const [drag, setDrag] = useState<string | null>(null);
  const [editProfile, setEditProfile] = useState(false);

  if (!tender) return <Card className="p-10 text-center text-sm text-app-muted">No tender selected. Press <kbd className="rounded border border-app-border px-1 font-mono text-[10px]">Ctrl K</kbd> to create one.</Card>;

  const detailsDone = Object.keys(tender.metadata).length > 0;
  const steps = [
    { title: "Create a Tender", body: "Name your tender to open a new workspace.", done: true },
    { title: "Upload tender documents", body: "Add the ITT, contract conditions, technical specs, and annexes.", done: docs.length > 0, href: "/app/documents" },
    { title: "Fill in Tender details", body: "Scope type, key dates, consortium split, and client info.", done: detailsDone, href: "/app/setup" },
  ];

  return (
    <div className="font-sans">
      {/* Tender profile strip */}
      <Card className="mb-6 flex items-center justify-between px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setProfileOpen(!profileOpen)} className="text-app-muted"><ChevronRight size={14} className={cn("transition-transform", profileOpen && "rotate-90")} /></button>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-app-muted">Tender profile</span>
          <Badge>{tender.scope}</Badge><Badge>{tender.clientTerm}</Badge><Badge>{tender.bidder}</Badge>
        </div>
        <button onClick={() => setEditProfile(true)} className="flex items-center gap-1 text-xs text-app-muted hover:text-app-text"><Pencil size={12} /> Edit</button>
      </Card>
      {profileOpen && <Card className="-mt-4 mb-6 px-4 py-3 text-xs text-app-muted"><span className="text-app-text">{tender.client}</span> · {tender.description}</Card>}

      {/* Action board */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="font-display text-2xl text-app-text">Action Board</h1><p className="mt-1 text-[13px] text-app-muted">Plan work, assign specialist bots, and review their output before it enters the tender.</p></div>
        <Button variant="primary" onClick={() => setOpen(true)}><Plus size={14} /> New action</Button>
      </div>
      <div className="grid gap-3 lg:grid-cols-5 md:grid-cols-3">
        {columns.map((col) => {
          const items = actions.filter((a) => a.status === col.id);
          return (
            <div key={col.id} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag) moveAction(drag, col.id); setDrag(null); }} className={cn("min-h-[330px] rounded border border-app-border p-3", col.bg)}>
              <div className="mb-3 flex items-center justify-between"><span className={cn("text-[13px]", col.color)}>{col.label}</span><span className={cn("font-mono text-[11px]", col.color)}>{items.length}</span></div>
              {items.length === 0 && <p className="mt-16 text-center text-xs text-app-dim">No actions</p>}
              {items.map((a) => (
                <div key={a.id} draggable onDragStart={() => setDrag(a.id)} className="mb-2 cursor-grab rounded border border-app-border-2 bg-app-panel p-3 active:cursor-grabbing">
                  <p className="text-[13px] font-medium leading-snug text-app-text">{a.title}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5"><Badge tone="accent"><Bot size={11} /> {a.agent}</Badge>{a.suggested && <Badge tone="accent" className="bg-app-accent/25">Suggested</Badge>}</div>
                  <div className="mt-2.5 flex items-center justify-between">
                    {col.id === "backlog" || col.id === "ready" ? <button onClick={() => moveAction(a.id, "in_progress")} className="flex items-center gap-1 text-xs text-app-accent hover:underline"><Play size={11} /> Launch</button>
                    : col.id === "in_progress" ? <button onClick={() => moveAction(a.id, "waiting")} className="text-xs text-app-purple hover:underline">Send to review</button>
                    : col.id === "waiting" ? <button onClick={() => moveAction(a.id, "complete")} className="text-xs text-app-green hover:underline">Mark complete</button> : <span className="text-xs text-app-dim">Done</span>}
                    <button onClick={() => deleteAction(a.id)} className="text-app-dim hover:text-app-red"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Getting started + actions */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <SectionTitle right={`${steps.filter((s) => s.done).length} / ${steps.length} done`}>Getting started</SectionTitle>
          <div className="space-y-2">
            {steps.map((s) => (
              <Card key={s.title} className={cn("flex items-center justify-between px-4 py-3", s.done && "opacity-60")}>
                <div className="flex items-start gap-3">
                  {s.done ? <CheckCircle2 size={16} className="mt-0.5 text-app-green" /> : <Circle size={16} className="mt-0.5 text-app-muted" />}
                  <div><p className={cn("text-[13px] text-app-text", s.done && "line-through")}>{s.title}</p><p className="text-xs text-app-muted">{s.body}</p></div>
                </div>
                {s.href && !s.done && <div className="flex gap-2 text-app-muted"><Settings2 size={13} /><Link href={s.href}><ArrowRight size={13} /></Link></div>}
              </Card>
            ))}
          </div>
        </div>
        <div>
          <SectionTitle right="Requires an open workspace">Actions</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-2">
            {quickActions.map((a) => (
              <Link key={a.title} href={a.href}><Card className="flex h-full gap-3 px-4 py-3 hover:border-app-border-2"><a.icon size={15} className="mt-0.5 shrink-0 text-app-accent" /><div><p className="text-[13px] text-app-text">{a.title}</p><p className="mt-0.5 text-xs text-app-muted">{a.body}</p></div></Card></Link>
            ))}
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New action" sub="Assign a specialist bot; output lands in Waiting for review.">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); addAction(form.title, form.agent); setOpen(false); setForm({ title: "", agent: agents[0].name }); }}>
          <Field label="What should happen?"><Input required autoFocus className="w-full" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Draft round-2 clarifications from client answers" /></Field>
          <Field label="Assign to"><Select className="w-full" value={form.agent} onChange={(e) => setForm({ ...form, agent: e.target.value })}>{agents.map((a) => <option key={a.id}>{a.name}</option>)}</Select></Field>
          <div className="flex justify-end"><Button variant="primary">Add to backlog</Button></div>
        </form>
      </Modal>

      <Modal open={editProfile} onClose={() => setEditProfile(false)} title="Tender profile" sub="Injected as context into every generation.">
        <div className="space-y-3">
          <Field label="Scope"><Select className="w-full" value={tender.scope} onChange={(e) => updateTender(tender.id, { scope: e.target.value })}>{["EPCI (full)", "EPC", "Installation only", "Engineering only", "Supply only"].map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <Field label="Client term"><Input className="w-full" value={tender.clientTerm} onChange={(e) => updateTender(tender.id, { clientTerm: e.target.value })} /></Field>
          <Field label="Bidder structure"><Select className="w-full" value={tender.bidder} onChange={(e) => updateTender(tender.id, { bidder: e.target.value })}>{["Sole bidder", "Consortium lead", "Consortium member", "Subcontractor"].map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <div className="flex justify-end"><Button variant="primary" onClick={() => setEditProfile(false)}>Done</Button></div>
        </div>
      </Modal>
    </div>
  );
}
