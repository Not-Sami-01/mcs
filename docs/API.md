# API — Routes, Actions and Endpoints

> **Status:** planned. Update in the same commit as any route change. Every route lists its audience, validation, rate limit and what it must never return.
> Payload provides its own REST and GraphQL under `/api/<collection>` and `/api/graphql`. Our custom routes sit under `/api/public/*` and `/api/staff/*`, which are more specific than Payload's catch-all and take precedence.

---

## 1. Audiences

| Audience | Auth | Examples |
|---|---|---|
| Public | None | Forms, health |
| Staff | Payload session + role; enrolled accounts must also have the verified two-factor cookie | Lead export, photo viewer, CSV import |
| Internal | Server only | Local API calls inside server components and actions |

Rules for every custom route:

1. Parse and validate input with Zod. Reject unknown fields and oversize bodies.
2. Check auth and role on the server before reading or writing.
3. Rate limit (public routes: per IP hash and per route).
4. Return the minimum. Never return stack traces, SQL errors, secrets, internal IDs not needed by the client, or other users' data.
5. Use consistent error shape: `{ "error": { "code": "VALIDATION", "message": "...", "fields": { "phone": "..." } } }`.
6. Log without personal data (`docs/SECURITY.md` section C14).

---

## 2. Payload built-ins (staff and public reads)

| Route | Methods | Access |
|---|---|---|
| `/api/users/login`, `/api/users/logout`, `/api/users/me`, `/api/users/forgot-password`, `/api/users/reset-password` | POST/GET | Login flow. Invite uses the reset-password mechanism (ADR-016). `/api/users/first-register` and anonymous `POST /api/users` return **403** (CP-2.1, verified) |
| `/api/users/totp/setup`, `/totp/verify`, `/totp/validate`, `/totp/status` | POST/GET | Two-factor flow (CP-2.2, plugin). `setup`, `verify` and `status` are reachable with a first-factor session so enrolment can happen; `validate` accepts a recovery code once. A session without the verified cookie is refused on every other data-API operation **when the account has enrolled** (two-factor is optional since 2026-11-24) |
| `/api/users/totp/reenroll` | POST | Super Admin only; a Super Admin who has enrolled must also present the verified second factor. Body `{ email }`. Clears the target's enrolment; they can re-enrol at `/admin/setup-totp`. Returns `{ ok: true }` |
| `/api/pages`, `/api/services`, `/api/locations`, `/api/products`, `/api/posts`, `/api/categories`, `/api/reviews` | GET | Public: **published only**. Writes need a role (matrix in `docs/DATABASE.md`) |
| `/api/media`, `/api/media/file/...` | GET/POST | Public read of public media. Upload needs a role |
| `/api/leads`, `/api/lead-photos`, `/api/price-history`, `/api/redirects` | any | Staff only, per matrix. Deny public |
| `/api/audit-logs` | GET | Super Admin read only (CP-2.3). No HTTP create, update or delete exists; entries come from server hooks |
| `/api/graphql` | POST | Disabled unless needed. If enabled, same access rules and a depth limit |

Decide in CP-0.3 whether to keep GraphQL at all. Default: off.

---

## 3. Public routes

| Route | Method | Purpose | Notes |
|---|---|---|---|
| `/api/health` | GET | Liveness and database ping | Returns `{ "ok": true }` with 200 when PostgreSQL responds to `select 1`; otherwise `{ "ok": false }` with 503. `Cache-Control: no-store`. No versions, errors or env |
| `/api/public/leads` | POST | Create a lead (`contact`, `quote`, `inspection`) | **Planned (CP-6.2).** Zod, Turnstile token, honeypot, rate limit, payload cap |
| `/api/public/leads/photos` | POST | Upload up to 3 photos for a pending lead | See section 5 |

### `POST /api/public/leads`

Request (JSON):

