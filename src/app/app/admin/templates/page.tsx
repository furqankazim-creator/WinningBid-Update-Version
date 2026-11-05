"use client";
import { useState } from "react";
import { Plus, Trash2, Copy, Save } from "lucide-react";
import { Card, Badge, Button, Input, Textarea, Field, PageHeader, Label } from "@/components/ui";
import { useStore } from "@/store/useStore";
import { useIndustries } from "@/lib/useIndustries";
import type { IndustryTemplate } from "@/lib/industries";
import { cn } from "@/lib/cn";

const lists: { key: keyof IndustryTemplate; label: string; hint: string }[] = [
  { key: "services", label: "Services / sub-industries", hint: "Roads, Bridges, Buildings…" },
  { key: "compliance", label: "Compliance requirements", hint: "Licences, certifications, bonds…" },
  { key: "documentTypes", label: "Document types", hint: "RFP, BOQ, Drawings…" },
  { key: "requirementFocus", label: "Requirement categories emphasised", hint: "Technical, HSE, Experience…" },
  { key: "riskCategories", label: "Risk categories", hint: "" },
  { key: "costCategories", label: "Cost categories", hint: "" },
  { key: "engineeringSections", label: "Engineering workspace sections", hint: "" },
  { key: "proposalSections", label: "Extra technical proposal sections", hint: "Added to the common sections" },
  { key: "customFields", label: "Custom tender fields", hint: "Shown on the workspace Overview" },
  { key: "questionTemplates", label: "Clarification question templates", hint: "Offered when adding a clarification" },
];

export default function Templates() {
  const s = useStore(); const all = useIndustries();
  const [sel, setSel] = useState(all[0]?.id); const cur = all.find((i) => i.id === sel) || all[0];
  const [draft, setDraft] = useState<IndustryTemplate | null>(null);
  const isCustom = s.customIndustries.some((c) => c.id === cur?.id);
  const edit = draft && draft.id === cur?.id ? draft : cur;
  const setList = (k: keyof IndustryTemplate, v: string) => setDraft({ ...(edit as IndustryTemplate), [k]: v.split("\n").map((x) => x.trim()).filter(Boolean) });
  const save = () => { if (!edit) return; if (isCustom) s.updateCustomIndustry(edit.id, edit); else s.addCustomIndustry(edit); s.audit("Template saved", "IndustryTemplate", edit.id, edit.name); setDraft(null); };
  const create = () => { const id = `custom-${Date.now().toString(36)}`; s.addCustomIndustry({ id, name: "New industry", icon: "◻️", services: [], compliance: [], costCategories: ["Labor", "Materials", "Overheads", "Contingency"], riskCategories: ["Technical", "Commercial", "Legal", "Schedule"], engineeringSections: ["Scope"], proposalSections: [], documentTypes: ["Tender document"], requirementFocus: ["Technical"], customFields: [], questionTemplates: [] }); setSel(id); };
  return (
    <div className="font-sans">
      <PageHeader title="Industry Template Builder" sub="The core application never branches on an industry. Everything industry-specific lives here: services, compliance, documents, risk & cost categories, engineering and proposal sections." right={<Button variant="primary" onClick={create}><Plus size={13} /> New industry</Button>} />
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <Card className="app-scroll max-h-[70vh] divide-y divide-app-border overflow-y-auto">{all.map((i) => <button key={i.id} onClick={() => { setSel(i.id); setDraft(null); }} className={cn("flex w-full items-center justify-between px-3 py-2 text-left text-[13px] hover:bg-app-panel-2", cur?.id === i.id && "bg-app-panel-2")}><span className="text-app-text">{i.icon} {i.name}</span>{s.customIndustries.some((c) => c.id === i.id) && <Badge tone="accent">custom</Badge>}</button>)}</Card>
        {edit && (
          <div>
            <Card className="mb-3 flex flex-wrap items-end gap-3 p-4">
              <Field label="Icon"><Input className="w-16" value={edit.icon} onChange={(e) => setDraft({ ...edit, icon: e.target.value })} /></Field>
              <Field label="Industry name"><Input className="w-64" value={edit.name} onChange={(e) => setDraft({ ...edit, name: e.target.value })} /></Field>
              <Label className="flex-1">id: {edit.id} · {isCustom ? "organisation override" : "built-in (saving creates an override)"}</Label>
              <Button variant="outline" onClick={() => { const id = `${edit.id}-copy-${Date.now().toString(36)}`; s.addCustomIndustry({ ...edit, id, name: `${edit.name} (copy)` }); setSel(id); }}><Copy size={12} /> Duplicate</Button>
              {isCustom && <Button variant="danger" onClick={() => { s.deleteCustomIndustry(edit.id); setSel(all[0].id); }}><Trash2 size={12} /> Remove override</Button>}
              <Button variant="primary" onClick={save} disabled={!draft}><Save size={12} /> Save template</Button>
            </Card>
            <div className="grid gap-3 md:grid-cols-2">{lists.map((l) => <Card key={l.key} className="p-4"><Label>{l.label} · {((edit[l.key] as string[] | undefined) || []).length}</Label><Textarea className="mt-2 w-full min-h-[120px] font-mono text-xs" value={((edit[l.key] as string[] | undefined) || []).join("\n")} placeholder={l.hint} onChange={(e) => setList(l.key, e.target.value)} /><p className="mt-1 text-[10px] text-app-dim">One item per line.</p></Card>)}</div>
            <Card className="mt-3 p-4 text-xs text-app-muted"><Label className="mb-1">Roadmap</Label>Approval workflow builder · Proposal templates per tender type · Configurable Go/No-Go weights.</Card>
          </div>
        )}
      </div>
    </div>
  );
}
