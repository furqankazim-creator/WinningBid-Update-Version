import type * as T from "./types";
const d = (s: string) => new Date(s).toISOString();

export const org: T.Org = { id: "org1", name: "Northstar Contracting Group", industries: ["oil-gas", "infrastructure", "it"], plan: "Team", currency: "USD" };
export const users: T.User[] = [
  { id: "u1", name: "Jordan Reyes", email: "j.reyes@northstar.example", role: "Tender Manager", active: true },
  { id: "u2", name: "Amira Haddad", email: "a.haddad@northstar.example", role: "Business Development", active: true },
  { id: "u3", name: "Priya Natarajan", email: "p.natarajan@northstar.example", role: "Technical Manager", active: true },
  { id: "u4", name: "K. Okonkwo", email: "k.okonkwo@northstar.example", role: "Commercial Manager", active: true },
  { id: "u5", name: "J. Silva", email: "j.silva@northstar.example", role: "Procurement Manager", active: true },
  { id: "u6", name: "Dana Whitfield", email: "d.whitfield@northstar.example", role: "Executive", active: true },
  { id: "u7", name: "Lena Ortiz", email: "l.ortiz@northstar.example", role: "Organization Admin", active: true },
];

export const companies: T.Company[] = [
  { id: "co1", name: "Crescent Power Ltd", industry: "oil-gas", subIndustry: "Upstream", country: "Canada", region: "North America", website: "crescentpower.example", type: "Client", services: ["Offshore development"], certifications: [], notes: "Operator of Flemish Pass. Framework relationship since 2022.", createdAt: d("2025-03-01") },
  { id: "co2", name: "Ministry of Transport", industry: "infrastructure", subIndustry: "Roads", country: "UAE", region: "Middle East", website: "mot.example", type: "Client", services: ["Public works"], certifications: [], notes: "Public procurement portal; 40% ICV requirement.", createdAt: d("2025-06-10") },
  { id: "co3", name: "National Health Authority", industry: "healthcare", subIndustry: "Health IT", country: "Kenya", region: "Africa", website: "nha.example", type: "Client", services: ["Health services"], certifications: [], notes: "Introduced via cloud partner.", createdAt: d("2026-02-14") },
  { id: "co4", name: "Atlas Steel Fabrication", industry: "manufacturing", subIndustry: "Fabrication", country: "Turkey", region: "Europe", website: "atlassteel.example", type: "Partner", services: ["Steel fabrication"], certifications: ["ISO 9001", "EN 1090"], notes: "", createdAt: d("2026-04-02") },
  { id: "co5", name: "Subsea 7", industry: "oil-gas", subIndustry: "Subsea", country: "UK", region: "Europe", website: "subsea7.example", type: "Competitor", services: ["SURF EPCI"], certifications: [], notes: "Incumbent on adjacent field.", createdAt: d("2025-01-01") },
  { id: "co6", name: "Helios Renewables SA", industry: "renewables", subIndustry: "Solar PV", country: "Spain", region: "Europe", website: "helios.example", type: "Prospect", services: ["Solar EPC"], certifications: [], notes: "Met at Intersolar; 200 MW pipeline.", createdAt: d("2026-08-20") },
];

export const contacts: T.Contact[] = [
  { id: "ct1", companyId: "co1", name: "Marcus Lee", title: "Contracts Manager", email: "m.lee@crescentpower.example", phone: "+1 709 555 0142", role: "Commercial contact", notes: "" },
  { id: "ct2", companyId: "co1", name: "Sophie Tremblay", title: "Subsea Engineering Lead", email: "s.tremblay@crescentpower.example", phone: "+1 709 555 0188", role: "Technical contact", notes: "" },
  { id: "ct3", companyId: "co2", name: "Eng. Khalid Al Mansoori", title: "Director of Projects", email: "k.almansoori@mot.example", phone: "+971 2 555 0100", role: "Decision maker", notes: "" },
  { id: "ct4", companyId: "co3", name: "Dr. Wanjiru Kamau", title: "CIO", email: "w.kamau@nha.example", phone: "+254 20 555 0190", role: "Sponsor", notes: "" },
  { id: "ct5", companyId: "co6", name: "Javier Ruiz", title: "Head of Procurement", email: "j.ruiz@helios.example", phone: "+34 91 555 0123", role: "Buyer", notes: "" },
];

