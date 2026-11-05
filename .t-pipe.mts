import { readFileSync, writeFileSync, existsSync } from "fs";
// load .env.local like Next does
for (const l of readFileSync(".env.local", "utf8").split("\n")) { const m = /^([A-Z_]+)=(.*)$/.exec(l.trim()); if (m && m[2]) process.env[m[1]] = m[2]; }
const { runVerifiedPipeline } = await import("./src/lib/server/verified/pipeline");
const raw = readFileSync(process.argv[2], "utf8");
const depth = (process.argv[4] as "standard" | "deep") || "standard";
const t0 = Date.now();
const result = await runVerifiedPipeline(raw, "Manifa TCF SOW", { depth, aborted: () => false }, (e) => console.log(`[${Math.round((Date.now() - t0) / 1000)}s] ${e.pct >= 0 ? e.pct + "%" : "…"} ${e.stage}: ${e.msg}`));
writeFileSync(process.argv[3], JSON.stringify(result, null, 1));
console.log("DONE", Math.round((Date.now() - t0) / 1000), "s");
