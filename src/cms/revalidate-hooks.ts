import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload';

import {
  revalidateLocations,
  revalidatePages,
  revalidatePosts,
  revalidateProducts,
  revalidateServices,
  revalidateSiteChrome,
} from './revalidate';

/**
 * Cache-invalidation hooks (CP-3.2). Pages, categories and media all change
 * rendered page output, so they clear the `pages` tag; the navigation and
 * site-settings globals clear the `site-chrome` tag.
 */

export const revalidatePagesAfterChange: CollectionAfterChangeHook = async () => {
  await revalidatePages();
};

export const revalidatePagesAfterDelete: CollectionAfterDeleteHook = async () => {
  await revalidatePages();
};

/**
 * A service change affects its own pages **and** every page with a services
 * grid, so both tags are cleared.
 */
export const revalidateServicesAfterChange: CollectionAfterChangeHook = async () => {
  await revalidateServices();
  await revalidatePages();
};

export const revalidateServicesAfterDelete: CollectionAfterDeleteHook = async () => {
  await revalidateServices();
  await revalidatePages();
};

/**
 * A location change affects its own pages and every service page that lists
 * areas served, so the services tag is cleared too.
 */
export const revalidateLocationsAfterChange: CollectionAfterChangeHook = async () => {
  await revalidateLocations();
  await revalidateServices();
};

export const revalidateLocationsAfterDelete: CollectionAfterDeleteHook = async () => {
  await revalidateLocations();
  await revalidateServices();
};

/**
 * A product change affects its own page and every featured-products block, so
 * the pages tag is cleared too.
 */
export const revalidateProductsAfterChange: CollectionAfterChangeHook = async () => {
  await revalidateProducts();
  await revalidatePages();
};

export const revalidateProductsAfterDelete: CollectionAfterDeleteHook = async () => {
  await revalidateProducts();
  await revalidatePages();
};

/** A Pest Library change clears the Pest Library tag (index and article pages). */
export const revalidatePostsAfterChange: CollectionAfterChangeHook = async () => {
  await revalidatePosts();
};

export const revalidatePostsAfterDelete: CollectionAfterDeleteHook = async () => {
  await revalidatePosts();
};

export const revalidateChromeAfterChange: GlobalAfterChangeHook = async () => {
  await revalidateSiteChrome();
};