export const opportunities: T.Opportunity[] = [
  { id: "op1", name: "Flemish Pass SURF", companyId: "co1", industry: "oil-gas", service: "EPC / EPCI", region: "North America", value: 186000000, currency: "CAD", probability: 45, expectedAward: "2027-06-01", expectedStart: "2027-08-01", owner: "Jordan Reyes", source: "Client invitation", stage: "Bid", notes: "", tenderId: "t1", createdAt: d("2026-05-02") },
  { id: "op2", name: "Ring Road Phase 3", companyId: "co2", industry: "infrastructure", service: "Roads", region: "Middle East", value: 74000000, currency: "USD", probability: 25, expectedAward: "2027-01-15", expectedStart: "2027-03-01", owner: "Amira Haddad", source: "Public portal", stage: "Tender", notes: "", tenderId: "t2", createdAt: d("2026-07-11") },
  { id: "op3", name: "National EHR Platform", companyId: "co3", industry: "it", service: "Cloud Services", region: "Africa", value: 12500000, currency: "USD", probability: 35, expectedAward: "2026-12-15", expectedStart: "2027-01-15", owner: "Priya Natarajan", source: "Partner referral", stage: "Tender", notes: "", tenderId: "t3", createdAt: d("2026-06-20") },
  { id: "op4", name: "Helios 200 MW Solar EPC", companyId: "co6", industry: "renewables", service: "Solar PV", region: "Europe", value: 95000000, currency: "EUR", probability: 15, expectedAward: "2027-04-01", expectedStart: "2027-06-01", owner: "Amira Haddad", source: "Conference", stage: "Prospect", notes: "Pre-qualification expected Q4.", createdAt: d("2026-08-21") },
  { id: "op5", name: "Atlas fabrication framework", companyId: "co4", industry: "manufacturing", service: "Fabrication", region: "Europe", value: 4200000, currency: "EUR", probability: 100, expectedAward: "2026-09-05", expectedStart: "2026-10-01", owner: "K. Okonkwo", source: "Existing relationship", stage: "Won", notes: "", tenderId: "t4", createdAt: d("2026-06-01") },
  { id: "op6", name: "Port authority dredging EOI", companyId: "co2", industry: "infrastructure", service: "Ports", region: "Middle East", value: 30000000, currency: "USD", probability: 10, expectedAward: "2027-05-01", expectedStart: "2027-08-01", owner: "Amira Haddad", source: "Public portal", stage: "Lead", notes: "", createdAt: d("2026-09-10") },
];

export const activities: T.Activity[] = [
  { id: "ac1", entity: "company", entityId: "co1", kind: "Meeting", text: "Kick-off with Crescent contracts team; confirmed clarification channel.", by: "Jordan Reyes", at: d("2026-09-03") },
  { id: "ac2", entity: "opportunity", entityId: "op4", kind: "Email", text: "Sent company profile and reference list to Javier Ruiz.", by: "Amira Haddad", at: d("2026-08-25") },
  { id: "ac3", entity: "company", entityId: "co3", kind: "Call", text: "CIO confirmed data residency is non-negotiable; local hosting partner acceptable.", by: "Priya Natarajan", at: d("2026-09-08") },
];

