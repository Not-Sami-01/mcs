import { TEXT_LIMITS } from './limits';

/**
 * Slug rules (docs/CONTENT.md §3): lowercase ASCII with hyphens, unique within
 * the collection, and a short reserved list that would collide with framework
 * routes. Applied to `pages` and `categories` — both feed URLs.
 */
export const RESERVED_SLUGS = [
  'admin',
  'api',
  'edit',
  '_next',
  'sitemap.xml',
  'robots.txt',
  'favicon.ico',
] as const;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Normalise free-typed text into a slug shape: trim, lowercase, spaces and
 * disallowed characters to hyphens, collapse repeats, strip edge hyphens.
 */
export function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, TEXT_LIMITS.slug)
    .replace(/-+$/g, '');
}

/** Return an error message for a slug that must be rejected, or `null` when valid. */
export function slugError(input: string | undefined | null): string | null {
  if (!input || !input.trim()) return 'Slug is required.';
  const slug = input.trim();
  if ((RESERVED_SLUGS as readonly string[]).includes(slug.toLowerCase())) {
    return `"${slug.toLowerCase()}" is reserved and cannot be used as a slug.`;
  }
  if (!SLUG_PATTERN.test(slug)) {
    return 'Use lowercase letters, numbers and single hyphens only (no spaces, slashes or dots).';
  }
  if (slug.length > TEXT_LIMITS.slug) {
    return `Max ${TEXT_LIMITS.slug} characters.`;
  }
  return null;
}

/** Field `validate` wrapper for `slugField`. */
export function validateSlug(value: string | undefined): true | string {
  return slugError(value) ?? true;
}

/**
 * Join path segments into a URL path: trim slashes from each end, drop empty
 * segments, join with `/` (no leading or trailing slash).
 */
export function joinPath(...parts: (string | null | undefined)[]): string {
  return parts
    .map((part) => (part ?? '').trim().replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
}
