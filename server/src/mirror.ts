import { Record, Workspace, BidDocument, User } from "./models/index.js";

const PREVIEW = 4000;
const str = (v: unknown) => (v == null ? undefined : String(v));
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

/** Re-derive the readable workspaces / bid_documents rows for the given record ids from the Record source of truth. */
export async function mirrorRecords(orgId: unknown, collection: string, ids: string[]) {
  if ((collection !== "tenders" && collection !== "docs") || !ids.length) return;
  const rows = await Record.find({ orgId, collection, id: { $in: ids } }).lean();
  const ownerIds = [...new Set(rows.map((r) => r.ownerId && String(r.ownerId)).filter(Boolean))];
  const owners = new Map((await User.find({ _id: { $in: ownerIds } }).select("name email").lean()).map((u) => [String(u._id), u]));
  const ownerOf = (r: (typeof rows)[number]) => { const o = r.ownerId ? owners.get(String(r.ownerId)) : undefined; return { ownerId: r.ownerId, ownerName: o?.name ?? r.ownerName, ownerEmail: o?.email }; };
  if (collection === "tenders") {
    await Workspace.bulkWrite(rows.map((r) => { const d = r.data as Record<string, unknown>; return { updateOne: { filter: { orgId, tenderId: r.id }, update: { $set: { ...ownerOf(r), name: str(d.name), reference: str(d.reference), client: str(d.client), industry: str(d.industry), stage: str(d.stage), status: str(d.status), value: num(d.value), currency: str(d.currency), closing: str(d.closing), goNoGo: str(d.goNoGo), progress: num(d.progress), data: d } }, upsert: true } }; }), { ordered: false });
    return;
  }
  await BidDocument.bulkWrite(rows.map((r) => { const d = r.data as Record<string, unknown>; const text = typeof d.text === "string" ? d.text : ""; return { updateOne: { filter: { orgId, docId: r.id }, update: { $set: { ...ownerOf(r), tenderId: str(d.tenderId), name: str(d.name), kind: str(d.kind), size: num(d.size), rev: num(d.rev), status: str(d.status), pages: num(d.pages), language: str(d.language), confidentiality: str(d.confidentiality), uploadedAt: str(d.uploadedAt), uploadedBy: str(d.uploadedBy), textLength: text.length, textPreview: text.slice(0, PREVIEW), analysis: d.analysis, ocr: d.ocr } }, upsert: true } }; }), { ordered: false });
  // keep each workspace's document count current
  const tenderIds = [...new Set(rows.map((r) => str((r.data as Record<string, unknown>).tenderId)).filter(Boolean))] as string[];
  for (const tenderId of tenderIds) await Workspace.updateOne({ orgId, tenderId }, { documentCount: await BidDocument.countDocuments({ orgId, tenderId }) });
}

export async function unmirror(orgId: unknown, collection: string, ids: string[]) {
  if (!ids.length) return;
  if (collection === "tenders") await Workspace.deleteMany({ orgId, tenderId: { $in: ids } });
  if (collection === "docs") {
    const tenderIds = (await BidDocument.distinct("tenderId", { orgId, docId: { $in: ids } })).filter(Boolean) as string[];
    await BidDocument.deleteMany({ orgId, docId: { $in: ids } });
    for (const tenderId of tenderIds) await Workspace.updateOne({ orgId, tenderId }, { documentCount: await BidDocument.countDocuments({ orgId, tenderId }) });
  }
}
