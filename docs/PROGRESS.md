# PROGRESS — Live State and Handoff

> **Read this first.** Update it continuously (see `AGENTS.md` section 3). If a session ends abruptly, the next agent starts from the **Resume here** block.

---

## Resume here

> Keep this block short and accurate. Rewrite it before starting each task and after finishing each step.

- **Last updated:** 2026-11-19
- **Current phase / checkpoint:** Phase 1, CP-1.1 — users ✓, Filebase media ✓ implemented and verified; **remaining: delivery-path spike + image on a test page** (exit criteria). CP-0.2 first-user creation remains unverified.
- **State of the repo:** branch `development`; latest checkpoint commit `45563c5` (`cp-0.3`). Uncommitted: the media/Filebase chunk below.
- **What I was doing:** added the `media` collection (S3 adapter → bucket `vaultifier`, prefix `media/`), `src/cms/limits.ts`, size/alt enforcement, a 5-test Filebase integration round trip (upload → byte-identical read → delete), ADR-012 = Vercel, commented `.env.example`.
- **Next step:** stage-review for secrets and commit (`feat(media): …`), then the delivery-path spike (CP-1.1 item 4) and a test page showing an uploaded image.
- **Blockers:** `@payloadcms/storage-s3@3.94.0` declares Node `^22.23.5` (installed 22.23.1) — installs and runs, but upgrade Node before deploy (gotcha 21). Filebase endpoint times out intermittently from this network (S3 clients retry `maxAttempts: 5`; gotcha 22). Docker unavailable; CP-0.2 first-user unverified.
- **Uncommitted or half-done work:** this media chunk — `src/cms/limits.ts`, `src/collections/Media.ts`, `src/collections/media.integration.test.ts`, access helpers, `payload.config.ts`, `.env.example`, `ci.yml` placeholders, lockfile (`@payloadcms/storage-s3` + `@aws-sdk/client-s3` devDep), regenerated types/importMap, docs. Last full run: format ✓ typecheck ✓ lint ✓ **16/16 tests** (incl. live Filebase round trip ×2) staging build ✓ E2E 2/2 ✓ production build ✓ smoke: `GET /api/media` 200, anon `POST` 403.

---

## Status snapshot

| Area | Status |
|---|---|
| Docs | CP-1.1 updates in progress (uncommitted): ADR-012 Vercel, `.env.example` guidance, single-bucket decision, new gotchas |
| Repo scaffold | Implemented; frozen install, typecheck, lint, build, home/admin route and live DB health check verified; first user not created |
| Data model | `users` (roles, access) and `media` implemented; other collections not started |
| Admin and roles | Roles + access helpers (11 unit tests); media access enforced (anon create 403 in smoke); invite/2FA (CP-2.x) not started |
| Media and storage | Filebase S3 adapter live: upload/variants/alt/size-cap/round-trip test green; delivery-path spike and test page pending |
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
