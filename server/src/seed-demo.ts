/**
 * Gives an account realistic dummy workspaces (tender + documents with text + requirements + compliance + risks + actions + AI Analysis),
 * saved exactly as the app saves them, so dashboards and the admin's bidder view have content.
 *   npm run seed:demo -- bidder@bidwinning.local      → workspaces for a Bidder
 *   npm run seed:demo -- timeglobaltech@gmail.com     → workspaces + CRM pipeline for an admin
 * Safe to re-run: it replaces only the dummy records it created (ids start with "demo-" or "adm<n>-").
 */
import "dotenv/config";
import mongoose from "mongoose";
import { User, Record as DataRecord, KEYED_BY_TENDER } from "./models/index.js";
import { mirrorRecords } from "./mirror.js";

const iso = (d: number) => new Date(Date.now() + d * 86400000).toISOString();
const day = (d: number) => iso(d).slice(0, 10);
type Row = Record<string, unknown>;

interface Spec {
  p: string; // id prefix
  tender: Row;
  docs: { name: string; kind: string; text: string; size: number; pages: number }[];
  reqs: [text: string, category: string, priority: "Must" | "Should" | "Could", clause: string, status: string, docIdx: number, page: number][];
  comps: [item: string, status: string, evidence: string, owner: string, expiry?: number][];
  risks: [kind: "Risk" | "Opportunity", title: string, description: string, category: string, p: number, i: number, mitigation: string, contingency: number][];
  acts: [title: string, status: string, due: number, priority: string][];
  clarification: { ref: string; category: string; title: string; analysis: string };
  milestones?: { name: string; pct: number; date: string }[];
  deliverables?: { name: string; type: "Commercial" | "Technical"; status: string }[];
  aiSummary: {
    recommendation: { verdict: "GO" | "NO-GO" | "CONDITIONAL GO" | "Pending"; reasoning: string };
    sections: Record<string, string[]>;
    contractTerms: { term: string; finding: string; risk: "High" | "Medium" | "Low"; source: string }[];
  };
}

const scores = (v: number[]) => Object.fromEntries(["Strategic fit", "Technical capability", "Experience", "Compliance", "Financial attractiveness", "Expected margin", "Resource availability", "Schedule", "Location", "Competition", "Client relationship", "Contract risk", "Payment terms", "Probability of winning", "Required investment"].map((k, i) => [k, v[i]]));
const base = { progress: 0, status: "Active Campaign", scope: "Full scope", clientTerm: "Employer", bidder: "Sole bidder" };

