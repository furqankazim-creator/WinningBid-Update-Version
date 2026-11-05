/**
 * Groq client with automatic failover across API keys AND models.
 * Keys: GROQ_API_KEYS (comma-separated) and/or GROQ_API_KEY. Models: GROQ_MODEL first, then GROQ_FALLBACK_MODELS
 * (default openai/gpt-oss-20b). Groq's free tier limits tokens per minute AND per day *per model*, so when the primary
 * model's daily quota is spent the request transparently continues on the next model.
 * Cooldowns are tracked per (model, key): per-minute 429 → Retry-After / 60 s; daily-quota 429 → the retry hint Groq gives
 * (default 30 min); 401/403 → 1 h; 503 "over capacity" → 30 s.
 */
const cooldown = new Map<string, number>(); // `${model}|${key}` → epoch ms until which it is skipped
const used = new Set<string>();             // models that actually answered during this process (stamped on reports)

export function groqKeys(): string[] {
  const list = [...(process.env.GROQ_API_KEYS || "").split(","), process.env.GROQ_API_KEY || ""].map((k) => k.trim()).filter(Boolean);
  return Array.from(new Set(list));
}
export const groqModel = () => process.env.GROQ_MODEL || "openai/gpt-oss-120b";
export const groqModels = () => Array.from(new Set([groqModel(), ...(process.env.GROQ_FALLBACK_MODELS ?? "openai/gpt-oss-20b").split(",").map((m) => m.trim()).filter(Boolean)]));
export const modelsUsed = () => [...used];
export const resetModelsUsed = () => used.clear();

const now = () => Date.now();
const cd = (m: string, k: string) => cooldown.get(`${m}|${k}`) || 0;

export function keyStatus() {
  return groqKeys().map((k, i) => ({ index: i + 1, suffix: k.slice(-6), coolingDownFor: Math.max(0, Math.round((Math.min(...groqModels().map((m) => cd(m, k))) - now()) / 1000)), models: groqModels().map((m) => ({ model: m, coolingDownFor: Math.max(0, Math.round((cd(m, k) - now()) / 1000)) })) }));
}

/** "Please try again in 14m22.5s" / "in 8.2s" → milliseconds */
function retryHintMs(text: string): number | null {
  const m = /try again in\s+(?:(\d+)h)?(?:(\d+)m)?(?:(\d+(?:\.\d+)?)s)?/i.exec(text);
  if (!m || (!m[1] && !m[2] && !m[3])) return null;
  return ((Number(m[1]) || 0) * 3600 + (Number(m[2]) || 0) * 60 + (Number(m[3]) || 0)) * 1000;
}

/** gpt-oss accepts reasoning_effort; other models reject it. */
function bodyFor(model: string, body: Record<string, unknown>) {
  const b: Record<string, unknown> = { ...body, model };
  if (!model.startsWith("openai/gpt-oss")) delete b.reasoning_effort;
  return b;
}

/**
 * POST to Groq chat completions, trying every (model, key) pair that is not cooling down. If everything is cooling for
 * a short time (per-minute limit) it waits for the soonest pair and retries; a spent daily quota on every model throws.
 */
export async function groqFetch(body: Record<string, unknown>, maxWaits = 3): Promise<{ res: Response; keyIndex: number; model: string }> {
  for (let attempt = 0; ; attempt++) {
    try { return await groqFetchOnce(body); }
    catch (e) {
      const pairs = groqModels().flatMap((m) => groqKeys().map((k) => cd(m, k)));
      const soonest = Math.min(...pairs) - now();
      if (attempt >= maxWaits || !(e instanceof Error) || !e.message.startsWith("Groq 429") || soonest > 90_000) throw e;
      console.warn(`[groq] every model/key is rate-limited → waiting ${Math.ceil(soonest / 1000)} s`);
      await new Promise((r) => setTimeout(r, Math.max(1000, soonest)));
    }
  }
}

async function groqFetchOnce(body: Record<string, unknown>): Promise<{ res: Response; keyIndex: number; model: string }> {
  const all = groqKeys(); if (!all.length) throw new Error("no_credentials");
  let lastErr = ""; let tried = 0;
  for (const model of groqModels()) {
    for (const key of all) {
      if (cd(model, key) > now()) continue;
      tried++;
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${key}` }, body: JSON.stringify(bodyFor(model, body)) });
      if (res.ok) { used.add(model); return { res, keyIndex: all.indexOf(key) + 1, model }; }
      const text = await res.text().catch(() => "");
      lastErr = `Groq ${res.status} (${model}): ${text.slice(0, 220)}`;
      if (res.status === 429) {
        const daily = /tokens per day|\bTPD\b|requests per day|\bRPD\b/i.test(text);
        const ra = Number(res.headers.get("retry-after"));
        const wait = daily ? Math.max(retryHintMs(text) ?? 1_800_000, 60_000) : ra > 0 ? ra * 1000 : retryHintMs(text) ?? 60_000;
        cooldown.set(`${model}|${key}`, now() + wait);
        console.warn(`[groq] ${model} key …${key.slice(-6)} ${daily ? "DAILY quota spent" : "rate-limited"} (${Math.round(wait / 1000)} s) → trying next`);
        continue;
      }
      if (res.status === 401 || res.status === 403) { cooldown.set(`${model}|${key}`, now() + 3_600_000); console.warn(`[groq] key …${key.slice(-6)} rejected (${res.status})`); continue; }
      if (res.status >= 500) { cooldown.set(`${model}|${key}`, now() + 30_000); continue; } // over capacity / transient: next model or key
      throw new Error(lastErr);                                                              // 400/404: a request problem, not a quota problem
    }
  }
  if (!tried) throw new Error(`Groq 429: every model/key is cooling down after rate limits — ${groqModels().join(", ")}`);
  throw new Error(lastErr || "All Groq models and keys are rate-limited; try again shortly.");
}
