# MCS Content Plan — Demo/Launch-Ready Page Set

> **Status:** Implementation plan for the database seed requested on 2026-11-26.
> **Scope:** original, SEO-friendly content for the public site; no text or images copied from the reference site.
> **Reference:** https://apexcore.pk/ (structure only — header, service grid, city pages, Pest Library, footer).
> **Implementation:** `src/seed/site.ts`, run with `pnpm seed:site`.

---

## 1. Rules for this content

1. **Original writing.** Nothing is copied from the reference site. Topics are the standard pests a Lahore pest-control company treats.
2. **No invented facts.** No years in business, customer counts, ratings, certifications, "24/7", "non-toxic" or "eco-friendly" claims. Where a real fact is needed later, the copy avoids a number rather than inventing one.
3. **Sample values are labelled.** The phone, WhatsApp, email and address in this seed are deliberate placeholders (`0300 0000000`, `hello@example.com`). Product prices are sample prices for demonstration. Replace them before launch.
4. **One H1 per page.** The page's own heading is the H1; supporting sections use H2.
5. **Useful length.** Unique meta title (≤60 chars) and meta description (≤160 chars) on every indexable page. Body copy is written for people first and answers the questions the page targets.
6. **Internal linking.** Every service links to its related locations and products; every location links to its available services; every Pest Library article links to at least one service and one location.
7. **Safety first.** Product pages carry practical safety information and a note that the label and the technician's instructions always take precedence.
8. **Images are placeholders.** Where a slot is filled, the seed uploads a branded `placehold.co` image (for example `https://placehold.co/1600x900/0f3d2e/e8f5ef?text=...`) at the size the layout expects. Real photos replace them later; the copy does not describe what a photo shows.

---

## 2. Sitemap

