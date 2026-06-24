# Capacity, Scaling & Cost (Phase 14)

Honest numbers for a one-person tool. Handling a single lease-style request costs roughly a dime in Claude tokens (less on Sonnet) and takes a handful of seconds, dominated by the AI call. This doc says what actually drives cost and latency, what stays simple on purpose, and what *not* to optimize until real usage demands it.

Honest small-scale posture; no premature optimization.

## 1. V1 scale assumptions
Single Operator · a handful of generations/day · ≤5 files/request, ≤10MB each · input a few thousand → tens-of-thousands of tokens · no concurrency · SQLite holds thousands of rows comfortably.

## 2. Bottlenecks (first to matter)
| # | Bottleneck | Magnitude | Note |
|---|---|---|---|
| 1 | Claude call latency | seconds (dominant) | Opus + adaptive thinking |
| 2 | Puppeteer cold launch | ~1–3s first PDF | reuse one browser |
| 3 | Google round trips | seconds, sequential | network-bound |
| 4 | Large-PDF extraction | bounded by size cap | — |
| 5 | PDF render / Markdown / SQLite | negligible | — |

## 3. Cost-sensitive paths
Claude tokens are the only real cost. One call per generate.

| Model | Price (in/out per MTok) | Est. per run* |
|---|---|---|
| `claude-opus-4-8` (default) | $5 / $25 | ~$0.11 |
| `claude-sonnet-4-6` | $3 / $15 | ~$0.07 |

\*~8k input + ~3k thinking+output. Larger docs raise input cost ~linearly.

**Mitigations:** `max_tokens` capped (4096) · file size/count caps bound input · `ANTHROPIC_MODEL=claude-sonnet-4-6` to cut ~40% · no cross-run context · token-count preflight → warn (never silently truncate) on huge inputs. Google/Puppeteer/SQLite ≈ free. Prompt caching not worth it (system prompt <~1k tokens, below cacheable minimum).

## 4. Latency-sensitive paths
Whole generate ≈ Claude (dominant) + Puppeteer launch + sequential Google ≈ 5–30s. **Streaming step UI masks perceived latency.** Reuse Chromium; sequential fine at this scale (optional: parallelize Drive uploads — deferred).

## 5. What stays simple in V1
Single sync-stream request (no queue/worker) · embedded SQLite (no DB server) · one Claude call (no batching/caching) · no prompt caching · no rate limiting · artifacts kept on disk (no lifecycle job).

## 6. Future scale triggers → change
| Trigger | Change |
|---|---|
| Concurrent generations | job queue + workers; poll/SSE status |
| High volume / cost pressure | default Sonnet/Haiku; Batch API; prompt caching if prefix grows |
| Large/many docs | token-count preflight → chunk/summarize (also where OCR lands) |
| Many users | hosted DB + auth + object storage |
| `storage/` growth | retention/cleanup job |
| Latency SLA | async generate + notify-on-complete |

## 7. Don't pre-optimize
No queue, no caching, no batching, no chunking, no rate limiting until a §6 trigger actually fires. Build the simple sync-stream monolith.
