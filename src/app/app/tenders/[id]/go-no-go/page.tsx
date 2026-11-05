"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Scale, Send } from "lucide-react";
import { Card, Badge, Button, Label, Select, Textarea, PageHeader } from "@/components/ui";
import { useStore, goNoGoVerdict } from "@/store/useStore";
import { goNoGoCriteria } from "@/lib/industries";
import type { GoNoGo } from "@/store/types";
import { cn } from "@/lib/cn";

export default function GoNoGoPage() {
  const { id } = useParams<{ id: string }>(); const s = useStore();
  const t = s.tenders.find((x) => x.id === id)!; const sum = s.aiSummaries.find((x) => x.tenderId === id);
  const [scores, setScores] = useState<Record<string, number>>(t.goNoGoScores); const [override, setOverride] = useState<GoNoGo | "">(""); const [reason, setReason] = useState(t.goNoGoReason || "");
  const calc = goNoGoVerdict(scores);
  const verdict = override || calc.verdict;
  const tone = (g: string) => (g === "GO" ? "green" : g === "NO-GO" ? "red" : g === "CONDITIONAL GO" ? "yellow" : "outline");
  const save = () => { s.setGoNoGo(id, scores, verdict as GoNoGo, reason || (override ? "Management override" : `Scored ${calc.total}/100`)); s.requestApproval({ tenderId: id, subject: `Go/No-Go — ${t.name} (${verdict})`, kind: "Go/No-Go", requestedBy: s.currentUser, approver: s.users.find((u) => u.role === "Executive")?.name || "Executive", reason: "" }); };
  return (
    <div>
      <PageHeader title="Go / No-Go decision" sub="Score every criterion 1–5. The verdict is derived from the scorecard; management can override with a documented reason." right={<Badge tone={tone(t.goNoGo)} className="text-sm">{t.goNoGo}</Badge>} />
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Card className="divide-y divide-app-border">
          {goNoGoCriteria.map((c) => <div key={c} className="flex items-center justify-between px-4 py-2.5 text-[13px]"><span className="text-app-text">{c}</span><div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setScores({ ...scores, [c]: n })} className={cn("h-7 w-7 rounded-sm font-mono text-xs", scores[c] === n ? (n >= 4 ? "bg-app-green text-white" : n === 3 ? "bg-app-yellow text-black" : "bg-app-red text-white") : "bg-app-panel-2 text-app-muted hover:bg-app-border-2")}>{n}</button>)}</div></div>)}
        </Card>
        <div className="space-y-3">
          <Card className="p-4"><Label>Scorecard result</Label><p className={cn("mt-1 font-display text-4xl", `text-app-${tone(calc.verdict) === "outline" ? "muted" : tone(calc.verdict)}`)}>{calc.total || "—"}<span className="text-sm text-app-muted">/100</span></p><Badge tone={tone(calc.verdict)} className="mt-1">{calc.verdict}</Badge><p className="mt-2 text-[11px] text-app-dim">≥70 GO · 50–69 CONDITIONAL · &lt;50 NO-GO. A score of 1 on Technical capability, Compliance or Contract risk caps the result at CONDITIONAL.</p></Card>
          {sum && <Card className="p-4"><Label>AI recommendation</Label><Badge tone={tone(sum.recommendation.verdict)} className="mt-1">{sum.recommendation.verdict}</Badge><p className="mt-2 text-xs text-app-muted">{sum.recommendation.reasoning}</p></Card>}
          <Card className="p-4"><Label>Management override</Label><Select className="mt-1 w-full" value={override} onChange={(e) => setOverride(e.target.value as GoNoGo | "")}><option value="">Use scorecard verdict</option><option>GO</option><option>CONDITIONAL GO</option><option>NO-GO</option></Select><Textarea className="mt-2 w-full" placeholder={override ? "Reason for override (required)" : "Decision notes / conditions"} value={reason} onChange={(e) => setReason(e.target.value)} /><Button className="mt-3 w-full justify-center" variant="primary" disabled={calc.verdict === "Pending" && !override || (!!override && !reason)} onClick={save}><Scale size={13} /> Record decision & request approval</Button></Card>
          {t.goNoGo !== "Pending" && <Card className="p-4 text-xs text-app-muted"><Label>Current decision</Label><p className="mt-1 text-app-text">{t.goNoGo}</p><p>{t.goNoGoReason}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-app-dim"><Send size={10} /> Approval status: {s.approvals.find((a) => a.tenderId === id && a.kind === "Go/No-Go")?.status || "not requested"}</p></Card>}
        </div>
      </div>
    </div>
  );
}
