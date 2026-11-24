import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload';

import { revalidatePages, revalidateSiteChrome } from './revalidate';

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

export const revalidateChromeAfterChange: GlobalAfterChangeHook = async () => {
  await revalidateSiteChrome();
};
