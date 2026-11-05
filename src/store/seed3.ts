/** Mock data for the Infrastructure (t2), IT (t3) and a won Manufacturing (t4) tender so every tab has content. */
import type * as T from "./types";
const d = (s: string) => new Date(s).toISOString();

export const tender4: T.Tender = {
  id: "t4", name: "Atlas Fabrication Framework — Structural Steel", reference: "ATL-FA-2026-03", client: "Atlas Steel Fabrication", companyId: "co4", opportunityId: "op5",
  description: "Two-year framework for supply of fabricated structural steel modules for industrial plants, including shop drawings, coating and delivery DAP Izmir.",
  value: 4200000, currency: "EUR", closing: "2026-08-20", progress: 100, status: "Won", stage: "Awarded", industry: "manufacturing", service: "Fabrication", tenderType: "Framework Agreement", region: "Europe", owner: "K. Okonkwo",
  goNoGo: "GO", goNoGoReason: "Existing relationship; capacity available in Q4.", goNoGoScores: Object.fromEntries(["Strategic fit", "Technical capability", "Experience", "Compliance", "Financial attractiveness", "Expected margin", "Resource availability", "Schedule", "Location", "Competition", "Client relationship", "Contract risk", "Payment terms", "Probability of winning", "Required investment"].map((k, i) => [k, [5, 4, 5, 5, 4, 4, 4, 4, 4, 3, 5, 4, 4, 4, 5][i]])),
  scope: "Supply only", clientTerm: "Buyer", bidder: "Sole bidder", metadata: { "Client": "Atlas Steel Fabrication", "Submission deadline": "2026-08-20", "Contract type": "Framework supply agreement, call-off orders", "Payment terms": "30% on order, 70% on delivery, 45 days", "Bid validity": "90 days" }, createdAt: d("2026-06-01"),
};

export const actions: T.ActionItem[] = [
  { id: "a2", tenderId: "t2", title: "Confirm Grade 1 JV partner and draft JV agreement heads of terms", agent: "Contract & commercial lead", suggested: true, status: "ready", createdAt: d("2026-09-14") },
  { id: "a3", tenderId: "t2", title: "Extract BOQ quantities from RFP Volume 3 into cost build-up", agent: "Cost & pricing lead", status: "in_progress", createdAt: d("2026-09-12") },
  { id: "a4", tenderId: "t2", title: "Draft round-1 clarifications on utility diversions", agent: "Clarifications lead", status: "waiting", createdAt: d("2026-09-10") },
  { id: "a5", tenderId: "t3", title: "Secure LOI from in-country hosting partner", agent: "Tender manager", suggested: true, status: "in_progress", createdAt: d("2026-09-11") },
  { id: "a6", tenderId: "t3", title: "Map FHIR R4 interfaces to national ID system", agent: "Engineering lead", status: "backlog", createdAt: d("2026-09-13") },
  { id: "a7", tenderId: "t3", title: "Draft SLA schedule with service credits", agent: "Contract & commercial lead", status: "complete", createdAt: d("2026-09-05") },
];

