# PROGRESS — Live State and Handoff

> **Read this first.** Update it continuously (see `AGENTS.md` section 3). If a session ends abruptly, the next agent starts from the **Resume here** block.

---

## Resume here

> Keep this block short and accurate. Rewrite it before starting each task and after finishing each step.

- **Last updated:** 2026-11-19
- **Current phase / checkpoint:** Phase 1, CP-1.1 — all exit criteria **verified**: image on `/media-test` ✓ (E2E polls `naturalWidth > 0`, 3/3 pass), alt enforced ✓ (integration test rejects upload without alt), delivery path decided ✓ (ADR-015). Checks green: format ✓ typecheck ✓ lint ✓ **19/19 tests** ✓ staging build + E2E 3/3 ✓ production build + smoke ✓ CI sequence simulated on an empty DB ✓. **Only remaining: commit `checkpoint(CP-1.1): …` and tag `cp-1.1`.**
- **State of the repo:** branch `development`; commits `45563c5` (`cp-0.3`), `40953fe` (users), `5e5a1a0` (media). Everything CP-1.1-chunk-3 is uncommitted: spike docs + gotcha 23, `generateFileURL` flip (`src/payload.config.ts`, `src/cms/media-urls.*`), `/media-test` page + `tests/e2e/media-test.spec.ts`, first migration `src/migrations/20261119_101405_initial` + CI `payload migrate` step, `.prettierignore`/eslint generated-file exclusions, `.env.example`/`.env.local` (`FILEBASE_PUBLIC_BASE_URL` corrected to empty — it held the S3 API endpoint, not a delivery origin).
- **What I was doing:** finished CP-1.1 verification end to end (checks, staging build + E2E 3/3, production build + smoke, CI sequence simulated on an empty DB) and recorded the evidence in QUALITY/STORAGE/DATABASE/OPERATIONS.
- **Next step:** `git add -A`, read `git diff --staged` for secrets, commit `checkpoint(CP-1.1): delivery path decision, media test page and initial migration`, add the checkpoint-log row with the hash (amend), tag `cp-1.1`, report to the human. Then CP-1.2 per PLAN.
- **CP-0.2 first-user status (checked 2026-11-19):** the single user row (`admin@admin.admin`, created 2026-11-18) predates the roles system (shipped 2026-11-19) and has **no rows in `users_roles`** — it can sign in to the panel (entry is unrestricted by design, `docs/DATABASE.md` §4) but `hasAnyRole` fails, so it cannot write media or manage users. The bootstrap hook (`applyBootstrapRole`, unit-tested) only assigns `super-admin` on an unauthenticated create, which cannot happen while this user exists. **Open:** backfill this row's role or reset and recreate the first user (`pnpm seed:admin` / `/admin/create-first-user`) — destructive, human's call.
- **Environment incident (2026-11-19, resolved):** machine rebooted mid-session; system PostgreSQL 18 (human's install from earlier that day) took port 5432 and the rootless podman container `mcs-db` (our dev DB) could not start. The human disabled the system service; `podman start mcs-db` restored everything — verified media doc 12, 1 user, all 10 tables. If it recurs: free 5432, then `podman start mcs-db`.
- **Blockers:** `@payloadcms/storage-s3@3.94.0` declares Node `^22.23.5` (installed 22.23.1) — installs and runs, but upgrade Node before deploy (gotcha 21). Filebase endpoint times out intermittently from this network (S3 clients retry `maxAttempts: 5`; gotcha 22 — Playwright's browser download also stalls here, use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/google-chrome` locally). Docker unavailable (podman used instead). CP-0.2 first-user role backfill open (above). Bucket still private — anonymous media URL 403/DNS, so `FILEBASE_PUBLIC_BASE_URL` stays empty (ADR-015 flip pending the human's Q13 action). No remote → CI has never actually run.

---

## Status snapshot

| Area | Status |
|---|---|
| Docs | CP-1.1 updates uncommitted: ADR-012 Vercel, ADR-015 delivery path, `.env.example` guidance, single-bucket decision, gotchas 12/23 |
| Repo scaffold | Implemented; frozen install, typecheck, lint, build, home/admin route and live DB health check verified; first user row exists but has **no roles** (see Resume here) |
| Data model | `users` (roles, access) and `media` implemented + first migration `20261119_101405_initial` (CI/production); other collections not started |
| Admin and roles | Roles + access helpers (unit tested); media access enforced (anon create 403 in smoke); invite/2FA (CP-2.x) not started |
| Media and storage | Filebase S3 adapter live (upload/variants/alt/size-cap/round trip green); delivery path **decided** (ADR-015: Payload route now, direct Filebase URLs via `FILEBASE_PUBLIC_BASE_URL` when the bucket goes public); `/media-test` page + E2E 3/3 |
| Public site | Not started |
| Inline editing | Not started |
| Services, locations, products, blog | Not started |
| Leads and forms | Not started |
| SEO and analytics | Not started |
| QA, performance, security | CP-0.3 baseline implemented; dependency audit clean |
| Launch | Not started |

Phase progress lives in `docs/PLAN.md`. This table is a quick view only.

---

## Checkpoint log

Newest first. One row per checkpoint commit.

| Checkpoint | Date | Commit | Tag | Evidence (commands and results) | Notes |
|---|---|---|---|---|---|
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
| 1 | `@payloadcms/storage-s3@3.94.0` declares Node engines `^22.23.5 \|\| ^24.22.3 \|\| >=26.13.1`; installed Node is 22.23.1 (CI too). pnpm installs and tests pass regardless. | Low (deploy risk) | CP-1.1, 2026-11-19 | Open — upgrade Node to ≥22.23.5 before the first Vercel deploy |
| 2 | Filebase endpoint intermittently unreachable from this network (`ETIMEDOUT` on IPv4, `ENETUNREACH` on IPv6); can fail the Filebase integration test alone. | Low | CP-1.1, 2026-11-19 | Mitigated: S3 clients retry `maxAttempts: 5`; re-run the test before treating a failure as a regression |

---

## Session log

Newest first. Add an entry at the end of each session, even a short one.

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
