import { Router } from "express";
import { getExtractor } from "../embed.js";
import { verified } from "./verified.js";
import path from "path";
import fs from "fs";

export const standards = Router();
standards.use("/v", verified);

// Retrieval tuning for /search-batch (cosine similarity of all-MiniLM-L6-v2 embeddings).
// Below ~0.3 matches were observed to be unrelated standards; chunks under 80 chars are mostly headers/footers.
const MIN_RULE_SCORE = Number(process.env.STANDARDS_MIN_SCORE) || 0.3;
const MIN_RULE_CHARS = 80;
const MAX_RULES = 10;
const MAX_RULE_CHARS = 600;
const MAX_RULE_CHARS_TOTAL = 4000;

// LanceDB is loaded lazily: it ships no native binary for some platforms (e.g. Intel macOS),
// and a static import would stop the whole API from booting there.
async function loadLance() {
  try {
    return await import("@lancedb/lancedb");
  } catch (e: any) {
    throw new Error(`Standards library unavailable: LanceDB native module could not be loaded on ${process.platform}-${process.arch} (${e?.message?.split("\n")[0]})`);
  }
}

// Get LanceDB table
async function getTable() {
  const lancedb = await loadLance();
  const dbDir = path.join(process.cwd(), "data", "lancedb");
  const db = await lancedb.connect(dbDir);
  return await db.openTable("standards");
}

standards.post("/search", async (req, res, next) => {
  try {
    const { query, folder } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Missing query" });
    }

    const extractor = await getExtractor();
    const output = await extractor(query, { pooling: "mean", normalize: true });
    const queryVector = Array.from(output.data) as number[];

    const table = await getTable();
    
    // LanceDB built-in vector search
    let queryBuilder = table.search(queryVector).limit(3);
    if (folder) {
      queryBuilder = queryBuilder.where(`folder = '${folder}'`);
    }
    
    const results = await queryBuilder.toArray();

    const topChunks = results.map((c: any) => ({
      standardName: c.standardName,
      folder: c.folder,
      text: c.text,
      score: (1 - (c._distance || 0)).toFixed(4) // LanceDB returns distance, we convert to pseudo-similarity
    }));

    res.json({
      success: true,
      query,
      results: topChunks
    });
  } catch (err: any) {
    if (err.message && err.message.includes("does not exist")) {
      return res.json({ success: true, query: req.body.query, results: [] });
    }
    next(err);
  }
});

// A route for batch searching multiple chunks in parallel (for full document analysis)
standards.post("/search-batch", async (req, res, next) => {
  try {
    const { chunks, folder } = req.body;
    if (!chunks || !Array.isArray(chunks)) {
      return res.status(400).json({ error: "Missing chunks array" });
    }

    const extractor = await getExtractor();
    let table;
    try {
      table = await getTable();
    } catch (e) {
      return res.json({ success: true, results: [] }); // Library is empty
    }

    // Run feature extraction and DB search in parallel for all chunks, limit concurrency if needed, but for now `Promise.all` is fine.
    const allResults = await Promise.all(
      chunks.map(async (chunkText: string) => {
        try {
          if (!chunkText || chunkText.trim().length < 20) return [];
          const output = await extractor(chunkText, { pooling: "mean", normalize: true });
          const queryVector = Array.from(output.data) as number[];

          let queryBuilder = table.search(queryVector).limit(2);
          if (folder) queryBuilder = queryBuilder.where(`folder = '${folder}'`);
          return await queryBuilder.toArray();
        } catch (e) {
          console.error("Error searching chunk", e);
          return [];
        }
      })
    );

    // Flatten results and deduplicate by standard rule text to avoid feeding the LLM the exact same rule 50 times.
    // Drop weak matches (unrelated standards would otherwise be presented to the LLM as "rules to comply with")
    // and tiny chunks (page headers/footers, titles) that carry no requirement.
    const uniqueRules = new Map();
    allResults.flat().forEach((c: any) => {
      if (!c || !c.text || c.text.trim().length < MIN_RULE_CHARS || 1 - (c._distance || 0) < MIN_RULE_SCORE) return;
      if (!uniqueRules.has(c.text)) {
        uniqueRules.set(c.text, {
          standardName: c.standardName,
          folder: c.folder,
          text: c.text,
          score: (1 - (c._distance || 0)).toFixed(4)
        });
      }
    });

    // Return the top unique rules within a character budget so the analysis prompt stays inside Groq's free-tier TPM limit
    const sorted = Array.from(uniqueRules.values()).sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
    const topRules = [];
    let budget = MAX_RULE_CHARS_TOTAL;
    for (const r of sorted) {
      if (topRules.length >= MAX_RULES || budget <= 0) break;
      const text = r.text.replace(/\s+/g, " ").trim().slice(0, MAX_RULE_CHARS);
      topRules.push({ ...r, text });
      budget -= text.length;
    }

    res.json({
      success: true,
      searched: chunks.length,
      matchedAboveThreshold: sorted.length,
      results: topRules
    });
  } catch (err: any) {
    next(err);
  }
});

// A quick route to see what is in the local database
standards.get("/stats", async (req, res, next) => {
  try {
    const table = await getTable();
    const count = await table.countRows();
    res.json({ success: true, totalRules: count });
  } catch (err: any) {
    if (err.message && err.message.includes("does not exist")) {
      return res.json({ success: true, totalRules: 0, message: "Database not created yet" });
    }
    next(err);
  }
});