| URL                            | Type                | Search intent / target keyword | Meta title                                         | Meta description                                                                                                                |
| ------------------------------ | ------------------- | ------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `/`                            | Home page (`pages`) | pest control in Lahore         | Pest Control in Lahore \| Malaysian Care System    | Professional pest control in Lahore for homes and businesses. Explore treatments, book a free inspection and get a clear quote. |
| `/about-us`                    | `pages`             | pest control company Lahore    | About Malaysian Care System \| Lahore Pest Control | Meet the team behind MCS, how we approach pest problems and the standards we hold ourselves to on every visit.                  |
| `/services`                    | index               | pest control services Lahore   | Pest Control Services in Lahore \| MCS             | Termite, cockroach, rodent, mosquito, bed bug and general pest treatments for Lahore homes and businesses.                      |
| `/services/termite-control`    | `services`          | termite control Lahore         | Termite Control in Lahore \| MCS                   | Pre- and post-construction termite treatment, inspection and prevention for Lahore properties.                                  |
| `/services/cockroach-control`  | `services`          | cockroach control Lahore       | Cockroach Control in Lahore \| MCS                 | Kitchen-safe cockroach treatment using gel bait, targeted spraying and entry-point sealing.                                     |
| `/services/bed-bug-control`    | `services`          | bed bug treatment Lahore       | Bed Bug Treatment in Lahore \| MCS                 | Mattress, frame and room treatment for bed bugs, with preparation guidance and a follow-up inspection.                          |
| `/services/rodent-control`     | `services`          | rodent control Lahore          | Rodent Control in Lahore \| MCS                    | Rat and mouse control for homes, shops and warehouses using baiting, trapping and exclusion.                                    |
| `/services/mosquito-control`   | `services`          | mosquito control Lahore        | Mosquito Control in Lahore \| MCS                  | Reduce mosquito breeding and biting with larviciding, fogging and practical drainage advice.                                    |
| `/services/ant-control`        | `services`          | ant control Lahore             | Ant Control in Lahore \| MCS                       | Targeted ant treatment for kitchens, gardens and building edges, with prevention advice.                                        |
| `/services/lizard-control`     | `services`          | lizard control Lahore          | Lizard Control in Lahore \| MCS                    | Discreet lizard control for homes and offices, focused on entry points and harbourage.                                          |
| `/services/fumigation`         | `services`          | fumigation services Lahore     | Fumigation Services in Lahore \| MCS               | Commercial and residential fumigation planning, safety briefing and post-treatment guidance.                                    |
| `/products`                    | index               | pest control products Lahore   | Pest Control Products in Lahore \| MCS             | Browse professional pest-control packs and treatment kits available from MCS in Lahore.                                         |
| `/products/[slug]`             | `products`          | product name                   | Product name \| MCS Lahore                         | Pack sizes, sample pricing, how to use and safety information for this MCS product.                                             |
| `/locations`                   | index               | pest control areas Lahore      | Pest Control Areas in Lahore \| MCS                | Find MCS pest control coverage by Lahore city and neighbourhood, with local pest notes and FAQs.                                |
| `/locations/lahore`            | `locations` (city)  | pest control Lahore            | Pest Control in Lahore \| MCS Service Areas        | City-wide pest control coverage, common Lahore pests and the neighbourhoods our teams serve.                                    |
| `/locations/lahore/dha-lahore` | `locations` (area)  | pest control DHA Lahore        | Pest Control in DHA Lahore \| MCS                  | Termite, rodent and mosquito treatment for DHA Lahore homes, with local notes and booking details.                              |
| `/locations/lahore/gulberg`    | `locations` (area)  | pest control Gulberg Lahore    | Pest Control in Gulberg Lahore \| MCS              | Pest control for Gulberg homes, offices and restaurants, including cockroach and rodent treatment.                              |
| `/locations/lahore/johar-town` | `locations` (area)  | pest control Johar Town        | Pest Control in Johar Town \| MCS                  | Household pest control in Johar Town: termites, mosquitoes, cockroaches and rodents.                                            |
| `/locations/lahore/model-town` | `locations` (area)  | pest control Model Town Lahore | Pest Control in Model Town Lahore \| MCS           | Pest control for older Model Town homes, including termite inspection and rodent exclusion.                                     |
| `/warranty`                    | `pages`             | pest control warranty Lahore   | Pest Control Warranty \| Malaysian Care System     | How our service warranty works, what it covers and how to raise a claim after treatment.                                        |
| `/pest-library`                | index (posts)       | pest control guides Lahore     | Pest Library \| Pest Control Guides by MCS         | Practical guides to termites, mosquitoes, cockroaches and rodents in Lahore homes and businesses.                               |
| `/pest-library/[slug]`         | `posts`             | article keyword                | Article title \| MCS Pest Library                  | Article summary with practical prevention and treatment guidance from the MCS team.                                             |
| `/contact-us`                  | `pages`             | pest control contact Lahore    | Contact MCS \| Pest Control in Lahore              | Call, WhatsApp or email Malaysian Care System to ask about a pest problem or book a visit.                                      |
| `/get-a-quote`                 | `pages`             | pest control quote Lahore      | Get a Pest Control Quote \| MCS Lahore             | Tell us about the property and the pest problem to receive a clear, itemised quote.                                             |
| `/free-inspection`             | `pages`             | free pest inspection Lahore    | Free Pest Inspection in Lahore \| MCS              | Request a free inspection so a technician can identify the pest and recommend the right treatment.                              |
| `/terms-and-conditions`        | `pages` (legal)     | —                              | Terms and Conditions \| MCS                        | Terms covering inspections, quotations, treatment and payments for MCS services.                                                |
| `/privacy-policy`              | `pages` (legal)     | —                              | Privacy Policy \| MCS                              | How Malaysian Care System collects, uses and protects enquiry and customer information.                                         |

Reserved URLs such as `/admin`, `/api`, `/edit` are never used by content.

---

## 3. Navigation and footer

**Header (8 items, the documented maximum):**
Home · About Us · Services · Products · Locations · Warranty · Pest Library · Contact Us

**Header buttons:** Free Inspection → `/free-inspection`; Get a Quote → `/get-a-quote`.

**Footer columns:**

- **Company:** About Us, Our Services, Pest Library, Contact Us
- **Services:** Termite Control, Cockroach Control, Rodent Control, Mosquito Control, Bed Bug Control, Fumigation
- **Areas:** Lahore, DHA Lahore, Gulberg, Johar Town, Model Town
- **Legal:** Terms and Conditions, Privacy Policy, Warranty

---

## 4. Home page

