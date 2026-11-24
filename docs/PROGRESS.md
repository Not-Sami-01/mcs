# PROGRESS — Live State and Handoff

> **Read this first.** Update it continuously (see `AGENTS.md` section 3). If a session ends abruptly, the next agent starts from the **Resume here** block.

---

## Resume here

> Keep this block short and accurate. Rewrite it before starting each task and after finishing each step.

- **Last updated:** 2026-11-24
- **Current phase / checkpoint:** Phase 1 **COMPLETE** (CP-1.1 `8c18807`, CP-1.2 `20c85bb`, CP-1.3 `c5e542a`, tags `cp-1.1`–`cp-1.3`). **CP-2.1 COMPLETE** (2026-11-23, tag `cp-2.1`). **CP-2.2 COMPLETE** (2026-11-24, tag `cp-2.2`): TOTP two-factor login using the patched `@purposeinplay/payload-totp@0.5.1` (ADR-008), AES-256-GCM secrets at rest, 10 hashed recovery codes, forced setup for every role, a data-API guard for unenrolled staff, and a Super Admin re-enrol endpoint. Evidence: **93/93 tests across 15 suites**, staging build (7 static routes), E2E 3/3, live HTTP smoke (first-factor data API 403, setup 200, wrong code 422, correct code 200 + 10 recovery codes) and browser smoke (anonymous → login, enrolled+password → verify, unenrolled → setup).
- **Next:** **CP-2.3 — audit log and role tests.** Add the create-only `audit-logs` collection written by hooks (login, failed login, 2FA events, user changes, publish, delete, price change, export) and a generated role access matrix test from `docs/DATABASE.md` §4 (every role × collection × operation). Read `docs/SECURITY.md` C14 and `docs/DATABASE.md` §4. Consider making `/api/users/totp/reenroll` reachable from the admin UI while adding audit entries (the UI form is still pending, OPERATIONS runbook).
- **CP-0.2 first-user status (checked 2026-11-19):** the single user row (`admin@admin.admin`, created 2026-11-18) predates the roles system (shipped 2026-11-19) and has **no rows in `users_roles`** — it can sign in to the panel (entry is unrestricted by design, `docs/DATABASE.md` §4) but `hasAnyRole` fails, so it cannot write media or manage users. The bootstrap hook (`applyBootstrapRole`, unit-tested) only assigns `super-admin` on an unauthenticated create, which cannot happen while this user exists. **Open:** backfill this row's role, or reset and recreate the first user — destructive, human's call. `/admin/create-first-user` is no longer an option (CP-2.1 blocks it, 403). To recreate: remove the old row, then `SEED_ADMIN_EMAIL=<address> pnpm seed:admin`.
- **Environment incident (recurring):** system PostgreSQL 18 keeps taking port 5432 (known issue 4) and `mcs-db` stays stopped. CP-2.2 verification ran on scratch container `mcs-db-cp22` (`docker.io/library/postgres:16-alpine`, `127.0.0.1:55432`, database `mcs`). If it recurs: use that container, or permanently disable the system service then `podman start mcs-db`.
- **Blockers:** `@payloadcms/storage-s3@3.94.0` declares Node `^22.23.5` (installed 22.23.1) — installs and runs, but upgrade Node before deploy (gotcha 21). Filebase endpoint times out intermittently from this network (S3 clients retry `maxAttempts: 5`; gotcha 22 — Playwright's browser download also stalls here, use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/google-chrome` locally). Docker unavailable (podman used instead). CP-0.2 first-user role backfill open (above). Bucket still private — anonymous media URL 403/DNS, so `FILEBASE_PUBLIC_BASE_URL` stays empty (ADR-015 flip pending the human's Q13 action). A remote now exists (`origin`, GitHub) but the last CI run result has not been checked locally.

---

## Status snapshot