// A route to view raw database records
standards.get("/data", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const table = await getTable();
    const query = table.query().limit(limit);
    const results = await query.toArray();
    
    // Remove the vector array from the response to save bandwidth
    const cleanResults = results.map(row => {
      const { vector, ...rest } = row as any;
      return rest;
    });

    res.json({ success: true, data: cleanResults });
  } catch (err: any) {
    if (err.message && err.message.includes("does not exist")) {
      return res.json({ success: true, data: [] });
    }
    next(err);
  }
});

// Step 3: Evaluate proposal against standards using Groq LLM
standards.post("/evaluate", async (req, res, next) => {
  try {
    const { proposal, folder } = req.body;
    if (!proposal) return res.status(400).json({ error: "Missing proposal text" });

    // 1. Retrieve the relevant standards using LanceDB
    const extractor = await getExtractor();
    const output = await extractor(proposal, { pooling: "mean", normalize: true });
    const queryVector = Array.from(output.data) as number[];

    let table;
    try {
      table = await getTable();
    } catch(e) {
      return res.status(400).json({ error: "Library is empty. Please ingest PDFs first." });
    }
    
    let queryBuilder = table.search(queryVector).limit(3);
    if (folder) {
      queryBuilder = queryBuilder.where(`folder = '${folder}'`);
    }
    
    const topChunks = await queryBuilder.toArray();
    const retrievedText = topChunks.map((c: any) => `[${c.standardName}] ${c.text}`).join("\n\n");

    // 2. Fetch Groq keys from root .env.local manually
    let groqKey = "";
    try {
      const envLocalPath = path.resolve(process.cwd(), "../.env.local");
      const envLocal = fs.readFileSync(envLocalPath, "utf-8");
      const match = envLocal.match(/GROQ_API_KEYS=([^\n]+)/);
      if (match) {
        groqKey = match[1].split(",")[0].trim();
      }
    } catch (e) {
      console.error("Could not read groq key", e);
    }

    if (!groqKey) {
      return res.status(500).json({ error: "GROQ_API_KEYS not found in root .env.local" });
    }

    // 3. Ask Groq to check compliance
    const prompt = `You are a strict engineering compliance officer. 
Here are the relevant rules from the Master Library:
${retrievedText}

Here is the bidder's proposal:
"${proposal}"

Does the bidder comply with the rules? Respond with a clear COMPLIANT or NON-COMPLIANT verdict, followed by a short explanation.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: "Groq API error", details: errText });
    }

    const data = await response.json();
    const aiReview = data.choices[0].message.content;

    res.json({
      success: true,
      retrievedStandards: topChunks.map((c: any) => c.standardName),
      aiReview
    });
  } catch (err) {
    next(err);
  }
});

// Step 4: Evaluate PDF Document against standards
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const upload = multer({ storage: multer.memoryStorage() });

standards.post("/evaluate-file", upload.single("file"), async (req, res, next) => {
  try {
    const file = req.file;
    const folder = req.body.folder;
    if (!file) return res.status(400).json({ error: "Missing file" });

    // Parse the PDF text
    const pdfData = await pdfParse(file.buffer);
    const text = pdfData.text;
    
    // Chunk the text into meaningful paragraphs
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 50);

    if (paragraphs.length === 0) {
      return res.status(400).json({ error: "No readable text found in PDF" });
    }

    const extractor = await getExtractor();
    let table;
    try { table = await getTable(); } catch(e) { return res.status(400).json({ error: "Library is empty." }); }

    // Fetch Groq key
    let groqKey = "";
    try {
      const envLocalPath = path.resolve(process.cwd(), "../.env.local");
      const envLocal = fs.readFileSync(envLocalPath, "utf-8");
      const match = envLocal.match(/GROQ_API_KEYS=([^\n]+)/);
      if (match) groqKey = match[1].split(",")[0].trim();
    } catch (e) {}

    if (!groqKey) return res.status(500).json({ error: "GROQ_API_KEYS not found in root .env.local" });

    const reportItems = [];

    // Process up to 5 chunks to keep the response time reasonable for testing
    const chunksToProcess = paragraphs.slice(0, 5);

    for (const chunk of chunksToProcess) {
      const output = await extractor(chunk, { pooling: "mean", normalize: true });
      const queryVector = Array.from(output.data) as number[];

      let queryBuilder = table.search(queryVector).limit(2);
      if (folder) queryBuilder = queryBuilder.where(`folder = '${folder}'`);
      
      // FIX: use toArray() instead of execute()
      const topChunks = await queryBuilder.toArray();
      const retrievedText = topChunks.map((c: any) => `[${c.standardName}] ${c.text}`).join("\n\n");

      const prompt = `You are a strict engineering compliance officer. 
Here are the relevant rules from the Master Library:
${retrievedText}

Here is a section from the bidder's proposal:
"${chunk}"

Is this section COMPLIANT or NON-COMPLIANT? Respond with a clear verdict and short explanation.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
        body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [{ role: "user", content: prompt }], temperature: 0.1 })
      });

      if (response.ok) {
        const data = await response.json();
        reportItems.push({
          proposalText: chunk,
          aiReview: data.choices[0].message.content,
          retrievedStandards: topChunks.map((c: any) => c.standardName)
        });
      }
    }

    res.json({
      success: true,
      report: reportItems
    });
  } catch (err) {
    next(err);
  }
});
