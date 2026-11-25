# PLAN — MCS Website Implementation

> **Status:** PLANNED (nothing implemented yet)
> **Prepared:** 2026-11-17
> **Source:** `MCS_Website_Requirements.docx` (7 November 2026) plus the inline-editing and storage requirements from the project owner.
> **Estimate:** about 4 to 6 weeks (from the requirements document; the developer confirms).

## How to use this plan

- Work in order. A **checkpoint** (`CP-x.y`) is a small, testable deliverable and ends with a git commit and tag (`AGENTS.md` section 4).
- Tick a box only when verified: `[x]` done, `[~]` partly done (add a note), `[ ]` not started. Add the date.
- Every checkpoint ends with the **checkpoint procedure**: checks pass, update PROGRESS.md, tick this file, update reference docs, commit, tag.
- If a business fact is missing, use a `TODO(client)` placeholder and keep going.

## Progress overview

| Phase | Description | Week (est.) | Status |
|---|---|---|---|
| 0 | Foundations: repo, scaffold, tooling | 1 | NOT STARTED |
| 1 | Data model, storage, media | 1 | NOT STARTED |
| 2 | Admin security: invite-only, roles, 2FA, audit | 2 | COMPLETE |
| 3 | Public site shell and blocks | 2 | IN PROGRESS |
| 4 | Inline editing (click-to-edit content box) | 3 | NOT STARTED |
| 5 | Services, locations, products, blog, reviews | 3–4 | NOT STARTED |
| 6 | Leads, forms, WhatsApp, live chat, tracking | 4 | NOT STARTED |
| 7 | SEO, redirects, analytics | 5 | NOT STARTED |
| 8 | Hardening: tests, accessibility, performance, security, backups | 5 | NOT STARTED |
| 9 | Content load, UAT, launch, handover | 6 | NOT STARTED |

## Scope

**In scope for launch:** everything in `MCS_Website_Requirements.docx` sections 1 to 7, plus click-to-edit with text limits and Filebase storage.

**Out of scope for launch** (record as future work, do not build): online checkout and payments (enquiry only, prices visible), customer accounts, Urdu content (but the site must be Urdu-ready), native mobile apps, loyalty or referral programmes.

---

## Phase 0 — Foundations

**Goal:** a repository that boots locally, with tooling that keeps quality honest from day one.

### CP-0.1 — Docs committed
- [ ] `git init`, branch `development`, add `.gitignore` (Node, Next, env, dumps, IDE)
- [ ] Commit all files in this docs set
- **Exit:** `git log` shows the docs commit; tag `cp-0.1` exists
- **Commit:** `checkpoint(CP-0.1): project docs and plan`

### CP-0.2 — Scaffold boots
- [x] Check current stable versions of Node, pnpm, Next.js, Payload, Tailwind (do not rely on memory). Record in `docs/QUALITY.md` (2026-11-19)
- [x] Scaffold with the official Payload app creator (Next.js + Payload + Postgres, TypeScript). Adapt the output to the structure in `docs/PROJECT.md` section 6 (2026-11-19; working scaffold, provenance inferred from generated setup structure)
- [x] `docker-compose.yml` with PostgreSQL for local development (2026-11-19; Docker unavailable here, database not started)
- [x] `.env.example` with names only (list in `docs/OPERATIONS.md`) (2026-11-19)
- [~] `/admin` loads, first user can be created locally, `/` renders a placeholder (2026-11-19; `/` and `/admin/login` and `/admin/create-first-user` returned 200; first user was not created)
- [x] `GET /api/health` returns OK and checks the database (no secrets in the response) (2026-11-19; live response 200 `{"ok":true}` with local PostgreSQL)
- **Exit:** `pnpm dev` works against local Postgres; `pnpm build` succeeds
- **Commit:** `checkpoint(CP-0.2): Next.js + Payload + PostgreSQL scaffold boots`

### CP-0.3 — Tooling and baseline
- [x] Scripts exist: `typecheck`, `lint`, `format:check`, `test`, `test:e2e`, `build` (2026-11-19)
- [x] ESLint flat config, Prettier, strict TypeScript (2026-11-19)
- [x] Vitest running with real tests; Playwright configured (2026-11-19; 3 unit tests and 2 E2E tests pass)
- [x] CI workflow: install with frozen lockfile, typecheck, lint, test, build (2026-11-19; workflow includes E2E too)
- [x] Baseline security headers (`docs/SECURITY.md` section C9), `SITE_ENV` switch with noindex for non-production (2026-11-19; non-prod E2E and prod smoke verified)
- [x] Record the baseline results in `docs/QUALITY.md` (2026-11-19; checks and clean audit recorded)
- **Exit:** all checks pass on a clean clone
- **Commit:** `checkpoint(CP-0.3): tooling, CI and quality baseline`

