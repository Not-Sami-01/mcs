# INLINE-EDITING — Click-to-Edit Content Box

> **Purpose:** specification for the signature feature. A logged-in staff member browses the real site, clicks any content, and edits it in a **content box**. Text and list sizes are limited, so the layout cannot overflow.
> **Status:** CP-4.1–CP-4.3 implemented (2026-11-26): proxy rewrite, `/edit` draft route, `<Editable>`, content box for text/textarea/select/number, repeaters with move/remove, link groups, image picker/upload, draft-only saves, per-section toolbar (add/duplicate/hide/delete/reorder), staff-bar editors for menu/footer and contact details, publish/discard/schedule with server gates, optimistic conflicts with a differences view, and version restore. Publishing controls sit on the staff bar (page-level) rather than inside each block's content box. Decision record: ADR-004 in `docs/DECISIONS.md`.

---

## 1. Behaviour in one paragraph

Staff sign in at `/admin`. After that, visiting any public URL shows the same site with a thin **staff bar** (Edit mode on, View as visitor, Admin panel, Publish status). In edit mode every editable region has an outline on hover and focus. Clicking one opens a **content box**: a drawer on the right (a bottom sheet on mobile) holding only the fields of that region, each with a live counter such as `42 / 80`. Lists have **Add** and **Remove** buttons that stop at the minimum and maximum. **Save draft** keeps changes private. **Publish** makes them live. Visitors never see editing code.

---

## 2. Scope: what can be edited

| Scope | Examples | Edited through |
|---|---|---|
| Page blocks | Hero text, FAQs, trust strip, pricing guide rows | Content box for the block |
| Whole blocks | Add, duplicate, hide, delete, reorder blocks | Block toolbar and "Add section" |
| Typed documents | A service's signs and steps, a product's pack sizes, a location's local notes | Content box for the document's field groups |
| Auto-filled blocks | A services grid filled from the services collection | Click a card: the box says "Editing the service 'Termite Control'" and edits the source document |
| Globals | Header menu, footer, phone, WhatsApp, address, hours | Content box for the global |
| SEO | Meta title, description, social image, noindex | "Page settings" button on the staff bar |
| **Not inline** | Blog and legal page rich text (Lexical), user management, redirects, leads | "Open in admin panel" deep link with a return link |

Marketing pages use **no rich text**. Their text fields are plain text and paragraph lists, so limits are simple and exact (`docs/CONTENT.md` section 5).

---

## 3. Architecture (ADR-004)

```
Staff request GET /services/termite
  │
  ▼
proxy (Next.js "proxy", formerly "middleware", check installed version)
  • Payload session cookie present AND no "view as visitor" cookie?
      yes → rewrite to /edit/services/termite
      no  → continue to the static public page
  ▼
/edit/[...path]  (dynamic, never cached)
  • verify session, role and two-factor state (server)
  • set headers: Cache-Control: private, no-store;  X-Robots-Tag: noindex
  • load DRAFT content (Payload Local API, draft: true, user passed, overrideAccess: false)
  • render the SAME block components inside <EditProvider> so <Editable> wrappers are active
  ▼
Content box (client component) → Server Actions → Payload Local API
```

Why this shape:

- Public pages stay static and fast. No editor JavaScript, no extra request, no editing attributes in public HTML.
- The proxy only checks that a cookie **exists**, which is a routing hint. All real checks happen in the edit route and in every Server Action.
- A stale or forged cookie lands on the edit route, fails verification, and is redirected to the public page.
- Staff see draft content on the real design, which doubles as preview.

**Fallback if the rewrite is fragile:** a visible "Edit this page" link to `/edit/<path>`. The edit route is the same either way.

**Reserved slug:** `edit` (and `admin`, `api`) can never be a page slug.

---

## 4. The `<Editable>` contract

Block renderers wrap each editable region once. In public rendering the wrapper renders its children and nothing else (no extra DOM). In edit rendering it adds the outline, label and click target.