export const requirements: T.Requirement[] = [
  { id: "rq1", tenderId: "t1", text: "Contractor must have executed at least 3 SURF EPCI projects in water depth >1,000 m in the last 10 years.", category: "Experience", priority: "Must", sourceDoc: "ITT Volume 2 - Scope of Work.docx", page: 42, section: "4.2", clause: "4.2.1", evidence: "Project reference letters", status: "Approved", reviewer: "Jordan Reyes", comments: "", ai: true, confidence: "High" },
  { id: "rq2", tenderId: "t1", text: "Minimum 30% Canadian content by value.", category: "Local content", priority: "Must", sourceDoc: "ITT Volume 2 - Scope of Work.docx", page: 12, section: "2.6", clause: "2.6.3", evidence: "Local content plan", status: "Partial", reviewer: "K. Okonkwo", comments: "Currently at 26%; St. John's fabrication would close the gap.", ai: true, confidence: "High" },
  { id: "rq3", tenderId: "t1", text: "Performance bond of 10% of contract value within 7 days of award.", category: "Financial", priority: "Must", sourceDoc: "ITT Volume 2 - Scope of Work.docx", page: 88, section: "18", clause: "18.4", evidence: "Bank letter of intent", status: "Needs Verification", reviewer: "", comments: "", ai: true, confidence: "Medium" },
  { id: "rq4", tenderId: "t1", text: "Design to DNV-ST-F101 (2021).", category: "Technical", priority: "Must", sourceDoc: "ITT Volume 2 - Scope of Work.docx", page: 31, section: "SPC 2.4", clause: "2.4", evidence: "Design basis", status: "Needs Verification", reviewer: "", comments: "Drawing package cites 2012 edition — conflict.", ai: true, confidence: "Medium" },
  { id: "rq5", tenderId: "t1", text: "ISO 45001 certified HSE management system.", category: "HSE", priority: "Must", sourceDoc: "ITT Volume 2 - Scope of Work.docx", page: 55, section: "9.1", clause: "9.1.2", evidence: "Certificate", status: "Compliant", reviewer: "J. Silva", comments: "", ai: true, confidence: "High" },
  { id: "rq6", tenderId: "t2", text: "Contractor licence Grade 1 (roads & bridges) in the Emirate.", category: "Licensing", priority: "Must", sourceDoc: "RFP Volume 1.pdf", page: 8, section: "3.1", clause: "3.1(a)", evidence: "Licence copy", status: "Non-Compliant", reviewer: "Amira Haddad", comments: "Hold Grade 2 only; JV with Grade 1 partner required.", ai: true, confidence: "High" },
  { id: "rq7", tenderId: "t2", text: "Minimum 40% In-Country Value.", category: "Local content", priority: "Must", sourceDoc: "RFP Volume 1.pdf", page: 15, section: "5.2", clause: "5.2", evidence: "ICV certificate", status: "Needs Verification", reviewer: "", comments: "", ai: true, confidence: "High" },
  { id: "rq8", tenderId: "t2", text: "Five similar interchange projects completed in last 8 years, each ≥ USD 30M.", category: "Experience", priority: "Must", sourceDoc: "RFP Volume 1.pdf", page: 9, section: "3.2", clause: "3.2(b)", evidence: "Completion certificates", status: "Partial", reviewer: "Amira Haddad", comments: "3 qualifying projects.", ai: true, confidence: "High" },
  { id: "rq9", tenderId: "t3", text: "All PHI data hosted in-country; no cross-border transfer.", category: "Data/privacy", priority: "Must", sourceDoc: "NHA-RFP-0092.pdf", page: 22, section: "6.4", clause: "6.4.1", evidence: "Hosting architecture", status: "Partial", reviewer: "Priya Natarajan", comments: "Requires local DC partner.", ai: true, confidence: "High" },
  { id: "rq10", tenderId: "t3", text: "ISO 27001 certification of bidder.", category: "Certification", priority: "Must", sourceDoc: "NHA-RFP-0092.pdf", page: 18, section: "5.1", clause: "5.1", evidence: "Certificate", status: "Compliant", reviewer: "Priya Natarajan", comments: "", ai: true, confidence: "High" },
  { id: "rq11", tenderId: "t3", text: "HL7 FHIR R4 interoperability with national ID system.", category: "Technical", priority: "Must", sourceDoc: "NHA-RFP-0092.pdf", page: 40, section: "8.2", clause: "8.2.3", evidence: "Architecture document", status: "Needs Verification", reviewer: "", comments: "", ai: true, confidence: "Medium" },
  { id: "rq12", tenderId: "t3", text: "99.9% availability SLA with service credits.", category: "Commercial", priority: "Should", sourceDoc: "NHA-RFP-0092.pdf", page: 61, section: "12", clause: "12.3", evidence: "SLA schedule", status: "Approved", reviewer: "K. Okonkwo", comments: "", ai: true, confidence: "High" },
];

