/**
 * Verified tender analysis — the 7-step pipeline.
 *  1 structure (code)      2 extract requirements with quotes (code)     3 retrieve library rules (hybrid search)
 *  4 AI judges using only the retrieved rules                           5 code verifies every quote / rule id / revision
 *  6 findings wait for human approval (UI)                              7 report assembled from verified records only
 * The AI never writes a quote, a rule or a standard number that code has not confirmed.
 */
import type { VerifiedReport, VFinding, VKnowledge, FindingVerdict, Confidence } from "@/store/types";
import { alnum, parseTender, quoteIndex, type Parsed, type Statement } from "./structure";
import { buildRegistry, consistencyChecks, libraryInfo, libraryPost, ranges, type Issue, type LibraryInfo, type RegistryItem } from "./checks";
import { FACTS_SCHEMA, INDUSTRIES, JUDGE_SYS, KNOWLEDGE_SYS, PROMPT_VERSION, RISK_SYS, SYS_BASE, TENDER_TYPES, jsonCall, providerLabel, stats, type Ctx } from "./ai";
import { OCR_MARK } from "./ocr-merge";
import { resetModelsUsed } from "@/lib/server/groq";

export interface PipelineEvent { type: "progress"; stage: string; pct: number; msg: string; }
export interface PipelineOptions { depth: "standard" | "deep"; aborted: () => boolean; }

const JUDGE_LIMIT = { standard: 40, deep: 120 } as const;
const BATCH = 6;
const uniq = <T,>(a: T[]) => [...new Set(a)];
const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
const conf = (c: unknown): Confidence => (c === "High" || c === "Medium" || c === "Low" ? c : "Low");
const objs = <T,>(x: unknown): T[] => (Array.isArray(x) ? (x.filter((i) => i && typeof i === "object") as T[]) : []);

