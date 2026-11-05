# BidWinning API (Express + MongoDB)

Multi-tenant REST API for the BidWinning frontend. Every business record is scoped to an organisation; JWT auth with email + password and invite links.

## Run locally
```bash
cd server && npm install
npm run dev               # no MONGODB_URI? → starts an in-memory MongoDB automatically (data resets on restart)
# for persistence, put your Atlas URI in server/.env:
#   MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/vendoriq
npm run dev
npm test                  # end-to-end smoke test (17 checks) on in-memory MongoDB
```
Then run the frontend with `NEXT_PUBLIC_API_URL=http://localhost:4000 npm run dev` in the repo root.

## Endpoints
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Create organisation (becomes Organization Admin) or join via `invite` token |
| POST | `/api/auth/login` | — | Email + password → JWT (30 days) |
| GET | `/api/auth/me` | user | Current user + org |
| POST | `/api/auth/change-password` | user | |
| GET | `/api/auth/invite/:token` | — | Invite details for the sign-up page |
| GET | `/api/org` | user | Org, members, pending invites |
| PATCH | `/api/org` | admin | Name, industries, currency, plan, seeded |
| POST/DELETE | `/api/org/invites[/:id]` | admin | Create (7-day link) / revoke invite |
| PATCH | `/api/org/users/:id` | admin | Role, active, name |
| GET/POST | `/api/org/audit` | user | Immutable audit trail (append-only) |
| GET | `/api/data/state` | user | Snapshot of all collections + settings |
| GET/PUT | `/api/data/settings` | user / writer | Org settings (margin, profile defaults…) |
| PUT | `/api/data/:collection/sync` | writer | Bulk upsert; `full:true` deletes records not in the payload |
| GET | `/api/data/:collection[?tenderId=]` | user | List |
| GET/POST/PUT/DELETE | `/api/data/:collection[/:id]` | user / writer | Per-record CRUD |

Collections: tenders, actions, projects, vendors, docs, clarifications, clauses, qualifications, risks, deliverables, costLines, milestones, competitors, lessons, companies, contacts, opportunities, activities, requirements, complianceItems, capabilities, aiSummaries, reviews, approvals, priceVersions, proposalSections, bidResults, inquiries, contracts, aiLog, notifications, customIndustries, procPackages, quotations, submissions, chat.

Roles `Viewer` and `Contractor/Vendor` are read-only (403 on writes); only `Super Admin` / `Organization Admin` may manage users and invites.

## Storage model
`Record {orgId, collection, id, data}` with a unique index on (orgId, collection, id) — one generic, indexed document per business record. `User`, `Org`, `Invite`, `Settings`, `Audit` are dedicated collections. Sync is last-write-wins per collection (debounced 800 ms on the client).

## Deploy
- **MongoDB Atlas** (free M0): create a cluster + database user → `MONGODB_URI`.
- **API host** — Render, Railway or Fly (Dockerfile included). Env: `MONGODB_URI`, `JWT_SECRET` (long random), `CORS_ORIGIN=https://<your-vercel-app>.vercel.app`, `PORT`.
- **Frontend (Vercel)** — add `NEXT_PUBLIC_API_URL=https://<your-api-host>`; without it the app runs in local demo mode.
