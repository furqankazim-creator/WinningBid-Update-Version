import type * as T from "./types";

const d = (s: string) => new Date(s).toISOString();

const base = { currency: "CAD", progress: 0, status: "Active Campaign" as const, goNoGoScores: {}, scope: "Full scope", clientTerm: "Client", bidder: "Sole bidder", createdAt: d("2026-09-01") };
export const tenders: T.Tender[] = [
  { ...base, id: "t1", name: "Flemish Pass SURF EPCI", reference: "CP-ITT-2026-014", client: "Crescent Power Ltd", companyId: "co1", opportunityId: "op1",
    description: "Engineering, Procurement, Construction and Installation of subsea umbilicals, risers and flowlines for the Flemish Pass development, offshore Newfoundland.",
    value: 186000000, closing: "2027-03-15", progress: 62, stage: "Bid Preparation", industry: "oil-gas", service: "EPC / EPCI", tenderType: "ITT", region: "North America", owner: "Jordan Reyes",
    goNoGo: "GO", goNoGoReason: "Strong technical fit; liability cap deviation required.", goNoGoScores: { "Strategic fit": 5, "Technical capability": 5, "Experience": 4, "Compliance": 4, "Financial attractiveness": 4, "Expected margin": 3, "Resource availability": 4, "Schedule": 3, "Location": 4, "Competition": 3, "Client relationship": 4, "Contract risk": 2, "Payment terms": 3, "Probability of winning": 3, "Required investment": 3 },
    scope: "EPCI (full)", clientTerm: "Client/Tenderer",
    metadata: {
      "Client": "Crescent Power Ltd", "Submission deadline": "2027-03-15",
      "Scope summary": "Design, engineer, procure, fabricate, inspect, test, transport, install and commission all SURF components for the Flemish Pass development.",
      "Bid validity": "180 calendar days after the Tender Submission Deadline", "Clarification deadline": "2026-09-30T18:00:00",
      "Clarification channel": "Email via tender clarification form to technical and commercial contacts listed in the ITT cover letter.",
      "Contract type": "Engineering, Procurement and Construction (EPC) Contract for subsea SURF systems", "Governing law": "Laws of the Province of Newfoundland and Labrador, Canada",
      "Payment terms": "The contract price shall be deemed full compensation for all Work. Milestone payments as per Schedule 4.", "Local content / entity": "Minimum 30% Canadian content by value required per NFLD local content guidelines.",
    } },
  { ...base, id: "t2", name: "Ring Road Phase 3 — Interchanges", reference: "MoT/RFP/2026/087", client: "Ministry of Transport", companyId: "co2", opportunityId: "op2", currency: "USD",
    description: "Design and construction of three grade-separated interchanges and 14 km of six-lane highway including drainage, lighting and ITS.",
    value: 74000000, closing: "2026-11-20", progress: 28, stage: "Qualification", industry: "infrastructure", service: "Roads", tenderType: "Government Procurement", region: "Middle East", owner: "Amira Haddad",
    goNoGo: "Pending", metadata: { "Client": "Ministry of Transport", "Submission deadline": "2026-11-20", "Contract type": "Design & Build, FIDIC Yellow Book", "Bid validity": "120 days", "Local content / entity": "Minimum 40% in-country value." } },
  { ...base, id: "t3", name: "National Health Records Platform", reference: "NHA-RFP-0092", client: "National Health Authority", companyId: "co3", opportunityId: "op3", currency: "USD",
    description: "Cloud-hosted electronic health records platform for 120 facilities: implementation, data migration, integration with national ID and 5-year managed service.",
    value: 12500000, closing: "2026-10-30", progress: 45, stage: "Go/No-Go", industry: "it", service: "Cloud Services", tenderType: "RFP", region: "Africa", owner: "Priya Natarajan",
    goNoGo: "CONDITIONAL GO", goNoGoReason: "Data residency requirement needs local hosting partner.", goNoGoScores: { "Strategic fit": 5, "Technical capability": 4, "Experience": 3, "Compliance": 3, "Financial attractiveness": 4, "Expected margin": 4, "Resource availability": 3, "Schedule": 4, "Location": 2, "Competition": 3, "Client relationship": 3, "Contract risk": 3, "Payment terms": 4, "Probability of winning": 3, "Required investment": 3 },
    metadata: { "Client": "National Health Authority", "Submission deadline": "2026-10-30", "Contract type": "Software implementation + 5-yr managed service", "Data residency": "All PHI must be hosted in-country." } },
];

