import Anthropic from "@anthropic-ai/sdk";
import { groqFetch, groqKeys, groqModel, modelsUsed } from "./groq";

/** Provider selection shared by chat and analysis: Anthropic if configured, else Groq (OpenAI-compatible). */
export function provider(): "anthropic" | "groq" | null {
  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) return "anthropic";
  if (groqKeys().length) return "groq";
  return null;
}
export const providerLabel = () => (provider() === "anthropic" ? "anthropic:claude-opus-5" : provider() === "groq" ? `groq:${modelsUsed().length ? modelsUsed().join(" + ") : groqModel()}` : "none");

/** Ask for a JSON object and parse it robustly (strips code fences / leading prose). */
export async function completeJSON<T>(system: string, user: string, maxTokens = 8000): Promise<T> {
  const p = provider();
  if (!p) throw new Error("no_credentials");
  let text = "";
  if (p === "anthropic") {
    const client = new Anthropic();
    const s = client.messages.stream({ model: "claude-opus-5", max_tokens: maxTokens, system: [{ type: "text", text: system }], messages: [{ role: "user", content: user }], thinking: { type: "adaptive" }, output_config: { effort: "high" } });
    const final = await s.finalMessage();
    if (final.stop_reason === "max_tokens") throw new Error("AI output was cut off (max tokens reached) — report would be incomplete");
    text = final.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("");
  } else {
    // gpt-oss models spend part of max_tokens on hidden reasoning; keep it low for extraction so the JSON fits.
    const reasoning = { reasoning_effort: "low" }; // stripped by the Groq client for models that do not accept it
    const { res } = await groqFetch({ model: groqModel(), temperature: 0.2, max_tokens: maxTokens, ...reasoning, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: user }] });
    const j = await res.json(); text = j.choices?.[0]?.message?.content || "";
    if (j.choices?.[0]?.finish_reason === "length") throw new Error(`AI output was cut off at ${maxTokens} tokens — report would be incomplete`);
  }
  const start = text.indexOf("{"); const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("Model did not return JSON");
  return JSON.parse(text.slice(start, end + 1)) as T;
}
