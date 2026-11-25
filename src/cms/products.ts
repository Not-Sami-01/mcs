import { getPayload } from 'payload';

import config from '@payload-config';
import type { Product } from '@/payload-types';

/**
 * Published-product reads for the public site (CP-5.3).
 *
 * Drafts, trashed and scheduled-but-not-yet-live products stay out through the
 * `_status` filter and the collection's `readPublished` access rule, mirroring
 * the service and location queries.
 */

const PUBLIC_WHERE = { _status: { equals: 'published' as const } };

/** Every published product, newest first. */
export async function listPublishedProducts(): Promise<Product[]> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'products',
    where: PUBLIC_WHERE,
    sort: ['-createdAt'],
    depth: 1,
    limit: 200,
    pagination: false,
    overrideAccess: false,
  });

  return docs;
}

/** One published product by slug, with images and documents populated. */
export async function findPublishedProductBySlug(slug: string): Promise<Product | null> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'products',
    where: { and: [PUBLIC_WHERE, { slug: { equals: slug } }] },
    depth: 2,
    limit: 1,
    pagination: false,
    overrideAccess: false,
  });

  return docs[0] ?? null;
}

/** Slugs of every published product, for `generateStaticParams`. */
export async function listPublishedProductSlugs(): Promise<string[]> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'products',
    where: PUBLIC_WHERE,
    depth: 0,
    limit: 1000,
    pagination: false,
    overrideAccess: false,
  });

  return docs.flatMap((product) =>
    typeof product.slug === 'string' && product.slug ? [product.slug] : [],
  );
}
