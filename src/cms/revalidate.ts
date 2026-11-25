import { LOCATIONS_TAG, PAGES_TAG, SERVICES_TAG, SITE_CHROME_TAG } from './cache-tags';

/**
 * Invalidate the public caches from Payload hooks.
 *
 * `next/cache` is imported lazily: the same Payload config is loaded by
 * `payload migrate`, seeds and tests, where the Next cache runtime is absent.
 * Revalidation is best-effort — a content save must never fail because a cache
 * could not be cleared (the 5-minute backstop still applies).
 */
export async function revalidatePages(): Promise<void> {
  try {
    const { revalidateTag } = await import('next/cache');
    revalidateTag(PAGES_TAG, 'max');
  } catch {
    // Outside a Next request (CLI/tests) there is nothing to invalidate.
  }
}

export async function revalidateServices(): Promise<void> {
  try {
    const { revalidateTag } = await import('next/cache');
    revalidateTag(SERVICES_TAG, 'max');
  } catch {
    // Outside a Next request (CLI/tests) there is nothing to invalidate.
  }
}

export async function revalidateLocations(): Promise<void> {
  try {
    const { revalidateTag } = await import('next/cache');
    revalidateTag(LOCATIONS_TAG, 'max');
  } catch {
    // Outside a Next request (CLI/tests) there is nothing to invalidate.
  }
}

export async function revalidateSiteChrome(): Promise<void> {
  try {
    const { revalidateTag } = await import('next/cache');
    revalidateTag(SITE_CHROME_TAG, 'max');
  } catch {
    // Outside a Next request (CLI/tests) there is nothing to invalidate.
  }
}