export const PLATFORM: Spec = {
  p: "adm1",
  tender: { ...base, id: "adm1-t1", name: "Offshore Platform Maintenance — Jubail Field", reference: "ITT-GE-2026-203", client: "Gulf Energy Company", description: "Five-year integrated maintenance, inspection and shutdown support for 6 offshore wellhead platforms.", value: 64000000, currency: "USD", closing: day(34), progress: 30, stage: "Qualification", industry: "oil-gas", service: "Maintenance & inspection", tenderType: "ITT", region: "Middle East", goNoGo: "CONDITIONAL GO", goNoGoReason: "High-value $64M offshore maintenance campaign. Strong technical track record; shutdown overrun LDs of $25,000/day require clear weather/client delay exclusions.", goNoGoScores: scores([4, 4, 5, 3, 4, 3, 3, 3, 4, 2, 4, 3, 3, 3, 2]), metadata: { "Bid bond": "1.5%", "Contract duration": "60 months" }, createdAt: iso(-8) },
  docs: [
    { name: "ITT-GE-2026-203 Invitation to Tender.pdf", kind: "ITT", size: 3_100_000, pages: 112, text: `INVITATION TO TENDER — ITT-GE-2026-203\nIntegrated Offshore Maintenance Services, Jubail Field\n\n1. SCOPE\n1.1 Planned and corrective maintenance for six (6) offshore wellhead platforms (JWP-1 to JWP-6).\n1.2 Annual inspection campaign including NDT, structural integrity assessment and corrosion monitoring.\n1.3 Support for two major shutdowns (turnarounds) of up to 28 days each during the contract term.\n\n2. TERM AND PRICING\n2.1 Initial term of 60 months with an option to extend for 24 months.\n2.2 Pricing as a lump-sum for planned work plus a schedule of rates for corrective work.\n2.3 Annual price adjustment limited to 70% of the published labour index.\n\n3. QUALIFICATION\n3.1 Minimum TRIR of 0.5 over the last three years.\n3.2 At least five years of offshore maintenance experience in the Arabian Gulf.\n3.3 ISO 45001 certified HSE management system.` },
    { name: "HSE and Offshore Safety Requirements.pdf", kind: "Specification", size: 1_240_000, pages: 38, text: `HSE AND OFFSHORE SAFETY REQUIREMENTS\n4.1 All offshore personnel shall hold valid BOSIET/FOET and medical certification.\n4.2 Permit-to-work system compliant with the Company's PTW standard; no hot work without gas testing.\n4.3 Contractor shall submit a project HSE plan within 30 days of award and report incidents within 2 hours.\n4.4 Zero-tolerance policy for stop-work-authority violations.` },
    { name: "Commercial Terms and Conditions.pdf", kind: "Contract", size: 880_000, pages: 41, text: `COMMERCIAL TERMS AND CONDITIONS\n9. Payment: net 60 days from approved invoice.\n10. Liquidated damages for shutdown overrun: USD 25,000 per day, capped at 8% of the shutdown value.\n11. Insurance: contractor to carry USD 20M general liability and full marine cover.\n12. Parent company guarantee required.` },
  ],
  reqs: [
    ["Planned and corrective maintenance for six offshore wellhead platforms.", "Technical", "Must", "1.1", "Approved", 0, 14],
    ["Annual NDT and structural integrity inspection campaign.", "Technical", "Must", "1.2", "Needs Verification", 0, 15],
    ["Support two shutdowns of up to 28 days each.", "Technical", "Must", "1.3", "Needs Verification", 0, 16],
    ["Annual price adjustment limited to 70% of the labour index.", "Commercial", "Must", "2.3", "Needs Verification", 0, 22],
    ["TRIR not exceeding 0.5 over the last three years.", "Qualification", "Must", "3.1", "Partial", 0, 30],
    ["ISO 45001 certified HSE management system.", "Compliance", "Must", "3.3", "Compliant", 0, 31],
    ["All offshore personnel hold BOSIET/FOET and valid medical.", "HSE", "Must", "4.1", "Compliant", 1, 4],
    ["Shutdown overrun LDs of USD 25,000/day capped at 8%.", "Contractual", "Should", "10", "Needs Verification", 2, 6],
    ["Parent company guarantee.", "Contractual", "Must", "12", "Needs Verification", 2, 8],
  ],
  comps: [["ISO 45001 HSE management certificate", "Compliant", "Cert #OHS-7710", "HSE Manager", 410], ["BOSIET/FOET register (offshore crew)", "Needs Review", "14 of 62 certificates expire within 90 days", "HSE Manager", 60], ["TRIR 3-year record ≤ 0.5", "Partially Compliant", "2025 TRIR 0.62 — explanation letter needed", "HSE Manager"], ["Parent company guarantee", "Missing", "Draft with legal", "Legal"], ["General liability insurance USD 20M", "Compliant", "Policy GL-5521", "Finance", 200]],
  risks: [["Risk", "Shutdown overrun liquidated damages", "USD 25k/day LDs for overruns across two 28-day shutdowns.", "Schedule", 3, 5, "Early materials procurement; dedicated shutdown planner; add schedule float.", 600000], ["Risk", "Labour index adjustment capped at 70%", "Wage inflation above the index erodes margin over 60 months.", "Commercial", 4, 3, "Price in a 2% annual escalation reserve.", 900000], ["Risk", "TRIR above threshold in 2025", "Bid could be marked non-compliant at qualification.", "Compliance", 3, 4, "Submit incident analysis and corrective-action evidence.", 0], ["Opportunity", "Extension option and adjacent fields", "24-month extension and two adjacent fields could lift value above USD 90M.", "Strategic", 3, 5, "Offer fixed extension rates in the commercial offer.", 0]],
  acts: [["Prepare TRIR explanation letter", "To Do", 5, "High"], ["Confirm crew certificate renewals", "In Progress", 12, "Medium"], ["Obtain parent company guarantee draft", "To Do", 14, "High"], ["Complete Go/No-Go scoring with leadership", "To Do", 9, "High"]],
  clarification: { ref: "T&C §10", category: "Contractual", title: "Shutdown LD cap and exclusions", analysis: "Request exclusion of client-caused delays and weather downtime from the LD calculation." },
  milestones: [
    { name: "Mobilisation & initial inspection campaign", pct: 15, date: day(60) },
    { name: "Year 1 planned maintenance completion", pct: 20, date: day(365) },
    { name: "Major Shutdown 1 (JWP-1 to JWP-3)", pct: 25, date: day(540) },
    { name: "Year 3 planned maintenance & inspection", pct: 20, date: day(1095) },
    { name: "Major Shutdown 2 (JWP-4 to JWP-6)", pct: 20, date: day(1460) },
  ],
  deliverables: [
    { name: "Offshore HSE and emergency response plan", type: "Technical", status: "In Progress" },
    { name: "Commercial rate breakdown and planned lump-sum schedule", type: "Commercial", status: "Draft" },
    { name: "NDT inspection and baseline structural survey report", type: "Technical", status: "Not started" },
    { name: "Shutdown planning and resource mobilisation schedule", type: "Technical", status: "Not started" },
  ],
  aiSummary: {
    recommendation: {
      verdict: "CONDITIONAL GO",
      reasoning: "High-value $64M offshore maintenance campaign with Gulf Energy Company. Strong technical capability and track record in the Gulf; TRIR 2025 (0.62 vs 0.50 threshold) requires an explanation letter, and shutdown overrun LDs of $25,000/day require clear exclusions for weather and client delays.",
    },
    sections: {
      "Executive Summary": [
        "Integrated 5-year offshore maintenance, inspection and shutdown support for 6 wellhead platforms in Jubail Field, $64M total value, closing in 34 days.",
        "Pricing is hybrid: lump-sum for planned maintenance and schedule of rates for corrective work; includes two 28-day major turnarounds.",
      ],
      "Scope Summary": [
        "Planned and corrective maintenance across 6 platforms (JWP-1 to JWP-6).",
        "Annual NDT inspection, structural integrity assessment, and corrosion monitoring.",
        "Turnaround management and execution for 2 major shutdowns of up to 28 days each.",
      ],
      "Key Requirements": [
        "Minimum 5 years offshore Arabian Gulf maintenance experience (§3.2).",
        "ISO 45001 certified HSE management system (§3.3).",
        "All offshore crew hold valid BOSIET/FOET and offshore medical certificates (§4.1).",
        "TRIR ≤ 0.5 over the last 3 years (§3.1).",
      ],
      "Important Dates": [
        "Clarification deadline: 14 days before closing.",
        "Bid submission closing: in 34 days.",
        "Contract duration: 60 months with 24-month optional extension.",
      ],
      "Commercial Requirements": [
        "Hybrid lump-sum + schedule of rates pricing.",
        "Payment net 60 days from approved invoice (§9).",
        "Parent company guarantee required (§12).",
        "USD 20M general liability and marine insurance cover (§11).",
      ],
      "Legal Requirements": [
        "Shutdown overrun liquidated damages: USD 25,000 per day capped at 8% (§10).",
        "Stop-work authority violations have zero tolerance policy (§4.4).",
        "Annual price adjustment limited to 70% of labour index (§2.3).",
      ],
      "Missing Information": [
        "Historical shutdown duration and work-pack details for JWP-1 through JWP-6.",
        "Gas testing protocol and hot-work permitting handover process.",
        "Weather downtime definition and relief mechanism for marine logistics.",
      ],
      "Potential Risks": [
        "Shutdown overrun LDs ($25k/day) triggered by client-side equipment delivery delays.",
        "Wage inflation exceeding the 70% labour index escalation cap over 5 years.",
        "TRIR threshold exception rejection during qualification review.",
      ],
      "Questions for Client": [
        "Please confirm whether weather standby and client-caused delays are excluded from the shutdown liquidated damages calculation (§10).",
        "Please confirm if parental guarantee from an intermediate regional holding company is acceptable (§12).",
        "Please provide the past 3 years shutdown maintenance history and equipment failure logs.",
      ],
    },
    contractTerms: [
      { term: "Payment Terms", finding: "Net 60 days from approved invoice.", risk: "Medium", source: "Commercial Terms §9 p.41" },
      { term: "Liquidated Damages", finding: "Shutdown overrun USD 25,000/day capped at 8% of shutdown value.", risk: "High", source: "Commercial Terms §10 p.41" },
      { term: "Insurance", finding: "USD 20M general liability and full marine cover required.", risk: "Medium", source: "Commercial Terms §11 p.41" },
      { term: "Performance Bond", finding: "Parent company guarantee required in lieu of cash bond.", risk: "Medium", source: "Commercial Terms §12 p.41" },
      { term: "Termination", finding: "30-day notice for cause; convenience termination subject to work done.", risk: "Medium", source: "Commercial Terms §14 p.42" },
      { term: "Warranty", finding: "12 months on workmanship and replaced mechanical components.", risk: "Low", source: "Commercial Terms §8 p.39" },
      { term: "Change Orders", finding: "Schedule of rates applies for corrective works outside lump-sum baseline.", risk: "Low", source: "ITT §2.2 p.14" },
    ],
  },
};

