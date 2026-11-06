import { Router } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { embed } from "../embed.js";
import { codeOfName, revisionOfName, projectKey, type CodeKind } from "../codes.js";

/**
 * Library services for the verified tender-analysis pipeline:
 *   GET  /v/library-info   version + size of the standards library (stamped on every report)
 *   POST /v/codes          which cited codes exist in the library, which revision is active
 *   POST /v/retrieve       hybrid (vector + lexical + direct-citation) retrieval of rules per requirement
 *   POST /v/rules-check    re-reads the database to prove each cited rule id exists and is active
 */
export const verified = Router();

const STANDARDS_FOLDER = "Saudi Aramco Standards"; // project data ("DATA") is not a rulebook and must never be used as a rule

interface Entry { name: string; folder: string; rows: number; code: string | null; kind: CodeKind | null; year: number | null; rev: string | null; }
interface Index { entries: Entry[]; byCode: Map<string, Entry[]>; chosen: Map<string, Entry>; version: number; rows: number; at: string; }

let indexPromise: Promise<Index> | null = null;
let tablePromise: Promise<any> | null = null;

async function table() {
  if (!tablePromise) {
    tablePromise = (async () => {
      let lancedb: typeof import("@lancedb/lancedb");
      try { lancedb = await import("@lancedb/lancedb"); }
      catch (e: any) { throw new Error(`Standards library unavailable: LanceDB native module could not be loaded on ${process.platform}-${process.arch} (${e?.message?.split("\n")[0]})`); }
      const db = await lancedb.connect(path.join(process.cwd(), "data", "lancedb"));
      return db.openTable("standards");
    })();
    tablePromise.catch(() => { tablePromise = null; });
  }
  return tablePromise;
}

async function getIndex(): Promise<Index> {
  if (!indexPromise) {
    indexPromise = (async () => {
      const t = await table();
      const rows = (await t.query().select(["standardName", "folder"]).limit(2_000_000).toArray()) as { standardName: string; folder: string }[];
      const counts = new Map<string, Entry>();
      for (const r of rows) {
        const k = `${r.folder}\u0000${r.standardName}`;
        const e = counts.get(k);
        if (e) e.rows++;
        else {
          const c = codeOfName(r.standardName); const rev = revisionOfName(r.standardName);
          counts.set(k, { name: r.standardName, folder: r.folder, rows: 1, code: c?.code ?? null, kind: c?.kind ?? null, year: rev.year, rev: rev.rev });
        }
      }
      const entries = [...counts.values()];
      const byCode = new Map<string, Entry[]>();
      for (const e of entries) if (e.code) { const k = e.kind === "project-doc" ? projectKey(e.code) : e.code; (byCode.get(k) || byCode.set(k, []).get(k)!).push(e); }
      // active revision per code: newest year, else the most complete file
      const chosen = new Map<string, Entry>();
      for (const [code, list] of byCode) chosen.set(code, [...list].sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || b.rows - a.rows)[0]);
      const dir = path.join(process.cwd(), "data", "lancedb", "standards.lance", "_versions");
      let at = "";
      try { at = new Date(Math.max(...fs.readdirSync(dir).map((f) => fs.statSync(path.join(dir, f)).mtimeMs))).toISOString(); } catch { /* no manifests */ }
      return { entries, byCode, chosen, version: Number(await t.version()), rows: rows.length, at };
    })();
    indexPromise.catch(() => { indexPromise = null; });
  }
  return indexPromise;
}

const sqlStr = (s: string) => `'${s.replace(/'/g, "''")}'`;
const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const hash = (s: string) => crypto.createHash("sha1").update(norm(s)).digest("hex").slice(0, 12);
const keyOf = (code: string) => (/^[A-Z0-9]{3}-[A-Z]-(TD|MS)-\d{6}/.test(code) ? projectKey(code) : code);
export const ruleIdOf = (standardName: string, text: string) => `${standardName}#${hash(text)}`;

const STOP = new Set("shall will with that this from have been must such which their there shall under into than then also only other when where while these those each any all and for the are not may can its has had".split(" "));
/** cover pages, tables of contents, running headers and document-control blocks are not rules */
const isContent = (t: string) => {
  const w = t.split(" ").length; const letters = t.replace(/[^A-Za-z]/g, "").length;
  if (w < 9 || letters / t.length < 0.6) return false;
  if (/^(?:Page \d+ of \d+\s+)?(?:Saudi Aramco: Company General Use\s+)?(?:Copyright|Engineering (?:Standard|Procedure)\s+SAE[SP]-|COMPLETE REVISION|REQUISITION NO)/i.test(t) && !/\b(shall|must)\b/i.test(t.slice(0, 260))) return false;
  if (/Standards Committee Members|Next Planned Update|Revision Summary/i.test(t)) return false;
  if (/(Document Responsibility|Previous Issue|Next Planned Update|Issue Date|Revision Summary|Saudi Aramco: Company General Use|Contact:|Table of Contents|Engineering Standards? SAES-[A-Z]-\d+ .*Engineering Standards? SAES)/i.test(t) && !/\b(shall|must)\b/i.test(t)) return false;
  return (t.match(/\b(?:SAES|SAEP|SAMSS)-[A-Z0-9-]+/g) || []).length < 3; // a list of standard numbers is a contents page
};
const tokens = (s: string) => new Set(norm(s).toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(" ").filter((w) => w.length > 3 && !STOP.has(w)));

verified.get("/library-info", async (_req, res, next) => {
  try {
    const ix = await getIndex();
    const std = ix.entries.filter((e) => e.folder === STANDARDS_FOLDER);
    res.json({ success: true, version: ix.version, rows: ix.rows, indexedAt: ix.at, standardsFolder: STANDARDS_FOLDER, files: ix.entries.length, standardFiles: std.length, codedStandards: new Set(std.map((e) => e.code).filter(Boolean)).size });
  } catch (e) { next(e); }
});