export const docs: T.Doc[] = [
  { id: "d2", tenderId: "t2", name: "RFP Volume 1 - Instructions to Bidders.pdf", size: 3.1e6, rev: 1, kind: "RFP", status: "INDEXED", uploadedAt: d("2026-09-02"), uploadedBy: "Amira Haddad", language: "English", confidentiality: "Confidential", history: [{ rev: 0, at: d("2026-08-28"), by: "Amira Haddad", note: "Superseded by Addendum 1" }] },
  { id: "d3", tenderId: "t2", name: "RFP Volume 2 - Employer's Requirements.pdf", size: 18.4e6, rev: 0, kind: "Specifications", status: "INDEXED", uploadedAt: d("2026-09-02"), uploadedBy: "Amira Haddad", language: "English", confidentiality: "Confidential" },
  { id: "d4", tenderId: "t2", name: "RFP Volume 3 - BOQ.xlsx", size: 1.2e6, rev: 0, kind: "BOQ", status: "INDEXED", uploadedAt: d("2026-09-02"), uploadedBy: "Amira Haddad", language: "English", confidentiality: "Confidential" },
  { id: "d5", tenderId: "t2", name: "Conditions of Contract - FIDIC Yellow 2017 with PCC.pdf", size: 4.6e6, rev: 0, kind: "Contract", status: "INDEXED", uploadedAt: d("2026-09-03"), uploadedBy: "K. Okonkwo", language: "English", confidentiality: "Confidential" },
  { id: "d6", tenderId: "t2", name: "Addendum 1 - Revised drawings.zip", size: 92e6, rev: 0, kind: "Addendum", status: "PROCESSING", uploadedAt: d("2026-09-15"), uploadedBy: "Amira Haddad", language: "English", confidentiality: "Confidential" },
  { id: "d7", tenderId: "t3", name: "NHA-RFP-0092.pdf", size: 5.8e6, rev: 0, kind: "RFP", status: "INDEXED", uploadedAt: d("2026-09-08"), uploadedBy: "Priya Natarajan", language: "English", confidentiality: "Confidential" },
  { id: "d8", tenderId: "t3", name: "Annex B - Functional Requirements.xlsx", size: 0.9e6, rev: 0, kind: "Specifications", status: "INDEXED", uploadedAt: d("2026-09-08"), uploadedBy: "Priya Natarajan", language: "English", confidentiality: "Confidential" },
  { id: "d9", tenderId: "t3", name: "Annex D - Data Protection Requirements.pdf", size: 1.4e6, rev: 0, kind: "Terms & Conditions", status: "INDEXED", uploadedAt: d("2026-09-08"), uploadedBy: "Priya Natarajan", language: "English", confidentiality: "Restricted" },
  { id: "d10", tenderId: "t4", name: "Framework RFQ - Structural Steel.pdf", size: 2.2e6, rev: 0, kind: "RFQ", status: "INDEXED", uploadedAt: d("2026-06-05"), uploadedBy: "K. Okonkwo", language: "English", confidentiality: "Internal" },
];

const cl = (id: string, tenderId: string, n: number, ref: string, category: T.Clarification["category"], title: string, analysis: string, status: T.ReviewStatus, confidence: T.Confidence, pending: boolean, author: string, extra: Partial<T.Clarification> = {}): T.Clarification =>
  ({ id, tenderId, n, ref, round: 1, category, title, analysis, status, confidence, assignee: extra.assignee || "", due: extra.due || "", author, createdAt: d("2026-09-10"), pending, ...extra });
export const clarifications: T.Clarification[] = [
  cl("c7", "t2", 1, "ER §4.3", "Technical", "Utility diversions responsibility", "Employer's Requirements §4.3 lists existing 132 kV cables crossing the alignment at Ch. 3+200 but the BOQ has no item for diversion. Please confirm whether utility diversions are Employer-executed or included in the Contractor's scope, and if so under which BOQ item.", "Draft", "High", true, "TenderOS"),
  cl("c8", "t2", 2, "ITB §12.1", "Commercial", "Re-measurement of BOQ quantities", "The RFP describes a lump-sum Design & Build contract yet Volume 3 is a priced BOQ. Please confirm whether quantities are re-measurable or indicative only.", "Internal Review", "High", false, "Amira Haddad", { assignee: "K. Okonkwo" }),
  cl("c9", "t2", 3, "ER §9.1", "Technical", "Traffic management during construction", "Please confirm whether the Contractor may close one carriageway during night works (22:00–05:00) at Interchange 2, or whether all six lanes must remain open.", "Answered", "High", false, "Amira Haddad", { clientAnswer: "Night-time single-carriageway closures permitted with 14 days' notice to the Traffic Police." }),
  cl("c10", "t2", 4, "PCC §14.2", "Contractual", "Advance payment guarantee format", "Sub-Clause 14.2 requires an advance payment guarantee 'in the form annexed' but no form is annexed. Please provide the form.", "Draft", "Medium", true, "TenderOS"),
  cl("c11", "t3", 1, "RFP §6.4", "Technical", "Data residency via certified local partner", "§6.4.1 requires all PHI to be hosted in-country. Please confirm that hosting in a Tier III data centre operated by a locally licensed partner satisfies this requirement.", "Approved", "High", false, "Priya Natarajan", { assignee: "Priya Natarajan" }),
  cl("c12", "t3", 2, "RFP §7.2", "Technical", "Legacy data volumes", "Please provide record counts and storage volumes for the four legacy systems listed in §7.2 to size the migration.", "Draft", "High", true, "TenderOS"),
  cl("c13", "t3", 3, "RFP §12.1", "Commercial", "Payment currency", "Please confirm whether the managed-service fees are payable in USD or local currency and whether an exchange-rate adjustment applies.", "Draft", "Medium", false, "K. Okonkwo"),
  cl("c14", "t3", 4, "Annex D §3", "Contractual", "Sub-processor approval", "Annex D §3 requires prior written approval of sub-processors. Please confirm the approval timeline so cloud sub-processors can be named in the bid.", "Internal Review", "High", false, "Priya Natarajan"),
];

