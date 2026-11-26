# DESIGNS — Design System

> **Purpose:** tokens, component patterns and layout rules for the public site and the edit-mode UI. Brand colours and logo are **not supplied yet** (Q6), so values below are neutral placeholders. Replace them when the client sends brand files, and update this doc.
> Principle: clean, trustworthy, real photos, mobile first.
>
> **Implemented CP-3.1 (2026-11-24):** tokens live in `src/app/(frontend)/globals.css` (`:root` variables mapped into Tailwind with `@theme inline`); header/footer/sticky bars are in `src/components/layout/`. Contact actions are hidden until staff save real numbers. Google Fonts is unreachable from the build network, so the interim system stack below is used instead of `next/font` until local brand font files arrive.

---

## 1. Principles

1. **Mobile first.** Design at 360 px width, then widen. Test on a mid-range Android phone and slow 4G.
2. **One primary action per section.** Call, WhatsApp, Free Inspection or Get a Quote.
3. **Trust over decoration.** Real photos, real numbers, clear prices, visible contact details.
4. **Limits are the layout contract.** Components are designed for the maximum text in `docs/CONTENT.md` section 5, never for the pretty case.
5. **Accessible by default** (WCAG 2.2 AA).
6. **Light by default.** Dark mode is optional later; do not block launch on it.
7. **Urdu-ready:** logical properties, no hard-coded left or right.

---

## 2. Tokens

Defined as CSS variables and mapped in the Tailwind theme. Colours in OKLCH or hex; confirm contrast (section 9).

### Colour (placeholders, replace with brand)

| Token                                  | Placeholder                | Use                                                                    |
| -------------------------------------- | -------------------------- | ---------------------------------------------------------------------- |
| `--brand-primary`                      | deep green `#0B5C3F`       | Primary buttons, links, accents                                        |
| `--brand-deep`                         | near-black green `#072A20` | Hero panels, footer, dark CTA                                          |
| `--brand-primary-contrast`             | `#FFFFFF`                  | Text on primary/deep                                                   |
| `--brand-accent`                       | lime `#C9F27A`             | Highlights, dark-panel buttons (always with `--brand-accent-ink` text) |
| `--brand-accent-ink`                   | `#14351F`                  | Text on the lime accent                                                |
| `--surface`                            | `#FFFFFF`                  | Page and card background                                               |
| `--surface-alt`                        | `#F1F7F2`                  | Alternating sections                                                   |
| `--surface-soft`                       | `#E7F1E9`                  | Hero and decorative gradients                                          |
| `--ink`                                | `#0A1F16`                  | Body text                                                              |
| `--ink-muted`                          | `#4B5F55`                  | Secondary text (check contrast)                                        |
| `--border`                             | `#DBE7DE`                  | Lines, inputs                                                          |
| `--success` / `--warning` / `--danger` | green / amber / red        | Status and form feedback                                               |
| `--whatsapp`                           | `#25D366`                  | WhatsApp button background only, with dark text to pass contrast       |
| `--focus`                              | high-contrast ring colour  | 2 px outline plus offset                                               |

### Typography

- **Interim:** system font stack via the `--font-body` CSS variable (no network request, no layout shift). Switch to `next/font/local` with brand files when Q6 is answered; **max two families**, `display: swap`, subset to Latin now. For Urdu later, add a Nastaliq or Naskh font only on Urdu pages.
- Scale (mobile / desktop): H1 32/48, H2 26/36, H3 20/26, body 16/18, small 14. Line height 1.5 for body, 1.2 for headings.
- Minimum body size 16 px. Never lower body text on mobile.
- `text-wrap: balance` on headings where supported.

### Spacing, radius, shadow

- 4 px base unit. Section padding 48 px mobile, 80 px desktop. Container max width about 1200 px with side padding 16 px mobile.
- Radius (2026-11-26 refresh): 12 px inputs, 20 px cards, 32 px dark panels, full for pills and buttons.
- Shadows: `--shadow-card` for resting cards, `--shadow-lift` on hover and for the hero image. Cards use borders at rest and lift on hover; the layout stays calm rather than decorative.
- **2026-11-26 layout note:** the public shell now uses a sticky blurred pill header with nowrap nav, a split hero (text + image card), a raised stat band, numbered service/why-choose cards, a connected five-step timeline, contained dark CTA panels, and a dark footer. Section rhythm is 56/80 px. Every page keeps one H1; the accent is used for large display elements and never for small text on white.