export const actions: T.ActionItem[] = [
  { id: "a1", title: 'Analyze "Scope of Work.pdf" and propose next steps', agent: "Tender manager", suggested: true, status: "backlog", createdAt: d("2026-09-16") },
];

export const vendors: T.Vendor[] = [
  { id: "v1", name: "Nexans Norway AS", type: "Manufacturer", industry: "oil-gas", country: "Norway", categories: ["flexible-pipes", "umbilicals"], products: ["Dynamic umbilicals", "Power cables"], certifications: [{ name: "ISO 9001", expiry: "2027-06-30" }, { name: "API 17E", expiry: "2026-12-31" }], licences: ["Achilles JQS"], employees: 28000, revenue: 7_000_000_000, previousBids: 4, contracts: 2, notes: "Framework agreement in place through 2028. Lead time for dynamic riser sections currently quoted at 11 months.",
    ratings: [{ id: "r1", project: "Terra Nova Phase 2 (2024)", date: "2024-11-10", price: 3, quality: 5, schedule: 4, hse: 5, comment: "Excellent QA documentation, minor delay on final spool test due to a third-party testing house backlog." }] },
  { id: "v2", name: "Horizon Marine Services Ltd", type: "Service Provider", industry: "oil-gas", country: "Canada", categories: ["vessels", "survey"], products: [], certifications: [{ name: "ISM Code", expiry: "2027-03-01" }, { name: "ISO 45001", expiry: "2026-08-01" }], licences: ["Transport Canada"], equipment: ["DP2 CSV", "ROV spread"], employees: 420, previousBids: 6, contracts: 3, notes: "", ratings: [{ id: "r2", project: "Hebron Tieback (2023)", date: "2023-08-02", price: 4, quality: 4, schedule: 4, hse: 5, comment: "Reliable spread, weather downtime handled well." }] },
  { id: "v3", name: "Arctic Geo-Solutions Inc", type: "Consultant", industry: "oil-gas", country: "Canada", categories: ["geotechnical", "survey"], certifications: [{ name: "ISO 9001", expiry: "2028-01-15" }], employees: 85, previousBids: 1, contracts: 0, notes: "", ratings: [] },
  { id: "v4", name: "Gulf Asphalt & Aggregates", type: "Supplier", industry: "infrastructure", country: "UAE", categories: ["asphalt", "aggregates"], certifications: [{ name: "ISO 9001", expiry: "2027-09-30" }, { name: "ESMA product certificate", expiry: "2027-02-28" }], employees: 600, previousBids: 2, contracts: 1, notes: "Local content eligible.", ratings: [] },
  { id: "v5", name: "Meridian Cloud Partners", type: "Technology Partner", industry: "it", country: "Kenya", categories: ["hosting", "data-centre"], certifications: [{ name: "ISO 27001", expiry: "2027-11-30" }, { name: "Tier III DC", expiry: "" }], employees: 140, previousBids: 0, contracts: 0, notes: "Candidate in-country hosting partner for NHA RFP.", ratings: [] },
];

export const docs: T.Doc[] = [
  { id: "d1", name: "ITT Volume 2 - Scope of Work.docx", size: 2.4 * 1024 * 1024, rev: 0, kind: "ITT/Instructions", status: "INDEXED", uploadedAt: d("2026-09-16"), uploadedBy: "Jordan Reyes", language: "English", confidentiality: "Confidential" },
];

