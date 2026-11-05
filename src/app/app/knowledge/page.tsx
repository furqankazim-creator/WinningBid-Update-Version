"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { Card, Badge, Input, PageHeader, Label } from "@/components/ui";
import { useStore } from "@/store/useStore";

const questions = ["Why did we win?", "Why did we lose?", "Was our price competitive?", "Were requirements correctly understood?", "Which risks were missed?", "Which supplier performed best?", "Which assumptions were wrong?", "What should we do differently next time?"];

export default function Knowledge() {
  const s = useStore(); const [q, setQ] = useState("");
  const hits = q.length < 2 ? [] : [
    ...s.lessons.filter((l) => (l.lesson + l.tender).toLowerCase().includes(q.toLowerCase())).map((l) => ({ id: l.id, kind: "Lesson", title: `${l.tender} · ${l.outcome}`, body: l.lesson })),
    ...s.requirements.filter((r) => r.text.toLowerCase().includes(q.toLowerCase())).map((r) => ({ id: r.id, kind: "Requirement", title: `${s.tenders.find((t) => t.id === r.tenderId)?.name} §${r.clause}`, body: r.text })),
    ...s.clauses.filter((c) => (c.title + c.analysis).toLowerCase().includes(q.toLowerCase())).map((c) => ({ id: c.id, kind: "Contract clause", title: `${c.ref} ${c.title}`, body: c.analysis })),
    ...s.clarifications.filter((c) => (c.title + c.analysis).toLowerCase().includes(q.toLowerCase())).map((c) => ({ id: c.id, kind: "Clarification", title: c.title, body: c.analysis })),
    ...s.vendors.flatMap((v) => v.ratings.map((r) => ({ id: r.id, kind: "Supplier rating", title: `${v.name} · ${r.project}`, body: r.comment }))).filter((x) => (x.title + x.body).toLowerCase().includes(q.toLowerCase())),
  ];
  return (
    <div className="font-sans">
      <PageHeader title="Knowledge base" sub="Searchable organisational memory: lessons learned, past requirements, clause positions, clarifications and supplier performance." />
      <div className="relative mb-4 max-w-xl"><Search size={13} className="absolute left-2.5 top-2.5 text-app-dim" /><Input className="w-full pl-8" placeholder="Search e.g. liability cap, copper, bond, DNV…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {q.length < 2 ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Card className="p-4"><Label className="mb-2">Every completed bid answers</Label><ul className="space-y-1 text-[13px] text-app-text">{questions.map((x) => <li key={x}>• {x}</li>)}</ul></Card>
          <Card className="p-4"><Label className="mb-2">Recent lessons</Label><div className="space-y-2">{s.lessons.map((l) => <div key={l.id}><div className="flex items-center gap-2"><Badge tone={l.outcome === "Won" ? "green" : "red"}>{l.outcome}</Badge><span className="text-xs text-app-muted">{l.tender} · {l.date}</span></div><p className="mt-0.5 text-xs text-app-text">{l.lesson}</p></div>)}</div></Card>
        </div>
      ) : (
        <div className="space-y-2">{hits.map((h) => <Card key={h.kind + h.id} className="p-3"><div className="flex items-center gap-2"><Badge tone="outline">{h.kind}</Badge><span className="text-xs text-app-muted">{h.title}</span></div><p className="mt-1 text-[13px] text-app-text">{h.body}</p></Card>)}{hits.length === 0 && <Card className="p-6 text-center text-xs text-app-dim">No matches.</Card>}</div>
      )}
    </div>
  );
}