### Z-index scale

`base 0`, `sticky header 40`, `mobile sticky bar 40`, `floating WhatsApp 45`, `drawer/content box 60`, `modal 70`, `toast 80`.

---

## 3. Components

| Component             | Rules                                                                                                                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Button**            | Min height 44 px, min width 44 px, label within `buttonLabel`. Variants: primary, secondary, outline, WhatsApp, ghost. Visible focus. Disabled state explained, not just greyed                                |
| **Header**            | Logo, menu (max 8 items), Free Inspection and Get a Quote buttons, phone on desktop. Mobile: logo, call icon, menu button. Menu is a keyboard-accessible disclosure                                            |
| **Mobile sticky bar** | Bottom of the screen on mobile only: Call, WhatsApp, Free Inspection. Height about 56 px. Adds `scroll-padding-bottom` so focused elements are never hidden behind it (WCAG 2.4.11). Safe-area inset respected |
| **Floating WhatsApp** | Desktop only (mobile uses the bar). 56 px target, accessible name "Chat on WhatsApp"                                                                                                                           |
| **Section**           | Wrapper with heading level, id for anchors, alternating background, consistent padding                                                                                                                         |
| **Card**              | Image (fixed aspect ratio), title (clamped to 2 lines), body (clamped to 4 lines), action. Equal height in a grid without fixed pixel heights                                                                  |
| **Stat**              | Value and label. Real numbers rendered on the server, never animating from zero                                                                                                                                |
| **FAQ**               | Native `details/summary` or an accessible disclosure; one open at a time optional                                                                                                                              |
| **Form field**        | Visible label above, helper text, error text with `aria-describedby`, correct `autocomplete`, correct `inputmode` (phone: `tel`), 16 px text to avoid iOS zoom                                                 |
| **Image**             | `next/image`, explicit width and height or aspect ratio, `alt` always, hero image prioritised, others lazy                                                                                                     |
| **Badge, chip**       | Small label with sufficient contrast, not colour alone                                                                                                                                                         |
| **Breadcrumb**        | On service, product, location and post pages; also feeds schema                                                                                                                                                |
| **Price**             | `Rs 1,500`, optional strikethrough original while a discount is active, "starting from" wording where true                                                                                                     |
| **Toast, alert**      | Live region, dismissible, not the only way to see an error                                                                                                                                                     |

---

## 4. Block layouts

Each block in `docs/CONTENT.md` section 6 has one renderer and at most two layout variants. Variants are chosen by a field with a short enum, not by free CSS. Grids: 1 column on mobile, 2 on tablet, 3 or 4 on desktop. A block with the maximum items must still look intentional (wrap, not scroll sideways, unless it is a labelled carousel).

**Implemented CP-3.2:** one server component per block in `src/components/blocks/`, selected by `BlockRenderer` (`index.tsx`) from the Pages `layout` union. `Section` owns the shared shell (landmark, container, background, heading level), `SiteImage` emits a `<picture>` with the pre-generated `thumb`/`card`/`hero` variants (ADR-015), and `BlockAction` resolves `call`/`whatsapp` against saved settings and drops unsafe schemes. Missing fields render nothing rather than an empty box; `beforeAfter` pairs appear only with `consentConfirmed`; proof notes stay internal. Contact facts are never invented — unset phone/WhatsApp actions disappear. The 404 and error boundaries use the same message catalogue and site chrome; the route renders a visually hidden H1 only when no hero supplies one.

---

## 5. Motion

- Short and purposeful (150 to 250 ms), `transform` and `opacity` only.
- Respect `prefers-reduced-motion`: no parallax, no auto-playing carousels, no counters animating.
- No layout shift from animation.

---

## 6. Icons and imagery

- Icon set: small inline SVGs in `src/components/layout/icons.tsx` (no icon dependency added). Decorative icons are `aria-hidden` and not focusable; icon-only controls carry an accessible name.
- Real photography of MCS work and team. Avoid generic stock where it undermines trust. Provide alt text.
- Image budgets in `docs/QUALITY.md`.

---

## 7. Edit-mode UI (staff only)

