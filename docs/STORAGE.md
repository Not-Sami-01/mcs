# STORAGE — Filebase

> **Status:** `media` pipeline implemented (CP-1.1, 2026-11-19): S3 adapter → single public bucket `vaultifier`, prefix `media/`, WebP/AVIF variants, required alt, size caps, integration round trip passing. **Delivery path decided** (CP-1.1 spike, 2026-11-19, §4 / ADR-015): direct Filebase URLs once the bucket is public, Payload's media route until then. Customer photo pipeline (section 5) is still open. Update when buckets, env vars or the upload pipeline change.
> Facts about Filebase below were checked against its documentation on 2026-11-17 and re-checked 2026-11-19 (endpoint/region). Re-check plan limits in the Filebase console when buckets change.

---

## 1. What Filebase is, and the one thing to remember

Filebase is an S3-compatible service that stores data on decentralized networks (mainly IPFS). You use the normal S3 API and AWS SDK.

**Everything stored in an IPFS bucket is retrievable through its IPFS CID and public gateways, even if the bucket is marked private.** Private only blocks the plain S3 URL. Treat any object as potentially public to anyone who learns its CID.

Consequences for this project:

- Site images, product images and safety PDFs are meant to be public. No problem.
- **Customer photos are sensitive. They must be encrypted by our server before upload** (section 5). Then a leaked CID reveals only ciphertext.
- Deleting an object unpins it from Filebase. It cannot recall copies others already fetched or cached. Encryption is the real protection.
- Treat objects as immutable. Writing new content creates a new CID. Use a **new key per upload** (for example `media/<yyyy>/<uuid>-<hash>.webp`) so caches never serve stale files.

---

## 2. Connection details

| Item | Value |
|---|---|
| API | S3-compatible, AWS Signature V4 only (v2 not supported) |
| Endpoint | `https://s3.filebase.io` with region `auto` — confirmed against current Filebase docs 2026-11-19. Both are env vars, never hard-coded (the older `s3.filebase.com` / `us-east-1` pair appears in legacy docs) |
| Addressing | Path-style (`forcePathStyle: true`) is the safe default with custom endpoints |
| Credentials | Access key and secret from the Filebase console. Server only |
| Rate limit | About 100 requests per second effectively |
| ACLs | Object-level ACLs are **not supported**. Do not set `acl` in the adapter |
| Pre-signed URLs | Supported for upload and download (default 1 hour) |
| CORS | Supported per bucket (`PutBucketCors`). Needed only if the browser talks to a bucket directly |
| Bucket access | One bucket is used (below). The human makes it public (confirmed 2026-11-19, Q13); buckets are private by default on Filebase |
| Large files | Use multipart above 5 GB. Not relevant here |

---

## 3. Buckets

**Decision (2026-11-19, human): one bucket, `vaultifier`, made public.** The earlier two-bucket plan (public media / private uploads, which needed a paid plan) is dropped; a split can return later without code changes because the bucket name is env config.

| Prefix in `vaultifier` | Contents | Access | Encryption |
|---|---|---|---|
| `media/...` | Site images, product images, blog images, safety PDFs | Public | None needed |
| `leads/...` | Customer inspection photos | Public bucket, **but ciphertext only** | **Mandatory**, AES-256-GCM by our server before upload |

Use a separate bucket per environment when one exists (`-staging`, `-dev`) so staging data never mixes with production; until then the key prefixes must stay disjoint.

### Key naming

```
media:   media/2026/<uuid>-<contenthash>.<ext>
photos:  leads/<leadId>/<uuid>.bin          # ciphertext only
```

Never put names, phone numbers or other personal data in keys.

---

## 4. Public media pipeline (Payload `media` collection)

1. Editor uploads in the admin panel or inline media picker.
2. Server validates: allowed types (JPEG, PNG, WebP, AVIF, and PDF for safety documents), size caps (images 8 MB, PDFs 10 MB; tune), real type by content, dimensions cap.
3. sharp generates sizes and modern formats. Original metadata (EXIF) is stripped from images.
4. Files upload through the Payload S3 storage adapter configured with the Filebase endpoint and the `vaultifier` bucket (`FILEBASE_BUCKET`).
5. `alt` text is required. No alt, no save.

