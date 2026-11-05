import { brand } from "@/config/brand";

export const howItWorks = [
  { n: "01", title: "DISCOVER", body: "Find opportunities and manage prospects. Inquiries from email, WhatsApp and the web land in one pipeline." },
  { n: "02", title: "ANALYZE", body: "Upload tenders, RFPs, RFQs and contracts. AI extracts requirements, dates, terms and risks — every finding cited to page and clause." },
  { n: "03", title: "QUALIFY", body: "Compare requirements with your capabilities, certifications and experience. See what is matched, missing, expired or unknown." },
  { n: "04", title: "DECIDE", body: "Make a data-driven Go / No-Go decision on a scored card, with management override and a documented reason." },
  { n: "05", title: "BUILD", body: "Create technical, commercial and pricing packages with engineering, procurement and costing in one workspace." },
  { n: "06", title: "SUBMIT", body: "Route through technical, commercial, legal and management review. Approve, lock the price and assemble the package." },
  { n: "07", title: "LEARN", body: "Track results, win/loss reasons and lessons learned, and feed them into the next opportunity." },
];

export const modules = [
  { n: "01", title: "CRM & Opportunities", body: "Companies, contacts, pipeline from Lead to Won, and inquiry intake — one client record that flows into every tender." },
  { n: "02", title: "AI Document Intelligence", body: "Structured extraction of requirements, dates, values and contract terms with source references and human verification." },
  { n: "03", title: "Compliance & Capability Matching", body: "Industry-configurable compliance templates checked against your organisation's capabilities and expiries." },
  { n: "04", title: "Go / No-Go Engine", body: "Fifteen scored criteria, a transparent verdict and an auditable management override." },
  { n: "05", title: "Clarifications, Qualifications & Risk", body: "Clarification log, deviation register and a 5×5 risk matrix with pre- and post-mitigation scoring." },
  { n: "06", title: "Engineering & Procurement", body: "Template-driven engineering workspaces and a universal RFQ → quotation → evaluation → award workflow." },
  { n: "07", title: "Costing & Pricing", body: "Configurable cost categories, margin and markup, locked approved prices and versioned changes." },
  { n: "08", title: "Proposals, Reviews & Submission", body: "AI first drafts, human editing, staged reviews, approvals and a submission-readiness score computed from real data." },
  { n: "09", title: "Intelligence & ERP", body: "Competitor records with sources, win/loss analytics, lessons learned, contracts and projects." },
];

export const landingIndustries = [
  ["🛢️", "Oil & Gas", "EPC/EPCI, HSE prequalification, vessel spreads, local content."],
  ["🌉", "Infrastructure", "Roads, bridges, rail: licences, BOQ, equipment fleets, references."],
  ["🏗️", "Construction", "Civil, structural, MEP: permits, method statements, safety."],
  ["🏭", "Manufacturing", "Product standards, factory certifications, FAT and capacity."],
  ["⚡", "Energy", "Generation, transmission, storage: grid codes and O&M."],
  ["💻", "IT & Technology", "Cloud, software, cybersecurity: ISO 27001, data residency, SLAs."],
  ["📡", "Telecom", "Fibre, towers, core network: type approvals and rollout plans."],
  ["🏥", "Healthcare", "Regulatory approvals, product registrations, quality standards."],
  ["🏛️", "Government", "Public procurement registration, disclosures, in-country value."],
  ["🚆", "Transportation", "Rail, fleet and traffic systems."],
  ["⛏️", "Mining", "Mining licences, environmental approvals, contract mining."],
  ["🏢", "Real Estate", "Development, property and facilities management."],
  ["💧", "Water & Utilities", "Treatment, networks, desalination, O&M."],
  ["💼", "Professional Services", "Consulting, legal, audit: personnel and experience."],
  ["◻️", "Other Industries", "Configure your own template — no code changes required."],
];

export const plans = [
  { name: "Starter", price: 199, popular: false, features: ["1 user", "2 active tender workspaces", "1 industry template", "1,000 AI credits per month", "CRM, requirements, compliance, Go/No-Go", "Clarifications, qualifications, risk register", "Word & Excel exports", "Email support"] },
  { name: "Team", price: 499, popular: true, features: ["Up to 5 users", "5 active tender workspaces", "All industry templates", "5,000 AI credits per month", "Engineering, procurement, costing & pricing", "Proposals, reviews & approvals", "Priority email support"] },
  { name: "Enterprise", price: 1499, popular: false, features: ["Up to 15 users", "Unlimited tender workspaces", "Custom industry templates & workflows", "20,000 AI credits per month", "Contracts & projects (ERP)", "WhatsApp / email intake automation", "SSO, audit export, dedicated account manager"] },
];

export const faq = [
  { q: "Is this only for Oil & Gas?", a: `No. ${brand.company} is industry-agnostic at its core. Oil & Gas, Infrastructure, Construction, Manufacturing, IT, Healthcare, Government and others are templates you enable — and you can build your own.` },
  { q: "Do I need a credit card to start the trial?", a: "Yes. A card is required to start the 3-day trial so the workspace is ready the moment you decide to continue. You are not charged until the trial ends." },
  { q: "What happens when the trial ends?", a: "After 3 days you are billed the standard monthly rate for the plan you chose, unless you cancel before the trial ends." },
  { q: "Can I cancel anytime?", a: "Yes. Cancel from Settings → Billing at any time; access continues until the end of the current billing period." },
  { q: "How does the AI avoid making things up?", a: "Every AI finding carries its source document, page and clause and enters as 'Needs Verification'. Nothing counts until a human approves it. Competitor data is never generated — only recorded with a source and confidence." },
  { q: "What counts against my AI credits?", a: "Every analysis, extraction, draft and chat turn consumes credits proportional to the tokens read and produced. Estimates are shown before each run." },
  { q: "Is my data isolated?", a: "Yes. Each organisation's users, clients, tenders, documents, pricing and AI data are isolated. See our DPA." },
  { q: "Can I switch plans?", a: "Yes. Upgrades apply immediately and are prorated; downgrades apply at the next billing date." },
];

export const crmStages = [
  { n: "1", title: "Lead", body: "An inquiry from email, WhatsApp or the web — or a prospect you found." },
  { n: "2", title: "Qualified", body: "Company, contacts, industry and commercial value confirmed." },
  { n: "3", title: "Tender", body: `The opportunity opens straight into a ${brand.workspace}: same client, same scope.` },
  { n: "4", title: "Won / Lost", body: "The record closes with the result, feeding contracts, projects and lessons learned." },
];

export const crmFeatures = [
  { n: "01", title: "Pipeline Board", body: "Lead → Prospect → Qualified → Opportunity → Tender → Bid → Won/Lost, with value, probability and weighted value on every card." },
  { n: "02", title: "Companies & Contacts", body: "Clients, partners, competitors and prospects with industry, services, certifications and full communication history." },
  { n: "03", title: "Inquiry Intake", body: "Not every message is an inquiry. Mark as inquiry, attach to an existing tender, or create a new opportunity — no duplicates." },
  { n: "04", title: "Activities", body: "Calls, meetings, emails and WhatsApp logged against the company and opportunity so history travels with the deal." },
  { n: "05", title: "Commercial Modelling", body: "Estimated value, stage-weighted value, expected award and start dates, kept current as the opportunity moves." },
  { n: "06", title: "Dashboard", body: "Pipeline by industry, region, client, stage and tender type; deadlines and revenue forecast." },
];
