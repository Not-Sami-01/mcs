import { getPayload } from 'payload';

import config from '@payload-config';
import type { Service } from '@/payload-types';

/**
 * Published-service reads for the public site (CP-5.1).
 *
 * Drafts, trashed and scheduled-but-not-yet-live services stay out: the
 * `_status` filter and the collection's `readPublished` access rule both
 * exclude them, mirroring `src/cms/pages.ts`.
 */

const PUBLIC_QUERY = {
  overrideAccess: false,
  where: { _status: { equals: 'published' as const } },
};

/** Every published service, ordered the way the grid wants them. */
export async function listPublishedServices(): Promise<Service[]> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'services',
    where: PUBLIC_QUERY.where,
    sort: ['order', 'title'],
    depth: 1,
    limit: 200,
    pagination: false,
    overrideAccess: false,
  });

  return docs;
}

/** One published service by slug, with media populated. */
export async function findPublishedServiceBySlug(slug: string): Promise<Service | null> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'services',
    where: { and: [PUBLIC_QUERY.where, { slug: { equals: slug } }] },
    depth: 2,
    limit: 1,
    pagination: false,
    overrideAccess: false,
  });

  return docs[0] ?? null;
}

/** Slugs of every published service, for `generateStaticParams`. */
export async function listPublishedServiceSlugs(): Promise<string[]> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'services',
    where: PUBLIC_QUERY.where,
    depth: 0,
    limit: 1000,
    pagination: false,
    overrideAccess: false,
  });

  return docs.flatMap((service) =>
    typeof service.slug === 'string' && service.slug ? [service.slug] : [],
  );
}
