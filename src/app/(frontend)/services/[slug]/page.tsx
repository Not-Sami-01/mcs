import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  getCachedPublishedServiceSlugs,
  getCachedServiceBySlug,
  getCachedSiteChrome,
} from '@/cms/cache';
import { ServiceView } from '@/components/services/ServiceView';
import { messages } from '@/messages';

type RouteParams = { slug: string };

export const revalidate = 300;

export async function generateStaticParams(): Promise<RouteParams[]> {
  const slugs = await getCachedPublishedServiceSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const service = await getCachedServiceBySlug((await params).slug);
  if (!service) return { title: messages.servicesPage.notFoundTitle };

  const chrome = await getCachedSiteChrome();
  const title = service.seo?.metaTitle?.trim() || service.title;

  return {
    title: title === chrome.companyName ? title : `${title} | ${chrome.companyName}`,
    description: service.seo?.metaDescription?.trim() || service.shortDescription || undefined,
  };
}

/** Service detail route (docs/CONTENT.md §3, §7.2). */
export default async function ServicePage({ params }: { params: Promise<RouteParams> }) {
  const service = await getCachedServiceBySlug((await params).slug);
  if (!service) notFound();

  return <ServiceView service={service} chrome={await getCachedSiteChrome()} />;
}
