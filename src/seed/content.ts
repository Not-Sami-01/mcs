import type { Page } from '../payload-types';

export const sampleMarker = '[SAMPLE — replace before launch]';

export const sampleCategory = {
  title: `Sample Pages ${sampleMarker}`,
  slug: 'sample-pages',
  kind: 'general' as const,
  intro: 'Sample-only category. Replace or delete before launch.',
};

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
