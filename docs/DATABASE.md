# DATABASE — Collections, Access and Migrations

> **Status:** `users`, `media`, `categories`, `pages`, `site-settings` and `navigation` are implemented (CP-1.3, 2026-11-20); other collections are designed, not implemented. Update this file in the same commit as any schema change (`AGENTS.md` section 3).
> Payload defines the schema from collection configs and generates the PostgreSQL tables (Drizzle). Field shapes below are the intended design. Verify exact option names against the installed Payload version.

---

## 1. Conventions

- **Engine:** PostgreSQL through the Payload Postgres adapter. Local dev runs PostgreSQL in a rootless **podman** container `mcs-db` on 5432 (`docker-compose.yml` is the canonical config; Docker is unavailable on this machine, so podman runs the equivalent container). If port 5432 is taken (e.g. a system PostgreSQL service starts first), free the port and `podman start mcs-db`.
- **Schema changes:** dev may use schema push. **Staging and production use migrations only** (`pnpm payload migrate:create`, review the SQL, commit it, `pnpm payload migrate`). Never edit an applied migration.
- **Forbidden field name:** do not name a custom field `status` on any collection with drafts. Use `leadStatus`, `stockStatus`, and so on. Payload manages `_status` itself.
- **Time:** all timestamps are UTC (`timestamptz`). Display and apply business rules in `Asia/Karachi`.
- **Money:** integer PKR rupees (`ADR-011`). One pricing function (`src/lib/pricing.ts`).
- **Slugs:** lowercase ASCII with hyphens, unique within their collection, reserved list in `docs/CONTENT.md` section 3.
- **Limits:** every text field has `maxLength` and every list has `minRows`/`maxRows`, taken from `src/cms/limits.ts`. A test enforces it.
- **Personal data:** only in `leads`, `lead-photos` metadata and `users`. Never in logs, `audit-logs` values or analytics.
- **Drafts and versions:** on for `pages`, `services`, `locations`, `products`, `posts` and the editable globals. Scheduled publish on. Keep a bounded number of versions per document (for example 50).
- **Trash (soft delete):** on for `pages`, `categories`, `services`, `locations`, `products`, `posts`, `reviews`, `media`. A trashed document cannot have a version restored until it is restored from trash.

---

## 2. Collections

### `users`
| Field | Notes |
|---|---|
| `email` | Login. Unique |
| `name` | |
| `roles` | Multi-select: `super-admin`, `editor`, `product-manager`, `sales-support` |
| `totp` group | Encrypted secret, `enabled`, `enrolledAt`; recovery codes stored **hashed** (CP-2.2) |
| `lastLoginAt` | |
Auth: lockout after failed attempts, short session lifetime, secure cookies. No public create.

### `categories` (nested tree)
`title`, `slug`, `parent` (self relation), `kind` (`services`, `industries`, `locations`, `blog`, `products`, `general`), `intro` (`shortParagraph`), `showInNav`, `navOrder`, `seo` group. The full path is computed (`/industries/restaurants-and-hotels`) and unique.

### `pages`
`title`, `slug`, `category` (relation, optional), `path` (computed, unique), `template` (`standard`, `landing`, `legal`, `form`), `isLegal` (boolean, Super Admin publish only), `layout` (blocks, 1–30), `seo` group, `noindex`, `publishedAt`. Drafts, versions, scheduled publish, trash.

### `services`
`title`, `slug`, `category`, `icon`, `shortDescription` (`cardBody`), `heroImage`, `signs[]` (3–10), `treatmentSteps[]` (3–8: title, body), `productsUsed` (relation to products, max 6), `startingPrice` (rupees, optional), `priceUnit`, `areasServed` (relation to locations), `faqs[]` (3–8), `layout` (optional extra blocks), `seo`, `order`. Drafts, trash.

### `locations` (nested)
`name`, `slug`, `type` (`city`, `area`), `parent` (city for an area), `intro`, `localNotes` (400–1,500 characters), `neighbourhoods[]` (min 3), `commonPests[]` (min 2), `servicesAvailable` (relation), `faqs[]` (min 3), `nearbyAreas` (relation), `geo` (latitude, longitude, optional), `seo`. Publish gates in `docs/CONTENT.md` section 7.4. Similarity check hook compares `localNotes` with siblings.

### `products`
| Field | Notes |
|---|---|
| `title`, `slug`, `category` | |
| `images[]` | 1–6, each with alt |
| `description`, `howToUse`, `safetyInfo` | Limited text (`paragraph` lists) |
| `packSizes[]` | 1–8: `label`, `sku`, `rate` (rupees), `stockStatus` (`in_stock`, `low`, `out`, `preorder`) |
| `discount` group | `type` (`percent`, `fixed`), `value`, `startsAt`, `endsAt` (ADR-013) |
| `safetyDocuments[]` | Relation to media (PDF) |
| `featured` | boolean |
| `seo` | |
Hooks: validate discount (percent 1–90, fixed less than the lowest rate, end after start); write `price-history`.