export const complianceItems: T.ComplianceItem[] = [
  { id: "cp1", tenderId: "t1", item: "ISO 9001", status: "Compliant", evidence: "Cert #QMS-2211, valid to 2028-01", expiry: "2028-01-31", owner: "J. Silva", notes: "" },
  { id: "cp2", tenderId: "t1", item: "ISO 45001", status: "Compliant", evidence: "Cert #OHS-1180", expiry: "2027-11-30", owner: "J. Silva", notes: "" },
  { id: "cp3", tenderId: "t1", item: "Client vendor registration", status: "Compliant", evidence: "Crescent vendor #V-4471", owner: "Jordan Reyes", notes: "" },
  { id: "cp4", tenderId: "t1", item: "Bid bond", status: "Missing", evidence: "", owner: "K. Okonkwo", notes: "Bank request submitted 09-10." },
  { id: "cp5", tenderId: "t1", item: "Financial statements (3 yrs)", status: "Compliant", evidence: "Audited FY23–25", owner: "K. Okonkwo", notes: "" },
  { id: "cp6", tenderId: "t1", item: "Technical pre-qualification", status: "Needs Review", evidence: "PQ pack v2", owner: "Jordan Reyes", notes: "" },
  { id: "cp7", tenderId: "t2", item: "Contractor licence (grade)", status: "Non-Compliant", evidence: "Grade 2 licence", owner: "Amira Haddad", notes: "JV partner needed." },
  { id: "cp8", tenderId: "t2", item: "Insurance certificate", status: "Expired", evidence: "CAR policy expired 2026-08", expiry: "2026-08-31", owner: "K. Okonkwo", notes: "Renewal in progress." },
  { id: "cp9", tenderId: "t2", item: "Equipment fleet list", status: "Compliant", evidence: "Fleet register 2026", owner: "J. Silva", notes: "" },
  { id: "cp10", tenderId: "t2", item: "Similar project references", status: "Partially Compliant", evidence: "3 of 5", owner: "Amira Haddad", notes: "" },
  { id: "cp11", tenderId: "t3", item: "ISO 27001", status: "Compliant", evidence: "Cert #ISMS-0902", expiry: "2027-05-31", owner: "Priya Natarajan", notes: "" },
  { id: "cp12", tenderId: "t3", item: "Data residency statement", status: "Partially Compliant", evidence: "Draft with local DC partner", owner: "Priya Natarajan", notes: "" },
  { id: "cp13", tenderId: "t3", item: "SOC 2", status: "Unknown", evidence: "", owner: "", notes: "Check with cloud partner." },
  { id: "cp14", tenderId: "t3", item: "Partner certifications (cloud vendor)", status: "Compliant", evidence: "Azure Gold partner", owner: "Priya Natarajan", notes: "" },
];

export const capabilities: T.Capability[] = [
  { id: "cb1", name: "ISO 9001", category: "Certification", value: "Yes", expiry: "2028-01-31", evidence: "QMS-2211" },
  { id: "cb2", name: "ISO 45001", category: "Certification", value: "Yes", expiry: "2027-11-30", evidence: "OHS-1180" },
  { id: "cb3", name: "ISO 27001", category: "Certification", value: "Yes", expiry: "2027-05-31", evidence: "ISMS-0902" },
  { id: "cb4", name: "Deepwater SURF projects (>1,000 m, 10 yrs)", category: "Experience", value: "3", evidence: "Terra Nova, Hebron, Bay du Nord FEED" },
  { id: "cb5", name: "Interchange projects ≥ USD 30M (8 yrs)", category: "Experience", value: "3", evidence: "Sheikh Zayed Rd, E311, Al Ain Rd" },
  { id: "cb6", name: "Contractor licence grade", category: "Licensing", value: "Grade 2", evidence: "Licence #CL-8821" },
  { id: "cb7", name: "In-country hosting partner (Kenya)", category: "Partner", value: "Unknown", evidence: "" },
  { id: "cb8", name: "Canadian content capacity", category: "Local content", value: "26%", evidence: "Local content model v3" },
  { id: "cb9", name: "DP2 pipelay vessel access", category: "Equipment", value: "Yes (charter)", evidence: "Horizon Marine framework" },
];

