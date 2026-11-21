# QUALITY — Checks, Targets and Baseline

> Records **observed** results, not hopes. Re-run commands after dependency or source changes, and write the result here with the date.

---

## 1. Environment and versions

Do not rely on memory for versions. Query the registry or docs, then record.

| Item | Observed value | Date |
|---|---|---|
| Node.js | 22.23.1 (runtime) | 2026-11-19 |
| pnpm | 12.18.0 | 2026-11-19 |
| Next.js | 16.4.6 (registry latest stable; installed) | 2026-11-19 |
| React / React DOM | 19.3.1 (installed) | 2026-11-19 |
| Payload and `@payloadcms/*` packages (all the same version) | 3.94.0 (registry latest stable; declared) | 2026-11-19 |
| Tailwind CSS | 4.3.5 (registry latest stable; installed) | 2026-11-19 |
| TypeScript | 5.9.3 (installed) | 2026-11-19 |
| PostgreSQL (local and production) | Local image configured as `postgres:16-alpine`; not started. Production TBD | 2026-11-19 |
| ESLint, Prettier, Vitest, Playwright | ESLint 9.39.5, Prettier 3.10.1, Vitest 4.1.12, Playwright 1.65.1 | 2026-11-19 |
| Starting commit | `b8a54bd` (repository history also contains `6660603`) | 2026-11-19 |
| Install command | `pnpm install --frozen-lockfile` | |

`.env` is gitignored. Do not copy values into any doc.

---

## 2. Check results

