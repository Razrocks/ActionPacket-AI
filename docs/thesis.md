# Thesis & Boundary (Phase 0)

## 1. Project thesis
ActionPacket AI converts unstructured inbound work requests — a messy human message plus optional attachments — into a structured, validated, filed, and tracked artifact bundle ("action packet"). The AI does the messy comprehension (extract, classify, synthesize, draft). The deterministic core does everything consequential: assemble artifacts, score attention, write to external storage, log, persist. The value is collapsing "I got a vague request with attachments" into "here's exactly what's being asked, what to do, what's missing, a reply draft, and it's all filed and tracked" in under 60 seconds.

## 2. One-sentence product definition
ActionPacket AI turns a messy client request and its files into a structured, filed, and tracked action packet (summary, tasks, deadlines, risks, missing info, follow-up draft) with a Drive folder and a Sheets tracker row.

## 3. System boundary
| Zone | Contents |
|---|---|
| **Inside (we build/own)** | Intake normalization, file text extraction, AI analysis call, Zod validation, deterministic attention scoring, Markdown assembly, PDF rendering, run persistence (SQLite), result + history surfaces, orchestration, graceful degradation. |
| **Edge (external systems we write to)** | Anthropic API (inference), Google Drive (create folder + upload), Google Sheets (append row). |
| **Outside (not crossed in V1)** | Sending email/messages, executing the requested work, calendar/task-manager sync, identity/auth, multi-tenant isolation, acting on the client's behalf beyond filing artifacts. |

## 4. In-scope capabilities
1. Multi-field intake form + multi-file upload.
2. Text extraction: PDF (digital), TXT, MD; DOCX optional. No-text PDF → graceful "OCR not supported V1" note.
3. Single AI analysis call → validated `ActionPacket` structured output.
4. Deterministic attention scoring (overrides/supplements AI's `needsAttention`).
5. Markdown packet + professional PDF.
6. Drive folder creation + artifact upload.
7. Sheets tracker append.
8. Live streamed workflow-step progress.
9. Result surface (preview, metadata, copy follow-up, download PDF, integration status).
10. History surface (SQLite-backed).
11. Three one-click demo scenarios.
12. Graceful degradation: packet + PDF always produced even if Drive/Sheets/creds fail.

## 5. Non-goals (V1)
Auth/multi-user · payments · team permissions/roles · approval chains · chat interface · vector search/RAG · OCR · multi-agent orchestration · autonomous task execution · email/calendar/Jira/Linear/Gmail integration · editing a packet after generation.

## 6. Primary user roles
One role: **Operator** (freelancer / consultant / small-biz operator / project coordinator). Sees everything, does everything, no gating. (Role/permission/authority and approval models collapse to a single local actor — see `role-model.md`.)

## 7. Highest-stakes actions
| # | Action | Why high-stakes | V1 control |
|---|---|---|---|
| S1 | Write folder + files to the Operator's real Google Drive | External mutation of user's account | Least-privilege `drive.file` (app only touches files it creates); never deletes |
| S2 | Append a row to the Operator's Sheets tracker | External mutation | Append-only; never edits/deletes existing rows |
| S3 | Generate a client-facing follow-up draft | Reputational risk if tone/facts wrong | Draft only — never auto-sent; human copies + sends; prompt forbids inventing facts |
| S4 | Assert extracted deadlines / dollar amounts | Operator may act on a wrong fact | Prompt: preserve-vague, no hallucination, unknowns → missing-info; `evidence` field; confidence surfaced |

## 8. Why this system needs AI
The load-bearing tasks are irreducibly fuzzy: comprehending free-text intent, classifying request type, decomposing into tasks, inferring (not inventing) deadlines, spotting risks/ambiguities, identifying what's missing, drafting a professional reply. No deterministic ruleset handles arbitrary client prose. Everything around that comprehension is deterministic.

## 9. What must remain deterministic
File handling (limits, sanitization, type detection, temp storage) · validation gate (Zod before any consumer) · attention scoring · artifact assembly (Markdown + PDF templates) · external writes (Drive/Sheets + auth) · persistence (run records, status, links) · orchestration + degradation.

## 10. First-pass workflow inventory
| ID | Workflow | Trigger | Risk |
|---|---|---|---|
| W1 | Generate Action Packet (core pipeline) | Operator submits form | High (S1–S4) |
| W2 | View Result | Open `/result/{id}` | Low |
| W3 | Browse History | Open `/history` | Low |
| W4 | Load Demo Scenario | Click demo button | None |
| W5 | Download PDF | Click download | Low |