verified.post("/codes", async (req, res, next) => {
  try {
    const codes: string[] = Array.isArray(req.body?.codes) ? req.body.codes.slice(0, 2000) : [];
    const ix = await getIndex();
    const out = codes.map((code) => {
      const list = ix.byCode.get(keyOf(code)) || [];
      const best = ix.chosen.get(keyOf(code));
      return {
        code, found: list.length > 0,
        entries: list.map((e) => ({ name: e.name, folder: e.folder, rows: e.rows, year: e.year, rev: e.rev, active: e === best })),
        activeName: best?.name ?? null, activeYear: best?.year ?? null, folder: best?.folder ?? null,
        multipleRevisions: list.length > 1,
      };
    });
    res.json({ success: true, results: out });
  } catch (e) { next(e); }
});

interface RetrieveItem { id: string; text: string; codes?: string[]; }

verified.post("/retrieve", async (req, res, next) => {
  try {
    const items: RetrieveItem[] = Array.isArray(req.body?.items) ? req.body.items.slice(0, 400) : [];
    const k = Math.min(6, Math.max(1, Number(req.body?.perItem) || 3));
    const minScore = Number(req.body?.minScore) || 0.42;
    const ix = await getIndex(); const t = await table();
    const activeNames = new Set([...ix.chosen.values()].map((e) => e.name));
    const results = [];
    for (const it of items) {
      const qv = await embed(it.text);
      const qTok = tokens(it.text);
      const found = new Map<string, any>();
      const add = (row: any, direct: boolean) => {
        const text = norm(String(row.text || ""));
        if (text.length < 80 || !isContent(text)) return;    // headers, covers and contents pages carry no requirement
        if (row.folder !== STANDARDS_FOLDER) return;         // project documents are never rules
        const e = ix.entries.find((x) => x.name === row.standardName && x.folder === row.folder);
        const code = e?.code ?? null;
        if (code && !activeNames.has(row.standardName)) return; // superseded revision of a coded standard
        const dist = Number(row._distance ?? 2);
        const cos = Math.max(0, Math.min(1, 1 - (dist * dist) / 2)); // normalized L2 distance converted to cosine
        const rTok = tokens(text); let hit = 0; for (const w of rTok) if (qTok.has(w)) hit++;
        const lex = rTok.size ? hit / Math.min(rTok.size, 25) : 0;
        const normative = /\b(shall|must|should|required|prohibited|not be permitted)\b/i.test(text) ? 0.08 : 0;
        const score = 0.65 * cos + 0.25 * Math.min(1, lex) + normative;
        if (!direct && cos < minScore) return;
        if (direct && cos < 0.3) return;
        const id = ruleIdOf(row.standardName, text);
        const prev = found.get(id);
        if (!prev || score > prev.score) found.set(id, { ruleId: id, standardName: row.standardName, code, text: text.slice(0, 520), fullLength: text.length, cosine: +cos.toFixed(3), lexical: +lex.toFixed(3), score: +score.toFixed(3), direct: direct || !!prev?.direct });
      };
      // 1) rules from standards the tender itself cites (direct citation) — searched inside those standards only
      const cited = (it.codes || []).map((c) => ix.chosen.get(keyOf(c))).filter((e): e is Entry => !!e && e.folder === STANDARDS_FOLDER);
      if (cited.length) {
        const rows = await t.search(qv).distanceType("l2").where(`\`standardName\` IN (${cited.map((e) => sqlStr(e.name)).join(",")})`).limit(10).toArray();
        rows.forEach((r: any) => add(r, true));
      }
      // 2) whole-library semantic search, standards folder only
      const rows2 = await t.search(qv).distanceType("l2").where(`folder = ${sqlStr(STANDARDS_FOLDER)}`).limit(20).toArray();
      rows2.forEach((r: any) => add(r, false));
      const rules = [...found.values()].sort((a, b) => Number(b.direct) - Number(a.direct) || b.score - a.score).slice(0, k);
      results.push({ id: it.id, rules });
    }
    res.json({ success: true, results });
  } catch (e) { next(e); }
});

verified.post("/rules-check", async (req, res, next) => {
  try {
    const ids: string[] = Array.isArray(req.body?.ruleIds) ? [...new Set<string>(req.body.ruleIds)].slice(0, 1000) : [];
    const ix = await getIndex(); const t = await table();
    const byStd = new Map<string, string[]>();
    for (const id of ids) { const i = id.lastIndexOf("#"); if (i < 0) continue; const n = id.slice(0, i); (byStd.get(n) || byStd.set(n, []).get(n)!).push(id); }
    const result: Record<string, { exists: boolean; active: boolean; standardName: string; folder: string | null; year: number | null }> = {};
    for (const [name, list] of byStd) {
      const rows = (await t.query().where(`\`standardName\` = ${sqlStr(name)}`).select(["text", "folder"]).limit(100000).toArray()) as { text: string; folder: string }[];
      const hashes = new Set(rows.map((r) => hash(String(r.text || ""))));
      const e = ix.entries.find((x) => x.name === name);
      const active = e?.code ? ix.chosen.get(keyOf(e.code))?.name === name : true;
      for (const id of list) result[id] = { exists: hashes.has(id.slice(id.lastIndexOf("#") + 1)), active, standardName: name, folder: e?.folder ?? null, year: e?.year ?? null };
    }
    for (const id of ids) if (!result[id]) result[id] = { exists: false, active: false, standardName: id, folder: null, year: null };
    res.json({ success: true, results: result });
  } catch (e) { next(e); }
});
