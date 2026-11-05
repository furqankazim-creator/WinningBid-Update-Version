import bcrypt from "bcryptjs";
import { Org, User, Record as DataRecord } from "./models/index.js";
import { seedUserWorkspaces } from "./seed-demo.js";

/** Creates (once) the platform Super Admin from SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD. An existing account keeps its password but is promoted. */
export async function ensureSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase(); const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!email || !password) return;
  // Exactly one admin: the Super Admin. The old "Organization Admin" role no longer exists; its holders (and any extra Super Admin) become Tender Managers.
  const moved = await User.updateMany({ $or: [{ role: "Organization Admin" }, { role: "Super Admin", email: { $ne: email } }] }, { role: "Tender Manager" });
  if (moved.modifiedCount) console.log(`[auth] ${moved.modifiedCount} account(s) moved from admin roles to Tender Manager`);
  let user = await User.findOne({ email });
  if (user) {
    if (user.role !== "Super Admin" || !user.active) {
      user.role = "Super Admin";
      user.active = true;
      await user.save();
      console.log(`[auth] ${email} promoted to Super Admin`);
    }
  } else {
    const org = await Org.create({ name: process.env.SUPER_ADMIN_ORG || "BidWinning Platform", industries: [], seeded: true });
    user = await User.create({ orgId: org._id, name: process.env.SUPER_ADMIN_NAME || "Platform Admin", email, passwordHash: await bcrypt.hash(password, 10), role: "Super Admin" });
    console.log(`[auth] Super Admin created: ${email}`);
  }

  // Ensure Super Admin has 4 complete workspaces with AI analysis
  try {
    const count = await DataRecord.countDocuments({ orgId: user.orgId, ownerId: user._id, collection: "tenders" });
    if (count < 3) {
      await seedUserWorkspaces(user);
      console.log(`[bootstrap] Seeded 4 complete workspaces with AI analysis for Super Admin (${email})`);
    }
  } catch (err) {
    console.error("[bootstrap] Failed to seed default workspaces:", err);
  }
}
