# CONTENT — Sitemap, Blocks, Limits and Copy Rules

> **Purpose:** defines what content exists, how it is structured, how much text each field may hold, and the rules for writing it. The limits table is mirrored in `src/cms/limits.ts`; if they differ, fix the doc or the code in the same commit.

---

## 1. Principles

1. **Real facts only.** Numbers, certificates, reviews and years in business must be provable. No invented figures. Missing → `TODO(client)`.
2. **Enquiry first.** Every page offers Call, WhatsApp, Free Inspection or Get a Quote.
3. **Local and specific.** Location pages carry genuinely local content, not a city name swapped into a template.
4. **Short and scannable.** Limits exist so layouts stay clean, and because short copy converts better on a phone.
5. **Plain English now, Urdu later.** No idioms that will not translate. UI strings live in a message catalogue.
6. **Safety is part of the product.** Chemicals and treatments always come with accurate safety information.

---

## 2. Brand facts (all must come from the client)

Stored in the `site-settings` global, never hard-coded.

| Fact                                                | Value                                   |
| --------------------------------------------------- | --------------------------------------- |
| Company name                                        | Malaysian Care System (MCS)             |
| Phone                                               | `TODO(client)`                          |
| WhatsApp number (international format, digits only) | `TODO(client)`                          |
| Email                                               | `TODO(client)`                          |
| Address                                             | `TODO(client)` (Lahore)                 |
| Working hours and timezone                          | `TODO(client)`, timezone `Asia/Karachi` |
| Years in business, rating, team size                | `TODO(client)`, with proof              |
| Certifications and licences                         | `TODO(client)`, with documents          |
| Logo and brand colours                              | `TODO(client)`                          |
| Social links                                        | `TODO(client)`                          |

---

## 3. Sitemap and URLs

| URL                                               | Source                  | Notes                              |
| ------------------------------------------------- | ----------------------- | ---------------------------------- |
| `/`                                               | `pages` (slug `home`)   | Built from blocks                  |
| `/about-us`                                       | `pages`                 |                                    |
| `/services`                                       | index page              | Auto-lists services                |
| `/services/[slug]`                                | `services`              | Service detail                     |
| `/products`                                       | index page              |                                    |
| `/products/[slug]`                                | `products`              | Product detail                     |
| `/locations`                                      | index page              | Cities                             |
| `/locations/[city]`                               | `locations` (type city) |                                    |
| `/locations/[city]/[area]`                        | `locations` (type area) | Unique local content required      |
| `/warranty`                                       | `pages`                 |                                    |
| `/pest-library`                                   | index page              | Blog                               |
| `/pest-library/[slug]`                            | `posts`                 |                                    |
| `/contact-us`, `/get-a-quote`, `/free-inspection` | `pages` with form block |                                    |
| `/terms-and-conditions`, `/privacy-policy`        | `pages`                 | Lawyer review                      |
| `/[category-path]/[slug]`                         | `pages` in a category   | Any category tree the admin builds |

**Reserved slugs** (cannot be used by pages): `admin`, `api`, `edit`, `_next`, `sitemap.xml`, `robots.txt`, `favicon.ico`.

Rules: lowercase, hyphens, ASCII, no trailing slash, no dates in URLs, one canonical URL per page. A changed URL creates a 301 automatically (`docs/SEO.md`).

---

## 4. Navigation and footer

Managed in the `navigation` global and editable inline.

- **Header:** Home, About Us, Services, Products, Locations, Warranty, Pest Library, Contact Us. Buttons: Free Inspection, Get a Quote. Phone shown on desktop; sticky call bar on mobile.
- **Footer:** company blurb, quick links, services, areas, contact details, legal links, social links.
- Limits: top-level items max 8; children per item max 10; label max 24 characters.
- Menu children can be filled automatically from a category (for example Services > all published services).

---

## 5. Text and count limits

Canonical values live in `src/cms/limits.ts`. They are starting points. Tune them against the real design in CP-3.2, and update both places.

### Text presets (characters)