export const clarifications: T.Clarification[] = [
  { id: "c1", n: 1, ref: "ITT §9.1", round: 1, category: "Technical", title: "Shore approach methodology approval", analysis: "The shore approach at the Newfoundland landfall requires HDD or directional drilling through consolidated bedrock. The ITT calls for an approved methodology to be submitted with the bid. Please confirm whether a preliminary methodology statement with a commitment to full engineering post-award is acceptable, given that detailed geotechnical data is not yet available to tenderers.", status: "Draft", confidence: "Low", flag: "Answer internally?", assignee: "", due: "", author: "TenderOS", createdAt: d("2026-09-16"), pending: true },
  { id: "c2", n: 2, ref: "ITT §3.2.1", round: 1, category: "Technical", title: "Burial depth confirmation", analysis: "The ITT specifies a minimum burial depth of 1.0 m over the full route. Several sections of the route traverse rocky substrate where conventional water-jetting will not achieve this depth. Please confirm whether mechanical trenching is acceptable in these zones and whether the 1.0 m requirement applies equally across all substrate types.", status: "Approved", confidence: "High", assignee: "J. Reyes", due: "", author: "J. Reyes", createdAt: d("2026-09-02"), pending: false },
  { id: "c3", n: 3, ref: "ITT §5.1.4", round: 1, category: "Commercial", title: "Mobilisation cost cap", analysis: "Clause 5.1.4 caps mobilisation costs at CAD 3.5M per vessel. Our spread requires two vessels with combined mobilisation costs estimated at CAD 8.2M. Please confirm whether the cap applies per vessel or to the combined fleet mobilisation.", status: "Answered", confidence: "High", assignee: "K. Okonkwo", due: "", author: "K. Okonkwo", createdAt: d("2026-09-05"), pending: false, clientAnswer: "The cap applies per vessel." },
  { id: "c4", n: 4, ref: "GCC §18.4", round: 1, category: "Contractual", title: "Performance bond timeline", analysis: "GCC §18.4 requires submission of a performance bond within 7 calendar days of contract award. Given typical bank processing times of 10-14 business days for instruments of this value, this timeline is not achievable. Please confirm whether a 21-day period is acceptable or whether a letter of intent from the bond issuer within 7 days would satisfy the requirement.", status: "Draft", confidence: "Medium", assignee: "", due: "", author: "TenderOS", createdAt: d("2026-09-16"), pending: true },
  { id: "c5", n: 5, ref: "SPC §2.4", round: 1, category: "Technical", title: "Applicable DNV edition", analysis: "The specification references DNV-ST-F101 (2021) while the drawing package cites DNV-OS-F101 (2012). Please confirm which edition governs.", status: "Internal Review", confidence: "High", assignee: "J. Reyes", due: "", author: "J. Reyes", createdAt: d("2026-09-09"), pending: false },
  { id: "c6", n: 6, ref: "ITT §7.3", round: 1, category: "Commercial", title: "Metocean hindcast provision", analysis: "Please confirm whether Company will provide the site-specific metocean hindcast dataset referenced in §7.3, or whether tenderers are expected to procure it independently.", status: "Draft", confidence: "High", assignee: "J. Silva", due: "", author: "J. Silva", createdAt: d("2026-09-12"), pending: false },
];

export const clauses: T.Clause[] = [
  { id: "k1", n: 1, ref: "§11.3", title: "Uncapped Consequential Loss Exposure", category: "Liability", relevance: "High", markup: "Delete \"including without limitation\" and insert standard mutual exclusion of consequential loss clause. Cap direct liability at contract value.", analysis: "High risk: §11.3 does not exclude consequential losses from the liability cap. For an offshore EPCI contract at this scale, this creates material exposure to lost production claims. At Crescent Power's published plateau production of 40,000 boe/d and current oil price, a 30-day delay creates potential liability in excess of CAD 100M.", status: "Pending", confidence: "Medium", pending: true, author: "TenderOS", createdAt: d("2026-09-16") },
  { id: "k2", n: 2, ref: "§2.4(m.ii)", title: "Fixed Pricing - No Escalation", category: "Payment", relevance: "High", markup: "Propose adding a commodity price escalation mechanism for copper (LME index) and a CPI-linked labour escalation clause for periods beyond 18 months from contract signature.", analysis: "High risk: §2.4(m.ii) mandates fixed pricing for the full contract life (estimated 36+ months from signature to COD in Q4 2029). There is no allowance for labour cost escalation, commodity price adjustment, or pass-through mechanisms. Exposure is material given copper price volatility.", status: "Pending", confidence: "High", pending: true, author: "TenderOS", createdAt: d("2026-09-16") },
  { id: "k3", n: 3, ref: "§14.2", title: "Liquidated Damages - No Cap", category: "LD & Delay", relevance: "High", markup: "Cap delay LDs at 10% of contract value with a 0.5%/week rate.", analysis: "LDs for delay are uncapped. Standard market position for subsea EPCI is a 10% aggregate cap.", status: "Approved", confidence: "High", pending: false, author: "J. Reyes", createdAt: d("2026-09-10") },
  { id: "k4", n: 4, ref: "§19.1", title: "Marine Insurance Requirements", category: "Insurance", relevance: "Medium", markup: "Confirm CAR policy is Company-provided; Contractor to be named insured.", analysis: "Ambiguity over who procures Construction All Risks cover during offshore installation.", status: "Approved", confidence: "High", pending: false, author: "K. Okonkwo", createdAt: d("2026-09-10") },
  { id: "k5", n: 5, ref: "§2.4(p)", title: "Employer Right to Request Further Information", category: "Other", relevance: "Medium", markup: "Limit to information reasonably required for evaluation; exclude cost build-up.", analysis: "Open-ended information rights may force disclosure of the cost base.", status: "Approved", confidence: "High", pending: false, author: "J. Reyes", createdAt: d("2026-09-11") },
  { id: "k6", n: 6, ref: "§8.7", title: "Change Order Notice Period", category: "Variations", relevance: "Low", markup: "Extend notice window from 5 to 14 days.", analysis: "5-day notice window for change orders is aggressive for offshore operations.", status: "Approved", confidence: "High", pending: false, author: "K. Okonkwo", createdAt: d("2026-09-11") },
];