export const WATER: Spec = {
  p: "demo",
  tender: { ...base, id: "demo-t1", name: "Smart Water Metering — Riyadh Phase 2", reference: "RFP-RMS-2026-014", client: "Riyadh Municipal Water Authority", description: "Supply, installation and commissioning of 48,000 ultrasonic smart water meters with an AMI head-end system.", value: 18500000, currency: "SAR", closing: day(21), progress: 45, stage: "Bid Preparation", industry: "infrastructure", service: "Smart metering", tenderType: "RFP", region: "Middle East", goNoGo: "CONDITIONAL GO", goNoGoReason: "Strong fit; liability clause and 40% local content need a mitigation plan.", goNoGoScores: scores([5, 4, 4, 3, 4, 3, 3, 3, 4, 3, 3, 2, 4, 3, 3]), metadata: { "Bid bond": "2%", "Contract duration": "24 months" }, createdAt: iso(-12) },
  docs: [
    { name: "RFP-RMS-2026-014 Main Document.pdf", kind: "RFP", size: 2_480_000, pages: 86, text: `REQUEST FOR PROPOSAL — RFP-RMS-2026-014\nRiyadh Municipal Smart Water Metering Programme (Phase 2)\n\n1. SCOPE OF WORK\n1.1 The Contractor shall supply, install and commission 48,000 ultrasonic smart water meters (DN15–DN50) across the northern districts of Riyadh.\n1.2 The Contractor shall deliver an AMI head-end system with 15-minute reading intervals and integrate it with the Employer's SCADA via IEC 60870-5-104.\n1.3 All meters shall comply with ISO 4064 Class R160 and carry SASO conformity certification.\n\n2. COMMERCIAL TERMS\n2.1 Prices shall be quoted in SAR, fixed for the full contract duration (24 months).\n2.2 Performance security of 10% of the contract value shall be provided within 14 days of award.\n2.3 Liquidated damages: 0.5% of contract value per week of delay, capped at 10%.\n2.4 Payment: 30% advance against bank guarantee, 60% on delivery milestones, 10% after final acceptance.\n\n3. QUALIFICATION\n3.1 Bidders shall have completed at least two projects of 20,000+ smart meters in the last five years.\n3.2 Bidders shall hold valid ISO 9001 and ISO 14001 certificates.\n3.3 Minimum 40% local content (IKTVA) shall be demonstrated.\n\n4. SUBMISSION\n4.1 Proposals are due 12:00 noon on the closing date. Late submissions will not be considered.\n4.2 Technical and commercial envelopes shall be submitted separately.` },
    { name: "Special Conditions of Contract.pdf", kind: "Contract", size: 640_000, pages: 24, text: `SPECIAL CONDITIONS OF CONTRACT\n14. Warranty: 36 months from final acceptance; defective meters replaced within 10 working days.\n15. Limitation of liability: Contractor liability is unlimited for gross negligence; otherwise capped at 100% of the contract value.\n16. Termination: Employer may terminate for convenience with 30 days notice; no loss of profit payable.\n17. Data ownership: all meter data and AMI configuration belong to the Employer.` },
    { name: "Bill of Quantities.xlsx", kind: "BOQ", size: 310_000, pages: 6, text: `BILL OF QUANTITIES (summary)\nItem 1  Ultrasonic meter DN15  — 36,000 pcs\nItem 2  Ultrasonic meter DN20  — 8,000 pcs\nItem 3  Ultrasonic meter DN25–DN50 — 4,000 pcs\nItem 4  AMI head-end software licence — 1 lot\nItem 5  Data concentrators / gateways — 220 pcs\nItem 6  Installation, commissioning and training — 1 lot` },
  ],
  reqs: [
    ["Supply, install and commission 48,000 ultrasonic smart water meters (DN15–DN50).", "Technical", "Must", "1.1", "Approved", 0, 12],
    ["AMI head-end with 15-minute reading intervals, integrated with SCADA via IEC 60870-5-104.", "Technical", "Must", "1.2", "Needs Verification", 0, 13],
    ["Meters shall comply with ISO 4064 Class R160 and carry SASO certification.", "Compliance", "Must", "1.3", "Compliant", 0, 14],
    ["Prices in SAR, fixed for the 24-month contract duration.", "Commercial", "Must", "2.1", "Approved", 0, 20],
    ["Performance security of 10% of contract value within 14 days of award.", "Commercial", "Must", "2.2", "Needs Verification", 0, 21],
    ["At least two projects of 20,000+ smart meters completed in the last five years.", "Qualification", "Must", "3.1", "Partial", 0, 30],
    ["Demonstrate minimum 40% local content (IKTVA).", "Qualification", "Must", "3.3", "Non-Compliant", 0, 31],
    ["Contractor liability capped at 100% of contract value except gross negligence.", "Contractual", "Should", "15", "Needs Verification", 1, 3],
  ],
  comps: [["ISO 9001 Quality Management certificate", "Compliant", "Cert #QMS-2291, Bureau Veritas", "Quality Lead", 240], ["ISO 14001 Environmental certificate", "Expired", "Cert expired — renewal in progress", "HSE Lead", -20], ["SASO conformity certificate for meters", "Compliant", "SASO-2026-5521", "Technical Lead", 300], ["IKTVA local content plan (40%)", "Missing", "Plan not yet drafted", "Bid Manager"], ["Two reference projects, 20,000+ meters", "Partially Compliant", "One reference verified (Jeddah, 32,000 meters)", "Bid Manager"]],
  risks: [["Risk", "Unlimited liability for gross negligence", "Clause 15 exposes the contractor beyond the 100% cap.", "Contractual", 3, 4, "Request clarification; propose mutual cap and insurance cover.", 150000], ["Risk", "Local content below 40%", "Current plan reaches ~28%; meter assembly is imported.", "Commercial", 4, 4, "Partner with a local assembler; claim installation labour toward IKTVA.", 250000], ["Risk", "Fixed pricing for 24 months", "Component cost inflation on ultrasonic transducers.", "Commercial", 3, 3, "Forward-buy transducers; add 3% escalation contingency.", 120000], ["Opportunity", "Follow-on O&M contract", "Phase 2 award positions the bidder for a 5-year O&M contract.", "Strategic", 3, 4, "Include O&M option pricing in the commercial envelope.", 0]],
  acts: [["Request clarification on liability clause 15", "To Do", 3, "High"], ["Draft IKTVA local content plan", "In Progress", 7, "High"], ["Renew ISO 14001 certificate", "In Progress", 10, "Medium"], ["Finalise pricing and bid bond", "To Do", 15, "Medium"]],
  clarification: { ref: "SCC §15", category: "Contractual", title: "Liability cap for gross negligence", analysis: "Clause 15 makes liability unlimited for gross negligence; request a cap aligned to 100% of contract value." },
  milestones: [
    { name: "Advance payment & engineering approval", pct: 30, date: day(30) },
    { name: "Batch 1 meters delivery (16,000 pcs)", pct: 20, date: day(120) },
    { name: "Batch 2 meters delivery & head-end install", pct: 25, date: day(240) },
    { name: "Batch 3 delivery & network integration", pct: 15, date: day(360) },
    { name: "Final acceptance & commissioning sign-off", pct: 10, date: day(480) },
  ],
  deliverables: [
    { name: "IKTVA local content compliance plan", type: "Commercial", status: "Draft" },
    { name: "SASO certificate and meter data sheets", type: "Technical", status: "Approved" },
    { name: "SCADA IEC 60870-5-104 interface design", type: "Technical", status: "In Progress" },
    { name: "Installation & commissioning execution plan", type: "Technical", status: "Not started" },
  ],
  aiSummary: {
    recommendation: {
      verdict: "CONDITIONAL GO",
      reasoning: "48,000 smart water meter AMI deployment for Riyadh Municipal Water Authority (18.5M SAR). Core competence in smart metering and SCADA; requires clarification on the unlimited liability for gross negligence in SCC §15 and a concrete local content (IKTVA 40%) assembly partner plan.",
    },
    sections: {
      "Executive Summary": [
        "Supply, installation and commissioning of 48,000 ultrasonic smart water meters (DN15–DN50) with AMI head-end system in Riyadh, SAR 18.5M, 24-month duration.",
        "Includes integration with Employer's SCADA via IEC 60870-5-104 and 36-month warranty.",
      ],
      "Scope Summary": [
        "48,000 ultrasonic meters (36k DN15, 8k DN20, 4k DN25-DN50) across Northern Riyadh.",
        "AMI head-end software license and 220 data concentrators / gateways.",
        "Installation, commissioning, resident coordination, and technician training.",
      ],
      "Key Requirements": [
        "Meters comply with ISO 4064 Class R160 and SASO conformity certification (§1.3).",
        "AMI head-end with 15-minute interval readings integrated with SCADA (§1.2).",
        "At least two completed projects of 20,000+ smart meters in the last 5 years (§3.1).",
        "Demonstrate minimum 40% local content / IKTVA (§3.3).",
      ],
      "Important Dates": [
        "Clarification deadline: in 10 days.",
        "Submission due: in 21 days at 12:00 noon.",
        "Contract duration: 24 months from Notice to Proceed.",
      ],
      "Commercial Requirements": [
        "Fixed price in SAR for full 24 months (§2.1).",
        "10% performance security within 14 days of award (§2.2).",
        "30% advance against bank guarantee, 60% on delivery milestones, 10% after final acceptance (§2.4).",
      ],
      "Legal Requirements": [
        "Liquidated damages: 0.5% of contract value per week of delay, capped at 10% (§2.3).",
        "Limitation of liability capped at 100% of contract value, but unlimited for gross negligence (§15).",
        "Termination for convenience with 30 days notice with no loss of profit (§16).",
      ],
      "Missing Information": [
        "Existing pipe materials and isolation valve positions for Northern Riyadh households.",
        "Data residency and hosting infrastructure specifications for the AMI head-end.",
        "Details of SCADA IEC 60870-5-104 interface endpoints and security certificates.",
      ],
      "Potential Risks": [
        "Unlimited liability exposure under clause 15 for gross negligence.",
        "IKTVA local content penalty if imported meter assembly is not balanced by local installation services.",
        "Transducer component inflation under a 24-month fixed price commitment.",
      ],
      "Questions for Client": [
        "Please clarify whether liability for gross negligence can be subject to standard industry insurance caps (SCC §15).",
        "Please confirm whether local installation labour counts towards the 40% IKTVA local content quota.",
        "Please confirm the location of data servers hosting the AMI head-end software.",
      ],
    },
    contractTerms: [
      { term: "Payment Terms", finding: "30% advance against BG, 60% delivery milestones, 10% final acceptance.", risk: "Low", source: "RFP §2.4 p.4" },
      { term: "Liquidated Damages", finding: "0.5% per week of delay, capped at 10% of contract value.", risk: "Medium", source: "RFP §2.3 p.4" },
      { term: "Liability", finding: "Capped at 100% contract value except unlimited for gross negligence.", risk: "High", source: "SCC §15 p.24" },
      { term: "Performance Bond", finding: "10% bank guarantee within 14 days of award.", risk: "Medium", source: "RFP §2.2 p.4" },
      { term: "Warranty", finding: "36 months from final acceptance; 10 working day replacement SLA.", risk: "Low", source: "SCC §14 p.24" },
      { term: "Termination", finding: "Employer convenience termination on 30 days notice; no loss of profit.", risk: "High", source: "SCC §16 p.24" },
      { term: "Intellectual Property", finding: "All meter data and AMI configuration belong to Employer.", risk: "Low", source: "SCC §17 p.24" },
    ],
  },
};

