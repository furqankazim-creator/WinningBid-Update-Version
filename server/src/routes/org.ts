import { Router } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import mongoose from "mongoose";
import { Org, User, Invite, ROLES, Audit, Workspace, BidDocument, Record as DataRecord } from "../models/index.js";
import { requireAuth, requireAdmin, isBidder } from "../middleware/auth.js";

export const org = Router();
org.use(requireAuth);

org.get("/", async (req, res) => {
  const o = await Org.findById(req.user!.orgId);
  const bidder = isBidder(req.user); // a bidder sees only themselves — never the team list or pending invite links
  const users = await User.find(bidder ? { _id: req.user!.uid } : { orgId: req.user!.orgId }).select("-passwordHash").sort({ createdAt: 1 });
  const invites = bidder ? [] : await Invite.find({ orgId: req.user!.orgId, acceptedAt: null, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
  res.json({ org: o && { id: String(o._id), name: o.name, plan: o.plan, currency: o.currency, industries: o.industries, seeded: o.seeded }, users: users.map((u) => ({ id: String(u._id), name: u.name, email: u.email, role: u.role, active: u.active, lastLoginAt: u.lastLoginAt })), invites: invites.map((i) => ({ id: String(i._id), email: i.email, role: i.role, token: i.token, expiresAt: i.expiresAt, invitedBy: i.invitedBy })) });
});

org.patch("/", requireAdmin, async (req, res) => {
  const body = z.object({ name: z.string().min(1).optional(), industries: z.array(z.string()).optional(), currency: z.string().optional(), plan: z.string().optional(), seeded: z.boolean().optional() }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "invalid" });
  const o = await Org.findByIdAndUpdate(req.user!.orgId, body.data, { new: true });
  res.json({ id: String(o!._id), name: o!.name, plan: o!.plan, currency: o!.currency, industries: o!.industries, seeded: o!.seeded });
});

org.post("/invites", requireAdmin, async (req, res) => {
  const body = z.object({ email: z.string().email(), role: z.enum(ROLES).default("Viewer") }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Valid email and role required" });
  if (body.data.role === "Super Admin") return res.status(403).json({ error: "There is only one Super Admin (set in the server configuration); it cannot be granted" });
  if (await User.findOne({ email: body.data.email.toLowerCase() })) return res.status(409).json({ error: "User already exists" });
  const inv = await Invite.create({ orgId: req.user!.orgId, email: body.data.email, role: body.data.role, token: crypto.randomBytes(24).toString("hex"), invitedBy: req.user!.name, expiresAt: new Date(Date.now() + 7 * 86400000) });
  await Audit.create({ orgId: req.user!.orgId, user: req.user!.name, action: "Invited", entity: "User", entityId: inv.email, detail: inv.role });
  res.status(201).json({ id: String(inv._id), email: inv.email, role: inv.role, token: inv.token, expiresAt: inv.expiresAt, invitedBy: inv.invitedBy });
});
org.delete("/invites/:id", requireAdmin, async (req, res) => { await Invite.deleteOne({ _id: req.params.id, orgId: req.user!.orgId }); res.json({ ok: true }); });

org.patch("/users/:id", requireAdmin, async (req, res) => {
  const body = z.object({ role: z.enum(ROLES).optional(), active: z.boolean().optional(), name: z.string().min(1).optional() }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "invalid" });
  const target = await User.findOne({ _id: req.params.id, orgId: req.user!.orgId }); if (!target) return res.status(404).json({ error: "not found" });
  if (body.data.role === "Super Admin" && target.role !== "Super Admin") return res.status(403).json({ error: "There is only one Super Admin; it cannot be granted" });
  if (req.user!.role !== "Super Admin") { // organisation admins cannot touch or mint Super Admins, or lock themselves out
    if (target.role === "Super Admin" || body.data.role === "Super Admin") return res.status(403).json({ error: "Only a Super Admin can change the Super Admin role" });
    if (String(target._id) === req.user!.uid && (body.data.active === false || (body.data.role && body.data.role !== target.role))) return res.status(400).json({ error: "You cannot change your own role or deactivate yourself" });
  }
  const u = await User.findOneAndUpdate({ _id: req.params.id, orgId: req.user!.orgId }, body.data, { new: true }).select("-passwordHash");
  if (!u) return res.status(404).json({ error: "not found" });
  await Audit.create({ orgId: req.user!.orgId, user: req.user!.name, action: "Updated user", entity: "User", entityId: u.email, detail: JSON.stringify(body.data) });
  res.json({ id: String(u._id), name: u.name, email: u.email, role: u.role, active: u.active });
});

org.get("/audit", async (req, res) => {
  const rows = await Audit.find({ orgId: req.user!.orgId, ...(isBidder(req.user) ? { user: req.user!.name } : {}) }).sort({ at: -1 }).limit(Number(req.query.limit) || 500);
  res.json(rows.map((a) => ({ id: String(a._id), at: a.at, user: a.user, action: a.action, entity: a.entity, entityId: a.entityId, detail: a.detail })));
});
org.post("/audit", async (req, res) => {
  const body = z.object({ action: z.string(), entity: z.string(), entityId: z.string().optional().default(""), detail: z.string().optional().default("") }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "invalid" });
  const a = await Audit.create({ orgId: req.user!.orgId, user: req.user!.name, ...body.data });
  res.status(201).json({ id: String(a._id), at: a.at, user: a.user, action: a.action, entity: a.entity, entityId: a.entityId, detail: a.detail });
});

