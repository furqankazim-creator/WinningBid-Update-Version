"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, CheckCircle2, ChevronDown, ChevronRight, Download, FileSpreadsheet, FileText, Layers, Search, SlidersHorizontal, Sparkles, UploadCloud, X } from "lucide-react";
import { Badge, Button, Card, Label } from "@/components/ui";
import { useScopedStore, useStore, fmtMoney } from "@/store/useStore";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import type { Doc, TakeoffItem } from "@/store/types";

/**
 * Real SOW / BOQ / MTO takeoff. Every line comes from the uploaded document, shows the exact source text, and
 * must be approved by a person before it can be sent to Pricing. Nothing here is sample data.
 */
const isSheet = (d: Doc) => /\.(xlsx|xlsm)$/i.test(d.name);
const input = "w-full rounded border border-app-border bg-app-panel px-1.5 py-1 text-xs text-app-text outline-none focus:border-app-accent";

export function SOWTakeoffReal({ onUploadRequest, onShowSample }: { onUploadRequest?: () => void; onShowSample?: () => void }) {
  const { docs } = useScopedStore();
  const s = useStore();
  const { lang } = useI18n(); const ar = lang === "ar";
  const t = (en: string, a: string) => (ar ? a : en);

  const sources = docs.filter((d) => d.status === "INDEXED" && d.text);
  const preferred = sources.find((d) => d.takeoff) || sources.find((d) => /sow|scope|boq|mto/i.test(d.name) || d.kind === "Scope of Work") || sources[0];
  const [pick, setPick] = useState<string>("");
  const doc = sources.find((d) => d.id === pick) || preferred;
  const tk = doc?.takeoff;

  const [q, setQ] = useState(""); const [status, setStatus] = useState("All"); const [cat, setCat] = useState("All");
  const [sel, setSel] = useState<string[]>([]); const [open, setOpen] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null); const [msg, setMsg] = useState<string | null>(null);

  const items = tk?.items || [];
  const cats = useMemo(() => Array.from(new Set(items.map((i) => i.category))).sort(), [items]);
  const shown = items.filter((i) => (status === "All" || i.status === status) && (cat === "All" || i.category === cat) && `${i.code} ${i.description} ${i.category} ${i.clause || ""}`.toLowerCase().includes(q.toLowerCase()));
  const count = (st: TakeoffItem["status"]) => items.filter((i) => i.status === st).length;
  const approved = items.filter((i) => i.status === "Verified");
  const readyToPush = approved.filter((i) => !i.pushed).length;
  const total = approved.reduce((a, i) => a + i.qty * i.rate, 0);
  const busy = !!doc?.progress;

  const run = async () => { if (!doc) return; setErr(null); setMsg(null); setSel([]); const e = await s.extractTakeoff(doc.id); if (e) setErr(e); };
  const set = (ids: string[], patch: Partial<TakeoffItem>) => doc && s.updateTakeoffItems(doc.id, ids, patch);
  const push = () => { if (!doc) return; const n = s.pushTakeoffToPricing(doc.id); setMsg(n ? t(`${n} approved line(s) sent to Pricing.`, `تم إرسال ${n} بند معتمد إلى التسعير.`) : t("Nothing new to send — approve lines first.", "لا توجد بنود جديدة — اعتمد البنود أولاً.")); if (n) s.notify("Takeoff sent to Pricing", `${n} approved line(s) from ${doc.name} added to the cost build-up.`, "/app/pricing/build-up"); };
  const csv = () => {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [["Code", "Description", "Category", "Qty", "Unit", "Rate", "Total", "Status", "Page", "Clause", "Source quote"].join(","), ...items.map((i) => [i.code, i.description, i.category, i.qty, i.unit, i.rate, i.qty * i.rate, i.status, i.page ?? "", i.clause ?? "", i.quote].map(esc).join(","))];
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + rows.join("\n")], { type: "text/csv;charset=utf-8;" })); a.download = `${(doc?.name || "takeoff").replace(/\.[^.]+$/, "")}-takeoff.csv`; a.click();
  };
  const allSel = shown.length > 0 && shown.every((i) => sel.includes(i.id));

  return (
    <div className={cn("space-y-4", ar && "text-right")} dir={ar ? "rtl" : "ltr"}>
      <Card className="border-app-accent/40 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-1">
            <div className="flex items-center gap-2"><Badge tone="green">{t("From your document", "من مستندك")}</Badge><Badge tone="outline">{t("Every line needs approval", "كل بند يحتاج اعتماداً")}</Badge></div>
            <h2 className="font-display text-xl text-app-text">{t("Scope & Quantity Takeoff", "حصر النطاق والكميات")}</h2>
            <p className="text-xs leading-relaxed text-app-muted">{t("Reads the quantities written in your SOW, BOQ or MTO. Spreadsheets are read row by row; for PDF and Word the AI proposes lines and the system keeps only those whose quote exists word-for-word in the document. Check each line against its source, approve it, then send it to Pricing.", "يقرأ الكميات المكتوبة في نطاق العمل أو جدول الكميات. ملفات Excel تُقرأ صفاً بصف؛ أما PDF وWord فيقترح الذكاء الاصطناعي البنود ولا يُبقي النظام إلا ما وُجد نصه حرفياً في المستند. راجع كل بند مع مصدره ثم اعتمده وأرسله للتسعير.")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onUploadRequest}><UploadCloud size={13} />{t("Upload another file", "رفع ملف آخر")}</Button>
            <Button variant="primary" size="sm" className="gap-1.5" disabled={!doc || busy} onClick={run}><Sparkles size={13} className={cn(busy && "animate-spin")} />{busy ? doc?.progress : tk ? t("Re-read quantities", "إعادة قراءة الكميات") : t("Extract quantities", "استخراج الكميات")}</Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 border-t border-app-border pt-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Label>{t("Source document", "المستند المصدر")}</Label>
            <select value={doc?.id || ""} onChange={(e) => { setPick(e.target.value); setSel([]); setErr(null); setMsg(null); }} className={cn(input, "mt-1")}>
              {sources.map((d) => <option key={d.id} value={d.id}>{d.name}{d.takeoff ? ` · ${d.takeoff.items.length}` : ""}</option>)}
            </select>
            {doc && <p className="mt-1 flex items-center gap-1 text-[10px] text-app-dim">{isSheet(doc) ? <FileSpreadsheet size={10} /> : <FileText size={10} />}{isSheet(doc) ? t("Spreadsheet — read directly, no AI", "جدول — يُقرأ مباشرة بدون ذكاء اصطناعي") : t("Text document — AI proposes, code verifies", "مستند نصي — الذكاء الاصطناعي يقترح والنظام يتحقق")}</p>}
          </div>
          <div><Label>{t("Lines found", "البنود")}</Label><p className="mt-1 font-display text-lg text-app-text">{items.length}</p><span className="text-[10px] text-app-dim">{tk ? t(`${tk.pagesRead} page(s)/sheet(s) read`, `${tk.pagesRead} صفحة/ورقة`) : t("not extracted yet", "لم يُستخرج بعد")}</span></div>
          <div><Label>{t("Approved", "معتمد")}</Label><p className="mt-1 font-display text-lg text-app-green">{approved.length}<span className="text-xs text-app-muted"> / {items.length}</span></p><span className="text-[10px] text-app-dim">{count("Needs Verification")} {t("waiting", "بالانتظار")} · {count("Rejected")} {t("rejected", "مرفوض")}</span></div>
          <div><Label>{t("Approved value", "قيمة المعتمد")}</Label><p className="mt-1 font-display text-lg text-app-text">{total ? fmtMoney(total, "SAR") : "—"}</p><span className="text-[10px] text-app-dim">{t("only lines that have a rate", "للبنود التي لها سعر فقط")}</span></div>
        </div>
        {err && <p className="mt-3 rounded border border-app-red/40 bg-app-red/5 px-3 py-2 text-xs text-app-red">{err}</p>}
      </Card>

      {tk && tk.warnings.length > 0 && (
        <div className="rounded border border-app-yellow/40 bg-app-yellow/5 px-4 py-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-app-yellow"><AlertTriangle size={13} />{t("Please read", "يرجى القراءة")}</p>
          <ul className="mt-1 list-disc space-y-0.5 ps-5 text-[11px] text-app-muted">{tk.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
        </div>
      )}

      {!tk ? (
        <Card className="p-8 text-center">
          <Layers size={26} className="mx-auto text-app-accent" />
          <p className="mt-3 text-sm font-medium text-app-text">{doc ? t(`Ready to read "${doc.name}"`, `جاهز لقراءة "${doc.name}"`) : t("No document yet", "لا يوجد مستند بعد")}</p>
          <p className="mx-auto mt-1 max-w-lg text-xs text-app-muted">{doc ? t("Click Extract quantities. Nothing is shown until it is read from your file.", "اضغط استخراج الكميات. لا يظهر شيء إلا ما يُقرأ من ملفك.") : t("Upload your SOW, BOQ or MTO (PDF, Word or Excel).", "ارفع نطاق العمل أو جدول الكميات (PDF أو Word أو Excel).")}</p>
          {onShowSample && <button onClick={onShowSample} className="mt-4 text-[11px] text-app-dim underline hover:text-app-text">{t("Or look at a sample (not your data)", "أو شاهد مثالاً (ليس من بياناتك)")}</button>}
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-56"><Search size={13} className={cn("absolute top-2.5 text-app-muted", ar ? "right-2.5" : "left-2.5")} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search item, code, clause…", "بحث…")} className={cn(input, "py-1.5", ar ? "pr-8" : "pl-8")} /></div>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={cn(input, "w-auto py-1.5")}><option value="All">{t("All statuses", "كل الحالات")}</option><option value="Needs Verification">{t("Needs verification", "بحاجة للتحقق")}</option><option value="Verified">{t("Approved", "معتمد")}</option><option value="Rejected">{t("Rejected", "مرفوض")}</option></select>
              <select value={cat} onChange={(e) => setCat(e.target.value)} className={cn(input, "w-auto py-1.5")}><option value="All">{t("All categories", "كل الفئات")}</option>{cats.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" disabled={!sel.length} onClick={() => { set(sel, { status: "Verified" }); setSel([]); }} className="gap-1"><Check size={12} />{t(`Approve selected (${sel.length})`, `اعتماد المحدد (${sel.length})`)}</Button>
              <Button size="sm" variant="outline" disabled={!sel.length} onClick={() => { set(sel, { status: "Rejected" }); setSel([]); }} className="gap-1"><X size={12} />{t("Reject selected", "رفض المحدد")}</Button>
              <Button size="sm" variant="outline" onClick={csv} className="gap-1"><Download size={12} />CSV</Button>
              <Button size="sm" variant="primary" disabled={!readyToPush} onClick={push} className="gap-1"><SlidersHorizontal size={12} />{t(`Send approved to Pricing (${readyToPush})`, `إرسال المعتمد للتسعير (${readyToPush})`)}</Button>
            </div>
          </div>
          {msg && <p className="rounded border border-app-green/40 bg-app-green/5 px-3 py-2 text-xs text-app-green">{msg} <Link href="/app/pricing/build-up" className="underline">{t("Open Pricing", "فتح التسعير")}</Link></p>}

          <div className="overflow-x-auto rounded border border-app-border bg-app-panel">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-app-border bg-app-panel-2 text-start font-mono text-[10px] uppercase tracking-wider text-app-muted">
                <th className="w-8 px-2 py-2.5"><input type="checkbox" checked={allSel} onChange={() => setSel(allSel ? [] : shown.map((i) => i.id))} aria-label="Select all" /></th>
                <th className="px-2 py-2.5 text-start">{t("Code", "الرمز")}</th><th className="px-2 py-2.5 text-start">{t("Description", "الوصف")}</th><th className="px-2 py-2.5 text-start">{t("Category", "الفئة")}</th>
                <th className="w-24 px-2 py-2.5 text-start">{t("Qty", "الكمية")}</th><th className="w-20 px-2 py-2.5 text-start">{t("Unit", "الوحدة")}</th><th className="w-24 px-2 py-2.5 text-start">{t("Rate (SAR)", "السعر")}</th>
                <th className="px-2 py-2.5 text-start">{t("Source", "المصدر")}</th><th className="px-2 py-2.5 text-start">{t("Checks", "الفحوص")}</th><th className="px-2 py-2.5 text-start">{t("Status", "الحالة")}</th><th className="px-2 py-2.5" />
              </tr></thead>
              <tbody className="divide-y divide-app-border">
                {shown.map((i) => {
                  const done = i.status !== "Needs Verification";
                  return (
                    <Fragment key={i.id}>
                      <tr className={cn("align-top transition-colors hover:bg-app-panel-2/60", i.status === "Rejected" && "opacity-50", !i.checks.qtyInQuote && i.status === "Needs Verification" && "bg-app-yellow/5")}>
                        <td className="px-2 py-2"><input type="checkbox" checked={sel.includes(i.id)} onChange={() => setSel((c) => (c.includes(i.id) ? c.filter((x) => x !== i.id) : [...c, i.id]))} aria-label={`Select ${i.code}`} /></td>
                        <td className="whitespace-nowrap px-2 py-2 font-mono font-semibold text-app-accent">{i.code}</td>
                        <td className="max-w-xs px-2 py-2"><input className={input} value={i.description} disabled={i.pushed} onChange={(e) => set([i.id], { description: e.target.value })} /></td>
                        <td className="whitespace-nowrap px-2 py-2 text-app-muted">{i.category}</td>
                        <td className="px-2 py-2"><input className={cn(input, "font-mono")} type="number" min={0} value={i.qty} disabled={i.pushed} onChange={(e) => set([i.id], { qty: Number(e.target.value) || 0, status: i.status === "Verified" ? "Needs Verification" : i.status })} /></td>
                        <td className="px-2 py-2"><input className={input} value={i.unit} disabled={i.pushed} onChange={(e) => set([i.id], { unit: e.target.value })} /></td>
                        <td className="px-2 py-2"><input className={cn(input, "font-mono")} type="number" min={0} value={i.rate || ""} placeholder="—" disabled={i.pushed} onChange={(e) => set([i.id], { rate: Number(e.target.value) || 0 })} /></td>
                        <td className="whitespace-nowrap px-2 py-2 font-mono text-[11px] text-app-dim">{i.page ? `p.${i.page}` : ""}{i.page && i.clause ? " · " : ""}{i.clause || (i.page ? "" : "—")}</td>
                        <td className="px-2 py-2"><div className="flex flex-col gap-1">
                          <Badge tone={i.checks.quoteFound ? "green" : "red"}>{i.checks.quoteFound ? t("In source", "في المصدر") : t("Not in source", "ليس في المصدر")}</Badge>
                          {i.source === "ai" && <Badge tone={i.checks.qtyInQuote ? "green" : "yellow"}>{i.checks.qtyInQuote ? t("Qty matches", "الكمية مطابقة") : t("Check qty", "راجع الكمية")}</Badge>}
                        </div></td>
                        <td className="whitespace-nowrap px-2 py-2">{i.pushed ? <Badge tone="blue">{t("In Pricing", "في التسعير")}</Badge> : i.status === "Verified" ? <Badge tone="green"><CheckCircle2 size={10} /> {t("Approved", "معتمد")}</Badge> : i.status === "Rejected" ? <Badge tone="red">{t("Rejected", "مرفوض")}</Badge> : <Badge tone="yellow">{t("Needs verification", "بحاجة للتحقق")}</Badge>}</td>
                        <td className="whitespace-nowrap px-2 py-2"><div className="flex items-center gap-1">
                          {!i.pushed && (done ? <button className="rounded border border-app-border px-1.5 py-0.5 text-[10px] text-app-muted hover:text-app-text" onClick={() => set([i.id], { status: "Needs Verification" })}>{t("Undo", "تراجع")}</button> : <>
                            <button title={t("Approve", "اعتماد")} className="rounded border border-app-green/40 p-1 text-app-green hover:bg-app-green/10" onClick={() => set([i.id], { status: "Verified" })}><Check size={12} /></button>
                            <button title={t("Reject", "رفض")} className="rounded border border-app-red/40 p-1 text-app-red hover:bg-app-red/10" onClick={() => set([i.id], { status: "Rejected" })}><X size={12} /></button></>)}
                          <button title={t("Show source text", "عرض النص المصدر")} className="rounded border border-app-border p-1 text-app-muted hover:text-app-text" onClick={() => setOpen(open === i.id ? null : i.id)}>{open === i.id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</button>
                        </div></td>
                      </tr>
                      {open === i.id && <tr className="bg-app-panel-2/60"><td /><td colSpan={10} className="px-2 py-2.5"><p className="font-mono text-[10px] uppercase tracking-wider text-app-dim">{t("Exact text in your document", "النص الحرفي في مستندك")}{i.page ? ` — ${t("page", "صفحة")} ${i.page}` : ""}</p><p className="mt-1 whitespace-pre-wrap rounded border border-app-border bg-app-panel p-2 text-[11px] text-app-text" dir="auto">{i.quote}</p></td></tr>}
                    </Fragment>
                  );
                })}
                {!shown.length && <tr><td colSpan={11} className="px-3 py-8 text-center text-app-muted">{items.length ? t("No lines match the filters.", "لا توجد بنود مطابقة.") : t("No lines with an explicit quantity were found in this document.", "لم يُعثر على بنود بكميات صريحة في هذا المستند.")}</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-app-dim">{t(`Read ${new Date(tk.at).toLocaleString()} · ${tk.model || "spreadsheet"} · ${tk.pagesSkipped} page(s) without quantities skipped. Editing a quantity of an approved line returns it to "Needs verification".`, `${new Date(tk.at).toLocaleString()} · ${tk.model || ""}`)}</p>
        </>
      )}
      {onShowSample && tk && <button onClick={onShowSample} className="text-[11px] text-app-dim underline hover:text-app-text">{t("View the built-in sample (not your data)", "عرض المثال المدمج (ليس من بياناتك)")}</button>}
    </div>
  );
}
