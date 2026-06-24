# Implementation Phases / Build Order (Phase 18)

Each stage is independently runnable. Maps to the session task list.

## Stage 0 — Docs pack (P17) ✅
Write `README.md` + `docs/*.md` + `skills/analyze-request/skill.md`.

## Stage 1 — Scaffold + base config
- `create-next-app` (TS, Tailwind, App Router, src dir, import alias). The project dir name `ActionPacketAI` is invalid as an npm package name → scaffold into a temp subdir, then move contents up.
- shadcn init.
- `next.config.ts`: `serverExternalPackages: ['better-sqlite3', 'puppeteer']`.
- `src/lib/db.ts` (table create + WAL + typed `saveRun/getRun/listRuns`).
- `src/lib/env.ts` (typed server-only env access + `isConfigured` helpers).
- `.env.example`, `.gitignore` (`.env.local`, `dev.db`, `storage/`, `node_modules`), `storage/`.

## Stage 2 — Core lib
- `src/lib/schema.ts` — Zod `ActionPacketSchema` + `IntakeInput` schema + inferred types.
- `src/lib/constants.ts` — `MAX_FILE_BYTES`, `MAX_FILE_COUNT`, allowed MIME, packet-type labels.
- `src/lib/demoData.ts` — 3 scenarios (Lease Renewal, Event Vendor, Website Update).

## Stage 3 — Skill (AI analysis)
- `src/services/claudeAnalysisService.ts` — `messages.parse` + `zodOutputFormat(ActionPacketSchema)`, adaptive thinking, system prompt, validation gate, 1 corrective retry, refusal handling.
- Smoke test on a demo string (needs only `ANTHROPIC_API_KEY`).

## Stage 4 — File extraction
- `src/services/fileExtractionService.ts` — pdf-parse / txt / md; DOCX (mammoth) optional; no-text PDF → OCR note; sanitize + enforce limits.

## Stage 5 — Artifacts
- `src/services/packetGenerationService.ts` — Markdown packet.
- `src/services/pdfService.ts` + `src/lib/pdfTemplate.ts` — marked → styled HTML → Puppeteer PDF (reuse one browser).
- Verify a real PDF lands in `storage/`.

## Stage 6 — Orchestrator + API
- `src/services/workflowService.ts` — `generateActionPacket` (stages, deterministic attention logic, degradation, persist). Google stubbed `skipped`.
- `src/app/api/generate/route.ts` — multipart in, streamed NDJSON step events out (`runtime = "nodejs"`).
- `src/app/api/download/[id]/route.ts` — serve PDF by runId.

## Stage 7 — UI (→ Slice 01 complete, Google off)
- Home (`IntakeForm`, `DemoScenarios`), `WorkflowProgress` (stream consumer), Result page (`PacketPreview`, `MetadataCards`, `CopyButton`, download), History page.

## Stage 8 — Google (→ Slice 01b, full thesis)
- `scripts/google-auth.ts` (one-time refresh token), `src/services/google/auth.ts` (OAuth2 client), `googleDriveService`, `googleSheetsService`. Flip integrations on; verify folder + sheet row.

## Stage 9 — README + polish + tests
- Vitest unit/integration (mock Anthropic + googleapis), failure-case coverage; finalize README (diagram, screenshots, limitations, future work); end-to-end + negative verification.

## Verification (end-to-end)
`npm run dev` → Lease Renewal demo → Generate → live steps → Result (packet, metadata, tasks/deadlines/risks/missing-info, follow-up + Copy, Download PDF, badges) → History. Negative: no Google → skipped; no-text PDF → OCR note; oversized/too-many files → rejected. Google on → Drive folder (originals + pdf + md + metadata.json) + Sheets row. No secrets in client bundle.
