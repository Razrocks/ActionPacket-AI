# Data Architecture (Phase 9)

## 1. Data domains
| Domain | Contents | Lifetime |
|---|---|---|
| Intake | Request fields, Attachment buffers | Transient |
| Generation | WorkflowRun metadata + statuses | Durable (SQLite) |
| Packet content | ActionPacket + children | Durable (JSON in WorkflowRun) |
| Artifact | `action-packet.md/.pdf`, `metadata.json`, `original-request.txt` | Local `storage/` (+ Drive mirror) |
| External tracking | Drive folder/files, Sheets row | Google-owned (mirror) |
| Config/secrets | env vars | Process env |

## 2. Source-of-truth map
| Object | Source of truth | Mirrors |
|---|---|---|
| Run metadata | WorkflowRun (SQLite) | metadata.json |
| ActionPacket content | `packet_json` in WorkflowRun | Drive `.md`/`.pdf` |
| Markdown | `markdown` in WorkflowRun | Drive `.md` |
| PDF (download) | local `pdf_path` | Drive `.pdf` |
| Drive folder/files | Google Drive | links in WorkflowRun |
| Tracker row | Google Sheets | `sheet_status` |
| Request input | transient → WorkflowRun + original-request.txt | — |
| Operator identity | none (single user) | — |

## 3. Core record model
```sql
CREATE TABLE IF NOT EXISTS workflow_runs (
  id              TEXT PRIMARY KEY,        -- nanoid
  schema_version  INTEGER NOT NULL,        -- packet schema version
  created_at      TEXT NOT NULL,           -- ISO 8601
  title           TEXT NOT NULL,
  requester       TEXT,
  project_name    TEXT,
  packet_type     TEXT NOT NULL,
  priority        TEXT NOT NULL,
  main_deadline   TEXT,
  needs_attention INTEGER NOT NULL,        -- 0/1
  confidence      REAL NOT NULL,
  run_status      TEXT NOT NULL,           -- 'completed'
  drive_status    TEXT NOT NULL,           -- 'ok'|'skipped'|'failed'
  sheet_status    TEXT NOT NULL,
  pdf_status      TEXT NOT NULL,           -- 'ok'|'failed'
  drive_folder_url TEXT,
  pdf_path        TEXT,
  packet_json     TEXT NOT NULL,           -- full ActionPacket
  markdown        TEXT NOT NULL
);
-- PRAGMA journal_mode = WAL;
```
`metadata.json` (artifact snapshot + portable trace):
```json
{ "schemaVersion": 1, "runId": "...", "createdAt": "...",
  "request": { "title","requester","projectName","priority","deadline" },
  "packet": { "...ActionPacket" },
  "attention": { "needsAttention": true, "reasons": ["confidence<0.7","risk:high"] },
  "integrations": { "drive":"ok","sheets":"ok","pdf":"ok" },
  "files": ["lease-renewal.pdf","invoice.pdf"] }
```

## 4. Durable vs memory vs external-source
| Data | Class | Store |
|---|---|---|
| WorkflowRun, packet_json, markdown | Durable state | SQLite (truth) |
| PDF/MD/JSON artifacts | Durable artifact | `storage/` |
| Uploaded buffers, extracted text, pdf bytes in-flight | Transient | memory/temp |
| Drive files/folder, Sheets row | External-source (mirror) | Google |
| Model memory | None | — |

## 5. Traceable objects (governance-audit dropped)
WorkflowRun (inspectable record) · metadata.json (portable per-run snapshot) · step events (console-logged, not persisted V1). Not persisted: raw prompt/response (optional future debug aid).

## 6. Versioning / concurrency
- **Append-only:** WorkflowRun rows immutable; re-generate = new row.
- **IDs:** nanoid.
- **schema_version** stamped per row + metadata.json → schema can evolve.
- **Concurrency:** single process, synchronous better-sqlite3; enable **WAL** for safe read-during-write.
- **Migrations:** `CREATE TABLE IF NOT EXISTS` on boot; future column adds via idempotent `ALTER TABLE`.
- **External idempotency:** none — re-run creates new folder + row (accepted).

## 7. Anti-patterns
❌ ActionPacket only in Drive/Sheets · ❌ Sheets as the database · ❌ mutating WorkflowRun rows · ❌ raw file buffers in DB · ❌ secrets in DB · ❌ cross-request in-memory state as truth · ❌ any field without a single source of truth.