const kc = (id: string, tenderId: string, n: number, ref: string, title: string, category: string, relevance: T.Clause["relevance"], markup: string, analysis: string, status: T.ReviewStatus, pending: boolean, author: string, confidence: T.Confidence = "High"): T.Clause =>
  ({ id, tenderId, n, ref, title, category, relevance, markup, analysis, status, confidence, pending, author, createdAt: d("2026-09-09") });
export const clauses: T.Clause[] = [
  kc("k7", "t2", 1, "PCC §8.2", "Time for Completion - 24 months", "LD & Delay", "High", "Propose 30 months or phased completion per interchange with separate LD regimes.", "24 months for three interchanges and 14 km of highway is aggressive given utility diversions; delay LDs at 0.1%/day capped at 10%.", "Pending", true, "TenderOS", "Medium"),
  kc("k8", "t2", 2, "PCC §13.8", "Adjustments for Changes in Cost - deleted", "Payment", "High", "Reinstate Sub-Clause 13.8 with a cost index formula for bitumen, steel and cement.", "Price adjustment clause deleted in PCC; 30-month exposure to bitumen and steel prices.", "Pending", true, "TenderOS"),
  kc("k9", "t2", 3, "PCC §4.2", "Performance Security 15%", "Insurance", "Medium", "Reduce to 10% of Accepted Contract Amount per FIDIC standard.", "15% is above market norm and ties up bonding capacity.", "Approved", false, "K. Okonkwo"),
  kc("k10", "t2", 4, "PCC §17.6", "Limitation of Liability - deleted", "Liability", "High", "Reinstate cap at 100% of Accepted Contract Amount with exclusion of indirect loss.", "Sub-Clause 17.6 deleted; liability uncapped.", "Approved", false, "K. Okonkwo"),
  kc("k11", "t3", 1, "RFP §13.2", "Liability capped at 100% of annual fees", "Liability", "Low", "Accept.", "Market-standard cap; acceptable.", "Approved", false, "Priya Natarajan"),
  kc("k12", "t3", 2, "RFP §14", "IP in customisations vests in Client", "IP", "Medium", "Client owns configuration and data; Contractor retains platform IP and pre-existing tools with perpetual licence to Client.", "Blanket IP transfer would capture platform components.", "Pending", true, "TenderOS"),
  kc("k13", "t3", 3, "RFP §12.3", "Service credits up to 25% of monthly fee", "Payment", "Medium", "Cap service credits at 10% of monthly fee as sole remedy for SLA breach.", "25% is high; propose 10% with sole-remedy language.", "Pending", true, "TenderOS", "Medium"),
  kc("k14", "t3", 4, "RFP §15", "90-day termination for convenience", "Termination", "Medium", "Add recovery of unamortised implementation cost on termination in years 1–3.", "Convenience termination strands implementation investment.", "Approved", false, "K. Okonkwo"),
];

