# DECISIONS — ADRs and Open Questions

> Record every decision that a future agent might otherwise reverse by accident. Statuses: **Accepted**, **Proposed** (default in use, human may change), **Open** (needs a decision), **Superseded**.
> Do not deviate from an Accepted ADR without asking the human (`AGENTS.md` section 6).

---

## Part A. Architecture decisions

### ADR-001 — Payload CMS 3 embedded in Next.js
- **Status:** Accepted (the requirements document recommends it)
- **Decision:** Use Payload CMS for the admin panel, inside the same Next.js project.
- **Why:** gives drafts, versions, scheduled publish, trash, roles, media library and typed collections out of the box, which covers most of the "like WordPress" requirements.
- **Alternative considered:** a custom admin panel (as in Vaultifier). More control, much more work, and every WordPress-style feature would need building and securing.
- **Consequences:** admin UI is Payload's. The click-to-edit feature is custom and sits on top (ADR-004).

### ADR-002 — PostgreSQL through Payload's Postgres adapter
- **Status:** Accepted
- **Decision:** PostgreSQL only. Schema push in development; migrations (`payload migrate`) in staging and production.
- **Consequences:** see `docs/DATABASE.md` for naming and the forbidden `status` field name. Host choice is part of ADR-012.

### ADR-003 — Filebase for storage, two buckets, encrypt private uploads
- **Status:** Accepted with constraints
- **Decision:** Filebase through its S3-compatible API. One **public** bucket for site media. One **private** bucket for customer photos, which are **encrypted by the server before upload**.
- **Why:** Filebase IPFS buckets make every object retrievable through its CID even when the bucket is private. Encryption is the only real protection.
- **Consequences:** public buckets need a paid plan. Deleting an object unpins it but cannot recall copies already fetched by others. See `docs/STORAGE.md`.

### ADR-004 — Inline editing through a dynamic edit route
- **Status:** Proposed
- **Decision:** Public pages stay static. When the proxy sees a Payload session cookie, it rewrites the request to a dynamic `/edit/...` route that renders draft content with editing wrappers. A "view as visitor" toggle skips the rewrite.
- **Why:** keeps public pages cacheable and free of editor code. No extra request for ordinary visitors. No editor structure leaked in public HTML.
- **Fallback:** an explicit "Edit this page" link to `/edit/...` if the rewrite proves fragile.
- **Details:** `docs/INLINE-EDITING.md`.

### ADR-005 — One limits registry
- **Status:** Accepted
- **Decision:** All character and item limits live in `src/cms/limits.ts`. Payload fields, the inline editor and tests read it. A test fails if any text field lacks `maxLength` or any list lacks `maxRows`.
- **Note:** native `maxLength` counts UTF-16 units. Revisit grapheme counting when Urdu is added.

### ADR-006 — Content model: pages plus typed collections plus nested categories
- **Status:** Accepted
- **Decision:** `pages` (generic, blocks) and typed collections for `services`, `locations`, `products`, `posts`. `categories` is a nested tree. See `docs/DATABASE.md`.
- **Why:** structured data (price, steps, pack sizes) needs real fields, while ordinary pages need flexibility.

### ADR-007 — Enquiry only at launch, prices visible
- **Status:** Proposed (the requirements document recommends it; management decides)
- **Decision:** No checkout. Product pages offer "Order on WhatsApp" and "Add to Quote".

### ADR-008 — Two-factor login
- **Status:** Accepted (CP-2.2, 2026-11-24)
- **Decision:** TOTP authenticator codes plus hashed recovery codes, using `@purposeinplay/payload-totp@0.5.1` with three local adjustments:
  1. A pnpm patch (`patches/@purposeinplay__payload-totp@0.5.1.patch`) adds the `authVersion: 1` protected header Payload 3.94 requires when it issues its own JWT, and makes the plugin's rotated session cookie `SameSite=Strict` with a 2-hour lifetime (matching CP-2.1).
  2. ~~`src/auth/totp-setup-guard.ts` closes the plugin's pre-enrolment window on the data API.~~ **Removed 2026-11-24:** the client asked for two-factor to be optional, so enrolment is no longer forced and the extra guard was deleted. The plugin's own hook still refuses a data-API session for an account that *has* enrolled without the verified cookie.
  3. `/api/users/totp/reenroll` (Super Admin only, second factor verified) replaces the plugin's disable endpoint, which looks for a role literally named `admin` rather than our `super-admin`.
