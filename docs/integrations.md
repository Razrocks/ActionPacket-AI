# Integration & Execution Architecture (Phase 8)

Processing the lease-renewal request touches three outside systems: Claude reads it, Google Drive stores the lease and invoice files, and Google Sheets logs a tracker row. This doc defines how each one is wrapped in an adapter so that, say, Drive not being connected simply marks that step `skipped` — the Operator still gets the packet and PDF, and the job never fails because of one integration.

No MCP, no policy-gating (out of scope). See also `tool-model.md`.

## 1. External systems
| System | Direction | Mutates user data? | Adapter | Guard |
|---|---|---|---|---|
| **Anthropic API** | outbound inference (read) | No | `claudeAnalysisService` | `ANTHROPIC_API_KEY` (required) |
| **Google Drive** | outbound write (create folder, upload) | Yes (S1) | `googleDriveService` (+`google/auth`) | `isConfigured()` = 3 OAuth vars |
| **Google Sheets** | outbound write (append row) | Yes (S2) | `googleSheetsService` (+`google/auth`) | `isConfigured()` |
| **Puppeteer/Chromium** | local execution (render PDF) | No | `pdfService` | binary present |
| Local FS `storage/` | local transient | No | services | — |
| SQLite `dev.db` | internal Store (not an integration) | — | `db.ts` | — |

## 2. Adapter model
- Every external system wrapped in one Service module; no raw SDK calls elsewhere.
- Write-adapters expose narrow verbs (`createPacketFolder`, `uploadArtifact`, `appendRow`) + `isConfigured()`.
- `google/auth.ts` = shared OAuth2 client factory (Drive + Sheets reuse it).
- Adapters are internal services, **not model-facing tools**.

## 3. Execution path model
Every external action has owner · path · guard · failure mode · trace (trace = step event + log + Run-record field).

| Action | Owner | Path | Guard | Failure | Trace |
|---|---|---|---|---|---|
| AI analyze | claudeAnalysisService | orchestrator→service→SDK→API | `ANTHROPIC_API_KEY` else hard error | refusal/parse/net → abort pre-packet | `analyzing` event + log |
| Drive file | googleDriveService | orchestrator→service→googleapis→Drive | `isConfigured` else `skipped` | error → degrade `failed` | `drive` event + `drive_status` + links |
| Sheets track | googleSheetsService | orchestrator→service→googleapis→Sheets | `isConfigured` | error → degrade `failed` | `sheets` event + `sheet_status` |
| PDF render | pdfService | orchestrator→service→Puppeteer | binary present | crash → degrade, keep `.md` | `pdf` event + `pdf_status` |

## 4. Simulation / staging / apply
**V1 = direct apply only.** No dry-run, no staging. Rationale: low-blast-radius (create-only/append-only, scoped `drive.file`, single Operator, reversible by hand). **Degradation is the safety mechanism.** Re-running creates a new folder + row (no dedupe). Future: a "preview before filing" dry-run.

## 5. Retry / failure strategy
| Surface | Retry | On final failure |
|---|---|---|
| Anthropic | SDK auto-retry 429/5xx (2) + 1 corrective Zod retry | refusal → no retry; abort pre-packet → error, no Run |
| Drive/Sheets | googleapis + OAuth auto-refresh; single attempt | degrade → `failed`, log, continue |
| PDF | single attempt | degrade → `pdf_status=failed`, keep markdown + `.md` |

## 6. Anti-patterns
❌ Drive/Sheets as model tools or MCP · ❌ raw SDK calls outside adapters · ❌ a Google failure aborting the Run · ❌ OAuth/secret logic in routes/client · ❌ generic retry/queue framework for 3 calls · ❌ hardcoded folder/sheet IDs · ❌ blocking the core deliverable on external writes.
