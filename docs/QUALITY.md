# QUALITY — Checks, Targets and Baseline

> Records **observed** results, not hopes. Re-run commands after dependency or source changes, and write the result here with the date. Nothing has been run yet.

---

## 1. Environment and versions (fill in at CP-0.2)

Do not rely on memory for versions. Query the registry or docs, then record.

| Item | Observed value | Date |
|---|---|---|
| Node.js | TBD | |
| pnpm | TBD | |
| Next.js | TBD | |
| React | TBD | |
| Payload and `@payloadcms/*` packages (all the same version) | TBD | |
| Tailwind CSS | TBD | |
| TypeScript | TBD | |
| PostgreSQL (local and production) | TBD | |
| ESLint, Prettier, Vitest, Playwright | TBD | |
| Starting commit | TBD | |
| Install command | `pnpm install --frozen-lockfile` | |

`.env` is gitignored. Do not copy values into any doc.

---

## 2. Check results

| Check | Command | Result | Date | Notes |
|---|---|---|---|---|
| Install | `pnpm install --frozen-lockfile` | Not run | | |
| Typecheck | `pnpm typecheck` | Not run | | |
| Lint | `pnpm lint` | Not run | | |
| Format | `pnpm format:check` | Not run | | |
| Unit and integration | `pnpm test` | Not run | | |
| E2E | `pnpm test:e2e` | Not run | | |
| Build | `pnpm build` | Not run | | |
| Dependency audit | `pnpm audit` | Not run | | |

CI runs the same commands with the same Node and pnpm versions.

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