```tsx
<Editable
  target={{ collection: 'pages', id, path: 'layout.3' }}   // document + block path
  schema="hero"                                            // key into the field registry
  label="Hero section"                                     // announced to screen readers
>
  {children}
</Editable>
```

- `schema` keys come from the **field registry** (`src/cms/registry.ts`), which is generated from the same block definitions and `limits.ts` that Payload uses. There is one definition of each field. The content box renders from it.
- For auto-filled blocks, the card wrapper sets `target` to the source document and shows a "linked content" note.
- Wrapper rules: a real `<button>` "Edit {label}" reachable by keyboard; visible focus; outline never changes layout (use `outline` and `outline-offset`, not borders); hidden blocks show a dashed ghost with "Hidden: click to edit".

---

## 5. Content box

### Layout

- Desktop: right drawer, 420 to 480 px, page remains visible and scrolls to the edited region.
- Mobile: bottom sheet at 85 percent height with a drag-free close button.
- Header: block name, close button. Footer: **Save draft** and close. Page-level **Publish**, **Discard draft**, **Schedule** and **Versions** live on the staff bar, because they apply to the whole document rather than one block. Status line: "Draft saved" or "Unsaved changes".

### Field types

| Type | Control | Limits shown |
|---|---|---|
| Text | Single-line input | Counter `n / max`. Typing stops at the maximum (`maxLength`) |
| Textarea | Multi-line | Counter; paragraphs lists use one box per paragraph |
| Paragraph list | Repeater of textareas | Max items, counter per item |
| Number (PKR) | Numeric input, whole rupees | Min and max, validation message |
| Select | Native select | |
| Link | Label (counter) + destination picker: internal page, `tel:`, WhatsApp, URL | Only `http`, `https`, `tel`, `mailto`, relative paths |
| Image | Media picker (library + upload), alt text input | Alt text required, counter |
| Relation | Searchable select (services, products, locations, reviews) | Min and max selections |
| Repeater | Rows with **Add**, **Remove**, **Move up/down** | `Add` disabled at max, `Remove` disabled at min, message explains why |
| Boolean | Switch | |
| Date and time | Pickers in `Asia/Karachi` | Used for schedule |

Every counter is announced politely to assistive tech at thresholds (80 percent and the limit), not on every keystroke.

### Rules

1. **No field without a limit.** If the registry has none, the content box refuses to render the field and the test suite fails.
2. **Hard stop, not a warning.** Typing and pasting are truncated at the limit, with a short message ("Limit reached: 80 characters").
3. **Same rules on the server.** The Server Action validates against the registry and Payload validates again. The client is a convenience.
4. **Repeaters respect min and max** on the client and on the server.
5. **Reordering has button controls** (WCAG 2.5.7). Drag and drop is an optional extra.
6. **Draft autosave:** saves to a draft after a short pause (about 2 seconds) and on close. Publishing is always explicit.

---

## 6. Block management

**Implemented in CP-4.2** as a per-section toolbar plus an "Add section" picker after the last block (and on empty pages). Actions write the layout as a draft and refresh the server-rendered edit route; the 30-block cap and the minimum of one block are enforced server-side. Hiding uses the block's `hidden` checkbox.

- **Add section:** a "+" between blocks opens a list of allowed block types, with a small preview and a note when the page is at `maxRows` (30).
- **Block toolbar (on hover or focus):** move up, move down, duplicate, hide, delete (with confirmation), "Page settings".
- **Allowed blocks per template** are defined in the registry (a service page cannot get a `beforeAfter` block unless allowed).
- Deleting a block is a draft change. It can be undone by discarding or restoring a version.

---

## 7. Server Actions

All live in `src/app/(edit)/actions/` and share one wrapper (`withStaffAuth`) that:

1. Reads the session from the request headers via Payload's auth.
2. Rejects missing session, unverified two-factor state or missing role.
3. Parses input with Zod (including registry limits).
4. Calls the Payload Local API with `user` set and `overrideAccess: false`, so collection access rules apply.
5. Writes an audit-log entry for publish, delete and settings changes.
6. Never returns more than the saved field values.

