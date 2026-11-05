import { pipeline } from "@xenova/transformers";

let extractorPipeline: any = null;
/** Single shared embedding model (all-MiniLM-L6-v2, 384-d) used for both ingestion and search. */
export async function getExtractor() {
  if (!extractorPipeline) {
    console.log("[standards] Loading embedding model into memory...");
    extractorPipeline = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractorPipeline;
}
export async function embed(text: string): Promise<number[]> {
  const ex = await getExtractor();
  const out = await ex(text.slice(0, 1500), { pooling: "mean", normalize: true });
  return Array.from(out.data) as number[];
}
