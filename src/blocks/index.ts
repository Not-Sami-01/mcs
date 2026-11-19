import type { Block, Field } from 'payload';

import { actionFields, rows, seoGroup, textField, textareaField } from '../cms/fields';

/**
 * First set of blocks (docs/CONTENT.md §6). Blocks that need relations to
 * collections arriving in CP-5 (services, locations, products, reviews, posts)
 * are added with those collections — `allowed.ts` tracks what is deferred.
 *
 * Every text field is capped through a factory and every list through a count
 * preset; `src/cms/config.test.ts` walks these and fails on drift.
 */

const media = (name: string, label: string, required = false): Field => ({
  name,
  label,
  type: 'upload',
  relationTo: 'media',
  required,
});

export const hero: Block = {
  slug: 'hero',
  fields: [
    textField({ name: 'eyebrow', label: 'Eyebrow', preset: 'eyebrow' }),
    textField({ name: 'headline', label: 'Headline', preset: 'headline', required: true }),
    textareaField({ name: 'subheadline', label: 'Subheadline', preset: 'subheadline' }),
    {
      name: 'primaryAction',
      label: 'Primary action',
      type: 'group',
      fields: actionFields(),
      required: true,
    },
    {
      name: 'secondaryActions',
      label: 'Secondary actions',
      type: 'array',
      ...rows('heroSecondaryButtons'),
      fields: actionFields(),
    },
    media('image', 'Background image'),
  ],
};

export const trustStrip: Block = {
  slug: 'trustStrip',
  fields: [
    {
      name: 'items',
      label: 'Stats',
      type: 'array',
      ...rows('trustStripItems'),
      fields: [
        textField({ name: 'statValue', label: 'Value', preset: 'statValue', required: true }),
        textField({ name: 'statLabel', label: 'Label', preset: 'statLabel', required: true }),
        // Publish gate (docs/INLINE-EDITING.md §9): every stat needs proof.
        textareaField({
          name: 'proofNote',
          label: 'Proof note (internal)',
          preset: 'shortParagraph',
          required: true,
          admin: {
            description: 'Internal note: where this number comes from. Never rendered.',
          },
        }),
      ],
    },
  ],
};

export const whyChoose: Block = {
  slug: 'whyChoose',
  fields: [
    textField({ name: 'headline', label: 'Headline', preset: 'headline', required: true }),
    {
      name: 'items',
      label: 'Items',
      type: 'array',
      ...rows('whyChooseItems'),
      fields: [
        textField({ name: 'icon', label: 'Icon', preset: 'slug', required: true }),
        textField({ name: 'cardTitle', label: 'Title', preset: 'cardTitle', required: true }),
        textareaField({ name: 'cardBody', label: 'Body', preset: 'cardBody', required: true }),
      ],
    },
  ],
};

export const ourDifference: Block = {
  slug: 'ourDifference',
  fields: [
    textField({ name: 'headline', label: 'Headline', preset: 'headline', required: true }),
    textareaField({
      name: 'shortParagraph',
      label: 'Intro',
      preset: 'shortParagraph',
      required: true,
    }),
    {
      name: 'points',
      label: 'Points',
      type: 'array',
      ...rows('differencePoints'),
      fields: [textField({ name: 'point', label: 'Point', preset: 'listItem', required: true })],
    },
    // Publish gate: needs proof, hidden until Q3 is answered (docs/CONTENT.md §6).
    textareaField({
      name: 'proofNote',
      label: 'Proof note (internal)',
      preset: 'shortParagraph',
      required: true,
      admin: { description: 'Internal note: what proves this. Never rendered.' },
    }),
  ],
};

export const howItWorks: Block = {
  slug: 'howItWorks',
  fields: [
    textField({ name: 'headline', label: 'Headline', preset: 'headline', required: true }),
    {
      name: 'steps',
      label: 'Steps',
      type: 'array',
      ...rows('howItWorksSteps'),
      fields: [
        textField({ name: 'cardTitle', label: 'Title', preset: 'cardTitle', required: true }),
        textareaField({ name: 'cardBody', label: 'Body', preset: 'cardBody', required: true }),
      ],
    },
  ],
};

export const warrantyPromise: Block = {
  slug: 'warrantyPromise',
  fields: [
    textField({ name: 'headline', label: 'Headline', preset: 'headline', required: true }),
    textareaField({
      name: 'shortParagraph',
      label: 'Body',
      preset: 'shortParagraph',
      required: true,
    }),
    {
      name: 'highlights',
      label: 'Highlights',
      type: 'array',
      ...rows('warrantyHighlights'),
      fields: [
        textField({ name: 'highlight', label: 'Highlight', preset: 'listItem', required: true }),
      ],
    },
    {
      name: 'link',
      label: 'Link to warranty page',
      type: 'group',
      fields: actionFields(),
      required: true,
    },
  ],
};