| Action | Purpose |
|---|---|
| `saveDraft` | Update fields of a block or document as a draft |
| `publish` | Publish the document (role and gates checked) |
| `discardDraft` | Remove unpublished changes |
| `addBlock`, `removeBlock`, `moveBlock`, `duplicateBlock`, `toggleBlockHidden` | Block management |
| `saveGlobal` | Header, footer, settings |
| `schedulePublish` | Set a future publish or unpublish time (Payload jobs; run by `/api/cron/jobs`) |
| `listVersions`, `restoreVersion` | Version history |

See `docs/API.md` for shapes.

---

## 8. Concurrency and conflicts

- Each save carries the document's `updatedAt` as an expected version.
- If someone else saved first, the box shows "This content changed while you were editing" with **Reload theirs**, **Keep mine**, and **See differences** for the changed field. The conflict response includes the saved values, so the comparison needs no extra request.
- Saves are per block path on the server, so a save only replaces the fields it sends and leaves other blocks untouched. Optimistic locking is still document-wide: two editors in different blocks will see a conflict when one saves after the other. Narrowing the check to a per-block version is a possible follow-up; the conflict dialog already lets the second editor keep their text without losing the other edit.

---

## 9. Publish gates (server-enforced)

| Gate | Where |
|---|---|
| Meta title and description present and within limits | Any page |
| `proofNote` on every trust-strip item and on `ourDifference` | Blocks |
| No `TODO(client)` text in published content | All text fields |
| Alt text on every image | All images |
| `consentConfirmed` on before and after pairs | `beforeAfter` |
| Location unique-content rules | `locations` |
| Legal pages published by Super Admin only | `pages` flagged legal |

A failed gate shows a clear message in the content box naming the field.

---

## 10. Security

- Authorization is server-side in every action. The proxy cookie check is a hint only.
- The edit route and every action refuse requests without a verified second factor.
- Rendering never uses `dangerouslySetInnerHTML` for CMS text. Text is output as text.
- Link and URL fields are validated against the allowed schemes. Image sources must come from the media collection.
- Server Actions rely on the framework's origin checks. Do not disable them. Keep the CSRF and CORS allowlists from `docs/SECURITY.md` section C3.
- Edit mode responses are `private, no-store` and `noindex`.
- No editing attributes, document IDs or field paths in public HTML.
- Rate limit actions per user. Cap payload sizes.

---

## 11. Accessibility

- The staff bar and content box are landmarks with labels. Focus moves into the box on open, is trapped while open, and returns to the clicked region on close. `Escape` closes (asking to confirm if there are unsaved changes).
- Counters and validation messages use `aria-describedby` and polite live regions.
- Target size at least 44 px. Visible focus. Works with a sticky mobile call bar without hiding focused fields (WCAG 2.4.11).
- Reduced motion is respected for the drawer animation.
- Tested with keyboard only and with a screen reader (`docs/QUALITY.md`).

---

## 12. Edge cases

| Case | Behaviour |
|---|---|
| Staff without role for a region | Region is not editable; no outline |
| Session expires while editing | Content box keeps the text locally, asks to sign in again, then saves |
| Network failure on save | "Not saved" status, retry button, text kept |
| Pasted text over the limit | Truncated at the limit with a message |
| Hidden block | Not rendered publicly, ghost shown in edit mode |
| Block removed by someone else | Box closes with an explanation |
| Page unpublished | Edit route still works (draft); public URL returns 404 |
| Image deleted from library while used | Publish gate fails with a clear message |

---

## 13. Tests

- Unit: registry has a limit for every field; Zod schemas reject overlong input; repeater bounds.
- Integration: each action rejects every role it should and accepts the ones it should; actions never bypass access control.
- E2E (Playwright): Editor edits a headline, hits the limit, adds and removes a FAQ, saves a draft (visitor still sees the old text), publishes (visitor sees the new text), resolves a conflict, restores a version. Same flow on a 360 px viewport.
- Accessibility: axe on the edit route; keyboard-only walkthrough.
- Cache: a visitor request never receives edit markup, and the edit route is never served from cache.
