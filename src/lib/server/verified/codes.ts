/**
 * Standard / document code recognition shared by the library index. The tender-side copy lives in
 * src/lib/server/verified/codes.ts and MUST stay identical (a cross-check script compares them).
 */
export type CodeKind = "aramco-standard" | "aramco-procedure" | "aramco-material-spec" | "aramco-practice" | "aramco-health-code" | "aramco-general-instruction" | "aramco-other" | "sec-spec" | "project-doc" | "industry";

export interface FoundCode { raw: string; code: string; kind: CodeKind; index: number; }

export const normDashes = (s: string) => s.replace(/[‐-―−­]/g, "-").replace(/ /g, " ");

const FAMILIES: { kind: CodeKind; re: RegExp; canon: (m: RegExpExecArray) => string }[] = [
  { kind: "aramco-standard", re: /\bSAES-([A-Z])-(\d{3}[A-Z]?)(?![A-Za-z0-9])/g, canon: (m) => `SAES-${m[1]}-${m[2]}` },
  { kind: "aramco-procedure", re: /\bSAEP-(\d{1,4})(?![A-Za-z0-9])/g, canon: (m) => `SAEP-${m[1]}` },
  { kind: "aramco-material-spec", re: /\b(\d{2})-SAMSS-(\d{3}[A-Z]?)(?![A-Za-z0-9])/g, canon: (m) => `${m[1]}-SAMSS-${m[2]}` },
  { kind: "aramco-practice", re: /\bSABP-([A-Z])-(\d{3})(?![A-Za-z0-9])/g, canon: (m) => `SABP-${m[1]}-${m[2]}` },
  { kind: "aramco-health-code", re: /\bSAEHC-S-(\d{2}|XX)(?![A-Za-z0-9])/g, canon: (m) => `SAEHC-S-${m[1]}` },
  { kind: "aramco-other", re: /\b(\d{2})-SAIP-(\d{2}[A-Z]?)(?![A-Za-z0-9])/g, canon: (m) => `${m[1]}-SAIP-${m[2]}` },
  { kind: "sec-spec", re: /\b(\d{2})-SDMS-(\d{2})(?![A-Za-z0-9])/g, canon: (m) => `${m[1]}-SDMS-${m[2]}` },
  { kind: "aramco-general-instruction", re: /\bG\.?\s?I\.?[-\s]?(\d{1,4})[.\-](\d{3})(?![0-9])/g, canon: (m) => `GI-${parseInt(m[1], 10)}.${m[2]}` },
  { kind: "project-doc", re: /\b([A-Z0-9]{3})-([A-Z])-(TD|MS)-(\d{6})(?:-(\d{3}))?(?![A-Za-z0-9])/g, canon: (m) => `${m[1]}-${m[2]}-${m[3]}-${m[4]}${m[5] ? "-" + m[5] : ""}` },
  { kind: "industry", re: /\bNFPA[-\s]?(\d{1,3}[A-Z]?)(?![A-Za-z0-9])/g, canon: (m) => `NFPA-${m[1]}` },
  { kind: "industry", re: /\bASCE[-\s]?(\d{1,2})(?:-(\d{2}))?(?![A-Za-z0-9])/g, canon: (m) => `ASCE-${m[1]}${m[2] ? "-" + m[2] : ""}` },
  { kind: "industry", re: /\bACI[-\s]?(\d{3})(?![A-Za-z0-9])/g, canon: (m) => `ACI-${m[1]}` },
  { kind: "industry", re: /\bAWS[-\s]?D\s?(\d)\.(\d)(?![0-9])/g, canon: (m) => `AWS-D${m[1]}.${m[2]}` },
  { kind: "industry", re: /\bASTM[-\s]?([A-Z])\s?(\d{2,4})(?![0-9])/g, canon: (m) => `ASTM-${m[1]}${m[2]}` },
  { kind: "industry", re: /\bIBC[-\s]?(\d{4})(?![0-9])/g, canon: (m) => `IBC-${m[1]}` },
  { kind: "industry", re: /\bIFC[-\s]?(\d{4})(?![0-9])/g, canon: (m) => `IFC-${m[1]}` },
  { kind: "industry", re: /\bSBC[-\s]?(\d{3,4})(?![0-9])/g, canon: (m) => `SBC-${m[1]}` },
  { kind: "industry", re: /\bSASO[-\s]?(\d{3,5})(?![0-9])/g, canon: (m) => `SASO-${m[1]}` },
  { kind: "industry", re: /\bUL[-\s](\d{2,4}[A-Z]?)(?![A-Za-z0-9])/g, canon: (m) => `UL-${m[1]}` },
  { kind: "industry", re: /\bASHRAE[-\s]?(\d{2,3}(?:\.\d)?)(?![0-9])/g, canon: (m) => `ASHRAE-${m[1]}` },
  { kind: "industry", re: /\bISO[-\s]?(\d{4,5})(?![0-9])/g, canon: (m) => `ISO-${m[1]}` },
  { kind: "industry", re: /\bAPI[-\s]?(\d{3,4})(?![0-9])/g, canon: (m) => `API-${m[1]}` },
];

