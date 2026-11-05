# Master Product Spec — AI-Powered Multi-Industry Tender, Bid & Procurement Intelligence ERP

> Source of truth for product direction. Given by the product owner on 2026-09-16.
> Scope note: **Invoices and Payments are out of scope for now** (Phase 7 items deferred).

## Positioning
AI-Powered Multi-Industry Tender, Bid & Procurement Intelligence Platform = CRM + Tender Intelligence + AI Document Intelligence + Compliance + Bid Qualification + Risk + Engineering + Procurement + Costing + Pricing + Proposal + Submission + Competitor Intelligence + Project ERP.

**Industry-agnostic at the core, industry-specialised through configurable templates.** Oil & Gas is one template, not the product identity.

## Lifecycle
DISCOVER → PROSPECT → OPPORTUNITY → TENDER/RFP/RFQ → DOCUMENT ANALYSIS → QUALIFICATION → COMPLIANCE → GO/NO-GO → BID STRATEGY → CLARIFICATIONS → TECHNICAL → PROCUREMENT → COSTING → PRICING → RISK → PROPOSAL → REVIEW → APPROVAL → SUBMISSION → WIN/LOSE → CONTRACT → PROJECT → (INVOICE → PAYMENT — deferred) → LESSONS LEARNED

## Industries (configurable)
Oil & Gas, Infrastructure, Construction, Manufacturing, Engineering, Energy, Renewable Energy, Power & Utilities, Telecom, IT & Software, Government, Healthcare, Pharmaceuticals, Transportation, Logistics, Mining, Real Estate, Facilities Management, Industrial Services, Water & Wastewater, Defense & Aerospace (where legal), Education, Consulting, Professional Services, Trading & Supply, Other.

## Template entities
Industries · Industry Categories · Service Categories · Tender Types · Requirement Types · Compliance Templates · Document Templates · Workflow Templates · Costing Templates · Proposal Templates · Risk Templates

## Tender types
Tender, RFP, RFQ, RFI, ITT, EOI, Prequalification, Framework Agreement, Government Procurement, Private Procurement, Direct Opportunity, Subcontract Opportunity, Vendor Registration, Partner Opportunity

## Core modules (navigation)
Dashboard · CRM (Companies, Contacts, Opportunities) · Tender Intelligence · Tender Workspaces · Documents · AI Analysis · Requirements · Compliance · Contractors/Vendors · Competitors · Clarifications · Qualifications · Risk & Opportunities · Engineering · Procurement · Suppliers · Costing · Pricing · Technical Proposals · Commercial Proposals · Reviews · Approvals · Submission · Contracts · Projects · Reports · Analytics · Lessons Learned · Settings · Administration

## Key rules
- **Source-based AI**: every AI finding carries source doc / page / section / clause + status (Needs Verification → Approved/Rejected). Never present AI assumptions as facts. Never fabricate competitor data ("Insufficient verified information").
- **AI governance**: log model, prompt version, timestamp, user, sources, input, output, confidence, review status, approver. AI never silently changes approved data.
- **Go/No-Go engine**: scored criteria → GO / CONDITIONAL GO / NO-GO; management override with reason.
- **Pricing**: lock approved price; any change = new price version.
- **Tender Health** (0–100) computed from real data: Requirements, Compliance, Documents, Technical, Commercial, Pricing, Risk, Submission.
- **Multi-tenant**: strict org isolation. Roles: Super Admin, Org Admin, BD, Tender Manager, Technical Manager, Engineer, Procurement Manager, Commercial Manager, Finance, Legal, Compliance, Project Manager, Reviewer, Executive, Viewer, Contractor/Vendor.
- **Audit trail**: immutable log of create/edit/view/download/approve/reject/price change/submit/status change.
- **Communication intake** (WhatsApp/Email via n8n → Laravel API): "Mark as Inquiry"; update existing inquiry / attach to existing tender / create new opportunity — no duplicates.

## Tender Workspace (most important screen)
Header: name, reference, client, industry, tender type, deadline, value, owner, status, Go/No-Go, health.
Tabs: Overview, Documents, AI Analysis, Requirements, Compliance, Clarifications, Qualifications, Risks, Engineering, Procurement, Costing, Pricing, Competition, Technical, Commercial, Reviews, Deliverables, Submission, Result, Lessons Learned.
Right sidebar: Deadline, Tender Health, Go/No-Go, AI Review, Missing Documents, Risk, Pricing Status, Submission Readiness.

## Landing page
Industry-neutral. H1 "AI-Powered Tender & Bid Intelligence" · H2 "Turn Complex Opportunities Into Winning Bid Strategies." · CTAs: Get Started / Request Demo / Explore Platform · Industry cards · How it works (01 Discover … 07 Learn).

## Design
Premium enterprise SaaS: deep navy, white, neutral gray, professional blue accents, data-rich dashboards, strong status indicators. No cartoonish UI, gradients, consumer look.

## Phases
1 Foundation (auth, orgs, roles, industries, companies, contacts, CRM, dashboard) · 2 Tender Intelligence (tenders, documents, AI extraction/summary, requirements, sources) · 3 Qualification (vendor profiles, capability matching, compliance, Go/No-Go, clarifications, qualifications, risk) · 4 Bid Production (engineering, procurement, costing, pricing, technical & commercial proposals) · 5 Review & Submission (reviews, approvals, deliverables, package, tracking) · 6 Intelligence (competitors, benchmarking, win/loss, lessons, analytics) · 7 ERP (contracts, projects; invoices & payments deferred)
