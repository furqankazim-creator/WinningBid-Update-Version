"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Trophy, FileBadge, RotateCcw } from "lucide-react";
import { Card, Badge, Button, Input, Select, Textarea, Field, PageHeader, Label } from "@/components/ui";
import { useStore } from "@/store/useStore";
import { money } from "@/components/app/charts";
import type { BidResult } from "@/store/types";

const statuses: BidResult["status"][] = ["Submitted", "Under Evaluation", "Clarification", "Negotiation", "Awarded", "Rejected", "Withdrawn", "Cancelled"];
const winFactors = ["Price", "Technical solution", "Experience", "Relationship", "Local content", "Schedule", "Compliance"];
const lossReasons = ["Price", "Technical", "Compliance", "Competitor", "Relationship", "Schedule", "Capability", "Client cancellation", "Unknown"];

export default function Result() {
  const { id } = useParams<{ id: string }>(); const s = useStore(); const router = useRouter();
  const t = s.tenders.find((x) => x.id === id)!; const ex = s.bidResults.find((x) => x.tenderId === id);
  const locked = s.priceVersions.find((p) => p.tenderId === id && p.locked);
  const [r, setR] = useState<BidResult>(ex || { tenderId: id, status: "Submitted", finalPrice: locked?.price || 0, feedback: "", competitor: "", reason: "", resultDate: "", winningFactors: [], lossReasons: [] });
  const toggle = (k: "winningFactors" | "lossReasons", v: string) => setR({ ...r, [k]: r[k].includes(v) ? r[k].filter((x) => x !== v) : [...r[k], v] });
  const save = () => { s.setBidResult(r); if (r.status === "Awarded" || r.status === "Rejected") s.addLesson({ tender: t.name, outcome: r.status === "Awarded" ? "Won" : "Lost", lesson: `${r.status === "Awarded" ? "Won" : "Lost"} at ${money(r.finalPrice, t.currency)}. ${r.status === "Awarded" ? "Winning factors: " + r.winningFactors.join(", ") : "Loss reasons: " + r.lossReasons.join(", ")}. ${r.feedback}`, date: r.resultDate || new Date().toISOString().slice(0, 10) }); };
  return (
    <div>
      <PageHeader title="Bid result" sub="Record the outcome; Won/Lost feeds Win/Loss analytics and creates a Lessons Learned record." right={<Badge tone={t.status === "Won" ? "green" : t.status === "Lost" ? "red" : "outline"}>{t.stage}</Badge>} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3 p-4">
          <Field label="Status"><Select className="w-full" value={r.status} onChange={(e) => setR({ ...r, status: e.target.value as BidResult["status"] })}>{statuses.map((x) => <option key={x}>{x}</option>)}</Select></Field>
          <div className="grid grid-cols-2 gap-3"><Field label={`Final price (${t.currency})`}><Input type="number" className="w-full" value={r.finalPrice} onChange={(e) => setR({ ...r, finalPrice: +e.target.value })} /></Field><Field label="Result date"><Input type="date" className="w-full" value={r.resultDate} onChange={(e) => setR({ ...r, resultDate: e.target.value })} /></Field></div>
          <Field label="Winning competitor (if lost)"><Input className="w-full" value={r.competitor} onChange={(e) => setR({ ...r, competitor: e.target.value })} /></Field>
          <Field label="Client feedback"><Textarea className="w-full" value={r.feedback} onChange={(e) => setR({ ...r, feedback: e.target.value })} /></Field>
          <Field label="Reason / notes"><Textarea className="w-full" value={r.reason} onChange={(e) => setR({ ...r, reason: e.target.value })} /></Field>
          <Button variant="primary" onClick={save}><Trophy size={13} /> Save result</Button>
        </Card>
        <div className="space-y-3">
          <Card className="p-4"><Label className="mb-2">Winning factors</Label><div className="flex flex-wrap gap-1.5">{winFactors.map((w) => <button key={w} onClick={() => toggle("winningFactors", w)}><Badge tone={r.winningFactors.includes(w) ? "green" : "outline"}>{w}</Badge></button>)}</div></Card>
          <Card className="p-4"><Label className="mb-2">Loss reasons</Label><div className="flex flex-wrap gap-1.5">{lossReasons.map((w) => <button key={w} onClick={() => toggle("lossReasons", w)}><Badge tone={r.lossReasons.includes(w) ? "red" : "outline"}>{w}</Badge></button>)}</div></Card>
          {t.status === "Won" && <Card className="p-4"><Label>Post-award</Label><p className="mt-1 text-xs text-app-muted">Create the contract record from the locked price and reviewed terms, then convert to a project.</p><div className="mt-3 flex gap-2"><Button variant="primary" onClick={() => { s.createContract(id); router.push("/app/contracts"); }}><FileBadge size={13} /> Create contract</Button><Button variant="outline" onClick={() => { s.convertToProject(id); router.push("/app/projects"); }}>Convert to project</Button></div></Card>}
          <Card className="p-4 text-xs text-app-muted"><Label className="flex items-center gap-1"><RotateCcw size={10} /> Lessons learned</Label><p className="mt-1">Saving an Awarded or Rejected result writes a searchable lessons-learned record with the factors above.</p></Card>
        </div>
      </div>
    </div>
  );
}