export const SOLAR: Spec = {
  p: "adm3",
  tender: { ...base, id: "adm3-t1", name: "300 MW Solar PV Plant — Sakaka Extension", reference: "RFP-REN-2026-311", client: "National Renewable Energy Company", description: "EPC contract for a 300 MW ground-mounted solar PV plant with 33/380 kV substation and 25-year O&M option.", value: 210000000, currency: "USD", closing: day(40), progress: 55, stage: "Bid Preparation", industry: "renewables", service: "EPC", tenderType: "RFP", region: "Middle East", goNoGo: "GO", goNoGoReason: "Strong track record in utility-scale PV; grid connection date is the main schedule risk.", goNoGoScores: scores([5, 5, 4, 4, 4, 4, 3, 3, 4, 4, 3, 3, 4, 4, 3]), metadata: { "Bid bond": "1%", "Contract duration": "20 months" }, createdAt: iso(-15) },
  docs: [
    { name: "RFP-REN-2026-311 Instructions to Bidders.pdf", kind: "RFP", size: 2_950_000, pages: 98, text: `REQUEST FOR PROPOSAL — RFP-REN-2026-311\n300 MW Solar PV Plant, Sakaka Extension\n\n1. SCOPE\n1.1 The Contractor shall design, supply, install and commission a 300 MW AC ground-mounted solar PV plant on an EPC basis.\n1.2 The works include a 33/380 kV substation and a 12 km 380 kV overhead line to the grid connection point.\n1.3 Modules shall be bifacial monocrystalline, minimum 21.5% efficiency, IEC 61215 and IEC 61730 certified.\n\n2. COMMERCIAL\n2.1 Lump-sum price in USD; 15% advance against bank guarantee.\n2.2 Liquidated damages for delay in COD: 0.1% of contract price per day, capped at 10%.\n2.3 Performance ratio guarantee of 82% measured over the first 12 months.\n\n3. QUALIFICATION\n3.1 At least one utility-scale solar project of 100 MW or more commissioned in the last five years.\n3.2 Minimum 30% local content (IKTVA).` },
    { name: "Technical Specification — PV Plant and Substation.pdf", kind: "Specification", size: 3_400_000, pages: 120, text: `TECHNICAL SPECIFICATION\n4.1 Plant availability guarantee: 99% annual.\n4.2 Inverters shall provide reactive power control and low-voltage ride-through per the grid code.\n4.3 SCADA shall be IEC 61850 compliant with a remote link to the national dispatch centre.\n4.4 Degradation guarantee: maximum 0.45% per year for the first 10 years.` },
    { name: "Draft EPC Contract Conditions.pdf", kind: "Contract", size: 1_120_000, pages: 52, text: `DRAFT EPC CONTRACT CONDITIONS\n8. Defects liability period: 24 months from COD.\n11. Liability cap: 100% of contract price; no cap for fraud or wilful misconduct.\n14. Force majeure excludes grid-operator delay unless notified within 7 days.\n18. Termination for convenience: Employer may terminate on 30 days notice with payment of work done only.` },
    { name: "Price Schedule.xlsx", kind: "BOQ", size: 420_000, pages: 8, text: `PRICE SCHEDULE (summary)\nItem 1  PV modules 300 MWp  — lump sum\nItem 2  Mounting structures and trackers — lump sum\nItem 3  Inverters and MV stations — lump sum\nItem 4  33/380 kV substation — lump sum\nItem 5  380 kV overhead line 12 km — lump sum\nItem 6  O&M years 1-5 — annual fee` },
  ],
  reqs: [
    ["Design, supply, install and commission a 300 MW AC ground-mounted solar PV plant.", "Technical", "Must", "1.1", "Approved", 0, 10],
    ["Construct a 33/380 kV substation and a 12 km 380 kV overhead line.", "Technical", "Must", "1.2", "Approved", 0, 11],
    ["Bifacial modules of at least 21.5% efficiency, IEC 61215 and IEC 61730 certified.", "Compliance", "Must", "1.3", "Compliant", 0, 12],
    ["Performance ratio guarantee of 82% over the first 12 months.", "Technical", "Must", "2.3", "Needs Verification", 0, 20],
    ["Delay LDs of 0.1% per day capped at 10% of contract price.", "Commercial", "Must", "2.2", "Needs Verification", 0, 19],
    ["One utility-scale solar project of 100 MW or more in the last five years.", "Qualification", "Must", "3.1", "Compliant", 0, 28],
    ["Minimum 30% local content (IKTVA).", "Qualification", "Must", "3.2", "Partial", 0, 29],
    ["Plant availability guarantee of 99% annually.", "Technical", "Must", "4.1", "Needs Verification", 1, 5],
    ["SCADA IEC 61850 compliant with link to national dispatch centre.", "Technical", "Should", "4.3", "Compliant", 1, 7],
    ["Force majeure excludes grid-operator delay unless notified within 7 days.", "Contractual", "Should", "14", "Needs Verification", 2, 9],
  ],
  comps: [["ISO 9001 Quality Management certificate", "Compliant", "Cert #QMS-3320", "Quality Lead", 300], ["ISO 45001 HSE certificate", "Compliant", "Cert #OHS-5512", "HSE Manager", 260], ["Bid bond 1%", "Needs Review", "Bank guarantee request submitted", "Finance", 90], ["Local content (IKTVA) certificate", "Needs Review", "Current score 24%, target 30%", "Procurement", 120], ["Module supplier Tier-1 warranty letter", "Compliant", "Letter received", "Technical Lead"]],
  risks: [["Risk", "Grid connection date slips", "Utility may not energise the 380 kV connection before COD, delaying acceptance and triggering LDs.", "Schedule", 3, 4, "Add a grid-delay relief clause; agree a connection programme at clarification stage.", 1800000], ["Risk", "Module price volatility", "Polysilicon prices could rise before the supply order is placed.", "Commercial", 3, 3, "Fix supplier price with a validity period; add escalation provision.", 2500000], ["Risk", "Local content shortfall", "Estimated 24% against the 30% requirement.", "Compliance", 4, 3, "Shift structure fabrication and cabling to local suppliers.", 600000], ["Opportunity", "25-year O&M follow-on", "Winning the EPC positions the bidder for the long-term O&M option.", "Commercial", 3, 4, "Include a competitive O&M offer in the proposal.", 0]],
  acts: [["Request clarification on grid-operator delay (clause 14)", "To Do", 4, "High"], ["Finalise module supplier price validity", "In Progress", 6, "High"], ["Prepare local content improvement plan", "In Progress", 9, "High"], ["Obtain bid bond from bank", "To Do", 15, "Medium"], ["Review LDs and performance ratio with technical team", "To Do", 12, "Medium"]],
  clarification: { ref: "EPC §14", category: "Contractual", title: "Relief for grid-operator delay", analysis: "Request time and cost relief where the grid operator delays energisation of the connection point beyond the agreed programme." },
  milestones: [
    { name: "Advance payment & basic engineering", pct: 15, date: day(45) },
    { name: "Module and tracker delivery on site", pct: 35, date: day(180) },
    { name: "Substation & 380 kV transmission completion", pct: 25, date: day(360) },
    { name: "Cold commissioning & initial energisation", pct: 15, date: day(480) },
    { name: "Commercial Operation Date (COD) & acceptance", pct: 10, date: day(600) },
  ],
  deliverables: [
    { name: "EPC lump-sum price build-up & cashflow", type: "Commercial", status: "Draft" },
    { name: "PVsyst yield simulation and performance ratio model", type: "Technical", status: "Approved" },
    { name: "33/380 kV substation single line diagrams", type: "Technical", status: "In Progress" },
    { name: "Grid compliance & harmonic study report", type: "Technical", status: "Not started" },
  ],
  aiSummary: {
    recommendation: {
      verdict: "GO",
      reasoning: "EPC contract for 300 MW Solar PV Plant + 33/380 kV Substation ($210M). Strong utility-scale solar experience (over 400 MW installed). Grid connection date relief clause must be requested in clarification to avoid delay LDs caused by grid operator.",
    },
    sections: {
      "Executive Summary": [
        "Turnkey EPC for 300 MW ground-mounted solar PV plant at Sakaka, including 33/380 kV substation, 12 km transmission line, and 25-year O&M option, $210M.",
        "Bifacial monocrystalline modules, single-axis trackers, SCADA IEC 61850 integration.",
      ],
      "Scope Summary": [
        "Design, supply, construction and commissioning of 300 MW AC solar PV plant.",
        "33/380 kV step-up substation and 12 km 380 kV overhead line.",
        "12-month performance ratio guarantee (82%) and 24-month defects liability period.",
      ],
      "Key Requirements": [
        "Bifacial modules minimum 21.5% efficiency, IEC 61215/61730 (§1.3).",
        "Minimum 1 utility-scale solar project ≥100 MW in last 5 years (§3.1).",
        "Minimum 30% local content (IKTVA) (§3.2).",
        "Annual plant availability guarantee of 99% (§4.1).",
      ],
      "Important Dates": [
        "Clarification deadline: in 15 days.",
        "Submission due: in 40 days.",
        "Target COD: 20 months from Effective Date.",
      ],
      "Commercial Requirements": [
        "Lump sum in USD; 15% advance payment against bank guarantee (§2.1).",
        "Liquidated damages for COD delay: 0.1% per day, capped at 10% (§2.2).",
        "Module degradation guarantee maximum 0.45%/year for 10 years (§4.4).",
      ],
      "Legal Requirements": [
        "Liability cap: 100% of contract price except fraud/wilful misconduct (§11).",
        "Force majeure excludes grid operator delay unless notified in 7 days (§14).",
        "Convenience termination on 30 days notice with payment of work done (§18).",
      ],
      "Missing Information": [
        "Soil resistivity and geotechnical survey data for Sakaka site.",
        "Grid interconnection agreement schedule and utility commissioning milestones.",
        "Specific route corridor and right-of-way permissions for the 12 km 380 kV line.",
      ],
      "Potential Risks": [
        "Grid operator connection delays pushing COD and triggering liquidated damages.",
        "Polysilicon price volatility between bid and supplier PO placement.",
        "IKTVA local content penalty if mounting structures are imported.",
      ],
      "Questions for Client": [
        "Please confirm that utility-caused delays to the 380 kV energisation date grant full time and cost relief under clause 14.",
        "Please provide the geotechnical report and topographical survey for the Sakaka site.",
        "Please confirm the validity period required for the 25-year O&M pricing option.",
      ],
    },
    contractTerms: [
      { term: "Payment Terms", finding: "Lump sum USD; 15% advance against BG, milestone payments.", risk: "Low", source: "RFP §2.1 p.18" },
      { term: "Liquidated Damages", finding: "0.1% of contract price per day, capped at 10%.", risk: "Medium", source: "RFP §2.2 p.19" },
      { term: "Liability", finding: "100% of contract price cap; uncapped only for fraud/wilful misconduct.", risk: "Low", source: "Contract Conditions §11 p.52" },
      { term: "Warranty", finding: "24-month defects liability period from COD; 10-year module degradation guarantee.", risk: "Low", source: "Contract Conditions §8 p.52" },
      { term: "Force Majeure", finding: "Excludes grid-operator delays unless notified within 7 days.", risk: "High", source: "Contract Conditions §14 p.52" },
      { term: "Termination", finding: "Convenience termination on 30 days notice with payment for work performed.", risk: "Medium", source: "Contract Conditions §18 p.52" },
    ],
  },
};

