# Primitives & Abstractions (Phase 3)

## 1. What counts as a primitive
A smallest load-bearing value with no internal parts: a scalar field, an enum value, a single env var, one file buffer, one step-event token.

## 2. What counts as an abstraction
A composed, named structure built from primitives, or an architectural pattern (Service, Orchestrator).

## 3. Primitives list
**Input scalars:** `title`, `requester`, `projectName`, `message`, `priority(raw)`, `deadline(raw)`.
**File primitives:** `fileName`, `fileBuffer`, `mime`, `fileSize`, `extractedText`.
**Packet leaf fields:** `summary`, `packetType(enum)`, `priority(enum)`, `confidence(0–1)`, `needsAttention(bool)`, `needsAttentionReason`, task fields, deadline fields (`label/dueDate/evidence`), risk fields (`title/severity/explanation`), `missingInformation[i]`, `followUpDraft`, `recommendedNextStep[i]`, fileNote fields.
**Derived scalars:** `mainDeadline`, `runId`, `createdAt(ISO)`.
**Process tokens:** step-event token, integration-status value (`ok|skipped|failed`), run-status value.
**Artifact primitives:** `markdown`, `pdfBytes`, `pdfPath`, `driveFolderUrl`, `driveFileLink`, `sheetUrl`.
**Config primitives:** env vars (`ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `GOOGLE_OAUTH_*`, `GOOGLE_DRIVE_ROOT_FOLDER_ID`, `GOOGLE_SHEETS_ID`, `SQLITE_PATH`, `NEXT_PUBLIC_APP_URL`), `MAX_FILE_BYTES`, `MAX_FILE_COUNT`.

## 4. Abstractions list
`IntakeInput` · `Attachment` · `ExtractedFile` · `ActionPacket` · `Task` · `Deadline` · `Risk` · `FileNote` · `AttentionResult` · `PacketArtifacts` · `DriveResult` · `SheetResult` · `WorkflowRun` (+`WorkflowRunRow`) · `GenerationResult` · `StepEvent` · `DemoScenario` · architectural: `Service`, `Adapter`, `Orchestrator`, `Skill`.

## 5. Top load-bearing primitives
`packetType` · `priority` · `confidence` · `needsAttention` · `mainDeadline` · `followUpDraft` · `summary` · `extractedText` · step-event token · integration-status value · `runId` · `createdAt` · `ANTHROPIC_API_KEY` · `GOOGLE_OAUTH_REFRESH_TOKEN` · `pdfPath` · `markdown` · `MAX_FILE_BYTES`/`MAX_FILE_COUNT` · risk `severity`.

## 6. Top abstractions (the spine)
`ActionPacket` (central output) · `GenerationResult` (returned to frontend) · `IntakeInput` · `WorkflowRun` (+Row) · `StepEvent` · `ExtractedFile` · `AttentionResult` · `PacketArtifacts` · `DriveResult`/`SheetResult` · `Skill` · `Orchestrator` · `Service`/`Adapter`.

## 7. Seem important but must NOT become abstractions
| Tempting | Why cut | Use instead |
|---|---|---|
| Per-`packetType` strategy classes | only a label | enum + label map |
| Job queue / scheduler | sync-stream, single user | async function |
| Integration plugin/registry | only 2 integrations | two adapters + `isConfigured()` |
| Event bus / pub-sub | linear stream | emit tokens on one stream |
| Generic Repository/ORM | one table | thin `db.ts` (3 fns) |
| PromptBuilder/templating engine | one prompt | one function returning a string |
| Pipeline DAG engine/DSL | fixed 6-stage line | one ordered function body |
| Caching layer | nothing hot | — |
| User/session/account model | single Operator | — |
| Validator wrapper framework | Zod already is | use Zod directly |
