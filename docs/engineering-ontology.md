# Engineering Ontology (Phase 2)

`business-ontology.md` named what the product means to a user (Request, Action Packet, Deadline). This doc names the code that implements it, so the codebase stays consistent.

Trace the lease-renewal request through the system and you hit every term below: it arrives at a **route handler** (`/api/generate`), which hands it to the **orchestrator** (`workflowService`). The orchestrator calls **services** in order — extract the PDFs, then the one **skill** (the Claude call) that returns a packet, which must pass the **validation gate** (Zod) before anything trusts it. The orchestrator then renders the PDF, calls the Drive and Sheets **adapters** (each wrapped so a failure **degrades** to `skipped`/`failed` instead of crashing), and writes a **record** to the **store** (SQLite). All the while it emits **step events** to the browser. That whole runtime — route handlers + orchestrator + env access + degradation — is the **harness**.

Governance terms (policy rule, approval step, audit event, execution guard-as-policy) are intentionally absent — this product has no such layer.

## 1. Glossary
| Term | Meaning in this codebase | Lives in |
|---|---|---|
| **Primitive** | Smallest load-bearing value with no internal parts. | — |
| **Abstraction** | A composed concept (Service, Orchestrator, Packet, Run record). | — |
| **Service** | Single-responsibility domain module, no HTTP knowledge. `xxxService.ts`. | `src/services/` |
| **Adapter** | Wrapper around an external system (Anthropic, Drive, Sheets, Puppeteer); exposes `isConfigured()`. | `src/services/*` |
| **Orchestrator** | The one module sequencing Services: `workflowService.generateActionPacket`. | `src/services/workflowService.ts` |
| **Harness** | Runtime that hosts execution: Next.js server + Orchestrator + env access + degradation. | `src/app/api/*`, runtime |
| **Skill** | The reusable analysis contract (input → system prompt → validated `ActionPacket`). Exactly one. Not an agent. | `src/services/claudeAnalysisService.ts` |
| **Schema** | A Zod schema (validation + types). `XxxSchema` + `z.infer`. | `src/lib/schema.ts` |
| **Validation gate** | Where AI output must pass `ActionPacketSchema.parse` before any consumer runs. | analysis service |
| **Record** | A durable persisted row (`WorkflowRun`, table `workflow_runs`). | `src/lib/db.ts` |
| **Store / Persistence** | SQLite wrapper exposing `saveRun/getRun/listRuns`. | `src/lib/db.ts` |
| **State** | Durable truth in SQLite. | `dev.db` |
| **Memory** | None in V1. Reserved; do not use SQLite-as-"memory." | — |
| **Stage** | Internal pipeline phase (intake, extract, analyze, assemble, file, track). | orchestrator |
| **Step event** | Streamed JSON signal of a Stage (`{step,status}`). | `/api/generate` |
| **Route handler** | HTTP boundary (`route.ts`); no domain logic. | `src/app/api/**/route.ts` |
| **Server component** | RSC reading the Store directly. | `src/app/**/page.tsx` |
| **Client component** | Browser-interactive UI (`"use client"`). | `src/components/*` |
| **SDK client** | Instantiated external SDK object. Internal-only "client"; never the business Requester. | adapters |
| **Guard** | `isConfigured()` boolean on an adapter. | adapters |
| **Degradation** | Per-integration try/catch → `ok\|skipped\|failed` without aborting the Run. | orchestrator |
| **Transient storage** | Temp buffers + local Artifact fallback under `storage/`. | `storage/` |
| **Secret / Env** | `SCREAMING_SNAKE` env var, server-only. | `src/lib/env.ts` |
| **Execution** | Narrow: an external write (Drive/Sheets). No simulate/stage layer. | drive/sheets services |
| **Artifact** | Generated output file (pdf/md/json). | `storage/` + Drive |

## 2. Relationships
```
Route handler ──parses, calls──▶ Orchestrator
Orchestrator ──sequences──▶ Service[] (intake, fileExtraction, analysis[=Skill],
                                        packetGeneration, pdf, drive, sheets)
Service(adapter) ──wraps──▶ SDK client ; exposes Guard(isConfigured)
Skill ──uses──▶ Schema ──at──▶ Validation gate ──produces──▶ Action Packet
Orchestrator ──emits──▶ Step event[] ; ──writes──▶ Record (Store/State)
Orchestrator ──wraps external Execution in──▶ Degradation (ok|skipped|failed)
Server component ──reads──▶ Store ; Client component ──consumes──▶ Step event stream
Harness = Next runtime + Route handlers + Orchestrator + Env + Degradation
```

## 3. Naming conventions
| Kind | Convention | Example |
|---|---|---|
| Service/adapter file | `camelCaseService.ts`, verb exports | `claudeAnalysisService.ts` → `analyzeRequest()` |
| Zod schema / type | `PascalCaseSchema` + inferred type | `ActionPacketSchema` → `type ActionPacket` |
| DB table / column | `snake_case` | `workflow_runs`, `needs_attention` |
| DB row vs domain | `WorkflowRunRow` (snake) ↔ `WorkflowRun` (camel), mapped in `db.ts` | — |
| React component | `PascalCase.tsx` | `WorkflowProgress.tsx` |
| lib module | `camelCase.ts` | `pdfTemplate.ts` |
| Env var | `SCREAMING_SNAKE` | `ANTHROPIC_MODEL` |
| Step-event token | lowercase noun | `analyzing`, `pdf`, `drive` |
| Doc file | `kebab-case.md` under `docs/` | `engineering-ontology.md` |

## 4. Correct vs incorrect
| ✅ | ❌ |
|---|---|
| "the analysis Service validates via the Schema at the validation gate" | "the agent checks the output" |
| "Orchestrator emits a step event when the stage changes" | "the workflow task updates" |
| "Drive adapter `isConfigured()` is false → Execution skipped" | "Drive auth failed so the run failed" |
| "Result page is a server component reading the Store" | "the page calls the API to get state from memory" |
| "secret in `src/lib/env.ts`, server-only" | "expose key via `NEXT_PUBLIC_ANTHROPIC_API_KEY`" |

## 5. Confused-but-separate
| A | B | Distinction |
|---|---|---|
| business Request | route-handler request | input vs transport |
| business Generation/Run | DB WorkflowRun record | the act vs its stored row |
| SDK client | Requester / Operator | code object vs people |
| Service | Route handler | domain logic vs HTTP boundary |
| Adapter | Service | external wrapper vs internal logic (subset) |
| Schema (Zod) | DB DDL | runtime validation vs SQL structure |
| State (SQLite) | Memory (none) | durable truth vs reserved/empty |
| Stage | Step event | the phase vs the streamed signal |
| Harness / Orchestrator | Service | runtime + sequencer vs single unit |
| Attachment | Artifact | input file vs generated file |