| Element                    | Rules                                                                                                                                                                                                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff bar                  | Fixed top, 44 px, high contrast, not part of the public design. Edit mode toggle, View as visitor, Admin, status. **CP-4.1:** sticky bar on `/edit/*`; "View as visitor" is a one-request `?view=visitor` opt-out, so the public page needs no staff-only markup     |
| Mobile menu (built CP-3.1) | Native `<details>` disclosure, so it is keyboard operable without client JavaScript; children show only in the mobile panel                                                                                                                                          |
| Region outline             | 2 px dashed outline on hover and focus, offset 2 px, no layout shift; colour distinct from brand                                                                                                                                                                     |
| Edit button                | Small labelled button at the region corner, reachable by keyboard                                                                                                                                                                                                    |
| Content box                | Drawer (desktop) or bottom sheet (mobile), focus trapped, labelled, counters visible next to inputs. **CP-4.1:** 460 px right drawer / 85 vh bottom sheet, autosave 2 s after a pause, focus moved to the first field and returned to the Edit trigger on close      |
| Counters                   | `42 / 80`, turns warning colour at 90 percent, plus text (not colour alone). **CP-4.2:** repeaters show `n / max`, disable Add at max and Remove at min, and reorder with Move up/down buttons                                                                       |
| Block toolbar              | Icon buttons with tooltips and accessible names; move up/down, duplicate, hide, delete. **CP-4.2:** text-labelled buttons in a `Section tools` group, plus an inline section-type picker for "Add section"; hidden blocks render faded with a "Hidden section" badge |

Edit-mode styles live in their own CSS and are loaded only on the edit route. They must not leak into public pages.

---

## 7a. Admin panel (Payload)

Use Payload's default UI. Customise only: logo, favicon, colour variables for brand accent, and field descriptions that explain limits. Do not fork Payload components without a decision recorded in `DECISIONS.md`.

---

## 8. Defensive CSS (worst-case content)

```css
.content-text {
  overflow-wrap: anywhere;
  hyphens: auto;
}
.card-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-body {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
img,
video {
  max-width: 100%;
  height: auto;
}
.table-wrap {
  overflow-x: auto;
} /* tables scroll inside their own box */
html {
  scroll-padding-top: 5rem;
  scroll-padding-bottom: 5rem;
} /* sticky header and bar */
```

Use logical properties (`margin-inline-start`, `padding-block`, Tailwind `ms-*`, `me-*`, `text-start`) everywhere.

---

## 9. Accessibility patterns (WCAG 2.2 AA)

| Requirement                                 | How                                                                                             |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Contrast 4.5:1 text, 3:1 large text and UI  | Check every token pair; do not use accent amber for small text on white                         |
| Focus visible and **not obscured** (2.4.11) | Visible ring; sticky header and bar never cover the focused element (`scroll-padding`)          |
| Target size (2.5.8)                         | At least 24 px minimum by rule, 44 px by our standard                                           |
| Dragging alternatives (2.5.7)               | Reorder has up/down buttons                                                                     |
| Consistent help (3.2.6)                     | Call and WhatsApp in the same place on every page                                               |
| Redundant entry (3.3.7)                     | Forms never ask for the same data twice                                                         |
| Accessible authentication (3.3.8)           | Admin login allows paste and password managers; no puzzle-only step                             |
| Keyboard                                    | Everything reachable and operable; no keyboard traps except intentional modal traps with Escape |
| Landmarks and headings                      | One H1 per page, logical heading order, `main`, `nav`, `footer`                                 |
| Skip link                                   | First focusable element                                                                         |
| Forms                                       | Labels, errors tied to fields, errors summarised and focusable                                  |
| Language                                    | `lang` and `dir` from locale                                                                    |
| Media                                       | Alt text; no autoplay with sound; captions for video if added                                   |

---

## 10. File structure for new components

```
src/components/
├── ui/          # Button, Card, Field, Badge...
├── layout/      # Header, Footer, MobileBar, Section
├── blocks/      # one folder per block: Block.tsx, Block.test.tsx
└── edit/        # Editable, ContentBox, StaffBar (edit route only)
```

A component PR includes: states (empty, max content, error), keyboard behaviour, a test for the max-content case.

---

## 11. References

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Core Web Vitals: https://web.dev/vitals/
- Structure reference (do not copy): https://apexcore.pk/
