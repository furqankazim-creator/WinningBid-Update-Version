import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";
import { User, ADMIN_ROLES } from "../models/index.js";

export interface AuthUser { uid: string; orgId: string; role: string; name: string; email: string; }
declare global { namespace Express { interface Request { user?: AuthUser } } }

const secret = () => {
  const s = process.env.JWT_SECRET;
  if (s) return s;
  // A public fallback secret would let anyone forge tokens, so refuse to run without one in production.
  if (process.env.NODE_ENV === "production") throw new Error("JWT_SECRET must be set in production");
  return "dev-secret-change-me";
};
export const signToken = (u: AuthUser) => jwt.sign(u, secret(), { expiresIn: "30d" });

const devBypass = () => process.env.NODE_ENV !== "production" && process.env.DEV_AUTH_BYPASS === "1";
const devUser: AuthUser = { uid: "dev-user", orgId: "org-dev", role: "Super Admin", name: "Jordan Reyes", email: "jordan@vendoriq.local" };

/** Verifies the JWT, then re-reads the user so a role change or deactivation takes effect immediately instead of when the 30-day token expires. */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) { if (devBypass()) { req.user = devUser; return next(); } return res.status(401).json({ error: "unauthenticated" }); }
  let claims: AuthUser;
  try { claims = jwt.verify(token, secret()) as AuthUser; } catch { if (devBypass()) { req.user = devUser; return next(); } return res.status(401).json({ error: "invalid_token" }); }
  if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(claims.uid)) {
    try {
      const u = await User.findById(claims.uid).select("orgId name email role active").lean();
      if (!u || !u.active) return res.status(401).json({ error: "account_disabled" });
      claims = { uid: claims.uid, orgId: String(u.orgId), role: u.role, name: u.name, email: u.email };
    } catch (e) { return next(e); }
  }
  req.user = claims; next();
}

const ADMINS = new Set<string>(ADMIN_ROLES);
/** Bidders are isolated: they only ever read and write records they own. */
export const isBidder = (u?: AuthUser) => u?.role === "Bidder";
export const isAdminUser = (u?: AuthUser) => !!u && ADMINS.has(u.role);
const WRITE_DENIED = new Set(["Viewer", "Contractor/Vendor"]);
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => (isAdminUser(req.user) ? next() : res.status(403).json({ error: "admin_only" }));
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => (req.user?.role === "Super Admin" ? next() : res.status(403).json({ error: "super_admin_only" }));
export const requireWrite = (req: Request, res: Response, next: NextFunction) => (req.user && !WRITE_DENIED.has(req.user.role) ? next() : res.status(403).json({ error: "read_only_role" }));

/** Shared secret between the Next.js server and this API. Production must set it; local dev falls back to a fixed key so OCR and the library work out of the box. */
const serviceKey = () => process.env.INTERNAL_API_KEY || (process.env.NODE_ENV === "production" ? "" : "dev-internal-key");

/** Browser users send a JWT; the Next.js server calls the API with INTERNAL_API_KEY. Either one is accepted. */
export function requireAuthOrService(req: Request, res: Response, next: NextFunction) {
  const key = serviceKey();
  const sent = req.headers["x-service-key"];
  if (key && typeof sent === "string") {
    const a = Buffer.from(sent), b = Buffer.from(key);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return next();
  }
  return requireAuth(req, res, next);
}
