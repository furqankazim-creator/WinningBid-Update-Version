import { Router, type Request } from "express";
import { z } from "zod";
import { Record, Settings, User, COLLECTIONS, KEYED_BY_TENDER, type CollectionName } from "../models/index.js";
import { requireAuth, requireWrite, isBidder } from "../middleware/auth.js";
import { mirrorRecords, unmirror } from "../mirror.js";
import { seedUserWorkspaces } from "../seed-demo.js";

export const data = Router();
data.use(requireAuth);

const isCollection = (c: string): c is CollectionName => (COLLECTIONS as readonly string[]).includes(c);
const keyOf = (c: string, doc: Record<string, unknown>) => String(KEYED_BY_TENDER.has(c) ? doc.tenderId : doc.id);
/**
 * A bidder sees only their own records. Everyone else shares the organisation's records EXCEPT bidders' personal workspaces and documents:
 * those stay out of an admin's own workspace and are reviewed read-only under Administration → Bidders instead.
 */
const scope = async (req: Request) => {
  const { orgId, uid } = req.user!;
  if (isBidder(req.user)) return { orgId, ownerId: uid };
  const bidderIds = await User.find({ orgId, role: "Bidder" }).distinct("_id");
  return bidderIds.length ? { orgId, ownerId: { $nin: bidderIds } } : { orgId };
};

/** Full snapshot: every collection + settings. A bidder gets only their own workspace. */
data.get("/state", async (req, res) => {
  const { orgId, uid } = req.user!;
  if (process.env.NODE_ENV !== "test" && process.env.ALLOW_OPEN_SIGNUP !== "1") {
    try {
      const tenderCount = await Record.countDocuments({ orgId, ownerId: uid, collection: "tenders" });
      if (tenderCount < 3) {
        const user = await User.findById(uid);
        if (user) await seedUserWorkspaces(user);
      }
    } catch (err) {
      console.error("[data] Auto-seed check failed:", err);
    }
  }
  const rows = await Record.find(await scope(req)).select("collection data").lean();
  const out: Record<string, unknown[]> = {}; for (const c of COLLECTIONS) out[c] = [];
  for (const r of rows) (out[r.collection] ||= []).push(r.data);
  res.json({ collections: out, settings: await readSettings(req), serverTime: new Date().toISOString() });
});

/** Org settings are shared; a bidder's settings (margin, profile…) are kept under their own key so they never touch the org's. */
const readSettings = async (req: Request) => {
  const s = await Settings.findOne({ orgId: req.user!.orgId }).lean(); const all = (s?.data || {}) as Record<string, unknown>;
  return isBidder(req.user) ? ((all.byBidder as Record<string, unknown> | undefined)?.[req.user!.uid] || {}) : all;
};
data.get("/settings", async (req, res) => res.json(await readSettings(req)));
data.put("/settings", requireWrite, async (req, res) => {
  const prefix = isBidder(req.user) ? `data.byBidder.${req.user!.uid}.` : "data.";
  await Settings.findOneAndUpdate({ orgId: req.user!.orgId }, { $set: Object.fromEntries(Object.entries(req.body || {}).map(([k, v]) => [prefix + k, v])) }, { upsert: true });
  res.json(await readSettings(req));
});

