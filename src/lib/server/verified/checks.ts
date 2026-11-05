/**
 * Step 5 (code, not AI) — library verification of every cited standard, and internal-consistency checks.
 * Nothing here calls a model; every finding states exactly where it was found.
 */
import { STANDARDS_API } from "./extract";
import { serviceHeaders } from "../guard";
import type { CodeCite, Parsed } from "./structure";
import type { CodeKind } from "./codes";
import { alnum } from "./structure";

export type RegistryStatus = "verified-in-library" | "not-in-library" | "outside-library-scope" | "project-doc-provided" | "project-doc-missing";
export interface RegistryItem {
  code: string; kind: CodeKind; status: RegistryStatus; citations: { page: number; section: string; listed: boolean }[];
  listedInSection6: boolean; titleInTender: string; libraryName: string | null; libraryYear: number | null; revisions: { name: string; year: number | null; active: boolean }[];
}
export interface Issue { id: string; kind: string; severity: "High" | "Medium" | "Low" | "Info"; title: string; detail: string; pages: number[]; items?: string[]; }
export interface LibraryInfo { version: number; rows: number; indexedAt: string; files: number; standardFiles: number; codedStandards: number; unavailable?: string; }

const post = async <T>(path: string, body: unknown, ms = 120_000): Promise<T> => {
  const res = await fetch(`${STANDARDS_API}/api/standards/v${path}`, { method: "POST", headers: { "content-type": "application/json", ...serviceHeaders() }, body: JSON.stringify(body), signal: AbortSignal.timeout(ms) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.success === false) throw new Error(j.error || `library HTTP ${res.status}`);
  return j as T;
};

export async function libraryInfo(): Promise<LibraryInfo> {
  try {
    const res = await fetch(`${STANDARDS_API}/api/standards/v/library-info`, { headers: serviceHeaders(), signal: AbortSignal.timeout(60_000) });
    const j = await res.json();
    if (!res.ok || !j.success) throw new Error(j.error || `HTTP ${res.status}`);
    return j as LibraryInfo;
  } catch (e) { return { version: 0, rows: 0, indexedAt: "", files: 0, standardFiles: 0, codedStandards: 0, unavailable: e instanceof Error ? e.message : "library unreachable" }; }
}

const LIBRARY_KINDS = new Set<CodeKind>(["aramco-standard", "aramco-procedure", "aramco-material-spec", "aramco-practice", "aramco-health-code", "aramco-general-instruction", "aramco-other", "project-doc"]);

export async function buildRegistry(parsed: Parsed, lib: LibraryInfo): Promise<{ registry: RegistryItem[]; byCode: Map<string, RegistryItem> }> {
  const by = new Map<string, CodeCite[]>();
  for (const c of parsed.cites) (by.get(c.code) || by.set(c.code, []).get(c.code)!).push(c);
  const codes = [...by.keys()];
  const toCheck = codes.filter((c) => LIBRARY_KINDS.has(by.get(c)![0].kind));
  let found = new Map<string, { found: boolean; entries: { name: string; year: number | null; active: boolean; folder: string }[]; activeName: string | null; activeYear: number | null; folder: string | null }>();
  if (!lib.unavailable && toCheck.length) {
    const r = await post<{ results: { code: string; found: boolean; entries: { name: string; year: number | null; active: boolean; folder: string }[]; activeName: string | null; activeYear: number | null; folder: string | null }[] }>("/codes", { codes: toCheck });
    found = new Map(r.results.map((x) => [x.code, x]));
  }
  const registry: RegistryItem[] = codes.map((code) => {
    const cites = by.get(code)!; const kind = cites[0].kind; const f = found.get(code);
    let status: RegistryStatus;
    if (!LIBRARY_KINDS.has(kind)) status = "outside-library-scope";
    else if (kind === "project-doc") status = f?.found ? "project-doc-provided" : "project-doc-missing";
    else status = f?.found ? "verified-in-library" : "not-in-library";
    if (lib.unavailable && LIBRARY_KINDS.has(kind)) status = kind === "project-doc" ? "project-doc-missing" : "not-in-library";
    return {
      code, kind, status,
      citations: cites.map((c) => ({ page: c.page, section: c.section, listed: c.listed })),
      listedInSection6: cites.some((c) => c.listed),
      titleInTender: cites.find((c) => c.title)?.title || "",
      libraryName: f?.activeName ?? null, libraryYear: f?.activeYear ?? null, revisions: (f?.entries || []).map((e) => ({ name: e.name, year: e.year, active: e.active })),
    };
  }).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  return { registry, byCode: new Map(registry.map((r) => [r.code, r])) };
}

const uniq = <T,>(a: T[]) => [...new Set(a)];
const pagesOf = (r: RegistryItem) => uniq(r.citations.map((c) => c.page)).sort((a, b) => a - b);
let n = 0; const iid = () => `I${++n}`;

export function consistencyChecks(parsed: Parsed, registry: RegistryItem[], lib: LibraryInfo, ocrRecovered: number): Issue[] {
  n = 0; const out: Issue[] = [];

  // unreadable pages
  if (parsed.unreadablePages.length) {
    const p = parsed.unreadablePages.map((x) => x.page);
    out.push({ id: iid(), kind: "unreadable-pages", severity: "High", title: `${p.length} page(s) could not be read`, detail: `Pages ${ranges(p)} have no text layer and OCR could not read them reliably (drawings, maps, rotated sheets). Their content is NOT part of this analysis — review them manually.`, pages: p });
  }
  if (ocrRecovered) out.push({ id: iid(), kind: "ocr-recovered", severity: "Info", title: `${ocrRecovered} line(s) recovered by OCR`, detail: "The PDF text layer omitted these lines (typically bold defined terms and scanned pages). They were recovered by OCR and are marked as OCR-derived — verify them against the page image.", pages: [] });

  // codes that do not match the strict code formats (typos)
  const mal = new Map<string, number[]>();
  for (const m of parsed.malformed) (mal.get(m.raw) || mal.set(m.raw, []).get(m.raw)!).push(m.page);
  for (const [raw, pages] of mal) out.push({ id: iid(), kind: "malformed-code", severity: "High", title: `Malformed standard reference "${raw}"`, detail: `"${raw}" does not match any valid standard number format (e.g. SAES-H-101V, SAEP-1154, 09-SAMSS-060). It is likely a typo, so the intended standard is ambiguous.`, pages: uniq(pages) });

  // same standard cited with different editions
  const base = new Map<string, RegistryItem[]>();
  for (const r of registry) { const m = /^(ASCE-\d+|IBC|IFC|NFPA-\d+[A-Z]?|ASHRAE-[\d.]+|ACI-\d+)(?:-(\d{2}|\d{4}))?$/.exec(r.code); if (m && m[2]) (base.get(m[1]) || base.set(m[1], []).get(m[1])!).push(r); }
  for (const [b, list] of base) if (list.length > 1) out.push({ id: iid(), kind: "edition-conflict", severity: "High", title: `${b.replace("-", " ")} cited with different editions`, detail: `${list.map((r) => `${r.code} (p.${pagesOf(r).join(", ")})`).join(" vs ")}. The governing edition is ambiguous.`, pages: uniq(list.flatMap(pagesOf)) });

  // cited in the body but not listed in section 6
  const unlisted = registry.filter((r) => !r.listedInSection6 && r.kind !== "project-doc" && parsed.cites.some((c) => c.code === r.code));
  if (parsed.cites.some((c) => c.listed) && unlisted.length) out.push({ id: iid(), kind: "unlisted-standard", severity: "Medium", title: `${unlisted.length} standard(s) cited in the text but not listed in Section 6`, detail: "Section 6 says the listed standards apply; these are referenced in the body without being listed, so it is unclear whether they are binding. Confirm with the client.", pages: uniq(unlisted.flatMap(pagesOf)), items: unlisted.map((r) => `${r.code} (p.${pagesOf(r).join(", ")})`) });

  // listed in section 6 but never referenced anywhere else is normal; listed twice with the same code but different titles:
  const titles = new Map<string, Set<string>>();
  for (const c of parsed.cites) if (c.listed && c.title) (titles.get(c.code) || titles.set(c.code, new Set()).get(c.code)!).add(c.title.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim());
  for (const [code, t] of titles) if (t.size > 1 && alnumSimilar([...t])) out.push({ id: iid(), kind: "duplicate-listing", severity: "Low", title: `${code} listed more than once`, detail: `Listed with ${t.size} wordings in Section 6 (${[...t].join(" | ")}).`, pages: pagesOf(registry.find((r) => r.code === code)!) });

  // table of contents vs body
  const norm = (s: string) => alnum(s);
  const bodyByTitle = new Map(parsed.headings.map((h) => [norm(h.title), h]));
  const tocByTitle = new Map(parsed.toc.map((t) => [norm(t.title), t]));
  const shifted: string[] = []; const missingInToc: string[] = []; const wrongPage: string[] = [];
  for (const t of parsed.toc) {
    const key = norm(t.title); const h = bodyByTitle.get(key) || [...bodyByTitle].find(([k]) => k.length > 7 && (k.endsWith(key) || key.endsWith(k)))?.[1];
    if (!h) continue;
    if (h.number.replace(/\.0$/, "") !== t.number.replace(/\.0$/, "")) shifted.push(`"${t.title}": TOC ${t.number} vs body ${h.number}`);
    if (Math.abs(h.page - t.page) > 0 && h.page !== t.page) wrongPage.push(`"${t.title}": TOC p.${t.page} vs actual p.${h.page}`);
  }
  for (const h of parsed.headings) if (h.number.split(".").length <= 2 && /^7\./.test(h.number) || /^\d+$/.test(h.number)) {
    const inToc = tocByTitle.has(norm(h.title)) || [...tocByTitle].some(([k]) => k.length > 7 && (k.endsWith(norm(h.title)) || norm(h.title).endsWith(k)));
    if (!inToc && h.title.length > 6 && parsed.toc.length) missingInToc.push(`${h.number} ${h.title} (p.${h.page})`);
  }
  if (missingInToc.length) out.push({ id: iid(), kind: "toc-missing-section", severity: "Medium", title: `${missingInToc.length} section(s) in the body are missing from the table of contents`, detail: `${missingInToc.join("; ")}. Section numbers after it are therefore offset between the table of contents and the body, so cross-references may point to the wrong section.`, pages: [], items: missingInToc });
  if (shifted.length) out.push({ id: iid(), kind: "toc-number-mismatch", severity: "Medium", title: `${shifted.length} table-of-contents section number(s) differ from the body`, detail: "The numbering in the table of contents does not match the numbering used in the document body.", pages: [], items: shifted });
  if (wrongPage.length) out.push({ id: iid(), kind: "toc-page-mismatch", severity: "Low", title: `${wrongPage.length} table-of-contents page number(s) are off`, detail: wrongPage.slice(0, 6).join("; "), pages: [], items: wrongPage });

  // duplicated statements
  if (parsed.duplicates) {
    const dups = parsed.statements.filter((s) => s.alsoAt.length);
    out.push({ id: iid(), kind: "duplicate-requirement", severity: "Low", title: `${dups.length} requirement(s) stated more than once`, detail: "Identical statements appear in several clauses; they were merged into one requirement that lists every location.", pages: uniq(dups.flatMap((d) => [d.page, ...d.alsoAt.map((a) => a.page)])), items: dups.map((d) => `§${d.section} p.${d.page} = ${d.alsoAt.map((a) => `§${a.section} p.${a.page}`).join(", ")}`) });
  }

  // cross-references to sections that do not exist
  const have = new Set([...parsed.headings.map((h) => h.number), ...parsed.clauses.map((c) => c.section)]);
  const missingRefs: string[] = [];
  for (const c of parsed.clauses) {
    const re = /\bSections?\s+(\d{1,2}(?:\.\d{1,3})*)((?:\s*(?:,|and|&)\s*\d{1,2}(?:\.\d{1,3})*)*)(?!\s*(?:of|in)\s+(?:SAES|SAEP|\d{2}-SAMSS|the (?:SAES|SBC)))/g; let m: RegExpExecArray | null;
    while ((m = re.exec(c.text))) {
      const after = c.text.slice(m.index + m[0].length, m.index + m[0].length + 40);
      if (/^\s*(?:of|in)\s+(?:the\s+)?(?:SAES|SAEP|SBC|\d{2}-SAMSS|ASHRAE|COMPANY|Saudi)/i.test(after) || /^\s*of\s+\d{2}-/.test(after)) continue;
      for (const num of [m[1], ...(m[2].match(/\d{1,2}(?:\.\d{1,3})*/g) || [])]) {
        const k = num.replace(/\.0$/, "");
        if (!have.has(k) && !have.has(num)) missingRefs.push(`Section ${num} (cited at §${c.section}, p.${c.page})`);
      }
    }
  }
  if (missingRefs.length) out.push({ id: iid(), kind: "dangling-section-reference", severity: "Low", title: `${uniq(missingRefs).length} reference(s) to a section that was not found`, detail: "The text refers to sections that do not exist as numbered headings in the readable pages.", pages: [], items: uniq(missingRefs) });

  // referenced project documents that are not supplied
  const missingDocs = registry.filter((r) => r.status === "project-doc-missing");
  if (missingDocs.length) out.push({ id: iid(), kind: "project-docs-missing", severity: "Medium", title: `${missingDocs.length} referenced project document(s) are not in the data provided`, detail: "The tender relies on these drawings/reports/specifications (numbers as cited). Obtain them before pricing — they can change scope.", pages: uniq(missingDocs.flatMap(pagesOf)), items: missingDocs.map((r) => `${r.code} (p.${pagesOf(r).join(", ")})`) });

  // library coverage
  const aramco = registry.filter((r) => /^aramco|^sec/.test(r.kind));
  const verified = aramco.filter((r) => r.status === "verified-in-library").length;
  const notIn = aramco.filter((r) => r.status === "not-in-library");
  if (!lib.unavailable && notIn.length) out.push({ id: iid(), kind: "library-gap", severity: "Medium", title: `${notIn.length} of ${aramco.length} cited Saudi Aramco references are not in the local library`, detail: `${verified} are in the library and verified. The others could not be checked — add them to the library (Master Library) to verify against the actual text.`, pages: [], items: notIn.map((r) => r.code) });
  const multi = registry.filter((r) => r.status === "verified-in-library" && r.revisions.length > 1);
  if (multi.length) out.push({ id: iid(), kind: "library-multiple-revisions", severity: "Info", title: `${multi.length} cited standard(s) exist in the library in several revisions`, detail: "The newest revision (by the year in its file name) was used; older revisions are never used as rules.", pages: [], items: multi.map((r) => `${r.code}: using ${r.libraryName}; also ${r.revisions.filter((x) => !x.active).map((x) => x.name).join(", ")}`) });
  if (lib.unavailable) out.push({ id: iid(), kind: "library-unavailable", severity: "High", title: "Standards library was not reachable", detail: `No standard could be verified: ${lib.unavailable}`, pages: [] });
  return out;
}

function alnumSimilar(t: string[]) { return t.every((x) => alnum(x).slice(0, 12) === alnum(t[0]).slice(0, 12)) === false; }
export function ranges(p: number[]): string {
  const s = [...p].sort((a, b) => a - b); const out: string[] = []; let a = s[0], b = s[0];
  for (let i = 1; i <= s.length; i++) { if (s[i] === b + 1) { b = s[i]; continue; } out.push(a === b ? `${a}` : `${a}–${b}`); a = b = s[i]; }
  return out.join(", ");
}

export { post as libraryPost };