export const qualifications: T.Qualification[] = [
  { id: "q6", tenderId: "t2", n: 1, ref: "ITB §3.1(a)", text: "Bidder will satisfy the Grade 1 licence requirement through a joint venture with a locally licensed Grade 1 contractor (JV agreement to be executed before award).", rationale: "Northstar holds Grade 2; JV is the standard route accepted by the Ministry.", category: "Commercial", type: "Qualification", status: "Open", trust: "High", pending: true, draft: true, assignee: "", due: "", task: "To do", technicalImpact: "None", commercialImpact: "JV partner share ~35%", risk: "Medium" },
  { id: "q7", tenderId: "t2", n: 2, ref: "PCC §13.8", text: "Contract price subject to adjustment for bitumen, steel and cement per the formula in Appendix C.", rationale: "30-month fixed price with deleted 13.8 is unfinanceable.", category: "Contractual", type: "Deviation", status: "Open", trust: "High", pending: false, draft: false, assignee: "K. Okonkwo", due: "2026-10-30", task: "In progress", risk: "High", approval: "Pending" },
  { id: "q8", tenderId: "t3", n: 1, ref: "RFP §6.4.1", text: "PHI hosted in-country in a Tier III facility operated by Meridian Cloud Partners under Contractor's ISO 27001 controls.", rationale: "Meets residency; partner LOI in hand.", category: "Technical", type: "Qualification", status: "Open", trust: "High", pending: false, draft: false, assignee: "Priya Natarajan", due: "2026-10-10", task: "In progress", technicalImpact: "Adds one hop to integration latency", commercialImpact: "+USD 380k over 5 years", risk: "Low" },
  { id: "q9", tenderId: "t3", n: 2, ref: "RFP §14", text: "Contractor retains IP in the platform and pre-existing tools; Client receives a perpetual licence and owns configuration and data.", rationale: "Blanket transfer would capture core platform IP.", category: "Contractual", type: "Deviation", status: "Open", trust: "Medium", pending: true, draft: true, assignee: "", due: "", task: "To do", risk: "Medium" },
];

const rk = (id: string, tenderId: string, n: number, kind: T.Risk["kind"], title: string, description: string, category: string, p: number, i: number, pp: number, pi: number, owner: string, status: T.Risk["status"], mitigation: string, contingency: number): T.Risk => ({ id, tenderId, n, kind, title, description, category, probability: p, impact: i, postProbability: pp, postImpact: pi, owner, status, mitigation, contingency });
export const risks: T.Risk[] = [
  rk("r7", "t2", 1, "Risk", "Utility diversion delays", "132 kV and water mains crossings not in BOQ; diversions by utilities historically 6–9 months.", "Schedule", 4, 4, 3, 3, "Amira Haddad", "Open", "Clarify responsibility; sequence works away from crossings first.", 1800000),
  rk("r8", "t2", 2, "Risk", "Bitumen price escalation", "PCC deletes 13.8; bitumen ~9% of cost.", "Commercial", 4, 3, 2, 3, "K. Okonkwo", "Open", "Deviation q7; hedge via supplier fixed-price for 12 months.", 950000),
  rk("r9", "t2", 3, "Risk", "JV partner performance", "Grade 1 partner has limited interchange experience.", "Operational", 3, 3, 2, 2, "Amira Haddad", "Open", "Northstar leads engineering & PM; partner scope limited to civils.", 400000),
  rk("r10", "t2", 4, "Opportunity", "Value engineering on structures", "Precast segmental deck could save 8 weeks per interchange.", "Technical", 3, 4, 4, 4, "J. Silva", "Open", "Propose as alternative in technical proposal.", 0),
  rk("r11", "t3", 1, "Risk", "Migration scope creep", "Legacy data volumes unknown; four systems with inconsistent schemas.", "Technical", 4, 3, 3, 2, "Priya Natarajan", "Open", "Clarification c12; fixed-scope migration with T&M for extras.", 260000),
  rk("r12", "t3", 2, "Risk", "Hosting partner dependency", "Single local DC partner; SLA passthrough.", "Supply Chain", 3, 4, 2, 3, "Priya Natarajan", "Open", "Back-to-back SLA; second DC as DR site.", 180000),
  rk("r13", "t3", 3, "Risk", "Local-currency payment exposure", "Fees may be payable in KES.", "Financial", 3, 3, 2, 2, "K. Okonkwo", "Open", "Clarify; index to USD or add FX adjustment.", 120000),
  rk("r14", "t3", 4, "Opportunity", "Upsell analytics module", "NHA has budget line for population-health analytics in year 2.", "Commercial", 3, 3, 3, 3, "Amira Haddad", "Open", "Include optional priced module.", 0),
];