| Check | Command | Result | Date | Notes |
|---|---|---|---|---|
| Install | `pnpm install --frozen-lockfile` | Pass after approving required native builds; final frozen install passes | 2026-11-19 | Initial attempt blocked by pnpm 12 approval policy |
| Typecheck | `pnpm typecheck` | Pass | 2026-11-19 | |
| Lint | `pnpm lint` | Pass | 2026-11-19 | Migrated to Next 16 native flat configs; no warnings |
| Format | `pnpm format:check` | Pass | 2026-11-19 | Configured source/config/test files; existing Markdown docs are not reformatted |
| Unit and integration | `pnpm test` | Pass (1 file, 3 tests) | 2026-11-19 | Site environment indexing gate; Vitest 4.1.12 |
| E2E | `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/google-chrome pnpm test:e2e` | Pass (2 tests) | 2026-11-19 | Uses installed system Chrome; Playwright browser download timed out |
| Build | `SITE_ENV=production pnpm build` | Pass | 2026-11-19 | Next 16.4.6; includes `/robots.txt` |
| Runtime smoke | `curl /`, `/admin/login`, `/admin/create-first-user`, `/api/health` | Pass (200 for all; health body `{"ok":true}`) | 2026-11-19 | Existing local PostgreSQL reachable. First-user submission not performed |
| Dependency audit | `pnpm audit` | Pass; no known vulnerabilities | 2026-11-19 | Vitest 4.1.12; pnpm overrides pin patched DOMPurify, Happy DOM, esbuild and Tinypool |
| Peer dependencies | `pnpm peers check` | Pass; no peer dependency issues | 2026-11-19 | |
| Users/roles chunk (CP-1.1 part 1) | `pnpm format:check && pnpm typecheck && pnpm lint && pnpm test` | Pass (2 files, 8 tests) | 2026-11-19 | Added `src/access/roles.test.ts`; Payload types and import map regenerated |
| Build re-run after users/roles + import map | `SITE_ENV=production pnpm build` | Pass (6 static pages; `/admin` dynamic) | 2026-11-19 | First attempt failed: empty `DATABASE_URL=`/`PAYLOAD_SECRET=` lines in `.env.local` clobbered `.env` (gotcha 17); removed the empty lines |
| E2E re-run for the users/roles chunk | `SITE_ENV=staging pnpm build` then `pnpm test:e2e` | Pass (2 tests) | 2026-11-19 | First attempt failed against a production-flavoured `.next` (build-time metadata; ordering note in section 4) |
| Media/Filebase chunk (CP-1.1 part 2) | `pnpm format:check && pnpm typecheck && pnpm lint && pnpm test` | Pass (3 files, 16 tests) | 2026-11-19 | Includes the live Filebase round trip (`src/collections/media.integration.test.ts`, 5 tests: upload with variants, byte-identical S3 read-back under `media/`, alt rejection, 11 MB valid-PDF size-cap rejection, delete + object gone); ran 5/5 twice. Skipped in CI (placeholder creds) |
| Staging build + E2E for the media chunk | `SITE_ENV=staging pnpm build` then `pnpm test:e2e` | Pass (2 tests) | 2026-11-19 | |
| Production build for the media chunk | `SITE_ENV=production pnpm build` | Pass | 2026-11-19 | Config now fail-fast requires `FILEBASE_*` env; CI placeholders added to `ci.yml` |
| Runtime smoke for media access | `curl /api/health`, `GET /api/media`, anon `POST /api/media` | Pass (200 / 200 / **403**) | 2026-11-19 | Public read works; anonymous upload correctly denied. Leftover test PDF from an intermediate run deleted and verified (0 media docs) |
| CP-1.1 delivery-path chunk (spike, flip, migration, test page) | `pnpm format:check && pnpm typecheck && pnpm lint && pnpm test` | Pass (4 files, **19 tests**) | 2026-11-19 | Adds `src/cms/media-urls.test.ts` (3 tests, ADR-015 URL construction); generated files (`payload-types.ts`, `importMap.js`, `src/migrations/`, `pnpm-lock.yaml`) excluded from format/lint the same way |
| Staging build + E2E for CP-1.1 | `SITE_ENV=staging pnpm build` then `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/google-chrome pnpm test:e2e` | Pass (build: 7 static routes incl. `○ /media-test`; E2E **3/3**) | 2026-11-19 | Built HTML for `/media-test` contains `src="/api/media/file/cp11-test-image.png?prefix=media"`, 3-variant WebP `srcSet`, alt, width/height; e2e polls `naturalWidth > 0` (30 s) so delivery is proven end to end. First full-suite run failed on a cold Playwright cache (browser binaries wiped by the reboot; download stalls on this network — gotcha 22) and passed once the system Chrome path was used |
| Production build + smoke for CP-1.1 | `pnpm build` then `SITE_ENV=production pnpm start` + curl | Pass | 2026-11-19 | `/api/health` 200, `/media-test` 200 (image `src` present), `GET /api/media` 200, anon `POST` **403**, `GET /api/media/file/…?prefix=media` 200 |
| CI sequence simulated (no remote yet) | scratch DB → `pnpm payload migrate` → `SITE_ENV=staging DATABASE_URL=<scratch> pnpm build` | Pass | 2026-11-19 | Empty DB migrated (10 tables + `payload_migrations` row), build rendered `/media-test` empty-state notice with 0 `<img>`; scratch DB dropped, normal staging build restored afterwards. Proves the new CI migrate step + the page's empty-library branch |
| Initial migration verified | `pnpm payload migrate` against an empty scratch DB | Pass (10 tables, migration row recorded) | 2026-11-19 | `20261119_101405_initial` — 10 `CREATE TABLE` matching the dev schema, down = 10 `DROP TABLE`; run twice (standalone and as the CI sequence) |
| DB recovery after machine reboot | `podman start mcs-db` + row counts | Pass | 2026-11-19 | System PostgreSQL 18 took port 5432; after the human disabled it, container data verified intact (media doc 12, 1 user, 10 tables), baseline test run 16/16 at that point |
| CP-1.3 full suite (globals + seed) | `pnpm format:check && pnpm typecheck && pnpm lint && pnpm test` | Pass (**69/69 tests**, 10 files) | 2026-11-21 | Adds the two globals with field-level access, `src/seed/*` (guard + idempotent sample seed) and migration `20261120_114629_add_globals` (11 `CREATE TABLE` + 3 enums). First full run failed only on gotcha 22 (`ETIMEDOUT`/`ENETUNREACH` to Filebase); isolated re-run 5/5, then full suite 69/69 |
| Seed environment guards (DB-free) | `SITE_ENV=production pnpm seed`; unset `SITE_ENV`; `NODE_ENV=production` | Pass — all refused, **exit 1** | 2026-11-21 | "Seeding is strictly prohibited in production." for both production flags; unset `SITE_ENV` also refuses (must be `development`/`staging`). Verified before any DB connection |
| Fresh-DB seed exit proof | scratch `mcs_seed_verify` → `pnpm payload migrate` → `pnpm seed` ×2 → row counts | Pass | 2026-11-21 | All 3 migrations apply in order; run 1 creates 1 SAMPLE category (`path=sample-pages`) + 1 SAMPLE draft page (`path=sample-pages/sample-content`); run 2 idempotent ("already exists; leaving it unchanged", counts stable 1/1); globals untouched (0 rows); scratch dropped |
| Global row lifecycle (fresh DB) | `payload findGlobal` reads then `updateGlobal` on scratch | Pass | 2026-11-21 | Reads create nothing (`navigation.headerItems` → `[]`, 0 rows); first `navigation` save inserts the row (1 row); first `site-settings` partial save rejected naming exactly the 4 required contact fields. Corrected the false "created by the first read" claim in `docs/DATABASE.md` |
| Staging build + E2E for CP-1.3 | `SITE_ENV=staging pnpm build` then `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/google-chrome pnpm test:e2e` | Pass (9 routes incl. `○ /media-test`; E2E **3/3**) | 2026-11-21 | Media image loads (`naturalWidth > 0`) proving delivery still works after the globals/migration changes |
| Production build + smoke for CP-1.3 | `SITE_ENV=production pnpm build` + `pnpm start` + curl | Pass | 2026-11-21 | `index, follow` meta + `X-Robots-Tag` (build-time `SITE_ENV`), HSTS + `X-Frame-Options: DENY`, robots.txt `Allow: /` + `/admin`/`/api`/`/edit` disallowed, `/` 200, `/media-test` 200, media file 200, anon `POST /api/pages` **403**, anon `POST /api/globals/navigation` **403**, anon global read 200 (public by design). Note: a stale `next start` from an earlier run kept port 3000 alive and briefly served a noindex build — old server must be killed before re-smoking |