| Preset            |    Max | Typical use                                     |
| ----------------- | -----: | ----------------------------------------------- |
| `eyebrow`         |     40 | Small label above a headline                    |
| `headline`        |     80 | Section headings, hero H1                       |
| `subheadline`     |    200 | Hero supporting line                            |
| `cardTitle`       |     60 | Card and list item titles                       |
| `cardBody`        |    160 | Card text                                       |
| `shortParagraph`  |    400 | Intro paragraphs                                |
| `paragraph`       |    600 | Body paragraph (max 8 paragraphs per block)     |
| `buttonLabel`     |     24 | Buttons and links                               |
| `statValue`       |     12 | "15+", "4.8"                                    |
| `statLabel`       |     40 | "Years of experience"                           |
| `listItem`        |    100 | Bullets, signs, highlights                      |
| `faqQuestion`     |    120 |                                                 |
| `faqAnswer`       |    600 |                                                 |
| `reviewText`      |    300 |                                                 |
| `reviewerName`    |     60 |                                                 |
| `caption`         |    100 | Image captions                                  |
| `altText`         |    160 | Required on every image                         |
| `menuLabel`       |     24 |                                                 |
| `metaTitle`       |     60 | SEO title                                       |
| `metaDescription` |    160 | SEO description                                 |
| `slug`            |     80 |                                                 |
| `path`            |    320 | Computed full URL path for categories and pages |
| `localNotes`      |  1,500 | Location unique content (minimum 400, see 7.4)  |
| `postBody`        | 20,000 | Blog and legal pages, rich text                 |
| `url`             |    200 | External link targets                           |
| `emailAddress`    |    254 | Email addresses                                 |
| `auditSummary`    |    300 | Audit-log line (no personal data)               |
| `ipHash`          |     64 | Salted IP hash in the audit log                 |

### Count limits (items)

| Preset                   | Min | Max |
| ------------------------ | --: | --: |
| Blocks per page          |   1 |  30 |
| Hero secondary buttons   |   0 |   2 |
| Trust strip items        |   3 |   5 |
| Services grid cards      |   4 |  12 |
| Why choose items         |   3 |   6 |
| How it works steps       |   5 |   5 |
| Pricing guide rows       |   3 |   8 |
| Who we serve items       |   4 |   8 |
| Featured products        |   3 |   8 |
| Areas served             |   4 |  24 |
| Before and after pairs   |   2 |   6 |
| Reviews shown            |   3 |   9 |
| Certificates             |   2 |   8 |
| FAQ items                |   3 |  12 |
| CTA buttons              |   1 |   3 |
| Service signs            |   3 |  10 |
| Service treatment steps  |   3 |   8 |
| Service FAQs             |   3 |   8 |
| Product images           |   0 |   6 |
| Product pack sizes       |   1 |   8 |
| Product paragraphs       |   0 |   8 |
| Products used            |   0 |   6 |
| Product safety documents |   0 |   8 |
| Text block paragraphs    |   1 |   8 |
| Difference points        |   1 |   4 |
| Warranty highlights      |   1 |   4 |
| Header menu items        |   1 |   8 |
| Menu item children       |   0 |  10 |
| Header buttons           |   0 |   3 |
| Footer columns           |   1 |   5 |
| Footer column links      |   1 |  10 |
| Legal links              |   1 |   6 |
| Site phones              |   1 |   4 |
| Social links             |   0 |   8 |
| Lead alert recipients    |   0 |   5 |
| Seed sample pages        |   1 |   8 |

### Rendering safety

Limits prevent most overflow, but components must still survive the worst case: `overflow-wrap: anywhere`, line clamps where a card has a fixed height, no fixed pixel heights on text containers, images with fixed aspect ratios. See `docs/DESIGNS.md` section 8.

---

## 6. Block catalogue

Each block is a Payload block definition plus a renderer. Fields are listed with their preset. "Gate" means a publish-time rule.

