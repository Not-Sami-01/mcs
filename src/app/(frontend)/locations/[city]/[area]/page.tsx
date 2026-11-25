import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getCachedArea, getCachedPublishedAreaParams, getCachedSiteChrome } from '@/cms/cache';
import { LocationView } from '@/components/locations/LocationView';
import { messages } from '@/messages';

type RouteParams = { city: string; area: string };

export const revalidate = 300;

export async function generateStaticParams(): Promise<RouteParams[]> {
  return getCachedPublishedAreaParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { city, area } = await params;
  const found = await getCachedArea(city, area);
  if (!found) return { title: messages.locationsPage.notFoundTitle };

  const chrome = await getCachedSiteChrome();
  const title = found.area.seo?.metaTitle?.trim() || `${found.area.name}, ${found.city.name}`;

  return {
    title: title === chrome.companyName ? title : `${title} | ${chrome.companyName}`,
    description: found.area.seo?.metaDescription?.trim() || found.area.intro?.trim() || undefined,
  };
}

/** Area page: `/locations/[city]/[area]` (docs/CONTENT.md §3). */
export default async function AreaPage({ params }: { params: Promise<RouteParams> }) {
  const { city, area } = await params;
  const found = await getCachedArea(city, area);
  if (!found) notFound();

  return (
    <LocationView location={found.area} city={found.city} chrome={await getCachedSiteChrome()} />
  );
}
