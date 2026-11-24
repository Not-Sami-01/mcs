import { unstable_cache } from 'next/cache';

import { CACHE_SECONDS, PAGES_TAG, SITE_CHROME_TAG } from './cache-tags';
import { findPublishedPage, listPublishedPagePaths } from './pages';
import { loadSiteChrome } from './site-chrome';

/**
 * Tagged caches for the public site (CP-3.2).
 *
 * Payload's Local API reads do not go through `fetch`, so `unstable_cache`
 * gives them a Next data-cache entry that `revalidateTag` can invalidate. The
 * collection/global hooks call `revalidatePages()` / `revalidateSiteChrome()`
 * after a save, and the 5-minute window is only a backstop.
 */

export const getCachedPageByPath = unstable_cache(findPublishedPage, ['published-page'], {
  tags: [PAGES_TAG],
  revalidate: CACHE_SECONDS,
});

export const getCachedPublishedPagePaths = unstable_cache(
  listPublishedPagePaths,
  ['published-page-paths'],
  { tags: [PAGES_TAG], revalidate: CACHE_SECONDS },
);

export const getCachedSiteChrome = unstable_cache(loadSiteChrome, ['site-chrome'], {
  tags: [SITE_CHROME_TAG],
  revalidate: CACHE_SECONDS,
});
