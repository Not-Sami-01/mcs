# PROGRESS — Live State and Handoff

> **Read this first.** Update it continuously (see `AGENTS.md` section 3). If a session ends abruptly, the next agent starts from the **Resume here** block.

---

## Resume here

> Keep this block short and accurate. Rewrite it before starting each task and after finishing each step.

- **Last updated:** 2026-11-17
- **Current phase / checkpoint:** Phase 0, CP-0.1 (docs committed). Next up: CP-0.2.
- **State of the repo:** documentation only. No application code, no `package.json`, no git history yet.
- **What I was doing:** nothing in progress.
- **Next step:**
  1. `git init`, create branch `development`, commit the docs as `checkpoint(CP-0.1): project docs and plan`, tag `cp-0.1`.
  2. Start CP-0.2: scaffold Next.js + Payload + PostgreSQL (see `docs/PLAN.md`).
- **Blockers:** none for CP-0.2. Business inputs still missing (see "Open inputs" below). Do not block on them; use `TODO(client)` placeholders.
- **Uncommitted or half-done work:** none.

---

## Status snapshot

| Area | Status |
|---|---|
| Docs | Written, not yet committed |
| Repo scaffold | Not started |
| Data model | Not started |
| Admin and roles | Not started |
| Public site | Not started |
| Inline editing | Not started |
| Services, locations, products, blog | Not started |
| Leads and forms | Not started |
| SEO and analytics | Not started |
| QA, performance, security | Not started |
| Launch | Not started |

Phase progress lives in `docs/PLAN.md`. This table is a quick view only.

---

## Checkpoint log

Newest first. One row per checkpoint commit.

| Checkpoint | Date | Commit | Tag | Evidence (commands and results) | Notes |
|---|---|---|---|---|---|
| — | — | — | — | — | No checkpoints yet |

---

## Open inputs from the client

Tracked in detail in `docs/DECISIONS.md` (section "Open questions"). Headlines:

- Brand files (logo, colours), phone and WhatsApp numbers, address, working hours
- Service list, starting prices, inspection fee, warranty terms
- Which products to list, and chemical licence and labelling rules
- What "Malaysian" means for MCS, with proof
- Launch cities (Lahore only or more)
- Domain name, hosting budget, who maintains the site, who answers live chat
- Old WordPress URL list (the site is down; start recovery now, see `docs/SEO.md`)

---

## Known issues

| # | Issue | Severity | Found in | Status |
|---|---|---|---|---|
| — | None yet | — | — | — |

---

## Session log

Newest first. Add an entry at the end of each session, even a short one.

### 2026-11-17 — Planning session

- Read `MCS_Website_Requirements.docx` (7 Nov 2026) and reviewed https://apexcore.pk/ for structure.
- Chose Payload CMS 3 embedded in Next.js (the requirements recommend it), PostgreSQL, Filebase.
- Verified: Filebase IPFS buckets expose every object through its CID even when the bucket is private. Customer uploads must be encrypted. See `docs/STORAGE.md`.
- Verified: Payload has no built-in two-factor login. Community plugins exist. Needs a spike in CP-2.2.
- Wrote all docs in this folder.
- Not seen: the "detailed 17 page version" of the requirements. Ask the client if more depth is needed.

---

## Handoff template

Copy this into the session log when you must stop mid-task.

```md
### YYYY-MM-DD HH:MM — Handoff (stopped early: tokens / context / blocked)

- **Task in progress:** <PLAN checkpoint and item>
- **Done so far:** <files and behaviour, with evidence>
- **Half-done (uncommitted or wip commit):** <files, what is missing, how to finish>
- **Exact next step:** <one concrete action>
- **Commands to verify:** <commands and expected result>
- **Gotchas discovered:** <or "none"; also copy to PROJECT.md Gotchas>
- **Decisions made but not yet in DECISIONS.md:** <or "none">
```
