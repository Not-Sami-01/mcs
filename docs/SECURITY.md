# SECURITY — Standards, Checklists and Launch Gates

> No website is 100 percent secure. This document sets a checklist, and the project tests it before launch. It is a plan, not a claim that anything is done. Evidence goes in `docs/QUALITY.md` and `docs/PROGRESS.md`.

---

## 1. Assets and actors

| Asset | Why it matters |
|---|---|
| Staff accounts and sessions | Control of all content, leads and prices |
| Leads (names, phones, addresses, messages) | Personal data |
| Customer photos | Sensitive, possibly showing homes and people |
| Prices and product data | Wrong prices cause real money loss |
| Site content | Defacement or malicious links hurt trust and SEO |
| Secrets (database URL, Filebase keys, encryption key, email key) | Full compromise |
| Domain, DNS, hosting, repository | Takeover |

| Actor | Typical attack |
|---|---|
| Anonymous visitor or bot | Form spam, scraping, brute force, injection, upload abuse |
| Stolen staff password | Account takeover, lead export |
| Malicious or careless staff | Bad content, data export |
| Compromised dependency | Supply chain attack |
| Infrastructure provider outage | Downtime |
| Anyone who learns a Filebase CID | Fetches the object (hence encryption) |

---

## 2. Non-negotiables

1. Server-side authorization on every write and every private read. Roles checked on the server.
2. Two-factor login for staff. Lockout after failed logins. No public sign up.
3. All input validated with Zod on the server. Reject unknown fields. Size caps everywhere.
4. Customer photos are re-encoded, stripped of metadata and **encrypted** before storage.
5. No secrets in the repo, logs, client bundles, docs or screenshots. Only `NEXT_PUBLIC_*` values reach the browser, and only non-secret ones.
6. CMS text is rendered as text. No `dangerouslySetInnerHTML` for CMS or user content.
7. HTTPS only, HSTS, security headers, Content Security Policy.
8. Daily backups and a **tested restore**.
9. Dependencies audited and pinned by lockfile. Install scripts reviewed.
10. High and medium findings fixed before launch.

---

## 3. Pre-flight checklists (answer before writing code)

### New or changed route or server action
- [ ] Who may call it (public, staff role)? Is that enforced server-side?
- [ ] Input schema (Zod), size cap, rate limit?
- [ ] Does it read or write personal data? Is the response minimal?
- [ ] Does it need CSRF/origin protection? (Server Actions: keep framework checks on.)
- [ ] Error messages free of internals?
- [ ] Test for unauthenticated, wrong role, bad input?

### New collection or field
- [ ] `maxLength` or row limits from `limits.ts`?
- [ ] Access rules for each role and for public?
- [ ] Contains personal data? Retention and deletion path?
- [ ] Hooks free of secrets in logs?

### New upload flow
- [ ] Allowed types by content, size caps, count caps?
- [ ] Re-encoded, metadata stripped?
- [ ] Public or sensitive? Sensitive means encrypted (`docs/STORAGE.md`)
- [ ] Cleanup of orphans?

### New CMS or edit-mode feature
- [ ] Output escaped? Links and image sources restricted?
- [ ] Publish gates considered? Audit log entry?

### New dependency
- [ ] Maintained, widely used, license ok, no needless install scripts?
- [ ] Added to lockfile intentionally, changelog reviewed?

### Stop and ask the human when
A critical or high finding appears, a secret may have leaked, or a requirement conflicts with a rule here.

---

## 4. Standards by area

