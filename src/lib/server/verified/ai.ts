import { completeJSON, provider, providerLabel } from "@/lib/server/llm";
import { groqKeys } from "@/lib/server/groq";

export const PROMPT_VERSION = "verified-v1.0";
export { providerLabel, provider };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const log: { t: number; tok: number }[] = [];
export const stats = { calls: 0 };

/** Proactive token-per-minute pacing so the free Groq tier is never hammered into 429 retries. */
async function pace(est: number, onWait: (s: number) => void, aborted: () => boolean) {
  const limit = provider() === "groq" ? 6800 * Math.max(1, groqKeys().length) : Infinity;
  for (;;) {
    const now = Date.now(); while (log.length && now - log[0].t > 60_000) log.shift();
    const used = log.reduce((a, x) => a + x.tok, 0);
    if (aborted() || used + est <= limit || log.length === 0) break;
    const wait = 60_000 - (now - log[0].t) + 400;
    onWait(Math.ceil(wait / 1000));
    await sleep(Math.min(wait, 10_000));
  }
  log.push({ t: Date.now(), tok: est });
}

export interface Ctx { onWait: (s: number) => void; aborted: () => boolean; }

/** One AI call returning parsed JSON; retries once on malformed / truncated output. */
export async function jsonCall<T>(ctx: Ctx, system: string, user: string, maxTokens: number): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const mt = Math.round(maxTokens * (attempt ? 1.3 : 1));
    await pace(Math.round((system.length + user.length) / 3.4) + mt, ctx.onWait, ctx.aborted);
    if (ctx.aborted()) throw new Error("cancelled");
    try { stats.calls++; return await completeJSON<T>(system, user, mt); }
    catch (e) {
      lastErr = e; const m = e instanceof Error ? e.message : "";
      if (!/did not return JSON|cut off|JSON|Unexpected/i.test(m)) throw e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("AI call failed");
}

export const SYS_BASE = `You are the document-verification engine of BidWinning, a tender & bid platform. Return STRICT JSON only. Never invent facts, standards, clause numbers, pages or quotations. Every item that carries a quote ("q") must copy it EXACTLY, word for word, from the supplied text.`;

export const INDUSTRIES = "oil-gas, infrastructure, construction, manufacturing, engineering, energy, renewables, utilities, telecom, it, government, healthcare, pharma, transport, logistics, mining, real-estate, fm, industrial, water, defense, education, consulting, professional, trading, other";
export const TENDER_TYPES = "Tender, RFP, RFQ, RFI, ITT, EOI, Prequalification, Framework Agreement, Government Procurement, Private Procurement, Direct Opportunity, Subcontract Opportunity";

export const FACTS_SCHEMA = `Return JSON:
{"general":{"title":{"v":"","q":"","p":0},"reference":{"v":"","q":"","p":0},"client":{"v":"","q":"","p":0},"project":{"v":"","q":"","p":0},"location":{"v":"","q":"","p":0},"contractType":{"v":"","q":"","p":0},"pricingBasis":{"v":"","q":"","p":0},"duration":{"v":"","q":"","p":0},"submissionDeadline":{"v":"YYYY-MM-DD or not stated","q":"","p":0},"industry":{"v":"one of: ${INDUSTRIES}","q":"","p":0},"tenderType":{"v":"one of: ${TENDER_TYPES}","q":"","p":0},"service":{"v":"","q":"","p":0}},
 "summary":{"Executive Summary":[{"t":"","q":"","p":0}],"Scope Summary":[],"Key Requirements":[],"Important Dates":[],"Commercial Requirements":[],"Technical Requirements":[],"Legal Requirements":[],"Compliance Requirements":[]}}
Rules: "v" must be supported by "q" (exact quote, 3–25 words) and "p" (page from the [pN] tag). If a field is not in the excerpts: v="not stated", q="", p=0. Summary bullets: "t" ≤ 30 words. Counts: Executive Summary 2, Scope Summary 4, Key Requirements 5, Important Dates 3, Commercial Requirements 4, Technical Requirements 5, Legal Requirements 3, Compliance Requirements 4. Omit a bullet rather than guess; fewer is fine.`;

export const JUDGE_SYS = `${SYS_BASE}
You are a standards-compliance checker working for the bidder. For each numbered REQUIREMENT you get up to 3 candidate RULES taken from the owner's standards library; every rule is shown as numbered sentences. Decide ONLY from the supplied rule sentences — never from outside knowledge.
Verdicts:
- "Conforms" = the sentence you point at states a SPECIFIC provision (a number, limit, method, duty) on the same subject and the requirement agrees with it.
- "Conflicts" = the requirement explicitly contradicts that provision (different number, method or duty) or is weaker than it; state exactly how. Differences in who is responsible, wording or scope are NOT conflicts.
- "Reference" = the requirement only cites, incorporates or says "comply with / as per" a standard, without stating its own provision to compare. (This is common: use it instead of "Conforms".)
- "Not covered" = none of the supplied rules addresses the same subject. Similar words are not enough; a cover page, contents list, page header or generic text does not count.
Point at the evidence instead of quoting it: "rule" = the id (R1…) of the single rule you relied on and "sentence" = the number of the sentence inside that rule that supports your verdict (use null for both when "Not covered"). "reasoning" ≤ 35 words. For "Not covered" items only, "knowledge" may name (≤ 25 words) the standard or law you believe governs it from general knowledge, or "".
Return {"results":[{"id":"Q1","verdict":"Conforms|Conflicts|Reference|Not covered","rule":"R2","sentence":1,"reasoning":"","confidence":"High|Medium|Low","knowledge":""}]} with exactly one result per requirement.`;

export const KNOWLEDGE_SYS = `${SYS_BASE}
You are a codes-and-regulations expert for Saudi Arabia / Saudi Aramco projects. Your answers come from your general knowledge (training data), NOT from a verified library, so state uncertainty honestly and never invent a standard number: if you are not sure a standard exists, leave "code" empty and describe it in words.`;

export const RISK_SYS = `${SYS_BASE}
You assess bid risk and prepare client clarifications for a contractor. Use ONLY the supplied facts and excerpts. Every risk and clarification must carry an exact quote "q" from the excerpts and its page "p".`;
