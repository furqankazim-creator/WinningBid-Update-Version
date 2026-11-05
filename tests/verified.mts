/** Deterministic parts of the verified pipeline (no AI, no network). Run: npm run test:verified */
import { findCodes, findMalformed, codeOfName, revisionOfName } from "../src/lib/server/verified/codes";
import { parseTender, quoteIndex, fixOcrCodes } from "../src/lib/server/verified/structure";
import { mergePage, OCR_MARK, boilerplateSet } from "../src/lib/server/verified/ocr-merge";
import { consistencyChecks, type RegistryItem } from "../src/lib/server/verified/checks";
import { reportScore } from "../src/lib/reportScore";

let n = 0, bad = 0;
const ok = (c: boolean, m: string) => { n++; if (!c) { bad++; console.log(`FAIL ${String(n).padStart(2)}  ${m}`); } else console.log(`ok   ${String(n).padStart(2)}  ${m}`); };

// ---- code recognition
const t = "Fencing per SAES\u2011M\u2011006, 31-SAMSS-004, GI 2.100, G.I.0151.006, NFPA 101 (2009 Edition), ASCE 7-05, 690-A-TD-018202-001 and SBC-201-CR-18.";
const codes = findCodes(t).map((c) => c.code);
ok(codes.includes("SAES-M-006"), "non-breaking hyphen normalised → SAES-M-006");
ok(codes.includes("GI-2.100") && codes.includes("GI-151.006"), "GI numbers canonicalised (GI 2.100, G.I.0151.006 → GI-151.006)");
ok(codes.includes("ASCE-7-05") && !codes.includes("ASCE-7"), "edition kept, shorter overlapping match dropped");
ok(codes.includes("690-A-TD-018202-001") && codes.includes("31-SAMSS-004") && codes.includes("SBC-201"), "project doc, SAMSS and SBC codes recognised");
ok(findMalformed("per SAES-B017 and SAES-1154 and 09-AMSS-060 and SAES-B-017").map((m) => m.raw).join() === "SAES-B017,SAES-1154,09-AMSS-060", "typos detected, valid code not flagged");
ok(codeOfName("SAES-B-017_-_OfficialPDF")?.code === "SAES-B-017" && codeOfName("3700_8-9-10-11th") === null, "library file names → code (underscores handled, non-standards ignored)");
ok(revisionOfName("SAES-B-017 (02-July-2019)").year === 2019 && revisionOfName("31-SAMSS-004 dtd 01 Jan 2017").year === 2017 && revisionOfName("SAEP-1151.PDF").year === null, "revision year parsed from file names");
ok(fixOcrCodes("per SAES-0-202 and SAEHC-5-02 and SAEP-1l54") === "per SAES-O-202 and SAEHC-S-02 and SAEP-1154", "OCR digit/letter confusions repaired inside codes only");

