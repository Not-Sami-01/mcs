import { getPayload } from 'payload';

import config from '@payload-config';
import type { Location } from '@/payload-types';

/**
 * Published-location reads for the public site (CP-5.2).
 *
 * Drafts, trashed and scheduled-but-not-yet-live locations stay out: the
 * `_status` filter and the collection's `readPublished` access rule both
 * exclude them, mirroring `src/cms/services.ts`.
 */

const PUBLISHED = { _status: { equals: 'published' as const } };

/** Every published city, alphabetically. */
export async function listPublishedCities(): Promise<Location[]> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'locations',
    where: { and: [PUBLISHED, { type: { equals: 'city' } }] },
    sort: 'name',
    depth: 0,
    limit: 200,
    pagination: false,
    overrideAccess: false,
  });

  return docs;
}

/** One published city by slug. */
export async function findPublishedCityBySlug(slug: string): Promise<Location | null> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'locations',
    where: {
      and: [PUBLISHED, { type: { equals: 'city' } }, { slug: { equals: slug } }],
    },
    depth: 1,
    limit: 1,
    pagination: false,
    overrideAccess: false,
  });

  return docs[0] ?? null;
}

/** Published areas inside one city, alphabetically. */
export async function listPublishedAreasInCity(cityId: string | number): Promise<Location[]> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'locations',
    where: {
      and: [PUBLISHED, { type: { equals: 'area' } }, { parent: { equals: cityId } }],
    },
    sort: 'name',
    depth: 0,
    limit: 400,
    pagination: false,
    overrideAccess: false,
  });

  return docs;
}

/**
 * One published area by city and area slug. Scoped by the parent city, so an
 * area slug never resolves under the wrong city.
 */
export async function findPublishedArea(
  citySlug: string,
  areaSlug: string,
): Promise<{ city: Location; area: Location } | null> {
  const city = await findPublishedCityBySlug(citySlug);
  if (!city) return null;

  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'locations',
    where: {
      and: [
        PUBLISHED,
        { type: { equals: 'area' } },
        { slug: { equals: areaSlug } },
        { parent: { equals: city.id } },
      ],
    },
    depth: 2,
    limit: 1,
    pagination: false,
    overrideAccess: false,
  });

  const area = docs[0];
  if (!area) return null;

  return { city, area };
}

/** Slugs of every published city, for `generateStaticParams`. */
export async function listPublishedCitySlugs(): Promise<string[]> {
  const cities = await listPublishedCities();

  return cities.flatMap((city) => (typeof city.slug === 'string' && city.slug ? [city.slug] : []));
}

/** City/area slug pairs of every published area, for nested static params. */
export async function listPublishedAreaParams(): Promise<{ city: string; area: string }[]> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'locations',
    where: { and: [PUBLISHED, { type: { equals: 'area' } }] },
    depth: 1,
    limit: 1000,
    pagination: false,
    overrideAccess: false,
  });

  return docs.flatMap((area) => {
    const parent = typeof area.parent === 'object' && area.parent !== null ? area.parent : null;
    const citySlug = typeof parent?.slug === 'string' ? parent.slug : '';
    const areaSlug = typeof area.slug === 'string' ? area.slug : '';

    return citySlug && areaSlug ? [{ city: citySlug, area: areaSlug }] : [];
  });
}