- **Why the plugin over a custom step:** it ships enrolment (QR + manual key), verification, 10 hashed recovery codes, per-user attempt locking, the admin redirect guard (`TOTPGuard`/`TOTPGate`), and REST/GraphQL enforcement through a `beforeOperation` hook — all of which a custom build would have to reimplement and test. It declares support for Payload 3.x and its code was reviewed against installed 3.94; the two incompatibilities found were small and are covered by the patch above.
- **Why not a custom TOTP step:** it would duplicate the plugin's field encryption, recovery-code hashing, rate limiting and admin routing, and the security-sensitive parts would be new code. The plugin's source is small enough to audit, and the patch is explicit and version-pinned.
- **Consequences:** the dependency is patched, so a version bump must re-check both hunks (JWT header and cookie policy) before upgrading. `TOTP_ENCRYPTION_KEY` (exactly 64 hex characters) encrypts secrets with AES-256-GCM; changing it makes every enrolment unreadable, so rotate only after re-enrolling staff. **Amendment 2026-11-24 (client request):** two-factor is **optional**. Plugin `forceSetup` and `TOTPGuard`'s `forceSetup` prop are both `false`, so unenrolled staff can use the admin and data API; an opt-in link appears in the admin nav. Accounts that did enrol must still present a code on every login, and the plugin's data-API enforcement remains on for them. Password-only accounts are therefore possible by policy; keep strong passwords, lockout and the audit log. Email is still the console adapter (Q10), which does not affect TOTP.

### ADR-009 — Spam protection and rate limiting
- **Status:** Proposed
- **Decision:** Cloudflare Turnstile verified server-side, a honeypot field, Cloudflare rate rules, and an app-level limiter backed by a Postgres table (no Redis dependency).
- **Revisit if:** load or abuse needs a dedicated store.

### ADR-010 — No localization at launch, but Urdu-ready
- **Status:** Accepted
- **Decision:** Do not enable Payload localization now. Keep UI strings in a message catalogue, use logical CSS properties, set `lang` and `dir` from a locale value, choose fonts with Urdu support when the time comes.
- **Why:** smaller schema, fewer moving parts, and a reported Postgres issue with localized blocks (gotcha 9). Enabling localization later is a planned migration, not a surprise.

### ADR-011 — Money as integer PKR rupees
- **Status:** Proposed
- **Decision:** Store rates as whole rupees. Percentage discounts round to the nearest rupee in one function. Display as `Rs 1,500`.
- **Revisit if:** MCS needs paisa precision.

### ADR-012 — Hosting: Vercel
- **Status:** Accepted (human decision, 2026-11-19: "it'll be hosted on Vercel"; Payload 3 works on Vercel)
- **Decision:** Deploy on Vercel. Write code within these constraints:

| Topic | Constraint on Vercel | How this project handles it |
|---|---|---|
| Postgres connections | Serverless connection limits; use a pooler | Pooled `DATABASE_URL` (pooler) at deploy time; `pg` pool only |
| Upload size | About 4.5 MB request limit | Filebase/S3 for stored objects; check presigned direct upload if bigger files are needed |
| Scheduled publish | Needs a cron calling the jobs endpoint | Vercel Cron with `CRON_SECRET` (see `docs/OPERATIONS.md`, CP-4.x) |
| Image optimization cost | Metered | Keep `sharp` variants small; revisit per-image budgets in `docs/QUALITY.md` |

- **Consequences:** no long-running job process (job runner must be cron-triggered), no local filesystem writes, ops burden stays low but cost grows with traffic.
- **Revisit if:** upload sizes exceed the body limit, or traffic/optimization costs outgrow VPS pricing.

### ADR-013 — Product discounts at product level
- **Status:** Proposed
- **Decision:** Pack sizes each carry their own rate and stock status. One discount (type, value, start, end) applies to all packs of a product.
- **Revisit if:** MCS discounts individual pack sizes.

### ADR-014 — Rich text only where long-form is real
- **Status:** Accepted
- **Decision:** Lexical rich text for blog posts and legal pages only, with a restricted feature set and a character cap. All marketing content uses structured fields with limits.

### ADR-016 — Invites reuse Payload's reset-password token
- **Status:** Accepted (CP-2.1, 2026-11-23)
- **Decision:** Staff accounts are created only by a Super Admin. Creating one generates a Payload `forgotPassword` token (24 h, single use), stored in the built-in `resetPasswordToken` / `resetPasswordExpiration` fields, and emails our own set-password link (`src/auth/invites.ts`). The same token backs the normal "forgot password" flow. The first account comes from `pnpm seed:admin`; the public first-register endpoint is blocked in a `beforeChange` hook because it bypasses access control.
- **Why:** Payload has no built-in invitation feature, and this reuses its tested token storage, expiry and password-reset endpoint instead of inventing a custom token table. It also keeps one "set your password" mechanism for both invites and resets.
- **Consequences:** Payload requires a password when creating an auth user, so the create hook overwrites the typed value with a random secret; the invite link is the only way in. Until the email provider is chosen (Q10), the console adapter means the link is logged in non-production only. `pnpm seed:admin` fills the first-user gap, so the first-register admin screen is never the way in.

