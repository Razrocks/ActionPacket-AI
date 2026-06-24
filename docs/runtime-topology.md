# Runtime & Infrastructure Topology (Phase 10)

## 1. Components
| # | Component | Kind |
|---|---|---|
| C1 | Next.js server (Node runtime) | process |
| C2 | Browser client (React) | client |
| C3 | Orchestrator (in-process module) | code (runs inside C1 request) |
| C4 | Services/adapters (in-process) | code |
| C5 | SQLite (embedded, better-sqlite3) | in-process store |
| C6 | Local FS `storage/` | disk |
| C7 | Chromium (Puppeteer child process) | spawned by C4 |
| C8 | External APIs — Anthropic, Google | network |

## 2. Responsibilities
C1 host routes + RSC; runtime `nodejs` for generate/download · C2 IntakeForm/DemoScenarios (client), WorkflowProgress (stream reader), copy/download; Result/History RSC-rendered · C3 sequence stages, emit events, degrade, persist · C4 domain logic + external isolation · C5 durable state, sync I/O · C6 transient uploads + persisted artifacts · C7 render HTML→PDF, one reused browser · C8 inference + external writes.

## 3. Request/response paths
| Path | Flow |
|---|---|
| Home | `GET /` → RSC page + client form |
| Generate | `POST /api/generate` (multipart) → handler → Orchestrator streams NDJSON step events over the open response → WorkflowProgress updates → on `done{runId}` navigate to `/result/[id]` |
| Result | `GET /result/[id]` → RSC → `db.getRun` → render |
| History | `GET /history` → RSC → `db.listRuns` → render |
| Download | `GET /api/download/[id]` → handler → read `pdf_path` → stream bytes |

## 4. Background-job paths
**None in V1.** Generate is a single long-lived streaming request (sequential pipeline, ~5–30s), executed in-process. No queue/worker/cron. Acceptable: single-user, on-demand.

## 5. Async vs sync
| Boundary | Mode |
|---|---|
| HTTP handling | async |
| Generate pipeline | sequential `await`, streamed as stages complete |
| SQLite | synchronous |
| Claude / Google / Puppeteer | async I/O within the request |
| Client stream read | async (ReadableStream reader) |

Only long async boundary = the generate request itself.

## 6. Recommended V1 topology
Single modular-monolith Next.js app, one process, embedded SQLite, Chromium child process, zero external infra.
```
Browser ─HTTP─▶ Next.js (C1)
                 ├─ RSC pages ──▶ SQLite (C5)
                 └─ /api/generate ─▶ Orchestrator (C3)
                        ├─▶ Services/adapters (C4) ─▶ Anthropic / Drive / Sheets (C8)
                        ├─▶ Chromium (C7) ─▶ storage/ (C6)
                        └─▶ SQLite (C5)   ◀── stream step events back to Browser
```

## 7. What NOT to split yet
❌ Analysis microservice · ❌ job queue/worker · ❌ separate PDF/render service · ❌ networked DB · ❌ separate frontend/backend deploys.

## 8. Future split triggers
Concurrent users → background job + queue · serverless/Vercel → externalize Chromium + object storage + `/tmp` · multi-user → auth + Postgres · long generations → job model · multiple instances → SQLite → Postgres.
