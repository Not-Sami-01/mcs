# AGENTS.md — Operating Protocol for AI Agents

> **Read this file first, every session.** It is short on purpose.
> Tools that read `AGENTS.md` get it directly. Claude Code reads `CLAUDE.md`, which imports this file.

---

## 1. What you are building

A custom **Next.js website with an admin panel** for **Malaysian Care System (MCS)**, a pest control company in Lahore, Pakistan. It replaces a WordPress site that is currently down.

- **Goal:** turn visitors into calls, WhatsApp chats, free inspection bookings and quote requests.
- **Stack:** Next.js (latest stable, App Router) + TypeScript + Tailwind CSS, **Payload CMS 3** embedded in the same project, **PostgreSQL**, **Filebase** (S3-compatible) for file storage.
- **Signature feature:** when staff are logged in, they click any content on the real site and edit it in a **content box** with **fixed character and item limits**, so the layout can never overflow. See `docs/INLINE-EDITING.md`.
- **Prices are in PKR.** Mobile first. Fast. Accessible (WCAG 2.2 AA). Urdu can be added later.

The full requirements are summarised in `docs/PROJECT.md`. The plan is `docs/PLAN.md`.

---

## 2. Start-of-session routine (before touching code)

1. Read this file.
2. Read **`docs/PROGRESS.md`**. The "Resume here" block says exactly where the last session stopped.
3. Read the current phase in **`docs/PLAN.md`**.
4. Read the reference docs for your task (table in section 7).
5. Run `git status` and `git log --oneline -10`. Compare with PROGRESS.md. If they disagree, trust git for *what exists* and PROGRESS.md for *intent*, then fix PROGRESS.md.
6. Once code exists, run `pnpm typecheck && pnpm lint && pnpm test` to learn the baseline before changing anything.

---

## 3. The memory rule (most important)

You can run out of tokens or context at any moment, without warning. The next agent has **no memory of your session**. The repository docs are the only memory. So:

**Update the docs as you work, never "at the end".**

| When | Do this |
|---|---|
| Before starting a task | Write 1–3 lines in the `Resume here` block of `docs/PROGRESS.md`: what you are doing, which files, what comes next. |
| After each meaningful step (a group of files done, a test passing, a decision made) | Update `docs/PROGRESS.md`. |
| When you finish a PLAN item | Tick the box in `docs/PLAN.md` with the date, in the same commit as the code. |
| When behaviour, schema, route, limit, env var or dependency changes | Update the matching reference doc **in the same commit** as the code (section 7). |
| When you make or change a decision | Add or update an ADR in `docs/DECISIONS.md`. |
| When something surprises you (a library quirk, a bug, a constraint) | Add it to `docs/PROJECT.md` under **Gotchas**. |

Rules for honest docs:

- Docs describe **reality**. Never tick a box for something you did not verify. Use `[~]` for partly done and say what is missing.
- Record evidence: the command you ran and the result (pass, fail, number), not "works".
- If code and docs disagree, fix whichever is wrong in the same commit. Never leave them disagreeing.

### Low-budget protocol

If you sense you are near your limit (very long session, many large files read, truncated tool output):

1. Stop starting new work.
2. Reach a safe state: it compiles, or the half-done change is stashed or reverted.
3. Write a complete handoff in `docs/PROGRESS.md` (template inside that file).
4. Commit as `wip(<area>): <what is half done>`.
5. Tell the human in your final message that you stopped early and where.

---

## 4. Git protocol

- Work on the **`development`** branch. `main` is production-ready only. Merge to `main` only when the human asks.
- **A checkpoint (`CP-x.y` in PLAN.md) is the unit of progress. Commit at every checkpoint.** Also commit after any coherent chunk of work. Do not hold more than about an hour or 300 lines of uncommitted work.
- The first commit of the repository is the docs (`CP-0.1`).

### Checkpoint procedure

1. Run the checks: `pnpm typecheck && pnpm lint && pnpm test` (plus `pnpm build` when the checkpoint touches routes or config). All must pass. If one cannot, record why in PROGRESS.md and do not call the checkpoint complete.
2. Update `docs/PROGRESS.md`: checkpoint log row, "Resume here" block, known issues.
3. Tick the items in `docs/PLAN.md`.
4. Update every reference doc affected (section 7).
5. `git add -A`, then read `git diff --staged` and confirm there are no secrets, `.env` files, dumps or customer data.
6. Commit with the message format below.
7. Tag it: `git tag cp-1.2` (lowercase, matches the ID).
8. If a remote exists: `git push origin development --tags`. Never force-push.

### Commit messages

- Checkpoint: `checkpoint(CP-1.2): pages collection with blocks, drafts and trash`
- Everything else uses Conventional Commits: `feat(leads): ...`, `fix(pricing): ...`, `docs(plan): ...`, `test(access): ...`, `chore(deps): ...`, `wip(inline-edit): ...`

### Never

