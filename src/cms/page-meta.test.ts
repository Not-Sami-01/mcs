import { describe, expect, it } from 'vitest';

import type { Page } from '@/payload-types';

import { buildPageMetadata } from './page-meta';
import type { SiteChrome } from './site-chrome';

const chrome = { companyName: 'Malaysian Care System' } as SiteChrome;

function page(overrides: Partial<Page> = {}): Page {
  return {
    id: 1,
    title: 'About Us',
    slug: 'about-us',
    template: 'standard',
    ...overrides,
  } as Page;
}

describe('buildPageMetadata', () => {
  it('suffixes the page title with the company name', () => {
    expect(buildPageMetadata(page(), chrome).title).toBe('About Us | Malaysian Care System');
  });

  it('prefers the SEO title and description', () => {
    const meta = buildPageMetadata(
      page({ seo: { metaTitle: 'Custom title', metaDescription: 'Custom description' } }),
      chrome,
    );

    expect(meta.title).toBe('Custom title | Malaysian Care System');
    expect(meta.description).toBe('Custom description');
  });

  it('does not repeat the company name when it is already the title', () => {
    expect(buildPageMetadata(page({ title: 'Malaysian Care System' }), chrome).title).toBe(
      'Malaysian Care System',
    );
  });

  it('adds noindex directives only for noindex pages', () => {
    expect(buildPageMetadata(page(), chrome).robots).toBeUndefined();
    expect(buildPageMetadata(page({ noindex: true }), chrome).robots).toEqual({
      index: false,
      follow: false,
    });
  });
});