export const whoWeServe: Block = {
  slug: 'whoWeServe',
  fields: [
    textField({ name: 'headline', label: 'Headline', preset: 'headline', required: true }),
    {
      name: 'items',
      label: 'Items',
      type: 'array',
      ...rows('whoWeServeItems'),
      fields: [
        textField({ name: 'title', label: 'Title', preset: 'cardTitle', required: true }),
        textareaField({ name: 'cardBody', label: 'Body', preset: 'cardBody', required: true }),
        { name: 'link', label: 'Link', type: 'group', fields: actionFields() },
      ],
    },
  ],
};

export const beforeAfter: Block = {
  slug: 'beforeAfter',
  fields: [
    textField({ name: 'headline', label: 'Headline', preset: 'headline', required: true }),
    {
      name: 'pairs',
      label: 'Pairs',
      type: 'array',
      ...rows('beforeAfterPairs'),
      fields: [
        media('before', 'Before image', true),
        media('after', 'After image', true),
        textField({ name: 'caption', label: 'Caption', preset: 'caption' }),
        textField({ name: 'area', label: 'Area', preset: 'listItem' }),
        // Publish gate (docs/INLINE-EDITING.md §9, Q15): consent is mandatory.
        {
          name: 'consentConfirmed',
          label: 'Photo consent confirmed',
          type: 'checkbox',
          required: true,
        },
      ],
    },
  ],
};

export const certificates: Block = {
  slug: 'certificates',
  fields: [
    textField({ name: 'headline', label: 'Headline', preset: 'headline', required: true }),
    {
      name: 'items',
      label: 'Certificates',
      type: 'array',
      ...rows('certificates'),
      fields: [
        media('image', 'Image', true),
        textField({ name: 'title', label: 'Title', preset: 'cardTitle', required: true }),
        textField({ name: 'issuer', label: 'Issuer', preset: 'cardTitle', required: true }),
      ],
    },
  ],
};

export const inspectionForm: Block = {
  slug: 'inspectionForm',
  fields: [
    textField({ name: 'headline', label: 'Headline', preset: 'headline', required: true }),
    textareaField({
      name: 'shortParagraph',
      label: 'Intro',
      preset: 'shortParagraph',
      required: true,
      admin: { description: 'Form fields themselves are fixed (docs/CONTENT.md §6).' },
    }),
  ],
};

export const faq: Block = {
  slug: 'faq',
  fields: [
    textField({ name: 'headline', label: 'Headline', preset: 'headline', required: true }),
    {
      name: 'items',
      label: 'Questions',
      type: 'array',
      ...rows('faqItems'),
      fields: [
        textField({
          name: 'question',
          label: 'Question',
          preset: 'faqQuestion',
          required: true,
        }),
        textareaField({ name: 'answer', label: 'Answer', preset: 'faqAnswer', required: true }),
      ],
    },
  ],
};

export const cta: Block = {
  slug: 'cta',
  fields: [
    textField({ name: 'headline', label: 'Headline', preset: 'headline', required: true }),
    textareaField({ name: 'cardBody', label: 'Body', preset: 'cardBody', required: true }),
    {
      name: 'buttons',
      label: 'Buttons',
      type: 'array',
      ...rows('ctaButtons'),
      fields: actionFields(),
    },
  ],
};

export const textBlocks: Block = {
  slug: 'textBlocks',
  fields: [
    textField({ name: 'headline', label: 'Headline', preset: 'headline', required: true }),
    {
      name: 'paragraphs',
      label: 'Paragraphs',
      type: 'array',
      ...rows('textBlockParagraphs'),
      fields: [
        textareaField({
          name: 'paragraph',
          label: 'Paragraph',
          preset: 'paragraph',
          required: true,
        }),
      ],
    },
  ],
};

export const contactDetails: Block = {
  slug: 'contactDetails',
  fields: [
    textField({ name: 'headline', label: 'Headline', preset: 'headline', required: true }),
    // Values come from the `site-settings` global (CP-1.3), not from this block.
  ],
};

/** Every block implemented so far, in catalogue order. */
export const BLOCKS: Block[] = [
  hero,
  trustStrip,
  whyChoose,
  ourDifference,
  howItWorks,
  warrantyPromise,
  whoWeServe,
  beforeAfter,
  certificates,
  inspectionForm,
  faq,
  cta,
  textBlocks,
  contactDetails,
];

/** Blocks in docs/CONTENT.md §6 that wait on CP-5 collections. */
export const DEFERRED_BLOCK_SLUGS = [
  'servicesGrid',
  'featureSpotlight',
  'pricingGuide',
  'areasServed',
  'featuredProducts',
  'reviews',
  'latestPosts',
] as const;

// `seoGroup` is used by collections, not blocks; re-exported here so block
// consumers have one import surface if a block ever needs it.
export { seoGroup };