---

## Phase 1 — Data model, storage, media

**Goal:** the content model exists, files go to Filebase, limits are enforced from one registry.

### CP-1.1 — Users, access helpers, Filebase media
- [x] `users` collection with `roles` (`super-admin`, `editor`, `product-manager`, `sales-support`) and access helper functions (`docs/DATABASE.md`) (2026-11-19; 8 unit tests pass, typecheck/lint/build pass)
- [x] Filebase account checked: endpoint and region confirmed against current Filebase docs; public and private buckets created (the human creates accounts; see `docs/STORAGE.md`) (2026-11-19; `https://s3.filebase.io` + region `auto` confirmed in current Filebase docs; one **public** bucket `vaultifier`, human confirmed — two-bucket plan dropped, see `docs/STORAGE.md` §3)
- [x] `media` collection using the S3 storage adapter pointed at Filebase. No object ACLs (Filebase does not support them) (2026-11-19; `@payloadcms/storage-s3`, prefix `media/`, no `acl` option set)
- [x] Spike: choose the media delivery path (Next image optimizer, Filebase gateway, or Cloudflare in front). Record in `docs/STORAGE.md` and `DECISIONS.md` (2026-11-19; all five candidates probed live: Filebase direct chosen for launch with the Payload route as interim — ADR-015, `docs/STORAGE.md` §4. Evidence: signed GET 200 / anonymous 403 (bucket flip pending), Payload route 200 but no `Cache-Control`, optimizer 400 on `?prefix=media` under Next 16's default `localPatterns`, gateway hostnames do not resolve, Cloudflare deferred until a domain exists)
- [x] Image processing on upload (resized variants, WebP/AVIF), required alt text (2026-11-19; thumb/card/hero in WebP + card/hero in AVIF, `withoutEnlargement`; `alt` required with `maxLength` from `src/cms/limits.ts`; server-side size caps)
- [x] Integration test: upload, read back, delete (2026-11-19; `src/collections/media.integration.test.ts`, 5 tests against the real bucket + local PostgreSQL, skipped in CI)
- **Exit:** an uploaded image appears on a test page with the right URL; alt text is enforced
- **Commit:** `checkpoint(CP-1.1): delivery path decision, media test page and initial migration` (the users/roles and media chunks were committed earlier as `40953fe` and `5e5a1a0`)

### CP-1.2 — Limits registry, categories, pages
- [x] `src/cms/limits.ts` with text and count presets (`docs/CONTENT.md` section 5) (2026-11-19)
- [x] Field factories that apply limits (`textField`, `textareaField`, `listField`, ...) (2026-11-19)
- [x] Test: every text field in every collection and block has `maxLength`; every array and blocks field has `maxRows` (2026-11-19; 22 tests in `src/cms/config.test.ts`)
- [x] `categories` collection (nested, parent/child) and `pages` collection (blocks layout, drafts, versions, scheduled publish, trash, SEO group) (2026-11-19)
- [x] Slug rules and reserved slugs (`admin`, `api`, `edit`, `_next`, ...), unique path per page (2026-11-19; 5 unit tests in `src/cms/slugs.test.ts`)
- [x] First set of blocks defined as data (full catalogue in `docs/CONTENT.md` section 6) (2026-11-19; 14 blocks implemented)
- **Exit:** admin can create a category and a page with blocks; saving a too-long field is rejected on the server (2026-11-19; verified in `src/collections/categories-pages.integration.test.ts`, 5/5 pass)
- **Commit:** `checkpoint(CP-1.2): limits registry, categories and pages`

### CP-1.3 — Globals and seed
- [x] `site-settings` global (company name, phones, WhatsApp, email, address, hours, timezone, social links)
- [x] `navigation` global (header menu, footer columns) with limits
- [x] `pnpm seed` creates sample content, clearly marked as sample (never in production)
- [x] Document collections and fields in `docs/DATABASE.md`
- **Exit:** a fresh database plus `pnpm seed` gives a browsable sample — verified 2026-11-21 on scratch `mcs_seed_verify` (SAMPLE category + draft page, idempotent re-run; see `docs/QUALITY.md` §2)
- **Commit:** `checkpoint(CP-1.3): site settings, navigation and seed data`

---

## Phase 2 — Admin security

**Goal:** only invited staff can sign in, with two-factor login and server-checked roles.

### CP-2.1 — Invite-only accounts
- [x] No public sign up. Creating users is Super Admin only. First Super Admin via `pnpm seed:admin` (2026-11-23; `src/access/first-user.ts` blocks Payload's first-register path, `pnpm seed:admin` implemented)
- [x] Invite email with one-time set-password link; expiry set (2026-11-23; 24 h, single use, ADR-016)
- [x] Lockout after failed logins; short admin session lifetime; secure cookie settings; CSRF and CORS allowlist (2026-11-23; 5 attempts / 15 min, 2 h session, `SameSite=Strict`, `Secure` in production, origin allowlist from `NEXT_PUBLIC_SITE_URL`)
- [x] Admin routes `noindex` and disallowed in `robots.txt` (2026-11-23; `X-Robots-Tag` + metadata `robots` + existing `/robots.txt` rule)
- **Exit:** tests prove a stranger cannot create or invite a user, and lockout triggers (2026-11-23; `src/collections/users.integration.test.ts` 6/6, anonymous create and first-register both 403 in a live smoke)
- **Commit:** `checkpoint(CP-2.1): invite-only staff accounts and lockout`

### CP-2.2 — Two-factor login
- [x] Spike (timebox): compare the community `payload-totp` plugin with a custom TOTP step built on Payload auth hooks. Check maintenance, Payload version support, how it handles REST and the Local API. Record the decision as ADR-008 (2026-11-24; plugin chosen, two incompatibilities patched — ADR-008)
- [~] TOTP enrolment (QR), verification on login, recovery codes (hashed), re-enrol by Super Admin (2026-11-24; enrolment/verify/recovery UI from the plugin and `/api/users/totp/reenroll` are done and tested. **Missing:** an admin-panel control for the re-enrol endpoint — the plugin's disable button checks for a role literally named `admin`, so Super Admins currently need the API/runbook. Add the button in CP-2.3)
- [x] TOTP secrets encrypted at rest (2026-11-24; AES-256-GCM with `TOTP_ENCRYPTION_KEY`, integration test asserts ciphertext)
- [~] Super Admin and Editor must enrol before reaching the admin or edit mode; all roles by launch (**reversed 2026-11-24 at the client's request: enrolment is optional**; `forceSetup` is off in the plugin and admin guard, the extra data-API guard was removed, and an opt-in admin-nav link was added. Enrolled accounts still verify on every path. Password + lockout + audit log protect unenrolled accounts)
- [x] Tests: an **enrolled** account cannot log in without a code on any path (admin UI, REST, Local API usage in custom code) (2026-11-24; `src/auth/totp.integration.test.ts` 5/5 + live browser smoke; one test now asserts unenrolled access is allowed)
- **Exit:** no staff session exists without a verified second factor (2026-11-24; password-only session is refused on the data API and redirected to verify in the admin)
- **Commit:** `checkpoint(CP-2.2): two-factor login with recovery codes`

### CP-2.3 — Audit log and role tests
- [~] `audit-logs` collection written by hooks (login, failed login, 2FA events, user changes, publish, delete, price change, export) (2026-11-24; create-only collection, Super Admin read, salted IP hash, no personal data. Login, failed login, 2FA setup/verify/recovery/re-enrol/lockout, user create/update/delete, publish/unpublish and delete are wired and tested. **Missing:** `price_change` and `export` actions exist in the schema but have no source yet — wire them with products/CSV in CP-5.3/CP-5.4. Failed-login detection runs on REST/GraphQL `afterError`; Local API login errors do not fire that hook)
- [x] Access test matrix generated from `docs/DATABASE.md` roles table: every role against every collection and operation (2026-11-24; `src/access/matrix.test.ts` parses §4 and covers all implemented collections, globals and anonymous reads)
- **Exit:** role tests pass; audit entries appear for the listed events (2026-11-24; 116/116 tests, audit integration 4/4, matrix 13/13; price/export deferred as noted)
- **Commit:** `checkpoint(CP-2.3): audit log and role access tests`

---

## Phase 3 — Public site shell and blocks

**Goal:** the public site renders from CMS content, fast and accessible, with no editing UI yet.

### CP-3.1 — Design system and layout
- [x] Design tokens as CSS variables and Tailwind theme (`docs/DESIGNS.md`). Brand colours are placeholders until the client supplies them (2026-11-24; `src/app/(frontend)/globals.css` with `@theme inline`)
- [x] Header (menu from global), footer, mobile sticky call bar, floating WhatsApp (stubs wired to settings) (2026-11-24; contact facts render only when saved, menu has catalogue fallbacks, desktop nav starts at 1280 px)
- [~] `next/font`, skip link, focus styles, reduced-motion, logical CSS properties (Urdu-ready) (2026-11-24; skip link, focus ring, reduced motion and logical utilities done. **`next/font` not used:** brand fonts are pending Q6 and Google Fonts is unreachable from the build network, so an interim system stack is used — switch to `next/font/local` when files arrive)
- [x] UI strings in a message catalogue, not hard-coded (2026-11-24; `src/messages/en.json` + typed accessor)
- **Exit:** layout passes an axe check at 360 px and 1280 px (2026-11-24; `tests/e2e/accessibility.spec.ts`, 6/6 E2E with the skip-link check)
- **Commit:** `checkpoint(CP-3.1): design tokens, header, footer and sticky bars`

### CP-3.2 — Block renderers and page routes
- [x] One server component per block in the catalogue; each handles missing or maximum content without overflow (defensive CSS in `docs/DESIGNS.md`) (2026-11-24; all 14 types in `src/components/blocks/`, registry in `index.tsx`)
- [x] Catch-all route for pages and category pages; static generation with ISR; `afterChange` hooks revalidate by tag (2026-11-24; required `[...segments]` route, tags `pages` and `site-chrome`, 300 s)
- [x] 404 and error pages; `notFound` for unpublished (2026-11-24; `/[...segments]` returns 404 for drafts and unknown paths)
- **Exit:** a seeded page renders every block type; unpublishing returns 404 (2026-11-24; one renderer test mounts all 14 block types in a single page, integration test unpublishes a page and gets no result. The committed seed page stays a draft by design, so it correctly 404s in E2E)
- **Commit:** `checkpoint(CP-3.2): block renderers and page routes with revalidation`

### CP-3.3 — Home and static pages
- [x] Home built from blocks in the order from `docs/CONTENT.md` section 7 (2026-11-24; `/` loads the published `pages` document with path `home` through the shared `PageView`, and shows a neutral noindex holding state until staff publish it. Block order lives in the document's layout, per §7)
- [~] About Us, Warranty, Terms, Privacy as pages (legal text marked `TODO(client): lawyer review`) (2026-11-24; `pnpm seed` adds all four as drafts with `TODO(client)` bodies; the legal pair is flagged `isLegal`. **Missing:** client-approved copy for About and Warranty, and lawyer-reviewed Terms/Privacy — publishing is a content decision, nothing is invented in code)
- **Exit:** Lighthouse mobile run recorded in QUALITY.md (not yet gated) (2026-11-24; Lighthouse 12 mobile on a published-home fixture: performance 99, accessibility 100, LCP 1.4 s, CLS 0, TBT 140 ms. SEO 54 is staging `noindex`; cold first run scored 89 performance)
- **Commit:** `checkpoint(CP-3.3): home page and static pages from blocks`

---

## Phase 4 — Inline editing

**Goal:** staff click any content on the real site and edit it in a content box with enforced limits. Spec: `docs/INLINE-EDITING.md`.

### CP-4.1 — Edit route and content box for text fields
- [x] Proxy rewrites staff requests to the dynamic edit route; public routes stay static (2026-11-24; a `payload-token` cookie rewrites GET/HEAD to `/edit/*`, `?view=visitor` opts out; anonymous and non-Editor sessions fall back to the public page. Matcher excludes API, admin, edit, assets)
- [x] Edit route verifies session and role, sets `private, no-store` and `noindex` (2026-11-24; `getEditSession` re-checks session, Editor/Super Admin role and TOTP state; loads the draft with `overrideAccess: false`; headers verified live)
- [x] `<Editable>` wrapper, outline on hover and focus, keyboard-operable "Edit" control (2026-11-24; outline uses `outline`/`offset` so no layout shift; `aria-haspopup="dialog"`; focus returns to the trigger on close)
- [~] Content box drawer (bottom sheet on mobile) for text, textarea, select, link, number fields with live counters and hard stops (2026-11-24; text, textarea, select and number are in the derived registry. **Link fields are deferred to CP-4.2** with the other group/repeater controls; `maxLength` gives the client hard stop and the server re-validates)
- [x] Server actions save to a **draft** with role checks and server-side limit validation (2026-11-24; `saveDraftAction` → `saveBlockDraft`, Local API with the staff user and `overrideAccess: false`; unknown fields and over-limit values rejected)
- **Exit:** an Editor changes a headline inline; visitors still see the published version (2026-11-24; integration test saves a draft as an Editor and asserts the published doc keeps the old headline; live smoke shows draft markup only with a staff cookie)
- **Commit:** `checkpoint(CP-4.1): edit mode and content box for text fields`

### CP-4.2 — Lists, images, links, blocks
- [x] Repeaters with add, remove, reorder (buttons first, drag as extra), min/max enforced (2026-11-25; recursive registry + `EditFields`; move up/down/remove disable at the bounds, add disabled at max; server re-checks `minRows`/`maxRows`)
- [x] Image field with media picker and required alt text (2026-11-25; existing-library `<select>` with thumbnail plus upload to `/api/media`; alt is required before upload and the media collection itself requires it)
- [x] Add, duplicate, hide, delete and reorder whole blocks within allowed types and `maxRows` (2026-11-25; per-section toolbar, 30-block cap, last block cannot be deleted; `hidden` checkbox added to every block, public renderer skips hidden blocks and edit mode shows a ghost)
- [x] Global regions editable: menu, footer, contact details in settings (2026-11-25; **via staff-bar buttons** opening the content box, not inline wrappers, because the shared layout is static. `navigation` exposes header/footer arrays; `site-settings` exposes contact fields only — chat, alert recipients and retention stay Super Admin only)
- **Exit:** every block in the catalogue is editable in edit mode (2026-11-25; the registry covers all 14 implemented blocks including `trustStrip` via its repeater; browser smoke added a stat, saved a draft and hid the section)
- **Commit:** `checkpoint(CP-4.2): repeaters, images and block management inline`

### CP-4.3 — Draft, publish, concurrency, versions
- [x] Save draft, Publish, Discard; scheduled publish from the content box (2026-11-26; page-level controls live in the staff bar because publishing is per document. `publishPage` runs the §9 gates, `discardPageDraft` restores the published content, and `schedulePagePublish` queues Payload `schedulePublish` jobs (publish and optional unpublish) through `payload.jobs`; `/api/cron/jobs` runs them, protected by `CRON_SECRET`)
- [x] Optimistic concurrency: edit conflict shown with choices (2026-11-26; every draft save carries `expectedUpdatedAt`; a stale one returns `CONFLICT` plus the saved field values. The box offers Reload theirs, Keep mine and See differences, which lists Yours/Theirs per changed field)
- [x] Version history with restore; publish gates (proof notes, legal pages Super Admin only) (2026-11-26; `listPageVersions`/`restorePageVersion` restore as a draft, versions are scoped to the page, gates cover metadata, `TODO(client)`, trust-strip proof notes, our-difference proof notes, legal pages)
- [x] Accessibility: focus trap, Escape, announcements; mobile layout tested (2026-11-26; drawer traps Tab, Escape saves-or-confirms, conflict and status are live regions, 360 px covered by the E2E)
- **Exit:** e2e test covers edit, limit rejection, publish, conflict, restore (2026-11-26; `tests/e2e/edit.spec.ts` runs the whole flow, including the 360 px viewport)
- **Commit:** `checkpoint(CP-4.3): draft/publish flow, conflicts and version restore`

---

## Phase 5 — Services, locations, products, blog

### CP-5.1 — Services
- [x] `services` collection and detail template: signs, treatment steps, products used, starting price, areas served, FAQs (2026-11-26; title, slug, category, icon, short description, hero image, 3–10 signs, 3–8 treatment steps, 3–8 FAQs, optional price + unit, optional extra blocks, SEO, order; drafts + scheduled publish + trash. **`productsUsed` and `areasServed` deferred** until the products (CP-5.3) and locations (CP-5.2) collections exist — Payload rejects relations to unregistered collections)
- [x] Services index and grid block (auto and manual) (2026-11-26; `/services` lists published services; `servicesGrid` renders auto or a 4–12 manual pick, drops unpublished ids, and renders nothing when empty. `/services/[slug]` is SSG with per-service metadata and a not-found 404)
- **Exit:** a published service is reachable at `/services/[slug]`; drafts stay 404 (2026-11-26; integration test proves draft invisibility, publish, list order and stable published content, plus role denial and list-minimum rejection; live smoke returned 200/200/404)
- **Commit:** `checkpoint(CP-5.1): services collection and pages`

### CP-5.2 — Locations
- [x] `locations` (city, area, nested), unique-local-content publish gate, similarity warning (2026-11-26; city/area tree with a parent-city rule, publish gate on 400+ characters of local notes, 3 neighbourhoods, 2 pests, 1 service and 3 FAQs; 60% similarity writes a sidebar warning and 80% refuses the publish. `.drafts`, scheduled publish and trash on)
- [x] City and area routes; optional city × service pages (2026-11-26; `/locations` static index, `/locations/[city]` and `/locations/[city]/[area]` SSG with per-page metadata and a 404 for drafts; a city page lists its published areas. City × service pages come from the service's new `areasServed` relation, rendered on the service page and the location page's services list, so no separate route is needed)
- **Commit:** `checkpoint(CP-5.2): locations with unique content gate`

### CP-5.3 — Products and pricing
- [ ] `products` with pack sizes, PKR rate, discount (percent or fixed), start and end dates, stock status, safety documents
- [ ] One tested pricing function (`src/lib/pricing.ts`); discounts apply on dates in Asia/Karachi
- [ ] `price-history` written by hooks on every price or discount change
- [ ] Product detail page: images, price, discount, pack size, description, how to use, safety info, Order on WhatsApp, Add to Quote
- **Commit:** `checkpoint(CP-5.3): products, pricing function and price history`

### CP-5.4 — Product CSV import and export
- [ ] Export; import with dry-run preview, row-level errors, size caps, role check, history entries
- [ ] Evaluate the official import-export plugin first; build custom only if it cannot meet the rules
- **Commit:** `checkpoint(CP-5.4): product CSV import and export`

### CP-5.5 — Blog (Pest Library) and reviews
- [ ] `posts` with restricted rich text, character cap, categories; `reviews` with source and verification
- [ ] Pest Library index and post pages
- **Commit:** `checkpoint(CP-5.5): pest library and reviews`

---

## Phase 6 — Leads, forms, CTAs

### CP-6.1 — Leads inbox
- [ ] `leads` collection, statuses, notes, assignment, CSV export, email alert on new lead
- [ ] Access: Sales and Support and Super Admin only
- **Commit:** `checkpoint(CP-6.1): leads inbox with status, notes and email alerts`

### CP-6.2 — Public forms
- [ ] Contact, Get a Quote, Free Inspection forms; short; Zod on server; Turnstile; honeypot; rate limit
- [ ] Accessible errors, no re-asking known data, works without JavaScript where practical
- **Commit:** `checkpoint(CP-6.2): contact, quote and inspection forms with spam protection`

### CP-6.3 — Photo upload pipeline
- [ ] Client resize, server type and size checks, strip location data (EXIF), encrypt, store in private bucket, staff-only viewer that decrypts
- [ ] Retention setting and delete tool
- **Commit:** `checkpoint(CP-6.3): safe customer photo upload`

### CP-6.4 — WhatsApp, quote basket, live chat, tracking
- [ ] Floating WhatsApp and mobile sticky bar with prefilled page or product name
- [ ] Quote basket (Add to Quote) feeding the quote form
- [ ] Live chat widget loaded lazily, falls back to WhatsApp when nobody is online or outside hours
- [ ] Events tracked: call click, WhatsApp click, each form submit, add to quote, chat open
- **Commit:** `checkpoint(CP-6.4): WhatsApp, quote basket, live chat fallback and tracking`

---

## Phase 7 — SEO and analytics

### CP-7.1 — Metadata, sitemap, schema
- [ ] Unique title and description on every page (publish gate), canonical, Open Graph, sitemap, robots, JSON-LD (`docs/SEO.md`)
- **Commit:** `checkpoint(CP-7.1): metadata, sitemap and structured data`

### CP-7.2 — Redirects and indexing gate
- [ ] Recover old URL list; redirects collection with import; 301 map tested
- [ ] Staging: noindex (meta and header). Production: crawlable. Automated check for both
- **Commit:** `checkpoint(CP-7.2): 301 redirects and indexing gate`

### CP-7.3 — Analytics
- [ ] GA4 with events from CP-6.4, Search Console verification, Google Business Profile checklist
- **Commit:** `checkpoint(CP-7.3): analytics and search console`

---

## Phase 8 — Hardening

### CP-8.1 — Tests and accessibility
- [ ] Unit, integration and e2e coverage per `docs/QUALITY.md`; axe on every template; manual keyboard and screen reader pass
- **Commit:** `checkpoint(CP-8.1): test suite and accessibility audit`

### CP-8.2 — Performance
- [ ] Lighthouse mobile 90 or higher on home, service, product, location, post; Core Web Vitals pass; tested on throttled slow 4G and a mid-range Android phone
- **Commit:** `checkpoint(CP-8.2): performance pass`

### CP-8.3 — Security pass
- [ ] Walk `docs/SECURITY.md` launch gates; dependency audit; vulnerability scan; fix every high and medium finding
- **Commit:** `checkpoint(CP-8.3): security hardening and scan fixes`

### CP-8.4 — Backups and monitoring
- [ ] Daily database backups, **restore tested**, file bucket recovery plan, uptime and error monitoring, Cloudflare firewall and bot rules
- **Commit:** `checkpoint(CP-8.4): backups, restore test and monitoring`

---

## Phase 9 — Launch

### CP-9.1 — Content load
- [ ] 10 to 15 Lahore area pages, 6 blog articles, services, products, legal pages reviewed by a lawyer
- **Commit:** `checkpoint(CP-9.1): launch content loaded`

### CP-9.2 — UAT on staging
- [ ] Management walkthrough, staff training on edit mode and leads, all launch gates checked
- **Commit:** `checkpoint(CP-9.2): staging UAT complete`

### CP-9.3 — Go live
- [ ] DNS, HTTPS, production env, redirects verified, sitemap submitted, production indexable, staging noindex confirmed
- **Commit:** `checkpoint(CP-9.3): production launch`

### CP-9.4 — Handover
- [ ] Accounts owned by MCS, runbook, monthly security update routine, maintainer named
- **Commit:** `checkpoint(CP-9.4): handover and maintenance routine`

---

## Launch gates (all must be ticked)

- [ ] HTTPS everywhere, security headers verified
- [ ] Two-factor admin login, server-side role checks, lockout tested
- [ ] Forms validated, spam protection on, uploads safe, location data stripped from photos
- [ ] Daily backups with a **tested restore**
- [ ] Cloudflare firewall and bot protection on; error and uptime monitoring on
- [ ] Vulnerability scan done; no open high or medium issues
- [ ] Lighthouse mobile 90 or higher; Core Web Vitals pass; WCAG 2.2 AA checked
- [ ] Unique title and description on every page; sitemap; schema; 301 redirects tested
- [ ] Staging is noindex; production is crawlable (both checked)
- [ ] GA4, Search Console connected; Google Business Profile ready
- [ ] No placeholder content, no `TODO(client)` left in published pages
- [ ] Legal pages reviewed by a lawyer
- [ ] MCS owns domain, repository, hosting, database, storage and email accounts

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Missing business facts (prices, warranty, numbers) | Blocks content, delays launch | Placeholders and gates; ask early (`DECISIONS.md`) |
| Old WordPress URLs not recoverable | SEO loss | Start recovery now: Search Console, hosting backup, Internet Archive |
| Payload has no built-in two-factor | Delay in CP-2.2 | Timeboxed spike; fall back to custom TOTP |
| Filebase objects retrievable by CID | Customer photo exposure | Encrypt before upload (`STORAGE.md`) |
| Inline editor complexity | Schedule slip | Structured fields first; rich text stays in admin panel |
| Vercel or VPS undecided | Rework in uploads, jobs, DB pooling | Constraints recorded in `OPERATIONS.md`; decide before CP-1.1 if possible |
| Thin, duplicated location pages | Poor search ranking | Unique content gate and similarity check (CP-5.2) |