| Block              | Fields                                                                                                                            | Gate                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `hero`             | eyebrow, headline, subheadline, primary action (Call / WhatsApp / Free Inspection / link), secondary actions (max 2), image + alt |                                                                            |
| `trustStrip`       | items 3–5: statValue, statLabel, proofNote (internal)                                                                             | Every item needs a `proofNote`. "Real numbers only"                        |
| `servicesGrid`     | headline, intro, mode (auto from services / manual pick), services 4–12                                                           |                                                                            |
| `featureSpotlight` | service (relation), headline, shortParagraph, bullets (max 5, listItem), image + alt                                              | Used for the termite spotlight                                             |
| `whyChoose`        | headline, items 3–6: icon, cardTitle, cardBody                                                                                    |                                                                            |
| `ourDifference`    | headline, shortParagraph, points (max 4), proofNote                                                                               | Needs `proofNote`. Hidden until Q3 answered                                |
| `howItWorks`       | headline, exactly 5 steps: cardTitle, cardBody                                                                                    |                                                                            |
| `pricingGuide`     | headline, note, rows 3–8: service (relation), startingPrice (PKR), unit, note; disclaimer                                         | Prices come from the service or are entered; `TODO(client)` blocks publish |
| `warrantyPromise`  | headline, shortParagraph, highlights (max 4), link to warranty page                                                               | Needs warranty terms (Q5)                                                  |
| `whoWeServe`       | headline, items 4–8: title, cardBody, link                                                                                        |                                                                            |
| `featuredProducts` | headline, mode (flag / manual), products 3–8                                                                                      |                                                                            |
| `areasServed`      | headline, locations 4–24                                                                                                          |                                                                            |
| `beforeAfter`      | headline, pairs 2–6: before + after images with alt, caption, area, consentConfirmed                                              | `consentConfirmed` required (Q15)                                          |
| `reviews`          | headline, reviews 3–9 from `reviews`                                                                                              | Only verified reviews                                                      |
| `certificates`     | headline, items 2–8: image + alt, title, issuer                                                                                   | Document on file                                                           |
| `inspectionForm`   | headline, shortParagraph. Form fields are fixed                                                                                   |                                                                            |
| `faq`              | headline, items 3–12: question, answer                                                                                            |                                                                            |
| `latestPosts`      | headline, count 3–6 (auto)                                                                                                        |                                                                            |
| `cta`              | headline, cardBody, buttons 1–3                                                                                                   |                                                                            |
| `textBlocks`       | headline, paragraphs (max 8, `paragraph`)                                                                                         | The marketing-page text block. No rich text                                |
| `contactDetails`   | headline; values come from `site-settings`                                                                                        |                                                                            |

Typed collections add their own structured fields (`docs/DATABASE.md`).

---

## 7. Page templates

### 7.1 Home (order)

1. `hero` (main keyword, Call, WhatsApp, Free Inspection)
2. `trustStrip`
3. `servicesGrid` then `featureSpotlight` (termite)
4. `whyChoose`, then `ourDifference` (only if provable)
5. `howItWorks` (5 steps)
6. `pricingGuide` (starting prices in PKR)
7. `warrantyPromise`
8. `whoWeServe` (homes, builders, restaurants and hotels, schools, hospitals, factories)
9. `featuredProducts`, `areasServed`
10. `beforeAfter`, `reviews`, `certificates`
11. `inspectionForm`
12. `faq`
13. `latestPosts`
14. `cta` (final)

### 7.2 Service detail

Hero with H1 (service plus city or "in Pakistan" only where true), signs, treatment steps, products used, starting price, areas served, FAQs, inspection form, CTA.

### 7.3 Product detail

Images, name, price, discount (shown only while active), pack size selector, stock status, description, how to use, safety information and documents, **Order on WhatsApp**, **Add to Quote**.

### 7.4 Location (city and area)

Required to publish: `localNotes` of at least 400 characters, at least 3 named neighbourhoods or landmarks, at least 2 pests or conditions common to that area, services available there, at least 3 FAQs specific to the place. A similarity check compares against sibling location pages: warn at 60 percent shingle overlap, block at 80 percent (defaults, tune later). This avoids thin, near-duplicate pages.

### 7.5 Forms pages

- **Free Inspection:** name, phone, city, area, pest type, preferred time, optional photos (max 3), consent. Short.
- **Get a Quote:** name, phone, email (optional), city, property type, service or products from the quote basket, message.
- **Contact Us:** name, phone or email, message. Plus the details from settings.
- Never ask for the same information twice in one journey.

### 7.6 Blog (Pest Library)

Title, excerpt, cover image, category, body (restricted rich text), author, reviewed-by (optional), published date, related services. Each post links to at least one service and one location page.

### 7.7 Legal pages

Terms and Conditions, Privacy Policy, Warranty. A lawyer reviews the final text. Super Admin publishes. Placeholders block publishing.

---

## 8. Reference site notes (https://apexcore.pk/)

Used for structure only. Never copy its words or images.

**Worth borrowing (structurally)**

- Header with phone, email and WhatsApp visible
- Icon grid of services near the top
- Menu with Services, Industries, Cities and a Pest Library
- Service cards that each have both a WhatsApp and a "learn more" button
- Counters section, testimonials, pricing packages, footer with company and service columns
- Pages per city and per service

