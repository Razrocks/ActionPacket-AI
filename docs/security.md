# Security, Secrets & Access (Phase 11)

Governance/admin/policy-mutation dropped; secrets + trust boundaries + upload safety kept.

## 1. Trust-boundary map
| Zone | Trust | Holds secrets? | Rule |
|---|---|---|---|
| Browser (C2) | Untrusted | No | Receives only public packet data; never a secret. All AI/Google/file logic server-side. |
| Next server (C1) | Trusted | Yes | Reads secrets, makes external calls, validates input. |
| Uploaded files | Untrusted input | — | Validate type/size/count, sanitize names, never execute. |
| External APIs (C8) | Semi-trusted sink | — | Send minimum data; scope-limited tokens. |

**Hard rule:** secrets cross only into the server zone. `NEXT_PUBLIC_*` is reserved for non-secrets (only `NEXT_PUBLIC_APP_URL`).

## 2. Privileged actions
| # | Action | Actor | Exposure |
|---|---|---|---|
| PA1 | Call Anthropic w/ API key | server | never browser |
| PA2 | Write Drive | server (OAuth) | never browser |
| PA3 | Append Sheets row | server (OAuth) | never browser |
| PA4 | Write local FS `storage/` | server | controlled paths |
| PA5 | Write SQLite | server | — |
| PA6 | Mint refresh token (`scripts/google-auth.ts`) | Operator, one-time, local | not in app runtime |

## 3. Secrets handling
- **Secrets:** `ANTHROPIC_API_KEY`, `GOOGLE_OAUTH_CLIENT_ID/SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN`. IDs (`GOOGLE_DRIVE_ROOT_FOLDER_ID`, `GOOGLE_SHEETS_ID`) low-sensitivity, still server-side.
- **Storage:** `.env.local` (gitignored). `.env.example` ships blank.
- **Access:** server-only `src/lib/env.ts`; throws at call time if a required secret is missing.
- **Never:** log secrets · return them in responses or `metadata.json` · instantiate SDK clients in client components · use `NEXT_PUBLIC_` for secrets.
- **Refresh token:** treat as a password; rotate by re-running the auth script + revoking in Google Console.

## 4. Least-privilege scopes
| Surface | Scope | Behavior constraint |
|---|---|---|
| Drive | `drive.file` | App sees/manages only files it creates. Create + upload only; never delete/list others. |
| Sheets | `spreadsheets` | Scope is broad (no per-sheet scope exists); code only ensures header + appends — never edits/deletes existing rows. Single-user → acceptable. |

## 5. Upload safety
- Limits: `MAX_FILE_COUNT` (~5), `MAX_FILE_BYTES` (~10MB) each + total cap → reject over-limit pre-flight.
- Allowlist MIME/ext: `pdf, txt, md, docx`; reject others.
- Sanitize filenames: `basename` only, strip control/path chars, collision-suffix.
- Parse via libraries only (pdf-parse/mammoth on buffers) — no shell, no execution.
- Serve PDFs by `runId` via the download route reading `pdf_path` from the DB — never an arbitrary user path (prevents traversal).

## 6. Access enforcement (collapsed)
Single Operator, local app, no auth, full access. **Assumption: local/trusted environment.** Public deployment requires auth + per-user isolation (documented limitation).

## 7. Failure & abuse scenarios
| Scenario | Mitigation |
|---|---|
| Prompt injection in message/file text | The agentic node has no tools and cannot act — injection at most produces misleading content, never an external action. Output is structured + Zod-validated; Operator reviews; follow-up never auto-sent. |
| Oversized/many/malicious files | size + count caps; allowlist; reject pre-flight |
| Path traversal via filename | sanitize + download-by-id |
| URL/SSRF in text | we never fetch URLs; AI has no web tool |
| Secret leakage | server-only, gitignored, never logged/returned |
| Token compromise | `drive.file` limits blast radius; rotate token |
| Public exposure (no auth) | documented limitation; assume local/trusted |