// ---- parsing: pages, clauses, hyphen-wrapped codes, bullets, duplicates, page attribution
const doc = [
  "===== DOCUMENT: SOW.pdf =====",
  "[[PAGE 1]]", "TABLE OF CONTENTS", "1. PURPOSE 2", "2. SCOPE 2", "2.1 Fencing 2", "2.2 Roads 3", "3. CODES 3", "3.1 Standards 3", "3.2 Other 3", "4. ANNEX 4",
  "[[PAGE 2]]", "1. PURPOSE", "1.1 The Contractor shall design the camp for 204 personnel. The camp shall comply with SAES-P-", "113, Table 1.",
  "2. SCOPE", "2.1 Fencing", "2.1.1 Fencing shall be as per SAES-M-006 and the Contractor shall provide gates.",
  "2.1.2 The Contractor shall submit a Quality Plan as per SAES-1154. The Contractor shall provide:", "• first aid kits", "• an ambulance",
  "[[PAGE 3]]", "2.3 Roads", "2.3.1 All roads shall be asphalt and the work shall follow ASCE 7-05.",
  "3. CODES", "3.1 Standards", "SAES-M-006 Fencing", "ASCE 7-10 Loads",
  "[[PAGE 4]]", "4. ANNEX", "4.1 The Contractor shall submit a Quality Plan as per SAES-1154.",
].join("\n");
const p = parseTender(doc);
const q = (re: RegExp) => p.statements.find((s) => re.test(s.quote));
ok(p.statements.length >= 5, `statements extracted (${p.statements.length})`);
ok(!!q(/SAES-P-113/), "code wrapped across two lines is rejoined (SAES-P- + 113)");
ok(q(/204 personnel/)?.page === 2 && q(/204 personnel/)?.section === "1.1", "statement carries its page and clause number");
ok(!!q(/provide:.*first aid kits.*ambulance/s), "lead-in sentence keeps its bullet list");
ok(p.duplicates === 1 && q(/Quality Plan as per SAES-1154\.$/)?.alsoAt.length === 1, "identical statement in two clauses merged, both locations kept");
ok(p.malformed.some((m) => m.raw === "SAES-1154"), "malformed reference reported with location");
ok(p.cites.some((c) => c.code === "SAES-M-006" && c.listed) && p.cites.some((c) => c.code === "SAES-M-006" && !c.listed), "citation in §3 marked as listed, body citation as not listed");
const qi = quoteIndex(p);
ok(qi.check("Fencing shall be as per SAES-M-006 and the Contractor shall provide gates.", "SOW.pdf", 2).ok, "real quote verified against its page");
ok(!qi.check("Fencing shall be as per SAES-M-007 and the Contractor shall provide gates.", "SOW.pdf", 2).ok, "altered quote (different standard number) rejected");
ok(qi.check("the camp shall comply with SAES-P-113", "SOW.pdf", 2).ok, "quote tolerant of line wrap / punctuation only");

// ---- consistency checks
const reg = (code: string, extra: Partial<RegistryItem> = {}): RegistryItem => ({ code, kind: "industry", status: "outside-library-scope", citations: [{ page: 3, section: "2.3.1", listed: false }], listedInSection6: false, titleInTender: "", libraryName: null, libraryYear: null, revisions: [], ...extra });
const issues = consistencyChecks(p, [reg("ASCE-7-05"), reg("ASCE-7-10", { listedInSection6: true })], { version: 1, rows: 1, indexedAt: "", files: 1, standardFiles: 1, codedStandards: 1 }, 0);
ok(issues.some((i) => i.kind === "edition-conflict" && /ASCE 7/.test(i.title)), "ASCE 7-05 vs 7-10 reported as an edition conflict");
ok(issues.some((i) => i.kind === "malformed-code" && i.severity === "High"), "malformed code is a High finding");
ok(issues.some((i) => i.kind === "toc-missing-section" || i.kind === "toc-number-mismatch") === true, "table of contents compared with body headings");