**Avoid**

- Lorem ipsum in the pricing section and prices in dollars
- Counters that start at "0" or show "0 K" before animating (render real values server-side)
- Typos in headings and duplicated menu text
- Unprovable claims ("thousands of homeowners", "non-toxic", "24/7") unless MCS can back them
- Near-duplicate city pages with only the city name changed
- A very long menu. Keep to the limits in section 4

---

## 9. Calls to action

| CTA                 | Behaviour                                                                                                                                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Call**            | `tel:` link with the number from settings. Tracked as `call_click`                                                                                                                                                         |
| **WhatsApp**        | `https://wa.me/<digits>?text=<encoded message>` where the number is digits only, international format. Message template: `Hi MCS, I would like help with: {page or product name}. {page URL}`. Tracked as `whatsapp_click` |
| **Free Inspection** | Goes to `/free-inspection`, or opens the short form block on the page                                                                                                                                                      |
| **Get a Quote**     | Goes to `/get-a-quote` with quote basket items attached                                                                                                                                                                    |
| **Live chat**       | Loads on idle or interaction; falls back to WhatsApp when nobody is online or outside working hours                                                                                                                        |

Buttons: large (at least 44 px), one primary action per section, labels within `buttonLabel`.

---

## 10. Claims and compliance

- **Words that need proof or must be avoided:** "non-toxic", "100% safe", "guaranteed", "eco-friendly" (unless the products and process support it), "certified" (name the certification), "24/7" (only if true), "Malaysian" claims, years in business, client counts, ratings.
- Every statistic, certificate and "difference" claim carries an internal `proofNote` (document, date, who confirmed). Publishing is blocked without it.
- Product pages show manufacturer safety information and documents. Licence and labelling rules for pest control chemicals must be confirmed (Q2).
- Reviews: real, attributable, with permission. No invented names or cities. Show source and date.
- Before and after photos: customer consent on record (Q15).
- Prices shown as `Rs <number>` with "starting from" wording where true and a short disclaimer.
- Legal text reviewed by a lawyer.

---

## 11. Launch content set

Candidate lists to confirm with the client. Do not publish a page for a service or area MCS does not actually cover.

**Services (candidates, from the reference site's range):** integrated pest management, fumigation, termite control (spotlight), mosquito control, rodent control, cockroach control, bed bug control, lizard control, ant control, flies and wasps.

**Who we serve:** homes, builders, restaurants and hotels, schools, hospitals, factories.

**Lahore area pages (10 to 15; validate coverage):** DHA, Gulberg, Johar Town, Model Town, Bahria Town, Wapda Town, Allama Iqbal Town, Faisal Town, Garden Town, Cantt, Askari, Valencia Town, Township, Samanabad, Raiwind Road.

**Blog articles (6; validate topics and write from real expertise):** signs of termites in Lahore homes; preparing a building for anti-termite treatment; preventing dengue mosquitoes at home; kitchen cockroach control; bed bugs in hotels and how treatment works; keeping rodents out of shops and warehouses.

---

## 12. Content workflow and definition of done

- Editors write in the admin panel or inline. **Draft → preview → publish**, or schedule.
- Super Admin publishes legal pages and any block with a proof gate they own.
- **A page is done when:** it has a unique meta title and description within limits; every image has alt text; there is a clear CTA; internal links point to at least one related service and one location or post; no `TODO(client)` remains; claims have proof notes; it reads well at 360 px width.

---

## 13. Demo content seed (2026-11-26)

`pnpm seed:site` rebuilds the browsable demo site described in `content-plan.md`: 8 published pages (home, about, warranty, contact, quote, free inspection, terms, privacy), 8 services, Lahore plus four area pages, 6 products and 6 Pest Library articles. It is for development and staging only and refuses production.

- Copy is original and claim-light: no years in business, customer counts, certifications, "non-toxic", "eco-friendly" or "24/7" claims.
- Contact facts (`0300 0000000`, `hello@example.com`, sample address) and product rates are **placeholders**. Replace them in Site Settings and the products collection before launch.
- Legal pages are sample policies, published so the demo has complete routes. They still need the lawyer-reviewed text; publishing a real legal page remains Super Admin only.
- Images are branded `placehold.co` placeholders uploaded to the media collection and served by Payload's media route. Replace them with real photographs one for one.
- Every article links to a service and a location, and every page has a unique meta title and description.
