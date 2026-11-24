import { getPayload } from 'payload';

import config from '@payload-config';
import type { Page } from '@/payload-types';

/**
 * Published-page reads for the public catch-all route (CP-3.2).
 *
 * Drafts, scheduled versions and trashed pages never resolve here: Payload's
 * `_status` filter plus the collection's `readPublished` access rule both
 * exclude them, so an unpublished URL returns 404 even if a stale route exists.
 */

/** Look up a published page by its computed path (`home` is the root page). */
export async function findPublishedPage(path: string): Promise<Page | null> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      and: [{ path: { equals: path } }, { _status: { equals: 'published' } }],
    },
    depth: 2,
    limit: 1,
    pagination: false,
    overrideAccess: false,
  });

  return docs[0] ?? null;
}

/** Paths of every published page, for `generateStaticParams`. */
export async function listPublishedPagePaths(): Promise<string[]> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'pages',
    where: { _status: { equals: 'published' } },
    depth: 0,
    limit: 1000,
    pagination: false,
    overrideAccess: false,
  });

  return docs.flatMap((page) => (typeof page.path === 'string' && page.path ? [page.path] : []));
}
