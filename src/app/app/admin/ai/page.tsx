"use client";
import { useState } from "react";
import { Card, Table, PageHeader, Badge, Label, confidenceTone, Modal, Button, Textarea } from "@/components/ui";
import { Kpi } from "@/components/app/charts";
import { useStore } from "@/store/useStore";

export default function AIGovernance() {
  const s = useStore();
  const [selected, setSelected] = useState<typeof s.aiLog[0] | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  const handleApprove = (id: string, status: "Accepted" | "Rejected") => {
    s.updateAILogStatus(id, status, reviewNote || undefined);
    setSelected(null);
    setReviewNote("");
  };

  const openModal = (a: typeof s.aiLog[0]) => {
    setSelected(a);
    setReviewNote(a.reviewNote || "");
  };

  return (
    <div className="font-sans">
      <PageHeader title="AI Governance" sub="Every AI action records model, prompt version, timestamp, user, source documents, input, output, confidence, review status and approver. AI never silently changes approved business data." />
      <div className="mb-4 grid gap-3 sm:grid-cols-4"><Kpi label="AI runs" value={s.aiLog.length} /><Kpi label="Pending human review" value={s.aiLog.filter((a) => a.reviewStatus === "Pending").length} tone="accent" /><Kpi label="Accepted" value={s.aiLog.filter((a) => a.reviewStatus === "Accepted").length} tone="green" /><Kpi label="Default model" value={s.profile.model} /></div>
      <Table head={["Timestamp", "Task", "Model / prompt", "User", "Sources", "Output", "Confidence", "Review", "Approver"]}>
        {s.aiLog.map((a) => (
          <tr key={a.id} onClick={() => openModal(a)} className="cursor-pointer hover:bg-app-overlay transition-colors">
            <td className="px-3 py-2 font-mono text-[11px] text-app-muted">{new Date(a.at).toLocaleString()}</td>
            <td className="px-3 py-2 text-app-text">{a.task}</td>
            <td className="px-3 py-2 text-xs text-app-muted">{a.model} · {a.promptVersion}</td>
            <td className="px-3 py-2 text-app-muted">{a.user}</td>
            <td className="px-3 py-2 text-xs text-app-muted">{a.sources.join(", ")}</td>
            <td className="px-3 py-2 text-xs text-app-text max-w-xs truncate">{a.outputSummary}</td>
            <td className="px-3 py-2"><Badge tone={confidenceTone(a.confidence)}>{a.confidence}</Badge></td>
            <td className="px-3 py-2"><Badge tone={a.reviewStatus === "Accepted" ? "green" : a.reviewStatus === "Rejected" ? "red" : "yellow"}>{a.reviewStatus}</Badge></td>
            <td className="px-3 py-2 text-xs text-app-muted">{a.approver || "—"}</td>
          </tr>
        ))}
      </Table>
      <Card className="mt-4 p-4 text-xs text-app-muted"><Label className="mb-1">Policy</Label>AI outputs enter as Draft / Needs Verification. Human acceptance is required before they count in registers, proposals, Tender Health or Go/No-Go. Competitor data is never generated — only recorded with source and confidence.</Card>
      
      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title="AI Action Review" wide>
          <div className="space-y-4 text-sm">
            <div>
              <Label>Task & Model</Label>
              <div className="text-app-text">{selected.task} — {selected.model} ({selected.promptVersion})</div>
            </div>
            <div>
              <Label>Source Documents</Label>
              <div className="text-app-text">{selected.sources.join(", ") || "None"}</div>
            </div>
            <div>
              <Label>Input Prompt / Context</Label>
              <div className="p-3 bg-app-overlay rounded whitespace-pre-wrap font-mono text-xs text-app-text max-h-32 overflow-y-auto">{selected.input}</div>
            </div>
            <div>
              <Label>AI Output Generated</Label>
              <div className="p-3 bg-app-overlay/50 rounded whitespace-pre-wrap text-app-text border border-app-border max-h-64 overflow-y-auto">{selected.outputSummary}</div>
            </div>
            
            {selected.reviewStatus === "Pending" ? (
              <div className="pt-4 border-t border-app-border space-y-3">
                <div>
                  <Label>Review Notes (Optional)</Label>
                  <Textarea placeholder="Add details or feedback about your recheck before approving/rejecting..." value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} className="w-full text-xs" />
                </div>
                <div className="flex gap-3">
                  <Button variant="success" onClick={() => handleApprove(selected.id, "Accepted")}>Accept Output</Button>
                  <Button variant="danger" onClick={() => handleApprove(selected.id, "Rejected")}>Reject</Button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-app-border space-y-2">
                <div>
                  Status: <Badge tone={selected.reviewStatus === "Accepted" ? "green" : "red"}>{selected.reviewStatus}</Badge> by {selected.approver}
                </div>
                {selected.reviewNote && (
                  <div>
                    <Label>Reviewer Notes</Label>
                    <div className="p-3 bg-app-overlay rounded text-xs text-app-text italic">
                      "{selected.reviewNote}"
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
