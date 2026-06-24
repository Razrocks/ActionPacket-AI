# Memory Model (Phase 7)

## Buckets
| Bucket | Contents | Notes |
|---|---|---|
| **Durable state** | `WorkflowRun` records (SQLite) | Source of truth; powers Result + History |
| **External-source data** | Drive files, Sheets rows | Owned by Google; mirror of artifacts |
| **Retrieved memory** | **NONE in V1** | No cross-run context, no RAG, no agent memory |
| **Transient** | uploaded buffers, extracted text, pdf bytes (`storage/`) | Discarded after run |

## Rules
- Each generate is independent — the Skill gets no prior-run context.
- **Anti-pattern:** treating History (SQLite state) as "memory" the model reads. It is queryable **state**, not model context.

## Future (not V1)
An Operator "tone/style profile" to personalize follow-up drafts would be genuine *memory* — explicitly deferred.
