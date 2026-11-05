/**
 * Step 1–2 of the verified pipeline — deterministic, no AI.
 * Splits tender text into pages and numbered clauses, extracts every normative statement ("shall"/"must"…)
 * verbatim with its page and clause number, and collects every cited standard code with its location.
 */
import { findCodes, findMalformed, normDashes, type CodeKind } from "./codes";
import { OCR_MARK } from "./ocr-merge";

export interface DocPage { doc: string; page: number; lines: string[]; rawChars: number; readable: boolean; }
export interface Clause { id: string; doc: string; page: number; section: string; heading: string; chain: string; text: string; ocrKeys: string[]; marks: { offset: number; page: number }[]; }
export interface Statement {
  id: string; doc: string; page: number; section: string; heading: string; chain: string;
  quote: string; priority: "Must" | "Should" | "Could"; category: string; codes: string[]; alsoAt: { page: number; section: string }[]; ocr: boolean;
}
export interface CodeCite { code: string; kind: CodeKind; raw: string; doc: string; page: number; section: string; listed: boolean; title: string; }
export interface Malformed { raw: string; doc: string; page: number; section: string; }
export interface TocEntry { number: string; title: string; page: number; }
export interface Heading { number: string; title: string; page: number; doc: string; }
export interface Parsed {
  docs: { name: string; pages: DocPage[] }[]; clauses: Clause[]; statements: Statement[]; cites: CodeCite[]; malformed: Malformed[];
  toc: TocEntry[]; headings: Heading[]; unreadablePages: { doc: string; page: number }[]; boilerplateLines: number; duplicates: number;
}

/** OCR confuses 0/O, 5/S, 8/B inside standard numbers and drops hyphens; repair that on OCR-derived lines only. */
export function fixOcrCodes(line: string): string {
  return line
    .replace(/\b(SAES|SAEP|SAEHC)[-\s]?([A-Z0-9])[-\s]?([0-9OolI]{1,4}[A-Z]?)(?![A-Za-z0-9])/g, (_m, fam: string, l: string, d: string) => {
      const letter = fam === "SAEP" ? "" : ({ "0": "O", "5": "S", "8": "B" } as Record<string, string>)[l] || l;
      const digits = d.replace(/[Oo]/g, "0").replace(/[lI]/g, "1");
      return fam === "SAEP" ? `${fam}-${l}${digits}` : `${fam}-${letter}-${digits}`;
    });
}

/** Lowercase alphanumerics only — makes quote checks immune to line wraps, bullets, hyphen variants and spacing. */
export const alnum = (s: string) => normDashes(s).toLowerCase().replace(/[^a-z0-9]+/g, "");

const mask = (l: string) => l.replace(/\d+/g, "#");

export function parseDocuments(raw: string): { docs: { name: string; pages: DocPage[] }[]; boilerplateLines: number } {
  const parts = raw.split(/^={3,}\s*DOCUMENT:\s*(.+?)\s*={3,}\s*$/m);
  const named: { name: string; body: string }[] = [];
  if (parts.length === 1) named.push({ name: "document", body: raw });
  else for (let i = 1; i < parts.length; i += 2) named.push({ name: parts[i], body: parts[i + 1] || "" });
  let boiler = 0;
  const docs = named.map(({ name, body }) => {
    const chunks = body.split(/\[\[PAGE (\d+)\]\]/);
    const pages: DocPage[] = [];
    if (chunks.length === 1) pages.push({ doc: name, page: 1, lines: chunks[0].split("\n").map((l) => l.trim()).filter(Boolean), rawChars: chunks[0].trim().length, readable: chunks[0].trim().length > 100 });
    else for (let i = 1; i < chunks.length; i += 2) {
      const lines = (chunks[i + 1] || "").split("\n").map((l) => l.trim()).filter(Boolean);
      const rawChars = lines.join(" ").length;
      pages.push({ doc: name, page: Number(chunks[i]), lines, rawChars, readable: rawChars >= 100 });
    }
    // lines that recur (digits masked) on at least half of the readable pages are title blocks / headers / footers
    const rp = pages.filter((p) => p.readable);
    if (rp.length >= 6) {
      const count = new Map<string, number>();
      for (const p of rp) for (const l of new Set(p.lines.map(mask))) count.set(l, (count.get(l) || 0) + 1);
      const drop = new Set([...count].filter(([, c]) => c >= rp.length * 0.5).map(([l]) => l));
      for (const p of pages) { const kept = p.lines.filter((l) => !drop.has(mask(l))); boiler += p.lines.length - kept.length; p.lines = kept; }
    }
    // a page is readable when real text is left once title blocks are gone (a short "END OF SCOPE" page is fine; a drawing sheet with only a title block is not)
    for (const p of pages) p.readable = p.rawChars > 0 && p.lines.join(" ").replace(/\uE000/g, "").length >= 20;
    return { name, pages };
  });
  return { docs, boilerplateLines: boiler };
}

