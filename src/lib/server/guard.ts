import type { NextRequest } from "next/server";

/**
 * Login + rate-limit check for the Next.js API routes that cost money or CPU (AI, exports).
 * The user's JWT is verified by asking the Express API (/api/auth/me), so this server never holds JWT_SECRET.
 * Local demo mode (no NEXT_PUBLIC_API_URL, not production) skips the login check but is still rate limited.
 */
const api = () => process.env.STANDARDS_API_URL || "http://localhost:4005";
const demo = () => !process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV !== "production";

/** Headers for server-to-server calls from this Next.js server to the Express API. */
export const serviceHeaders = (): Record<string, string> => {
  const key = process.env.INTERNAL_API_KEY || (process.env.NODE_ENV === "production" ? "" : "dev-internal-key"); // must match the API's local-dev fallback
  return key ? { "x-service-key": key } : {};
};

const okTokens = new Map<string, number>();
const hits = new Map<string, number[]>();
const prune = <V,>(m: Map<string, V>, keep: (v: V) => boolean) => { if (m.size > 5000) for (const [k, v] of m) if (!keep(v)) m.delete(k); };

const json = (status: number, error: string, extra?: Record<string, string>) => new Response(JSON.stringify({ error }), { status, headers: { "content-type": "application/json", ...extra } });

export async function guard(req: NextRequest, bucket: string, perMinute: number): Promise<Response | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!demo()) {
    if (!token) return json(401, "unauthenticated");
    const now = Date.now();
    if ((okTokens.get(token) || 0) < now) {
      let ok = false;
      try { ok = (await fetch(`${api()}/api/auth/me`, { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10_000) })).ok; } catch { return json(503, "auth service unreachable"); }
      if (!ok) return json(401, "invalid_token");
      okTokens.set(token, now + 60_000); prune(okTokens, (t) => t > now);
    }
  }
  const who = token ? token.slice(-24) : (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  const key = `${bucket}:${who}`, now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => t > now - 60_000);
  if (recent.length >= perMinute) return json(429, "Too many requests, slow down.", { "retry-after": "60" });
  recent.push(now); hits.set(key, recent); prune(hits, (v) => v.some((t) => t > now - 60_000));
  return null;
}