```json
{
  "type": "inspection",
  "name": "string, 2-80",
  "phone": "string, normalised to +92...",
  "email": "optional string",
  "city": "string",
  "area": "string",
  "propertyType": "home | builder | restaurant | hotel | school | hospital | factory | other",
  "pestType": "string",
  "preferredTime": "string",
  "message": "string, max 1000",
  "items": [{ "product": "id", "pack": "sku", "quantity": 1 }],
  "photoToken": "optional, from the photo upload step",
  "consent": true,
  "sourcePath": "/services/termite",
  "utm": { "source": "", "medium": "", "campaign": "" },
  "turnstileToken": "string",
  "website": ""
}
```

- `website` is the honeypot. Non-empty means a bot: respond as if accepted, store nothing.
- Response `201`: `{ "ok": true }`. Never echo the lead.
- Side effects: row in `leads` (retention and consent stamped), email alert to configured recipients, audit entry. Email failure does not fail the request; the error is recorded on the lead and shown in the inbox (`alertError`). Route not built yet (CP-6.2).
- Errors: `400 VALIDATION`, `403 SPAM`, `413 TOO_LARGE`, `429 RATE_LIMITED`.

---

## 4. Staff routes

| Route | Method | Roles | Purpose |
|---|---|---|---|
| `/api/staff/leads/export` | GET | Super Admin, Sales and Support | **Implemented (CP-6.1).** CSV of filtered leads (`?leadStatus=`, `?assignedTo=`). Audited. Formula-injection safe (prefix cells starting with `= + - @`) |
| `/api/staff/lead-photos/[id]` | GET | Super Admin, Sales and Support | Fetch, decrypt, stream. `Cache-Control: private, no-store`, `Content-Disposition` inline for images only |
| `/api/staff/products/export` | GET | Super Admin, Product Manager | CSV export |
| `/api/staff/products/import` | POST | Super Admin, Product Manager | `?mode=dry-run` returns row-level results; `?mode=commit` applies. Size and row caps. Writes `price-history` |
| `/api/staff/redirects/import` | POST | Super Admin | CSV of `from,to,type` with validation and loop detection |

Lead CSV (CP-6.1, `src/csv/leads.ts`): one row per lead, newest first, with the quote basket flattened into a readable `quote_items` cell. Enrolled accounts must have completed 2FA and browser requests must be same-origin. `Cache-Control: private, no-store`; the response is a `text/csv` attachment named `leads-<date>.csv`. The export writes an `export` audit entry containing only the count, never names or phone numbers.

Product CSV (CP-5.4, `src/csv/`):

- **Format:** one row per pack, grouped by `slug`. Columns: `slug, title, pack_label, pack_sku, rate, stock_status, discount_type, discount_value, discount_starts, discount_ends, featured, status`. Discount and product settings repeat on every row of one product and must agree; `title` is required only for a new slug.
- **Export:** every product, one row per pack, `text/csv` attachment. Every cell is formula-injection safe (`=`, `+`, `-`, `@` prefixed with `'`). The export writes an `export` audit entry.
- **Import:** `mode=dry-run` (default) validates and returns `{ ok, valid, totalRows, creates, updates, rows[] }` with one entry per row (`row`, `slug`, `packLabel`, `action`, `errors`); nothing is written. `mode=commit` applies only when **every** row is valid — one bad row returns `422` with the same row results and writes nothing. Caps: 1 MB and 500 rows (`413`). Matching is by `slug`, so a price-list import updates products instead of duplicating them; published products stay published unless the file sets `status`, and the products hook records `price-history` with `source: csv` plus one `price_change` audit entry per save.
- **Errors:** `400` bad mode, `401` signed out, `403` wrong role, cross-origin request or second factor not completed, `413` too large, `422` invalid CSV or rows.

There is **no public revalidation endpoint**. Content hooks call `revalidateTag` directly.

---

## 5. Customer photo upload (summary)

1. Browser resizes each image (max about 1600 px, JPEG or WebP) so the request stays small on slow networks and under hosting limits.
2. `POST /api/public/leads/photos` with multipart files and a Turnstile token. Server checks: count, size, real file type by magic bytes (not the extension), dimensions.
3. Server strips metadata (EXIF, location), re-encodes, encrypts (AES-256-GCM) and uploads to the **private** bucket. Returns a short-lived signed `photoToken` that the lead request references.
4. Orphaned uploads (no lead within a short time) are deleted by a job.
5. Staff view photos only through `/api/staff/lead-photos/[id]`.