CI runs the same commands with the same Node and pnpm versions. Note: CI has never actually run (no remote configured yet), so the "CI sequence simulated" row above is the local proof of that path.

---

## 3. Targets

### Performance (mobile)

| Metric | Target |
|---|---|
| Lighthouse mobile performance | **90 or higher** on home, a service, a product, a location, a post |
| LCP | 2.5 s or better (75th percentile in the field) |
| INP | 200 ms or better |
| CLS | 0.1 or better |
| Test conditions | Lighthouse simulated slow 4G, plus real tests on a mid-range Android phone and throttled network |

Budgets (proposed starting points, tune with evidence):

- First-load JavaScript on public pages: about 170 KB compressed or less
- Hero image: under 150 KB (AVIF or WebP), correctly sized, prioritised
- Fonts: two families maximum, subsetted, swapped
- Third-party scripts (GA4, chat, Turnstile): load after interaction or idle; chat never blocks LCP
- Public pages are static or ISR; no client data fetching for primary content
- No editor code on public routes

### Accessibility

- **WCAG 2.2 AA** on every template. Automated axe checks on every template and block; manual keyboard and screen-reader pass on home, a service page, forms, and the content box.

### Reliability

- Backups daily; **restore tested** (`docs/OPERATIONS.md`).
- Uptime monitoring with alerts. Error monitoring on server and client.

---

## 4. Test strategy

| Layer | Tooling | Must cover |
|---|---|---|
| Unit | Vitest | `limits.ts` parity, pricing and discount maths (including date boundaries in `Asia/Karachi`), phone normalisation, slug rules, similarity check, WhatsApp link builder, encryption helpers (round trip, wrong key, tamper) |
| Integration | Vitest with a test database | Access control matrix; publish gates; hooks (price history, redirects); lead creation; photo pipeline; CSV import dry-run and commit |
| E2E | Playwright | Public journeys (home, service, product, location, forms, quote basket); admin invite and login with 2FA; inline edit flow (edit, limit, draft, publish, conflict, restore); mobile viewport |
| Accessibility | axe in Playwright | Every template and the edit route |
| Security | Tests in `docs/SECURITY.md` section 5 | All listed |
| Performance | Lighthouse CI or equivalent | Budgets above on key templates |
| Visual | Manual at 360, 768, 1280 px | Max-content cases for each block |

Rules: deterministic data, cleanup after each test, no real customer data, no network calls to real third parties in tests (mock Turnstile, email, Filebase unless the test is explicitly an integration test with dev credentials).

**E2E build ordering (learned 2026-11-19):** `pnpm test:e2e` starts `pnpm start`, which serves metadata baked into `.next` at build time, while the webServer env sets `SITE_ENV=staging`. Run `SITE_ENV=staging pnpm build` before `pnpm test:e2e` locally (CI does this automatically — it builds with `SITE_ENV=staging` first). A preceding `SITE_ENV=production pnpm build` makes the noindex E2E test fail even though the code is correct.

Mandatory tests that must never be deleted: limits parity, role matrix, pricing, public data exposure, edit isolation, photo encryption.

---

## 5. Device and browser matrix

| Target | Notes |
|---|---|
| Mid-range Android, Chrome | Primary. Real device if possible |
| iPhone, Safari | Check input zoom, safe areas, sticky bar |
| Desktop Chrome, Firefox, Safari, Edge | Latest stable |
| Screen reader | NVDA with Firefox or Chrome; VoiceOver on iOS |
| Viewports | 360, 390, 768, 1024, 1280 px |

---

## 6. Definition of done for a checkpoint

- [ ] Typecheck, lint, format, tests and (where relevant) build pass, with results recorded above
- [ ] New behaviour has tests; a bug fix has a regression test
- [ ] Accessibility check for UI changes; mobile at 360 px
- [ ] Docs updated (`AGENTS.md` section 7)
- [ ] No new lint or type suppressions without a written reason in the code and PROGRESS.md

---

## 7. Known issues and debt

Track in `docs/PROGRESS.md` (Known issues). Keep this section for quality-specific debt, for example suppressed rules, skipped tests (with reason and owner), and performance exceptions.

| # | Item | Reason | Owner | Review by |
|---|---|---|---|---|
| — | None yet | | | |
