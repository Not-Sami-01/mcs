import type { Page } from '../payload-types';

export const sampleMarker = '[SAMPLE — replace before launch]';

export const sampleCategory = {
  title: `Sample Pages ${sampleMarker}`,
  slug: 'sample-pages',
  kind: 'general' as const,
  intro: 'Sample-only category. Replace or delete before launch.',
};

/**
 * Starter drafts for the static pages requested in CP-3.3. Every body is a
 * `TODO(client)` placeholder: no story, warranty term or legal wording is
 * invented here. The legal pages stay drafts until a Super Admin publishes
 * them after a lawyer's review (docs/CONTENT.md §7.7).
 */
export const starterPages = [
  {
    title: 'About Us',
    slug: 'about-us',
    template: 'standard' as const,
    layout: [
      {
        blockType: 'textBlocks',
        headline: 'About Us',
        paragraphs: [{ paragraph: 'TODO(client): add the company story, team and proof points.' }],
      },
    ],
  },
  {
    title: 'Warranty',
    slug: 'warranty',
    template: 'standard' as const,
    layout: [
      {
        blockType: 'textBlocks',
        headline: 'Warranty',
        paragraphs: [
          {
            paragraph:
              'TODO(client): add the warranty terms and their coverage (open question Q5).',
          },
        ],
      },
    ],
  },
  {
    title: 'Terms and Conditions',
    slug: 'terms-and-conditions',
    template: 'legal' as const,
    isLegal: true,
    layout: [
      {
        blockType: 'textBlocks',
        headline: 'Terms and Conditions',
        paragraphs: [
          {
            paragraph: 'TODO(client): lawyer review — replace with the final terms and conditions.',
          },
        ],
      },
    ],
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    template: 'legal' as const,
    isLegal: true,
    layout: [
      {
        blockType: 'textBlocks',
        headline: 'Privacy Policy',
        paragraphs: [
          { paragraph: 'TODO(client): lawyer review — replace with the final privacy policy.' },
        ],
      },
    ],
  },
] satisfies Array<{
  title: string;
  slug: string;
  template: Page['template'];
  isLegal?: boolean;
  layout: NonNullable<Page['layout']>;
}>;

export const samplePages = [
  {
    title: `Sample Content Page ${sampleMarker}`,
    slug: 'sample-content',
    template: 'standard' as const,
    layout: [
      {
        blockType: 'hero',
        eyebrow: 'Sample content',
        headline: `Sample headline ${sampleMarker}`,
        subheadline: 'Replace this illustrative copy with client-approved information.',
        primaryAction: { label: 'Sample link', kind: 'link', href: '/sample-destination' },
      },
      {
        blockType: 'textBlocks',
        headline: `Sample section ${sampleMarker}`,
        paragraphs: [{ paragraph: 'Sample-only layout copy. No business claims are made.' }],
      },
    ] satisfies NonNullable<Page['layout']>,
    seo: {
      metaTitle: `Sample ${sampleMarker}`,
      metaDescription: 'Sample-only page. Replace this text before publishing.',
    },
  },
];
