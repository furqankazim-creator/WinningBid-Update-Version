import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDb } from "./db.js";
import { auth } from "./routes/auth.js";
import { org } from "./routes/org.js";
import { data } from "./routes/data.js";
import { platform } from "./routes/platform.js";
import { ensureSuperAdmin } from "./bootstrap.js";
import { standards } from "./routes/standards.js";
import { ocr } from "./routes/ocr.js";
import { assertProductionConfig } from "./prodcheck.js";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import { requireAuthOrService } from "./middleware/auth.js";

// Express 4 does not catch rejected promises in async handlers; log them rather than letting one bad request kill the server.
// A Tesseract worker reports failures as an event on a worker thread; uncaught, that kills the whole API. Log it and keep serving.
process.on("uncaughtException", (e) => { if (/tesseract|traineddata/i.test(String(e?.stack || e))) console.error("[ocr] worker error (API kept running):", e instanceof Error ? e.message : e); else { console.error(e); process.exit(1); } });
// Express 4 does not catch rejected promises in async handlers; log them rather than letting one bad request kill the server.
process.on("unhandledRejection", (e) => console.error("[api] unhandled rejection:", e instanceof Error ? e.message : e));

export async function createApp() {
  const app = express();
  const origins = (process.env.CORS_ORIGIN || "http://localhost:3000").split(",").map((s) => s.trim());
  if (process.env.NODE_ENV === "production") app.set("trust proxy", 1); // behind the host's load balancer, so limits key on the real client IP
  app.use(helmet());
  app.use(cors({ origin: (o, cb) => cb(null, !o || origins.includes(o) || origins.includes("*")), credentials: false }));
  app.use(express.json({ limit: "200mb" }));
  app.use(express.urlencoded({ limit: "200mb", extended: true }));
  if (process.env.NODE_ENV !== "test") app.use(morgan("tiny"));
  app.get("/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));
  const limit = (windowMs: number, max: number) => rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false, message: { error: "Too many requests, slow down." } });
  const off = process.env.NODE_ENV === "test" || process.env.DISABLE_RATE_LIMIT === "1";
  const noop = (_q: express.Request, _r: express.Response, n: express.NextFunction) => n();
  app.use("/api/auth/login", off ? noop : limit(15 * 60_000, 20));
  app.use("/api/auth/signup", off ? noop : limit(60 * 60_000, 10));
  app.use("/api", off ? noop : limit(60_000, 600));
  // Fail fast instead of letting a query buffer for 10s and then crash the process when MongoDB is unreachable.
  const needsDb = (req: express.Request, res: express.Response, next: express.NextFunction) => (mongoose.connection.readyState === 1 ? next() : res.status(503).json({ error: "Database unavailable — is MongoDB running?" }));
  app.use(["/api/auth", "/api/org", "/api/data", "/api/platform"], needsDb);
  app.use("/api/auth", auth);
  app.use("/api/org", org);
  app.use("/api/data", data);
  app.use("/api/platform", platform);
  app.use("/api/standards", requireAuthOrService, off ? noop : limit(60_000, 120), standards);
  app.use("/api/ocr", requireAuthOrService, off ? noop : limit(60_000, 30), ocr);
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => { console.error(err); res.status(500).json({ error: err.message || "server error" }); });
  return app;
}

let currentServer: import("http").Server | null = null;
let isShuttingDown = false;

function handleShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  try {
    if (currentServer) {
      if (typeof (currentServer as any).closeAllConnections === "function") {
        (currentServer as any).closeAllConnections();
      }
      if (typeof (currentServer as any).closeIdleConnections === "function") {
        (currentServer as any).closeIdleConnections();
      }
      currentServer.close();
    }
  } catch {}
  try {
    mongoose.disconnect().catch(() => {});
  } catch {}
  // Exit cleanly and immediately so dev runners (tsx watch) restart instantly with 0 delay
  process.exit(0);
}

process.once("SIGTERM", () => handleShutdown("SIGTERM"));
process.once("SIGINT", () => handleShutdown("SIGINT"));
process.once("SIGHUP", () => handleShutdown("SIGHUP"));

if (process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.js")) {
  assertProductionConfig();
  connectDb().then(async () => {
    await ensureSuperAdmin();
    const app = await createApp();
    const port = Number(process.env.PORT) || 4005;
    currentServer = app.listen(port, () => console.log(`[api] BidWinning API listening on :${port}`));
  }).catch(async (e) => {
    console.error(e);
    if (process.env.NODE_ENV === "production") {
      console.error("[api] fatal: database unavailable, exiting");
      process.exit(1);
    }
    console.log("[api] MongoDB connection failed, but starting app anyway for LanceDB.");
    const app = await createApp();
    const port = Number(process.env.PORT) || 4005;
    currentServer = app.listen(port, () => console.log(`[api] BidWinning API listening on :${port}`));
  });
}
