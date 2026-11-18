# STORAGE — Filebase

> **Status:** designed, not implemented (CP-1.1 and CP-6.3). Update when buckets, env vars or the upload pipeline change.
> Facts about Filebase below were checked against its documentation on 2026-11-17. Re-check the endpoint, region and plan limits in the Filebase console before CP-1.1.

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
| Endpoint | `https://s3.filebase.com` with region `us-east-1`. Filebase's newer docs also show `https://s3.filebase.io` with region `auto`. **Confirm which one your account uses.** Both are env vars, never hard-coded |
| Addressing | Path-style (`forcePathStyle: true`) is the safe default with custom endpoints |
| Credentials | Access key and secret from the Filebase console. Server only |
| Rate limit | About 100 requests per second effectively |
| ACLs | Object-level ACLs are **not supported**. Do not set `acl` in the adapter. Use separate buckets for public and private data |
| Pre-signed URLs | Supported for upload and download (default 1 hour) |
| CORS | Supported per bucket (`PutBucketCors`). Needed only if the browser talks to a bucket directly |
| Public buckets | Available on **paid** plans only. Buckets are private by default |
| Large files | Use multipart above 5 GB. Not relevant here |

---

## 3. Buckets

| Bucket (names are examples) | Contents | Access | Encryption |
|---|---|---|---|
| `mcs-public-media` | Site images, product images, blog images, safety PDFs | Public (paid plan) | None needed |
| `mcs-private-uploads` | Customer inspection photos | Private; app credentials only | **Mandatory**, AES-256-GCM by our server before upload |

Use separate buckets per environment (`-staging`, `-dev`) so staging data never mixes with production.

### Key naming

```
public:   media/2026/<uuid>-<contenthash>.<ext>
private:   leads/<leadId>/<uuid>.bin          # ciphertext only
```

Never put names, phone numbers or other personal data in keys.

---

## 4. Public media pipeline (Payload `media` collection)

1. Editor uploads in the admin panel or inline media picker.
2. Server validates: allowed types (JPEG, PNG, WebP, AVIF, and PDF for safety documents), size caps (images 8 MB, PDFs 10 MB; tune), real type by content, dimensions cap.
3. sharp generates sizes and modern formats. Original metadata (EXIF) is stripped from images.
4. Files upload through the Payload S3 storage adapter configured with the Filebase endpoint and the **public** bucket.
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
   - Upload to the **private** bucket under a random key.
   - Return a short-lived signed `photoToken` that `POST /api/public/leads` redeems.
3. **Staff viewing:** `GET /api/staff/lead-photos/[id]` checks session, two-factor state and role, fetches ciphertext, decrypts in memory, streams with `Cache-Control: private, no-store`.
4. **Cleanup:** a scheduled job deletes uploads with no lead after a short time, and deletes photos when the lead's `retainUntil` passes or a Super Admin deletes the lead (unpin; remember the CID caveat, which is why encryption matters).
5. **Key rotation:** keep a key ID in metadata so a new key can be introduced and old photos re-encrypted by a job. Never log keys or plaintext.

Never: put photos in the public bucket, use presigned public GET links for them, keep the original uploaded bytes, or log file contents.

---

## 6. Environment variables

| Name | Purpose |
|---|---|
| `FILEBASE_ENDPOINT` | S3 endpoint URL |
| `FILEBASE_REGION` | Region string for signing |
| `FILEBASE_ACCESS_KEY_ID` | Access key |
| `FILEBASE_SECRET_ACCESS_KEY` | Secret key |
| `FILEBASE_PUBLIC_BUCKET` | Public bucket name |
| `FILEBASE_PRIVATE_BUCKET` | Private bucket name |
| `FILEBASE_PUBLIC_BASE_URL` | Base URL used to build public media URLs (gateway, CDN, or bucket URL) |
| `UPLOAD_ENCRYPTION_KEY` | Base64 32-byte key for customer photos |
| `UPLOAD_ENCRYPTION_KEY_ID` | Identifier of the active key |

Use different keys per environment. Rotate on suspected exposure. Values never appear in the repo, logs or docs.

---

## 7. Checks and tests

- Upload, read, delete round trip against a dev bucket (integration test, skipped without credentials).
- Customer photo: uploaded bytes in the bucket are **not** a valid image (ciphertext); decrypt returns an image with **no** EXIF/GPS.
- Wrong file type, oversize, too many files, and mismatched extension are rejected.
- Public bucket listing is not exposed; the app never lists buckets per request.
- A request without role gets `401` or `403` on the photo route; a staff user of the wrong role gets `403`.
- Media without alt text cannot be saved.

---

## 8. Backups

Filebase replicates data, but replication is not a backup of mistakes. Keep an independent copy of `mcs-public-media` (periodic sync to another provider or a local archive) and record the schedule in `docs/OPERATIONS.md`. Photos in the private bucket follow the retention policy (Q12); do not copy them to places with weaker protection.
