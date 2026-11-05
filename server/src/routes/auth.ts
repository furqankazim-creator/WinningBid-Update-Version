import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Org, User, Invite, Record as DataRecord } from "../models/index.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import { seedUserWorkspaces } from "../seed-demo.js";

export const auth = Router();
const pub = (u: InstanceType<typeof User>) => ({ id: String(u._id), name: u.name, email: u.email, role: u.role, active: u.active, orgId: String(u.orgId), company: u.company || "", phone: u.phone || "", title: u.title || "", lastLoginAt: u.lastLoginAt, createdAt: (u as unknown as { createdAt?: Date }).createdAt });
const tokenFor = (u: InstanceType<typeof User>) => signToken({ uid: String(u._id), orgId: String(u.orgId), role: u.role, name: u.name, email: u.email });

/** Sign up by invite only (the Super Admin issues invites). Open organisation sign-up is off unless ALLOW_OPEN_SIGNUP=1 (tests). */
auth.post("/signup", async (req, res) => {
  const body = z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(8), organisation: z.string().min(1).optional(), invite: z.string().optional() }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.issues[0].message });
  const { name, email, password, organisation, invite } = body.data;
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ error: "An account with this email already exists" });
  let orgId: unknown; let role = "Super Admin";
  if (invite) {
    const inv = await Invite.findOne({ token: invite, acceptedAt: null, expiresAt: { $gt: new Date() } });
    if (!inv) return res.status(400).json({ error: "Invite is invalid or expired" });
    if (inv.email !== email.toLowerCase()) return res.status(400).json({ error: `This invite was issued to ${inv.email}` });
    orgId = inv.orgId; role = inv.role; inv.acceptedAt = new Date(); await inv.save();
  } else {
    if (process.env.ALLOW_OPEN_SIGNUP !== "1") return res.status(403).json({ error: "Sign-up is by invitation only. Ask your administrator for an invite link." });
    if (!organisation) return res.status(400).json({ error: "Organisation name is required" });
    orgId = (await Org.create({ name: organisation, industries: [] }))._id;
  }
  const user = await User.create({ orgId, name, email, passwordHash: await bcrypt.hash(password, 10), role, lastLoginAt: new Date() });
  const org = await Org.findById(orgId);
  res.status(201).json({ token: tokenFor(user), user: pub(user), org: { id: String(org!._id), name: org!.name, plan: org!.plan, currency: org!.currency, industries: org!.industries, seeded: org!.seeded } });
});

auth.post("/login", async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string() }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Email and password required" });
  const user = await User.findOne({ email: body.data.email.toLowerCase() });
  if (!user || !(await bcrypt.compare(body.data.password, user.passwordHash))) return res.status(401).json({ error: "Invalid email or password" });
  if (!user.active) return res.status(403).json({ error: "Account deactivated" });
  user.lastLoginAt = new Date(); await user.save();
  if (process.env.NODE_ENV !== "test" && process.env.ALLOW_OPEN_SIGNUP !== "1") {
    try {
      const count = await DataRecord.countDocuments({ orgId: user.orgId, ownerId: user._id, collection: "tenders" });
      if (count < 3) await seedUserWorkspaces(user);
    } catch (err) {
      console.error("[auth] Failed to ensure workspaces on login:", err);
    }
  }
  const org = await Org.findById(user.orgId);
  res.json({ token: tokenFor(user), user: pub(user), org: { id: String(org!._id), name: org!.name, plan: org!.plan, currency: org!.currency, industries: org!.industries, seeded: org!.seeded } });
});

auth.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user!.uid); if (!user) return res.status(404).json({ error: "not found" });
  if (process.env.NODE_ENV !== "test" && process.env.ALLOW_OPEN_SIGNUP !== "1") {
    try {
      const count = await DataRecord.countDocuments({ orgId: user.orgId, ownerId: user._id, collection: "tenders" });
      if (count < 3) await seedUserWorkspaces(user);
    } catch (err) {
      console.error("[auth] Failed to ensure workspaces on me:", err);
    }
  }
  const org = await Org.findById(user.orgId);
  res.json({ user: pub(user), org: { id: String(org!._id), name: org!.name, plan: org!.plan, currency: org!.currency, industries: org!.industries, seeded: org!.seeded } });
});

/** Change sign-in email; requires the current password so a hijacked session cannot take over the account. */
auth.patch("/email", requireAuth, async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string() }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Valid email and password required" });
  const user = await User.findById(req.user!.uid); if (!user) return res.status(404).json({ error: "not found" });
  if (!(await bcrypt.compare(body.data.password, user.passwordHash))) return res.status(401).json({ error: "Password is wrong" });
  const email = body.data.email.toLowerCase();
  if (email !== user.email && (await User.findOne({ email }))) return res.status(409).json({ error: "That email is already in use" });
  user.email = email; await user.save(); res.json({ user: pub(user) });
});

/** A user edits their own contact details (role and organisation can only be changed by an admin). */
auth.patch("/profile", requireAuth, async (req, res) => {
  const body = z.object({ name: z.string().min(1).max(120).optional(), company: z.string().max(160).optional(), phone: z.string().max(40).optional(), title: z.string().max(120).optional() }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "invalid" });
  const user = await User.findByIdAndUpdate(req.user!.uid, body.data, { new: true }); if (!user) return res.status(404).json({ error: "not found" });
  res.json({ user: pub(user) });
});

auth.post("/change-password", requireAuth, async (req, res) => {
  const body = z.object({ current: z.string(), next: z.string().min(8) }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "New password must be at least 8 characters" });
  const user = await User.findById(req.user!.uid); if (!user) return res.status(404).json({ error: "not found" });
  if (!(await bcrypt.compare(body.data.current, user.passwordHash))) return res.status(401).json({ error: "Current password is wrong" });
  user.passwordHash = await bcrypt.hash(body.data.next, 10); await user.save(); res.json({ ok: true });
});

/** Invite lookup for the sign-up page (public, token-scoped). */
auth.get("/invite/:token", async (req, res) => {
  const inv = await Invite.findOne({ token: req.params.token, acceptedAt: null, expiresAt: { $gt: new Date() } });
  if (!inv) return res.status(404).json({ error: "Invite is invalid or expired" });
  const org = await Org.findById(inv.orgId);
  res.json({ email: inv.email, role: inv.role, organisation: org?.name });
});
