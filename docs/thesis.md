# Thesis & Boundary (Phase 0)

## What this product is, in one breath
A freelancer or small-business operator gets a vague request with attachments — "review the lease, confirm the $450 fee, send the signed copy by Friday." ActionPacket AI reads the message and the files and hands back a clear, structured packet — summary, tasks, deadline, risks, what's missing, and a ready-to-send reply — then files the documents into a Google Drive folder and logs the job in a tracker sheet. The understanding is done by Claude; the filing, tracking, flagging, and formatting are done by ordinary deterministic code.

## 1. Project thesis
The people this serves are the human triage point for inbound work. Requests arrive all day, half the information lives in attachments, deadlines are buried in prose, and details go unconfirmed. Doing this by hand is slow and error-prone — a missed Friday, an unconfirmed fee, a lost PDF.

ActionPacket AI collapses "I got a messy request with files" into "here's exactly what's being asked, what to do, what's missing, a drafted reply, and it's all filed and tracked" — in under a minute. The AI does the messy comprehension (extract, classify, synthesize, draft). Everything consequential — assembling the artifacts, scoring what needs attention, writing to Drive and Sheets, persisting the record — stays deterministic, so the system is predictable and the AI never takes an action on the Operator's behalf.

## 2. One-sentence definition
ActionPacket AI turns a messy client request and its files into a structured, filed, and tracked action packet (summary, tasks, deadlines, risks, missing info, follow-up draft) with a Drive folder and a Sheets tracker row.

## 3. System boundary
| Zone | Contents |
|---|---|
| **Inside (we own)** | Intake, file text extraction, the AI analysis call, validation, attention scoring, Markdown + PDF generation, persistence (SQLite), the result + history screens, orchestration, graceful degradation. |
| **Edge (we write to)** | Anthropic API (reads the request, returns structure), Google Drive (creates a folder + uploads files), Google Sheets (appends a tracker row). |
| **Outside (not in V1)** | Sending the email itself, doing the requested work, calendar/task-manager sync, logins/accounts, multi-tenant isolation, acting on the client's behalf beyond filing the artifacts. |

The product **organizes and drafts**; it never **sends or executes**. The Operator stays in the loop for anything that leaves the building.

## 4. In-scope capabilities
1. An intake form + multi-file upload (the messy message + its attachments).
2. Text extraction from PDF / TXT / MD (DOCX optional). A scanned PDF with no text is *noted* ("OCR not supported in V1"), not treated as a failure.
3. One Claude call returning a validated, structured `ActionPacket`.
4. Deterministic "needs attention" scoring.
5. A Markdown packet + a polished PDF.
6. A dated Google Drive folder with the originals + generated artifacts.
7. A Google Sheets tracker row per request.
8. Live progress shown step-by-step while it runs.
9. A result screen (preview, metadata, copy-the-reply, download-the-PDF, integration status).
10. A history screen of past packets.
11. Three one-click demo scenarios.
12. Graceful degradation — the packet + PDF are always produced even if Google is off or fails.

## 5. Non-goals (V1)
Logins / multi-user · payments · team roles · approval chains · a chat interface · vector search · OCR · multi-agent orchestration · doing the work autonomously · email/calendar/Jira/Linear integration · editing a packet after it's generated.

## 6. Who uses it
One role, the **Operator**: a freelancer, consultant, small-business operator, or project coordinator running the app for themselves. No second role, no permissions — see `role-model.md`.

## 7. The four highest-stakes actions
| # | Action | Why it matters | How V1 keeps it safe |
|---|---|---|---|
| S1 | Writing a folder + files to the Operator's real Google Drive | It mutates their actual account | Scoped to `drive.file` (the app only ever touches files it created); never deletes |
| S2 | Appending a row to their tracker sheet | Mutates their data | Append-only; never edits or deletes existing rows |
| S3 | Drafting a client-facing reply | Wrong tone or a made-up fact is embarrassing | Draft only — never auto-sent; the Operator copies and sends; the prompt forbids inventing facts |
| S4 | Stating a deadline or dollar figure pulled from a document | The Operator might act on a wrong number | The prompt preserves vague dates verbatim, never invents, routes unknowns to "missing info," attaches the source quote as evidence, and surfaces a confidence score |

## 8. Why this genuinely needs AI
The hard part is irreducibly fuzzy: understanding free-text intent, classifying the request, breaking it into tasks, spotting that "by Friday" is a deadline and the "$450 fee" is unconfirmed, noticing nobody said who signs, and drafting a professional reply. No set of rules handles arbitrary client prose. Everything *around* that comprehension — and there's a lot of it — is deterministic.

## 9. What must stay deterministic
File handling (limits, sanitization, type detection) · the validation gate (the AI's output is checked against a strict schema before anything uses it) · attention scoring · Markdown + PDF assembly · the Drive and Sheets writes · persistence · orchestration and degradation.

## 10. First-pass workflow inventory
| ID | Workflow | Trigger | Risk |
|---|---|---|---|
| W1 | Generate Action Packet (the core pipeline) | Operator submits the form | High (S1–S4) |
| W2 | View a result | Open `/result/{id}` | Low |
| W3 | Browse history | Open `/history` | Low |
| W4 | Load a demo scenario | Click a demo button | None |
| W5 | Download the PDF | Click download | Low |
