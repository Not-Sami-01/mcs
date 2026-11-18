# PROJECT — Architecture and Context

> **For AI agents:** this is the single source of truth for what is being built and why. Read it before suggesting or writing code. Keep it current (`AGENTS.md` section 3).

---

## 1. What is this?

A custom website for **Malaysian Care System (MCS)**, a pest control company in **Lahore, Pakistan**. It replaces a WordPress site that is currently down. Source requirements: `MCS_Website_Requirements.docx` (7 November 2026). A "detailed 17 page version" exists but has not been supplied; ask the client if more depth is needed.

**Goals**

- Turn visitors into calls, WhatsApp chats, free inspection bookings and quote requests.
- Let the MCS team manage pages, products, prices and leads without a developer.
- Rank locally: unique Lahore area pages, a blog, clean technical SEO.

**Additional requirements from the project owner (not in the docx)**

- **Filebase** for file storage and **PostgreSQL** for the database.
- Every page and every **category > page** group is manageable in the admin panel.
- **Click-to-edit:** a logged-in admin clicks any content on the site and edits it in a content box, adding or removing items, within **fixed text limits** so the site never overflows.
- Structure reference: https://apexcore.pk/ (a competitor's pest control site). Used for layout ideas only. Do not copy its text or images.

---

## 2. Requirements summary

### Public site

- **Navigation:** Home, About Us, Services, Products, Locations, Warranty, Pest Library (blog), Contact Us. Header buttons: **Free Inspection** and **Get a Quote**.
- **Home sections:** hero (main keyword plus Call, WhatsApp, Free Inspection); trust strip (real numbers only); services grid and termite spotlight; why choose MCS and the "Malaysian Care difference" (only if provable); how it works in 5 steps; pricing guide with starting prices in PKR; warranty promise; who we serve (homes, builders, restaurants and hotels, schools, hospitals, factories); featured products and areas served; before and after, reviews, certificates; free inspection form; FAQs; latest blog articles; final call to action.
- **Other pages:** service detail, product detail, locations (city and area, unique local content each), Terms, Privacy, Warranty, Free Inspection (optional photo upload), Get a Quote, Contact Us.

### Admin panel

- Invite-only staff accounts, two-factor login, no public sign up.
- Roles: **Super Admin, Editor, Product Manager, Sales and Support**.
- Pages like WordPress: add, edit, duplicate, delete (trash and restore), blocks, draft/scheduled/published, preview, version history, menus, footer, SEO title and description on every page.
- Products: content, images, PKR rate, discount (percent or fixed) with start and end dates, pack sizes, stock status, safety documents, CSV import and export, price change history.
- Services and locations management, leads inbox (status, notes, assignment, export, email alert), media library, reviews, blog.

### Calls to action

- WhatsApp: floating button and mobile sticky bar with a prefilled message naming the page or product.
- Live chat widget (Tawk.to, Crisp or Chatwoot) that falls back to WhatsApp when nobody is online.
- Contact, Quote and Free Inspection forms with spam protection, saved to the leads inbox.
- Every call click, WhatsApp click and form submit is tracked.

### UI and UX

- Mobile first, tested on slow 4G and a mid-range Android phone.
- Clean, trustworthy, MCS brand colours and real photos.
- Short forms, large buttons, sticky call bar on mobile.
- **WCAG 2.2 AA.** Core Web Vitals pass and **Lighthouse mobile 90 or higher**.
- Built so an **Urdu** version can be added later.

### Security, SEO, analytics

See `docs/SECURITY.md` and `docs/SEO.md`. Headlines: HTTPS and headers, two-factor admin, validated forms, safe uploads with location data removed, daily backups with a tested restore, Cloudflare firewall, monitoring, vulnerability scan with all high and medium issues fixed, monthly updates; unique metadata, sitemap, schema, 301 redirects from old WordPress URLs, staging noindex and production crawlable, GA4, Search Console, Google Business Profile, launch content of 10 to 15 Lahore area pages and 6 blog articles.

### Out of scope for launch

Online checkout, customer accounts, Urdu content, native apps. Enquiry only, prices visible (to be confirmed by management, ADR-007).

---

## 3. Stack

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Node.js current LTS | Check what Payload and Next.js require |
| Package manager | pnpm | Frozen lockfile in CI |
| Framework | Next.js latest stable, App Router | Check the installed version's docs; do not rely on memory |
| Language | TypeScript strict | No broad `any` |
| Styling | Tailwind CSS | Tokens in `docs/DESIGNS.md` |
| CMS and admin | Payload CMS 3 | Runs inside the same Next.js app |
| Database | PostgreSQL via Payload's Postgres adapter | Migrations in production |
| Files | Filebase S3-compatible API | `@payloadcms/storage-s3` plus custom code for private uploads |
| Rich text | Payload Lexical | Blog and legal pages only; marketing pages use structured fields |
| Validation | Zod | Custom endpoints and server actions |
| Images | sharp | Resize, strip EXIF |
| Spam | Cloudflare Turnstile | Server-side verification |
| Email | Resend, Postmark or Amazon SES | Behind one `sendMail` function; provider chosen in Q10 |
| Tests | Vitest, Playwright, axe | `docs/QUALITY.md` |
| Hosting | Vercel or VPS | Undecided (ADR-012) |
| Edge | Cloudflare | DNS, firewall, bot protection, caching |

---

## 4. Architecture

### Request flow (public)

```
Visitor → Cloudflare → Next.js (static / ISR page)
                         └─ content read from PostgreSQL at build/revalidate time via Payload Local API
Forms   → /api/public/* route handlers → Zod → Turnstile → rate limit → PostgreSQL (+ Filebase for photos) → email alert
```