/** Bulk sync of one collection: upsert every document given; with `full`, delete the caller's own records the client no longer has. */
data.put("/:collection/sync", requireWrite, async (req, res) => {
  const c = req.params.collection; if (!isCollection(c)) return res.status(404).json({ error: "unknown collection" });
  const body = z.object({ docs: z.array(z.record(z.unknown())), full: z.boolean().default(true) }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "docs[] required" });
  const { orgId, uid, name } = req.user!; let docs = body.data.docs; const ids = docs.map((d) => keyOf(c, d));
  let skipped = 0;
  if (isBidder(req.user) && docs.length) { // never let a bidder overwrite someone else's record that happens to share an id
    const taken = new Set((await Record.find({ orgId, collection: c, id: { $in: ids }, ownerId: { $ne: uid } }).select("id").lean()).map((r) => r.id));
    if (taken.size) { docs = docs.filter((d) => !taken.has(keyOf(c, d))); skipped = body.data.docs.length - docs.length; }
  }
  if (docs.length) await Record.bulkWrite(docs.map((d) => ({ updateOne: { filter: { orgId, collection: c, id: keyOf(c, d) }, update: { $set: { data: d, updatedBy: name }, $setOnInsert: { ownerId: uid as never, ownerName: name } }, upsert: true } })), { ordered: false });
  let deleted = 0;
  if (body.data.full) {
    // only the caller's own records (or legacy ownerless ones for non-bidders) can be removed by a full sync, so a stale browser can't wipe another bidder's work
    const mine = isBidder(req.user) ? { ownerId: uid } : { $or: [{ ownerId: uid }, { ownerId: { $exists: false } }] };
    const gone = (await Record.find({ orgId, collection: c, id: { $nin: ids }, ...mine }).select("id").lean()).map((r) => r.id);
    if (gone.length) { deleted = (await Record.deleteMany({ orgId, collection: c, id: { $in: gone } })).deletedCount; await unmirror(orgId, c, gone); }
  }
  await mirrorRecords(orgId, c, docs.map((d) => keyOf(c, d)));
  res.json({ upserted: docs.length, deleted, skipped });
});

/** Per-entity REST for other clients / integrations. */
data.get("/:collection", async (req, res) => {
  const c = req.params.collection; if (!isCollection(c)) return res.status(404).json({ error: "unknown collection" });
  const filter: Record<string, unknown> = { ...(await scope(req)), collection: c };
  if (req.query.tenderId) filter["data.tenderId"] = String(req.query.tenderId);
  const rows = await Record.find(filter).sort({ updatedAt: -1 }).limit(Math.min(Number(req.query.limit) || 2000, 5000)).lean();
  res.json(rows.map((r) => r.data));
});
data.get("/:collection/:id", async (req, res) => {
  const c = req.params.collection; if (!isCollection(c)) return res.status(404).json({ error: "unknown collection" });
  const r = await Record.findOne({ ...(await scope(req)), collection: c, id: req.params.id }).lean();
  return r ? res.json(r.data) : res.status(404).json({ error: "not found" });
});
data.post("/:collection", requireWrite, async (req, res) => {
  const c = req.params.collection; if (!isCollection(c)) return res.status(404).json({ error: "unknown collection" });
  const doc = { ...(req.body || {}) }; if (!doc.id && !KEYED_BY_TENDER.has(c)) doc.id = Math.random().toString(36).slice(2, 10);
  const { orgId, uid, name } = req.user!; const id = keyOf(c, doc);
  if (isBidder(req.user) && (await Record.exists({ orgId, collection: c, id, ownerId: { $ne: uid } }))) return res.status(409).json({ error: "id already in use" });
  const r = await Record.findOneAndUpdate({ orgId, collection: c, id }, { $set: { data: doc, updatedBy: name }, $setOnInsert: { ownerId: uid, ownerName: name } }, { new: true, upsert: true }).lean();
  await mirrorRecords(orgId, c, [id]);
  res.status(201).json(r!.data);
});
data.put("/:collection/:id", requireWrite, async (req, res) => {
  const c = req.params.collection; if (!isCollection(c)) return res.status(404).json({ error: "unknown collection" });
  const existing = await Record.findOne({ ...(await scope(req)), collection: c, id: req.params.id });
  if (!existing) return res.status(404).json({ error: "not found" });
  existing.data = { ...(existing.data as object), ...(req.body || {}) }; existing.updatedBy = req.user!.name; existing.markModified("data"); await existing.save();
  await mirrorRecords(req.user!.orgId, c, [req.params.id]);
  res.json(existing.data);
});
data.delete("/:collection/:id", requireWrite, async (req, res) => {
  const c = req.params.collection; if (!isCollection(c)) return res.status(404).json({ error: "unknown collection" });
  const r = await Record.deleteOne({ ...(await scope(req)), collection: c, id: req.params.id });
  if (r.deletedCount) await unmirror(req.user!.orgId, c, [req.params.id]);
  res.json({ deleted: r.deletedCount });
});
