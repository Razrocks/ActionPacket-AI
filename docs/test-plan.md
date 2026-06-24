# Test & Demo Plan (Phase 16)

No policy/approval/governance tests (out of scope).

## 1. Test strategy
**Tooling:** Vitest (TS). Mock `@anthropic-ai/sdk` + `googleapis` via `vi.mock`. Temp SQLite per test.

| Layer | Coverage | Network |
|---|---|---|
| Unit (deterministic) | `ActionPacketSchema` (valid/invalid); attention logic — each rule fires; Markdown assembly (snapshot); fileExtraction (txt/md/pdf-with-text/pdf-no-text→OCR note/docx); filename sanitization; `db` save/get/list; `env` validation | none |
| Integration | `workflowService` with mocked Claude fixture + Google off → statuses `skipped`, Run persisted, artifacts written; mocked Google success → `ok`; mocked Google throw → `failed` | mocked |
| Skill contract | fixture input → `messages.parse` shape → schema parses | mocked |
| Live smoke (gated by `ANTHROPIC_API_KEY`, skipped CI) | real Claude on Lease Renewal → schema-valid packet + soft expectations | live |
| E2E (manual; optional Playwright) | home → demo → generate → result → copy → download → history | local |

> **AI is non-deterministic:** deterministic assertions use mocked fixtures; live tests assert structural invariants (schema valid, ≥1 task, followUpDraft non-empty, confidence∈[0,1]) plus soft expectations (Lease Renewal *should* surface a Friday deadline + the $450 fee). Never assert exact model strings.

## 2. Demo plan
Three one-click scenarios. Run twice: Google off (badges `skipped`, full packet+PDF still delivered) and Google on (folder + tracker row + live links). 60s script per scenario.

## 3. Seeded scenario matrix
| Scenario | Message gist | Files | Expected `packetType` | Expected deadline | Expected risks | Expected missingInfo | `needsAttention` |
|---|---|---|---|---|---|---|---|
| Lease Renewal | review lease+invoice, signed copy by Friday, confirm $450 fee | none/demo | `contract_or_agreement` | "Friday" | setup-fee unclear; signing authority | who signs?; return method?; fee recurring? | true |
| Event Vendor | coordinate catering, dates+budget, missing details | none | `event_coordination` | event date if stated | budget ambiguity; vendor availability | exact date?; headcount?; budget cap? | true |
| Website Update | homepage changes + new pricing, launch deadline | none | `website_or_project_update` | launch date | scope creep; pricing source unclear | which pages?; final copy?; assets? | depends (true if soon) |

## 4. Expected-outcome matrix (invariants)
Schema valid (parses) · `packetType` ∈ enum (matches expected) · `tasks.length ≥ 1` · deadline captured when present, vague preserved · `missingInformation` non-empty when ambiguous · `followUpDraft` non-empty, no invented facts · `confidence` ∈ [0,1] · `needsAttention` matches deterministic rules · artifacts written + Run persisted + in History · badges reflect actual outcome.

## 5. Failure-case list
| Case | Expected |
|---|---|
| Missing title/message | 400, no Run |
| Unsupported file type | rejected pre-flight |
| Oversized / too many files | rejected pre-flight |
| No-text PDF | FileNote "OCR not supported V1", Run completes |
| Claude refusal | `error`, no Run |
| Claude bad JSON | 1 corrective retry → else `error` |
| Google not configured | `skipped`, Run completes |
| Google auth/network error | `failed` badge, Run completes |
| Puppeteer crash | `pdf_status=failed`, `.md` available, Run completes |
| Download missing PDF | 404 |
| Result id not found | empty/404 |

**Regression categories:** schema · attention logic · degradation · extraction · persistence.
