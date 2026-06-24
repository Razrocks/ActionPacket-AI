# Skills (Phase 7)

The product has exactly one AI capability: read a messy request like the lease-renewal email and return a structured packet (summary, tasks, the Friday deadline, the unconfirmed $450 fee, the missing signing authority, a drafted reply). That single capability is the one "skill." This doc explains why it's **one** call that extracts everything at once, not a pipeline of separate agents for summarizing, drafting, and classifying.

Right-sized: this system has exactly **one** skill. A skill is a workflow contract narrow enough to evaluate — not a vague capability. The full spec lives in [`skills/analyze-request/skill.md`](../skills/analyze-request/skill.md).

## Conventions
Section order for any skill file: `name · purpose · when to use · when NOT to use · required inputs · optional inputs · output contract · allowed tools · forbidden tools · deterministic dependencies · memory usage · failure behavior · refusal behavior · evaluation criteria · full draft (system prompt + call config)`. Folder `skills/<name>/`; runtime impl in `claudeAnalysisService.ts`.

## Inventory
| Skill | Purpose | V1? |
|---|---|---|
| **analyze-request** | One structured-output call: Request + extracted text → validated `ActionPacket` | ✅ the only skill |

## Skills that should NOT exist (V1)
- ❌ `summarize-files` — folded into analyze-request (one call).
- ❌ `draft-follow-up` — a field of the packet, same call.
- ❌ `classify-packet-type` — a field, same call.
- ❌ `extract-deadlines` — a field, same call.

Splitting these = the multi-agent anti-pattern. One call returns all fields.

See also `memory-model.md` (memory = none in V1).