export const deliverables: T.Deliverable[] = [
  ...["Technical Proposal|Technical|Drafting", "Construction Methodology|Technical|Drafting", "Traffic Management Plan|Technical|Not started", "Site HSE Plan|Technical|Review", "Programme (Primavera)|Technical|Drafting", "Priced BOQ (Volume 3)|Commercial|Not started", "Form of Tender|Commercial|Approved", "Bid Security|Commercial|Not started", "JV Agreement heads of terms|Commercial|Drafting", "ICV Certificate|Commercial|Approved"].map((s, i) => { const [name, type, status] = s.split("|"); return { id: `dl2-${i}`, tenderId: "t2", n: i + 1, name, type: type as T.Deliverable["type"], owner: ["Amira Haddad", "J. Silva", "K. Okonkwo"][i % 3], status: status as T.Deliverable["status"], due: "2026-11-10" }; }),
  ...["Solution Architecture|Technical|Review", "Implementation & Migration Plan|Technical|Drafting", "Security & Data Protection Statement|Technical|Approved", "Training Plan|Technical|Not started", "Commercial Proposal|Commercial|Drafting", "SLA Schedule|Commercial|Approved", "Hosting Partner LOI|Commercial|Drafting", "ISO 27001 Certificate|Commercial|Approved"].map((s, i) => { const [name, type, status] = s.split("|"); return { id: `dl3-${i}`, tenderId: "t3", n: i + 1, name, type: type as T.Deliverable["type"], owner: ["Priya Natarajan", "K. Okonkwo"][i % 2], status: status as T.Deliverable["status"], due: "2026-10-25" }; }),
  ...["Technical Data Sheets|Technical|Approved", "Coating Specification|Technical|Approved", "Price Schedule|Commercial|Approved", "Delivery Programme|Commercial|Approved"].map((s, i) => { const [name, type, status] = s.split("|"); return { id: `dl4-${i}`, tenderId: "t4", n: i + 1, name, type: type as T.Deliverable["type"], owner: "K. Okonkwo", status: status as T.Deliverable["status"], due: "2026-08-15" }; }),
];