| Area | Status |
|---|---|
| Docs | Through CP-2.2; ADR-008 accepted, ADR-012 Vercel, ADR-015 delivery path, ADR-016 invites, `.env.example` guidance, single-bucket decision, gotchas 12/23/22/29–32 |
| Repo scaffold | Implemented; frozen install, typecheck, lint, build, home/admin route and live DB health check verified; first user row exists but has **no roles** (see Resume here) |
| Data model | `users`, `media`, `categories`, `pages` + globals `site-settings`, `navigation` + 14 blocks + 3 migrations (`20261119_101405_initial`, `20261119_171018_add_categories_and_pages`, `20261120_114629_add_globals`); other collections not started |
| Admin and roles | Roles + access helpers (unit tested); field-level access on both globals; media access enforced (anon create 403 in smoke); legal page publish gate; **CP-2.1 done**: no public sign up, first-register 403, `pnpm seed:admin`, 24 h invite links, lockout 5/15 min, 2 h sessions, CORS/CSRF allowlist, admin noindex. **CP-2.2 done**: TOTP enrolment/verify/recovery codes, encrypted secrets, forced setup, data-API guard, Super Admin re-enrol, patched plugin (ADR-008) |
| Seeds | `pnpm seed` (dev/staging only, production guard exit 1, idempotent, SAMPLE-marked) verified on a fresh DB; `pnpm seed:admin` implemented CP-2.1 (refuses if a Super Admin exists, 24 h invite) |
| Media and storage | Filebase S3 adapter live (upload/variants/alt/size-cap/round trip green); delivery path **decided** (ADR-015: Payload route now, direct Filebase URLs via `FILEBASE_PUBLIC_BASE_URL` when the bucket goes public); `/media-test` page + E2E 3/3 |
| Public site | Not started |
| Inline editing | Not started |
| Services, locations, products, blog | Not started |
| Leads and forms | Not started |
| SEO and analytics | Not started |
| QA, performance, security | CP-0.3 baseline implemented; **93 Vitest tests (15 suites)**, 3 Playwright E2E tests, dependency audit clean (re-run 2026-11-24: "No known vulnerabilities found") |
| Launch | Not started |

Phase progress lives in `docs/PLAN.md`. This table is a quick view only.

---

## Checkpoint log

Newest first. One row per checkpoint commit.

