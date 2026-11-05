/**
 * Lifecycle test: walks one tender through every workspace tab using the real store actions and asserts each link.
 * Run: npm run test:lifecycle   (no API or LLM needed — AI steps are covered by tests/e2e-api and the /api/analyze live test)
 */
const mem = new Map<string, string>();
(globalThis as any).localStorage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => mem.set(k, v), removeItem: (k: string) => mem.delete(k) };
(globalThis as any).window = globalThis; (globalThis as any).location = { pathname: "/app", href: "" };
const { useStore, tenderHealth, goNoGoVerdict, scoped } = await import("../src/store/useStore.ts");
const { totals } = await import("../src/lib/pricing.ts");
let n = 0; const ok = (c: unknown, m: string) => { n++; if (!c) { console.error(`FAIL ${n}: ${m}`); process.exit(1); } console.log(`ok ${String(n).padStart(2)}  ${m}`); };
const S = () => useStore.getState();

// 1. CRM → Tender
const coId = S().addCompany({ name: "Lifecycle Client", industry: "construction", type: "Prospect" });
const opId = S().addOpportunity({ name: "Lifecycle Opportunity", companyId: coId, value: 5_000_000, probability: 20 });
const tid = S().convertOpportunityToTender(opId);
ok(!!tid && S().tenders.some((t) => t.id === tid) && S().opportunities.find((o) => o.id === opId)!.stage === "Tender", "opportunity converts into a tender workspace (CRM → Tender)");
S().setActiveTender(tid);
const h0 = tenderHealth(S(), tid).score; ok(h0 === 0, `new tender starts at health 0 (got ${h0})`);

// 2. Documents (scoped) → 3. Requirements → 4. Compliance
S().addDocs([{ name: "ITT.pdf", size: 1000 }]); await new Promise((r) => setTimeout(r, 2000));
ok(scoped(S().docs, tid).length === 1 && scoped(S().docs, tid)[0].status === "INDEXED", "document is scoped to the active tender and indexed");
S().addRequirement({ tenderId: tid, text: "ISO 9001 certified", category: "Certification", ai: true });
S().addRequirement({ tenderId: tid, text: "Grade 1 licence", category: "Licensing", ai: true });
const reqs = () => S().requirements.filter((r) => r.tenderId === tid);
ok(reqs().length === 2 && reqs().every((r) => r.status === "Needs Verification"), "AI requirements enter as Needs Verification");
S().updateRequirement(reqs()[0].id, { status: "Approved" }); S().updateRequirement(reqs()[1].id, { status: "Non-Compliant" });
ok(tenderHealth(S(), tid).factors.find((f) => f.label === "Requirements")!.value === 100, "verifying requirements moves the Requirements health factor to 100%");
S().applyComplianceTemplate(tid, ["ISO 9001", "Contractor licence"]);
const comp = () => S().complianceItems.filter((c) => c.tenderId === tid);
ok(comp().length === 2 && comp().every((c) => c.status === "Unknown"), "industry compliance template applied");
S().updateComplianceItem(comp()[0].id, { status: "Compliant" });
ok(tenderHealth(S(), tid).factors.find((f) => f.label === "Compliance")!.value === 50, "compliance factor = 1 of 2 compliant = 50%");

// 5. Go/No-Go → Approval
const scores = Object.fromEntries(["Strategic fit", "Technical capability", "Experience", "Compliance", "Financial attractiveness", "Expected margin", "Resource availability", "Schedule", "Location", "Competition", "Client relationship", "Contract risk", "Payment terms", "Probability of winning", "Required investment"].map((k) => [k, 4]));
ok(goNoGoVerdict(scores).verdict === "GO" && goNoGoVerdict({ ...scores, "Contract risk": 1 }).verdict === "CONDITIONAL GO", "scorecard verdict rules (GO; critical criterion caps to CONDITIONAL)");
const approvalsBefore = S().approvals.length;
S().setGoNoGo(tid, scores, "GO", "test"); S().requestApproval({ tenderId: tid, subject: "Go/No-Go", kind: "Go/No-Go", requestedBy: "t", approver: "Exec", reason: "" });
ok(S().tenders.find((t) => t.id === tid)!.goNoGo === "GO" && S().approvals.length === approvalsBefore + 1, "Go/No-Go recorded, stage advanced, approval requested");

