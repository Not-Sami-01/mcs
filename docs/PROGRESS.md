# PROGRESS — Live State and Handoff

> **Read this first.** Update it continuously (see `AGENTS.md` section 3). If a session ends abruptly, the next agent starts from the **Resume here** block.

---

## Resume here

> Keep this block short and accurate. Rewrite it before starting each task and after finishing each step.

- **Last updated:** 2026-11-19
- **Current phase / checkpoint:** Phase 1, CP-1.1 in progress — users/roles half done (implemented and tested), Filebase media not started. CP-0.2 first-user creation remains unverified.
- **State of the repo:** branch `development`; latest checkpoint commit is `45563c5` (`cp-0.3`). Uncommitted: role-based users work + doc updates (see below).
- **What I was doing:** implemented `roles` on `users` + `src/access/roles.ts` helpers and tests; fixed three findings (type error, `access.admin` whole-panel lockout, bad `hasMany` `defaultValue`); regenerated Payload types and import map; ADR-012 recorded as Vercel.
- **Next step:** stage-review for secrets and commit this chunk (`feat(users): …`), then start Filebase media once the env details below are resolved.
- **Blockers:** **Filebase (CP-1.1 media):** `.env.local` has `FILEBASE_ENDPOINT=https://s3.filebase.io` but `FILEBASE_REGION` is empty and public/private buckets are both named `vaultifier` — need correct region and two distinct bucket names from the human. `@payloadcms/storage-s3@3.94.0` requires Node `^22.23.5` (installed 22.23.1) — resolve before adding it. Docker unavailable; CP-0.2 first-user unverified.
- **Uncommitted or half-done work:** `src/access/roles.ts(+test)`, `src/collections/Users.ts`, `src/payload.config.ts`, regenerated `src/payload-types.ts` + `src/app/(payload)/admin/importMap.js`, docs (PROGRESS/PLAN/DATABASE/DECISIONS/PROJECT/QUALITY). Checks at last run: `pnpm format:check && pnpm typecheck && pnpm lint && pnpm test` pass (8 tests); `SITE_ENV=production pnpm build` passes.

---

## Status snapshot

| Area | Status |
|---|---|
| Docs | CP-1.1 updates in progress (uncommitted): ADR-012 Vercel, users implemented, new gotchas |
| Repo scaffold | Implemented; frozen install, typecheck, lint, build, home/admin route and live DB health check verified; first user not created |
| Data model | `users` implemented (roles, access); other collections not started |
| Admin and roles | Roles + access helpers implemented with 8 unit tests; invite/2FA (CP-2.x) not started; media/Filebase not started |
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
| CP-0.3 | 2026-11-19 | `0d073dd` | `cp-0.3` | Frozen install, peers, format, typecheck, lint, 3 Vitest tests, 2 Playwright tests, production build and indexing/header smoke pass; audit reports 0 vulnerabilities | Committed on `development`; no remote configured |

---

## Open inputs from the client

Tracked in detail in `docs/DECISIONS.md` (section "Open questions"). Headlines:

- Brand files (logo, colours), phone and WhatsApp numbers, address, working hours
- Service list, starting prices, inspection fee, warranty terms
- Which products to list, and chemical licence and labelling rules
- What "Malaysian" means for MCS, with proof
- Launch cities (Lahore only or more)
- Domain name, hosting budget, who maintains the site, who answers live chat
- Old WordPress URL list (the site is down; start recovery now, see `docs/SEO.md`)

---

## Known issues

| # | Issue | Severity | Found in | Status |
|---|---|---|---|---|
| — | None yet | — | — | — |

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