export const qualifications: T.Qualification[] = [
  { id: "q1", n: 1, ref: "SPC §2.4", text: "Design will be executed to DNV-ST-F101 (2021 edition) throughout. Where the drawing package references DNV-OS-F101 (2012), the 2021 edition governs.", rationale: "The specification and drawing package cite conflicting standard editions for the same design requirement. Proceeding on the later, current edition is standard industry practice and avoids designing to a superseded collapse-capacity requirement.", category: "Technical", type: "Qualification", status: "Open", trust: "High", linked: "Clarification", pending: true, draft: true, assignee: "", due: "", task: "To do" },
  { id: "q2", n: 2, ref: "§18.4", text: "Performance bond to be submitted within 21 calendar days of contract award, rather than the 7 days stated in §18.4.", rationale: "Bank processing times for a bond of this value run 10 to 14 business days at typical Canadian chartered banks. Seven days is not achievable without pre-funding the instrument ahead of award, which no tenderer would do speculatively.", category: "Commercial", type: "Deviation", status: "Open", trust: "Medium", linked: "Clarification", pending: true, draft: true, assignee: "", due: "", task: "To do" },
  { id: "q3", n: 3, ref: "§11.3", text: "Contractor's aggregate liability is capped at 100% of the Contract Price, with mutual exclusion of consequential loss.", rationale: "Market standard position for subsea EPCI.", category: "Contractual", type: "Deviation", status: "Open", trust: "High", pending: false, draft: false, assignee: "K. Okonkwo", due: "2026-10-15", task: "In progress" },
  { id: "q4", n: 4, ref: "§14.2", text: "Delay liquidated damages capped at 10% of Contract Price.", rationale: "Uncapped LDs are not insurable.", category: "Contractual", type: "Deviation", status: "Open", trust: "High", pending: false, draft: false, assignee: "K. Okonkwo", due: "2026-10-15", task: "To do" },
  { id: "q5", n: 5, ref: "ITT §3.2.1", text: "Mechanical trenching accepted in rocky substrate zones where jetting cannot achieve 1.0 m.", rationale: "Confirmed by client answer to clarification 002.", category: "Technical", type: "Qualification", status: "Closed", trust: "High", pending: false, draft: false, assignee: "J. Reyes", due: "", task: "Done" },
];