// 6. Clarifications / Contract / Risks (scoped, accept flow)
S().addClarification({ ref: "§1", title: "Q1", analysis: "?" }); S().addClause({ ref: "§2", title: "Cap", markup: "Cap at 100%" }); S().addRisk({ title: "Risk A", probability: 4, impact: 4 });
ok(scoped(S().clarifications, tid).length === 1 && scoped(S().clauses, tid).length === 1 && scoped(S().risks, tid).length === 1, "clarification, clause and risk are created in the active tender only");
const cl = scoped(S().clarifications, tid)[0]; S().updateClarification(cl.id, { pending: true }); S().acceptClarification(cl.id);
ok(scoped(S().clarifications, tid)[0].status === "Approved" && !scoped(S().clarifications, tid)[0].pending, "accepting an AI clarification approves it");
S().updateRisk(scoped(S().risks, tid)[0].id, { mitigation: "Mitigate" });
ok(tenderHealth(S(), tid).factors.find((f) => f.label === "Risk")!.value === 100, "risk with mitigation counts toward Risk health");

// 7. Costing → 8. Pricing → approval → lock
S().addCostLine(); const line = scoped(S().costLines, tid)[0]; S().updateCostLine(line.id, { qty: 100, rate: 1000, contingency: 10 });
const cost = totals(scoped(S().costLines, tid), S().margin).cost; ok(cost === 110000, `cost build-up = qty×rate + contingency (${cost})`);
S().createPriceVersion(tid, { cost, margin: 10, discount: 0, tax: 0, price: cost / 0.9, validity: "90d", paymentTerms: "30d", assumptions: "" });
const pv = S().priceVersions.filter((p) => p.tenderId === tid); ok(pv.length === 1 && pv[0].version === 1 && !pv[0].locked, "price version v1 created unlocked");
ok(tenderHealth(S(), tid).factors.find((f) => f.label === "Pricing")!.value === 60, "draft price → Pricing health 60");
S().requestApproval({ tenderId: tid, subject: "Price v1", kind: "Pricing", requestedBy: "t", approver: "Exec", reason: "" });
const ap = S().approvals.find((a) => a.tenderId === tid && a.kind === "Pricing")!; S().decideApproval(ap.id, "Approved", "ok"); S().lockPrice(pv[0].id);
ok(S().priceVersions.find((p) => p.id === pv[0].id)!.locked && tenderHealth(S(), tid).factors.find((f) => f.label === "Pricing")!.value === 100, "approved price locked → Pricing health 100");
S().createPriceVersion(tid, { cost, margin: 12, discount: 0, tax: 0, price: cost / 0.88, validity: "90d", paymentTerms: "30d", assumptions: "" });
ok(S().priceVersions.filter((p) => p.tenderId === tid).length === 2 && S().priceVersions.filter((p) => p.tenderId === tid)[1].version === 2, "changing price after lock creates v2");

// 9. Proposals → 10. Reviews
S().addProposalSection({ tenderId: tid, kind: "technical", title: "Methodology", body: "x", status: "Human Edited" }); S().addProposalSection({ tenderId: tid, kind: "commercial", title: "Pricing", body: "x", status: "Human Edited" });
S().addReview({ tenderId: tid, stage: "Technical Review", reviewer: "R", status: "Pending", comment: "" });
const rv = S().reviews.find((r) => r.tenderId === tid)!; S().updateReview(rv.id, { status: "Approved", comment: "fine" });
ok(S().reviews.find((r) => r.id === rv.id)!.status === "Approved" && S().auditLog.some((a) => a.action === "Review Approved"), "review approval recorded and audited");
const h1 = tenderHealth(S(), tid).score; ok(h1 > 60, `health rose from 0 to ${h1} as tabs were completed`);

// 11. Submission → 12. Result → 13. Contract → 14. Project → 15. Lessons
S().recordSubmission({ tenderId: tid, method: "Portal", confirmation: "ABC", files: ["a.pdf"], checklist: [] });
ok(S().submissions.some((x) => x.tenderId === tid && x.version === 1) && S().tenders.find((t) => t.id === tid)!.stage === "Submitted", "submission recorded with version; stage → Submitted");
S().setBidResult({ tenderId: tid, status: "Awarded", finalPrice: 122222, feedback: "", competitor: "", reason: "", resultDate: "2026-10-01", winningFactors: ["Price"], lossReasons: [] });
ok(S().tenders.find((t) => t.id === tid)!.status === "Won" && S().opportunities.find((o) => o.id === opId)!.stage === "Won", "award flows back: tender Won, CRM opportunity Won");
const ctId = S().createContract(tid); S().convertToProject(tid);
ok(!!ctId && S().contracts.some((c) => c.tenderId === tid && c.value === 122222) && S().projects.some((p) => p.tenderId === tid), "contract created from locked price/result and project converted");
S().addLesson({ tender: "Lifecycle", outcome: "Won", lesson: "test", date: "2026-10-01" });
ok(S().lessons[0].lesson === "test", "lesson learned recorded");
ok(S().auditLog.filter((a) => a.entityId === tid || a.entity === "Tender").length >= 4, "audit trail captured the key decisions");
console.log(`\nLIFECYCLE PASSED — ${n} checks`);
process.exit(0);
