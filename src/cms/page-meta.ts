import type { Metadata } from 'next';

import type { Page } from '@/payload-types';

import type { SiteChrome } from './site-chrome';

/**
 * Metadata shared by the home route and the catch-all (CP-3.3). The page's
 * SEO title wins; otherwise the page title is suffixed with the company name
 * unless it already is the company name.
 */
export function buildPageMetadata(page: Page, chrome: SiteChrome): Metadata {
  const title = page.seo?.metaTitle?.trim() || page.title;

  return {
    title: title === chrome.companyName ? title : `${title} | ${chrome.companyName}`,
    description: page.seo?.metaDescription?.trim() || undefined,
    ...(page.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