export const costLines: T.CostLine[] = [
  { id: "cl2-1", tenderId: "t2", wbs: "1.1", description: "Design & project management", category: "Engineering", qty: 42000, unit: "man-hours", rate: 85, contingency: 5 },
  { id: "cl2-2", tenderId: "t2", wbs: "2.1", description: "Earthworks (cut/fill)", category: "Earthworks", qty: 1850000, unit: "m3", rate: 6.5, contingency: 8 },
  { id: "cl2-3", tenderId: "t2", wbs: "2.2", description: "Structural concrete (bridges)", category: "Concrete", qty: 48000, unit: "m3", rate: 310, contingency: 7 },
  { id: "cl2-4", tenderId: "t2", wbs: "2.3", description: "Reinforcement steel", category: "Steel", qty: 6200, unit: "t", rate: 1150, contingency: 10 },
  { id: "cl2-5", tenderId: "t2", wbs: "2.4", description: "Asphalt (PMB)", category: "Asphalt", qty: 280000, unit: "t", rate: 62, contingency: 12 },
  { id: "cl2-6", tenderId: "t2", wbs: "3.1", description: "Traffic management", category: "Traffic management", qty: 24, unit: "months", rate: 145000, contingency: 5 },
  { id: "cl2-7", tenderId: "t2", wbs: "4.1", description: "Lighting & ITS subcontract", category: "Subcontractors", qty: 1, unit: "lump sum", rate: 4200000, contingency: 6 },
  { id: "cl2-8", tenderId: "t2", wbs: "5.1", description: "Site overheads & mobilisation", category: "Overheads", qty: 1, unit: "lump sum", rate: 3900000, contingency: 4 },
  { id: "cl3-1", tenderId: "t3", wbs: "1.1", description: "Implementation team (18 FTE × 14 months)", category: "Labor", qty: 43000, unit: "hours", rate: 68, contingency: 8 },
  { id: "cl3-2", tenderId: "t3", wbs: "1.2", description: "Data migration (4 legacy systems)", category: "Labor", qty: 9000, unit: "hours", rate: 72, contingency: 15 },
  { id: "cl3-3", tenderId: "t3", wbs: "2.1", description: "Platform licences (120 facilities, 5 yrs)", category: "Software licences", qty: 60, unit: "facility-years", rate: 21000, contingency: 0 },
  { id: "cl3-4", tenderId: "t3", wbs: "2.2", description: "In-country hosting (5 yrs)", category: "Cloud infrastructure", qty: 60, unit: "months", rate: 38000, contingency: 5 },
  { id: "cl3-5", tenderId: "t3", wbs: "3.1", description: "Training (120 sites)", category: "Training", qty: 120, unit: "sites", rate: 4500, contingency: 5 },
  { id: "cl3-6", tenderId: "t3", wbs: "4.1", description: "Support & maintenance (yrs 1–5)", category: "Support & maintenance", qty: 60, unit: "months", rate: 41000, contingency: 5 },
  { id: "cl4-1", tenderId: "t4", wbs: "1.1", description: "Fabricated steel modules", category: "Raw materials", qty: 3100, unit: "t", rate: 980, contingency: 4 },
  { id: "cl4-2", tenderId: "t4", wbs: "1.2", description: "Coating (C4)", category: "Materials", qty: 3100, unit: "t", rate: 110, contingency: 3 },
  { id: "cl4-3", tenderId: "t4", wbs: "2.1", description: "Delivery DAP Izmir", category: "Transportation", qty: 62, unit: "trucks", rate: 3400, contingency: 5 },
];

export const milestones: T.Milestone[] = [
  { id: "m2-1", tenderId: "t2", name: "Advance payment", pct: 10, date: "2027-03-01" }, { id: "m2-2", tenderId: "t2", name: "Design approval", pct: 10, date: "2027-08-01" }, { id: "m2-3", tenderId: "t2", name: "Interchange 1 open", pct: 30, date: "2028-06-01" }, { id: "m2-4", tenderId: "t2", name: "Interchanges 2 & 3 open", pct: 40, date: "2029-03-01" }, { id: "m2-5", tenderId: "t2", name: "Taking-over", pct: 10, date: "2029-06-01" },
  { id: "m3-1", tenderId: "t3", name: "Contract signature", pct: 20, date: "2027-01-15" }, { id: "m3-2", tenderId: "t3", name: "Pilot go-live (10 facilities)", pct: 20, date: "2027-07-01" }, { id: "m3-3", tenderId: "t3", name: "National go-live", pct: 20, date: "2028-03-01" }, { id: "m3-4", tenderId: "t3", name: "Managed service (annual)", pct: 40, date: "2029-03-01" },
];

export const reviews: T.Review[] = [
  { id: "rv5", tenderId: "t2", stage: "Technical Review", reviewer: "Priya Natarajan", status: "Pending", comment: "", at: d("2026-09-15") },
  { id: "rv6", tenderId: "t2", stage: "Legal Review", reviewer: "Dana Whitfield", status: "Revision requested", comment: "JV heads of terms must precede bid submission.", at: d("2026-09-14") },
  { id: "rv7", tenderId: "t3", stage: "Technical Review", reviewer: "Priya Natarajan", status: "Approved", comment: "Architecture sound; DR site to be confirmed.", at: d("2026-09-12") },
  { id: "rv8", tenderId: "t4", stage: "Commercial Review", reviewer: "K. Okonkwo", status: "Approved", comment: "", at: d("2026-08-10") },
  { id: "rv9", tenderId: "t4", stage: "Management Review", reviewer: "Dana Whitfield", status: "Approved", comment: "Proceed.", at: d("2026-08-12") },
];

