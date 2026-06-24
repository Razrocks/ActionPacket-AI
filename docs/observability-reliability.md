# Observability & Reliability (Phase 12)

When a lease-renewal request runs, you should be able to see what happened and trust the result. This doc covers what gets logged, how failures are sorted (a transient Claude error retries; a Drive outage just degrades to `skipped`/`failed` and the packet still ships), and the per-run record + `metadata.json` that let you reconstruct any past generation after the fact.

Debuggability-focused; governance-audit dropped.

## 1. Observability (logging)
- Structured server logs per stage: `{ runId, stage, status, durationMs }` at info; `warn` on degraded integration; `error` on abort (type + message + stack, server-side only).
- Never logged: secrets, full file contents, full message text (log lengths/counts).
- Claude usage logged per run (`input_tokens`/`output_tokens`) → cost visibility.
- Step events streamed to the Operator = live observability.
- Sink: console in V1. Future: structured logger (pino) + sink.

## 2. Inspectable trace (right-sized "audit")
| Source | Answers |
|---|---|
| WorkflowRun row | what happened: statuses, links, confidence, needsAttention, createdAt |
| metadata.json | portable per-run snapshot: request + packet + attention reasons + integration outcomes |
| step-event stream | what the Operator saw live |

## 3. Metrics inventory (log-derived, no dashboard in V1)
Generation success rate · per-stage duration (esp. Claude latency, Puppeteer launch) · Claude tokens / est. cost per run · integration outcome counts · extraction outcomes (text vs no-text) · Zod-retry rate · refusal rate.

## 4. Failure classification
| Failure | Class | Action |
|---|---|---|
| Invalid input | terminal (user) | 400, fix input |
| Missing `ANTHROPIC_API_KEY` | terminal (config) | clear error |
| Anthropic 429/5xx/network | retryable | SDK auto-retry (2); exhausted → terminal-for-run → error |
| Anthropic refusal | terminal (non-retryable) | surface message; no Run |
| Zod validation fail | semi-retryable | 1 corrective retry → else terminal |
| PDF render crash | degradable | keep markdown, `pdf_status=failed` |
| Drive/Sheets auth/config (4xx) | non-retryable → degrade | `skipped`/`failed` |
| Drive/Sheets 5xx/network | retryable-ish | single attempt → degrade `failed` |
| SQLite write fail | terminal (rare) | error |

## 5. Retry strategy
Anthropic: SDK 2 auto-retries + 1 corrective Zod retry; refusal none. Drive/Sheets: single attempt, OAuth auto-refresh, then degrade. PDF: single attempt, degrade. No global retry framework.

## 6. Explainability / traceability
`confidence` surfaced · `needsAttention` + `reasons[]` (which rule fired) stored + shown · `deadline.evidence` (source quote) · `fileNotes` (what AI saw) · `metadata.json` (full snapshot) · History page. Not in V1: prompt/raw-response capture.

## 7. Reliability risks
| Risk | Mitigation |
|---|---|
| Puppeteer/Chromium flakiness | single reused browser, proper close, degrade on fail |
| Long generate request held open | streaming keeps connection alive; cap stage time; future job model |
| Claude latency/variability | adaptive thinking, `max_tokens` 4096, Sonnet option |
| SQLite locking on concurrent writes | WAL + single process |
| `storage/` disk growth | retention/cleanup = future |
| OAuth token expiry/revocation | auto-refresh; on fail → degrade + log; Operator re-auths |
| Partial run (PDF ok, Drive fail) | Run still `completed`, statuses recorded, Result usable |
| No idempotency (dup folders/rows) | accepted V1 |
