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
- **Status:** Proposed (spike in CP-2.2)
- **Decision:** TOTP authenticator codes plus hashed recovery codes. Evaluate the community `payload-totp` plugin against a custom step on Payload's auth hooks.
- **Why a spike:** Payload does not ship two-factor login; community plugins vary in maintenance and version support. Pick on evidence, record it here.

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

### ADR-012 — Hosting: Vercel or VPS
- **Status:** Open
- **Constraints to weigh:**

| Topic | Vercel | VPS |
|---|---|---|
| Postgres connections | Use a pooler; serverless connection limits | Direct pool |
| Upload size | About 4.5 MB request limit | Configurable |
| Scheduled publish | Needs a cron calling the jobs endpoint | autoRun works |
| Image optimization cost | Metered | Free (CPU) |
| Ops burden | Low | You patch, back up and monitor |
| Cost | Grows with traffic | Flat |

- **Default until decided:** write code that works on both (no filesystem writes, pooled DB URL, resized uploads).

### ADR-013 — Product discounts at product level
- **Status:** Proposed
- **Decision:** Pack sizes each carry their own rate and stock status. One discount (type, value, start, end) applies to all packs of a product.
- **Revisit if:** MCS discounts individual pack sizes.

### ADR-014 — Rich text only where long-form is real
- **Status:** Accepted
- **Decision:** Lexical rich text for blog posts and legal pages only, with a restricted feature set and a character cap. All marketing content uses structured fields with limits.

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
| Q8 | Hosting budget; who maintains after launch? | CP-0.2 | See ADR-012 | |
| Q9 | Domain name and who owns the registrar account | CP-0.2 | Local and staging URLs | |
| Q10 | Email provider (Resend, Postmark, Amazon SES) and sender address | CP-2.1 | Console mail adapter in development | |
| Q11 | Live chat provider (Tawk.to, Crisp, Chatwoot) | CP-6.4 | Provider-agnostic loader | |
| Q12 | Lead and photo retention period; applicable privacy law | CP-6.3 | 24 months, configurable | |
| Q13 | Filebase plan (public buckets need a paid plan) | CP-1.1 | Free tier for development only | |
| Q14 | Real numbers for the trust strip (years, rating, team size) and proof | CP-3.3 | Strip stays unpublished | |
| Q15 | Customer consent for before and after photos and reviews | CP-5.5 | Blocks stay unpublished | |
| Q16 | Old WordPress domain and any backups | CP-7.2 | Recovery via Search Console and Internet Archive | |
| Q17 | Who may publish legal pages? | CP-3.3 | Super Admin only | |
