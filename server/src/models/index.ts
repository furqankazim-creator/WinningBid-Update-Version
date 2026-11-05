import mongoose, { Schema } from "mongoose";

export const ROLES = ["Super Admin", "Business Development", "Tender Manager", "Technical Manager", "Engineer", "Procurement Manager", "Commercial Manager", "Finance", "Legal", "Compliance", "Project Manager", "Reviewer", "Executive", "Viewer", "Contractor/Vendor", "Bidder"] as const;
/** Administrators manage the organisation and can see every bidder's workspace. Bidders only ever see their own. */
export const ADMIN_ROLES = ["Super Admin"] as const;

const orgSchema = new Schema({ name: { type: String, required: true }, industries: [String], plan: { type: String, default: "Team" }, currency: { type: String, default: "USD" }, seeded: { type: Boolean, default: false } }, { timestamps: true });
export const Org = mongoose.model("Org", orgSchema);

const userSchema = new Schema({ orgId: { type: Schema.Types.ObjectId, ref: "Org", required: true, index: true }, name: { type: String, required: true }, email: { type: String, required: true, unique: true, lowercase: true, trim: true }, passwordHash: { type: String, required: true }, role: { type: String, enum: ROLES, default: "Viewer" }, active: { type: Boolean, default: true }, company: { type: String, default: "" }, phone: { type: String, default: "" }, title: { type: String, default: "" }, lastLoginAt: Date }, { timestamps: true });
export const User = mongoose.model("User", userSchema);

const inviteSchema = new Schema({ orgId: { type: Schema.Types.ObjectId, ref: "Org", required: true, index: true }, email: { type: String, required: true, lowercase: true, trim: true }, role: { type: String, enum: ROLES, default: "Viewer" }, token: { type: String, required: true, unique: true }, invitedBy: String, acceptedAt: Date, expiresAt: { type: Date, required: true } }, { timestamps: true });
export const Invite = mongoose.model("Invite", inviteSchema);

/** Generic org-scoped record. Every business collection (tenders, requirements, risks, …) is stored as {collection, id, data}. */
const recordSchema = new Schema({ orgId: { type: Schema.Types.ObjectId, ref: "Org", required: true }, collection: { type: String, required: true }, id: { type: String, required: true }, data: { type: Schema.Types.Mixed, required: true }, ownerId: { type: Schema.Types.ObjectId, ref: "User", index: true }, ownerName: String, updatedBy: String }, { timestamps: true, minimize: false });
recordSchema.index({ orgId: 1, collection: 1, id: 1 }, { unique: true });
recordSchema.index({ orgId: 1, collection: 1, updatedAt: -1 });
export const Record = mongoose.model("Record", recordSchema);

/** Readable per-bidder mirror of tenders → "workspaces" (browse it in MongoDB Compass). The source of truth stays in Record. */
const workspaceSchema = new Schema({ orgId: { type: Schema.Types.ObjectId, required: true, index: true }, ownerId: { type: Schema.Types.ObjectId, ref: "User", index: true }, ownerName: String, ownerEmail: String, tenderId: { type: String, required: true }, name: String, reference: String, client: String, industry: String, stage: String, status: String, value: Number, currency: String, closing: String, goNoGo: String, progress: Number, documentCount: { type: Number, default: 0 }, data: Schema.Types.Mixed }, { timestamps: true, minimize: false, collection: "workspaces" });
workspaceSchema.index({ orgId: 1, tenderId: 1 }, { unique: true });
export const Workspace = mongoose.model("Workspace", workspaceSchema);

/** Readable per-bidder mirror of docs → "bid_documents": metadata + a text preview (full text lives in Record). */
const bidDocSchema = new Schema({ orgId: { type: Schema.Types.ObjectId, required: true, index: true }, ownerId: { type: Schema.Types.ObjectId, ref: "User", index: true }, ownerName: String, ownerEmail: String, docId: { type: String, required: true }, tenderId: { type: String, index: true }, name: String, kind: String, size: Number, rev: Number, status: String, pages: Number, language: String, confidentiality: String, uploadedAt: String, uploadedBy: String, textLength: { type: Number, default: 0 }, textPreview: String, analysis: Schema.Types.Mixed, ocr: Schema.Types.Mixed }, { timestamps: true, minimize: false, collection: "bid_documents" });
bidDocSchema.index({ orgId: 1, docId: 1 }, { unique: true });
export const BidDocument = mongoose.model("BidDocument", bidDocSchema);

/** Immutable audit trail (append-only; no update/delete routes exist). */
const auditSchema = new Schema({ orgId: { type: Schema.Types.ObjectId, required: true, index: true }, at: { type: Date, default: Date.now }, user: String, action: String, entity: String, entityId: String, detail: String }, { timestamps: false });
export const Audit = mongoose.model("Audit", auditSchema);

/** Org-wide singleton settings (margin, profile prefs, active tender per user is client-side). */
const settingsSchema = new Schema({ orgId: { type: Schema.Types.ObjectId, required: true, unique: true }, data: { type: Schema.Types.Mixed, default: {} } }, { timestamps: true, minimize: false });
export const Settings = mongoose.model("Settings", settingsSchema);

export const COLLECTIONS = ["tenders", "actions", "projects", "vendors", "docs", "clarifications", "clauses", "qualifications", "risks", "deliverables", "costLines", "milestones", "lessons", "companies", "contacts", "opportunities", "activities", "requirements", "complianceItems", "capabilities", "aiSummaries", "reviews", "approvals", "priceVersions", "proposalSections", "bidResults", "inquiries", "contracts", "aiLog", "notifications", "customIndustries", "procPackages", "quotations", "submissions", "chat"] as const;
export type CollectionName = (typeof COLLECTIONS)[number];
/** Collections whose records are keyed by tenderId rather than id. */
export const KEYED_BY_TENDER = new Set(["aiSummaries", "bidResults"]);
