import type { NextRequest } from "next/server";
import { guard } from "@/lib/server/guard";
import { provider, providerLabel } from "@/lib/server/llm";
import { keyStatus } from "@/lib/server/groq";
export const dynamic = "force-dynamic";
/** Which AI provider is active and the health of the Groq key pool (keys shown by last 6 chars only). */
export async function GET(req: NextRequest) { const denied = await guard(req, "ai-status", 60); if (denied) return denied; return Response.json({ provider: provider(), label: providerLabel(), groqKeys: keyStatus() }); }