export const aiSummaries: T.AISummary[] = [
  { tenderId: "t1", generatedAt: d("2026-09-16T14:33:18"), model: "Lite", sections: {
    "Executive Summary": ["Full-scope SURF EPCI for Crescent Power's Flemish Pass development, ~CAD 186M, 36-month duration, submission 15 Mar 2027."],
    "Scope Summary": ["2 × 4.2 km dynamic umbilicals, 3 × 6 km 8\" flexible flowlines, HDD shore approach, tie-in and pre-commissioning."],
    "Key Requirements": ["3 deepwater SURF references (§4.2)", "30% Canadian content (§2.6)", "DNV-ST-F101 2021 design basis (SPC §2.4)", "ISO 45001 (§9.1)"],
    "Important Dates": ["Clarification deadline 30 Sep 2026", "Submission 15 Mar 2027", "Bid validity 180 days"],
    "Commercial Requirements": ["Fixed price, no escalation (§2.4(m.ii))", "10% performance bond in 7 days (§18.4)", "Milestone payments per Schedule 4"],
    "Legal Requirements": ["Uncapped consequential loss (§11.3)", "Uncapped LDs (§14.2)", "Governing law: Newfoundland & Labrador"],
    "Missing Information": ["Site-specific metocean hindcast", "Geotechnical data for shore approach", "Free-span acceptance criteria KP 12–15"],
    "Potential Risks": ["Copper price exposure under fixed price", "Ice season standby", "Flexible pipe supplier capacity"],
    "Questions for Client": ["Confirm DNV edition", "Confirm mob cost cap per vessel or fleet", "Confirm bond timeline"],
  }, recommendation: { verdict: "GO", reasoning: "Strong technical and relationship fit with an incumbent-adjacent client; margins acceptable if the liability cap and escalation deviations are accepted. Recommend GO conditional on walk-away positions for §11.3 and §14.2." },
  contractTerms: [
    { term: "Liability", finding: "Consequential loss not excluded; no aggregate cap.", risk: "High", source: "GCC §11.3 p.71" }, { term: "Liquidated Damages", finding: "Delay LDs uncapped.", risk: "High", source: "GCC §14.2 p.76" },
    { term: "Payment Terms", finding: "Milestone payments, 60 days from invoice.", risk: "Medium", source: "Schedule 4 p.102" }, { term: "Performance Bond", finding: "10% within 7 days of award.", risk: "Medium", source: "GCC §18.4 p.88" },
    { term: "Termination", finding: "Convenience termination without compensation for committed procurement.", risk: "High", source: "GCC §21.4 p.93" }, { term: "Governing Law", finding: "Newfoundland & Labrador, Canada.", risk: "Low", source: "GCC §30 p.99" },
    { term: "Warranty", finding: "24 months from handover.", risk: "Low", source: "GCC §16 p.82" }, { term: "Change Orders", finding: "5-day notice window.", risk: "Medium", source: "GCC §8.7 p.60" },
  ] },
  { tenderId: "t3", generatedAt: d("2026-09-12T10:05:00"), model: "Max", sections: {
    "Executive Summary": ["Cloud EHR platform for 120 facilities with 5-year managed service; USD 12.5M budget indicated; submission 30 Oct 2026."],
    "Scope Summary": ["Implementation, data migration from 4 legacy systems, national ID integration (FHIR R4), training, 5-yr support with 99.9% SLA."],
    "Key Requirements": ["In-country PHI hosting (§6.4)", "ISO 27001 (§5.1)", "FHIR R4 interoperability (§8.2)", "99.9% SLA with credits (§12.3)"],
    "Important Dates": ["Clarifications by 5 Oct 2026", "Submission 30 Oct 2026", "Demo week of 15 Nov"],
    "Missing Information": ["Legacy data volumes", "Network readiness per facility", "Named integration endpoints"],
    "Potential Risks": ["Data residency partner dependency", "Migration scope creep", "Payment in local currency"],
    "Questions for Client": ["Is a certified local DC partner acceptable for residency?", "Provide legacy data volumes.", "Confirm payment currency."],
  }, recommendation: { verdict: "CONDITIONAL GO", reasoning: "Attractive margin and strategic entry into health IT, but residency requirement cannot be met without a local hosting partner. Proceed only if partner LOI is secured before submission." },
  contractTerms: [
    { term: "Payment Terms", finding: "Quarterly in arrears for managed service; 20% on go-live.", risk: "Medium", source: "RFP §12.1 p.60" }, { term: "Intellectual Property", finding: "Client claims IP in all customisations.", risk: "Medium", source: "RFP §14 p.66" },
    { term: "Liability", finding: "Capped at 100% annual fees.", risk: "Low", source: "RFP §13.2 p.64" }, { term: "Termination", finding: "90-day convenience termination.", risk: "Medium", source: "RFP §15 p.68" },
  ] },
  { tenderId: "t2", generatedAt: d("2026-09-10T11:20:00"), model: "Pro", sections: {
    "Executive Summary": ["Design and construction of 3 grade-separated interchanges and 14 km of 6-lane highway under FIDIC Yellow Book, USD 74M, closing 20 Nov 2026."],
    "Scope Summary": ["Civil works, precast segmental bridges, drainage, high-mast highway lighting, and Intelligent Transportation System (ITS)."],
    "Key Requirements": ["Minimum 40% in-country value (ICV)", "FIDIC Yellow Book 2017 conditions", "ISO 9001 and ISO 14001 certification", "120-day bid validity with bank guarantee"],
    "Important Dates": ["Clarification deadline 15 Oct 2026", "Submission 20 Nov 2026", "Construction duration 28 months"],
    "Commercial Requirements": ["Fixed price lump-sum in USD", "10% advance payment against bank guarantee", "10% retention with 5% released on Taking-Over"],
    "Legal Requirements": ["Delay damages USD 35,000 per day capped at 10%", "Governing law: Dubai / UAE", "Dispute resolution via DIAC arbitration"],
    "Missing Information": ["Geotechnical borehole logs at Interchange 2", "Utility diversion approvals and corridor handover schedule"],
    "Potential Risks": ["Traffic management disruption penalties", "Steel reinforcement price fluctuations over 28 months"],
    "Questions for Client": ["Please provide existing underground utility survey data", "Confirm if advance payment deduction begins on milestone 2."],
  }, recommendation: { verdict: "GO", reasoning: "Core highway and bridge engineering capability. High margin potential with established local precast partners." },
  contractTerms: [
    { term: "Payment Terms", finding: "Monthly progress valuations, 56 days payment.", risk: "Medium", source: "FIDIC Yellow §14.7" },
    { term: "Liquidated Damages", finding: "USD 35,000/day capped at 10% of Contract Price.", risk: "Medium", source: "Particular Conditions §8.7" },
    { term: "Retention", finding: "10% retention, 5% released at Taking-Over Certificate.", risk: "Low", source: "Particular Conditions §14.3" },
    { term: "Governing Law", finding: "Laws of the United Arab Emirates.", risk: "Low", source: "General Conditions §1.4" },
  ] },
  { tenderId: "t4", generatedAt: d("2026-06-15T08:45:00"), model: "Lite", sections: {
    "Executive Summary": ["2-year call-off framework contract for structural steel fabrication and supply to Atlas Steel Fabrication, EUR 4.2M value."],
    "Scope Summary": ["Heavy structural steel fabrication, surface treatment (shot-blasting and painting), non-destructive testing (NDT), DAP delivery."],
    "Key Requirements": ["EN 1090-2 EXC3 execution class", "ISO 3834-2 comprehensive quality requirements for fusion welding", "DAP delivery Incoterms 2020"],
    "Important Dates": ["Framework signature 10 Sep 2026", "Effective start 01 Oct 2026", "End date 30 Sep 2028"],
    "Commercial Requirements": ["30% advance on individual call-off order, 70% within 45 days of delivery", "Fixed unit rates for 24 months"],
    "Legal Requirements": ["Liability capped at 100% of call-off order value", "Liquidated damages 0.5% per week capped at 5%"],
    "Potential Risks": ["Plate and beam raw material price increases", "Transportation capacity during peak logistics seasons"],
  }, recommendation: { verdict: "GO", reasoning: "Repeatable low-risk manufacturing work with clear specifications and established European logistics." },
  contractTerms: [
    { term: "Payment Terms", finding: "30% on order, 70% within 45 days of delivery.", risk: "Low", source: "Framework Agreement §5" },
    { term: "Warranty", finding: "24 months from delivery of each call-off batch.", risk: "Low", source: "Framework Agreement §9" },
    { term: "Liability", finding: "Capped at 100% of the individual call-off order value.", risk: "Low", source: "Framework Agreement §12" },
    { term: "Liquidated Damages", finding: "0.5% per week of delay, capped at 5%.", risk: "Low", source: "Framework Agreement §14" },
  ] },
];

