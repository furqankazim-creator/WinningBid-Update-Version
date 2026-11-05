import "dotenv/config";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import { pipeline } from "@xenova/transformers";
import mongoose from "mongoose";
import { connectDb } from "./db.js";
import { StandardChunk } from "./models/StandardChunk.js";

// Helper to recursively find all .pdf files
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
  await connectDb();
  console.log("Connected to DB.");

  console.log("Loading embedding model...");
  const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

  const targetFolders = process.argv.slice(2);
  if (targetFolders.length === 0) {
    console.error(`Usage: npx tsx src/ingest-standard.ts <path-to-folder-1> [path-to-folder-2] ...`);
    process.exit(1);
  }

  for (const targetFolder of targetFolders) {
    if (!fs.existsSync(targetFolder)) {
      console.error(`Folder not found: ${targetFolder}. Skipping...`);
      continue;
    }

    const folderName = path.basename(targetFolder);
    console.log(`\nScanning for PDFs in ${folderName} (including all subfolders)...`);
    const allPdfs = findPdfs(targetFolder);
    
    if (allPdfs.length === 0) {
      console.log(`No PDFs found anywhere in ${targetFolder}`);
      continue;
    }

    console.log(`Found ${allPdfs.length} PDFs. Starting ingestion...`);

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

        await StandardChunk.deleteMany({ standardName });

        let count = 0;
        for (const text of paragraphs) {
          const output = await extractor(text, { pooling: "mean", normalize: true });
          
          await StandardChunk.create({
            standardName,
            folder: folderName,
            page: 1,
            text,
            embedding: Array.from(output.data)
          });
          count++;
        }
        console.log(` ✅ Embedded and stored ${count} chunks for ${standardName}.`);
      } catch (err: any) {
        console.error(` ❌ Failed to parse ${path.basename(filePath)}: ${err.message}`);
      }
    }
  }

  console.log(`\n🎉 All folders and subfolders processed! Data is permanently saved in Atlas.`);
  process.exit(0);
}

run().catch(console.error);
