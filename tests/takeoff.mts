/** Takeoff engine: spreadsheets are read without AI; AI proposals are kept only if their quote exists in the source. Run: npm run test:takeoff */
import ExcelJS from "exceljs";
import { extractFile } from "../src/lib/server/verified/extract";
import { extractTakeoff, takeoffFromText, qtyAppearsIn, parseNumber, type Ask } from "../src/lib/server/takeoff";

let n = 0; const ok = (c: unknown, m: string) => { if (!c) { console.error("FAIL:", m); process.exit(1); } console.log("ok ", ++n, m); };

// ---- spreadsheet (no AI)
const wb = new ExcelJS.Workbook(); const ws = wb.addWorksheet("BOQ");
ws.addRow(["Project: Smart meters"]); ws.addRow([]);
ws.addRow(["Item No.", "Item Description", "Unit", "Qty", "Unit Rate"]);
ws.addRow(["", "Water Meters"]);
ws.addRow(["1.1", "Smart water meter DN15", "EA", "1,250", 120]);
ws.addRow(["1.2", "Smart water meter DN20", "EA", 800, ""]);
ws.addRow(["", "Civil Works"]);
ws.addRow(["2.1", "Excavation and backfill", "m3", 4200.5, 35]);
ws.addRow(["2.2", "Mobilisation", "LS", "LS", ""]);
ws.addRow(["2.3", "Provisional sum", "", "TBA", ""]);
ws.addRow(["2.4", "Zero line", "EA", 0, ""]);
wb.addWorksheet("Cover").addRow(["Tender cover page", "no table here"]);
const file = new File([Buffer.from(await wb.xlsx.writeBuffer())], "BOQ.xlsx");
let asked = 0; const noAI: Ask = async () => { asked++; return { items: [] }; };
const x = await extractTakeoff((await extractFile(file)).text, noAI);
ok(asked === 0, "spreadsheet is read with no AI call");
ok(x.items.length === 4, `4 priced rows imported (got ${x.items.length})`);
const m1 = x.items.find((i) => i.code === "1.1")!;
ok(m1.qty === 1250 && m1.unit === "EA" && m1.rate === 120 && m1.category === "Water Meters", "1,250 parsed, rate and section heading kept");
ok(x.items.find((i) => i.code === "2.1")!.qty === 4200.5 && x.items.find((i) => i.code === "2.1")!.category === "Civil Works", "decimal qty and new section");
ok(x.items.find((i) => i.code === "2.2")!.qty === 1 && x.items.find((i) => i.code === "2.2")!.unit === "LS", "lump sum becomes qty 1");
ok(!x.items.some((i) => i.code === "2.3" || i.code === "2.4"), "non-numeric and zero quantities are not imported");
ok(x.warnings.some((w) => /TBA/.test(w)) && x.warnings.some((w) => /Cover/.test(w)), "skipped rows and sheets are reported, not silent");
ok(x.items.every((i) => i.status === "Needs Verification" && i.source === "spreadsheet" && i.quote.includes(i.description)), "every item awaits approval and carries its source row");

// ---- PDF/Word text (AI proposes, code verifies)
const doc = [
  "[[PAGE 1]]\nINTRODUCTION\nThis document describes the project background and general conditions.",
  "[[PAGE 2]]\n3.1 Supply\nThe Contractor shall supply and install 3,758 smart water meters DN15 complete with enclosures.",
  "[[PAGE 3]]\n3.2 Valves\nProvide twelve (12) isolation valves, 2 inch, and 40 sets of temporary power panels.",
  "[[PAGE 4]]\nGeneral safety statement with no numbers at all.",
].join("\n\n");
const fake: Ask = async () => ({ items: [
  { code: "A", description: "Smart water meter DN15", qty: 3758, unit: "EA", category: "Meters", clause: "3.1", quote: "The Contractor shall supply and install 3,758 smart water meters DN15 complete with enclosures." },
  { code: "B", description: "Isolation valves 2 inch", qty: 12, unit: "EA", category: "Valves", clause: "3.2", quote: "Provide twelve (12) isolation valves, 2 inch" },
  { code: "C", description: "Temporary power panel", qty: 40, unit: "sets", category: "Power", clause: "3.2", quote: "and 40 sets of temporary power panels." },
  { code: "D", description: "INVENTED transformers", qty: 99, unit: "EA", category: "Power", clause: "3.3", quote: "The Contractor shall supply 99 transformers." },
  { code: "E", description: "Smart water meter DN15 (again)", qty: 3758, unit: "EA", category: "Meters", clause: "3.1", quote: "The Contractor shall supply and install 3,758 smart water meters DN15 complete with enclosures." },
  { code: "F", description: "No quantity", qty: 0, unit: "EA", category: "x", clause: "", quote: "Provide twelve (12) isolation valves" },
] });
const t = await takeoffFromText(doc, fake);
ok(t.items.length === 3, `3 verified items kept, fabricated/duplicate/zero dropped (got ${t.items.length})`);
ok(!t.items.some((i) => /INVENTED/.test(i.description)), "item with a quote not in the document is discarded");
ok(t.items.find((i) => i.code === "A")!.page === 2 && t.items.find((i) => i.code === "B")!.page === 3, "page number found by code from where the quote sits");
ok(t.items.every((i) => i.checks.quoteFound) && t.items.find((i) => i.code === "A")!.checks.qtyInQuote === true, "quote-found and qty-in-quote checks recorded");
ok(t.pagesSkipped >= 2, "pages with no quantities are skipped (no AI cost)");
ok(t.warnings.some((w) => /discarded/.test(w)), "discarded items are reported");
const wordsQty = (await takeoffFromText("[[PAGE 1]]\nProvide twelve isolation valves qty to be confirmed 5", async () => ({ items: [{ description: "valves", qty: 12, unit: "EA", quote: "Provide twelve isolation valves" }] }))).items[0];
ok(wordsQty && wordsQty.checks.qtyInQuote === false, "qty written in words is flagged for a human check");
ok(qtyAppearsIn("1,250 pcs", 1250) && !qtyAppearsIn("DN150 pipe", 15) && parseNumber("SAR 1,200.50") === 1200.5, "number helpers");
let failMsg = ""; try { await takeoffFromText(doc, async () => { throw new Error("no_credentials"); }); } catch (e) { failMsg = (e as Error).message; }
ok(failMsg === "no_credentials", "missing AI credentials surfaces as an error, not an empty result");
const rate429 = await takeoffFromText(doc, async () => { throw new Error("rate limited"); });
ok(rate429.items.length === 0 && rate429.warnings.some((w) => /could not be read/.test(w)), "AI failure is reported, never turned into 'no items'");
console.log("TAKEOFF PASSED —", n, "checks");