export const reviews: T.Review[] = [
  { id: "rv1", tenderId: "t1", stage: "Technical Review", reviewer: "Priya Natarajan", status: "Approved", comment: "Methodology sound; free-span criteria to be clarified.", at: d("2026-09-14") },
  { id: "rv2", tenderId: "t1", stage: "Commercial Review", reviewer: "K. Okonkwo", status: "Revision requested", comment: "Contingency applied at both line and project level — apply once.", at: d("2026-09-15") },
  { id: "rv3", tenderId: "t1", stage: "Legal Review", reviewer: "Dana Whitfield", status: "Pending", comment: "", at: d("2026-09-15") },
  { id: "rv4", tenderId: "t3", stage: "Compliance Review", reviewer: "Lena Ortiz", status: "Pending", comment: "", at: d("2026-09-13") },
];

export const approvals: T.Approval[] = [
  { id: "ap1", tenderId: "t1", subject: "Go/No-Go — Flemish Pass SURF EPCI", kind: "Go/No-Go", requestedBy: "Jordan Reyes", approver: "Dana Whitfield", status: "Approved", reason: "GO with walk-away on §11.3/§14.2.", at: d("2026-09-06") },
  { id: "ap2", tenderId: "t1", subject: "Price version 1 — CAD 186.2M @ 12%", kind: "Pricing", requestedBy: "K. Okonkwo", approver: "Dana Whitfield", status: "Pending", reason: "", at: d("2026-09-15") },
  { id: "ap3", tenderId: "t3", subject: "Go/No-Go — National Health Records Platform", kind: "Go/No-Go", requestedBy: "Priya Natarajan", approver: "Dana Whitfield", status: "Pending", reason: "", at: d("2026-09-12") },
];