export const HOSPITAL: Spec = {
  p: "adm4",
  tender: { ...base, id: "adm4-t1", name: "Medical Gas & HVAC Systems — King Faisal Hospital", reference: "ITT-MOH-2026-054", client: "Ministry of Health Projects Directorate", description: "Design, supply and installation of medical gas pipeline systems and HVAC for a 600-bed hospital, including 3-year defects liability.", value: 42000000, currency: "SAR", closing: day(18), progress: 70, stage: "Final Review", industry: "healthcare", service: "MEP systems", tenderType: "ITT", region: "Middle East", goNoGo: "CONDITIONAL GO", goNoGoReason: "Good fit; operating-theatre HVAC experience needs a stronger reference.", goNoGoScores: scores([4, 4, 3, 4, 3, 3, 4, 3, 5, 3, 3, 3, 4, 3, 3]), metadata: { "Bid bond": "2%", "Contract duration": "18 months" }, createdAt: iso(-20) },
  docs: [
    { name: "ITT-MOH-2026-054 Tender Document.pdf", kind: "ITT", size: 2_200_000, pages: 76, text: `INVITATION TO TENDER — ITT-MOH-2026-054\nMedical Gas and HVAC Systems, 600-Bed Hospital\n\n1. SCOPE\n1.1 Design, supply, installation, testing and commissioning of medical gas pipeline systems (oxygen, medical air, vacuum, nitrous oxide).\n1.2 Supply and installation of HVAC systems including 24 operating theatres to ISO 14644 Class 7.\n\n2. COMMERCIAL\n2.1 Fixed price in SAR.\n2.2 Retention of 10% released after the defects liability period.\n2.3 Delay damages of 0.05% per day capped at 10%.\n\n3. QUALIFICATION\n3.1 Three hospital MEP projects of 300+ beds in the last seven years.\n3.2 Manufacturer authorisation for all medical gas equipment.` },
    { name: "Technical Specification — Medical Gas and HVAC.pdf", kind: "Specification", size: 2_050_000, pages: 84, text: `TECHNICAL SPECIFICATION\n5.1 Medical gas systems to comply with HTM 02-01 and NFPA 99.\n5.2 Operating theatres: 20 air changes per hour, HEPA H14 filtration, pressure cascade of 10 Pa.\n5.3 BMS integration via BACnet/IP with alarms to the central control room.\n5.4 Commissioning to include independent third-party verification.` },
    { name: "Contract Conditions.pdf", kind: "Contract", size: 760_000, pages: 33, text: `CONTRACT CONDITIONS\n9. Defects liability period: 36 months from handover.\n12. Contractor liability unlimited for personal injury and death.\n15. Payment: 60 days from certified invoice.\n17. Variations require written instruction; unrecorded variations are not payable.` },
  ],
  reqs: [
    ["Design, supply and install medical gas pipeline systems (O2, medical air, vacuum, N2O).", "Technical", "Must", "1.1", "Approved", 0, 8],
    ["HVAC for 24 operating theatres to ISO 14644 Class 7.", "Technical", "Must", "1.2", "Needs Verification", 0, 9],
    ["Medical gas systems comply with HTM 02-01 and NFPA 99.", "Compliance", "Must", "5.1", "Compliant", 1, 3],
    ["OT air changes of 20/h with HEPA H14 and 10 Pa pressure cascade.", "Technical", "Must", "5.2", "Compliant", 1, 4],
    ["Three hospital MEP projects of 300+ beds in the last seven years.", "Qualification", "Must", "3.1", "Partial", 0, 22],
    ["Manufacturer authorisation for all medical gas equipment.", "Qualification", "Must", "3.2", "Compliant", 0, 23],
    ["Delay damages of 0.05% per day capped at 10%.", "Commercial", "Must", "2.3", "Approved", 0, 18],
    ["Unlimited contractor liability for personal injury and death.", "Contractual", "Should", "12", "Needs Verification", 2, 5],
    ["36-month defects liability period.", "Contractual", "Should", "9", "Approved", 2, 4],
  ],
  comps: [["ISO 9001 Quality Management certificate", "Compliant", "Cert #QMS-2291", "Quality Lead", 240], ["Medical gas installer accreditation (HTM 02-01)", "Compliant", "Accreditation #MG-4410", "Technical Lead", 330], ["Manufacturer authorisation letters", "Compliant", "3 of 3 received", "Procurement"], ["Reference letter — 300+ bed hospital", "Needs Review", "2 of 3 required references available", "Bid Manager"], ["Bid bond 2%", "Compliant", "Issued, valid 120 days", "Finance", 110]],
  risks: [["Risk", "Unlimited liability for injury", "Clause 12 exposes the contractor to uncapped personal-injury claims.", "Contractual", 2, 5, "Confirm insurance limits; request mutual cap for non-fatal injury.", 400000], ["Risk", "Third reference project missing", "Only two of three required hospital references are available.", "Compliance", 4, 4, "Obtain a letter from the Dubai project owner; explain equivalent experience.", 0], ["Risk", "OT HVAC commissioning delay", "Third-party verification could delay handover of operating theatres.", "Schedule", 3, 3, "Schedule early commissioning with the verifier; add float.", 350000]],
  acts: [["Obtain third hospital reference letter", "In Progress", 5, "High"], ["Confirm insurance limits for clause 12", "To Do", 3, "High"], ["Final pricing review with Finance", "To Do", 9, "Medium"], ["Assemble and proofread tender submission", "To Do", 14, "Medium"]],
  clarification: { ref: "Conditions §12", category: "Contractual", title: "Liability for personal injury", analysis: "Request that liability for non-fatal injury be capped at the limits of the contractor insurance." },
  milestones: [
    { name: "Medical gas pipeline rough-in & piping", pct: 25, date: day(90) },
    { name: "HVAC plant and air handling unit installation", pct: 30, date: day(210) },
    { name: "Operating theatre cleanroom HEPA commissioning", pct: 25, date: day(360) },
    { name: "Third-party certification & testing handover", pct: 10, date: day(450) },
    { name: "Retention release after 36-month DLP", pct: 10, date: day(1545) },
  ],
  deliverables: [
    { name: "HTM 02-01 compliance verification report", type: "Technical", status: "Approved" },
    { name: "Operating theatre pressure cascade design calculations", type: "Technical", status: "In Progress" },
    { name: "Medical gas equipment manufacturer authorisations", type: "Commercial", status: "Draft" },
    { name: "HVAC third-party commissioning plan", type: "Technical", status: "Not started" },
  ],
  aiSummary: {
    recommendation: {
      verdict: "CONDITIONAL GO",
      reasoning: "42M SAR Medical Gas & HVAC for 600-bed King Faisal Hospital. High technical capability; must secure a reference confirmation letter for 300+ bed hospital and clarify the unlimited liability clause for personal injury in Conditions §12.",
    },
    sections: {
      "Executive Summary": [
        "Design, supply, installation, testing and commissioning of medical gas pipeline systems and HVAC for 600-bed King Faisal Hospital, SAR 42M, 18-month duration.",
        "Includes 24 operating theatres to ISO 14644 Class 7 and 3-year defects liability.",
      ],
      "Scope Summary": [
        "Medical gas systems (O2, medical air, vacuum, N2O) compliant with HTM 02-01 and NFPA 99.",
        "HVAC systems with 20 air changes/hour, HEPA H14 filtration, 10 Pa pressure cascade for 24 operating theatres.",
        "Central BMS integration via BACnet/IP and third-party commissioning verification.",
      ],
      "Key Requirements": [
        "Three hospital MEP projects of 300+ beds in the last 7 years (§3.1).",
        "Manufacturer authorisation for all medical gas equipment (§3.2).",
        "Defects liability period of 36 months from handover (§9).",
        "Third-party independent commissioning verification (§5.4).",
      ],
      "Important Dates": [
        "Clarification deadline: in 7 days.",
        "Submission due: in 18 days.",
        "Contract duration: 18 months + 36-month DLP.",
      ],
      "Commercial Requirements": [
        "Fixed price in SAR.",
        "Retention: 10% released after defects liability period (§2.2).",
        "Delay damages: 0.05% per day capped at 10% (§2.3).",
        "Payment: 60 days from certified invoice (§15).",
      ],
      "Legal Requirements": [
        "Unlimited contractor liability for personal injury and death (§12).",
        "Variations strictly require written instruction prior to execution (§17).",
      ],
      "Missing Information": [
        "Operating theatre architectural layout and riser shaft dimensions.",
        "Existing central plant chillers capacity and chilled water flow rates.",
        "Specified third-party verification agency list approved by MoH.",
      ],
      "Potential Risks": [
        "Unlimited liability exposure under clause 12 for personal injury.",
        "Shortfall on third 300+ bed hospital reference project.",
        "Operating theatre commissioning delays due to third-party agency scheduling.",
      ],
      "Questions for Client": [
        "Please confirm whether liability for non-fatal injury can be capped at the contractor's general liability insurance policy limit (§12).",
        "Please confirm whether equivalent healthcare facility references in the GCC are acceptable for qualification (§3.1).",
        "Please provide the list of approved independent third-party verification agencies.",
      ],
    },
    contractTerms: [
      { term: "Payment Terms", finding: "60 days from certified invoice.", risk: "Medium", source: "Contract Conditions §15 p.33" },
      { term: "Retention", finding: "10% retained until expiration of 36-month defects liability period.", risk: "High", source: "RFP §2.2 p.12" },
      { term: "Liquidated Damages", finding: "0.05% per day capped at 10% of contract value.", risk: "Medium", source: "RFP §2.3 p.12" },
      { term: "Liability", finding: "Unlimited liability for personal injury and death.", risk: "High", source: "Contract Conditions §12 p.33" },
      { term: "Warranty", finding: "36-month defects liability period from handover.", risk: "Medium", source: "Contract Conditions §9 p.33" },
      { term: "Change Orders", finding: "Written instruction required; unrecorded variations unpayable.", risk: "Medium", source: "Contract Conditions §17 p.33" },
    ],
  },
};