- Commit `.env*` (except `.env.example` with names only), keys, tokens, database dumps, customer data or build output. If a secret was committed, stop and tell the human. The key must be rotated, and rewriting history is the human's decision.
- Use `--force`, `reset --hard` on work that is not yours, or `--no-verify`, unless the human says so.

---

## 5. Golden rules (non-negotiable)

1. **Authorization lives on the server.** Hiding a button is not security. Every write and every private read checks role and ownership server-side.
2. **Text limits come from one place:** `src/cms/limits.ts`. Payload fields, the inline editor and tests all read it. Never hard-code a limit elsewhere. Every text field has a `maxLength`. Every repeating list has `minRows`/`maxRows`.
3. **Never invent business facts.** No lorem ipsum, fake statistics, fake reviews, fake certificates, fake prices or fake addresses in anything that ships. Unknown fact → write `TODO(client): <what is needed>` in the content and add a row to the open questions in `docs/DECISIONS.md`. Stat and claim blocks need a `proofNote` before they can be published.
4. **Filebase is IPFS-backed.** Assume anything uploaded can be retrieved by anyone who learns its CID, even from a "private" bucket. Customer uploads are encrypted before upload. Read `docs/STORAGE.md` before touching any upload code.
5. **Do not trust your memory of library APIs or versions.** Next.js, Payload, Tailwind and React move fast. Check the installed version and the current docs before using an API. Record exact versions in `docs/QUALITY.md`.
6. **Public pages are static or ISR.** No per-visitor personalisation on public routes. Edit mode uses a separate dynamic route (`docs/INLINE-EDITING.md`).
7. **Money is integer PKR rupees**, computed by one server-side function that has tests. The client never decides a price.
8. **Accessibility and performance are requirements, not polish.** Targets live in `docs/QUALITY.md`.
9. **Do not copy text or images** from apexcore.pk or any other site. It is a structural reference only.
10. **Never say "done" without evidence.** Run the checks and write the command and result in PROGRESS.md.
11. **Mobile first.** Design and test at 360 px width before desktop.
12. **No secrets in code, logs, docs or screenshots.** Env var *names* only.

---

## 6. Stop and ask the human when

- A business fact is missing: prices, warranty terms, certifications, real numbers, brand colours and logo, phone and WhatsApp numbers, addresses, hours, domain.
- Legal text, chemical labelling or safety claims, or the meaning of "Malaysian" for MCS (it needs proof).
- Anything that costs money or creates an account: Filebase plan, hosting, email provider, Cloudflare, domain.
- You would deviate from an **Accepted** ADR in `docs/DECISIONS.md`.
- A destructive action on data or git history.
- A critical or high security finding.
- You want to add a dependency that is unmaintained, very new, or has install scripts.

When you must guess to keep moving, pick the safest default, record it as an assumption in `docs/DECISIONS.md`, and continue.

---

## 7. Which docs to read and update

| If your task touches… | Read and update |
|---|---|
| Overall design, stack, gotchas | `docs/PROJECT.md` |
| What to do next, status | `docs/PLAN.md`, `docs/PROGRESS.md` |
| Why something is the way it is, open business questions | `docs/DECISIONS.md` |
| Page copy, blocks, text limits, sitemap, CTAs | `docs/CONTENT.md` |
| Click-to-edit, content box, edit mode | `docs/INLINE-EDITING.md` |
| Colours, components, layout, accessibility patterns | `docs/DESIGNS.md` |
| Collections, fields, access, migrations, seeds | `docs/DATABASE.md` |
| Routes, server actions, request/response shapes | `docs/API.md` |
| Uploads, Filebase, images, media delivery | `docs/STORAGE.md` |
| Auth, roles, headers, uploads, forms, secrets | `docs/SECURITY.md` |
| Tests, performance, accessibility, versions | `docs/QUALITY.md` |
| Metadata, sitemap, schema, redirects, analytics | `docs/SEO.md` |
| Environments, env vars, deploy, backups, monitoring | `docs/OPERATIONS.md` |

---

## 8. Definition of done (any change)

- [ ] Typecheck, lint and tests pass. Build passes if routes or config changed.
- [ ] New or changed behaviour has a test (limits, access control, pricing and forms always do).
- [ ] Security checklist in `docs/SECURITY.md` section 3 answered for this change type.
- [ ] Keyboard and screen-reader behaviour checked for any UI change. Mobile checked at 360 px.
- [ ] Reference docs, PLAN.md and PROGRESS.md updated in the same commit.
- [ ] No placeholder content shipped as if it were real.

---

## 9. Commands

Available project commands:

```bash
pnpm dev              # Next.js + Payload dev server
pnpm build            # production build
pnpm typecheck        # tsc --noEmit
pnpm lint             # ESLint
pnpm format:check     # Prettier
pnpm test             # unit + integration (Vitest)
pnpm test:e2e         # Playwright browser smoke tests
pnpm payload migrate:create   # create a DB migration
pnpm payload migrate          # apply migrations
pnpm seed             # load sample + TODO starter drafts (dev/staging only)
pnpm seed:admin       # create the first Super Admin (see docs/SECURITY.md)
```

Update this list if the real command names differ.
