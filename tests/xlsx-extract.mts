/** Spreadsheet extraction: a BOQ-style workbook becomes sheet blocks of " | "-joined rows. Run: npx tsx --tsconfig tsconfig.json tests/xlsx-extract.mts */
import ExcelJS from "exceljs";
import { extractFile } from "../src/lib/server/verified/extract";

const wb = new ExcelJS.Workbook();
const a = wb.addWorksheet("BOQ");
a.addRow(["Item", "Description", "Qty", "Unit", "Rate", "Amount"]);
a.addRow([1, "Smart water meter DN15 per 31-SAMSS-004", 5000, "ea", 120, { formula: "C2*E2", result: 600000 }]);
a.addRow([]);
a.addRow([2, "Centrifugal pump, NDT required", 12, "ea", 8500, { formula: "C4*E4", result: 102000 }]);
wb.addWorksheet("Empty");
const c = wb.addWorksheet("Notes"); c.addRow(["Vendor shall provide ISO 9001 QA/QC manual"]);
const buf = Buffer.from(await wb.xlsx.writeBuffer());

let n = 0; const ok = (c: unknown, m: string) => { if (!c) { console.error("FAIL:", m); process.exit(1); } console.log("ok ", ++n, m); };
const r = await extractFile(new File([buf], "BOQ.xlsx"));
ok(r.text.includes("Sheet: BOQ") && r.text.includes("Sheet: Notes"), "each non-empty sheet becomes a block");
ok(!r.text.includes("Sheet: Empty"), "empty sheet skipped");
ok(r.text.includes("1 | Smart water meter DN15 per 31-SAMSS-004 | 5000 | ea | 120 | 600000"), "row cells joined, formula shows its value");
ok(r.pages === 2, "pages = number of sheets with content");
let err = ""; try { await extractFile(new File([Buffer.from("x")], "old.xls")); } catch (e) { err = (e as Error).message; }
ok(/XLSX/.test(err) && /\.xls/.test(err), "legacy .xls gives a clear message");
console.log("XLSX EXTRACT PASSED —", n, "checks");
