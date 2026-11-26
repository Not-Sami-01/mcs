# MCS Website

Custom Next.js website and admin panel for **Malaysian Care System (MCS)**, pest control in Lahore, Pakistan.

> **Status:** Phases 0–2 are complete (invite-only accounts, lockout, TOTP two-factor login, audit log, generated role tests). Phases 3, CP-4.1 and CP-4.2 are complete: the public shell, block renderers, home page, and edit mode with repeaters, images, links, block management and global menu/contact editing are in place; publish, conflicts and version restore are next. CI workflow, unit/E2E tests, security headers and the non-production indexing gate are in place. See [docs/PROGRESS.md](docs/PROGRESS.md) for the exact current state and [docs/PLAN.md](docs/PLAN.md) for what comes next.

---

## What it is

- A fast, mobile-first public website that turns visitors into **calls, WhatsApp chats, free inspection bookings and quote requests**.
- An **admin panel** where the MCS team manages pages, categories, services, locations, products, prices, blog, media and leads, with no developer needed.
- **Click-to-edit:** logged-in staff click any content on the live site and edit it in a content box. Every field has a fixed text limit, so the layout cannot overflow.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (latest stable, App Router), React, TypeScript (strict) |
| Styling | Tailwind CSS |
| CMS and admin | Payload CMS 3, embedded in the same Next.js project |
| Database | PostgreSQL (Payload Postgres adapter) |
| File storage | Filebase (S3-compatible), two buckets: public media and encrypted private uploads |
| Forms | Zod validation, Cloudflare Turnstile spam protection |
| Email alerts | Resend, Postmark or Amazon SES (to be decided) |
| Analytics | Google Analytics 4, Search Console |
| Tests | Vitest, Playwright, axe |
| Hosting | Vercel or a VPS (to be decided), Cloudflare in front |

Exact versions are recorded in [docs/QUALITY.md](docs/QUALITY.md) once the project is scaffolded.

## Documentation

Everything a developer or AI agent needs is in the repo. Start with `AGENTS.md`.

| File | Purpose |
|---|---|
| [AGENTS.md](AGENTS.md) | Operating protocol for AI agents: memory rule, git checkpoints, golden rules |
| [docs/PROGRESS.md](docs/PROGRESS.md) | Live state and handoff notes. Read first |
| [docs/PLAN.md](docs/PLAN.md) | Phased plan with checkpoints |
| [docs/PROJECT.md](docs/PROJECT.md) | Requirements, architecture, roles, gotchas |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Decision records and open questions for management |
| [docs/CONTENT.md](docs/CONTENT.md) | Sitemap, block catalogue, text limits, copy rules |
| [docs/INLINE-EDITING.md](docs/INLINE-EDITING.md) | Click-to-edit content box specification |
| [docs/DESIGNS.md](docs/DESIGNS.md) | Design tokens, components, accessibility patterns |
| [docs/DATABASE.md](docs/DATABASE.md) | Collections, fields, access, migrations |
| [docs/API.md](docs/API.md) | Routes, server actions and endpoints |
| [docs/STORAGE.md](docs/STORAGE.md) | Filebase setup, buckets, upload pipeline |
| [docs/SECURITY.md](docs/SECURITY.md) | Threat model, standards, launch gates |
| [docs/QUALITY.md](docs/QUALITY.md) | Tests, performance and accessibility targets |
| [docs/SEO.md](docs/SEO.md) | Metadata, sitemap, schema, redirects, analytics |
| [docs/OPERATIONS.md](docs/OPERATIONS.md) | Environments, env vars, deploy, backups, monitoring |

## Local development

These steps become valid after checkpoint CP-0.2 and CP-0.3.

```bash
git clone <repo-url> mcs-website
cd mcs-website
pnpm install
cp .env.example .env          # fill in values, see docs/OPERATIONS.md
docker compose up -d db       # local PostgreSQL
pnpm payload migrate          # apply migrations
pnpm seed:admin               # first Super Admin (follow the prompt)
pnpm seed                     # optional draft samples + TODO starter pages (dev/staging only)
pnpm seed:site                # rebuild the full demo site (pages, services, locations, products, Pest Library)
pnpm dev                      # http://localhost:3000, admin at /admin
```

## Contribution checks

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build
```

## Ownership

MCS owns the domain, code repository, hosting, database, Filebase, Cloudflare and email accounts from day one. Accounts must never be created under a developer's personal login. Checklist in [docs/OPERATIONS.md](docs/OPERATIONS.md).

## License

© 2026 Malaysian Care System. All rights reserved.