export const risks: T.Risk[] = [
  { id: "r1", n: 1, kind: "Risk", title: "Fixed price exposure to copper escalation", description: "36-month fixed price with no escalation mechanism; umbilical copper content is ~18% of material cost.", category: "Commercial", probability: 4, impact: 4, postProbability: 3, postImpact: 3, owner: "J. Reyes", status: "Open", mitigation: "Hedge copper at award; seek escalation clause via deviation.", contingency: 2400000 },
  { id: "r2", n: 2, kind: "Risk", title: "Performance bond timeline", description: "7-day bond submission not achievable with Canadian banks.", category: "Contractual", probability: 3, impact: 2, postProbability: 1, postImpact: 2, owner: "J. Silva", status: "Open", mitigation: "Qualify to 21 days; pre-approve facility with bank.", contingency: 0 },
  { id: "r3", n: 3, kind: "Risk", title: "Iceberg season vessel standby", description: "Installation window overlaps iceberg season (Mar–Jul) with potential standby.", category: "Schedule", probability: 3, impact: 3, postProbability: 2, postImpact: 2, owner: "K. Okonkwo", status: "Closed", mitigation: "Ice management vessel included in spread; schedule float added.", contingency: 1200000 },
  { id: "r4", n: 4, kind: "Risk", title: "Uncapped consequential loss", description: "§11.3 exposes Contractor to lost production claims exceeding CAD 100M.", category: "Liability", probability: 2, impact: 5, postProbability: 2, postImpact: 5, owner: "J. Reyes", status: "Open", mitigation: "Deviation required; walk-away item if not accepted.", contingency: 0 },
  { id: "r5", n: 5, kind: "Risk", title: "Ice Management - Late-Season Operations", description: "Flemish Pass experiences sea ice incursion in March-April. If installation extends into Q1 2029 due to delays, ice management costs and standby time could increase significantly.", category: "HSE", probability: 3, impact: 4, postProbability: 2, postImpact: 3, owner: "J. Silva", status: "Open", mitigation: "Ice management plan; weather-window analysis on schedule.", contingency: 900000 },
  { id: "r6", n: 6, kind: "Opportunity", title: "Local content premium", description: "Exceeding 30% Canadian content may score additional evaluation points.", category: "Commercial", probability: 3, impact: 3, postProbability: 4, postImpact: 3, owner: "K. Okonkwo", status: "Open", mitigation: "Partner with St. John's fabrication yard.", contingency: 0 },
];

export const deliverables: T.Deliverable[] = [
  "Executive Summary|Technical", "Installation Methodology|Technical", "HDD Shore Approach|Technical", "Pipe-lay & Tie-in|Technical", "Vessel Spread & Schedule|Technical",
  "HSE Plan|Technical", "Quality Plan|Technical", "Commercial Proposal|Commercial", "Price Schedule (Form C)|Commercial", "Qualifications & Deviations Register|Commercial",
].map((s, i) => { const [name, type] = s.split("|"); return { id: `dl${i + 1}`, n: i + 1, name, type: type as T.Deliverable["type"], owner: ["J. Reyes", "K. Okonkwo", "J. Silva"][i % 3], status: "Not started" as const, due: "2027-03-01" }; });

export const costLines: T.CostLine[] = [
  { id: "cl1", wbs: "1.1", description: "Project management & engineering", category: "Engineering", qty: 18000, unit: "man-hours", rate: 145, hours: 18000, contingency: 5 },
  { id: "cl2", wbs: "2.1", description: "Dynamic umbilicals (2 × 4.2 km)", category: "Procurement", qty: 8400, unit: "m", rate: 3200, contingency: 8 },
  { id: "cl3", wbs: "2.2", description: "Flexible flowlines 8\" (3 × 6 km)", category: "Procurement", qty: 18000, unit: "m", rate: 4100, contingency: 8 },
  { id: "cl4", wbs: "3.1", description: "Pipelay vessel (DP2) spread", category: "Marine", qty: 62, unit: "days", rate: 385000, contingency: 10 },
  { id: "cl5", wbs: "3.2", description: "Construction support vessel", category: "Marine", qty: 75, unit: "days", rate: 165000, contingency: 10 },
  { id: "cl6", wbs: "3.3", description: "Ice management vessel", category: "Marine", qty: 40, unit: "days", rate: 95000, contingency: 15 },
  { id: "cl7", wbs: "4.1", description: "HDD shore approach subcontract", category: "Subcontract", qty: 1, unit: "lump sum", rate: 14500000, contingency: 12 },
  { id: "cl8", wbs: "5.1", description: "Pre-commissioning & testing", category: "Commissioning", qty: 1, unit: "lump sum", rate: 3800000, contingency: 6 },
];

export const milestones: T.Milestone[] = [
  { id: "m1", name: "Contract award", pct: 10, date: "2027-06-01" },
  { id: "m2", name: "Detailed design approved", pct: 15, date: "2027-11-15" },
  { id: "m3", name: "Umbilicals FAT complete", pct: 25, date: "2028-06-30" },
  { id: "m4", name: "Offshore installation complete", pct: 35, date: "2029-08-15" },
  { id: "m5", name: "Pre-commissioning & handover", pct: 15, date: "2029-10-30" },
];

