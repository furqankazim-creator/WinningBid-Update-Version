# BidWinning — AI-Powered Multi-Industry Tender, Bid & Procurement Intelligence Platform

CRM + Tender Intelligence + AI Document Intelligence + Compliance + Bid Qualification + Risk + Engineering + Procurement + Costing + Pricing + Proposals + Submission + Competitor Intelligence + Project ERP.

**Industry-agnostic at the core, industry-specialised through configurable templates.** Full product spec: [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md). Invoices & payments are deliberately out of scope for now.

Built with Next.js 15 (App Router), TypeScript, Tailwind v4, lucide-react, zustand.

## Run
```bash
npm install
npm run dev      # http://localhost:3000  (landing)  ·  /app  (platform)
npm run build
```

## Architecture

| Path | What |
|---|---|
| `src/lib/industries.ts` | **Industry template layer.** 25 industries × services, compliance items, cost/risk categories, engineering sections, proposal sections, document types. Plus tender types, requirement categories, contract terms, Go/No-Go criteria, review stages, roles. The core never branches on an industry name. |
| `src/lib/useIndustries.ts` | Built-in templates merged with org-defined overrides from Administration → Industry Templates. |
| `src/store/types.ts` | Domain model: Tender (industry, tenderType, stage, goNoGo…), Company, Contact, Opportunity, Requirement (with source doc/page/clause), ComplianceItem, Capability, AISummary, Review, Approval, PriceVersion, ProposalSection, BidResult, Inquiry, Contract, Project, AuditEntry, AILogEntry, Notification, User, Org. |
| `src/store/seed.ts`, `seed2.ts` | Demo data across Oil & Gas, Infrastructure and IT tenders. |
| `src/store/useStore.ts` | zustand store (persisted in `localStorage`, key `vendoriq-tenderos`, v2). All CRUD actions, audit logging, AI logging, notifications, `tenderHealth()` and `goNoGoVerdict()` computed from real records. |
| `src/components/app/nav.ts` | Grouped navigation: Dashboard · CRM · Tender Intelligence · Active Workspace · Governance · ERP · Intelligence · Administration. |
| `src/app/app/tenders/[id]/` | **Tender Workspace**: header (ref, client, industry, type, deadline, value, owner, status, Go/No-Go, health), 20 tabs, right sidebar (deadline, health factors, Go/No-Go, AI review, missing docs, risk, pricing, readiness). |
| `src/app/(marketing)/` | Industry-neutral landing: Home, Platform, Industries, CRM, Pricing, About, legal. |
| `src/config/brand.ts` | Company / product names — change once. |

## Key behaviours implemented
- **Global industry filter** (top bar) applied to dashboard, tenders, opportunities, companies and reports.
- **Source-based AI**: requirements carry source doc, page, section, clause, confidence and enter as *Needs Verification*; approve / reject / edit / assign reviewer. AI summary and contract-terms review cite sources and flag terms not found. Every run is logged in AI Governance.
- **Capability matching**: tender requirements and compliance items vs. *Our Capabilities* → MATCHED / MISSING / EXPIRED / UNKNOWN / PARTIAL / NEEDS VERIFICATION.
- **Go/No-Go engine**: 15 scored criteria → GO / CONDITIONAL GO / NO-GO with management override + reason → approval request.
- **Pricing**: versioned; approval → lock; any change = new version.
- **Reviews & approvals**: 7 review stages; approvals for Go/No-Go, pricing, proposals, submission; all audited.
- **Bid result → win/loss analytics → lessons learned → contract → project.**
- **Inquiry intake**: Mark as Inquiry / attach to existing tender or opportunity / create new opportunity (no duplicates).
- **Administration**: Industry Template Builder, Users & Roles (16 roles, permission matrix), immutable Audit Trail, AI Governance log.
- Legacy Bravo-style modules (clarifications, contract register, qualifications, risk register & 5×5, deliverables, cost build-up, procurement tabulation, competition, presentations, submission, action board, agent chat) live under the active workspace.

- **Per-tender scoping**: every workspace module (documents, clarifications, contract register, qualifications, risks, deliverables, costing, procurement, competition) is filtered to the active tender via `useScopedStore()`; new records inherit the active tender.
- **Document management**: type (from industry template), version history, language, confidentiality, permissions, uploader, per-document "Analyze" (AI general-information extraction, logged).
- **Vendors & Partners**: generic partner types (Contractor, Supplier, Manufacturer, Consultant, JV, Technology Partner…), industry, certifications with expiry, licences, equipment, size, track record, ratings.
- **Procurement**: store-driven Requirement → RFQ → Quotations → weighted Evaluation → Recommend award → Procurement approval, across material/equipment/software/services/subcontractors/logistics.
- **Submission**: readiness checks, management approval, assemble package, record submission (version, timestamp, by, method, confirmation), manifest + checklist export.
- **Templates** also carry custom tender fields (shown on Overview) and clarification question templates.

## Landing theme & animation
Light / dark / system toggle plus five accent themes (Ember, Ocean, Emerald, Violet, Rose) via the nav controls, persisted in `localStorage` and applied pre-paint by an inline boot script (`src/components/marketing/Theme.tsx`). URL params `?theme=dark&accent=blue` preset them for demos. The workspace (`/app`) has its own **light/dark toggle** in the top bar and in Settings → Preferences (persisted as `vq.appMode`; `?app=light` presets it, `?demo=1` opens the sample workspace in demo mode). Scroll-reveal (`.reveal`), floating hero cards, gradient headline, lifecycle marquee; all honour `prefers-reduced-motion`.