### `price-history` (create-only, no edits)
`product`, `packSku`, `oldRate`, `newRate`, `oldDiscount` (json), `newDiscount` (json), `changedBy`, `changedAt`, `source` (`admin`, `inline`, `csv`).

### `posts` (Pest Library)
`title`, `slug`, `excerpt`, `coverImage`, `category`, `body` (restricted Lexical, cap `postBody`), `author` (relation to users, display name), `relatedServices`, `relatedLocations`, `publishedAt`, `seo`. Drafts, trash.

### `reviews`
`reviewerName`, `city`, `text` (`reviewText`), `rating` (1–5), `source` (`google`, `facebook`, `direct`), `sourceUrl`, `reviewDate`, `verified` (boolean), `permissionConfirmed`. Only verified reviews can render.

### `leads`
| Field | Notes |
|---|---|
| `type` | `contact`, `quote`, `inspection` |
| `name`, `phone`, `email` | Validated; phone normalised |
| `city`, `area`, `propertyType`, `pestType`, `preferredTime`, `message` | Limited |
| `items[]` | Quote basket: product, pack, quantity (max 20) |
| `photos[]` | Relations to `lead-photos` (max 3) |
| `sourcePath`, `referrer`, `utm` group | Attribution |
| `leadStatus` | `new`, `contacted`, `quoted`, `won`, `lost`, `spam` |
| `assignedTo` | Relation to users (Sales and Support) |
| `notes[]` | `author`, `text`, `createdAt` |
| `consent` | Boolean plus timestamp |
| `ipHash` | Salted hash for abuse checks, never the raw IP |
| `retainUntil` | From the retention setting (Q12) |
Indexes: `createdAt`, `leadStatus`, `assignedTo`. Delete is Super Admin only.

### `lead-photos`
Metadata only: `lead`, `storageKey`, `contentType`, `bytes`, `iv`, `authTag`, `createdAt`. File bytes are encrypted in the private bucket (`docs/STORAGE.md`). No public URL ever.

### `media`
Payload upload collection on the Filebase **public** bucket: `alt` (required, `altText`), `caption`, sizes, `focalPoint`. Images only plus PDF for safety documents. Allowed types and size caps in `docs/STORAGE.md`.

### `redirects`
`from` (path, unique), `to` (path or URL), `type` (301 or 302), `note`, `source` (`manual`, `import`, `auto`). Auto entries are created when a slug changes.

### `audit-logs` (create-only)
`actor`, `action`, `collection`, `documentId`, `summary` (no personal data), `ipHash`, `createdAt`. Super Admin read only.

### `rate_limits` (internal table, ADR-009)
`key`, `windowStart`, `count`. Cleaned by a scheduled job.

### Globals
| Global | Fields and access |
|---|---|
| `site-settings` | company name, phones (0–4), WhatsApp number, email, address, hours, timezone, social links (0–8), chat provider/hours, lead alert recipients (0–5), retention months (1–60). Public read for contact settings; lead alert recipients are Super Admin read-only. Super Admin updates all fields; Editor updates company/contact/social fields only; operational chat, alert recipients and retention settings are Super Admin-only. Defaults contain no phone, address, email, hours or social facts. |
| `navigation` | Header items (1–8, children 0–10), header buttons (0–3), footer columns (1–5, links 1–10), legal links (1–6). Public read; Super Admin and Editor update. |
| `home` | Not a global: Home is the `pages` document with slug `home` |