/** Every recognised code in `text`, in order of appearance (after dash/underscore normalisation). */
export function findCodes(text: string): FoundCode[] {
  const t = normDashes(text).replace(/_/g, " ");
  const out: FoundCode[] = [];
  for (const f of FAMILIES) {
    f.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = f.re.exec(t))) out.push({ raw: m[0], code: f.canon(m), kind: f.kind, index: m.index });
  }
  // an overlapping shorter match (e.g. "ASCE 7" inside "ASCE 7-05") is not a separate citation
  out.sort((a, b) => a.index - b.index);
  return out.filter((c, i) => !out.some((o, j) => j !== i && o.index <= c.index && o.index + o.raw.length >= c.index + c.raw.length && o.raw.length > c.raw.length));
}

/** Aramco-style references that look like a standard code but do not match the strict format (likely typos). */
export function findMalformed(text: string): { raw: string; index: number }[] {
  const t = normDashes(text).replace(/_/g, " ");
  const strict = new Set(findCodes(text).map((c) => c.index));
  const out: { raw: string; index: number }[] = [];
  const loose = /\b(?:\d{2}-)?(?:SAES|SAEP|SAMSS|AMSS|SABP|SAEHC)(?:-[A-Z0-9]{1,5}){1,3}(?![A-Za-z0-9])/g;
  let m: RegExpExecArray | null;
  while ((m = loose.exec(t))) {
    const ok = [...strict].some((i) => Math.abs(i - m!.index) <= 1);
    if (!ok && !/^SAEHC-S-XX$/.test(m[0])) out.push({ raw: m[0], index: m.index });
  }
  return out;
}

/** First code of a library file name ("SAES-B-017_-_OfficialPDF" → SAES-B-017), or null. */
export function codeOfName(name: string): { code: string; kind: CodeKind } | null {
  const f = findCodes(name)[0];
  return f ? { code: f.code, kind: f.kind } : null;
}

/** Revision year / letter parsed from a library file name, e.g. "(02-July-2019)", "dtd 01 Jan 2017", "_REV C". */
export function revisionOfName(name: string): { year: number | null; rev: string | null } {
  const t = normDashes(name).replace(/_/g, " ");
  const codes = findCodes(name);
  let rest = t;
  for (const c of codes) rest = rest.replace(c.raw, " ");
  const years = [...rest.matchAll(/(?<![0-9])((?:19|20)\d{2})(?![0-9])/g)].map((m) => Number(m[1]));
  const rev = /\bREV\.?\s?([A-Z0-9])\b/i.exec(rest);
  return { year: years.length ? Math.max(...years) : null, rev: rev ? rev[1].toUpperCase() : null };
}

/** project-doc codes match on 3-letter-prefix + discipline + 6-digit number, ignoring the sheet suffix. */
export const projectKey = (code: string) => code.replace(/-\d{3}$/, "");
