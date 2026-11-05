"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { CloudUpload, FileText, FolderOpen, Trash2, HardDrive, Sparkles, History, Lock, Languages } from "lucide-react";
import { Button, Card, Badge, PageHeader, Select, Modal, Label, Input } from "@/components/ui";
import { useScopedStore, useStore } from "@/store/useStore";
import { useIndustry } from "@/lib/useIndustries";
import type { Doc } from "@/store/types";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export default function DocumentsPage() {
  const s = useScopedStore();
  const setDocs = useStore((x) => x.updateDoc);
  const tender = s.tenders.find((t) => t.id === s.activeTenderId);
  const ind = useIndustry(tender?.industry || "other");
  const fileRef = useRef<HTMLInputElement>(null);
  const dirRef = useRef<HTMLInputElement>(null);

  // Global Language state (EN vs AR) synchronized with useI18n
  const { lang, setLang } = useI18n();
  const isAr = lang === "ar";
  const handleLanguageChange = (newLang: "en" | "ar") => {
    setLang(newLang);
  };

  const [over, setOver] = useState(false);
  const [detail, setDetail] = useState<Doc | null>(null);
  const [analysing, setAnalysing] = useState<string | null>(null);
  
  const take = (files: FileList | null) => {
    if (!files) return;
    void s.uploadDocs(Array.from(files));
  };

  const [err, setErr] = useState<string | null>(null);
  const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;
  const types = Array.from(new Set([...ind.documentTypes, ...s.docs.map((d) => d.kind)]));

  const analyse = async (d: Doc) => {
    setAnalysing(d.id);
    setErr(null);
    const e = await s.analyzeDocument(d.id);
    if (!e && tender) {
      await s.runTenderAnalysis(tender.id);
    }
    if (e) setErr(e);
    setAnalysing(null);
  };

  const conf = (c?: Doc["confidentiality"]) =>
    c === "Restricted" ? "red" : c === "Confidential" ? "yellow" : "outline";

  return (
    <div className={cn("font-sans space-y-6", isAr && "text-right font-sans")} dir={isAr ? "rtl" : "ltr"}>
      {/* Top Header with Language Switcher */}
      <PageHeader
        title={isAr ? "المستندات" : "Documents"}
        sub={
          isAr
            ? `${tender?.name || ""} · استخبارات المستندات والتحليل ومستودع الملفات`
            : `${tender?.name || ""} · Document intelligence, AI analysis & repository`
        }
        right={
          <div className="flex flex-wrap items-center gap-2">
            {/* Language Toggle */}
            <div className="flex items-center gap-1 rounded border border-app-border bg-app-panel px-1.5 py-0.5 text-xs">
              <Languages size={13} className="text-app-muted" />
              <button
                onClick={() => handleLanguageChange("en")}
                className={cn(
                  "rounded px-2 py-0.5 font-mono text-[11px] transition-colors",
                  lang === "en" ? "bg-app-accent text-white font-bold" : "text-app-muted hover:text-app-text"
                )}
              >
                EN
              </button>
              <button
                onClick={() => handleLanguageChange("ar")}
                className={cn(
                  "rounded px-2.5 py-0.5 font-sans text-[11px] transition-colors",
                  lang === "ar" ? "bg-app-accent text-white font-bold" : "text-app-muted hover:text-app-text"
                )}
              >
                العربية
              </button>
            </div>
          </div>
        }
      />

      {/* FILES REPOSITORY & MULTI-FILE UPLOAD */}
      <div className="space-y-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-app-text">
          <HardDrive size={14} />
          {isAr ? `مستودع الملفات (${s.docs.length})` : `Files Repository (${s.docs.length})`}
        </h2>
          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              take(e.dataTransfer.files);
            }}
            className={cn(
              "flex flex-col items-center rounded border border-dashed py-10 text-center transition-colors",
              over ? "border-app-accent bg-app-accent/5" : "border-app-border-2 bg-app-panel"
            )}
          >
            <CloudUpload size={24} className="text-app-blue" />
            <p className="mt-2 text-xs font-semibold text-app-blue">
              {isAr ? "اسحب ملفات العطاء هنا، أو استخدم الأزرار أدناه" : "Drag tender files here, or use the buttons below"}
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                {isAr ? "اختيار ملفات" : "Select Files"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => dirRef.current?.click()}>
                <FolderOpen size={12} /> {isAr ? "اختيار مجلد" : "Select Folder"}
              </Button>
            </div>
            <p className="mt-3 text-[11px] text-app-dim">
              {isAr
                ? "ملفات PDF و DOCX و XLSX و PPTX و CAD و ZIP · حتى 200 ميجابايت للملف (يدعم كراسات الشروط حتى 98 صفحة)"
                : "PDF, DOCX, XLSX, PPTX, CAD, ZIP · Up to 200 MB per file (Supports extensive 98-page tender specifications)"}
            </p>
            <input ref={fileRef} type="file" multiple hidden onChange={(e) => take(e.target.files)} />
            {/* @ts-expect-error webkitdirectory is non-standard */}
            <input ref={dirRef} type="file" multiple hidden webkitdirectory="" onChange={(e) => take(e.target.files)} />
          </div>

          {/* Document Table */}
          <div className="overflow-x-auto rounded border border-app-border bg-app-panel">
            <table className="w-full text-left ltr:text-left rtl:text-right text-[13px]">
              <thead>
                <tr className="border-b border-app-border bg-app-panel-2">
                  {(isAr
                    ? ["المستند", "النوع", "الإصدار", "اللغة", "السرية", "تاريخ الرفع", "الحالة", ""]
                    : ["Document", "Type", "Version", "Language", "Confidentiality", "Uploaded", "Status", ""]
                  ).map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-app-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {s.docs.map((d) => (
                  <tr key={d.id} className="hover:bg-app-panel-2/50 transition-colors">
                    <td className="px-3 py-2">
                      <button
                        onClick={() => setDetail(d)}
                        className="flex items-center gap-2 text-left ltr:text-left rtl:text-right hover:text-app-accent"
                      >
                        <FileText size={14} className="text-app-muted" />
                        <span>
                          <span className="block text-app-text">{d.name}</span>
                          <span className="text-[11px] text-app-muted">{mb(d.size)}</span>
                        </span>
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <Select
                        className="py-1 text-xs"
                        value={d.kind}
                        onChange={(e) => setDocs(d.id, { kind: e.target.value })}
                      >
                        {types.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-app-muted">
                      rev {d.rev}
                      {d.pages ? (
                        <span className="block text-[10px] text-app-dim">
                          {d.pages} {isAr ? "صفحة" : "pp"} · {d.text ? (isAr ? "نص مفهرس" : "indexed text") : (isAr ? "بدون نص" : "no text")}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      <Select
                        className="py-1 text-xs"
                        value={d.language || "English"}
                        onChange={(e) => setDocs(d.id, { language: e.target.value })}
                      >
                        {["English", "French", "Arabic", "Spanish", "Portuguese", "Norwegian", "Other"].map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-3 py-2">
                      <Select
                        className={cn(
                          "py-1 text-xs",
                          `text-app-${conf(d.confidentiality) === "outline" ? "muted" : conf(d.confidentiality)}`
                        )}
                        value={d.confidentiality || "Internal"}
                        onChange={(e) =>
                          setDocs(d.id, { confidentiality: e.target.value as Doc["confidentiality"] })
                        }
                      >
                        {["Public", "Internal", "Confidential", "Restricted"].map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-3 py-2 text-xs text-app-muted">
                      {new Date(d.uploadedAt).toLocaleDateString()}
                      <br />
                      {d.uploadedBy || s.currentUser}
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        tone={d.status === "INDEXED" ? "accent" : d.status === "PROCESSING" ? "yellow" : "red"}
                      >
                        {d.status === "PROCESSING" ? `EXTRACTING… ${d.progress || ""}` : d.status}
                      </Badge>
                      {d.status === "INDEXED" && d.ocr && (
                        d.ocr.used ? (
                          <p className="mt-1 max-w-[190px] text-[10px] leading-snug text-app-dim">
                            OCR cross-check: {d.ocr.recoveredLines} line(s) recovered
                            {d.ocr.unusablePages.length ? (
                              <span className="text-app-yellow">
                                {" "}
                                · {d.ocr.unusablePages.length} page(s) unreadable (
                                {d.ocr.unusablePages.length > 3
                                  ? `${d.ocr.unusablePages[0]}–${d.ocr.unusablePages[d.ocr.unusablePages.length - 1]}`
                                  : d.ocr.unusablePages.join(", ")}
                                )
                              </span>
                            ) : null}
                          </p>
                        ) : d.ocr.note && !["plain text", "not a PDF", "spreadsheet"].includes(d.ocr.note) ? (
                          <p className="mt-1 max-w-[190px] text-[10px] leading-snug text-app-yellow">
                            No OCR cross-check: {d.ocr.note}
                          </p>
                        ) : null
                      )}
                      {d.status === "FAILED" && d.analysis?.Error && (
                        <p className="mt-1 max-w-[200px] text-[10px] leading-snug text-app-red">
                          {d.analysis.Error === "Failed to fetch"
                            ? isAr ? "انقطع الاتصال أثناء الرفع. يرجى إعادة رفع الملف." : "Server was restarting or disconnected. Please re-upload."
                            : d.analysis.Error}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {d.status === "FAILED" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              s.deleteDoc(d.id);
                              fileRef.current?.click();
                            }}
                            className="text-xs text-app-red hover:bg-app-red/10"
                          >
                            {isAr ? "إعادة الرفع" : "Re-upload"}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={d.status !== "INDEXED" || analysing === d.id}
                            onClick={() => analyse(d)}
                          >
                            <Sparkles size={11} />
                            {analysing === d.id
                              ? isAr ? "جاري التحليل..." : "Analysing…"
                              : d.analysis
                              ? isAr ? "إعادة تحليل" : "Re-analyse"
                              : isAr ? "تحليل" : "Analyze"}
                          </Button>
                        )}
                        <button
                          onClick={() => s.deleteDoc(d.id)}
                          className="text-app-dim hover:text-app-red transition-colors p-1"
                          title={isAr ? "حذف المستند" : "Delete document"}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {s.docs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-xs text-app-dim">
                      {isAr ? "لا توجد مستندات في هذا المشروع بعد." : "No documents in this workspace yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {err && (
            <p className="mt-3 rounded border border-app-red/40 bg-app-red/10 px-3 py-2 text-xs text-app-red">
              {err}
            </p>
          )}

          {s.analysisBusy && (
            <Card className="border-app-accent/40 bg-app-accent/5 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-app-text">
                  <Sparkles size={14} className="animate-spin text-app-accent" />
                  {s.analysisProgress?.msg || "AI Analysis in progress…"}
                </span>
                <span className="font-mono text-app-accent">{s.analysisProgress?.pct ?? 0}%</span>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded bg-app-panel-2">
                <div
                  className="h-full bg-app-accent transition-all duration-300"
                  style={{ width: `${s.analysisProgress?.pct ?? 0}%` }}
                />
              </div>
              <div className="mt-2 flex justify-end">
                <Link
                  href={`/app/tenders/${s.activeTenderId}/ai-analysis`}
                  className="text-[11px] font-medium text-app-accent hover:underline flex items-center gap-1"
                >
                  {isAr ? "عرض التحليل المباشر ←" : "View live analysis report →"}
                </Link>
              </div>
            </Card>
          )}

          <div className="flex flex-wrap items-center gap-3 rounded border border-app-accent/30 bg-app-accent/5 px-4 py-3">
            <Sparkles size={14} className="text-app-accent" />
            <p className="flex-1 text-xs text-app-text">
              {isAr
                ? "تشغيل المراجعة الشاملة بالذكاء الاصطناعي لهذا العطاء من المستندات المفهرسة — الملخص، المتطلبات الموثقة، شروط العقد، الاستفسارات، المخاطر، الالتزام والمخرجات."
                : "Run the full AI review of this tender from the indexed documents — summary, cited requirements, contract terms, clarifications, risks, compliance and deliverables."}
            </p>
            <Link href={`/app/tenders/${s.activeTenderId}/ai-analysis?start=1`}>
              <Button variant="primary" size="sm" className="gap-1.5 font-semibold">
                <Sparkles size={12} /> {isAr ? "تشغيل تحليل الذكاء الاصطناعي" : "Run AI Analysis"}
              </Button>
            </Link>
          </div>
      </div>

      {/* Document Detail Modal */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.name}
        sub={detail ? `${detail.kind} · rev ${detail.rev} · ${mb(detail.size)}` : ""}
        wide
      >
        {detail &&
          (() => {
            const d = s.docs.find((x) => x.id === detail.id) || detail;
            return (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="mb-2 flex items-center gap-1">
                    <Sparkles size={10} /> {isAr ? "المعلومات العامة المستخرجة بالذكاء الاصطناعي" : "AI-extracted general information"}
                  </Label>
                  {d.analysis ? (
                    <div className="space-y-1.5">
                      {Object.entries(d.analysis).map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-3 border-b border-app-border py-1 text-xs">
                          <span className="text-app-muted">{k}</span>
                          <span className={cn("text-right", v === "not found" ? "italic text-app-dim" : "text-app-text")}>
                            {v}
                          </span>
                        </div>
                      ))}
                      <p className="mt-2 text-[10px] text-app-dim">
                        {isAr ? "يتطلب التحقق · مسجل في حوكمة الذكاء الاصطناعي" : "Needs verification · logged in AI Governance"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-app-dim">{isAr ? "لم يتم التحليل بعد." : "Not analysed yet."}</p>
                  )}
                </div>
                <div>
                  <Label className="mb-2 flex items-center gap-1">
                    <Lock size={10} /> {isAr ? "الصلاحيات" : "Permissions"}
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {["Tender Manager", "Commercial Manager", "Technical Manager", "Legal", "Finance", "Viewer"].map(
                      (r) => {
                        const on = (d.permissions || ["Tender Manager", "Commercial Manager", "Technical Manager"]).includes(
                          r
                        );
                        return (
                          <button
                            key={r}
                            onClick={() => {
                              const cur = d.permissions || [
                                "Tender Manager",
                                "Commercial Manager",
                                "Technical Manager",
                              ];
                              setDocs(d.id, {
                                permissions: on ? cur.filter((x) => x !== r) : [...cur, r],
                              });
                            }}
                          >
                            <Badge tone={on ? "accent" : "outline"}>{r}</Badge>
                          </button>
                        );
                      }
                    )}
                  </div>
                  <Label className="mt-4 mb-2 flex items-center gap-1">
                    <History size={10} /> {isAr ? "سجل إصدارات المستند" : "Document history"}
                  </Label>
                  <div className="space-y-1 text-xs">
                    {[...(d.history || []), { rev: d.rev, at: d.uploadedAt, by: d.uploadedBy || s.currentUser, note: "Uploaded" }]
                      .sort((a, b) => b.rev - a.rev)
                      .map((h, i) => (
                        <p key={i} className="text-app-muted">
                          <span className="font-mono text-app-text">rev {h.rev}</span> · {new Date(h.at).toLocaleString()} ·{" "}
                          {h.by} · {h.note}
                        </p>
                      ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Input
                      type="file"
                      className="flex-1 text-xs"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setDocs(d.id, {
                          rev: d.rev + 1,
                          size: f.size,
                          status: "INDEXED",
                          history: [
                            ...(d.history || []),
                            { rev: d.rev, at: d.uploadedAt, by: d.uploadedBy || s.currentUser, note: "Superseded" },
                          ],
                          uploadedAt: new Date().toISOString(),
                          uploadedBy: s.currentUser,
                        });
                        s.audit("New document version", "Document", d.id, `${d.name} → rev ${d.rev + 1}`);
                      }}
                    />
                    <Label className="self-center">{isAr ? "رفع إصدار جديد" : "Upload new version"}</Label>
                  </div>
                </div>
              </div>
            );
          })()}
      </Modal>
    </div>
  );
}