export const priceVersions: T.PriceVersion[] = [
  { id: "pv2", tenderId: "t2", version: 1, cost: 61800000, margin: 9, discount: 0, tax: 0, price: 67912088, validity: "120 days", paymentTerms: "10% advance; monthly IPCs; 45 days", assumptions: "USD; excludes utility diversions; price adjustment per Appendix C.", locked: false, createdAt: d("2026-09-14") },
  { id: "pv3", tenderId: "t3", version: 1, cost: 9640000, margin: 18, discount: 0, tax: 0, price: 11756098, validity: "90 days", paymentTerms: "20% on signature; quarterly in arrears", assumptions: "USD; hosting via Meridian; migration fixed-scope.", locked: false, createdAt: d("2026-09-10") },
  { id: "pv4", tenderId: "t3", version: 2, cost: 9640000, margin: 15, discount: 2, tax: 0, price: 11113600, validity: "90 days", paymentTerms: "20% on signature; quarterly in arrears", assumptions: "Sharpened for price-to-win vs. local SI.", locked: false, createdAt: d("2026-09-15") },
  { id: "pv5", tenderId: "t4", version: 1, cost: 3590000, margin: 14, discount: 0, tax: 0, price: 4174419, validity: "90 days", paymentTerms: "30/70, 45 days", assumptions: "EUR; steel index at June 2026.", locked: true, approvedBy: "Dana Whitfield", createdAt: d("2026-08-08") },
];

export const proposalSections: T.ProposalSection[] = [
  { id: "ps6", tenderId: "t2", kind: "technical", title: "Executive Summary", body: "Northstar, in joint venture with a Grade 1 local partner, proposes a phased delivery of the three interchanges with precast segmental decks to de-risk the 24-month programme.", status: "Human Edited", order: 1 },
  { id: "ps7", tenderId: "t2", kind: "technical", title: "Construction methodology", body: "[AI DRAFT] Interchange 1 first (no utility crossings), night-time single-carriageway closures per clarification c9, precast yard at Km 6…", status: "AI Draft", order: 2 },
  { id: "ps8", tenderId: "t2", kind: "commercial", title: "Commercial Summary", body: "Lump sum USD 67,912,088 subject to price adjustment (Appendix C); excludes utility diversions.", status: "In Review", order: 1 },
  { id: "ps9", tenderId: "t3", kind: "technical", title: "Solution overview", body: "Cloud EHR for 120 facilities hosted in-country with Meridian Cloud Partners; FHIR R4 integration to national ID; 99.9% SLA.", status: "Approved", order: 1 },
  { id: "ps10", tenderId: "t3", kind: "technical", title: "Security & data protection", body: "ISO 27001 ISMS; PHI encrypted at rest and in transit; sub-processor register per Annex D.", status: "Human Edited", order: 2 },
  { id: "ps11", tenderId: "t3", kind: "commercial", title: "Pricing", body: "USD 11,113,600 over 5 years; 20% on signature, quarterly in arrears.", status: "Human Edited", order: 1 },
];

