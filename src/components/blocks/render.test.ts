import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { SiteChrome } from '@/cms/site-chrome';

import { BlockRenderer } from './index';
import type { PageBlock } from './types';

const media = {
  id: 1,
  alt: 'Technician treating a wall',
  url: '/api/media/file/before.webp',
  width: 800,
  height: 600,
  sizes: {
    thumb: { url: '/api/media/file/before-400.webp', width: 400 },
    card: { url: '/api/media/file/before-800.webp', width: 800 },
    hero: { url: '/api/media/file/before-1600.webp', width: 1600 },
  },
};

const chrome = {
  companyName: 'Malaysian Care System',
  siteUrl: 'http://localhost:3000',
  navItems: [],
  footerColumns: [],
  legalLinks: [],
  phone: { href: 'tel:+923001234567', display: '+92 300 123 4567' },
  whatsapp: { href: 'https://wa.me/923001234567' },
  whatsappNumber: '923001234567',
  email: null,
  address: null,
  hours: null,
} satisfies SiteChrome;

const blocks = [
  {
    blockType: 'hero',
    id: 'hero',
    eyebrow: 'Pest control',
    headline: 'Hero headline',
    subheadline: 'Hero supporting line',
    primaryAction: { label: 'Get a quote', kind: 'inspection', href: '/free-inspection' },
    secondaryActions: [{ label: 'Call us', kind: 'call', href: 'ignored' }],
    image: media,
  },
  {
    blockType: 'trustStrip',
    id: 'trust',
    items: [
      { statValue: '15+', statLabel: 'Years', proofNote: 'SECRET-PROOF' },
      { statValue: '4.8', statLabel: 'Rating', proofNote: 'SECRET-PROOF' },
      { statValue: '2k', statLabel: 'Jobs', proofNote: 'SECRET-PROOF' },
    ],
  },
  {
    blockType: 'whyChoose',
    id: 'why',
    headline: 'Why choose us',
    items: [{ icon: 'shield', cardTitle: 'Trained team', cardBody: 'Uniformed technicians.' }],
  },
  {
    blockType: 'ourDifference',
    id: 'difference',
    headline: 'Our difference',
    shortParagraph: 'A different approach.',
    points: [{ point: 'Written reports' }],
    proofNote: 'SECRET-PROOF',
  },
  {
    blockType: 'howItWorks',
    id: 'how',
    headline: 'How it works',
    steps: [{ cardTitle: 'Inspect', cardBody: 'We inspect.' }],
  },
  {
    blockType: 'warrantyPromise',
    id: 'warranty',
    headline: 'Warranty promise',
    shortParagraph: 'Terms apply.',
    highlights: [{ highlight: 'Free re-treatment' }],
    link: { label: 'Read warranty', kind: 'link', href: '/warranty' },
  },
  {
    blockType: 'whoWeServe',
    id: 'who',
    headline: 'Who we serve',
    items: [
      {
        title: 'Restaurants',
        cardBody: 'Kitchen-safe treatments.',
        link: { label: 'Learn more', kind: 'link', href: '/industries/restaurants' },
      },
    ],
  },
  {
    blockType: 'beforeAfter',
    id: 'before-after',
    headline: 'Before and after',
    pairs: [
      {
        before: media,
        after: media,
        caption: 'Kitchen treatment',
        area: 'Gulberg',
        consentConfirmed: true,
      },
      {
        before: media,
        after: media,
        caption: 'NO-CONSENT-CAPTION',
        area: 'Model Town',
        consentConfirmed: false,
      },
    ],
  },
  {
    blockType: 'certificates',
    id: 'certificates',
    headline: 'Certificates',
    items: [{ image: media, title: 'Licence', issuer: 'Punjab authority' }],
  },
  {
    blockType: 'inspectionForm',
    id: 'inspection',
    headline: 'Book an inspection',
    shortParagraph: 'Tell us what you need.',
  },
  {
    blockType: 'faq',
    id: 'faq',
    headline: 'Questions',
    items: [{ question: 'Is it safe?', answer: 'Yes, when applied as directed.' }],
  },
  {
    blockType: 'cta',
    id: 'cta',
    headline: 'Ready to start?',
    cardBody: 'Book today.',
    buttons: [
      { label: 'Book now', kind: 'link', href: '/free-inspection' },
      { label: 'Bad link', kind: 'link', href: 'javascript:alert(1)' },
    ],
  },
  {
    blockType: 'textBlocks',
    id: 'text',
    headline: 'More information',
    paragraphs: [{ paragraph: 'One paragraph.' }],
  },
  { blockType: 'contactDetails', id: 'contact', headline: 'Contact us' },
] as unknown as PageBlock[];

describe('BlockRenderer', () => {
  it('renders every implemented block type without throwing', () => {
    const html = renderToStaticMarkup(createElement(BlockRenderer, { blocks, chrome }));

    for (const heading of [
      'Hero headline',
      'Why choose us',
      'Our difference',
      'How it works',
      'Warranty promise',
      'Who we serve',
      'Before and after',
      'Certificates',
      'Book an inspection',
      'Questions',
      'Ready to start?',
      'More information',
      'Contact us',
    ]) {
      expect(html).toContain(heading);
    }
  });

  it('renders a single H1 from the hero and never leaks internal notes', () => {
    const html = renderToStaticMarkup(createElement(BlockRenderer, { blocks, chrome }));

    expect((html.match(/<h1/g) ?? []).length).toBe(1);
    expect(html).not.toContain('SECRET-PROOF');
    // Consent is required before a pair may appear.
    expect(html).not.toContain('NO-CONSENT-CAPTION');
  });

  it('drops unsafe links and keeps saved contact actions', () => {
    const html = renderToStaticMarkup(createElement(BlockRenderer, { blocks, chrome }));

    expect(html).not.toContain('javascript:');
    expect(html).toContain('tel:+923001234567');
    expect(html).toContain('Read warranty');
  });

  it('hides call actions and shows the honest empty state when contacts are unset', () => {
    const empty = {
      ...chrome,
      phone: null,
      whatsapp: null,
    };
    const html = renderToStaticMarkup(createElement(BlockRenderer, { blocks, chrome: empty }));

    expect(html).not.toContain('tel:');
    expect(html).not.toContain('Call us');
    expect(html).toContain('Contact details are not published yet.');
  });
});