### ADR-015 — Media delivery: Filebase direct at launch, Payload route until the bucket is public
- **Status:** Accepted (CP-1.1 spike, 2026-11-19; probe evidence in `docs/STORAGE.md` §4)
- **Decision:** Serve public media straight from Filebase at `https://<bucket>.s3.filebase.io/<object-key>` once the bucket is public. Until that flip lands, Payload's media route (`/api/media/file/…`) serves every image. Do **not** put the Next image optimizer or Cloudflare in the launch path.
- **Why:** Filebase direct is edge-cached, has no egress fee and needs no server of ours (probe: signed GET 200; anonymous 403 only because the bucket is still private — Q13). The Payload route works today with a private bucket but streams every hit through a serverless function and sends no `Cache-Control`. The Next optimizer rejects Payload's `?prefix=` URLs under Next 16's default `localPatterns` (400; gotcha 23) and would be metered on Vercel (ADR-012). Cloudflare has no domain to sit in front of yet (Q9), and Filebase already caches public buckets.
- **Consequences:** `FILEBASE_PUBLIC_BASE_URL` stays empty until the bucket is public; when set to `https://vaultifier.s3.filebase.io`, the per-collection `generateFileURL` in `src/payload.config.ts` rewrites media and size URLs on read — an env-only flip, no re-upload. Upload keeps generating fixed variants (WebP + AVIF), so responsive images work without an optimizer. Revisit if on-demand widths, observed Filebase latency, or an actual domain change the picture.

### ADR-017 — Custom product CSV instead of the import-export plugin
- **Status:** Accepted (CP-5.4, 2026-11-26)
- **Decision:** Product export and import live in two small staff routes (`/api/staff/products/export`, `/api/staff/products/import`) backed by `src/csv/`, not `@payloadcms/plugin-import-export`.
- **Why:** the official plugin (v3.94.1, out of beta) was evaluated first. Its "preview" is a field-mapping screen, not a synchronous dry run with row-level validation results; imports run through the jobs queue and write as batches complete; and it registers its own S3-backed `exports`/`imports` upload collections. CP-5.4 needs a dry run that writes nothing, per-row errors, hard byte/row caps, a role check on the route and an audited export. One row per pack is a small, well-understood format, so roughly 300 lines of tested code meet the contract without extra collections or an admin-only workflow.
- **Consequences:** the custom routes fail closed — any invalid row rejects the whole file, so half a price list is never applied. Revisit if staff need an in-admin CSV screen, JSON import, or asynchronous files beyond the 1 MB / 500 row caps. `price-history.source = csv` is set through the request context by the import; admin and inline saves keep `admin`.

---

## Part B. Open questions for management

Until answered, the **default assumption** is used and every affected page shows `TODO(client)` in the admin only (never published; see launch gates).

| # | Question | Needed by | Default assumption meanwhile | Answer |
|---|---|---|---|---|
| Q1 | Sell online later, or enquiry only for now? | CP-5.3 | Enquiry only, prices visible | |
| Q2 | Which products to list? Licence and labelling rules for pest control chemicals? | CP-5.3 | Product model ready; no products published | |
| Q3 | What does "Malaysian" mean for MCS? What proof exists? | CP-3.3 | The "Malaysian Care difference" block stays unpublished | |
| Q4 | Launch cities: Lahore only, or more? | CP-5.2 | Lahore only, others as "coming soon" pages unpublished | |
| Q5 | Service list, starting prices, inspection fee, warranty terms | CP-5.1 | Candidate list in `docs/CONTENT.md` section 11; no prices published | |
| Q6 | Brand files, phone and WhatsApp numbers, addresses, working hours | CP-3.1 | Neutral placeholder palette; settings left empty | |
| Q7 | Who answers live chat, and when? | CP-6.4 | Chat hidden; WhatsApp only | |
| Q8 | Hosting budget; who maintains after launch? | CP-0.2 | Vercel accepted (ADR-012); maintenance owner still unknown | Vercel (2026-11-19) |
| Q9 | Domain name and who owns the registrar account | CP-0.2 | Local and staging URLs | |
| Q10 | Email provider (Resend, Postmark, Amazon SES) and sender address | CP-2.1 | Console mail adapter in development | |
| Q11 | Live chat provider (Tawk.to, Crisp, Chatwoot) | CP-6.4 | Provider-agnostic loader | |
| Q12 | Lead and photo retention period; applicable privacy law | CP-6.3 | 24 months, configurable | |
| Q13 | Filebase plan (public buckets need a paid plan) | CP-1.1 | One bucket `vaultifier`, human makes it public | Solved 2026-11-19: single bucket `vaultifier`, human confirms public access is covered |
| Q14 | Real numbers for the trust strip (years, rating, team size) and proof | CP-3.3 | Strip stays unpublished | |
| Q15 | Customer consent for before and after photos and reviews | CP-5.5 | Blocks stay unpublished | |
| Q16 | Old WordPress domain and any backups | CP-7.2 | Recovery via Search Console and Internet Archive | |
| Q17 | Who may publish legal pages? | CP-3.3 | Super Admin only | |
| Q18 | Should non–super-admin staff change their own name/password (Account screen)? Matrix gives `R self` only | CP-2.1 | No self-service edits; super-admin resets passwords | |
