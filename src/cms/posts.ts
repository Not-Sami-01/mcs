import { getPayload } from 'payload';

import config from '@payload-config';
import type { Post } from '@/payload-types';

/**
 * Published Pest Library reads (CP-5.5).
 *
 * The `_status` filter and the collection's `readPublished` access rule keep
 * drafts and trashed articles out of the public list and detail pages.
 */

const PUBLIC_WHERE = { _status: { equals: 'published' as const } };

/** Every published article, newest first. */
export async function listPublishedPosts(): Promise<Post[]> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'posts',
    where: PUBLIC_WHERE,
    sort: ['-publishedAt', '-createdAt'],
    depth: 1,
    limit: 200,
    pagination: false,
    overrideAccess: false,
  });

  return docs;
}

/** One published article by slug, with services, locations and media populated. */
export async function findPublishedPostBySlug(slug: string): Promise<Post | null> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'posts',
    where: { and: [PUBLIC_WHERE, { slug: { equals: slug } }] },
    depth: 2,
    limit: 1,
    pagination: false,
    overrideAccess: false,
  });

  return docs[0] ?? null;
}

/** Slugs of every published article, for `generateStaticParams`. */
export async function listPublishedPostSlugs(): Promise<string[]> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'posts',
    where: PUBLIC_WHERE,
    depth: 0,
    limit: 1000,
    pagination: false,
    overrideAccess: false,
  });

  return docs.flatMap((post) => (typeof post.slug === 'string' && post.slug ? [post.slug] : []));
}