export const procPackages: T.ProcPackage[] = [
  { id: "pk5", tenderId: "t2", name: "Precast segmental deck units", category: "Subcontractors", requirement: "Design, cast and deliver ~1,900 segments per Volume 2 §7.", status: "Quotations", weights: { price: 50, lead: 25, quality: 15, compliance: 10 } },
  { id: "pk6", tenderId: "t2", name: "Lighting & ITS", category: "Equipment", requirement: "Highway lighting, VMS and CCTV per ER §11.", status: "RFQ sent", weights: { price: 50, lead: 20, quality: 15, compliance: 15 } },
  { id: "pk7", tenderId: "t3", name: "Training delivery (120 sites)", category: "Services", requirement: "On-site training and change management.", status: "Requirement", weights: { price: 40, lead: 20, quality: 30, compliance: 10 } },
];
export const quotations: T.Quotation[] = [
  { id: "qt5", packageId: "pk3", vendorId: "v4", price: 16_800_000, currency: "USD", leadWeeks: 6, quality: 4, compliance: 95, scope: "Full", notes: "12-month fixed price offered.", receivedAt: d("2026-09-12") },
  { id: "qt6", packageId: "pk5", vendorId: "v4", price: 9_400_000, currency: "USD", leadWeeks: 30, quality: 4, compliance: 92, scope: "Full", notes: "Yard at Km 6 included.", receivedAt: d("2026-09-14") },
  { id: "qt7", packageId: "pk4", vendorId: "v5", price: 2_280_000, currency: "USD", leadWeeks: 8, quality: 4, compliance: 98, scope: "Full", notes: "Tier III, in-country, DR in second site.", receivedAt: d("2026-09-11") },
];

export const approvals: T.Approval[] = [
  { id: "ap4", tenderId: "t2", subject: "Deviation — reinstate price adjustment (PCC §13.8)", kind: "Commercial proposal", requestedBy: "K. Okonkwo", approver: "Dana Whitfield", status: "Pending", reason: "", at: d("2026-09-15") },
  { id: "ap5", tenderId: "t4", subject: "Price v1 — EUR 4,174,419 @ 14%", kind: "Pricing", requestedBy: "K. Okonkwo", approver: "Dana Whitfield", status: "Approved", reason: "Within framework margin policy.", at: d("2026-08-09") },
  { id: "ap6", tenderId: "t4", subject: "Submission — Atlas Fabrication Framework", kind: "Submission", requestedBy: "K. Okonkwo", approver: "Dana Whitfield", status: "Approved", reason: "", at: d("2026-08-14") },
];

export const bidResults: T.BidResult[] = [
  { tenderId: "t4", status: "Awarded", finalPrice: 4174419, feedback: "Best combination of coating quality and delivery reliability.", competitor: "", reason: "", resultDate: "2026-09-05", winningFactors: ["Technical solution", "Relationship", "Schedule"], lossReasons: [] },
];

export const contracts: T.Contract[] = [
  { id: "ct1", tenderId: "t4", name: "Atlas Fabrication Framework — Contract", client: "Atlas Steel Fabrication", value: 4174419, currency: "EUR", signed: "2026-09-10", start: "2026-10-01", end: "2028-09-30", status: "Signed", terms: { "Payment Terms": "30% on order, 70% on delivery, 45 days", "Warranty": "24 months from delivery", "Liability": "Capped at 100% of call-off value", "Liquidated Damages": "0.5%/week, cap 5%", "Delivery Obligations": "DAP Izmir, Incoterms 2020", "Governing Law": "England & Wales" } },
];
export const projects: T.Project[] = [
  { id: "pj1", name: "Atlas Fabrication Framework — Structural Steel", tenderId: "t4", contractId: "ct1", createdAt: d("2026-09-12"), status: "Mobilising", progress: 8 },
];
export const submissions: T.SubmissionRecord[] = [
  { id: "sb1", tenderId: "t4", version: 1, at: d("2026-08-18T15:40:00"), by: "K. Okonkwo", method: "Portal", confirmation: "ATL-2026-000418", files: ["Technical Data Sheets.pdf", "Coating Specification.pdf", "Price Schedule.xlsx", "Delivery Programme.pdf"], checklist: [{ label: "All deliverables approved", ok: true }, { label: "Price baseline locked", ok: true }] },
];
export const lessons: T.Lesson[] = [
  { id: "l3", tender: "Atlas Fabrication Framework — Structural Steel", outcome: "Won", lesson: "Won at EUR 4.17M. Winning factors: Technical solution, Relationship, Schedule. Framework rates locked with a steel index protected margin.", date: "2026-09-05" },
];