### Request flow (staff, edit mode)

```
Staff browser (has Payload session cookie)
  → proxy sees the cookie → rewrites to the dynamic /edit/... route
  → edit route verifies session + role + 2FA state, renders DRAFT content with <Editable> wrappers
  → click content → content box → Server Action → Payload Local API (overrideAccess: false, user passed)
  → Save = draft. Publish = published version + revalidateTag
```

Full detail: `docs/INLINE-EDITING.md`.

### Content model in one paragraph

**Categories** form a tree (for example Services, Industries, Locations > Lahore). **Pages** are block-built documents that can sit in a category. **Typed collections** (services, locations, products, posts) hold structured data and share the same blocks, SEO group, drafts and versions. Everything is editable inline and in the admin panel. Details: `docs/DATABASE.md`.

### Where logic lives

| Concern | Location |
|---|---|
| Text and count limits | `src/cms/limits.ts` (single source) |
| Access control | `src/access/` helpers used by every collection |
| Pricing | `src/lib/pricing.ts` (pure, tested) |
| Storage | `src/lib/storage/` (public and private clients, encryption) |
| Forms | `src/app/api/public/*` plus `src/lib/forms/` |
| Block renderers | `src/components/blocks/` |
| Edit mode UI | `src/components/edit/` |

---

## 5. Roles

| Role | Can do |
|---|---|
| **Super Admin** | Everything: users, invites, settings, redirects, audit logs, legal page publishing |
| **Editor** | Pages, categories, services, locations, blog, reviews, menus and footer, SEO, media, inline editing, contact details in settings |
| **Product Manager** | Products, prices, discounts, pack sizes, stock, safety documents, CSV import and export, product media |
| **Sales and Support** | Leads inbox (status, notes, assignment, export), read-only view of content |

The full collection-by-role matrix is in `docs/DATABASE.md` section 4 and is enforced by tests.

---

## 6. Target repository layout

```
mcs-website/
├── AGENTS.md  CLAUDE.md  README.md
├── docs/                       # this documentation set
├── src/
│   ├── app/
│   │   ├── (frontend)/         # public site (static / ISR)
│   │   ├── (edit)/edit/        # dynamic edit-mode render, auth gated, noindex
│   │   ├── (payload)/          # Payload admin + REST/GraphQL
│   │   └── api/public|staff/   # custom route handlers
│   ├── payload.config.ts
│   ├── collections/  globals/  blocks/  fields/  access/  hooks/
│   ├── cms/                    # limits.ts, registry
│   ├── components/             # blocks, ui, layout, edit
│   ├── lib/                    # storage, email, turnstile, pricing, seo, rate-limit, crypto
│   ├── messages/               # en.json now, ur.json later
│   └── tests/
├── e2e/
├── migrations/
├── docker-compose.yml
└── .env.example
```

The Payload app creator's default layout differs slightly. Adapt it, and update this section to match reality.

---

## 7. Golden rules for any new feature

1. Write the data shape and limits first (`docs/DATABASE.md`, `limits.ts`), then the UI.
2. Every field a human can type into has a limit. Every list has a minimum and maximum.
3. Server enforces; client only helps.
4. Public routes stay static. Anything per-user goes in edit mode, staff routes or API handlers.
5. No claim without proof (`docs/CONTENT.md` section 10).
6. If it is not in the docs, it does not exist for the next agent.

---

## 8. Gotchas (add new ones here)

Verified while planning, 2026-11-17. Re-verify against installed versions.

| # | Gotcha | Consequence |
|---|---|---|
| 1 | **Filebase IPFS buckets expose every object through its CID, even in private buckets.** | Never store customer photos unencrypted. See `docs/STORAGE.md`. |
| 2 | Filebase has no object-level ACLs. Public buckets need a paid plan. | Do not set ACLs in the S3 adapter. Use two buckets. |
| 3 | Filebase docs show two endpoints (`s3.filebase.com` with region `us-east-1`, and `s3.filebase.io` with region `auto`). | Make endpoint and region env vars. Confirm in the Filebase console before CP-1.1. |
| 4 | Filebase S3 API effective limit is about 100 requests per second. | Cache media in front. Avoid per-request bucket listing. |
| 5 | Payload has no built-in two-factor login. | Spike in CP-2.2. |
| 6 | With the Postgres adapter and drafts enabled, `status` is a forbidden custom field name. | Use `leadStatus`, `stockStatus`, etc. Payload manages `_status`. |
| 7 | Payload trash (soft delete) is enabled per collection with `trash: true`. A trashed document cannot have a version restored until it is restored from trash. | Build the restore UI in that order. |
| 8 | Scheduled publish needs the Payload jobs queue running (autoRun on a VPS, or a cron hitting the jobs endpoint on Vercel). | Decide with hosting (ADR-012). Test it. |
| 9 | A reported Payload issue (payloadcms/payload #17508) describes sparse block arrays in Postgres with drafts plus localization. | Do not enable localization at launch (ADR-010). Re-check before Urdu. |
| 10 | Vercel request bodies are limited to about 4.5 MB. | Resize photos in the browser before upload, or use direct uploads. |
| 11 | Next.js 16 renamed `middleware` to `proxy` (verify against the installed version). | Use the correct file name and runtime. |
| 12 | Payload serves media through its own route unless direct bucket URLs are configured. | Pick the delivery path in CP-1.1 (`docs/STORAGE.md`). |
| 13 | Dates: store UTC, display and apply discount windows in `Asia/Karachi`. | One helper; tests around boundaries. |
| 14 | The reference site shows lorem ipsum prices in dollars, counters starting at zero, typos ("Rodant", "Faislabad") and near-duplicate city pages. | Do not repeat these. |