const NUM = /^(\d{1,2}(?:\.\d{1,3}){0,5})\.?\s+(\S.*)$/;
const BULLET = /^([•●▪■‣–\-*]||)\s*/;
const SENT_BREAK = /(?<=[.;])\s+(?=[A-Z(“"0-9])|\s‣\s/;
const NORMATIVE = /\b(shall|must|is required to|are required to|will be responsible|is responsible for|are responsible for|should)\b/i;

const upperRatio = (s: string) => { const l = s.replace(/[^A-Za-z]/g, ""); return l ? l.replace(/[^A-Z]/g, "").length / l.length : 0; };

/** clauses under a top-level heading such as "6. CODES, STANDARDS AND SPECIFICATIONS" are reference lists, not obligations */
const isListClause = (c: { chain: string; heading: string }) => /\b(codes|standards|references)\b/i.test(c.chain.split(" › ")[0] || c.heading);

export function categoryOf(chain: string, text: string): string {
  const t = text.toLowerCase(), c = chain.toLowerCase();
  const has = (re: RegExp) => re.test(t);
  if (has(/\bwarrant/)) return "Warranty";
  if (has(/\binsurance\b/)) return "Insurance";
  if (has(/\bIKTVA\b|local content/i)) return "Local content";
  if (has(/\b(permits?|licen[cs]es?|land use permit|governmental authori[sz]ations?)\b/) && !has(/work permit|permit to work/)) return "Licensing";
  if (has(/\b(key personnel|curricul|cvs?\b|qa\/qc manager|specialist|competent|bicsi|certified engineer)/)) return "Personnel";
  if (has(/\b(certif(?:ied|ication)|approved training|regulated vendor|rvl)\b/)) return "Certification";
  if (has(/\b(safety|hazard|hazid|ppe\b|permit to work|work permit|incident|emergency response|toolbox|hsse|first.aid|lockout)\b/) || /health, safety/.test(c)) return "HSE";
  if (has(/\b(environment|wastewater|waste\b|dust\b|noise|spill|ecolog|landfill|hazardous waste)\b/)) return "Environmental";
  if (has(/\b(quality|qa\/qc|inspection|test(?:ing)? (?:plan|procedure|report)|itp\b|hold point)\b/)) return "Quality";
  if (has(/\b(milestone|schedule|programme|within \d+ days|no later than|prior to (?:the )?(?:start|commenc))/)) return "Schedule";
  if (has(/\b(security|guardhouse|guard house|access control|cctv|surveillance)\b/) && /security/.test(c)) return "Security";
  if (has(/\b(as-built|record|submit .*(?:plan|report|drawing|manual|procedure|schedule|documentation)|deliverable|document)/)) return "Administrative";
  if (has(/\b(procure|vendor|supplier|subcontract|spare parts|materials?)\b/)) return "Material";
  if (has(/\b(law|regulation|statutory|governmental|ministry|authority)\b/)) return "Legal";
  if (/land use permit/.test(c)) return "Licensing";
  if (has(/\b(saes|saep|samss|nfpa|sbc|iecc|ashrae|astm|aci|asce|aws|code|standard)\b/)) return "Compliance";
  if (/(civil|structur|mechanic|process|electric|telecom|control|instrument|coating|paint|architect)/.test(c)) return "Technical";
  return "Technical";
}

export function parseTender(raw: string): Parsed {
  const { docs, boilerplateLines } = parseDocuments(raw);
  const clauses: Clause[] = [], cites: CodeCite[] = [], malformed: Malformed[] = [], headings: Heading[] = [], toc: TocEntry[] = [];
  const unreadablePages: { doc: string; page: number }[] = [];

  for (const d of docs) {
    let cur: Clause | null = null; let topNo = 0; const chain: Record<number, string> = {}; let seq = 0;
    const flush = () => { if (cur && cur.text.trim()) clauses.push(cur); cur = null; };
    const tocPages = new Set<number>();
    for (const p of d.pages) {
      if (!p.readable) { unreadablePages.push({ doc: d.name, page: p.page }); continue; }
      const txt = p.lines.join("\n");
      const numbered = p.lines.filter((l) => /^\d{1,2}(\.\d{1,2})*\.?\s+.+\s\d{1,3}$/.test(l)).length;
      if (/TABLE OF CONTENTS/i.test(txt) || (numbered >= 8 && numbered >= p.lines.length * 0.5)) tocPages.add(p.page);
    }
    for (const p of d.pages) {
      if (!p.readable) continue;
      if (tocPages.has(p.page)) {
        for (const l of p.lines) { const m = /^(\d{1,2}(?:\.\d{1,2})*)\.?\s+(.+?)\s+(\d{1,3})$/.exec(l); if (m) toc.push({ number: m[1], title: m[2].trim(), page: Number(m[3]) }); }
        continue;
      }
      for (let li = 0; li < p.lines.length; li++) {
        const rawLine = p.lines[li]; const nextLine = (p.lines[li + 1] || "").replace(OCR_MARK, "");
        const isOcr = rawLine.startsWith(OCR_MARK); const line = isOcr ? fixOcrCodes(rawLine.slice(1)) : rawLine;
        const lup = /^LUP\s*NO\.?:?\s*(\d{4,7})/i.exec(line);
        if (lup) { // each scanned land-use-permit letter is its own section
          flush(); topNo = 0; for (const k of Object.keys(chain)) delete chain[Number(k)];
          cur = { id: `c${++seq}-${d.name.length}`, doc: d.name, page: p.page, section: `LUP-${lup[1]}`, heading: `Land Use Permit ${lup[1]} — approval conditions`, chain: `Land Use Permit ${lup[1]}`, text: line, ocrKeys: isOcr ? [alnum(line)] : [], marks: [{ offset: 0, page: p.page }] };
          continue;
        }
        const m = NUM.exec(normDashes(line));
        let isClause = false;
        if (m) {
          const no = m[1]; const parts = no.split(".").map(Number); const top = parts[0];
          const depth = parts.length;
          const titleLike = m[2].length < 90 && !/[.;,]$/.test(m[2]);
          if (depth === 1) isClause = top <= 14 && (top === topNo || top === topNo + 1 || topNo === 0) && upperRatio(m[2]) > 0.7 && titleLike;
          else isClause = top <= 14 && (top === topNo || top === topNo + 1) && parts.slice(1).every((x) => x < 100);
          if (isClause) {
            flush(); topNo = top;
            const isHeading = titleLike && depth <= 4 && /^[A-Z(]/.test(m[2]) && m[2].split(" ").length <= 8 && !/\b(shall|must|should)\b/i.test(m[2]) && !/\b(of|and|the|to|for|with|in|on|a|an|by|during|per|or|as)$/i.test(m[2]) && !/^[a-z]/.test(nextLine);
            if (isHeading) { chain[depth] = `${no} ${m[2].trim()}`; for (const k of Object.keys(chain)) if (Number(k) > depth) delete chain[Number(k)]; headings.push({ number: no, title: m[2].trim(), page: p.page, doc: d.name }); }
            cur = { id: `c${++seq}-${d.name.length}`, doc: d.name, page: p.page, section: no, heading: isHeading ? m[2].trim() : (Object.values(chain).slice(-1)[0] || ""), chain: Object.values(chain).join(" › "), text: isHeading ? "" : m[2], ocrKeys: isOcr ? [alnum(line)] : [], marks: [{ offset: 0, page: p.page }] };
            continue;
          }
        }
        if (!cur) cur = { id: `c${++seq}-${d.name.length}`, doc: d.name, page: p.page, section: "0", heading: "", chain: "", text: "", ocrKeys: [], marks: [{ offset: 0, page: p.page }] };
        const bullet = BULLET.test(line) || /^(\(?[a-z]|[ivx]{1,4})[.)]\s+\S/.test(line) && /^[a-z]\.\s|^\([a-z]\)/.test(line);
        if (isOcr) cur.ocrKeys.push(alnum(line));
        const glue = /[A-Za-z0-9]-$/.test(cur.text) && /^[A-Za-z0-9]/.test(line) ? "" : (cur.text ? (bullet ? " ‣ " : " ") : ""); // "SAES-P-" + "113" is one code
        if (cur.marks[cur.marks.length - 1].page !== p.page) cur.marks.push({ offset: cur.text.length + glue.length, page: p.page });
        cur.text += glue + line.replace(BULLET, "");
      }
    }
    flush();
  }

  // citations and malformed codes, located by page + clause
  const pageAt = (c: Clause, offset: number) => { let pg = c.marks[0]?.page ?? c.page; for (const m of c.marks) if (m.offset <= offset) pg = m.page; return pg; };
  for (const c of clauses) {
    const inList = isListClause(c);
    for (const f of findCodes(c.text)) {
      const after = c.text.slice(f.index + f.raw.length, f.index + f.raw.length + 90).split(/ ‣ |\.\s/)[0];
      cites.push({ code: f.code, kind: f.kind, raw: f.raw, doc: c.doc, page: pageAt(c, f.index), section: c.section, listed: inList, title: inList ? after.replace(/^[\s,:\-–]+/, "").trim() : "" });
    }
    for (const m of findMalformed(c.text)) { if (c.ocrKeys.some((k) => k.includes(alnum(m.raw)))) continue; /* OCR noise is not a tender typo */
      if (/^\s+series\b/i.test(c.text.slice(m.index + m.raw.length, m.index + m.raw.length + 12))) continue; /* "SAES-O series" is a family reference, not a typo */ malformed.push({ raw: m.raw, doc: c.doc, page: pageAt(c, m.index), section: c.section }); }
  }

  // normative statements, verbatim
  const statements: Statement[] = []; const seen = new Map<string, Statement>(); let duplicates = 0; let n = 0;
  for (const c of clauses) {
    if (isListClause(c) && !/\b(shall|must)\b/i.test(c.text.slice(0, 300))) continue; // standards lists are handled by the registry
    const sents = c.text.split(SENT_BREAK).map((s) => s.trim()).filter(Boolean);
    const starts: number[] = []; { let pos = 0; for (const x of sents) { const at = c.text.indexOf(x, pos); starts.push(at < 0 ? pos : at); pos = (at < 0 ? pos : at) + x.length; } }
    for (let i = 0; i < sents.length; i++) {
      let s = sents[i]; const startOffset = starts[i];
      if (!NORMATIVE.test(s) || s.length < 25) continue;
      if (/:$/.test(s)) { // a lead-in sentence followed by list items: keep the list with it
        let j = i + 1; while (j < sents.length && s.length < 600 && !NORMATIVE.test(sents[j])) s += " ‣ " + sents[j++];
        i = j - 1;
      }
      const quote = s.slice(0, 700);
      const key = alnum(quote);
      const prev = seen.get(key);
      const page = pageAt(c, startOffset);
      if (prev) { prev.alsoAt.push({ page, section: c.section }); duplicates++; continue; }
      const priority: Statement["priority"] = /\b(shall|must|is required to|are required to|will be responsible|is responsible for|are responsible for)\b/i.test(s) ? "Must" : "Should";
      const st: Statement = { id: `S${++n}`, doc: c.doc, page, section: c.section, heading: c.heading, chain: c.chain, quote, priority, category: categoryOf(c.chain, quote), codes: [...new Set(findCodes(quote).map((x) => x.code))], alsoAt: [], ocr: c.ocrKeys.some((k) => key.includes(k.slice(0, 40))) };
      seen.set(key, st); statements.push(st);
    }
  }
  return { docs, clauses, statements, cites, malformed, toc, headings, unreadablePages, boilerplateLines, duplicates };
}

/** Page-indexed lookup used to prove that every quote exists in the source. */
export function quoteIndex(parsed: Parsed) {
  const byPage = new Map<string, string>(); const byDoc = new Map<string, string>();
  for (const d of parsed.docs) for (const p of d.pages) { const a = alnum(p.lines.join(" ")); byPage.set(`${d.name}|${p.page}`, a); byDoc.set(d.name, (byDoc.get(d.name) || "") + a); }
  return {
    /** exact (alphanumeric-normalised) match on the claimed page; falls back to the whole document and reports the real page */
    check(quote: string, doc: string, page: number): { ok: boolean; page: number | null } {
      const q = alnum(quote); if (q.length < 12) return { ok: false, page: null };
      if ((byPage.get(`${doc}|${page}`) || "").includes(q)) return { ok: true, page };
      for (const d of parsed.docs) for (const p of d.pages) if ((byPage.get(`${d.name}|${p.page}`) || "").includes(q)) return { ok: true, page: p.page };
      for (const [, all] of byDoc) if (all.includes(q)) return { ok: true, page };
      return { ok: false, page: null };
    },
  };
}