export const priceVersions: T.PriceVersion[] = [
  { id: "pv1", tenderId: "t1", version: 1, cost: 163800000, margin: 12, discount: 0, tax: 0, price: 186136364, validity: "180 days", paymentTerms: "Milestones per Schedule 4, 60 days", assumptions: "CAD; copper hedged at award; 62 vessel days.", locked: false, createdAt: d("2026-09-15") },
];

export const proposalSections: T.ProposalSection[] = [
  { id: "ps1", tenderId: "t1", kind: "technical", title: "Executive Summary", body: "Northstar proposes a fully integrated SURF EPCI solution for Flemish Pass, leveraging three deepwater references in the Grand Banks and a DP2 reel-lay spread secured under framework.", status: "Human Edited", order: 1 },
  { id: "ps2", tenderId: "t1", kind: "technical", title: "Methodology", body: "[AI DRAFT] Reel-lay of flexibles from St. John's spoolbase; mechanical trenching in rocky substrate per accepted clarification 002; HDD shore approach by specialist subcontractor…", status: "AI Draft", order: 2 },
  { id: "ps3", tenderId: "t1", kind: "technical", title: "HSE plan", body: "[AI DRAFT] ISO 45001 system; ice management plan for Mar–Jul operations; SIMOPS procedures with operator…", status: "AI Draft", order: 3 },
  { id: "ps4", tenderId: "t1", kind: "commercial", title: "Commercial Summary", body: "Lump-sum price CAD 186,136,364 excluding HST, valid 180 days, per Schedule 4 milestones.", status: "In Review", order: 1 },
  { id: "ps5", tenderId: "t1", kind: "commercial", title: "Commercial Deviations", body: "Liability cap 100% CV with mutual consequential loss exclusion; LDs capped 10%; bond 21 days.", status: "Human Edited", order: 2 },
];

