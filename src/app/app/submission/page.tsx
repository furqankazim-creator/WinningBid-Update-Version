"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Download, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { PageHeader, Card, Button, Badge, Label, ProgressBar, Select, Input, Field } from "@/components/ui";
import type { SubmissionRecord } from "@/store/types";
import { exportCSV } from "@/components/app/shared";
import { useScopedStore } from "@/store/useStore";

export default function Submission() {
  const s = useScopedStore(); const router = useRouter();
  const t = s.tenders.find((x) => x.id === s.activeTenderId);
  const [building, setBuilding] = useState(false); const [built, setBuilt] = useState(false);
  const [method, setMethod] = useState<SubmissionRecord["method"]>("Portal"); const [confirmation, setConfirmation] = useState("");
  const subs = s.submissions.filter((x) => x.tenderId === s.activeTenderId);
  const approvedSub = s.approvals.some((a) => a.tenderId === s.activeTenderId && a.kind === "Submission" && a.status === "Approved");
  const checks = [
    { label: "All deliverables approved", ok: s.deliverables.every((d) => d.status === "Approved"), href: "/app/deliverables" },
    { label: "No AI drafts pending review", ok: ![...s.clarifications, ...s.clauses, ...s.qualifications].some((x) => x.pending), href: "/app/clarifications/register" },
    { label: "High-risk clauses have a position", ok: s.clauses.filter((c) => c.relevance === "High").every((c) => c.status === "Approved"), href: "/app/contract/register" },
    { label: "Price baseline locked", ok: s.costLines.length > 0, href: "/app/pricing/build-up" },
    { label: "Payment milestones sum to 100%", ok: s.milestones.reduce((a, m) => a + m.pct, 0) === 100, href: "/app/pricing/milestones" },
    { label: "Submission approved by management", ok: approvedSub, href: "/app/approvals" },
  ];
  const ready = checks.filter((c) => c.ok).length;
  const files = ["Technical Proposal.docx", "Commercial Proposal.docx", "Price Schedule.xlsx", "Company Profile.pdf", "Certificates.pdf", "Financial Statements.pdf", "Signed Forms.pdf", "Clarification Register.xlsx", "Qualifications & Deviations.docx", "Risk Register.xlsx", "Management Presentation.pptx"];
  const manifest = () => { const blob = new Blob([JSON.stringify({ tender: t?.name, reference: t?.reference, version: subs.length + 1, generated: new Date().toISOString(), files, checklist: checks.map((c) => ({ label: c.label, ok: c.ok })), deliverables: s.deliverables.map((d) => ({ name: d.name, type: d.type, status: d.status })) }, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${t?.reference || "submission"}-package-manifest.json`; a.click(); };
  return (
    <div className="font-sans">
      <PageHeader title="Submission package" sub="Technical, commercial and contractual deliverables assembled into one exportable package." right={<Button variant="primary" onClick={() => { setBuilding(true); setTimeout(() => { setBuilding(false); setBuilt(true); s.audit("Package assembled", "Tender", s.activeTenderId, `${files.length} files`); }, 1800); }} disabled={building}><Package size={13} /> {building ? "Assembling…" : "Assemble package"}</Button>} />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div>
          <Label className="mb-2">Readiness checks · {ready}/{checks.length}</Label>
          <ProgressBar value={(ready / checks.length) * 100} tone={ready === checks.length ? "green" : "yellow"} className="mb-3" />
          <div className="space-y-2">{checks.map((c) => <Card key={c.label} className="flex items-center justify-between px-4 py-3"><span className="flex items-center gap-3 text-[13px] text-app-text">{c.ok ? <CheckCircle2 size={15} className="text-app-green" /> : <Circle size={15} className="text-app-muted" />}{c.label}</span>{!c.ok && <a href={c.href} className="flex items-center gap-1 text-xs text-app-accent">Fix <ArrowRight size={11} /></a>}</Card>)}</div>
          <Label className="mb-2 mt-6">Package contents</Label>
          <Card className="divide-y divide-app-border">{files.map((f) => <div key={f} className="flex items-center justify-between px-4 py-2.5 text-[13px]"><span className="text-app-text">{f}</span>{built ? <button className="flex items-center gap-1 text-xs text-app-accent"><Download size={12} /> Download</button> : <Badge tone="outline">not built</Badge>}</div>)}</Card>
        </div>
        <div>
          <Card className="p-4"><Label>Record submission</Label>
            <div className="mt-2 space-y-2">
              <Field label="Method"><Select className="w-full" value={method} onChange={(e) => setMethod(e.target.value as SubmissionRecord["method"])}>{["Portal", "Email", "Hand delivery", "Courier"].map((m) => <option key={m}>{m}</option>)}</Select></Field>
              <Field label="Confirmation / receipt no."><Input className="w-full" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} /></Field>
              {!approvedSub && <Button className="w-full justify-center" variant="outline" size="sm" onClick={() => s.requestApproval({ tenderId: s.activeTenderId, subject: `Submission — ${t?.name}`, kind: "Submission", requestedBy: s.currentUser, approver: s.users.find((u) => u.role === "Executive")?.name || "Executive", reason: "" })}>Request submission approval</Button>}
              <Button className="w-full justify-center" variant="primary" disabled={!built} onClick={() => { s.recordSubmission({ tenderId: s.activeTenderId, method, confirmation, files, checklist: checks.map((c) => ({ label: c.label, ok: c.ok })) }); setConfirmation(""); }}>Record submission v{subs.length + 1}</Button>
              <Button className="w-full justify-center" variant="outline" size="sm" disabled={!built} onClick={manifest}>Download package manifest</Button>
              <Button className="w-full justify-center" variant="outline" size="sm" onClick={() => exportCSV("deliverables-checklist", s.deliverables.map((d) => ({ Deliverable: d.name, Type: d.type, Owner: d.owner, Status: d.status, Due: d.due })))}>Export checklist (Excel)</Button>
            </div>
            {subs.length > 0 && <div className="mt-3 space-y-1 border-t border-app-border pt-2">{subs.map((x) => <p key={x.id} className="text-[11px] text-app-muted"><span className="font-mono text-app-text">v{x.version}</span> · {new Date(x.at).toLocaleString()} · {x.by} · {x.method}{x.confirmation && ` · #${x.confirmation}`}</p>)}</div>}
          </Card>
          <Card className="p-4"><Label>Post-award</Label><p className="mt-2 text-xs text-app-muted">When the tender is marked <span className="text-app-text">Won</span> in Setup, convert it into a project to start post-award tracking.</p>
            <Button className="mt-3 w-full justify-center" variant={t?.status === "Won" ? "primary" : "outline"} disabled={t?.status !== "Won"} onClick={() => { if (t) { s.convertToProject(t.id); router.push("/app/projects"); } }}>Convert to Project</Button>
            {t?.status !== "Won" && <p className="mt-2 text-[11px] text-app-dim">Current status: {t?.status}</p>}</Card>
          <Card className="mt-3 p-4"><Label>Bid validity</Label><p className="mt-1 text-[13px] text-app-text">{t?.metadata["Bid validity"] || "—"}</p><Label className="mt-3">Submission deadline</Label><p className="mt-1 text-[13px] text-app-accent">{t?.closing}</p></Card>
        </div>
      </div>
    </div>
  );
}
