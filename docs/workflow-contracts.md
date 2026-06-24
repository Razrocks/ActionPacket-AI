# Workflows — Inventory & Contracts (Phase 5)

Approval/policy/audit checkpoints are dropped (out of scope). Failure + degradation are kept.

## Inventory
| ID | Workflow | Purpose | Trigger | Outputs | Risk | Artifacts | External write |
|---|---|---|---|---|---|---|---|
| **W1** | Generate Action Packet | Request → filed, tracked Packet | `POST /api/generate` | GenerationResult + runId | High | Yes | Yes (Drive, Sheets) |
| **W2** | View Result | Read one Generation | `/result/[id]` | rendered packet + statuses | Low | No | No |
| **W3** | Browse History | List Generations | `/history` | run list | Low | No | No |
| **W4** | Load Demo Scenario | Prefill a Request | demo button | filled form | None | No | No |
| **W5** | Download PDF | Get the PDF | `/api/download/[id]` | PDF bytes | Low | No | No |

V1 set: all five (W1 substantive; W2–W5 thin). W1 is one user-facing workflow with internal stages — not split. A future **Regenerate** workflow is excluded.

## Shared contract template
`Trigger · Required inputs · Optional inputs · Ontology objects · Stages & decision points · Outputs · Artifacts created · Records/events emitted · State transitions · Failure states & degradation · Completion criteria`

## W1 — Generate Action Packet (full)
- **Trigger:** `POST /api/generate` (multipart) from IntakeForm.
- **Required inputs:** `title`, `message`.
- **Optional inputs:** `requester`, `projectName`, `priority`, `deadline`, `files[]`.
- **Ontology objects:** Request, Attachment[], Generation, ActionPacket(+children), Artifact[], DriveFolder?, TrackerRow?, WorkflowRun.
- **Stages & decision points:**
  1. Intake validate (Zod). Invalid → `400`, abort, no Run persisted.
  2. Extract files. Unsupported type → rejected pre-flight. No-text PDF → FileNote "OCR not supported V1", continue.
  3. AI analysis (Skill). Refusal or `parsed_output==null` → emit `error`, abort, no Run.
  4. Validation gate (`ActionPacketSchema.parse`). Fail → `error`, abort.
  5. Attention logic (deterministic) → merged into packet.
  6. Assemble Markdown.
  7. Render PDF. Fail → `pdf_status=failed`, keep packet + `.md`, continue.
  8. File to Drive (degrade `ok|skipped|failed`).
  9. Track to Sheets (degrade).
  10. Persist WorkflowRun (once a valid Packet exists).
  11. Emit `done {runId}`.
- **Outputs:** GenerationResult; `runId`.
- **Artifacts:** `action-packet.md`, `action-packet.pdf`, `metadata.json`, `original-request.txt`, + copied Attachments (Drive).
- **Records/events:** one WorkflowRun row; StepEvent stream (`reading→extracting→analyzing→packet→pdf→drive→sheets→done`).
- **State transitions:** `created→extracting→analyzing→assembling→filing→tracking→completed` | `failed`.
- **Failure & degradation:** pre-packet failures (invalid input / refusal / parse fail) → user error, **no Run persisted**. PDF/Drive/Sheets failures → degrade, Run still `completed`, badges show `failed`/`skipped`. Missing Google creds → `skipped`.
- **Completion:** validated ActionPacket persisted + Result renderable; Drive/Sheets not blocking.
- **Mapping:** `intakeService → fileExtractionService → claudeAnalysisService(Skill) → [attention in workflowService] → packetGenerationService → pdfService → googleDriveService → googleSheetsService → db`. Route `/api/generate`. UI `IntakeForm`, `WorkflowProgress`.

## W2 — View Result
Open `/result/[id]` · input `runId` · server component reads Store → render packet + metadata + badges · not found → empty/404 · `db.getRun`, PacketPreview/MetadataCards/CopyButton.

## W3 — Browse History
Open `/history` · `db.listRuns` → list (title, type, priority, deadline, attention, date, link) · none → empty state.

## W4 — Load Demo Scenario
Click demo button · client-only · read `demoData` → set form state · no backend, no Run.

## W5 — Download PDF
`GET /api/download/[id]` · read `pdf_path` from Store → stream bytes (`Content-Disposition: attachment`) · missing → 404 · works even if Drive off.
