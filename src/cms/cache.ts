import { unstable_cache } from 'next/cache';

import {
  CACHE_SECONDS,
  LOCATIONS_TAG,
  PAGES_TAG,
  POSTS_TAG,
  PRODUCTS_TAG,
  SERVICES_TAG,
  SITE_CHROME_TAG,
} from './cache-tags';
import {
  findPublishedArea,
  findPublishedCityBySlug,
  listPublishedAreaParams,
  listPublishedAreasInCity,
  listPublishedCities,
  listPublishedCitySlugs,
} from './locations';
import { findPublishedPage, listPublishedPagePaths } from './pages';
import { findPublishedPostBySlug, listPublishedPostSlugs, listPublishedPosts } from './posts';
import {
  findPublishedProductBySlug,
  listPublishedProductSlugs,
  listPublishedProducts,
} from './products';
import {
  findPublishedServiceBySlug,
  listPublishedServiceSlugs,
  listPublishedServices,
} from './services';
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

export const getCachedPublishedServices = unstable_cache(
  listPublishedServices,
  ['published-services'],
  { tags: [SERVICES_TAG], revalidate: CACHE_SECONDS },
);

export const getCachedServiceBySlug = unstable_cache(
  findPublishedServiceBySlug,
  ['published-service'],
  { tags: [SERVICES_TAG], revalidate: CACHE_SECONDS },
);

export const getCachedPublishedServiceSlugs = unstable_cache(
  listPublishedServiceSlugs,
  ['published-service-slugs'],
  { tags: [SERVICES_TAG], revalidate: CACHE_SECONDS },
);

export const getCachedPublishedCities = unstable_cache(listPublishedCities, ['published-cities'], {
  tags: [LOCATIONS_TAG],
  revalidate: CACHE_SECONDS,
});

export const getCachedCityBySlug = unstable_cache(findPublishedCityBySlug, ['published-city'], {
  tags: [LOCATIONS_TAG],
  revalidate: CACHE_SECONDS,
});

export const getCachedPublishedAreasInCity = unstable_cache(
  listPublishedAreasInCity,
  ['published-areas-in-city'],
  { tags: [LOCATIONS_TAG], revalidate: CACHE_SECONDS },
);

export const getCachedArea = unstable_cache(findPublishedArea, ['published-area'], {
  tags: [LOCATIONS_TAG],
  revalidate: CACHE_SECONDS,
});

export const getCachedPublishedCitySlugs = unstable_cache(
  listPublishedCitySlugs,
  ['published-city-slugs'],
  { tags: [LOCATIONS_TAG], revalidate: CACHE_SECONDS },
);

export const getCachedPublishedAreaParams = unstable_cache(
  listPublishedAreaParams,
  ['published-area-params'],
  { tags: [LOCATIONS_TAG], revalidate: CACHE_SECONDS },
);

export const getCachedPublishedProducts = unstable_cache(
  listPublishedProducts,
  ['published-products'],
  { tags: [PRODUCTS_TAG], revalidate: CACHE_SECONDS },
);

export const getCachedProductBySlug = unstable_cache(
  findPublishedProductBySlug,
  ['published-product'],
  { tags: [PRODUCTS_TAG], revalidate: CACHE_SECONDS },
);

export const getCachedPublishedProductSlugs = unstable_cache(
  listPublishedProductSlugs,
  ['published-product-slugs'],
  { tags: [PRODUCTS_TAG], revalidate: CACHE_SECONDS },
);

export const getCachedPublishedPosts = unstable_cache(listPublishedPosts, ['published-posts'], {
  tags: [POSTS_TAG],
  revalidate: CACHE_SECONDS,
});

export const getCachedPostBySlug = unstable_cache(findPublishedPostBySlug, ['published-post'], {
  tags: [POSTS_TAG],
  revalidate: CACHE_SECONDS,
});

export const getCachedPublishedPostSlugs = unstable_cache(
  listPublishedPostSlugs,
  ['published-post-slugs'],
  { tags: [POSTS_TAG], revalidate: CACHE_SECONDS },
);

export const getCachedSiteChrome = unstable_cache(loadSiteChrome, ['site-chrome'], {
  tags: [SITE_CHROME_TAG],
  revalidate: CACHE_SECONDS,
});
