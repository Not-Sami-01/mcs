# SEO — Metadata, Sitemap, Schema, Redirects, Analytics

> **Status:** planned (Phase 7). Update with any change to metadata, routes, redirects or tracking.
> No ranking is promised. The goal is a technically clean site with useful, unique local content.

---

## 1. Per-page metadata

Every public page has, and cannot be published without:

| Item | Rule |
|---|---|
| Title | Unique, within `metaTitle` (60 characters), main keyword first, brand last |
| Description | Unique, within `metaDescription` (160 characters), value plus action |
| Canonical | Absolute URL, one per page, no trailing slash, no tracking parameters |
| Open Graph and Twitter | Title, description, image (1200 × 630), site name |
| `robots` | Index and follow in production; `noindex` where chosen or in non-production |
| `lang` | From locale (`en` now) |
| Breadcrumbs | On service, product, location, post pages |

Generated with the framework's metadata API from the document's `seo` group, with sensible fallbacks (page title, excerpt). The Payload SEO plugin can provide the admin fields and previews; check that it supports the limits in `limits.ts`.

---

## 2. Sitemap and robots

- `/sitemap.xml` is generated from **published** documents only (pages, services, locations, products, posts, categories that have content), with `lastmod` from the document's update time. Excludes `noindex` pages, drafts, trash, `/admin`, `/edit`, `/api`.
- `/robots.txt`:
  - **Production:** allow all; disallow `/admin`, `/api`, `/edit`; include the sitemap URL.
  - **Staging and development:** `Disallow: /` and every response also sends `X-Robots-Tag: noindex, nofollow`.
- The switch is `SITE_ENV` (`docs/OPERATIONS.md`).

### Indexing gate (launch gate)

Automated test and manual check, both required at launch:

- [ ] Staging: `noindex` in meta and header, robots disallows all
- [ ] Production: no `noindex`, robots allows crawling, sitemap reachable and valid
- [ ] Search Console shows production property verified and sitemap submitted

A common launch accident is shipping the staging noindex to production, or leaving production blocked. Check on the live domain after DNS changes.

---

## 3. Structured data (JSON-LD)

Built from structured fields. Serialise safely (escape `<`). Validate with Google's Rich Results Test and the Schema.org validator.

| Page | Types |
|---|---|
| Site-wide | `Organization` and `LocalBusiness` (use the most specific valid type that fits; verify in the validator) with name, URL, logo, phone, address, opening hours, `areaServed`, `sameAs` from settings. Only include facts present in settings |
| Service | `Service` with provider and `areaServed`; `BreadcrumbList` |
| Product | `Product` with `Offer` (`priceCurrency: PKR`, price, availability from stock status). Include discount price only while the discount is active |
| Location | `LocalBusiness` or `Service` with `areaServed` for that place; `BreadcrumbList` |
| Post | `Article` with author, dates, image |
| FAQ | `FAQPage` is optional. Google limits FAQ rich results to a narrow set of sites, so do not count on a visual benefit |
| Reviews | Only mark up real, verified, visible reviews. Do not self-serve review markup that Google disallows for the business's own site; check current Google guidelines before adding `AggregateRating` |

Never mark up content that is not visible on the page.

---

## 4. URLs and internal linking

- Clean, lowercase, hyphenated. Structure in `docs/CONTENT.md` section 3.
- A slug or category change creates a 301 automatically (`afterChange` hook writes a `redirects` entry).
- Every service links to relevant locations and products; every location links to services and nearby areas; every post links to a service and a location. Footer and menu carry the main hubs.
- Anchor text is descriptive. No "click here".
- Thin or near-duplicate pages are not published (location gate, `docs/CONTENT.md` section 7.4).

---

## 5. Redirects from the old WordPress site

The old site is down. **Start recovering the URL list now**, before launch work depends on it.

### Sources, in order of reliability

1. **Google Search Console** (Pages and Performance reports, export). Best for pages that earned impressions.
2. **Hosting backup** or database dump of the old site: published posts and pages with their slugs.
3. **Internet Archive:** list captured URLs with the CDX API, for example:
   `https://web.archive.org/cdx/search/cdx?url=<old-domain>/*&output=json&fl=original,statuscode&collapse=urlkey`
4. Backlink tools or old sitemaps if available.

### Process

1. Collect and de-duplicate URLs. Normalise (lowercase, strip tracking parameters, trailing slashes).
2. Drop junk: `wp-admin`, `wp-json`, feeds, attachments, search pages, and 404s.
3. Map each old URL to the **closest** new page. Home is a last resort, not a default. Pages with no equivalent get a sensible parent (for example the services index) or a 410 if truly gone.
4. Import into `redirects` (`/api/staff/redirects/import`): `from,to,type`. The importer checks for loops and chains.
5. Test: a script requests every `from` URL on staging and asserts a single 301 hop to the intended `to`, which returns 200.
6. After launch, watch Search Console for 404 spikes and add missing redirects.

Keep redirects permanently (at least 12 months, ideally longer).

---

## 6. Analytics and tracking

### Tools

- **Google Analytics 4** with a Measurement ID in `NEXT_PUBLIC_GA4_ID`. Loaded with `next/script` after interaction or idle so it does not harm LCP.
- **Google Search Console:** verify the production property (DNS verification preferred); submit the sitemap.
- **Google Business Profile:** claim and verify for MCS, categories, services, hours, phone, photos, link to the site. Keep name, address, phone identical to the site (consistency matters for local search).

### Events (all required)

| Event | When | Parameters |
|---|---|---|
| `call_click` | Any `tel:` link clicked | `page_path`, `location` (header, hero, sticky bar, footer) |
| `whatsapp_click` | Any WhatsApp link clicked | `page_path`, `location`, `product` (if any) |
| `form_submit` | Successful lead creation | `form_type` (`contact`, `quote`, `inspection`), `page_path` |
| `add_to_quote` | Product added to quote basket | `product`, `pack` |
| `chat_open` | Live chat opened | `provider` |
| `generate_lead` | Alias of `form_submit` for GA4 key event | |

Implementation: one delegated click listener reading `data-track` attributes, plus explicit calls in form success handlers. Mark `form_submit`, `call_click`, `whatsapp_click` as key events in GA4.

Privacy: no names, phones, emails or free text in event parameters. The Privacy Policy describes analytics use. Lead records store UTM values and the source path for attribution inside the inbox.

---

## 7. Launch content for local SEO

10 to 15 Lahore area pages and 6 blog articles (candidates in `docs/CONTENT.md` section 11). Each has unique, useful content and internal links.

---

## 8. Technical SEO checklist

- [ ] Server-rendered content, no content hidden behind client-only rendering
- [ ] One H1 per page, logical headings
- [ ] Images with alt, dimensions, modern formats
- [ ] Core Web Vitals pass (`docs/QUALITY.md`)
- [ ] Mobile-friendly, no horizontal scroll
- [ ] 404 page helpful, returns a real 404
- [ ] Unpublished or trashed pages return 404 (or 410) and leave the sitemap
- [ ] `hreflang` added when Urdu launches (not before)
- [ ] Redirect map tested; no chains or loops
- [ ] Sitemap submitted; production indexable; staging noindex