const CRM = (me: string) => {
  const co = (n: number, name: string, type: string, country: string, industry: string): Row => ({ id: `adm-co${n}`, name, industry, subIndustry: "", country, region: "Middle East", website: "", type, services: [], certifications: [], notes: "", createdAt: iso(-90) });
  const opp = (n: number, name: string, c: number, industry: string, value: number, prob: number, stage: string, award: number): Row => ({ id: `adm-op${n}`, name, companyId: `adm-co${c}`, industry, service: "", region: "Middle East", value, currency: "USD", probability: prob, expectedAward: day(award), expectedStart: day(award + 60), owner: me, source: "Direct", stage, notes: "", createdAt: iso(-60 + n * 8) });
  return {
    companies: [co(1, "Gulf Energy Company", "Client", "Saudi Arabia", "oil-gas"), co(2, "Metropolitan Transit Authority", "Client", "United Arab Emirates", "infrastructure"), co(3, "Riyadh Municipal Water Authority", "Prospect", "Saudi Arabia", "infrastructure"), co(4, "Nordic Subsea AS", "Partner", "Norway", "oil-gas")],
    contacts: [{ id: "adm-ct1", companyId: "adm-co1", name: "Faisal Al-Harbi", title: "Procurement Manager", email: "f.alharbi@gulfenergy.example", phone: "+966 50 000 1111", role: "Decision maker", notes: "" }, { id: "adm-ct2", companyId: "adm-co2", name: "Mariam Al-Suwaidi", title: "Head of Contracts", email: "m.suwaidi@mta.example", phone: "+971 50 000 2222", role: "Evaluator", notes: "" }],
    opportunities: [opp(1, "Offshore Platform Maintenance — Jubail", 1, "oil-gas", 64000000, 40, "Tender", 120), opp(2, "Smart Metering — Riyadh Phase 2", 3, "infrastructure", 18500000, 45, "Bid", 21), opp(3, "300 MW Solar PV Plant — Sakaka", 1, "renewables", 210000000, 55, "Tender", 40), opp(4, "King Faisal Hospital Medical Gas & HVAC", 1, "healthcare", 42000000, 70, "Final Review", 18)],
  };
};

