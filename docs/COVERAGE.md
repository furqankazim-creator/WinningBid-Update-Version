# BidWinning — Spec coverage & verification (2026-09-22)

Each row maps a section of `PRODUCT_SPEC.md` to where it lives and how it is verified. Status: ✅ implemented & tested · 🟡 implemented, partial · ⏳ deferred by owner.

## How the whole system is verified
| Check | Command | Result |
|---|---|---|
| Type safety (frontend + API) | `npx tsc --noEmit` · `cd server && npx tsc --noEmit` | clean |
| Production build | `BUILD_DIR=.next-build npm run build` | clean, 129 routes |
| Every route returns 200 (or the intended 307) and renders with no client-side error in headless Chrome | route sweep | 128 × 200, 1 × 307, 0 errors |
| **Lifecycle test** — one tender walked through every tab, asserting each link (CRM→tender, docs, requirements→health, compliance, Go/No-Go→approval, registers, costing→pricing→approval→lock→new version, proposals→reviews, submission, result→CRM, contract, project, lessons, audit) | `npm run test:lifecycle` | 24/24 |
| **API smoke test** — signup/org/invite/roles/tenant isolation/sync/REST/settings/audit | `npm run api:test` | 17/17 |
| **Sync end-to-end** — signup → hydrate seeds org → edits sync → second session loads | harness | pass |
| **Live AI** — tender review JSON, document info, proposal/engineering drafts, chat | `/api/analyze`, `/api/chat` (Groq / Anthropic) | pass (13 s review on the Aramco SOW) |

## Spec sections → implementation
| Spec | Where | Status |
|---|---|---|
| §2 Industry-agnostic architecture, §53 template builder | `src/lib/industries.ts` (25 templates); Admin → Industry Templates (services, compliance, docs, risk/cost categories, engineering & proposal sections, custom fields, question templates) | ✅ |
| §3 Tender types (14) | `tenderTypes`, tender create/overview | ✅ |
| §4 Modules / navigation | `src/components/app/nav.ts` | ✅ |
| §5–6 Executive dashboard + global industry filter | `/app`, top bar | ✅ |
| §7–8 CRM: companies, contacts, opportunities, activities | `/app/companies`, `/contacts`, `/opportunities` (board + list, convert to tender) | ✅ |
| §9/§51 Tender workspace header, 20 tabs, right sidebar | `/app/tenders/[id]/layout.tsx` | ✅ |
| §10 Documents: version, type, language, confidentiality, permissions, history | `/app/documents`; `/api/analyze mode=extract` (PDF/DOCX text) | ✅ |
| §11–14 AI document intelligence, cited requirement extraction, summary & reasoned recommendation | `/api/analyze mode=tender/document`; AI Analysis & Requirements tabs | ✅ live |
| §15 Contract/terms analysis (21 standard terms) | AI Analysis terms table; Contract Register | ✅ |
| §16 Compliance engine (7 statuses, templates) | Compliance tab | ✅ |
| §17 Vendor/partner profiles (types, certs with expiry, licences, equipment, ratings) | `/app/vendors` | ✅ |
| §18 Capability matching | Compliance tab vs Our Capabilities | ✅ |
| §19 Go/No-Go (15 criteria, verdict, override with reason) | Go/No-Go tab → approval | ✅ |
| §20 Clarifications (AI gaps, human approval before send) | overview / register / latest; Generate = live review | ✅ |
| §21 Qualifications & deviations (impacts, risk, approval) | Contract → Qualifications | ✅ |
| §22–23 Risks & opportunities (5×5, mitigation, residual, contingency) | Risks tabs | ✅ |
| §24 Engineering (template workspaces, AI draft) | Engineering tab | ✅ |
| §25–26 Procurement workflow & supplier comparison (AI recommends, human awards) | Procurement tabs → approval | ✅ |
| §27–28 Costing & pricing (configurable categories, versions, lock) | Costing / Pricing tabs | ✅ |
| §29 Competitor intelligence (sources, confidence, never fabricated) | `/app/competitors`, Competition tabs | ✅ |
| §30–31 Technical & commercial proposals (AI draft → human → review → approval) | Proposal editor | ✅ |
| §32 Submission checklist & readiness % | Deliverables + Submission | ✅ |
| §33 Review workflow (7 stages, audited) | Reviews, Approvals | ✅ |
| §34 Submission package (version, timestamp, by, method, confirmation; export) | Submission tab — JSON manifest + CSV; native ZIP/DOCX/XLSX pending | 🟡 |
| §35–37 Bid result, win/loss analytics, lessons learned | Result, Reports, Knowledge Base | ✅ |
| §38 CRM → Tender → Contract → Project chain | lifecycle test steps 1, 21, 22 | ✅ (invoice/payment ⏳) |
| §39–40 WhatsApp/email intake (mark as inquiry, attach, create) | `/app/inquiries` (mock inbox; n8n webhook not connected) | 🟡 |
| §41 Multi-tenant SaaS | Express API — org on every record; isolation tested | ✅ |
| §42 Roles & permissions (16 roles) | server enforces read-only & admin-only | ✅ |
| §43 AI governance log | Admin → AI Governance | ✅ |
| §44 Global search | Ctrl K palette | ✅ |
| §45 Notifications | bell menu, fed by AI runs, approvals, reviews, submission | ✅ |
| §46 Immutable audit trail | server append-only `Audit`; Admin → Audit Trail | ✅ |
| §47–50 Landing (industry-neutral, industries, how-it-works, enterprise design, light/dark) | `(marketing)` pages | ✅ |
| §52 Tender health computed from real data | `tenderHealth()` — asserted in lifecycle test | ✅ |
| §54 Reporting (13 reports) | `/app/reports` | ✅ |
| Invoices & payments | — | ⏳ deferred by owner |

## Known limits
1. Sync is last-write-wins per collection (debounced 800 ms); no field-level merge.
2. Uploaded files: extracted text is stored, the original binary is not (no object storage yet).
3. Exports are CSV / HTML-doc / JSON manifest, not native XLSX/DOCX/PPTX/ZIP.
4. Inquiry intake uses a mock inbox; the n8n/WhatsApp/email webhook is not wired.
5. Tender text over ~180k characters is truncated for analysis; chunking is the next step.