| Order | Block                | Purpose / copy direction                                                                                                                                                     |
| ----- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `hero`               | H1 "Pest control in Lahore, done properly." Subline about trained technicians, clear plans and a free inspection. Primary action: Free Inspection. Secondary: Call/WhatsApp. |
| 2     | `trustStrip`         | Three verifiable facts about this site: 8 core services, 6 Pest Library guides, 4 Lahore areas covered. Each carries an internal proof note.                                 |
| 3     | `servicesGrid`       | Auto: all published services. Headline "What we treat".                                                                                                                      |
| 4     | `textBlocks` + `cta` | Termite spotlight: why termites are easy to miss, what an inspection covers, link to the termite service.                                                                    |
| 5     | `whyChoose`          | Four reasons: inspection first, written plan, safety briefing, follow-up. No superlatives.                                                                                   |
| 6     | `howItWorks`         | Exactly 5 steps: contact → inspection → plan and quote → treatment → follow-up.                                                                                              |
| 7     | `textBlocks`         | "How pricing works": quote after inspection, no hidden add-ons; sample prices only on product pages.                                                                         |
| 8     | `warrantyPromise`    | Explains the warranty in plain language and links to `/warranty`.                                                                                                            |
| 9     | `whoWeServe`         | Homes, builders, restaurants and hotels, schools, offices, shops and warehouses.                                                                                             |
| 10    | `textBlocks` + `cta` | Areas: Lahore city and the four seeded neighbourhoods, link to `/locations`.                                                                                                 |
| 11    | `inspectionForm`     | Free inspection invitation.                                                                                                                                                  |
| 12    | `faq`                | Six questions: safety, preparation, duration, follow-up, commercial work, coverage.                                                                                          |
| 13    | `cta`                | Final call to action with Free Inspection and WhatsApp.                                                                                                                      |

`ourDifference`, `beforeAfter`, `reviews`, `certificates`, `pricingGuide`, `featuredProducts`, `areasServed` and `latestPosts` are **not** used yet: they need proof, consent, verified reviews or collections that are still being built.

---

## 5. Supporting pages

### 5.1 About Us

Hero → how MCS works (text) → four standards (why choose) → who we serve → CTA.
No founding year, team size, awards or certification claims.

### 5.2 Warranty

Hero → what the warranty covers, what it does not, how to claim (text) → three FAQs → CTA.
Copy is marked as a sample warranty summary and must be replaced with client-approved terms.

### 5.3 Contact Us

Hero → contact details from `site-settings` → short "what to include in your message" text → FAQ → CTA.
The contact form is not built yet (Phase 6); the page directs people to call, WhatsApp or email.

### 5.4 Get a Quote

Hero → what a quote includes → five-step process → inspection invitation → CTA.
No fake quote form; the inspection form block links to the free-inspection page.

### 5.5 Free Inspection

Hero → what the technician checks → what to prepare → inspection form block → three FAQs.

### 5.6 Terms and Privacy

Plain, short sample policies with headings for scope, bookings, payment, cancellation, liability, data collected, use, retention, cookies and contact. Flagged `isLegal`; a lawyer must replace them before launch.

---

## 6. Services (8)

Each service gets: title, slug, icon key, short description, 3–10 signs, 3–8 treatment steps, a starting price (sample, in PKR), related products, Lahore areas served, 3–8 FAQs, SEO fields and an order.

| Order | Service           | Slug                | Primary keyword          |
| ----- | ----------------- | ------------------- | ------------------------ |
| 1     | Termite Control   | `termite-control`   | termite control Lahore   |
| 2     | Cockroach Control | `cockroach-control` | cockroach control Lahore |
| 3     | Bed Bug Control   | `bed-bug-control`   | bed bug treatment Lahore |
| 4     | Rodent Control    | `rodent-control`    | rodent control Lahore    |
| 5     | Mosquito Control  | `mosquito-control`  | mosquito control Lahore  |
| 6     | Ant Control       | `ant-control`       | ant control Lahore       |
| 7     | Lizard Control    | `lizard-control`    | lizard control Lahore    |
| 8     | Fumigation        | `fumigation`        | fumigation Lahore        |

**Angle for each:** what the pest does, the signs to look for, how the visit works, what the customer must do before and after, and when to book. No pest-eradication guarantee language; the warranty page carries the actual terms.

---

## 7. Locations (1 city + 4 areas)

| Location   | Slug         | Local angle (unique copy)                                                                    |
| ---------- | ------------ | -------------------------------------------------------------------------------------------- |
| Lahore     | `lahore`     | City-wide coverage; old and new construction; monsoon mosquito season; commercial corridors. |
| DHA Lahore | `dha-lahore` | Larger plots and lawns, boundary walls, new-build termite risk, mosquito standing water.     |
| Gulberg    | `gulberg`    | Apartments, offices and restaurants; cockroach and rodent pressure in shared service areas.  |
| Johar Town | `johar-town` | Family homes, schools and markets; kitchen pests, mosquitoes and rodent entry points.        |
| Model Town | `model-town` | Older houses with mature trees and original woodwork; termite and rodent inspection.         |

Each area publishes only after meeting the documented gate: 400+ characters of unique local notes, 3 neighbourhoods or landmarks, 2 common pests, at least 1 available service and 3 local FAQs. Similarity to siblings stays well below the 80% block.

