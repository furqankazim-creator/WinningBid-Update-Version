"use client";

import { useState } from "react";
import { Search, Loader2, ShieldCheck, ShieldAlert, UploadCloud } from "lucide-react";
import { Card, Button, Input, PageHeader, Label } from "@/components/ui";
import { authFetch } from "@/lib/authFetch";

export default function MasterLibraryPage() {
  const [proposal, setProposal] = useState("We will use DIN standard pipe fittings for the fire water system.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileReport, setFileReport] = useState<any>(null);

  const analyzeProposal = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await authFetch("/api/standards/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal, folder: "Saudi Aramco Standards" })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
      setResult({ error: "Failed to connect to AI engine. Make sure you restart your terminal server!" });
    } finally {
      setLoading(false);
    }
  };

  const analyzeFile = async () => {
    if (!file) return;
    setFileLoading(true);
    setFileReport(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "Saudi Aramco Standards"); // Or allow selection

      const res = await authFetch("/api/standards/evaluate-file", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFileReport(data.report);
    } catch (e: any) {
      console.error(e);
      setFileReport([{ error: e.message || "Failed to analyze document." }]);
    } finally {
      setFileLoading(false);
    }
  };

  // Drag and Drop handlers
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="font-sans pb-12">
      <PageHeader 
        title="Master Library Compliance Agent" 
        sub="Automatically evaluate bidder proposals against the engineered rules in your Master Standards Library using Groq LLM." 
      />

      {/* TEXT EVALUATION SECTION */}
      <div className="mt-8 mb-4 px-4 text-lg font-bold">1. Quick Text Snippet Check</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 mb-12">
        <div className="space-y-4">
          <Card className="p-4 flex flex-col gap-3">
            <Label>Bidder Proposal Text</Label>
            <textarea
              className="w-full h-32 rounded border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text outline-none focus:border-app-accent"
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              placeholder="Paste bidder proposal here..."
            />
            <Button onClick={analyzeProposal} disabled={loading || !proposal} className="self-start gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Analyze Compliance
            </Button>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 min-h-[14rem]">
            <Label className="mb-4 block">AI Verdict</Label>
            {!result && !loading && (
              <div className="text-app-dim text-sm h-full flex items-center justify-center pt-8">
                Run analysis to see results
              </div>
            )}
            {loading && (
              <div className="text-app-accent text-sm h-full flex flex-col items-center justify-center pt-8 gap-2">
                <Loader2 size={24} className="animate-spin" />
                <span>Running vector search and Groq evaluation...</span>
              </div>
            )}
            {result && result.error && (
              <div className="text-red-500 text-sm font-semibold">{result.error} {result.details}</div>
            )}
            {result && result.aiReview && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  {result.aiReview.includes("NON-COMPLIANT") ? (
                    <ShieldAlert size={24} className="text-red-500 mt-1" />
                  ) : (
                    <ShieldCheck size={24} className="text-green-500 mt-1" />
                  )}
                  <div className="text-sm text-app-text whitespace-pre-wrap">
                    {result.aiReview}
                  </div>
                </div>
                
                {result.retrievedStandards && result.retrievedStandards.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-app-border">
                    <Label className="mb-2 block text-xs">Based on standards:</Label>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(result.retrievedStandards)).map((std: any) => (
                        <span key={std} className="px-2 py-1 bg-app-panel border border-app-border rounded text-xs text-app-muted">
                          {std}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* FULL PDF EVALUATION SECTION */}
      <div className="px-4 text-lg font-bold mb-4 border-t border-app-border pt-8">2. Full Document Upload (PDF)</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        <div className="space-y-4">
          <Card 
            className={`p-6 flex flex-col items-center justify-center border-dashed border-2 gap-4 min-h-[14rem] transition-colors ${isDragging ? "border-indigo-500 bg-indigo-500/10" : "bg-app-panel border-app-border"}`}
            onDragEnter={(e) => e.preventDefault()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadCloud size={48} className={isDragging ? "text-indigo-400" : "text-app-muted"} />
            <div className="text-center">
              <Label className="block mb-2 cursor-pointer text-indigo-500 hover:underline">
                Select a PDF File (or Drop it here)
                <input 
                  type="file" 
                  accept=".pdf,application/pdf"
                  className="hidden" 
                  onChange={(e) => e.target.files && setFile(e.target.files[0])} 
                />
              </Label>
              <span className="text-sm text-app-dim">{file ? file.name : "No file selected"}</span>
            </div>
            
            <Button onClick={analyzeFile} disabled={fileLoading || !file} className="gap-2 mt-4">
              {fileLoading && <Loader2 size={14} className="animate-spin" />}
              Generate Full PDF Report
            </Button>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 min-h-[14rem] max-h-[30rem] overflow-y-auto">
            <Label className="mb-4 block">Full Document Compliance Report</Label>
            
            {!fileReport && !fileLoading && (
              <div className="text-app-dim text-sm h-full flex items-center justify-center pt-8">
                Upload a PDF to generate a report
              </div>
            )}
            
            {fileLoading && (
              <div className="text-app-accent text-sm h-full flex flex-col items-center justify-center pt-8 gap-2">
                <Loader2 size={24} className="animate-spin" />
                <span>Reading PDF, chunking, and evaluating...</span>
              </div>
            )}
            
            {fileReport && fileReport.length > 0 && (
              <div className="space-y-6">
                {fileReport[0].error ? (
                  <div className="text-red-500 text-sm font-semibold">{fileReport[0].error}</div>
                ) : (
                  fileReport.map((item: any, idx: number) => (
                    <div key={idx} className="pb-4 border-b border-app-border last:border-0">
                      <div className="text-xs text-app-dim mb-2 italic">"{item.proposalText}"</div>
                      <div className="flex items-start gap-2">
                        {item.aiReview.includes("NON-COMPLIANT") ? (
                          <ShieldAlert size={16} className="text-red-500 shrink-0 mt-0.5" />
                        ) : (
                          <ShieldCheck size={16} className="text-green-500 shrink-0 mt-0.5" />
                        )}
                        <span className="text-sm text-app-text">{item.aiReview}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

    </div>
  );
}