**Row lifecycle (verified on a fresh migrated database 2026-11-21):** neither global has a database row until the **first save** — reads (`payload.findGlobal`, and therefore the seed's read) return the field defaults and create nothing: `navigation.headerItems` comes back `[]` with 0 rows, `site-settings` returns only its defaults (`companyName`, `timezone`) with contact values null and 0 rows. The first `navigation` save inserts its row (verified: 1 row after `updateGlobal`). The first `site-settings` save must supply the four required contact fields (`whatsapp_number`, `email`, `address`, `working_hours` are `NOT NULL` with no DB defaults) — a partial save is rejected by field validation naming exactly those four. Until staff save it, reads show **null contact values — deliberately, so no placeholder contact detail can ever be read as real**.

---

## 3. Blocks

Blocks are defined once and used by `pages`, `services`, `locations`, `products`, `posts` where allowed. Catalogue, fields and gates: `docs/CONTENT.md` section 6. Allowed blocks per collection are set in `src/blocks/allowed.ts`.

---

## 4. Role access matrix

`C` create, `R` read, `U` update, `D` delete (including trash), `P` publish. `–` none. Tests generate one case per cell.

| Collection | Super Admin | Editor | Product Manager | Sales and Support |
|---|---|---|---|---|
| users | CRUD | R self | R self | R self |
| categories | CRUD | CRUD | R | R |
| pages | CRUDP | CRUDP (not legal) | R | R |
| services | CRUDP | CRUDP | R | R |
| locations | CRUDP | CRUDP | R | R |
| posts | CRUDP | CRUDP | R | R |
| reviews | CRUD | CRUD | R | R |
| products | CRUDP | R | CRUDP | R |
| price-history | R | – | R | – |
| media | CRUD | CRUD | CRUD | R |
| leads | CRUD | – | – | CRU (no delete) |
| lead-photos | R | – | – | R (via staff viewer only) |
| redirects | CRUD | R | – | – |
| audit-logs | R | – | – | – |
| site-settings | U | U (contact fields) | – | – |
| navigation | U | U | – | – |

Public (no login): read **published** documents of `pages`, `categories`, `services`, `locations`, `products`, `posts`, `reviews` (verified only), `media`. Everything else is denied. Access functions live in `src/access/` and are reused, never re-written per collection.

**Panel entry vs collection access (implemented 2026-11-19):** every role signs in to `/admin`. Payload gates whole-panel entry through `users.access.admin` (`canAccessAdmin`), so it is deliberately left unrestricted; the matrix above governs what each role may do inside. **Open (Q18):** non–super-admins get `R self` only, so they cannot change their own name/password from the Account screen (Payload implements that as an `update`). If staff should self-serve password changes, the matrix and `src/access/roles.ts` change together.

---

## 5. Migrations log

Add one entry per applied migration. Include how to roll back and what to check.

| Date | Migration | What and why | Rollback / notes |
|---|---|---|---|
| 2026-11-19 | `20261119_101405_initial` | Initial schema for CI/production: `users` (+ `users_roles`, `users_sessions`), `media`, Payload system tables — 10 `CREATE TABLE`, identical to the dev database. Needed because CI/production build pages that query Payload and `payload.config.ts` never pushes schema outside development. | Created with `payload migrate:create`; verified end-to-end on an empty scratch database 2026-11-19 (10 tables + `payload_migrations` row, then dropped). CI runs `pnpm payload migrate` before `pnpm build`. Local dev still runs on schema push, so it has no `payload_migrations` row — expected. Down drops all 10 tables; never run it where data matters. |
| 2026-11-19 | `20261119_171018_add_categories_and_pages` | CP-1.2: `categories` (nested, `path` unique) and `pages` (drafts, versions, blocks join tables). Row added at CP-1.3 because it was generated but never logged here. | Created with `payload migrate:create`; applied on the empty scratch DB together with the other migrations at CP-1.3 (2026-11-20). Down drops the tables; never run it where data matters. |
| 2026-11-20 | `20261120_114629_add_globals` | CP-1.3: the two globals — `site_settings` (+ `site_settings_phones`, `_social_links`, `_lead_alert_recipients`) and `navigation` (+ header/footer/legal arrays) — 11 `CREATE TABLE`, 3 enums (`social_links_platform`, `chat_provider`, `header_buttons_kind`). | Created with `payload migrate:create --name add_globals`; verified twice on an empty scratch DB 2026-11-20 (all 3 migrations apply in order, tables listed, `payload_migrations` row recorded, DB dropped). Down drops all 11 tables and the 3 enums; never run it where data matters. |

### Rules

- Generate with the Payload CLI, read the SQL, run it against a copy of production data first.
- Data migrations (backfills, renames) are separate, idempotent and resumable.
- Take a backup before applying in production (`docs/OPERATIONS.md`).
- Unique indexes (slugs, `redirects.from`) are checked for duplicates before creation.

---

## 6. Seeds

| Command | Environment | Purpose |
|---|---|---|
| `pnpm seed:admin` | any | Create the first Super Admin. Email from env or prompt. Sends an invite or prints a one-time link. Refuses to run if a Super Admin exists |
| `pnpm seed` | development, staging | Appends one clearly labelled **SAMPLE** category and draft page to their respective collections. Leaves globals/contact settings untouched, refuses production, reads both globals first (fails fast if the globals config is broken) and is idempotent by the sample slugs. |

No seed ever contains real customer data or invented business facts presented as real. Sample content makes no service, qualification, results, price, or availability claims; sample records are drafts and must be replaced or removed before launch.

---

## 7. Hooks that matter

- `beforeValidate`: apply limits, normalise phone numbers and slugs.
- `beforeChange`: publish gates (`docs/INLINE-EDITING.md` section 9), discount validation.
- `afterChange`: `revalidateTag` for affected pages and menus; write `price-history`; write `audit-logs`; auto-redirect on slug change.
- `afterDelete`: remove orphaned media references; log.
- Never put secrets or personal data in hook logs.
