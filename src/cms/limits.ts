/**
 * Single source of truth for content and upload limits (AGENTS.md golden rule 2).
 *
 * Payload field configs, the inline editor and tests all read from here —
 * never hard-code a limit anywhere else.
 *
 * Text and count presets mirror `docs/CONTENT.md` section 5 exactly; a test
 * parses that document and fails if the two drift apart.
 */

/** Text presets (max characters). Source table: docs/CONTENT.md section 5. */
export const TEXT_LIMITS = {
  eyebrow: 40,
  headline: 80,
  subheadline: 200,
  cardTitle: 60,
  cardBody: 160,
  shortParagraph: 400,
  paragraph: 600,
  buttonLabel: 24,
  statValue: 12,
  statLabel: 40,
  listItem: 100,
  faqQuestion: 120,
  faqAnswer: 600,
  reviewText: 300,
  reviewerName: 60,
  caption: 100,
  /**
   * Image alt text. Raised from the doc's original 125 to 160 so the media
   * collection (`MEDIA_LIMITS.altMaxLength`) and this registry cannot disagree —
   * one value, one place.
   */
  altText: 160,
  menuLabel: 24,
  metaTitle: 60,
  metaDescription: 160,
  slug: 80,
  /** Computed full URL path for categories and pages (segments joined by `/`). */
  path: 320,
  /** Location unique content (minimum 400 characters, docs/CONTENT.md 7.4). */
  localNotes: 1500,
  /** Blog and legal pages, rich text. */
  postBody: 20000,
  /** External link targets (added for block action links; not in the original table). */
  url: 200,
  emailAddress: 254,
} as const;

export type TextPreset = keyof typeof TEXT_LIMITS;

/**
 * Count presets (items). `label` is the exact row name in
 * docs/CONTENT.md section 5 — the sync test matches on it.
 */
export const COUNT_LIMITS = {
  blocksPerPage: { label: 'Blocks per page', min: 1, max: 30 },
  heroSecondaryButtons: { label: 'Hero secondary buttons', min: 0, max: 2 },
  trustStripItems: { label: 'Trust strip items', min: 3, max: 5 },
  servicesGridCards: { label: 'Services grid cards', min: 4, max: 12 },
  whyChooseItems: { label: 'Why choose items', min: 3, max: 6 },
  howItWorksSteps: { label: 'How it works steps', min: 5, max: 5 },
  pricingGuideRows: { label: 'Pricing guide rows', min: 3, max: 8 },
  whoWeServeItems: { label: 'Who we serve items', min: 4, max: 8 },
  featuredProducts: { label: 'Featured products', min: 3, max: 8 },
  areasServed: { label: 'Areas served', min: 4, max: 24 },
  beforeAfterPairs: { label: 'Before and after pairs', min: 2, max: 6 },
  reviewsShown: { label: 'Reviews shown', min: 3, max: 9 },
  certificates: { label: 'Certificates', min: 2, max: 8 },
  faqItems: { label: 'FAQ items', min: 3, max: 12 },
  ctaButtons: { label: 'CTA buttons', min: 1, max: 3 },
  serviceSigns: { label: 'Service signs', min: 3, max: 10 },
  serviceTreatmentSteps: { label: 'Service treatment steps', min: 3, max: 8 },
  productImages: { label: 'Product images', min: 1, max: 6 },
  productPackSizes: { label: 'Product pack sizes', min: 1, max: 8 },
  // Added for blocks whose catalogue row states the cap inline (docs/CONTENT.md
  // section 6); rows added to the section 5 table to match.
  textBlockParagraphs: { label: 'Text block paragraphs', min: 1, max: 8 },
  differencePoints: { label: 'Difference points', min: 1, max: 4 },
  warrantyHighlights: { label: 'Warranty highlights', min: 1, max: 4 },
  headerMenuItems: { label: 'Header menu items', min: 1, max: 8 },
  menuItemChildren: { label: 'Menu item children', min: 0, max: 10 },
  headerButtons: { label: 'Header buttons', min: 0, max: 3 },
  footerColumns: { label: 'Footer columns', min: 1, max: 5 },
  footerColumnLinks: { label: 'Footer column links', min: 1, max: 10 },
  legalLinks: { label: 'Legal links', min: 1, max: 6 },
  sitePhones: { label: 'Site phones', min: 1, max: 4 },
  socialLinks: { label: 'Social links', min: 0, max: 8 },
  leadAlertRecipients: { label: 'Lead alert recipients', min: 0, max: 5 },
  seedSamplePages: { label: 'Seed sample pages', min: 1, max: 4 },
} as const;

export type CountPreset = keyof typeof COUNT_LIMITS;

export const MEDIA_LIMITS = {
  /** Alt text cap (alias of TEXT_LIMITS.altText — one source). */
  altMaxLength: TEXT_LIMITS.altText,
  /** Upload size caps in bytes: images 8 MB, PDFs (safety documents) 10 MB (docs/STORAGE.md §4). */
  maxImageBytes: 8 * 1024 * 1024,
  maxPdfBytes: 10 * 1024 * 1024,
  /** Widths in px of the generated variants. Never enlarge an upload. */
  imageWidths: {
    thumb: 400,
    card: 800,
    hero: 1600,
  },
  /** Allowed upload types, verified against the file's declared mime type. */
  mediaMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'application/pdf',
  ] as const,
} as const;

export type MediaLimits = typeof MEDIA_LIMITS;
