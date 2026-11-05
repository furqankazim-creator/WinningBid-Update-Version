"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader, Card, Button, Badge, Modal, Field, Input, Select, Textarea } from "@/components/ui";
import { useStore } from "@/store/useStore";
import type { Lesson } from "@/store/types";

export default function LessonsLearned() {
  const { lessons, addLesson, deleteLesson, tenders, activeTenderId } = useStore();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Omit<Lesson, "id">>({ tender: tenders.find((t) => t.id === activeTenderId)?.name || "", outcome: "Won", lesson: "", date: new Date().toISOString().slice(0, 10) });
  const won = lessons.filter((l) => l.outcome === "Won").length, lost = lessons.filter((l) => l.outcome === "Lost").length;
  return (
    <div className="font-sans">
      <PageHeader title="Lessons Learned" sub={`${lessons.length} record(s) · ${won} won · ${lost} lost · win rate ${won + lost ? Math.round((won / (won + lost)) * 100) : 0}%`} right={<Button variant="primary" onClick={() => setOpen(true)}><Plus size={13} /> Record lesson</Button>} />
      <div className="space-y-2">{lessons.map((l) => <Card key={l.id} className="p-4"><div className="flex items-start justify-between"><div className="flex items-center gap-2"><p className="text-[13px] font-semibold text-app-text">{l.tender}</p><Badge tone={l.outcome === "Won" ? "green" : l.outcome === "Lost" ? "red" : "outline"}>{l.outcome}</Badge></div><span className="flex items-center gap-3 text-xs text-app-muted">{l.date}<button onClick={() => deleteLesson(l.id)} className="hover:text-app-red"><Trash2 size={12} /></button></span></div><p className="mt-2 text-[13px] leading-relaxed text-app-muted">{l.lesson}</p></Card>)}</div>
      <Modal open={open} onClose={() => setOpen(false)} title="Record lesson" sub="Feeds the next bid's Tender manager as context.">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); addLesson(f); setOpen(false); }}>
          <Field label="Tender"><Input className="w-full" value={f.tender} onChange={(e) => setF({ ...f, tender: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3"><Field label="Outcome"><Select className="w-full" value={f.outcome} onChange={(e) => setF({ ...f, outcome: e.target.value as Lesson["outcome"] })}><option>Won</option><option>Lost</option><option>No bid</option></Select></Field><Field label="Date"><Input type="date" className="w-full" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field></div>
          <Field label="Lesson"><Textarea required className="w-full" value={f.lesson} onChange={(e) => setF({ ...f, lesson: e.target.value })} /></Field>
          <div className="flex justify-end"><Button variant="primary">Save</Button></div>
        </form>
      </Modal>
    </div>
  );
}
