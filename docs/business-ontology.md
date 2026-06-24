# Business Ontology (Phase 1)

Canonical vocabulary that humans and the AI both rely on.

## 1. Principles
- One term, one meaning. Input, process, and output get distinct names.
- The AI produces *content*; the system produces *records and artifacts*. Vocabulary keeps those separate.
- Governance verbs (approve, escalate, remediate, resolve) are **not** in this product's ontology.

## 2. Canonical entities
Request · Attachment · Generation (Run) · Action Packet · Task · Deadline · Risk · Missing-Info Item · Follow-Up Draft · Recommended Next Step · File Note · Artifact · Drive Folder · Tracker Row · Operator · Demo Scenario.

## 3. Entity definitions
| Entity | Definition | Kind |
|---|---|---|
| **Operator** | The sole human user. Submits, reviews, copies, downloads. | Actor |
| **Request** | Raw inbound input: message text + intake metadata (title, requester, project, priority?, deadline?) + attachments. | Input |
| **Attachment** (Source File) | An Operator-uploaded file (PDF/TXT/MD/DOCX). Input; never confused with Artifact. | Input |
| **Generation** (Run) | One execution of the pipeline over one Request, and its durable record. Unit of history. *Internal name: Run.* | Process+Record |
| **Action Packet** | The structured, validated output content derived from a Request. 1:1 with a Generation. | Output content |
| **Task** | A discrete thing the Operator (or named owner) must do, extracted by AI. ≠ pipeline stage. | Packet element |
| **Deadline** | A time commitment detected in the source, optional `dueDate` + `evidence`. Vague stays vague. | Packet element |
| **Risk** | An ambiguity/hazard with `severity` + explanation. | Packet element |
| **Missing-Info Item** | A specific unknown to chase before acting. | Packet element |
| **Follow-Up Draft** | One professional reply draft the Operator may copy + send. Never auto-sent. | Packet element |
| **Recommended Next Step** | A suggested action ordering, advisory. | Packet element |
| **File Note** | AI's per-file observation (inferred type, relevant details, or "unreadable/OCR-not-supported"). | Packet element |
| **Artifact** | A generated file: `action-packet.pdf`, `action-packet.md`, `metadata.json`, copied originals, `original-request.txt`. Output. | Output file |
| **Drive Folder** | External container in the Operator's Drive holding Artifacts + Attachments for one Generation. | External record |
| **Tracker Row** | One append-only row in the Operator's Sheet summarizing one Generation. | External record |
| **Demo Scenario** | A canned Request preset (no real files) for instant demoing. | Fixture |

## 4. State models
| Entity | States | Notes |
|---|---|---|
| **Generation (Run)** | `created → extracting → analyzing → assembling → filing → tracking → completed` ; or `failed` | Streamed live. Persisted terminal status: `completed`/`failed`. |
| **Integration outcome** (Drive, Sheets each) | `ok` \| `skipped` (not configured) \| `failed` (errored) | Independent; never aborts the Run. |
| **Action Packet** | `generated` (immutable) | No edit/regenerate in V1. |
| **Request** | `drafting → submitted` | Not persisted independently; lives inside the Generation. |
| **Attention** | `needsAttention: true \| false` | Derived (AI value OR deterministic rules). |

## 5. Relationship map
```
Operator ──submits──▶ Request ──(1:n)──▶ Attachment
Request  ──produces─▶ Generation (1:1) ──yields──▶ Action Packet (1:1)
Action Packet ──contains──▶ Task[] · Deadline[] · Risk[] · MissingInfoItem[]
                          · RecommendedNextStep[] · FileNote[] · FollowUpDraft(1)
                          + scalars: packetType, priority, confidence,
                            needsAttention, summary, requester?, projectName?, mainDeadline?
Generation ──creates──▶ Artifact[]  (pdf, md, metadata.json, original-request.txt)
Generation ──creates(0..1)──▶ Drive Folder ──holds──▶ Artifact[] + Attachment[] copies
Generation ──appends(0..1)──▶ Tracker Row
Generation ──persisted as──▶ WorkflowRun record (SQLite)
Demo Scenario ──prefills──▶ Request
```

## 6. Ambiguous terms → chosen meanings
| Term | Chosen meaning | Don't |
|---|---|---|
| Request / Generation / Packet | input / execution+record / output content | use interchangeably |
| Task | Operator to-do inside a Packet | call pipeline stages "tasks" |
| Stage / Step | internal pipeline phase | call these "tasks" |
| Deadline vs Main Deadline | all detected vs the single headline one (earliest/most-salient) | — |
| Attachment vs Artifact | uploaded input vs generated output | conflate |
| Requester vs Operator | message sender vs app user | say "client" loosely |
| Confidence | AI self-rating 0–1 of extraction quality | treat as correctness guarantee |
| Status | always namespaced: Run / Drive / Sheet | use bare "status" |

## 7. Storage
This file (`docs/business-ontology.md`).

## 8. Banned / must-clarify
- **"agent"** — banned; this is one validated AI call.
- **"approval", "escalation", "remediation", "resolution", "policy"** — banned (not in product).
- **"report"** — use "Action Packet" / "packet."
- **"user"** — prefer "Operator."
- **"client"** — ambiguous; use **Requester** (sender) vs **Operator** (app user).
- **"OCR"** — only in the "not supported V1" message.
- **"workflow"** — only the pipeline (W1), not governance flows.