### Delivery path (spike run 2026-11-19; decided — ADR-015)

**Chosen: Filebase direct at launch (`https://<bucket>.s3.filebase.io/<object-key>`), Payload's media route (`/api/media/file/…`) until the bucket is public. No Next image optimizer in the hot path, no Cloudflare at launch.**

Every candidate was probed live on 2026-11-19 against the real bucket and a production build:

| Path | What the probe showed | Verdict |
|---|---|---|
| **Filebase direct** `https://vaultifier.s3.filebase.io/media/…` | This is the URL form Filebase documents for public buckets; served from their edge CDN, no egress fees, honours the `Cache-Control` set at upload. Signed GET = 200 (12 953 bytes); anonymous GET = **403** — the bucket is still private (Q13 flip pending) | **Launch path.** Blocked only on the human making the bucket public; the switch is env-only |
| **Payload media route** `/api/media/file/…?prefix=media` | 200 + ETag + correct content-type, with and without `?prefix=`. **No `Cache-Control` header**, and every hit streams through our serverless function | **Interim path.** Works with a private bucket; this is what the CP-1.1 test page uses |
| **Next image optimizer** `/_next/image` | 200 on query-less URLs (resized 828×466, 923 bytes, `Cache-Control: public, max-age=0, must-revalidate`), but **400 `"url" parameter is not allowed`** for `?prefix=media`: Next 16's default `images.localPatterns` is `{pathname: '**', search: ''}` and `search` matches as an exact string (gotcha 23) | **Not used.** Upload already generates thumb/card/hero variants in WebP + AVIF, and Vercel image optimization is metered (ADR-012). Revisit only if on-demand widths become necessary |
| **Cloudflare in front** | Not testable yet — no domain exists (Q9). Filebase already caches public buckets at the edge | **Deferred** until the domain exists |
| **IPFS gateway URLs** | No CID in object headers (checked a signed GET); `vaultifier.ipfs.filebase.io` and `ipfs.filebase.io` do not resolve | **Rejected** |

**The flip (one env var, no re-upload):** after the human makes the bucket public, verify with an anonymous `curl` of the public URL, then set `FILEBASE_PUBLIC_BASE_URL=https://vaultifier.s3.filebase.io`. `src/payload.config.ts` passes a per-collection `generateFileURL` to the storage plugin only when that var is set, so every `url` and size URL is rewritten to the direct form on read. Empty value = Payload route, nothing else changes.

Whatever path serves the bytes: versioned keys should carry a long `Cache-Control` at upload time (Filebase honours it), and if `next/image` is ever pointed at Payload media URLs, set `images.localPatterns` narrowly (exact pathname **and** exact `search`, gotcha 23) or `remotePatterns` for the Filebase host.

---

## 5. Customer photo pipeline (inspection form)

Goal: staff can see a customer's photo; nobody else can, even with the CID.

1. **Client:** resize to about 1600 px and compress before upload (small on slow 4G; stays under hosting body limits).
2. **Server route** `POST /api/public/leads/photos` (rate limited, Turnstile):
   - Count (max 3), size (max about 2 MB each after resizing), real file type by magic bytes (JPEG, PNG, WebP only).
   - Decode and **re-encode** with sharp. This drops all metadata, including GPS location, and neutralises malformed or polyglot files.
   - **Encrypt** with AES-256-GCM using a random 12-byte IV per file. Key from `UPLOAD_ENCRYPTION_KEY` (32 random bytes, base64). Store `iv` and `authTag` in `lead-photos` metadata, ciphertext in the bucket.
   - Upload under the `leads/` prefix with a random key (ciphertext only — this is what protects the photo in a public bucket).
   - Return a short-lived signed `photoToken` that `POST /api/public/leads` redeems.
