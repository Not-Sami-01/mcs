# OPERATIONS — Environments, Deploy, Backups, Monitoring

> **Status:** planned for execution. Hosting is decided — Vercel (ADR-012) — so sections below reflect Vercel constraints. Update whenever an env var, job or procedure changes.

---

## 1. Environments

| Environment | URL | Database | Buckets | Indexing | Purpose |
|---|---|---|---|---|---|
| `development` | `http://localhost:3000` | podman PostgreSQL (`mcs-db` on 5432; `docker-compose.yml` is the canonical config) | dev buckets | noindex | Local work. Sample seed allowed |
| `staging` | `TODO(client)` staging domain | Separate database | `-staging` buckets | **noindex** | UAT, redirect tests. Sample or copied non-personal content only |
| `production` | `TODO(client)` main domain | Production database | production buckets | **indexable** | Live |

`SITE_ENV` (`development`, `staging`, `production`) drives noindex, robots, seed permission and emails (non-production never emails real customers). Missing or invalid values fail closed to `development` indexing behaviour. Since Next.js emits metadata and `robots.txt` from the build, set `SITE_ENV` correctly during the build as well as at runtime; build production with `SITE_ENV=production`, and staging with `SITE_ENV=staging`. Secrets differ per environment. Production data (leads, photos) never goes to development or staging.

---

## 2. Environment variables (names only)

Copy `.env.example` to `.env`. Never commit `.env`. The app validates required variables at startup and fails with a message that does not print values. The scaffold's `.env.example` intentionally contains names only; set local `DATABASE_URL` and `PAYLOAD_SECRET` values in ignored `.env` before starting the app. Docker Compose currently configures PostgreSQL as `postgres:16-alpine` with local-only development credentials; do not reuse those credentials outside development.

### Core
| Name | Purpose |
|---|---|
| `SITE_ENV` | `development`, `staging` or `production` |
| `NEXT_PUBLIC_SITE_URL` | Public base URL (canonical, sitemap, emails) |
| `DATABASE_URL` | PostgreSQL connection string (pooled on Vercel) |
| `PAYLOAD_SECRET` | Payload signing secret (long random value) |
| `CRON_SECRET` | Protects the jobs endpoint if used with cron |
| `SEED_ADMIN_EMAIL` | First Super Admin address for `pnpm seed:admin` (optional; asks on a TTY) |

### Storage (see `docs/STORAGE.md`)
`FILEBASE_ENDPOINT`, `FILEBASE_REGION`, `FILEBASE_ACCESS_KEY_ID`, `FILEBASE_SECRET_ACCESS_KEY`, `FILEBASE_BUCKET`, `FILEBASE_PUBLIC_BASE_URL`, `UPLOAD_ENCRYPTION_KEY`, `UPLOAD_ENCRYPTION_KEY_ID` — one line each in `.env.example` with plain-language comments explaining what they do.

### Security
| Name | Purpose |
|---|---|
| `TOTP_ENCRYPTION_KEY` | Encrypts staff two-factor secrets at rest |
| `IP_HASH_SALT` | Salt for hashing IPs (abuse checks) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key (public) |
| `TURNSTILE_SECRET_KEY` | Turnstile secret (server) |

### Email
| Name | Purpose |
|---|---|
| `EMAIL_PROVIDER` | `resend`, `postmark` or `ses` |
| `EMAIL_API_KEY` | Provider credential (SES uses its own credential set) |
| `EMAIL_FROM` | Sender address on the authenticated MCS domain |
| `LEADS_ALERT_TO` | Fallback recipients (settings global holds the live list) |

### Analytics and chat
`NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_CHAT_PROVIDER`, `NEXT_PUBLIC_CHAT_ID`

