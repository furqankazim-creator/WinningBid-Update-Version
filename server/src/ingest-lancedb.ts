import "dotenv/config";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import { pipeline } from "@xenova/transformers";
import * as lancedb from "@lancedb/lancedb";

function findPdfs(dir: string, fileList: string[] = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findPdfs(filePath, fileList);
    } else if (filePath.toLowerCase().endsWith(".pdf")) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function run() {
  console.log("Connecting to local LanceDB (saving to server/data/lancedb)...");
  const dbDir = path.join(process.cwd(), "data", "lancedb");
  if (!fs.existsSync(path.join(process.cwd(), "data"))) fs.mkdirSync(path.join(process.cwd(), "data"));
  
  const db = await lancedb.connect(dbDir);
  
  console.log("Loading embedding model...");
  const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

  const targetFolders = process.argv.slice(2);
  if (targetFolders.length === 0) {
    console.error(`Usage: npx tsx src/ingest-lancedb.ts <path-to-folder-1> [path-to-folder-2] ...`);
    process.exit(1);
  }

  // Create table if not exists (with a dummy row so schema is inferred, then delete it)
  const dummyVector = Array(384).fill(0);
  let table;
  const tableNames = await db.tableNames();
  if (!tableNames.includes("standards")) {
    table = await db.createTable("standards", [{ vector: dummyVector, text: "dummy", standardName: "dummy", folder: "dummy" }]);
    await table.delete("text = 'dummy'");
  } else {
    table = await db.openTable("standards");
  }

  for (const targetFolder of targetFolders) {
    if (!fs.existsSync(targetFolder)) continue;

    const folderName = path.basename(targetFolder);
    console.log(`\nScanning for PDFs in ${folderName}...`);
    const allPdfs = findPdfs(targetFolder);
    
    if (allPdfs.length === 0) continue;
    console.log(`Found ${allPdfs.length} PDFs. Starting ingestion to local storage...`);

    for (const filePath of allPdfs) {
      const standardName = path.basename(filePath, ".pdf");
      console.log(`Processing Standard: ${standardName}...`);

      try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);

        const paragraphs = pdfData.text
          .split(/\n\s*\n/)
          .map((p: string) => p.trim())
          .filter((p: string) => p.length > 20);

        // Delete existing chunks for this standard so we don't duplicate
        await table.delete(`standardName = '${standardName}'`);

        let count = 0;
        let batch = [];
        for (const text of paragraphs) {
          const output = await extractor(text, { pooling: "mean", normalize: true });
          batch.push({
            vector: Array.from(output.data),
            text,
            standardName,
            folder: folderName
          });
          count++;

          // Insert in batches of 100 for memory safety
          if (batch.length >= 100) {
            await table.add(batch);
            batch = [];
          }
        }
        
        // Insert remaining
        if (batch.length > 0) {
          await table.add(batch);
        }
        
        console.log(` ✅ Embedded and saved ${count} chunks to local disk for ${standardName}.`);
      } catch (err: any) {
        console.error(` ❌ Failed to parse ${path.basename(filePath)}: ${err.message}`);
      }
    }
  }

  console.log(`\n🎉 All folders processed! Data is permanently saved locally in server/data/lancedb.`);
  process.exit(0);
}

run().catch(console.error);
