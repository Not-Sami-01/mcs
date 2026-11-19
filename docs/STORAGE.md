# STORAGE — Filebase

> **Status:** `media` pipeline implemented (CP-1.1, 2026-11-19): S3 adapter → single public bucket `vaultifier`, prefix `media/`, WebP/AVIF variants, required alt, size caps, integration round trip passing. Delivery path spike and customer photo pipeline (section 5) are still open. Update when buckets, env vars or the upload pipeline change.
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

### Delivery path (decide in CP-1.1 spike)

| Option | How | Pros | Cons |
|---|---|---|---|
| A. Next.js image optimizer | `next/image` with `remotePatterns` for the Filebase public URL | Resizing and formats for free on a VPS; simple | Metered on Vercel; origin latency on first hit |
| B. Payload media route | Payload streams from the bucket through `/api/media/file/...` | Access control applies | Every image hits our server; slower |
| C. Cloudflare in front | Custom media domain proxied or cached by Cloudflare | Fast, cheap, offloads Filebase's request limit | Needs the right origin or Worker setup; test with Filebase's public URL format |
| D. Filebase dedicated gateway | Paid gateway domain | Built for serving | Extra cost; vendor tie |

**Default until the spike:** A with Cloudflare caching in front (A + C). Record the outcome in `DECISIONS.md`. Whatever is chosen: set long `Cache-Control` on versioned keys, and set `images.remotePatterns` narrowly (exact host, path prefix).

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

---

## 8. Backups

Filebase replicates data, but replication is not a backup of mistakes. Keep an independent copy of `mcs-public-media` (periodic sync to another provider or a local archive) and record the schedule in `docs/OPERATIONS.md`. Photos in the private bucket follow the retention policy (Q12); do not copy them to places with weaker protection.