const GENERIC = new Set("shall must will should company contractor contractors contractor's saudi aramco standard standards requirement requirements project work works with that this from have been such which their there under into than then also only other when where while these those each every including provide provided supply install construction applicable accordance approved approval".split(" "));
/** distinct substantive words (≥ 5 letters, not boilerplate) that two texts share — a mechanical check that the cited evidence is about the same subject */
const sharedTerms = (a: string, b: string): number => { const t = (x: string) => new Set((x.toLowerCase().match(/[a-z]{5,}/g) || []).filter((w) => !GENERIC.has(w))); const A = t(a); let n = 0; for (const w of t(b)) if (A.has(w)) n++; return n; };
const SAFETY = /\b(safety|permit|fire|hazard|environment|waste|electrical|ground|pressure|test|inspection|coating|paint|concrete|weld|cathodic|lift|excavat|sprinkler|gas|noise|dust|asbestos|hazardous|ppe|emergency|insulation|backfill|compaction|foundation)\w*/i;
const RISKY = /(at its own cost|at TCF CONTRACTOR'?s? cost|without (?:any )?cost|no cost impact|liquidated|penalt|sole responsib|transferred to COMPANY|shall not be allowed|within \d+ days|rate for|warrant|at no (?:additional )?cost|prior approval|full responsibility)/i;

/* ------------------------------------------------------------------ step 3/4/5 helpers */

interface Rule { ruleId: string; standardName: string; code: string | null; text: string; cosine: number; lexical: number; score: number; direct: boolean; }
function selectKey(statements: Statement[], byCode: Map<string, RegistryItem>, limit: number): Statement[] {
  const score = (s: Statement) => (s.codes.some((c) => byCode.get(c)?.status === "verified-in-library") ? 4 : 0) + (s.codes.length ? 1 : 0) + (SAFETY.test(s.quote) ? 2 : 0) + (/\d/.test(s.quote) ? 1 : 0) + (s.priority === "Must" ? 1 : 0) + (s.quote.length >= 60 && s.quote.length <= 420 ? 1 : 0);
  const ranked = [...statements].sort((a, b) => score(b) - score(a) || a.page - b.page);
  const cap = Math.max(4, Math.ceil(limit / 6)); const per = new Map<string, number>(); const picked: Statement[] = [];
  for (const s of ranked) { const top = s.section.split(".")[0]; if ((per.get(top) || 0) >= cap) continue; per.set(top, (per.get(top) || 0) + 1); picked.push(s); if (picked.length >= limit) return picked; }
  for (const s of ranked) { if (picked.length >= limit) break; if (!picked.includes(s)) picked.push(s); }
  return picked;
}

async function retrieve(items: Statement[]): Promise<Map<string, Rule[]>> {
  const out = new Map<string, Rule[]>();
  for (let i = 0; i < items.length; i += 20) {
    const part = items.slice(i, i + 20);
    const r = await libraryPost<{ results: { id: string; rules: Rule[] }[] }>("/retrieve", { items: part.map((s) => ({ id: s.id, text: s.quote.slice(0, 700), codes: s.codes })), perItem: 3 }, 300_000);
    for (const x of r.results) out.set(x.id, x.rules);
  }
  return out;
}

interface JudgeRaw { id: string; verdict: string; rule: string | null; sentence?: number | string; reasoning: string; confidence: string; knowledge?: string; }

/** Rule text split into at most 5 numbered sentences: the AI points at one, code supplies the quotation. */
const ruleSentences = (text: string): string[] => { const ss = text.replace(/Saudi Aramco: Company General Use/g, " ").replace(/(?:^|\s)Page \d+ of \d+\s/g, " ").split(/(?<=[.;:])\s+(?=[A-Z0-9(])/).map((x) => x.trim()).filter((x) => x.length > 25); return (ss.length ? ss : [text]).map((x) => cut(x, 170)).slice(0, 5); };
type JItem = { q: string; s: Statement; rules: Rule[]; rs: string[][] };
function judgePrompt(batch: JItem[]): string {
  return batch.map(({ q, s, rs, rules }) => `${q} [p${s.page} §${s.section}] ${cut(s.quote, 330)}\n${rules.map((r, i) => `  R${i + 1} [${r.standardName}] ${rs[i].map((x, n) => `(${n + 1}) ${x}`).join(" ")}`).join("\n")}`).join("\n\n");
}

/* ------------------------------------------------------------------ helpers for the final record */

const verdictOf = (v: string): FindingVerdict => (/^conform/i.test(v) ? "Conforms" : /^conflict/i.test(v) ? "Conflicts" : /^reference/i.test(v) ? "Reference only" : "Not covered in library");

const TERMS: [string, RegExp][] = [
  ["Payment Terms", /\b(payment|invoice)s?\b/i], ["Payment Milestones", /\bmilestone/i], ["Retention", /\bretention\b/i], ["Warranty", /\bwarrant/i], ["Liability", /\bliabilit/i], ["Indemnity", /\bindemnif/i],
  ["Insurance", /\binsurance\b/i], ["Performance Bond", /performance (?:bond|guarantee)|bank guarantee/i], ["Advance Payment", /advance payment/i], ["Liquidated Damages", /liquidated damages|delay damages/i],
  ["Termination", /\bterminat/i], ["Dispute Resolution", /\bdispute|arbitration/i], ["Governing Law", /governing law|laws of the kingdom/i], ["Intellectual Property", /intellectual property|copyright/i],
  ["Confidentiality", /\bconfidential/i], ["Change Orders", /change order|variation order|change in scope/i], ["Force Majeure", /force majeure/i], ["Subcontracting", /\bsubcontract/i],
  ["Penalty Clauses", /\bpenalt/i], ["Delivery Obligations", /\bhand(?:ed)? ?over\b|deliver(?:y|ed) (?:to|of)/i], ["Acceptance Criteria", /\bacceptance\b|mechanical completion/i],
];
const HIGH_RISK = /(own cost|without (?:any )?cost|no cost impact|liquidated|penalt|sole responsib|at no (?:additional )?cost|full responsibility)/i;
const CERT = /\b(certified|certification|licen[cs]e[sd]?|approved (?:vendors?|training|suppliers?)|regulated vendor|RVL|IKTVA|BICSI|ISO \d{4,5})\b/i;
const DELIV = /\bshall (?:also )?(?:submit|prepare|provide|issue|develop|furnish|produce|establish)(?: and obtain [A-Za-z ]{0,20}approval (?:for|of))? (?:a |an |the |all |its |each )?([^.;:]{6,120}?\b(?:Plan|Procedure|Procedures|Report|Reports|Drawings?|Manual|Manuals|Study|Schedule|List|Statement|Documentation|Certificates?|Forms?|Programme|Records?|Calculations?|Diagrams?|Method Statement|Specifications?))\b/i;

function sentencesOf(parsed: Parsed) {
  const out: { text: string; page: number; section: string; doc: string }[] = [];
  for (const c of parsed.clauses) for (const s of c.text.split(/(?<=[.;])\s+(?=[A-Z(“"0-9])| ‣ /)) { const t = s.trim(); if (t.length > 20) out.push({ text: t, page: c.page, section: c.section, doc: c.doc }); }
  return out;
}

function digestFor(parsed: Parsed): string {
  const d0 = parsed.docs[0]; const first = d0?.pages.find((p) => p.readable);
  const parts: string[] = [];
  if (first) parts.push(`[p${first.page}] TITLE PAGE: ${cut(first.lines.join(" ").replace(//g, ""), 1300)}`);
  const purpose = parsed.clauses.filter((c) => /^1(\.0)?$/.test(c.section) || c.section === "0").map((c) => `[p${c.page} §${c.section}] ${c.text}`).join(" ");
  parts.push(`PURPOSE: ${cut(purpose.replace(//g, ""), 2300)}`);
  const heads = parsed.headings.filter((h) => h.number.split(".").length <= 2).slice(0, 70).map((h) => `${h.number} ${h.title} (p${h.page})`).join("; ");
  parts.push(`SECTION HEADINGS: ${cut(heads, 2300)}`);
  const facts: string[] = []; const seen = new Set<string>();
  const unit = /\b\d[\d,.]*\s?(days?|months?|years?|km|kV|kW|kVA|occupants|personnel|persons|hours?|%)\b/i;
  const kw = /\b(warrant|milestone|duration|capacity|occupants|award|contract|submit|proposal|bid)\b/i;
  for (const s of sentencesOf(parsed)) { if (facts.length >= 16) break; if ((unit.test(s.text) || kw.test(s.text)) && /\b(shall|is|are|will)\b/i.test(s.text) && s.text.length < 230 && !seen.has(alnum(s.text))) { seen.add(alnum(s.text)); facts.push(`[p${s.page} §${s.section}] ${s.text.replace(//g, "")}`); } }
  parts.push(`KEY FACT EXCERPTS:\n${facts.join("\n")}`);
  return parts.join("\n\n");
}

/* ------------------------------------------------------------------ the pipeline */

export async function runVerifiedPipeline(raw: string, tenderName: string, opts: PipelineOptions, emit: (e: PipelineEvent) => void) {
  const t0 = Date.now(); const calls0 = stats.calls;
  const p = (stage: string, pct: number, msg: string) => emit({ type: "progress", stage, pct, msg });
  const ctx: Ctx = { aborted: opts.aborted, onWait: (s) => p("wait", -1, `Waiting ${s}s for the AI provider's free-tier rate limit…`) };
  const check = () => { if (opts.aborted()) throw new Error("cancelled"); };
  let dropped = 0; let judgeFailed = 0; resetModelsUsed();
  const aiErrors: string[] = [];
  const fail = (what: string, e: unknown) => { const m = e instanceof Error ? e.message : String(e); aiErrors.push(`${what}: ${cut(m.replace(/\s+/g, " "), 190)}`); p("ai", -1, `AI step failed — ${what}`); };

  // 1–2 structure + requirements with quotes (no AI)
  p("structure", 2, "Reading structure: pages, clauses, numbered requirements…");
  const parsed = parseTender(raw);
  const qi = quoteIndex(parsed);
  const ocrLines = (raw.match(new RegExp(OCR_MARK, "g")) || []).length;
  const pagesTotal = parsed.docs.reduce((a, d) => a + d.pages.length, 0);
  p("structure", 8, `${parsed.clauses.length} clauses · ${parsed.statements.length} requirements with exact quotes · ${parsed.cites.length} standard citations · ${parsed.unreadablePages.length} unreadable page(s)`);
  if (!parsed.statements.length) throw new Error("No requirement statements ('shall' / 'must') were found in the readable text — check the document or run OCR first.");

  // 5a library check of every cited standard + consistency checks (no AI)
  p("library", 10, "Checking every cited standard against the local library…");
  const lib: LibraryInfo = await libraryInfo(); check();
  const { registry, byCode } = await buildRegistry(parsed, lib).catch(() => { throw new Error("Standards library check failed — is the API server (port 4005) running?"); });
  const issues: Issue[] = consistencyChecks(parsed, registry, lib, ocrLines);
  const aramcoCited = registry.filter((r) => /^aramco|^sec/.test(r.kind)); const verifiedCodes = registry.filter((r) => r.status === "verified-in-library").length;
  p("library", 18, `${verifiedCodes} of ${aramcoCited.length} cited Saudi Aramco references verified in the library · ${issues.length} consistency finding(s)`);

  // 3/4/5 facts + summary: AI works on a digest, every statement must carry an exact quote that code then finds in the source
  p("facts", 20, "AI: reading title page, purpose and key facts…");
  const digest = digestFor(parsed);
  type FactItem = { v?: string; t?: string; q?: string; p?: number };
  let factsRaw: { general?: Record<string, FactItem>; summary?: Record<string, FactItem[]> } = {};
  try { factsRaw = await jsonCall(ctx, SYS_BASE, `${FACTS_SCHEMA}\n\nEXCERPTS:\n${digest}`, 3400); } catch (e) { if (e instanceof Error && e.message === "cancelled") throw e; fail("Summary & key facts", e); }
  const d0 = parsed.docs[0]?.name || "document";
  const okQuote = (q: string | undefined, pg: number | undefined) => !!q && qi.check(q, d0, pg || 1).ok;
  const general: Record<string, string> = {}; const ST = "not stated";
  for (const [k, it] of Object.entries(factsRaw.general || {})) {
    const v = String(it?.v ?? "").trim();
    if (!v || v.toLowerCase() === ST) { general[k] = ST; continue; }
    if (okQuote(it?.q, it?.p)) general[k] = v; else { general[k] = ST; dropped++; }
  }
  if (!INDUSTRIES.split(", ").includes(general.industry)) general.industry = "other";
  if (!TENDER_TYPES.split(", ").includes(general.tenderType)) general.tenderType = "Tender";
  if (general.submissionDeadline && !/^\d{4}-\d{2}-\d{2}$/.test(general.submissionDeadline)) general.submissionDeadline = ST;
  const summary: Record<string, string[]> = {};
  for (const [sec, arr] of Object.entries(factsRaw.summary || {})) {
    const kept: string[] = [];
    for (const it of objs<FactItem>(arr)) { if (it.t && okQuote(it.q, it.p)) kept.push(`${it.t.trim()} (p.${it.p})`); else dropped++; }
    summary[sec] = kept;
  }
  p("facts", 30, `AI facts verified: ${Object.values(summary).reduce((a, b) => a + b.length, 0)} summary statements kept, ${dropped} dropped (quote not found in the source)`);

  // 3/4/5 retrieval + judgement
  const limit = JUDGE_LIMIT[opts.depth];
  const key = selectKey(parsed.statements, byCode, limit);
  p("retrieve", 32, `Searching the library for rules matching ${key.length} key requirements (vector + keyword + direct citation)…`);
  const rules = await retrieve(key).catch((e) => { issues.push({ id: "I-retrieval", kind: "library-unavailable", severity: "High", title: "Library retrieval failed", detail: String(e instanceof Error ? e.message : e), pages: [] }); return new Map<string, Rule[]>(); });
  check();
  const withRules = key.filter((s) => (rules.get(s.id) || []).length);
  const noRules = key.filter((s) => !(rules.get(s.id) || []).length);
  p("retrieve", 38, `${withRules.length} requirements have candidate library rules · ${noRules.length} have none`);

  const findings: VFinding[] = []; let fid = 0; let failed = 0;
  const base = (s: Statement): Omit<VFinding, "verdict" | "reasoning" | "confidence" | "checks" | "needsReview"> => ({ id: `F${++fid}`, statementId: s.id, doc: s.doc, page: s.page, section: s.section, category: s.category, quote: s.quote, ocr: stOcr(s) });
  const stOcr = (s: Statement) => s.ocr;
  const batches: typeof withRules[] = []; for (let i = 0; i < withRules.length; i += BATCH) batches.push(withRules.slice(i, i + BATCH));
  for (let b = 0; b < batches.length; b++) {
    check();
    p("judge", 40 + Math.round((b / Math.max(1, batches.length)) * 34), `AI judging requirements against library rules (${b + 1}/${batches.length})…`);
    const items: JItem[] = batches[b].map((s, i) => { const rl = rules.get(s.id)!; return { q: `Q${i + 1}`, s, rules: rl, rs: rl.map((x) => ruleSentences(x.text)) }; });
    let res: JudgeRaw[] = [];
    try { res = (await jsonCall<{ results?: JudgeRaw[] }>(ctx, JUDGE_SYS, `Judge these requirements.\n\n${judgePrompt(items)}`, 1900)).results || []; }
    catch (e) { if (e instanceof Error && e.message === "cancelled") throw e; fail(`Library judgement (batch ${b + 1}/${batches.length})`, e); }
    for (const it of items) {
      const r = res.find((x) => x.id === it.q);
      if (!r) { judgeFailed++; continue; } /* never turn "the AI did not answer" into a verdict */
      let verdict = verdictOf(r?.verdict || "Not covered"); let note: string | undefined;
      const ri = r?.rule && /^R\d+$/.test(r.rule) ? Number(r.rule.slice(1)) - 1 : -1;
      const rule = it.rules[ri]; const chosen = it.rs[ri]?.[Number(r?.sentence) - 1]; // the quotation is taken from the rule by code, never typed by the AI
      const quoteOk = qi.check(it.s.quote, it.s.doc, it.s.page).ok;
      let ruleQuoteOk: boolean | null = null;
      if (verdict !== "Not covered in library") {
        if (!rule) { verdict = "Not covered in library"; note = "AI cited no valid rule — downgraded"; failed++; }
        else if (!chosen) { verdict = "Not covered in library"; note = "AI did not point to a valid sentence of the rule — downgraded"; failed++; }
        else {
          ruleQuoteOk = alnum(rule.text).includes(alnum(chosen));
          if (!ruleQuoteOk) { verdict = "Not covered in library"; note = "Cited sentence not found in the rule text — downgraded"; failed++; }
          else if (verdict !== "Reference only" && sharedTerms(it.s.quote, chosen) < 2) { verdict = "Not covered in library"; note = "The cited rule sentence shares no substantive subject with the requirement — downgraded"; failed++; }
        }
      }
      findings.push({ ...base(it.s), verdict, ruleId: verdict === "Not covered in library" ? undefined : rule?.ruleId, standardName: verdict === "Not covered in library" ? undefined : rule?.standardName, ruleText: verdict === "Not covered in library" ? undefined : rule?.text, ruleQuote: verdict === "Not covered in library" ? undefined : chosen, reasoning: cut(String(r?.reasoning || ""), 260), confidence: conf(r?.confidence), knowledge: verdict === "Not covered in library" && r?.knowledge ? cut(String(r.knowledge), 200) : undefined, checks: { quote: quoteOk, ruleQuote: ruleQuoteOk, ruleExists: null, ruleActive: null }, needsReview: false, note });
    }
  }
  // requirements with no candidate rule: not covered (a guess is never made), plus a labelled AI-knowledge note
  for (const s of noRules) findings.push({ ...base(s), verdict: "Not covered in library", reasoning: "No rule in the local library addresses this requirement.", confidence: "High", checks: { quote: qi.check(s.quote, s.doc, s.page).ok, ruleQuote: null, ruleExists: null, ruleActive: null }, needsReview: false });

  // 5 prove the rule ids exist in the database right now and are the active revision
  const ids = uniq(findings.map((f) => f.ruleId).filter((x): x is string => !!x));
  if (ids.length) {
    const chk = await libraryPost<{ results: Record<string, { exists: boolean; active: boolean }> }>("/rules-check", { ruleIds: ids }).catch(() => null);
    for (const f of findings) if (f.ruleId) {
      const c = chk?.results[f.ruleId];
      f.checks.ruleExists = c ? c.exists : null; f.checks.ruleActive = c ? c.active : null;
      if (c && !c.exists) { f.verdict = "Not covered in library"; f.note = "Rule id not found in the database — downgraded"; f.ruleId = f.standardName = f.ruleText = f.ruleQuote = undefined; failed++; }
      else if (c && !c.active) f.note = "Cited rule belongs to a superseded revision";
    }
  }
  for (const f of findings) f.needsReview = f.verdict === "Conflicts" || f.confidence === "Low" || Object.values(f.checks).some((v) => v === false) || !!f.note;

  // knowledge notes for items the library cannot judge (AI memory, labelled unverified)
  const kn = findings.filter((f) => f.verdict === "Not covered in library" && !f.knowledge).slice(0, 18);
  for (let i = 0; i < kn.length; i += 9) {
    check(); p("knowledge", 75 + i, "AI: which standards or laws might govern requirements the library does not cover…");
    const part = kn.slice(i, i + 9);
    try {
      const r = await jsonCall<{ results?: { id: string; note: string }[] }>(ctx, KNOWLEDGE_SYS, `For each requirement, name in ≤ 25 words the standard, code or law (Saudi Aramco, KSA or international) that you believe governs it, or "" if unsure. Return {"results":[{"id":"K1","note":""}]}.\n\n${part.map((f, j) => `K${j + 1} ${cut(f.quote, 260)}`).join("\n")}`, 900);
      for (const x of r.results || []) { const f = part[Number(x.id?.slice(1)) - 1]; if (f && x.note) f.knowledge = cut(String(x.note), 200); }
    } catch (e) { if (e instanceof Error && e.message === "cancelled") throw e; fail("Knowledge notes for uncovered requirements", e); break; }
  }

  // AI knowledge tier: edition currency of cited external standards and standards/laws the tender omits
  p("knowledge", 80, "AI: checking cited editions and commonly required standards/laws the tender omits…");
  const hasEdition = (r: RegistryItem) => /-(\d{2}|\d{4})$/.test(r.code) || /edition|\b(19|20)\d{2}\b/i.test(r.titleInTender);
  const external = registry.filter((r) => (r.status === "outside-library-scope" || (r.status === "not-in-library" && r.kind !== "project-doc")) && hasEdition(r)).slice(0, 30);
  const families = Object.entries(registry.reduce<Record<string, number>>((a, r) => { const f = r.code.replace(/[-\d.]+[A-Z]?$/, "").replace(/^\d{2}-/, ""); a[f] = (a[f] || 0) + 1; return a; }, {})).map(([f, n]) => `${f} (${n})`).join(", ");
  const knowledge: VKnowledge = { disclaimer: "From the AI model's general knowledge (training data), NOT from your verified library. Treat as leads to check, never as confirmed facts.", editions: [], omitted: [] };
  try {
    const heads = parsed.headings.filter((h) => h.number.split(".").length <= 2).map((h) => h.title).slice(0, 40).join("; ");
    const kr = await jsonCall<{ editions?: { code: string; cited: string; status: string; note: string }[]; omitted?: { name: string; code?: string; jurisdiction: string; reason: string }[] }>(ctx, KNOWLEDGE_SYS,
      `Scope headings: ${cut(heads, 1400)}\n\nStandard families already cited in the tender (with counts): ${cut(families, 600)}\n\nCited standards whose edition is stated: ${external.map((r) => `${r.code}${r.titleInTender ? ` (${cut(r.titleInTender, 40)})` : ""}`).join("; ") || "none"}\n\nReturn JSON {"editions":[{"code":"","cited":"edition/year as cited in the tender or 'not stated'","status":"Superseded|Current|Unsure","note":"≤ 20 words"}],"omitted":[{"name":"","code":"","jurisdiction":"KSA law | Saudi Aramco | International","reason":"≤ 20 words"}]}.\n"editions": only entries whose stated edition you believe is outdated (say which edition is current); skip any you are unsure of. "omitted": at most 6 DISTINCT mandatory standards, laws or regulations that normally apply to this scope in KSA but are NOT among the cited families — "name" must be the full descriptive title (e.g. "Saudi Labor Law, safety provisions"); give "code" only if you are certain it exists; never list a numbered series (no 01-XXX-02, 01-XXX-03 …).`, 1800);
    knowledge.editions = objs<{ code: string; cited: string; status: string; note: string }>(kr.editions).filter((e) => e.code && !/not stated|not provided|unsure|unknown/i.test(`${e.cited} ${e.note}`)).slice(0, 10).map((e) => ({ code: String(e.code || ""), cited: String(e.cited || "not stated"), status: e.status === "Superseded" || e.status === "Current" ? e.status : "Unsure", note: cut(String(e.note || ""), 160) }));
    const citedCodes = new Set(registry.map((r) => r.code)); const famSeen = new Set<string>();
    const om = objs<{ name: string; code?: string; jurisdiction: string; reason: string }>(kr.omitted).filter((o) => {
      const code = (o.code || "").toUpperCase().replace(/\s+/g, "-"); const name = String(o.name || "").trim();
      if (name.length < 10 || name.toUpperCase() === code || citedCodes.has(code)) return false; // a bare code, or something the tender already cites
      const fam = code.replace(/-?\d+[A-Z]?$/, ""); if (code && famSeen.has(fam)) return false; famSeen.add(fam); // never accept a numbered series
      return true;
    }).slice(0, 6);
    const codesToCheck = uniq(om.map((o) => (o.code || "").toUpperCase().replace(/\s+/g, "-")).filter(Boolean));
    const lookup = codesToCheck.length ? await libraryPost<{ results: { code: string; found: boolean; activeName: string | null }[] }>("/codes", { codes: codesToCheck }).catch(() => null) : null;
    for (const o of om) {
      const code = (o.code || "").toUpperCase().replace(/\s+/g, "-"); const hit = lookup?.results.find((x) => x.code === code && x.found);
      let libraryRule: string | undefined, libraryRuleId: string | undefined;
      if (hit) {
        const rr = await libraryPost<{ results: { id: string; rules: Rule[] }[] }>("/retrieve", { items: [{ id: "x", text: `${o.name}. ${o.reason}`, codes: [code] }], perItem: 1 }).catch(() => null);
        const top = rr?.results[0]?.rules[0]; if (top) { libraryRule = top.text; libraryRuleId = top.ruleId; }
      }
      knowledge.omitted.push({ name: cut(String(o.name || ""), 120), code: code || undefined, jurisdiction: String(o.jurisdiction || ""), reason: cut(String(o.reason || ""), 180), libraryVerified: !!hit, libraryName: hit?.activeName ?? undefined, libraryRule, libraryRuleId });
    }
  } catch (e) { if (e instanceof Error && e.message === "cancelled") throw e; fail("Standards & laws knowledge check", e); }

  // deterministic registers: contract terms, deliverables, certifications
  const sents = sentencesOf(parsed);
  const contractTerms = TERMS.flatMap(([term, re]) => { const s = sents.find((x) => re.test(x.text)); return s ? [{ term, finding: cut(s.text.replace(//g, ""), 240), risk: (HIGH_RISK.test(s.text) ? "High" : "Medium") as "High" | "Medium", source: `§${s.section} p.${s.page}` }] : []; });
  const deliverables: { name: string; type: "Technical" | "Commercial"; source: string }[] = []; const dSeen = new Set<string>();
  for (const s of parsed.statements) { const m = DELIV.exec(s.quote); if (!m) continue; const name = cut(m[1].replace(//g, "").trim(), 110); const k = alnum(name); if (dSeen.has(k)) continue; dSeen.add(k); deliverables.push({ name: name[0].toUpperCase() + name.slice(1), type: /rate|price|quotation|cost|invoice|bid\b/i.test(name) ? "Commercial" : "Technical", source: `§${s.section} p.${s.page}` }); if (deliverables.length >= 90) break; }
  const certs = parsed.statements.filter((s) => CERT.test(s.quote)).slice(0, 40);

  // risks, clarifications, recommendation
  p("risk", 88, "AI: risks, clarification questions and bid recommendation…");
  const conflicts = findings.filter((f) => f.verdict === "Conflicts"); const conforms = findings.filter((f) => f.verdict === "Conforms"); const refOnly = findings.filter((f) => f.verdict === "Reference only");
  const riskyEx = sents.filter((s) => RISKY.test(s.text) && s.text.length < 260).slice(0, 14);
  const facts = [
    `Pages read: ${pagesTotal - parsed.unreadablePages.length}/${pagesTotal}; unreadable pages: ${parsed.unreadablePages.length ? ranges(parsed.unreadablePages.map((x) => x.page)) : "none"}`,
    `Requirements extracted: ${parsed.statements.length}; library-judged: ${findings.length} (conforms ${conforms.length}, conflicts ${conflicts.length}, reference-only ${refOnly.length}, not covered ${findings.length - conforms.length - conflicts.length - refOnly.length})`,
    `Cited Saudi Aramco references: ${aramcoCited.length}; verified in library: ${verifiedCodes}`,
    ...issues.filter((i) => i.severity !== "Info").slice(0, 9).map((i) => `ISSUE (${i.severity}): ${i.title}`),
    ...conflicts.slice(0, 4).map((f) => `CONFLICT p${f.page} §${f.section} with ${f.standardName}: ${cut(f.reasoning, 120)}`),
  ].join("\n");
  type RiskRaw = { title: string; description: string; category: string; probability: number; impact: number; mitigation: string; q: string; p: number };
  type ClarRaw = { title: string; question: string; q: string; p: number };
  let rr: { risks?: RiskRaw[]; clarifications?: ClarRaw[]; recommendation?: { verdict?: string; reasoning?: string; conditions?: string[] } } = {};
  try {
    rr = await jsonCall(ctx, RISK_SYS, `FACTS:\n${facts}\n\nEXCERPTS:\n${riskyEx.map((s) => `[p${s.page} §${s.section}] ${s.text.replace(//g, "")}`).join("\n")}\n\nReturn JSON {"risks":[{"title":"","description":"≤ 30 words","category":"Technical|Commercial|Financial|Legal|Contract|Procurement|Schedule|Operational|HSE|Environmental|Supply Chain","probability":"integer 1-5 likelihood","impact":"integer 1-5 severity","mitigation":"≤ 25 words","q":"exact quote","p":0}],"clarifications":[{"title":"","question":"precise question to the client","q":"exact quote","p":0}],"recommendation":{"verdict":"GO|CONDITIONAL GO|NO-GO","reasoning":"3-4 sentences naming the decisive facts above","conditions":[""]}}\nAt most 7 risks and 6 clarifications. Rate probability and impact honestly as integers 1–5 (do not default to 1). Use only the excerpts for quotes.`, 2600);
  } catch (e) { if (e instanceof Error && e.message === "cancelled") throw e; fail("Risks, clarifications & recommendation", e); }
  const risks = objs<RiskRaw>(rr.risks).filter((r) => { const ok = okQuote(r.q, r.p); if (!ok) dropped++; return ok; });
  const aiClar = objs<ClarRaw>(rr.clarifications).filter((c) => { const ok = okQuote(c.q, c.p); if (!ok) dropped++; return ok; });
  const clarifications = [
    ...issues.filter((i) => ["malformed-code", "edition-conflict", "toc-missing-section", "unlisted-standard", "project-docs-missing", "unreadable-pages"].includes(i.kind)).map((i) => ({ ref: i.pages.length ? `p.${i.pages.slice(0, 4).join(", ")}` : "", category: "Technical", title: i.title, question: `${i.detail}${i.items?.length ? ` (${i.items.slice(0, 6).join("; ")}${i.items.length > 6 ? "; …" : ""})` : ""} Please confirm the intended requirement.`, page: i.pages[0] || 0, confidence: "High" })),
    ...aiClar.map((c) => ({ ref: `p.${c.p}`, category: "Technical", title: String(c.title || "").trim(), question: String(c.question || "").trim(), page: c.p, confidence: "Medium" })),
  ];
    const verdict = ["GO", "CONDITIONAL GO", "NO-GO"].includes(String(rr.recommendation?.verdict)) ? String(rr.recommendation!.verdict) : "Pending";
  const recommendation = { verdict, reasoning: String(rr.recommendation?.reasoning || `No AI recommendation was produced (the AI step failed) — decide manually. Verified facts: ${facts.split("\n").slice(0, 3).join(" · ")}`), conditions: Array.isArray(rr.recommendation?.conditions) ? rr.recommendation!.conditions!.map(String) : [] };

  // 7 assemble
  p("report", 96, "Assembling the verified report…");
  if (judgeFailed) issues.unshift({ id: "I-judge", kind: "judgement-incomplete", severity: "High", title: `${judgeFailed} key requirement(s) were NOT judged against the library`, detail: "The AI did not return a judgement for these requirements, so they are not listed as findings at all (they are not counted as 'Not covered'). Re-run the analysis when the AI provider is available.", pages: [] });
  if (aiErrors.length) issues.unshift({ id: "I-ai", kind: "ai-unavailable", severity: "High", title: `${aiErrors.length} AI step(s) failed — the report is incomplete`, detail: aiErrors.join(" | "), pages: [], items: aiErrors });
  const hasTerm = (t: string) => contractTerms.some((c) => c.term === t);
  summary["Missing Information"] = [
    ...(/submission (?:date|deadline)|bid (?:due|closing)|closing date/i.test(raw) ? [] : ["Bid submission deadline / closing date: not stated in the readable pages."]),
    ...["Payment Terms", "Liability", "Liquidated Damages", "Governing Law", "Insurance", "Termination"].filter((t) => !hasTerm(t)).map((t) => `${t}: not found in the readable pages.`),
    ...(parsed.unreadablePages.length ? [`Pages ${ranges(parsed.unreadablePages.map((x) => x.page))} could not be read (see consistency findings).`] : []),
    ...(registry.some((r) => r.status === "project-doc-missing") ? [`${registry.filter((r) => r.status === "project-doc-missing").length} referenced project documents were not provided.`] : []),
  ].slice(0, 12);
  summary["Potential Risks"] = risks.map((r) => `${r.title}: ${cut(String(r.description || ""), 160)} (p.${r.p})`);
  summary["Questions for Client"] = clarifications.slice(0, 8).map((c) => cut(c.title, 160));

  const report: VerifiedReport = {
    version: 1, generatedAt: new Date().toISOString(), promptVersion: PROMPT_VERSION, model: providerLabel(), depth: opts.depth, aiErrors,
    library: { version: lib.version, rows: lib.rows, indexedAt: lib.indexedAt, files: lib.files, standardFiles: lib.standardFiles, codedStandards: lib.codedStandards, unavailable: lib.unavailable },
    docs: parsed.docs.map((d) => ({ name: d.name, pages: d.pages.length, unreadablePages: parsed.unreadablePages.filter((u) => u.doc === d.name).map((u) => u.page), ocrPages: 0, ocrRecoveredLines: 0 })),
    coverage: { pagesTotal, pagesRead: pagesTotal - parsed.unreadablePages.length, unreadablePages: parsed.unreadablePages.map((u) => u.page), statements: parsed.statements.length, judged: findings.length, duplicatesMerged: parsed.duplicates, ocrRecoveredLines: ocrLines, codesCited: registry.length, codesVerified: verifiedCodes },
    stats: { conforms: conforms.length, conflicts: conflicts.length, referenceOnly: refOnly.length, notCovered: findings.length - conforms.length - conflicts.length - refOnly.length, failedChecks: failed, judgeFailed, aiStatementsDropped: dropped, aiCalls: stats.calls - calls0, seconds: Math.round((Date.now() - t0) / 1000) },
    findings, registry, issues, knowledge, approvals: {},
  };

  const stmtVerdict = new Map(findings.map((f) => [f.statementId, f]));
  const result = {
    general: { ...general, title: general.title !== ST ? general.title : tenderName },
    summary, contractTerms, deliverables, recommendation, report,
    requirements: parsed.statements.map((s) => { const f = stmtVerdict.get(s.id); return { id: s.id, text: s.quote, category: s.category, priority: s.priority, page: s.page, section: s.chain.split(" › ").slice(-1)[0] || s.heading, clause: s.section, doc: s.doc, evidence: "", confidence: (stOcr(s) ? "Medium" : "High") as Confidence, standard: s.codes.find((c) => byCode.get(c)?.status === "verified-in-library") || "", finding: f ? `${f.verdict}${f.standardName ? ` — ${f.standardName}` : ""}` : "", ocr: stOcr(s), alsoAt: s.alsoAt }; }),
    clauses: conflicts.map((f) => ({ ref: `§${f.section}`, title: cut(f.quote, 80), category: "Other", relevance: "High", markup: `Raise as clarification / take exception: conflicts with ${f.standardName} — ${f.reasoning}`, analysis: `Library rule: "${f.ruleQuote}"`, page: f.page })),
    clarifications, risks: risks.map((r) => ({ title: r.title, description: r.description, category: r.category, probability: r.probability, impact: r.impact, mitigation: r.mitigation })),
    compliance: [
      ...certs.map((s) => ({ item: cut(s.quote.replace(//g, ""), 220), evidence: "", source: `§${s.section} p.${s.page}`, standard: "", finding: "" })),
      ...conflicts.map((f) => ({ item: `Conflict with ${f.standardName}: ${cut(f.quote, 160)}`, evidence: "", source: `§${f.section} p.${f.page}`, standard: f.standardName || "", finding: "Conflict" })),
      ...issues.filter((i) => ["malformed-code", "edition-conflict", "library-gap", "unreadable-pages"].includes(i.kind)).map((i) => ({ item: i.title, evidence: i.detail, source: i.pages.length ? `p.${i.pages.slice(0, 5).join(", ")}` : "document", standard: "", finding: "Needs review" })),
    ],
  };
  p("report", 100, `${aiErrors.length ? "Finished with AI failures — " : ""}Done in ${report.stats.seconds}s · ${report.stats.aiCalls} AI calls`);
  return result;
}
