# Environment & Deployment (Phase 13)

## 1. Environment model
Three environments: **local** (primary build/demo target), **test** (automated, no live external calls), **prod-like** (documented, not a V1 build target).

## 2. Local dev (primary)
- Node 22 + npm (lockfile committed). Optional `.nvmrc`.
- `npm run dev` → `http://localhost:3000`.
- `.env.local` holds secrets (gitignored); `dev.db` + `storage/` auto-created on first run.
- Puppeteer downloads its own Chromium on install.
- One-time: `npm run auth:google` → mint refresh token → paste into `.env.local`.
- **Demo scenarios run with zero Google + zero files** → demoable after `ANTHROPIC_API_KEY` is set.

## 3. Test
- Unit tests for deterministic services (extraction, attention, Markdown, schema) — no network.
- Claude analysis: mock the SDK with a fixture `parsed_output`; optional live smoke test gated by `ANTHROPIC_API_KEY` (skipped in CI).
- Google: `isConfigured()=false` → exercises the `skipped` path. No real Google calls.
- DB: temp/in-memory SQLite per test.

## 4. Prod-like (future)
| Option | Fit | Changes |
|---|---|---|
| Persistent Node host (Render/Railway/Fly/VPS) | ✅ keeps V1 intact | persistent disk for `dev.db` + `storage/`; Chromium system libs |
| Vercel serverless | ⚠️ rework | `@sparticuz/chromium`; SQLite → hosted (Turso/Postgres); `storage/` → object storage; `/tmp` |
**Recommendation:** persistent Node host preserves V1 as-is.

## 5. Environment differences
| Aspect | Local | Test | Prod-like (Node host) |
|---|---|---|---|
| DB | `dev.db` file | temp/in-memory | persistent-disk SQLite (or hosted) |
| `storage/` | local dir | temp dir | persistent disk (or object store) |
| Chromium | puppeteer download | puppeteer (or skipped) | system libs / cached |
| Anthropic | live | mocked (+gated smoke) | live |
| Google | optional (skipped if off) | off (skipped path) | configured |
| Secrets | `.env.local` | `.env.test`/defaults | host secret store |
| Logging | console | captured/asserted | console → sink (future) |

## 6. Deployment concerns
- `serverExternalPackages: ['better-sqlite3','puppeteer']` so Next doesn't bundle native deps.
- `better-sqlite3` native rebuild must match target Node/arch.
- Chromium present on host or bundled.
- Persistent disk for `dev.db` + `storage/` (or hosted DB + object storage).
- Env vars per host; update `NEXT_PUBLIC_APP_URL`.
- OAuth: `google-auth.ts` is run locally to mint the token regardless of deploy target.
- `next build` then `next start`.

## 7. Migration / config risks
| Risk | Mitigation |
|---|---|
| `better-sqlite3` native rebuild | pin Node, rebuild on target, lockfile |
| Puppeteer Chromium fetch in CI/deploy | cache, or system Chromium |
| Schema change | idempotent `ALTER TABLE` guard |
| Env drift vs `.env.example` | `lib/env.ts` validates required vars |
| Windows dev vs Linux prod paths | `path.join`, never hardcode separators |
| Demo data | lives in `demoData.ts` (code), no DB seed; History empty until first run |
| Reproducibility | committed lockfile, pinned Node, documented env |