const bidderPub = (u: InstanceType<typeof User>) => ({ id: String(u._id), name: u.name, email: u.email, company: u.company, phone: u.phone, title: u.title, active: u.active, lastLoginAt: u.lastLoginAt, createdAt: (u as unknown as { createdAt: Date }).createdAt });

/** Admin: every bidder with how many workspaces and documents they have saved. */
/** A Super Admin may look at another organisation's bidders with ?orgId=; everyone else is pinned to their own organisation. */
const targetOrg = (req: import("express").Request) => (req.user!.role === "Super Admin" && mongoose.isValidObjectId(req.query.orgId) ? String(req.query.orgId) : req.user!.orgId);
org.get("/bidders", requireAdmin, async (req, res) => {
  const orgId = new mongoose.Types.ObjectId(targetOrg(req));
  const [bidders, ws, docs] = await Promise.all([User.find({ orgId, role: "Bidder" }).select("-passwordHash").sort({ createdAt: -1 }), Workspace.aggregate([{ $match: { orgId } }, { $group: { _id: "$ownerId", n: { $sum: 1 } } }]), BidDocument.aggregate([{ $match: { orgId } }, { $group: { _id: "$ownerId", n: { $sum: 1 }, bytes: { $sum: "$size" } } }])]);
  const wc = new Map(ws.map((x) => [String(x._id), x.n])); const dc = new Map(docs.map((x) => [String(x._id), x]));
  res.json(bidders.map((b) => ({ ...bidderPub(b), workspaces: wc.get(String(b._id)) || 0, documents: dc.get(String(b._id))?.n || 0, bytes: dc.get(String(b._id))?.bytes || 0 })));
});

/** Admin: one bidder's profile, workspaces and documents (document text is not included, only metadata + preview). */
org.get("/bidders/:id", requireAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "not found" });
  const b = await User.findOne({ _id: req.params.id, orgId: targetOrg(req), role: "Bidder" }).select("-passwordHash");
  if (!b) return res.status(404).json({ error: "not found" });
  const [workspaces, documents] = await Promise.all([Workspace.find({ orgId: b.orgId, ownerId: b._id }).select("-data").sort({ updatedAt: -1 }).lean(), BidDocument.find({ orgId: b.orgId, ownerId: b._id }).select("-textPreview -analysis").sort({ updatedAt: -1 }).lean()]);
  res.json({ bidder: bidderPub(b), workspaces, documents });
});

const TEXT_CAP = 20000;
/** Admin: everything inside one bidder workspace, grouped by collection (requirements, risks, compliance, documents with their extracted text, …). Read-only. */
org.get("/bidders/:id/workspaces/:tenderId", requireAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "not found" });
  const b = await User.findOne({ _id: req.params.id, orgId: targetOrg(req), role: "Bidder" }).select("-passwordHash");
  if (!b) return res.status(404).json({ error: "not found" });
  const { tenderId } = req.params;
  const rows = await DataRecord.find({ orgId: b.orgId, ownerId: b._id, $or: [{ collection: "tenders", id: tenderId }, { "data.tenderId": tenderId }] }).sort({ updatedAt: -1 }).limit(3000).lean();
  const tender = rows.find((r) => r.collection === "tenders")?.data; if (!tender) return res.status(404).json({ error: "workspace not found" });
  const collections: Record<string, unknown[]> = {};
  for (const r of rows) {
    if (r.collection === "tenders") continue;
    let d = r.data as Record<string, unknown>;
    if (r.collection === "docs" && typeof d.text === "string") d = { ...d, textLength: d.text.length, text: d.text.slice(0, TEXT_CAP), textTruncated: d.text.length > TEXT_CAP };
    (collections[r.collection] ||= []).push(d);
  }
  res.json({ bidder: bidderPub(b), tender, collections });
});