export const inquiries: T.Inquiry[] = [
  { id: "in1", channel: "WhatsApp", from: "+34 91 555 0123 (Javier Ruiz)", company: "Helios Renewables SA", subject: "PQ documents for 200 MW solar", body: "Hi, sending the pre-qualification questionnaire for the Andalucía 200 MW EPC. Deadline 15 Oct. Can you confirm interest?", receivedAt: d("2026-09-15T09:12:00"), status: "New", extracted: { client: "Helios Renewables SA", industry: "renewables", requirement: "Pre-qualification, 200 MW solar EPC", deadline: "2026-10-15", location: "Andalucía, Spain" } },
  { id: "in2", channel: "Email", from: "m.lee@crescentpower.example", company: "Crescent Power Ltd", subject: "RE: ITT CP-ITT-2026-014 — Addendum 2", body: "Please find attached Addendum 2 revising the clarification deadline to 7 Oct 2026.", receivedAt: d("2026-09-16T08:40:00"), status: "New", extracted: { client: "Crescent Power Ltd", reference: "CP-ITT-2026-014", deadline: "2026-10-07" } },
  { id: "in3", channel: "Website", from: "procurement@citywater.example", company: "City Water Utility", subject: "RFQ — replacement pumps", body: "Request for quotation for 12 vertical turbine pumps, delivery Q1 2027.", receivedAt: d("2026-09-14T16:20:00"), status: "New", extracted: { client: "City Water Utility", industry: "water", requirement: "12 vertical turbine pumps", deadline: "2026-10-01" } },
  { id: "in4", channel: "WhatsApp", from: "+1 709 555 0188", company: "Crescent Power Ltd", subject: "Thanks", body: "Thanks for the call today, talk next week.", receivedAt: d("2026-09-16T11:02:00"), status: "Ignored" },
];

export const contracts: T.Contract[] = [];

export const auditLog: T.AuditEntry[] = [
  { id: "au1", at: d("2026-09-06T10:00:00"), user: "Dana Whitfield", action: "Approved", entity: "Approval", entityId: "ap1", detail: "Go/No-Go → GO" },
  { id: "au2", at: d("2026-09-15T15:20:00"), user: "K. Okonkwo", action: "Created", entity: "PriceVersion", entityId: "pv1", detail: "v1 CAD 186,136,364 @ 12%" },
  { id: "au3", at: d("2026-09-16T14:33:00"), user: "Jordan Reyes", action: "Ran extraction", entity: "Tender", entityId: "t1", detail: "Setup extraction (Lite) on 1 document" },
];

export const aiLog: T.AILogEntry[] = [
  { id: "ai1", at: d("2026-09-16T14:33:18"), user: "Jordan Reyes", model: "Lite", promptVersion: "setup-extract v3", task: "Setup extraction", sources: ["ITT Volume 2 - Scope of Work.docx"], input: "Extract metadata, deliverables, milestones", outputSummary: "10 metadata fields, 10 deliverables", confidence: "High", reviewStatus: "Accepted", approver: "Jordan Reyes" },
  { id: "ai2", at: d("2026-09-16T14:40:00"), user: "Jordan Reyes", model: "Lite", promptVersion: "clarify v5", task: "Draft clarifications", sources: ["ITT Volume 2 - Scope of Work.docx"], input: "Identify gaps and conflicts", outputSummary: "2 clarifications drafted", confidence: "Medium", reviewStatus: "Pending" },
  { id: "ai3", at: d("2026-09-12T10:05:00"), user: "Priya Natarajan", model: "Max", promptVersion: "summary v4", task: "AI summary", sources: ["NHA-RFP-0092.pdf"], input: "Summarise RFP", outputSummary: "Summary + CONDITIONAL GO recommendation", confidence: "High", reviewStatus: "Accepted", approver: "Priya Natarajan" },
];

export const notifications: T.Notification[] = [
  { id: "n1", at: d("2026-09-16T08:41:00"), kind: "Client response received", text: "Addendum 2 received for CP-ITT-2026-014 — clarification deadline moved to 7 Oct.", href: "/app/inquiries", read: false },
  { id: "n2", at: d("2026-09-15T15:21:00"), kind: "Pricing approval required", text: "Price version 1 for Flemish Pass awaits approval.", href: "/app/approvals", read: false },
  { id: "n3", at: d("2026-09-15T09:00:00"), kind: "Tender deadline approaching", text: "National Health Records Platform closes in 44 days.", href: "/app/tenders/t3", read: false },
  { id: "n4", at: d("2026-09-14T09:00:00"), kind: "Certification expiring", text: "CAR insurance policy expired 31 Aug — required for Ring Road Phase 3.", href: "/app/tenders/t2/compliance", read: true },
  { id: "n5", at: d("2026-09-16T14:41:00"), kind: "AI finding requires review", text: "2 clarifications drafted by AI await human review.", href: "/app/clarifications/register", read: false },
];