// ---- OCR merge
const layer = ["/ or its Representative.", "CONTRACTOR shall mean the entity that is awarded the", "contract to perform the WORK set out in this Scope of Work."];
const ocrText = "z g g\n“COMPANY” shall mean Saudi Aramco and / or its Representative.\nHEEL “CONTRACTOR” or “TCF CONTRACTOR” shall mean the entity that is awarded the\ncontract to perform the WORK set out in this Scope of Work.\nSAUDI ARABIAN OIL COMPANY";
const vocab = new Set("company shall mean saudi aramco representative contractor entity awarded contract perform work scope".split(" "));
const m = mergePage(layer, ocrText, 77, vocab, ["SAUDI ARABIAN OIL COMPANY"]);
ok(m.lines.some((l) => l === OCR_MARK + "“COMPANY” shall mean Saudi Aramco and / or its Representative."), "OCR line that completes a partial text-layer line replaces it and is marked");
ok(m.lines.some((l) => l.startsWith(OCR_MARK) && /“TCF CONTRACTOR” shall mean/.test(l) && !/^.HEEL/.test(l)), "sidebar noise stripped from the start of an OCR line");
ok(m.lines.includes("contract to perform the WORK set out in this Scope of Work.") && !m.lines.some((l) => /ARABIAN OIL/.test(l)), "identical line keeps the accurate text-layer version; title block ignored");
ok(m.recovered === 2, `exactly the two lines the text layer lost were recovered (${m.recovered})`);
ok(!mergePage([], "g\nE\n:\ne §\n| s", 32, vocab, []).usable, "scanned page with low OCR confidence is unusable, not guessed");
ok(mergePage([], "LUP NO.: 104551\nThe validity of this permit will expire on June 30 2029.", 89, new Set(), []).lines[0] === OCR_MARK + "LUP NO.: 104551", "permit header line kept on scanned pages");
ok(boilerplateSet(Array.from({ length: 8 }, (_, i) => [`Doc No 690 Page ${i + 1}`, `unique line ${i} about topic ${"x".repeat(60)}`])).has("Doc No # Page #"), "title block with changing page number detected as boilerplate");

// ---- report score
const fake = (over: Record<string, unknown> = {}, findings = 100, approved = 0) => ({ version: 1, aiErrors: [] as string[], coverage: { pagesTotal: 100, pagesRead: 100, unreadablePages: [] as number[], statements: 100, judged: findings, duplicatesMerged: 0, ocrRecoveredLines: 0, codesCited: 10, codesVerified: 10 }, stats: { conforms: 50, conflicts: 10, notCovered: 40, failedChecks: 0, judgeFailed: 0, aiStatementsDropped: 0, aiCalls: 5, seconds: 1 }, findings: Array.from({ length: findings }, (_, i) => ({ id: `F${i}`, ruleId: "r" })), registry: Array.from({ length: 10 }, () => ({ kind: "aramco-standard" })), approvals: Object.fromEntries(Array.from({ length: approved }, (_, i) => [`F${i}`, {}])), ...over }) as never;
const allOut = { facts: true, recommendation: true, risks: true, clarifications: true, contractTerms: true };
const top = reportScore(fake({}, 100, 100), allOut, { requirementsReviewed: 100, requirementsTotal: 100 });
ok(top.score >= 95 && top.grade === "A" && top.limits.length === 0, `complete, fully reviewed report scores A (${top.score})`);
const aiDown = reportScore(fake({ aiErrors: ["a", "b", "c", "d"] }, 0), { facts: false, recommendation: false, risks: false, clarifications: true, contractTerms: true }, { requirementsReviewed: 0, requirementsTotal: 100 });
ok(aiDown.score < 50 && aiDown.limits.some((l) => /AI step/.test(l)), `report where every AI step failed cannot score well (${aiDown.score}) and says why`);
const holes = reportScore(fake({ coverage: { pagesTotal: 98, pagesRead: 87, unreadablePages: [88, 89], statements: 100, judged: 40, duplicatesMerged: 0, ocrRecoveredLines: 0, codesCited: 10, codesVerified: 3 } }, 40, 0), allOut, { requirementsReviewed: 0, requirementsTotal: 100 });
ok(holes.parts.find((p) => p.key === "coverage")!.score === Math.round((87 / 98) * 100) || Math.round(holes.parts[0].score) === 89, "coverage part = pages read / pages total");
ok(holes.limits.some((l) => /could not be read/.test(l)) && holes.limits.some((l) => /unreviewed/.test(l)) && holes.limits.some((l) => /Master Library/.test(l)), "limits name unreadable pages, missing review and library gaps");
ok(top.score > holes.score && holes.score > aiDown.score, "score orders: complete > partial > AI-failed");

console.log(bad ? `\nVERIFIED-PIPELINE TESTS FAILED — ${bad} of ${n}` : `\nVERIFIED-PIPELINE PASSED — ${n} checks`);
process.exit(bad ? 1 : 0);