export const lessons: T.Lesson[] = [
  { id: "l1", tender: "Terra Nova Phase 2", outcome: "Won", lesson: "Early vendor lock on flexible pipe capacity secured a 4-month schedule advantage over competitors.", date: "2024-11-10" },
  { id: "l2", tender: "Hebron Tieback", outcome: "Lost", lesson: "Pricing was 9% above winner; contingency stacked at both line and project level. Apply contingency once.", date: "2023-08-02" },
];

export const contributors = [
  { name: "J. Reyes", initials: "JR", color: "#c8772e" },
  { name: "Amira Haddad", initials: "AH", color: "#5b93c4" },
  { name: "Priya Natarajan", initials: "PN", color: "#3ec48a" },
  { name: "K. Okonkwo", initials: "KO", color: "#8b6cf6" },
  { name: "J. Silva", initials: "JS", color: "#3ec48a" },
  { name: "TenderOS", initials: "T", color: "#c8772e" },
];

export const agents = [
  { id: "tender-manager", name: "Tender manager", sub: "Orchestrates, reviews, integrates", emoji: "🧭" },
  { id: "clarifications", name: "Clarifications lead", sub: "The log, across rounds", emoji: "💬" },
  { id: "contract", name: "Contract & commercial lead", sub: "Clauses and positions", emoji: "⚖️" },
  { id: "risk", name: "Risk & opportunity lead", sub: "Register and lessons", emoji: "⚠️" },
  { id: "cost", name: "Cost & pricing lead", sub: "The cost base", emoji: "💰" },
  { id: "deliverables", name: "Deliverables lead", sub: "Templates and documents", emoji: "📦" },
  { id: "engineering", name: "Engineering lead", sub: "Technical scope and precedent", emoji: "🛠️" },
];

export const procPackages: T.ProcPackage[] = [
  { id: "pk1", tenderId: "t1", name: "Dynamic umbilicals", category: "Material", requirement: "2 × 4.2 km dynamic umbilicals per SPC §3, DNV-ST-F101 2021.", status: "Evaluation", weights: { price: 50, lead: 20, quality: 15, compliance: 15 } },
  { id: "pk2", tenderId: "t1", name: "Survey & geotechnical", category: "Services", requirement: "Route survey and shore-approach geotechnical campaign.", status: "Quotations", weights: { price: 40, lead: 30, quality: 15, compliance: 15 } },
  { id: "pk3", tenderId: "t2", name: "Asphalt supply (280k t)", category: "Material", requirement: "Polymer-modified asphalt per MoT spec section 4.", status: "RFQ sent", weights: { price: 60, lead: 20, quality: 10, compliance: 10 } },
  { id: "pk4", tenderId: "t3", name: "In-country hosting", category: "Services", requirement: "Tier III data centre hosting, PHI in-country, 99.9% SLA.", status: "Requirement", weights: { price: 40, lead: 10, quality: 20, compliance: 30 } },
];
export const quotations: T.Quotation[] = [
  { id: "qt1", packageId: "pk1", vendorId: "v1", price: 26_900_000, currency: "CAD", leadWeeks: 48, quality: 5, compliance: 96, scope: "Full", notes: "Framework rates; 11-month lead on dynamic sections.", receivedAt: d("2026-09-10") },
  { id: "qt2", packageId: "pk1", vendorId: "v4", price: 22_400_000, currency: "CAD", leadWeeks: 56, quality: 3, compliance: 84, scope: "Partial (excl. bend stiffeners)", notes: "No cold-water dynamic reference.", receivedAt: d("2026-09-11") },
  { id: "qt3", packageId: "pk2", vendorId: "v3", price: 3_100_000, currency: "CAD", leadWeeks: 10, quality: 4, compliance: 90, scope: "Full", notes: "Local content eligible.", receivedAt: d("2026-09-08") },
  { id: "qt4", packageId: "pk2", vendorId: "v2", price: 3_650_000, currency: "CAD", leadWeeks: 8, quality: 5, compliance: 95, scope: "Full", notes: "Includes ROV spread.", receivedAt: d("2026-09-09") },
];