/**
 * Seeds a user with 4 realistic workspaces (tenders + docs + AI Analysis + requirements + compliance + risks).
 * Guaranteed to leave no empty workspaces.
 */
export async function seedUserWorkspaces(user: { _id: unknown; orgId: unknown; name: string; role: string; email?: string }) {
  const specs = [PLATFORM, WATER, SOLAR, HOSPITAL];
  const out: Record<string, Row[]> = {};
  const push = (c: string, rows: Row[]) => (out[c] ||= []).push(...rows);

  for (const sp of specs) {
    const tid = String(sp.tender.id);
    const p = sp.p;
    push("tenders", [{ ...sp.tender, owner: user.name }]);
    const docIds = sp.docs.map((_, i) => `${p}-d${i + 1}`);
    push("docs", sp.docs.map((d, i) => ({
      id: docIds[i],
      tenderId: tid,
      name: d.name,
      size: d.size,
      rev: 1,
      kind: d.kind,
      status: "INDEXED",
      uploadedAt: iso(-8 + i),
      uploadedBy: user.name,
      language: "English",
      confidentiality: "Confidential",
      pages: d.pages,
      text: d.text,
      history: [{ rev: 1, at: iso(-8 + i), by: user.name, note: "Uploaded" }],
    })));
    push("requirements", sp.reqs.map((r, i) => ({
      id: `${p}-r${i + 1}`,
      tenderId: tid,
      text: r[0],
      category: r[1],
      priority: r[2],
      sourceDoc: docIds[r[5]],
      page: r[6],
      section: r[3].split(".")[0],
      clause: r[3],
      evidence: "",
      status: r[4],
      reviewer: user.name,
      comments: "",
      ai: true,
      confidence: "High",
    })));
    push("complianceItems", sp.comps.map((c, i) => ({
      id: `${p}-c${i + 1}`,
      tenderId: tid,
      item: c[0],
      status: c[1],
      evidence: c[2],
      expiry: c[4] === undefined ? undefined : day(c[4]),
      owner: c[3],
      notes: "",
    })));
    push("risks", sp.risks.map((r, i) => ({
      id: `${p}-k${i + 1}`,
      tenderId: tid,
      n: i + 1,
      kind: r[0],
      title: r[1],
      description: r[2],
      category: r[3],
      probability: r[4],
      impact: r[5],
      postProbability: Math.max(1, r[4] - 1),
      postImpact: Math.max(1, r[5] - 1),
      owner: user.name,
      status: "Open",
      mitigation: r[6],
      contingency: r[7],
    })));
    push("actions", sp.acts.map((a, i) => ({
      id: `${p}-a${i + 1}`,
      tenderId: tid,
      title: a[0],
      agent: "Bid Manager",
      status: a[1],
      createdAt: iso(-4),
      priority: a[3],
      assignee: user.name,
      due: day(a[2]),
    })));
    push("clarifications", [{
      id: `${p}-q1`,
      tenderId: tid,
      n: 1,
      ref: sp.clarification.ref,
      round: 1,
      category: sp.clarification.category,
      title: sp.clarification.title,
      analysis: sp.clarification.analysis,
      status: "Draft",
      confidence: "High",
      assignee: user.name,
      due: day(5),
      author: user.name,
      createdAt: iso(-2),
      pending: true,
    }]);
    if (sp.milestones) {
      push("milestones", sp.milestones.map((m, i) => ({
        id: `${p}-m${i + 1}`,
        tenderId: tid,
        name: m.name,
        pct: m.pct,
        date: m.date,
      })));
    }
    if (sp.deliverables) {
      push("deliverables", sp.deliverables.map((dl, i) => ({
        id: `${p}-dl${i + 1}`,
        tenderId: tid,
        n: i + 1,
        name: dl.name,
        type: dl.type,
        owner: user.name,
        status: dl.status,
        due: day(14 + i * 5),
      })));
    }
    // AI Analysis (aiSummaries)
    push("aiSummaries", [{
      tenderId: tid,
      generatedAt: iso(-3),
      model: "BidWinning AI · Verified",
      recommendation: sp.aiSummary.recommendation,
      sections: sp.aiSummary.sections,
      contractTerms: sp.aiSummary.contractTerms,
    }]);
  }

  if (user.role !== "Bidder") {
    for (const [c, rows] of Object.entries(CRM(user.name))) push(c, rows as Row[]);
  }

  for (const [collection, docs] of Object.entries(out)) {
    const isKeyedByTender = KEYED_BY_TENDER.has(collection);
    const ops = docs.map((d) => {
      const id = String(isKeyedByTender ? d.tenderId : d.id);
      return {
        updateOne: {
          filter: { orgId: user.orgId, collection, id },
          update: {
            $set: { data: d, updatedBy: user.name },
            $setOnInsert: { ownerId: user._id, ownerName: user.name },
          },
          upsert: true,
        },
      };
    });
    if (ops.length) {
      await DataRecord.bulkWrite(ops as any, { ordered: false });
      await mirrorRecords(user.orgId, collection, docs.map((d) => String(isKeyedByTender ? d.tenderId : d.id)));
    }
  }
}

async function main() {
  const email = (process.argv[2] || "bidder@bidwinning.local").toLowerCase();
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bidwinning");
  const user = await User.findOne({ email });
  if (!user) throw new Error(`No account with email ${email}`);
  await seedUserWorkspaces(user);
  console.log(`Saved 4 full workspaces with AI analysis for ${user.email} (${user.role})`);
  await mongoose.disconnect();
}

if (process.argv[1]?.endsWith("seed-demo.ts") || process.argv[1]?.endsWith("seed-demo.js")) {
  main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
}