---

## 8. Products (6)

Sample catalogue with pack sizes, sample PKR rates, stock status, description, how to use and safety information.

| Product                              | Slug                                 | Packs (sample)                       |
| ------------------------------------ | ------------------------------------ | ------------------------------------ |
| Termite Treatment — Pre-Construction | `termite-pre-construction-treatment` | 1 marla, 5 marla, 10 marla           |
| Cockroach Gel Bait Kit               | `cockroach-gel-bait-kit`             | 1 syringe, 3 syringes                |
| Rodent Bait Station Kit              | `rodent-bait-station-kit`            | 2 stations, 6 stations               |
| Mosquito Larvicide Pack              | `mosquito-larvicide-pack`            | 250 g, 1 kg                          |
| Bed Bug Treatment Kit                | `bed-bug-treatment-kit`              | 1 room, 3 rooms                      |
| General Disinfection Service         | `general-disinfection-service`       | Up to 1,000 sq ft, up to 2,500 sq ft |

Rates are **sample prices** and every product page says so in the safety/pricing note. Products are enquiry-only: WhatsApp and Add to Quote, no checkout.

---

## 9. Pest Library (6 articles)

| Article                                                             | Slug                                   | Links to                     |
| ------------------------------------------------------------------- | -------------------------------------- | ---------------------------- |
| How to spot termites before they damage your Lahore home            | `signs-of-termites-in-lahore-homes`    | Termite Control, Model Town  |
| Preparing your building for pre-construction anti-termite treatment | `preparing-for-anti-termite-treatment` | Termite Control, DHA Lahore  |
| Stopping dengue mosquitoes around your home                         | `preventing-dengue-mosquitoes-at-home` | Mosquito Control, Johar Town |
| A practical plan for kitchen cockroaches                            | `kitchen-cockroach-control-plan`       | Cockroach Control, Gulberg   |
| Bed bugs in hotels: how treatment actually works                    | `bed-bugs-in-hotels-treatment`         | Bed Bug Control, Gulberg     |
| Keeping rodents out of shops and warehouses                         | `keeping-rodents-out-of-shops`         | Rodent Control, Lahore       |

Each article: 500–800 words, headings, short paragraphs, a "when to call a professional" section and internal links. Written as advice, not as a sales page.

---

## 10. Images

Placeholder slots, all optional so the site still works if the bucket is unreachable:

| Use                    | Placeholder size |
| ---------------------- | ---------------- |
| Home hero background   | 1600×900         |
| About page image       | 1200×800         |
| Service hero (8)       | 1200×800         |
| Product image (6)      | 800×800          |
| Pest Library cover (6) | 1200×675         |

Placeholders use the MCS green (`0f3d2e`) with light text so the layout reads as intentional. Real photographs replace them one for one; alt text describes the subject, never the placeholder.

---

## 11. Database reset and seed behaviour

`pnpm seed:site` will:

1. Refuse to run when `SITE_ENV=production`.
2. Truncate content tables only: `pages`, `services`, `locations`, `products`, `price_history`, `categories`, `posts`, `media`, their version/block/relation tables, and the two globals. **Users and audit logs are left alone.**
3. Update `site-settings` with clearly marked placeholder contact facts and the `navigation` global with the menu and footer above.
4. Create services first, then locations, then products, then pages, then Pest Library posts — because each step links to the previous one.
5. Upload a small set of branded `placehold.co` images; if Filebase cannot be reached, log a warning and continue without images.
6. Publish the content so the site is browsable immediately. Legal pages publish through a seed-only Super Admin identity so the legal gate stays enforced in the admin.
7. Be idempotent by deleting and recreating its own content on each run.

---

## 12. Verification checklist

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm format:check` pass.
- [ ] `pnpm seed:site` completes and a second run gives the same page counts.
- [ ] `/` renders with every seeded block and one H1.
- [ ] `/services` and all 8 service pages return 200; an unknown slug returns 404.
- [ ] `/locations`, the city page and all 4 area pages return 200.
- [ ] `/products` and all 6 product pages return 200 with pack prices.
- [ ] `/pest-library` lists 6 articles; each article returns 200.
- [ ] `/about-us`, `/warranty`, `/contact-us`, `/get-a-quote`, `/free-inspection`, `/terms-and-conditions`, `/privacy-policy` return 200.
- [ ] Header and footer links resolve; no link points to a 404.
- [ ] Every page has a unique title and description.
- [ ] No `TODO(client)` in published page copy (sample/placeholder notes live only where allowed).