### C1. Authentication and sessions
- Staff only. Users created by Super Admin; invite email with a one-time, expiring set-password link.
- Passwords: strong minimum length, allow paste and password managers (WCAG 3.3.8), checked against common-password lists where practical. Hashing is handled by Payload; do not roll your own.
- Two-factor: TOTP plus hashed recovery codes (CP-2.2). Secrets encrypted at rest with `TOTP_ENCRYPTION_KEY`.
- Lockout after repeated failures (Payload's `maxLoginAttempts` and `lockTime`; verify names). Same error for unknown email and wrong password.
- Cookies: `HttpOnly`, `Secure`, `SameSite` set deliberately, short lifetime for staff, logout invalidates.
- Re-verify two-factor on sensitive actions where practical (user changes, exports).

### C2. Authorization
- One set of access helpers in `src/access/`. Collections never write their own role logic.
- Local API calls from custom code pass `user` and `overrideAccess: false` unless a comment explains why not. Search for `overrideAccess: true` in review.
- Public reads return published documents only. Drafts require staff access.
- Matrix in `docs/DATABASE.md` section 4 is tested.

### C3. API layer, CORS and CSRF
- Payload `cors` and `csrf` allowlists contain only our own origins. No `*`.
- Custom routes follow `docs/API.md` section 1.
- Rate limit all public routes. Cap request body sizes.
- GraphQL off unless needed.

### C4. Forms and spam
- Turnstile verified server-side on every public form, plus honeypot, plus rate limit by IP hash and route.
- Validate and normalise phone numbers and emails. Limit message length.
- Do not reveal whether an email or phone already exists.
- Email alert content is escaped; never include raw HTML from users.
- Store `ipHash`, not raw IP.

### C5. Content and XSS
- Marketing content is plain text fields. Blog and legal rich text uses a restricted Lexical feature set and a safe serializer; no raw HTML nodes or embeds.
- Links: allow `http`, `https`, `mailto`, `tel`, relative. Reject `javascript:` and `data:`.
- Add `rel="noopener noreferrer"` on external links.
- JSON-LD is built from structured values and serialised safely (escape `<`).

### C6. Files and storage
Follow `docs/STORAGE.md`: separate buckets, validate by content, re-encode, strip metadata, encrypt customer photos, no ACLs, versioned keys, orphan cleanup, retention.

### C7. Database
- Parameterised access through Payload and Drizzle only. No string-built SQL. If raw SQL is unavoidable, parameterise and review.
- Least-privilege database user for the app; separate migration user if the host allows.
- TLS to the database. Backups encrypted. No production data on laptops.
- Migrations reviewed (`docs/DATABASE.md` section 5).

### C8. Secrets and configuration
- `.env*` ignored by git; `.env.example` has names only. Different secrets per environment.
- Secrets validated at startup (fail fast with a clear message that does not print values).
- Rotate on suspected exposure. Record rotation in `docs/OPERATIONS.md`.

### C9. Browser and headers
Set in `next.config` and verify at the edge:
- `Strict-Transport-Security` (preload only when ready)
- `Content-Security-Policy` (start in report-only, then enforce; allow only our origins, Turnstile, GA4, the chat provider, the media host)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` minimal
- `frame-ancestors 'none'` (clickjacking), except where Payload live preview needs a framing exception limited to our origin
- Admin and edit routes: `noindex`, `no-store`.

### C10. Email
- Authenticated sending domain (SPF, DKIM, DMARC) on the MCS domain.
- Alert emails contain the minimum needed and a link to the inbox, not full personal data where avoidable.
- No user-controlled `From`, `To` or headers (header injection).

### C11. Dependencies and supply chain
- Frozen lockfile in CI. `pnpm audit` (or equivalent) in CI and before launch.
- Review dependencies with install scripts; allow only those that need them (for example sharp).
- Pin exact versions of security-sensitive packages. Update monthly (`docs/OPERATIONS.md`).
- Be cautious of newly published package versions.

### C12. Infrastructure
- Cloudflare in front: WAF, bot protection, rate rules, DNS. Origin accepts traffic from Cloudflare only where possible.
- 2FA on every account MCS owns: registrar, Cloudflare, hosting, database, Filebase, email, GitHub.
- CI secrets stored in the CI secret store; least privilege tokens.

### C13. Privacy and data lifecycle
- Collect the minimum. Consent captured on forms.
- Retention period for leads and photos configurable (Q12); a job deletes expired data.
- Deletion on request: documented procedure.
- Privacy Policy matches what the system really does (lawyer reviewed).
- Analytics: no personal data in events.

### C14. Logging, audit and monitoring
- Structured logs without personal data, secrets or file contents.
- `audit-logs` for logins, 2FA events, user changes, publish, delete, price change, exports.
- Error monitoring and uptime monitoring with alerts to a named person.
- Alert on repeated failed logins, spikes in form submissions, 5xx rates.

---

## 5. Required security tests

| Test | Proves |
|---|---|
| Stranger cannot create or invite users | No public sign up |
| Role matrix, every role × collection × operation | Access control |
| Lockout after N failures | Brute force protection |
| Login without second factor fails on every path | 2FA coverage |
| Public API returns no drafts, no unverified reviews, no leads | Data exposure |
| Overlong and malformed inputs rejected by routes and actions | Validation |
| Honeypot and bad Turnstile token rejected | Spam protection |
| Rate limit returns 429 | Abuse protection |
| Photo upload: wrong type, oversize, polyglot rejected; stored bytes are ciphertext; no EXIF in decrypted output | Upload safety |
| Edit mode never served from cache; public HTML contains no edit markup | Edit isolation |
| `javascript:` link rejected in link fields | XSS vector |
| Security headers present on public, admin and edit responses | Headers |
| Staging responds `noindex`; production does not | Indexing gate |

---

## 6. Launch gates (all must be ticked before go-live)

Mirrors `docs/PLAN.md` launch gates, security subset.

- [ ] HTTPS everywhere; headers verified with a scanner
- [ ] CSP enforced (not just report-only), no violations on key pages
- [ ] Two-factor required for all staff; recovery codes tested
- [ ] Role matrix tests pass; `overrideAccess: true` usages reviewed and justified
- [ ] Forms: validation, Turnstile, honeypot, rate limit tested
- [ ] Uploads: re-encode, metadata removed, encryption verified
- [ ] Secrets rotated from any development values; none in repo history
- [ ] Dependency audit clean or accepted in writing
- [ ] Vulnerability scan run; **all high and medium findings fixed**; low ones listed
- [ ] Backups running; **restore tested** end to end
- [ ] Cloudflare WAF and bot protection on
- [ ] Error and uptime monitoring on with alerts delivered to a person
- [ ] MCS owns all accounts, with 2FA on each
- [ ] Incident procedure and contacts written (below)

---

## 7. Incident response

1. **Contain:** disable the affected account, rotate the exposed secret, turn on Cloudflare "under attack" or block rules if needed.
2. **Assess:** what data, which time window. Use audit logs and host logs.
3. **Fix and recover:** patch, restore from backup if content was changed, verify.
4. **Notify:** the MCS owner immediately; affected people and authorities as the law and lawyer advise.
5. **Record:** timeline, cause, fix, prevention in `docs/PROGRESS.md` and a short post-incident note.

Contacts (fill in): `TODO(client)` owner, developer on call, hosting support, Cloudflare account owner.

---

## 8. Review cadence

- Every PR: section 3 checklist.
- Monthly after launch: updates, audit, review of failed-login and audit-log patterns, backup restore spot check.
- Quarterly: access review (who still needs which role), key rotation review, re-run vulnerability scan.