3. **Staff viewing:** `GET /api/staff/lead-photos/[id]` checks session, two-factor state and role, fetches ciphertext, decrypts in memory, streams with `Cache-Control: private, no-store`.
4. **Cleanup:** a scheduled job deletes uploads with no lead after a short time, and deletes photos when the lead's `retainUntil` passes or a Super Admin deletes the lead (unpin; remember the CID caveat, which is why encryption matters).
5. **Key rotation:** keep a key ID in metadata so a new key can be introduced and old photos re-encrypted by a job. Never log keys or plaintext.

Never: keep the original uploaded bytes, put plaintext photos anywhere in the bucket, use presigned public GET links for customer photos, or log file contents.

---

## 6. Environment variables

| Name | Purpose |
|---|---|
| `FILEBASE_ENDPOINT` | S3 endpoint URL (`https://s3.filebase.io`) |
| `FILEBASE_REGION` | Region string for signing (`auto`) |
| `FILEBASE_ACCESS_KEY_ID` | Access key |
| `FILEBASE_SECRET_ACCESS_KEY` | Secret key |
| `FILEBASE_BUCKET` | The single bucket that holds all uploads (`vaultifier`) |
| `FILEBASE_PUBLIC_BASE_URL` | Base URL used to build public media URLs (gateway, CDN, or bucket URL); empty = serve via Payload's media route |
| `UPLOAD_ENCRYPTION_KEY` | Base64 32-byte key for customer photos |
| `UPLOAD_ENCRYPTION_KEY_ID` | Identifier of the active key |

Use different keys per environment. Rotate on suspected exposure. Values never appear in the repo, logs or docs.

---

## 7. Checks and tests

- ✅ Upload, read back (byte-identical from S3), delete round trip — `src/collections/media.integration.test.ts` (5 tests; runs locally with real credentials, **skipped in CI** where env values are placeholders; verified 5/5 twice on 2026-11-19).
- ✅ Alt text enforced: create without alt is rejected by the `required` field.
- ✅ Size cap enforced server-side: an 11 MB valid PDF is rejected with our `larger than the 10 MB limit` error (Payload has no built-in file size limit; `Media.ts` `beforeValidate` is the enforcement).
- Customer photo: uploaded bytes in the bucket are **not** a valid image (ciphertext); decrypt returns an image with **no** EXIF/GPS.
- Wrong file type, oversize, too many files, and mismatched extension are rejected.
- Public bucket listing is not exposed; the app never lists buckets per request.
- A request without role gets `401` or `403` on the photo route; a staff user of the wrong role gets `403`.
- Media without alt text cannot be saved.
- ✅ **Delivery-path spike (CP-1.1, 2026-11-19):** all five candidate paths probed with real requests (signed GET 200 12 953 B, anonymous 403/000 while the bucket is private, Payload media route 200 but no `Cache-Control`, Next optimizer 400 on `?prefix=media`, IPFS gateway unreachable) — decision recorded in ADR-015 §4 above.
- ✅ **Direct-URL flip:** `src/cms/media-urls.ts` `publicFileUrl` + 3 unit tests; `payload.config.ts` wires `generateFileURL` only when `FILEBASE_PUBLIC_BASE_URL` is set (currently empty — bucket still private; anonymous `curl` returns 000/403).
- ✅ **Test page (exit criterion):** `/media-test` (`src/app/(frontend)/media-test/page.tsx`, static, `noindex`) renders real uploads with alt + 3-variant WebP srcset and a delivery-path indicator; empty-library notice when no docs. E2E `tests/e2e/media-test.spec.ts` asserts `naturalWidth > 0` — **3/3 pass** with the staging build; production smoke: page 200 and image `src` present.

---

## 8. Backups

Filebase replicates data, but replication is not a backup of mistakes. Keep an independent copy of `mcs-public-media` (periodic sync to another provider or a local archive) and record the schedule in `docs/OPERATIONS.md`. Photos in the private bucket follow the retention policy (Q12); do not copy them to places with weaker protection.