Full rules: `docs/STORAGE.md`.

---

## 6. Edit-mode Server Actions

Defined in `src/app/(edit)/actions/`. They are not HTTP APIs, but their inputs are validated like routes. **CP-4.1–4.3 implement every row below.** Every action re-checks session, role and two-factor state, then runs the Payload Local API with the staff `user` and `overrideAccess: false`. `saveDraft` and `saveGlobal` validate recursively against `src/edit/registry.ts` (text caps, row bounds, select options, link schemes, number ranges). `saveDraft` carries `expectedUpdatedAt` and reports a conflict with the saved values.

| Action | Input (summary) | Result |
|---|---|---|
| `saveDraft` (implemented) | `{ pageId, blockId?, blockIndex, values: Record<string, unknown>, expectedUpdatedAt? }` (nested repeaters/groups) | `{ ok, updatedAt }` or `{ ok: false, code: 'AUTH'\|'TWO_FACTOR'\|'INVALID'\|'NOT_FOUND'\|'FORBIDDEN'\|'CONFLICT', message, fields?, serverUpdatedAt?, serverValues? }` |
| `block` (implemented) | `{ op: 'add', pageId, blockType, index }` or `{ op: 'duplicate'\|'remove'\|'toggleHidden', pageId, blockId }` or `{ op: 'move', pageId, blockId, direction: 'up'\|'down' }` | `{ ok }` or `{ ok: false, code, message }` |
| `saveGlobal` (implemented) | `{ region: 'navigation'\|'contact', values }` | `{ ok }` or `{ ok: false, code, message, fields? }` |
| `publish` (implemented) | `{ pageId }` | `{ ok, updatedAt }` or `{ ok: false, code: 'GATES', message, problems: [{ field, message }] }`; legal pages and roles may also return `FORBIDDEN` |
| `discardDraft` (implemented) | `{ pageId }` | `{ ok, updatedAt }`; restores the draft from the published content |
| `schedulePublish` (implemented) | `{ pageId, publishAt, unpublishAt? }` (ISO 8601, publishAt in the future) | `{ ok, updatedAt }`; queues Payload `schedulePublish` jobs (publish and optional unpublish) after replacing pending jobs for the page |
| `listVersions`, `restoreVersion` (implemented) | `{ pageId }`; `{ pageId, versionId }` | `{ ok, versions: [{ id, updatedAt, status }] }`; restore writes the old version back as a draft |

Conflict result: `{ ok: false, code: 'CONFLICT', message, serverUpdatedAt, serverValues }`. `serverValues` holds the edited fields as currently saved, so the content box can show **See differences** without another request.

### Scheduled-publish runner

`GET /api/cron/jobs` with `Authorization: Bearer $CRON_SECRET` runs up to 100 queued Payload jobs (including scheduled publish and unpublish) and returns `{ ok, noJobsRemaining, remaining }`. Without `CRON_SECRET` it answers `503`; with a wrong header it answers `401`. It always sends `Cache-Control: no-store`.

---

## 7. Framework routes

| Route | Purpose |
|---|---|
| `/sitemap.xml` | Published URLs only, with `lastmod`. Generated by `src/app/sitemap.ts` |
| `/robots.txt` | Production: allow, with sitemap link, disallow `/admin`, `/api`, `/edit`. Non-production: disallow all |
| `/admin/*` | Payload admin. `noindex` |
| `/edit/*` | Edit mode. Dynamic, `noindex`, `no-store` |

---

## 8. Status codes and conventions

| Code | Use |
|---|---|
| 200 / 201 | OK / created |
| 400 | Validation failure |
| 401 | Not signed in |
| 403 | Signed in but not allowed, or spam |
| 404 | Not found (also used to avoid revealing private resources) |
| 409 | Edit conflict |
| 413 | Payload too large |
| 429 | Rate limited |
| 500 | Unexpected. Generic message only |

All dates are ISO 8601 UTC in responses. Money fields are integer rupees.