## Charts
`src/components/app/charts.tsx`: animated horizontal bars, columns, donut, area/line with crosshair tooltip, KPI count-up. Categorical palette is fixed-order and validated (dataviz six checks) against the dark surface.

## Backend (Express + MongoDB) — `server/`
Real multi-tenant persistence and auth. See [server/README.md](server/README.md) for endpoints, storage model and deploy steps.
- **Auth**: email + password, JWT; first user creates the organisation and becomes Organization Admin; admins create 7-day **invite links** (`/sign-up?invite=…`) that assign a role. Viewer / Contractor roles are read-only server-side.
- **Data**: every store collection is persisted per organisation via `PUT /api/data/:collection/sync` (debounced change-sync in `src/store/sync.ts`) and available as per-record REST. New organisations are seeded with the demo dataset so every page has content.
- **Audit**: append-only server log fed by every `audit()` call; loaded into Administration → Audit Trail.
- Frontend switches to the API when `NEXT_PUBLIC_API_URL` is set (top-bar cloud icon shows saved/saving/error); without it the app runs in local demo mode.
```bash
npm run api          # API on :4000 with in-memory MongoDB
NEXT_PUBLIC_API_URL=http://localhost:4000 npm run dev
npm run api:test     # 17-check API smoke test
```

## Verified document analysis
Upload → **Analyze** runs a 7-step pipeline (`src/lib/server/verified/`) in which code, not the AI, guarantees authenticity:
1. **Extraction** — PDF text layer (`unpdf`) **plus an OCR cross-check** (tesseract, fully offline, hosted in the Express API at `/api/ocr/pdf`) because many PDFs silently drop bold/outlined text and scanned pages. OCR-derived lines are marked; pages OCR cannot read reliably (drawings, rotated sheets) are reported as *unreadable*, never guessed. Repeated title blocks are removed.
2. **Structure & requirements** — pages → numbered clauses → every “shall/must” sentence kept **verbatim with page and clause**; duplicates merged.
3. **Library check (no AI)** — every cited standard (SAES/SAEP/SAMSS/SAEHC/GI/NFPA/ASCE…) is looked up in the local LanceDB library (newest revision wins, project documents are never rules); typos, edition conflicts, TOC/body mismatches, un-listed standards and missing project documents are reported.
4. **Retrieval** — hybrid (vector + keyword + direct citation) over the standards folder, with cover/contents pages filtered out.
5. **AI judgement** — the model sees only the retrieved rule sentences and answers *Conforms / Conflicts / Not covered* by **pointing at a rule and sentence number**; the quotation is supplied by code.
6. **Automatic verification** — every AI quote must exist on its source page, every rule id is re-read from the database and checked for active revision; failures are downgraded or dropped. An AI step that fails is reported as a failure and never turned into a verdict.
7. **Human approval → report** — findings wait for approve/reject; the PDF/Excel are assembled from those records with the library version, model and prompt stamped. AI *general knowledge* of standards/laws is shown in a separate, clearly labelled, unverified tier.

**Report Score** (0–100, `src/lib/reportScore.ts`) rates the *report* (coverage 25 · verification integrity 25 · library grounding 20 · human review 20 · completeness 10); **Tender Health** rates the *bid's readiness* and now includes report-derived factors (pages actually read, library conformance). Exports: PDF (print) with full requirements/compliance/standards registers, and Excel (`/api/report/xlsx`, 11 sheets).

Groq free tier: limits are per model per minute **and per day** (≈200k tokens/day on `gpt-oss-120b`). The client fails over across keys and models (`GROQ_FALLBACK_MODELS`, default `openai/gpt-oss-20b`); the models actually used are stamped on the report. Tests: `npm run test:verified`.

## Agent chat (Claude API)
Chat mode talks to specialist agents grounded in the active tender's data. `POST /api/chat` (`src/app/api/chat/route.ts`) streams a reply from `claude-opus-5` via the official `@anthropic-ai/sdk`, with the workspace snapshot as cached system context and persona rules (cite sources, never fabricate, drafts need human acceptance). Providers (first configured wins): `ANTHROPIC_API_KEY` → Claude via the official SDK; else Groq (`GROQ_API_KEYS=key1,key2,…` pool or single `GROQ_API_KEY`; optional `GROQ_MODEL`, default `openai/gpt-oss-120b`). The Groq pool fails over automatically: a key that returns 429 (rate limit/quota) is skipped for 60 s (or `Retry-After`), a rejected key (401/403) for 1 h. `GET /api/ai-status` shows the active provider and key-pool health. Put keys in `.env.local` (gitignored; see `.env.example`). With neither, the UI shows a clearly labelled offline summary. Every reply is logged in AI Governance.

## Build alongside a dev server
`BUILD_DIR=.next-build npm run build` — avoids clashing with `npm run dev`'s `.next`.

## Verification
`npm run test:all` runs the 24-check lifecycle test and the 17-check API smoke test. Spec-to-implementation map and known limits: [docs/COVERAGE.md](docs/COVERAGE.md).

## Not yet built (next steps)
1. Backend (spec: Laravel API + Postgres) replacing the zustand store; n8n intake for WhatsApp/email/website.
2. Real auth / SSO and per-organisation tenancy enforcement server-side.
3. Native XLSX/DOCX/PPTX/ZIP exports; original file storage; n8n/WhatsApp/email webhook for inquiries; chunking for very large tender volumes.
4. True DOCX/XLSX/PPTX/ZIP package export (currently CSV / HTML-doc / JSON manifest).
5. Approval-workflow builder and configurable Go/No-Go weights in the template builder.
6. Invoices & payments (deferred by product owner).

# WinningBid-Update-Version