### Monitoring (optional)
`SENTRY_DSN` (or the chosen provider's equivalent)

**Not env vars:** phone numbers, WhatsApp number, address and hours. They live in the `site-settings` global so staff can edit them.

---

## 3. Deploy

### Common to both hosts
- Build from a clean install with the frozen lockfile. Run migrations (`payload migrate`) as a deploy step **before** serving new code. Never rely on schema push outside development.
- No writes to the local filesystem at runtime (uploads go to Filebase).
- Health check: `GET /api/health`.
- After deploy: smoke test home, a service page, `/admin` login, a form submission on staging, and the edit route as staff.

### Vercel
- Use a pooled PostgreSQL URL (serverless connection limits).
- Request bodies are limited (about 4.5 MB): resize photos in the browser, keep imports small or direct-upload.
- Scheduled publish and cleanup jobs need Vercel Cron calling the jobs endpoint with `CRON_SECRET`.
- Image optimization usage is metered; watch it or use the Cloudflare caching plan (`docs/STORAGE.md`).

### VPS
- Run behind a reverse proxy (Caddy or nginx) with automatic TLS, Cloudflare in front.
- Process manager (systemd, PM2, or Docker) with restart on failure.
- Payload jobs `autoRun` can handle scheduled work; confirm in current docs.
- You own OS patches, firewall (only 80/443 and SSH from known IPs), SSH keys only, unattended security updates, disk monitoring.
- Zero-downtime deploy via two instances or a brief rolling restart.

---

## 4. Backups and recovery

| What | How | Frequency | Retention | Test |
|---|---|---|---|---|
| PostgreSQL | Provider automated backups or `pg_dump` to a separate encrypted location | **Daily**, plus before every migration | At least 14 daily, 8 weekly (proposed) | **Restore into a scratch database monthly**, verify counts and a few documents |
| Public media bucket | Periodic sync to a second provider or archive | Weekly | Latest plus one prior | Spot restore of a few files |
| Private uploads | Follow retention (Q12). Do not copy to weaker places | n/a | Per policy | Decrypt test with the active key |
| Secrets | Stored in the hosting secret store and a password manager owned by MCS | On change | n/a | Recovery steps written down |
| Code | Git remote owned by MCS | Continuous | n/a | Fresh clone builds |

Recovery objectives (proposed, confirm with management): lose at most 24 hours of data; restore service within 4 hours.

**A backup is not real until a restore has been done and recorded here.**

| Date | Restore test | Result | By |
|---|---|---|---|
| — | Not yet run | | |

---

## 5. Monitoring and alerts

| Signal | Tool (choose) | Alert to |
|---|---|---|
| Uptime of `/` and `/api/health` | Better Stack, UptimeRobot or similar | Named person, SMS or email |
| Server and client errors | Sentry or similar | Developer on call |
| Core Web Vitals | Search Console, Lighthouse CI | Monthly review |
| Failed logins, 5xx rate, form spikes | Logs and Cloudflare analytics | Named person |
| Certificate and domain expiry | Registrar and monitor | Owner |
| Filebase usage and bandwidth | Filebase dashboard | Owner |
| Email delivery failures and bounces | Provider dashboard | Owner |

Alerts go to a human who can act. Test an alert once before launch.

---

## 6. Monthly maintenance routine (after launch)

1. Review dependency updates and changelogs (Next.js, Payload, security advisories). Update intentionally, run the full check suite, deploy to staging, then production.
2. Run the dependency audit; fix or document.
3. Review audit logs, failed logins, user list (remove people who left, reduce roles).
4. Restore test of the latest backup (rotate through quarterly full test).
5. Review Search Console (errors, 404s, coverage) and add redirects.
6. Check uptime and error reports; clear alert noise.
7. Check Filebase and hosting usage against budget.
8. Record the date and findings in `docs/PROGRESS.md`.

---

## 7. Ownership checklist (from day one)

MCS owns these accounts, with two-factor on each. The developer gets delegated access, not ownership.

- [ ] Domain registrar
- [ ] Cloudflare
- [ ] Hosting (Vercel or VPS provider)
- [ ] PostgreSQL provider
- [ ] Filebase
- [ ] Git repository (GitHub or similar)
- [ ] Email sending provider and DNS records (SPF, DKIM, DMARC)
- [ ] Google Analytics, Search Console, Google Business Profile
- [ ] Cloudflare Turnstile
- [ ] Live chat provider
- [ ] Monitoring tools
- [ ] Password manager with shared recovery

Record who the owner is and where recovery codes are kept (never in the repo).

---

## 8. Runbook: common tasks

| Task | Steps |
|---|---|
| Invite a staff member | Super Admin → Users → create with role (the typed password is discarded) → they receive a 24-hour one-time set-password link → they set a password and, from CP-2.2, enrol two-factor. Without an email provider, development logs the link (`EMAIL_PROVIDER=console`) |
| Create the first Super Admin | `SEED_ADMIN_EMAIL=<address> pnpm seed:admin` with env loaded (gotcha 17) → follow the printed invite link. Refuses if a Super Admin already exists |
| Remove a staff member | Disable user, revoke sessions, review audit log, rotate shared secrets if they had access |
| Reset someone's two-factor | Super Admin resets enrolment; user re-enrols; audit entry |
| Rotate a secret | Create the new value, deploy, verify, revoke the old one, record the date |
| Roll back a bad deploy | Redeploy the previous build; if a migration ran, follow its rollback note in `docs/DATABASE.md` section 5 |
| Restore a bad content change | Page version history (restore) or trash (restore) |
| Take the site down briefly | Maintenance page at Cloudflare level, not by deleting content |
