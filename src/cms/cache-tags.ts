/**
 * Cache tag names shared by the Next data cache and Payload hooks.
 *
 * This module deliberately imports nothing: revalidation hooks are loaded by
 * the Payload config, and importing the cache layer here would create a cycle
 * (config → collection → hook → cache → query → config).
 */
export const PAGES_TAG = 'pages';
export const SITE_CHROME_TAG = 'site-chrome';
export const CACHE_SECONDS = 300;
