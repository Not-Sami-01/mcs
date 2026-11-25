import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  getCachedCityBySlug,
  getCachedPublishedAreasInCity,
  getCachedPublishedCitySlugs,
  getCachedSiteChrome,
} from '@/cms/cache';
import { LocationView } from '@/components/locations/LocationView';
import { messages } from '@/messages';

type RouteParams = { city: string };

export const revalidate = 300;

export async function generateStaticParams(): Promise<RouteParams[]> {
  const slugs = await getCachedPublishedCitySlugs();

  return slugs.map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const city = await getCachedCityBySlug((await params).city);
  if (!city) return { title: messages.locationsPage.notFoundTitle };

  const chrome = await getCachedSiteChrome();
  const title = city.seo?.metaTitle?.trim() || city.name;

  return {
    title: title === chrome.companyName ? title : `${title} | ${chrome.companyName}`,
    description: city.seo?.metaDescription?.trim() || city.intro?.trim() || undefined,
  };
}

/** City page: unique local content plus the published areas inside it. */
export default async function CityPage({ params }: { params: Promise<RouteParams> }) {
  const city = await getCachedCityBySlug((await params).city);
  if (!city) notFound();

  const [areas, chrome] = await Promise.all([
    getCachedPublishedAreasInCity(city.id),
    getCachedSiteChrome(),
  ]);

  return <LocationView location={city} areas={areas} chrome={chrome} />;
}
