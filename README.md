# ActionPacket AI

Turn a messy client request and its files into a **structured, filed, and tracked action packet** — summary, tasks, deadlines, risks, missing info, and a ready-to-send follow-up draft — plus a generated PDF, an organized Google Drive folder, and a Google Sheets tracker row.

> ActionPacket AI demonstrates end-to-end AI workflow automation: unstructured intake, document parsing, Claude-powered structured extraction, artifact generation, Google Drive organization, and Google Sheets tracking.

## Why it exists
Freelancers, consultants, and ops people get vague inbound requests with attachments and must quickly figure out: what's being asked, what to do, what the deadlines are, what's risky or missing, and what to reply. ActionPacket AI collapses that into a single structured packet in under 60 seconds.

## What it does
1. Operator pastes a messy request + (optionally) uploads files.
2. Text is extracted server-side (PDF/TXT/MD; DOCX optional).
3. **One** Claude call extracts a validated `ActionPacket` (structured output via Zod).
4. Deterministic rules compute a "needs attention" flag.
5. A Markdown packet + polished PDF are generated.
6. A Google Drive folder is created and artifacts + originals uploaded.
7. A Google Sheets tracker row is appended.
8. A Result page shows everything; History lists past runs.

If Google isn't configured (or fails), the packet + PDF are still produced and the integrations are marked `skipped`/`failed` — the app never collapses on one integration.

## Tech stack
Next.js (App Router, TypeScript) · Tailwind + shadcn/ui · Anthropic SDK (`messages.parse` + `zodOutputFormat`, adaptive thinking) · Zod · googleapis (Drive v3 + Sheets v4, OAuth refresh-token) · better-sqlite3 · Puppeteer + marked · pdf-parse (+ mammoth optional).

## Architecture (one line)
Modular monolith. Exactly **one agentic node** (the analysis call) fenced by a Zod validation gate; everything else — file handling, attention scoring, artifact assembly, external writes, persistence, orchestration — is deterministic. External writes are best-effort and degradable.

```
Intake ─▶ Extract ─▶ [AI analyze] ─▶ Zod gate ─▶ Attention ─▶ Markdown ─▶ PDF ─▶ Drive ─▶ Sheets ─▶ Persist
          deterministic   agentic      trust boundary            deterministic + degradable tail
```

## Setup
1. `npm install`
2. Copy `.env.example` → `.env.local`; set `ANTHROPIC_API_KEY`.
3. (Optional, for Google) run `npm run auth:google` once to mint a refresh token; paste the printed values into `.env.local`.
4. `npm run dev` → http://localhost:3000

## Environment variables
See `.env.example`. Secrets are server-only (never `NEXT_PUBLIC_*`). Required: `ANTHROPIC_API_KEY`. Optional (enables Drive+Sheets): `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN`, `GOOGLE_DRIVE_ROOT_FOLDER_ID`, `GOOGLE_SHEETS_ID`.

## Demo scenarios
Three one-click presets (no real files needed): **Lease Renewal**, **Event Vendor Request**, **Website Update Request**.

## Planning docs
This project was planned with a reusable planning OS. Full design pack in [`docs/`](docs/): thesis, ontologies, workflow contracts, deterministic/agentic decomposition, skill contract, integrations, data/runtime/security/observability/environment/capacity architecture, the vertical slice, the test plan, and the implementation phases. The single AI skill spec is in [`skills/analyze-request/skill.md`](skills/analyze-request/skill.md).

## Limitations (V1)
Single user, no auth. Demo application — not enterprise-grade secure storage. No OCR (scanned/image-only PDFs are noted, not read). No edit/regenerate of a packet. Re-running creates a new Drive folder + Sheets row (no dedupe).

## Future improvements
OCR · multi-user + auth · editable/regenerate packets · email send of the follow-up · token-count preflight + chunking for large docs · background-job model for concurrency · deploy to a persistent Node host.
