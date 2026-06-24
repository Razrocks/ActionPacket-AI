# Vertical Slice 01 — "Lease Renewal → Action Packet (local)" (Phase 15)

## 1. Chosen slice
One full **W1 Generate** run from the **Lease Renewal demo scenario** (no file upload needed), producing a validated packet + Markdown + PDF + `metadata.json`, persisted to SQLite, viewable on the Result page and listed in History — with **Google Drive/Sheets deliberately in `skipped`** (no OAuth setup required).

- **Role:** Operator.
- **Records:** one `WorkflowRun` (SQLite).
- **Workflow:** W1, stages S1→S7 + S10–S12; S8 Drive / S9 Sheets = `skipped`.
- **Skill:** `analyze-request`.
- **Services exercised:** intake, fileExtraction (no-files path), packetGeneration, pdf, db, orchestrator, streaming.
- **Artifacts:** `storage/<runId>/action-packet.md`, `action-packet.pdf`, `metadata.json`.
- **Trace:** WorkflowRun row + step-event stream + metadata.json.

## 2. Why it's the best first slice
- Exercises the entire deterministic spine + the one agentic node + the validation gate + persistence + the full UI in a single run.
- Zero external-account setup (no Google OAuth) → fastest path to a running, demoable, thesis-proving system.
- Proves the hard, differentiating capability: messy text → structured, validated packet → professional artifact → tracked + viewable. Google is additive CRUD layered on next.
- Demo-safe: canned scenario, no private docs.

## 3. End-to-end sequence
1. Open `/`, click **Lease Renewal** → `IntakeForm` prefills (title, requester, message; no files).
2. Submit → `POST /api/generate` → handler validates (S1, Zod).
3. Orchestrator emits `reading` → `extracting` ("(no files attached)").
4. `analyzing` → `analyze-request` Skill: `messages.parse` + `zodOutputFormat` → `ActionPacket`.
5. Validation gate (S4) passes → attention logic (S5) sets `needsAttention` + reasons.
6. `packet` → Markdown assembled.
7. `pdf` → Puppeteer renders `action-packet.pdf` into `storage/<runId>/`; write `.md` + `metadata.json`.
8. `drive` → `skipped`; `sheets` → `skipped`.
9. Persist `WorkflowRun` (status `completed`, drive/sheet `skipped`, pdf `ok`).
10. Emit `done {runId}` → navigate to `/result/<runId>`.
11. Result RSC reads `db.getRun` → renders preview, metadata cards, tasks/deadlines/risks/missing-info, follow-up + Copy, Download PDF, status badges.
12. `/history` lists the run.

## 4. Implementation checklist
- [ ] Scaffold + `lib/db.ts` (table + WAL) + `lib/env.ts` + config (`serverExternalPackages`).
- [ ] `lib/schema.ts`, `lib/constants.ts`, `lib/demoData.ts` (Lease Renewal).
- [ ] `claudeAnalysisService` (Skill) + Zod gate + 1 corrective retry + refusal handling.
- [ ] `fileExtractionService` (no-files + TXT/MD/PDF path).
- [ ] `packetGenerationService` + `pdfService` + `pdfTemplate`.
- [ ] `workflowService` (stages, attention, degradation, persist) — Drive/Sheets stubbed `skipped`.
- [ ] `/api/generate` streaming + `/api/download/[id]`.
- [ ] UI: Home, `WorkflowProgress`, Result, History.
- [ ] Verify: PDF in `storage/`, Result renders, Copy + Download work, badges show skipped, run in History.

## 5. Demo script (~60s)
"Open the app → click **Lease Renewal** → **Generate**. Watch the live steps (reading → analyzing → packet → PDF). Result page: a clean summary, the tasks to do, the Friday deadline, the $450-fee risk, what's missing, and a ready-to-send follow-up I can copy. Download the PDF. Drive/Sheets show *skipped* — the app still delivered everything. It's in History."

## What Slice 01 intentionally excludes
Google Drive, Google Sheets (→ Slice 01b), file uploads (demo text only), DOCX, the other two demo scenarios, regenerate/edit.

## Slice 01b (next)
Flip Drive + Sheets on (OAuth) → folder with artifacts + tracker row + live links/badges. Proves the full thesis end-to-end.