| Checkpoint | Date | Commit | Tag | Evidence (commands and results) | Notes |
|---|---|---|---|---|---|
| CP-2.2 | 2026-11-24 | `PENDING` | `cp-2.2` | format ✓ typecheck ✓ lint ✓ **93/93 Vitest across 15 suites** ✓ on fresh migrated scratch DB (all 4 migrations, including `20261123_105317`); `SITE_ENV=staging pnpm build` ✓ (7 static routes, proxy registered) + **E2E 3/3** ✓; `pnpm install --frozen-lockfile` ✓ with the patched plugin; `pnpm audit` clean; live HTTP smoke: password login 200, first-factor data API **403**, setup 200 + QR, wrong code **422**, correct code 200 + 10 recovery codes + rotated cookies, verified data API 200; browser smoke: anonymous → `/admin/login`, enrolled + password → `/admin/verify-totp`, unenrolled → `/admin/setup-totp`, cross-session verified cookie rejected | TOTP plugin (patched) per ADR-008; secrets AES-256-GCM; hashed recovery codes; force setup; data-API guard; Super Admin re-enrol; migration. Hash backfilled in the following `docs(progress)` commit |
| CP-2.1 | 2026-11-23 | `45856d1` | `cp-2.1` | format ✓ typecheck ✓ lint ✓ **88/88 Vitest across 14 suites** ✓ on scratch DB `mcs_cp21` (3 migrations applied first); **integration 6/6**: first-register path rejected, anonymous create rejected, bootstrap create works, invite sets a password once, Super-Admin-typed password discarded, lockout at the 5th failure (not the 4th); `SITE_ENV=staging pnpm build` ✓ (9 routes); smoke: `/admin/login` and `/admin` send `X-Robots-Tag: noindex, nofollow` + `Cache-Control: no-store`, `POST /api/users/first-register` **403**, anonymous `POST /api/users` **403**, foreign Origin gets no `Access-Control-Allow-Origin` while the allowlisted one does; `pnpm seed:admin` created the first Super Admin and a second run refused (exit 1). Hash backfilled in the following `docs(progress)` commit | Blocked public first-register at the hook level (Payload's endpoint bypasses access control), invite-only creates with a random password + 24 h one-time link, `pnpm seed:admin` (known issue 3 resolved), lockout/session/cookie hardening, CORS/CSRF allowlist, admin noindex. |
| CP-1.3 | 2026-11-21 | `c5e542a` | `cp-1.3` | format ✓ typecheck ✓ lint ✓ **69/69 Vitest across 10 suites** ✓; seed guards refuse production/unset env with **exit 1** (DB-free); fresh-DB scratch: 3 migrations apply in order → `pnpm seed` creates 1 SAMPLE category + 1 SAMPLE draft page → run 2 idempotent (counts stable 1/1) → globals untouched; global row lifecycle verified (reads create nothing, first save inserts, partial `site-settings` save rejected naming the 4 required fields); staging build 9 routes + **E2E 3/3** ✓; production build (`SITE_ENV=production`, `index, follow` in built HTML) + clean smoke: health/home/media-test/media-file 200, HSTS + `X-Frame-Options: DENY`, robots `Allow: /` + `/admin|/api|/edit` disallowed, anon `POST /api/pages` **403**, anon `POST /api/globals/navigation` **403**, anon global read 200 | Globals `site-settings`/`navigation` with field-level access (Editor = contact, Super Admin = chat/alerts/retention), idempotent SAMPLE-only `pnpm seed` with production guard, migration `20261120_114629_add_globals` (11 tables + 3 enums). This log row added in the follow-up `docs(progress)` commit because it needed the hash |
| CP-1.2 | 2026-11-19 | `20c85bb` | `cp-1.2` | format ✓ typecheck ✓ lint ✓ **51/51 Vitest across 7 suites** ✓; `pnpm build` (7 static routes) ✓; **E2E 3/3** ✓; integration test (`categories-pages.integration.test.ts`, 5/5) verifies categories hierarchy, blocks page, maxLength server rejection, slug validation, legal publish guard; migration `20261119_171018_add_categories_and_pages` generated | Categories and Pages collections, limits registry, field factories, 14 blocks, slug utilities and tests |
| CP-1.1 | 2026-11-19 | `8c18807` | `cp-1.1` | format ✓ typecheck ✓ lint ✓ **19/19 Vitest** ✓; `SITE_ENV=staging pnpm build` (7 static routes incl. `/media-test`, built HTML has the image URL, 3-variant `srcSet`, alt) + **E2E 3/3** (image `naturalWidth > 0` poll); `pnpm build` + production smoke (health/media-test/list/file 200, anon `POST` **403**); CI sequence simulated on an empty scratch DB (migrate 10 tables → build → empty-state HTML); initial migration verified twice on empty DBs | Committed on `development`; no remote configured. Users (`40953fe`) and media (`5e5a1a0`) landed as separate feature commits; this commit is the spike decision (ADR-015), the `generateFileURL` flip, `/media-test` + e2e, the first migration and the CI migrate step. This row was added in the immediately following `docs(progress)` commit because it needed the hash |
| CP-0.3 | 2026-11-19 | `45563c5` | `cp-0.3` | Frozen install, peers, format, typecheck, lint, 3 Vitest tests, 2 Playwright tests, production build and indexing/header smoke pass; audit reports 0 vulnerabilities | Committed on `development`; no remote configured. Hash is the amended commit (docs previously recorded the pre-amend `0d073dd`) |

---

## Open inputs from the client

Tracked in detail in `docs/DECISIONS.md` (section "Open questions"). Headlines:

- Brand files (logo, colours), phone and WhatsApp numbers, address, working hours
- Service list, starting prices, inspection fee, warranty terms
- Which products to list, and chemical licence and labelling rules
- What "Malaysian" means for MCS, with proof
- Launch cities (Lahore only or more)
- Domain name, who maintains the site, who answers live chat (hosting: decided — Vercel, ADR-012)
- Old WordPress URL list (the site is down; start recovery now, see `docs/SEO.md`)

---

## Known issues

| # | Issue | Severity | Found in | Status |
|---|---|---|---|---|
| 1 | `@payloadcms/storage-s3@3.94.0` declares Node engines `^22.23.5 \|\| ^24.22.3 \|\| >=26.13.1`; installed Node is 22.23.1 (CI too). pnpm installs and tests pass regardless. | Low (deploy risk) | CP-1.1, 2026-11-19 | Open — upgrade Node to ≥22.23.5 before the first Vercel deploy. **Mitigation available:** podman image `node:22-bookworm` (v22.23.5) pulled 2026-11-21 for container runs |
| 2 | Filebase endpoint intermittently unreachable from this network (`ETIMEDOUT` on IPv4, `ENETUNREACH` on IPv6); can fail the Filebase integration test alone. | Low | CP-1.1, 2026-11-19 | Mitigated: S3 clients retry `maxAttempts: 5`; re-run the test before treating a failure as a regression. Same flakiness stalls `podman pull`/Playwright downloads — retry |
| 3 | `pnpm seed:admin` is documented (AGENTS §9, DATABASE §6, README quickstart) but no such script exists in `package.json`. | Low (docs drift) | CP-1.3, 2026-11-21 | **Resolved CP-2.1, 2026-11-23** — `src/seed/admin.ts` + `admin-cli.ts`, script added; first Super Admin no longer depends on the public first-register screen |
| 4 | System PostgreSQL 18 re-enables itself (reboot/upgrade) and takes port 5432, breaking every DB test with `password authentication failed for user "mcs"` — `mcs-db` cannot bind. Recurred 2026-11-21 and 2026-11-23. | Medium (blocks all DB work) | CP-1.3, 2026-11-21 | Open until the human permanently disables the system service: `sudo systemctl stop postgresql-18 && sudo systemctl disable postgresql-18`, then `podman start mcs-db`. Workaround used 2026-11-23: scratch podman container `mcs-db-cp21` on 127.0.0.1:55432 |

---

## Session log

Newest first. Add an entry at the end of each session, even a short one.

### 2026-11-24 — CP-2.2 two-factor login

- **Spike (ADR-008):** chose `@purposeinplay/payload-totp@0.5.1` over a custom TOTP step. It provides enrolment (QR + manual key), verification, 10 hashed recovery codes, attempt locking, admin guards and REST/GraphQL enforcement; a custom build would duplicate security-sensitive code. Two incompatibilities with installed Payload 3.94 were found and fixed with a pinned pnpm patch: its rotated JWT lacked the `authVersion: 1` protected header (Payload rejects it) and its cookie was 7-day `SameSite=Lax` (now 2-hour `Strict`, matching CP-2.1).
- **Enforcement:** `TOTPGuard`/`TOTPGate` (`forceSetup`) in `src/app/(payload)/layout.tsx`; `src/proxy.ts` runs the plugin middleware and sets the `x-pathname` header it needs; `src/auth/totp-setup-guard.ts` refuses every data-API operation for an authenticated unenrolled user except the auth handshake. The plugin's `beforeOperation` hook refuses a session without the matching verified cookie. `src/auth/totp.ts` adds `POST /api/users/totp/reenroll` because the plugin's disable endpoint checks for a role literally named `admin`.
- **Schema:** migration `20261123_105317` (`users.totp_enabled/secret/last_counter`, `users_totp_backup_codes`, `payload_totp_rate_limits`). `TOTP_ENCRYPTION_KEY` must be exactly 64 hex characters; `.env.example` and CI carry a placeholder.
- **Tests:** `src/auth/totp.integration.test.ts` 5/5 (ciphertext at rest, first-factor data-API refusal, pre-enrolment gate, one-time recovery code, Super Admin re-enrol). Existing access tests now act as enrolled staff. Full suite **93/93 across 15 files**; staging build; E2E 3/3; frozen install with the patch; audit clean.
- **Live smoke:** a fresh migrated scratch DB, `next start`, and both HTTP and headless Chrome. Password-only sessions are denied on the data API (403) and redirected in the browser (enrolled → `/admin/verify-totp`, unenrolled → `/admin/setup-totp`); anonymous `/admin` → `/admin/login`. Setup returns a QR, a wrong code is 422, the correct code returns 10 recovery codes and rotated cookies, and a verified session reaches the admin and data API. A verified cookie copied onto a different session is rejected.
- **Environment:** system PostgreSQL 18 held 5432 again (known issue 4); all verification ran on scratch container `mcs-db-cp22` on `127.0.0.1:55432`. The temporary smoke scripts were deleted.

### 2026-11-23 — CP-2.1 invite-only accounts and lockout

- **Registration:** Payload's `/api/users/first-register` calls `payload.create({ overrideAccess: true })` (gotcha 26), so `access.create` was not enough. `src/access/first-user.ts` now rejects every unauthenticated create in `beforeChange` unless the Local-API context flag `allowFirstUserBootstrap` is set (only `pnpm seed:admin` sets it). `pnpm seed:admin` (`src/seed/admin.ts`, `src/seed/admin-cli.ts`) creates the first Super Admin, refuses a second one or a taken email, and issues a 24 h invite.
- **Invites (ADR-016):** `src/auth/invites.ts` generates a Payload reset token (`forgotPassword`, 24 h, 60 s minimum interval), builds `/admin/reset/<token>` from `NEXT_PUBLIC_SITE_URL`, and sends our own email. Payload requires a password on auth-user create (gotcha 27), so the hook overwrites whatever a Super Admin typed with a random 32-byte secret; the link is the only way in. The console adapter logs only the subject (gotcha 28), so the link is also logged when `EMAIL_PROVIDER=console` and not production.
- **Auth hardening:** `maxLoginAttempts: 5`, `lockTime: 15 min`, `tokenExpiration: 2 h`, `SameSite=Strict`, `Secure` only when `SITE_ENV=production`; `serverURL`, `cors` and `csrf` now come from `NEXT_PUBLIC_SITE_URL` (plus localhost 3000 outside production), no wildcard.
- **Noindex:** `X-Robots-Tag: noindex, nofollow` on `/admin/:path*` in every environment, plus `robots: { index: false }` in the admin metadata. `/robots.txt` already disallows `/admin`.
- **Evidence:** 88/88 tests, integration 6/6, staging build 9 routes, live smoke with 403s and CORS headers, `pnpm seed:admin` twice (success then refusal).
- **Environment:** system PostgreSQL 18 still holds 5432 and `mcs-db` is down (known issue 4 recurred). Verification ran against a scratch podman container `mcs-db-cp21` on port 55432; 3 migrations applied there first. The human should disable the system service and `podman start mcs-db` again.

### 2026-11-21 — CP-1.3 site settings, navigation globals and seed

- **Globals:** `src/globals/SiteSettings.ts` (company name, phones, WhatsApp, email, address, hours, timezone, social links, chat/alerts, retention) and `src/globals/Navigation.ts` (header items + children, header buttons, footer columns/links, legal links) with **field-level access** — Editor edits contact fields, Super Admin alone edits chat/alerts/retention. Registered via `src/globals/index.ts`.
- **Seed:** `src/seed/` (`cli.ts`, `guard.ts`, `index.ts`, `content.ts` + tests) behind `pnpm seed`. Guard refuses production (`SITE_ENV`/`NODE_ENV`) and unset env with **exit 1**; content is SAMPLE-marked and idempotent ("already exists; leaving it unchanged"); globals are never touched.
- **Migration:** `20261120_114629_add_globals` — 11 `CREATE TABLE` + 3 enums; verified on a fresh scratch DB together with the two earlier migrations (all apply in order).
- **Review fixes this session:** duplicate `emailAddress` row removed from `docs/CONTENT.md` §5; **false row-lifecycle claim corrected in `docs/DATABASE.md`** — reads create *nothing* (verified: `navigation.headerItems` → `[]`, 0 rows); only the first save inserts a row; the first `site-settings` save must supply the four `NOT NULL` contact fields or validation names them. Stray `writeContentExceptLegal` removed from `src/access/roles.ts`; `src/seed/probe.ts` deleted after use; a stale copy of this session's pre-CP-1.2 `Categories.ts`/`Pages.ts` drafts was restored from HEAD (`git checkout --`).
- **Evidence:** format ✓ typecheck ✓ lint ✓ **69/69 Vitest across 10 suites** ✓ (Filebase suite failed twice on gotcha 22 `ETIMEDOUT`/`ENETUNREACH`, isolated re-run 5/5, then full suite green); fresh-DB seed proof (1 SAMPLE category + 1 SAMPLE draft page, idempotent re-run, 0 globals rows, scratch dropped); staging build 9 routes + **E2E 3/3** ✓; production build (`SITE_ENV=production`, `index, follow` in built HTML) + clean smoke: health/home/media-test/media-file 200, HSTS + `X-Frame-Options: DENY`, robots `Allow: /` + `/admin|/api|/edit` disallowed, anon `POST /api/pages` **403**, anon `POST /api/globals/navigation` **403**, anon global read 200 (public by design).
- **Gotchas hit:** (a) `pkill -f` patterns appear in the smoke script's own command line — use `next[-]server`/`next[ ]start` bracket patterns or the shell kills itself (exit 143); (b) a surviving `next start` from a previous run keeps port 3000 and serves a stale `.next` — kill it before re-smoking (an old noindex build caused a confusing "still noindex" reading); (c) building without `SITE_ENV=production` bakes `noindex, nofollow` (OPERATIONS warning is real).
- **Environment:** podman image `node:22-bookworm` pulled (v22.23.5, satisfies engines — known issue 1 mitigation for container runs). System PostgreSQL 18 took 5432 again mid-session; the human restarted `mcs-db` and 78 tables were verified.

### 2026-11-19 — CP-1.2 limits registry, categories, pages and blocks

- **Limits & field factories:** `src/cms/limits.ts` text and count presets aligned with `docs/CONTENT.md` §5; `src/cms/fields.ts` factories (`textField`, `textareaField`, `rows`, `seoGroup`, `slugField`, `actionFields`) enforce caps.
- **Slug validation:** `src/cms/slugs.ts` rejects unnormalized slugs (uppercase, spaces, slashes, dots), reserved slugs (`admin`, `api`, `edit`, `_next`, etc.), and caps length at 80 characters.
- **Collections & blocks:** `categories` collection with hierarchical parent path calculation and loop detection; `pages` collection with block-based layout (14 blocks in catalogue), versions, drafts, trash, and legal page publish guard (super-admin only).
- **Testing & Verification:**
  - `src/cms/config.test.ts` (22 tests) walks every collection and block ensuring text fields have `maxLength` and lists have bounded rows.
  - `src/collections/categories-pages.integration.test.ts` (5 tests) verifies parent-child category path calculation, page with blocks path resolution, server-side `maxLength` rejection, slug validation rejection, and legal page publish security.
  - All 51/51 Vitest tests across 7 suites pass (including Filebase S3 round-trip).
  - Next.js 16 production build compiles cleanly (7/7 static routes).
  - Playwright E2E 3/3 pass (`tests/e2e/security.spec.ts` and `tests/e2e/media-test.spec.ts`).
  - Migration created: `src/migrations/20261119_171018_add_categories_and_pages.ts`.
  - Typecheck (`tsc --noEmit`), lint (`eslint .`), and Prettier check (`format:check`) all 100% clean.

### 2026-11-17 — Planning session

- Read `MCS_Website_Requirements.docx` (7 Nov 2026) and reviewed https://apexcore.pk/ for structure.
- Chose Payload CMS 3 embedded in Next.js (the requirements recommend it), PostgreSQL, Filebase.
- Verified: Filebase IPFS buckets expose every object through its CID even when the bucket is private. Customer uploads must be encrypted. See `docs/STORAGE.md`.
- Verified: Payload has no built-in two-factor login. Community plugins exist. Needs a spike in CP-2.2.
- Wrote all docs in this folder.
- Not seen: the "detailed 17 page version" of the requirements. Ask the client if more depth is needed.

### 2026-11-19 — Scaffold verification

- Found CP-0.2 scaffold files already present but untracked; corrected the stale docs-only handoff. Kept all existing files.
- Queried npm registry with `pnpm view`: latest stable at this check was Next.js 16.4.6, Payload 3.94.0, Tailwind CSS 4.3.5 and React 19.3.1. Runtime: Node 22.23.1, pnpm 12.18.0.
- `pnpm install --frozen-lockfile`: pass after approving the required native dependency build scripts. Moved build approvals to pnpm 12's `pnpm-workspace.yaml` configuration; removed obsolete `package.json` pnpm setting.
- `pnpm typecheck`: pass. `pnpm lint`: pass after replacing deprecated `FlatCompat` config with Next 16 native flat configs and fixing the internal `/admin` link to use `next/link`. `pnpm build`: pass; routes include `/`, Payload admin/API handlers and `/api/health`.
- Updated `/api/health` to match `docs/API.md`: minimal `{ ok }`, 200 when the DB ping succeeds, 503 otherwise, no-store. Database result not runtime-tested.
- Docker and `pg_isready` are unavailable, but a local PostgreSQL was reachable through the pre-existing ignored `.env` configuration (values intentionally not recorded). `/api/health` returned 200 and `{"ok":true}`. `/` returned 200; `/admin/login` and `/admin/create-first-user` returned 200. No first user was created because no account identity was supplied.
- Payload emitted its documented local fallback warning that, without an email adapter, email is written to the console. Do not use this for real staff invitations or password resets; email provider selection remains open.
- `pnpm test`/`pnpm test:e2e` do not exist until CP-0.3. CP-0.2 remains partly complete only for the first-user creation criteria. No checkpoint commit/tag; next: first-user verification as appropriate, then CP-0.3.

### 2026-11-19 — CP-0.3 tooling and verification

- Added Prettier 3.10.1, Playwright 1.65.1, Vitest, quality scripts, browser smoke tests, and a GitHub Actions workflow. Vitest is 4.1.12; patched pnpm workspace overrides pin DOMPurify 3.4.18, Happy DOM 21.0.4, esbuild 0.28.2 and Tinypool 2.2.0.
- Added tested `SITE_ENV` helpers: only production indexes; missing/invalid values default to development. Added `robots.txt`, response security headers, non-production `X-Robots-Tag`, and no-store headers for admin/edit routes.
- Verification passed: frozen install, `pnpm peers check`, `pnpm audit` (0 advisories), format, typecheck, lint, unit tests (3), E2E browser tests (2) using system Chrome, and `SITE_ENV=production pnpm build`.
- Production smoke: home returned 200 with `index, follow`, HSTS, nosniff, referrer, permissions, frame and CSP report-only headers; `/robots.txt` allowed `/` and disallowed `/admin`, `/api`, `/edit`; `/admin` returned `Cache-Control: no-store`.
- No first admin account was created; no client identity was provided. CP-0.2 remains partially complete for that criterion. CP-0.3 does not depend on first-user creation. Commit `0d073dd` and tag `cp-0.3` created; working tree clean.

### 2026-11-19 — CP-1.1 users/roles + Filebase media

- **Users/roles** (committed as `40953fe`): four roles, `src/access/roles.ts` helpers + tests, bootstrap first-super-admin hook. Fixed during review: `users.access.admin` would have locked all non-super-admins out of the whole admin panel (removed); `defaultValue: 'super-admin'` on a `hasMany` select was wrong type and a privilege foot-gun (removed); regenerated the Payload import map (runtime `PayloadComponent not found` warnings). ADR-012 recorded as Vercel with its constraints.
- **Filebase facts** (human + current docs, 2026-11-19): endpoint `https://s3.filebase.io`, region `auto`, **one public bucket `vaultifier`** (two-bucket plan dropped). `.env.example` rewritten with per-variable comments; `.env.local` region/bucket names fixed (its empty `DATABASE_URL=`/`PAYLOAD_SECRET=` lines were clobbering `.env` — removed).
- **Media** (this chunk): `@payloadcms/storage-s3` added (engines say Node ≥22.23.5, installed 22.23.1 — known issue 1), `media` collection with `media/` prefix, WebP + AVIF variants, required `alt`, `src/cms/limits.ts` registry started, server-side size cap. Payload quirks found: `req.file.size` becomes `undefined` for non-images (measure `file.data.length`); `ValidationError` surfaces as "field is invalid" with details in `error.data.errors`.
- **Evidence:** format/typecheck/lint pass; `pnpm test` 16/16 (Filebase round trip 5/5 twice — upload, byte-identical S3 read-back, delete, alt enforcement, 11 MB PDF rejected); staging build + E2E 2/2; production build pass; smoke: `GET /api/media` 200 (public read), anon `POST` 403. One leftover test PDF from a pre-fix run was deleted and verified gone (0 media docs).
- **Still open for CP-1.1:** delivery-path spike (PLAN item 4) and an uploaded image on a test page (exit criterion). Next: commit, then the spike.

### 2026-11-19 — CP-1.1 delivery path, test page, first migration

- **Delivery-path spike:** probed all five paths (`docs/STORAGE.md` §4, ADR-015): signed Filebase GET **200** (12 953 B), anonymous 403/DNS-000 (bucket still private), Payload media route 200 but no `Cache-Control`, Next optimizer 400 on `?prefix=media` (default `localPatterns` exact-`search` match — gotcha 23), IPFS gateway unreachable (no CID in headers). Decision: launch via direct `https://<bucket>.s3.filebase.io/<key>` once public (env-only flip), Payload route until then, no Next optimizer.
- **Flip implemented:** `src/cms/media-urls.ts` `publicFileUrl` + 3 unit tests; `payload.config.ts` passes `generateFileURL` only when `FILEBASE_PUBLIC_BASE_URL` is set. `.env.local` had the wrong value (`https://s3.filebase.io`, the API endpoint) — corrected to empty; `.env.example` documents the flip + verification curl.
- **First migration:** `src/migrations/20261119_101405_initial` (10 CREATE TABLE / 10 DROP, `index.ts`), created with `payload migrate:create --force-accept-warning`, verified on two empty scratch DBs; CI now runs `pnpm payload migrate` before `pnpm build` (schema push never happens in production, and the integration suite is `skipIf`-gated in CI, so nothing else creates the schema there).
- **Exit criterion:** `src/app/(frontend)/media-test/page.tsx` (static, noindex) renders doc 12 with alt, 3-variant WebP srcset, variant table and delivery-path indicator; empty-library notice for CI. E2E `tests/e2e/media-test.spec.ts` asserts `naturalWidth > 0`.
- **Evidence:** format ✓ typecheck ✓ lint ✓ **19/19 tests** ✓ staging build (built HTML has `src="/api/media/file/cp11-test-image.png?prefix=media"` + srcSet) + **E2E 3/3** ✓ production build + smoke (health/media-test/list/file 200, anon POST **403**) ✓ CI sequence simulated on an empty scratch DB (migrate → build → empty-state HTML, 0 `<img>`) ✓. Gotcha: generated files (`payload-types.ts`, `importMap.js`, `src/migrations/`, `pnpm-lock.yaml`) excluded from format/lint so regeneration can't break the gate.
- **Incident:** machine reboot wiped Playwright's browser cache and system PostgreSQL took 5432; human disabled it, `podman start mcs-db` restored the DB (data verified: doc 12, 1 user, 10 tables), and local E2E runs on `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/google-chrome`.
- **CP-0.2 honesty check:** user 1 (`admin@admin.admin`) has **no role rows** — it predates the roles system, and the bootstrap hook can't run while it exists. Recorded in the Resume block as an open decision for the human.

---

## Handoff template

Copy this into the session log when you must stop mid-task.

```md
### YYYY-MM-DD HH:MM — Handoff (stopped early: tokens / context / blocked)

- **Task in progress:** <PLAN checkpoint and item>
- **Done so far:** <files and behaviour, with evidence>
- **Half-done (uncommitted or wip commit):** <files, what is missing, how to finish>
- **Exact next step:** <one concrete action>
- **Commands to verify:** <commands and expected result>
- **Gotchas discovered:** <or "none"; also copy to PROJECT.md Gotchas>
- **Decisions made but not yet in DECISIONS.md:** <or "none">
```
