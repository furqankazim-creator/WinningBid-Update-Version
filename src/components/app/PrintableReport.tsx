"use client";
import { useStore, tenderHealth, daysLeft } from "@/store/useStore";
import { format } from "date-fns";
import { useReportScore } from "@/components/app/ReportExports";

export function PrintableReport({ tenderId }: { tenderId: string }) {
  const s = useStore(); const score = useReportScore(tenderId);
  const tender = s.tenders.find((t) => t.id === tenderId);
  const sum = s.aiSummaries.find((x) => x.tenderId === tenderId);
  const reqs = s.requirements.filter((r) => r.tenderId === tenderId);
  const compliance = s.complianceItems.filter((c) => c.tenderId === tenderId);
  const risks = s.risks.filter((r) => r.tenderId === tenderId);
  const clarifications = s.clarifications.filter((c) => c.tenderId === tenderId);
  
  if (!tender || !sum) return null;

  const h = tenderHealth(s, tender.id);
  const revs = s.reviews.filter((r) => r.tenderId === tender.id);
  const readiness = Math.round((revs.filter((r) => r.status === "Approved").length / Math.max(revs.length, 7)) * 100);
  const hiRisks = risks.filter((r) => r.kind === "Risk" && r.status === "Open" && r.probability * r.impact >= 10).length;

  return (
    <div className="hidden print:block print:w-full print:bg-white print:text-black font-sans p-8 text-sm">
      <style>{`@media print { thead { display: table-header-group; } tr, .keep { break-inside: avoid; } h2 { break-after: avoid; } }`}</style>
      <div className="border-b-4 border-gray-900 pb-6 mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 text-gray-900 tracking-tight">BidWinning AI Compliance Report</h1>
          <p className="text-xl font-medium text-gray-700">Project: <span className="font-bold text-gray-900">{tender.name}</span></p>
          <p className="text-gray-600 mt-1">Client: {tender.client} | Reference: {tender.reference}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Generated</p>
          <p className="text-base font-bold text-gray-900">{new Date(sum.generatedAt).toLocaleString()}</p>
          <div className="mt-4 px-4 py-2 bg-gray-100 rounded text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Tender Health</p>
            <p className={`text-2xl font-bold ${h.score >= 70 ? 'text-green-600' : h.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
              {h.score}<span className="text-sm text-gray-500">/100</span>
            </p>
          </div>
          {score && <div className="mt-2 px-4 py-2 bg-gray-100 rounded text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Report Score</p>
            <p className={`text-2xl font-bold ${score.score >= 70 ? 'text-green-600' : score.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{score.score}<span className="text-sm text-gray-500">/100 · {score.grade}</span></p>
            <p className="text-[10px] text-gray-500">{score.label}</p>
          </div>}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded shadow-sm">
          <p className="text-xs text-blue-600 uppercase tracking-wide font-bold mb-1">Go / No-Go Decision</p>
          <p className={`text-lg font-bold ${tender.goNoGo === 'GO' ? 'text-green-700' : tender.goNoGo === 'NO-GO' ? 'text-red-700' : 'text-blue-900'}`}>{tender.goNoGo}</p>
        </div>
        <div className="bg-green-50 border border-green-200 p-4 rounded shadow-sm">
          <p className="text-xs text-green-700 uppercase tracking-wide font-bold mb-1">Submission Readiness</p>
          <p className="text-lg font-bold text-green-900">{readiness}% Ready</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded shadow-sm">
          <p className="text-xs text-yellow-700 uppercase tracking-wide font-bold mb-1">High Risks</p>
          <p className="text-lg font-bold text-yellow-900">{hiRisks} Open</p>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded shadow-sm">
          <p className="text-xs text-red-700 uppercase tracking-wide font-bold mb-1">Missing Documents</p>
          <p className="text-lg font-bold text-red-900">{compliance.filter((c) => ["Missing", "Expired"].includes(c.status)).length} Missing</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold border-b border-gray-300 mb-4">1. Executive Summary</h2>
        <div className="space-y-2">
          {sum.sections["Executive Summary"]?.map((p, i) => (
            <p key={i}>{typeof p === "object" ? JSON.stringify(p) : p}</p>
          ))}
        </div>
      </div>

      <div className="mb-8 p-4 bg-gray-100 border border-gray-300 rounded">
        <h2 className="text-xl font-bold mb-2">2. AI Recommendation</h2>
        <p className="font-bold text-lg mb-2">Verdict: {sum.recommendation.verdict}</p>
        <p>{sum.recommendation.reasoning}</p>
      </div>

      <div className="mb-8" style={{ pageBreakBefore: "always" }}>
        <h2 className="text-xl font-bold border-b border-gray-300 mb-4">3. Master Library Compliance Verification</h2>
        <p className="mb-4 text-sm text-gray-600">The following rules from the Master Library were verified against the bidder proposal.</p>
        <table className="w-full text-left border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2 w-1/4">Standard / Topic</th>
              <th className="border border-gray-300 p-2 w-1/12">Status</th>
              <th className="border border-gray-300 p-2 w-1/4">Evidence</th>
              <th className="border border-gray-300 p-2 w-1/3">Notes</th>
              <th className="border border-gray-300 p-2 w-1/12">Owner</th>
            </tr>
          </thead>
          <tbody>
            {compliance.length === 0 && (
              <tr><td colSpan={5} className="border border-gray-300 p-2 text-center text-gray-500">No compliance items recorded.</td></tr>
            )}
            {compliance.map((c) => (
              <tr key={c.id}>
                <td className="border border-gray-300 p-2 font-semibold align-top">{c.item}</td>
                <td className="border border-gray-300 p-2 align-top font-bold text-center">
                  <span className={`${c.status === 'Compliant' ? 'text-green-700' : c.status === 'Non-Compliant' ? 'text-red-700' : 'text-yellow-700'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="border border-gray-300 p-2 align-top text-xs">{c.evidence || "—"}</td>
                <td className="border border-gray-300 p-2 align-top text-xs">{c.notes || "—"}</td>
                <td className="border border-gray-300 p-2 align-top text-xs">{c.owner || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-8" style={{ pageBreakBefore: "always" }}>
        <h2 className="text-xl font-bold border-b border-gray-300 mb-4">4. Key Project Requirements</h2>
        <table className="w-full text-left border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2 w-[10%]">Category</th>
              <th className="border border-gray-300 p-2 w-[8%]">Priority</th>
              <th className="border border-gray-300 p-2 w-[32%]">Requirement Text</th>
              <th className="border border-gray-300 p-2 w-[25%]">Evidence / Docs</th>
              <th className="border border-gray-300 p-2 w-[15%]">Source Location</th>
              <th className="border border-gray-300 p-2 w-[10%]">Status</th>
            </tr>
          </thead>
          <tbody>
            {reqs.length === 0 && (
              <tr><td colSpan={6} className="border border-gray-300 p-2 text-center text-gray-500">No requirements extracted.</td></tr>
            )}
            {reqs.map((r) => (
              <tr key={r.id}>
                <td className="border border-gray-300 p-2 align-top text-xs font-semibold">{r.category}</td>
                <td className="border border-gray-300 p-2 align-top text-xs text-center">{r.priority}</td>
                <td className="border border-gray-300 p-2 align-top">{r.text}</td>
                <td className="border border-gray-300 p-2 align-top text-xs text-gray-700">{r.evidence || "—"}</td>
                <td className="border border-gray-300 p-2 align-top text-xs text-gray-600">
                  {r.section ? `Sec: ${r.section}` : ""} {r.clause ? `Cl: ${r.clause}` : ""} {r.page ? `Pg: ${r.page}` : ""}
                  {(!r.section && !r.clause && !r.page) && "—"}
                </td>
                <td className="border border-gray-300 p-2 align-top text-xs font-semibold">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold border-b border-gray-300 mb-4">5. Identified Risks</h2>
        <ul className="list-disc pl-5 space-y-2">
          {risks.length === 0 && <li className="text-gray-500">No major risks identified.</li>}
          {risks.map(r => (
            <li key={r.id}>
              <strong>{r.title}</strong>: {r.description} <br/>
              <span className="italic text-gray-600">Mitigation: {r.mitigation}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold border-b border-gray-300 mb-4">6. Recommended Clarifications (Ask Client)</h2>
        <ul className="list-disc pl-5 space-y-2">
          {clarifications.length === 0 && <li className="text-gray-500">No clarifications required.</li>}
          {clarifications.map(c => (
            <li key={c.id}>
              <strong>{c.title}</strong>: {c.analysis}
            </li>
          ))}
        </ul>
      </div>

      {sum.report && (() => { const rp = sum.report!; const ap = rp.approvals; const okF = rp.findings.filter((f) => ap[f.id]?.decision === "Approved"); const pend = rp.findings.filter((f) => !ap[f.id]); const hi = rp.issues.filter((i) => i.severity === "High" || i.severity === "Medium"); return (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-bold border-b border-gray-300 mb-4">7. Verification Statement</h2>
            <table className="w-full text-xs border border-gray-300"><tbody>
              <tr><td className="border p-2 font-semibold w-48">Library used</td><td className="border p-2">Local standards library v{rp.library.version} · {rp.library.rows.toLocaleString()} rows · {rp.library.codedStandards} coded standards{rp.library.indexedAt ? ` · indexed ${new Date(rp.library.indexedAt).toLocaleDateString()}` : ""}{rp.library.unavailable ? ` — UNAVAILABLE: ${rp.library.unavailable}` : ""}</td></tr>
              <tr><td className="border p-2 font-semibold">Model / prompt</td><td className="border p-2">{rp.model} · {rp.promptVersion} · {rp.depth} depth · {rp.stats.aiCalls} AI calls</td></tr>
              <tr><td className="border p-2 font-semibold">Coverage</td><td className="border p-2">{rp.coverage.pagesRead} of {rp.coverage.pagesTotal} pages read{rp.coverage.unreadablePages.length ? ` (NOT read: pages ${rp.coverage.unreadablePages.join(", ")})` : ""} · {rp.coverage.statements} requirements extracted with exact quotes · {rp.coverage.judged} judged against the library · {rp.coverage.codesVerified} of {rp.coverage.codesCited} cited references verified in the library{rp.coverage.ocrRecoveredLines ? ` · ${rp.coverage.ocrRecoveredLines} line(s) recovered by OCR` : ""}</td></tr>
              <tr><td className="border p-2 font-semibold">Automatic checks</td><td className="border p-2">Every quotation was matched against its source page; every rule id was re-read from the database and its revision status confirmed. {rp.stats.aiStatementsDropped} AI statement(s) dropped and {rp.stats.failedChecks} AI judgement(s) downgraded because they failed these checks.</td></tr>
              <tr><td className="border p-2 font-semibold">Human review</td><td className="border p-2">{okF.length} finding(s) approved · {Object.values(ap).filter((a) => a.decision === "Rejected").length} rejected · {pend.length} pending. {okF.length ? `Approved by ${[...new Set(okF.map((f) => ap[f.id].by))].join(", ")}.` : "No finding has been approved yet."}</td></tr>
            </tbody></table>
            <p className="mt-2 text-xs italic text-gray-600">AI-assisted, human-verified. Items marked pending have not been approved by a reviewer.</p>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-bold border-b border-gray-300 mb-4">8. Library-Checked Findings ({okF.length} approved)</h2>
            {okF.length === 0 && <p className="text-gray-500 text-sm">No findings approved yet — {pend.length} pending review.</p>}
            {okF.map((f) => (
              <div key={f.id} className="mb-3 text-xs border-l-4 pl-3" style={{ borderColor: f.verdict === "Conflicts" ? "#dc2626" : f.verdict === "Conforms" ? "#16a34a" : f.verdict === "Reference only" ? "#2563eb" : "#9ca3af" }}>
                <p><strong>{f.verdict}</strong> — p.{f.page}, §{f.section}{f.ocr ? " (OCR)" : ""}</p>
                <p className="italic">“{f.quote.slice(0, 300)}{f.quote.length > 300 ? "…" : ""}”</p>
                {f.standardName && <p>Library rule — <strong>{f.standardName}</strong>: “{f.ruleQuote}”</p>}
                <p>{f.reasoning}</p>
                <p className="text-gray-500">Approved by {ap[f.id].by} on {new Date(ap[f.id].at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-bold border-b border-gray-300 mb-4">9. Consistency &amp; Coverage Findings</h2>
            {hi.length === 0 && <p className="text-gray-500 text-sm">No high or medium findings.</p>}
            <ul className="list-disc pl-5 space-y-1 text-xs">{hi.map((i) => <li key={i.id}><strong>[{i.severity}] {i.title}</strong>{i.pages.length ? ` (p.${i.pages.slice(0, 12).join(", ")})` : ""}: {i.detail}{i.items?.length ? ` — ${i.items.slice(0, 8).join("; ")}${i.items.length > 8 ? "; …" : ""}` : ""}</li>)}</ul>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-bold border-b border-gray-300 mb-4">10. AI Knowledge Notes (unverified)</h2>
            <p className="text-xs italic text-gray-600 mb-2">{rp.knowledge.disclaimer}</p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              {rp.knowledge.editions.map((e, i) => <li key={`e${i}`}><strong>{e.code}</strong> (cited {e.cited}) — {e.status}: {e.note}</li>)}
              {rp.knowledge.omitted.map((o, i) => <li key={`o${i}`}><strong>{o.name}</strong>{o.code ? ` (${o.code})` : ""} [{o.jurisdiction}] — {o.reason}{o.libraryVerified ? ` · exists in library: ${o.libraryName}` : " · not verified in library"}</li>)}
            </ul>
          </div>
          {score && (
            <div className="mb-8 keep">
              <h2 className="text-xl font-bold border-b border-gray-300 mb-4">11. Report Score — {score.score}/100 (Grade {score.grade}, {score.label})</h2>
              <table className="w-full text-xs border border-gray-300"><thead><tr className="bg-gray-100"><th className="border p-2 text-left">Component</th><th className="border p-2 w-16">Score</th><th className="border p-2 w-16">Weight</th><th className="border p-2 text-left">Basis</th></tr></thead><tbody>
                {score.parts.map((p) => <tr key={p.key}><td className="border p-2 font-semibold">{p.label}</td><td className="border p-2 text-center">{Math.round(p.score)}</td><td className="border p-2 text-center">{p.weight}%</td><td className="border p-2">{p.detail}</td></tr>)}
              </tbody></table>
              {score.limits.length > 0 && <ul className="mt-2 list-disc pl-5 text-xs space-y-1">{score.limits.map((l, i) => <li key={i}>{l}</li>)}</ul>}
              <p className="mt-2 text-xs italic text-gray-600">The Report Score measures how complete, verified and trustworthy this analysis is. It is not Tender Health (bid readiness), and defects found in the tender do not lower it.</p>
              <h3 className="mt-4 text-sm font-bold">Tender Health factors ({h.score}/100)</h3>
              <table className="w-full text-xs border border-gray-300 mt-1"><tbody>{h.factors.map((f) => <tr key={f.label}><td className="border p-1.5 w-40">{f.label}</td><td className="border p-1.5 w-16 text-center">{f.na ? "n/a" : `${f.value}%`}</td><td className="border p-1.5 text-gray-600">{f.hint || ""}</td></tr>)}</tbody></table>
            </div>
          )}
          <div className="mb-8">
            <h2 className="text-xl font-bold border-b border-gray-300 mb-4">12. Requirements Register ({reqs.length})</h2>
            <p className="text-xs text-gray-600 mb-2">Every requirement is the verbatim sentence from the source with its page and clause. Library check shows the verdict where the requirement was judged against the standards library.</p>
            <table className="w-full text-[9px] border border-gray-300"><thead><tr className="bg-gray-100 text-left"><th className="border p-1 w-8">#</th><th className="border p-1 w-14">Page / clause</th><th className="border p-1 w-16">Category</th><th className="border p-1 w-9">Prio</th><th className="border p-1">Requirement</th><th className="border p-1 w-20">Status</th><th className="border p-1 w-24">Library check</th></tr></thead><tbody>
              {reqs.map((r, i) => <tr key={r.id}><td className="border p-1 text-gray-500">{i + 1}</td><td className="border p-1 font-mono">p.{r.page}<br />§{r.clause}</td><td className="border p-1">{r.category}</td><td className="border p-1">{r.priority}</td><td className="border p-1">{r.text.length > 520 ? r.text.slice(0, 520) + "…" : r.text}</td><td className="border p-1">{r.status}{r.reviewer ? <><br /><span className="text-gray-500">{r.reviewer}</span></> : null}</td><td className="border p-1">{(r.comments.match(/Library check: ([^·]+)/)?.[1] || "—").trim()}</td></tr>)}
            </tbody></table>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-bold border-b border-gray-300 mb-4">13. Compliance Register ({compliance.length})</h2>
            <table className="w-full text-[10px] border border-gray-300"><thead><tr className="bg-gray-100 text-left"><th className="border p-1.5 w-8">#</th><th className="border p-1.5">Compliance item / obligation</th><th className="border p-1.5 w-24">Status</th><th className="border p-1.5 w-20">Owner</th><th className="border p-1.5 w-56">Source / notes</th></tr></thead><tbody>
              {compliance.map((c, i) => <tr key={c.id}><td className="border p-1.5 text-gray-500">{i + 1}</td><td className="border p-1.5">{c.item}</td><td className="border p-1.5">{c.status}</td><td className="border p-1.5">{c.owner || "—"}</td><td className="border p-1.5 text-gray-600">{c.notes}{c.evidence ? ` · Evidence: ${c.evidence}` : ""}</td></tr>)}
            </tbody></table>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-bold border-b border-gray-300 mb-4">14. Library-Checked Findings — all ({rp.findings.length})</h2>
            <table className="w-full text-[9px] border border-gray-300"><thead><tr className="bg-gray-100 text-left"><th className="border p-1 w-20">Verdict</th><th className="border p-1 w-14">Page / clause</th><th className="border p-1">Requirement</th><th className="border p-1">Library rule &amp; reasoning</th><th className="border p-1 w-16">Review</th></tr></thead><tbody>
              {rp.findings.map((f) => <tr key={f.id}><td className="border p-1 font-semibold" style={{ color: f.verdict === "Conflicts" ? "#b91c1c" : f.verdict === "Conforms" ? "#15803d" : f.verdict === "Reference only" ? "#1d4ed8" : "#4b5563" }}>{f.verdict}<br /><span className="font-normal text-gray-500">{f.confidence}</span></td><td className="border p-1 font-mono">p.{f.page}<br />§{f.section}</td><td className="border p-1">{f.quote.length > 300 ? f.quote.slice(0, 300) + "…" : f.quote}</td><td className="border p-1">{f.standardName ? <><b>{f.standardName}</b>: “{f.ruleQuote}”<br /></> : null}{f.reasoning}{f.knowledge ? <><br /><i>AI knowledge (unverified): {f.knowledge}</i></> : null}</td><td className="border p-1">{ap[f.id] ? `${ap[f.id].decision} — ${ap[f.id].by}` : "Pending"}</td></tr>)}
            </tbody></table>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-bold border-b border-gray-300 mb-4">15. Standards Register ({rp.registry.length} references)</h2>
            <table className="w-full text-[9px] border border-gray-300"><thead><tr className="bg-gray-100 text-left"><th className="border p-1 w-28">Reference</th><th className="border p-1 w-32">Status</th><th className="border p-1">Library file (active revision)</th><th className="border p-1 w-24">Cited on pages</th></tr></thead><tbody>
              {rp.registry.map((r) => <tr key={r.code}><td className="border p-1 font-mono">{r.code}</td><td className="border p-1">{r.status.replace(/-/g, " ")}</td><td className="border p-1">{r.libraryName || "—"}{r.titleInTender ? <span className="text-gray-500"> · {r.titleInTender}</span> : null}</td><td className="border p-1">{[...new Set(r.citations.map((c) => c.page))].sort((a, b) => a - b).slice(0, 8).join(", ")}</td></tr>)}
            </tbody></table>
          </div>
        </>
      ); })()}

    </div>
  );
}
