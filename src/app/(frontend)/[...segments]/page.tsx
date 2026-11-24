import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getCachedPageByPath, getCachedPublishedPagePaths, getCachedSiteChrome } from '@/cms/cache';
import { HOME_PATH } from '@/cms/pages';
import { buildPageMetadata } from '@/cms/page-meta';
import { PageView } from '@/components/PageView';

type RouteParams = { segments: string[] };

export const revalidate = 300;

/**
 * Every non-root CMS page, including pages nested under category paths
 * (CP-3.2). The root `/` stays with the home route until CP-3.3 builds it from
 * blocks, so a page whose path is `home` is intentionally not served here.
 *
 * Static generation covers all published pages at build time; `dynamicParams`
 * stays on so a page published later is generated on first request, then
 * cached and revalidated by tag when it changes.
 */
export async function generateStaticParams(): Promise<RouteParams[]> {
  const paths = await getCachedPublishedPagePaths();

  return paths.filter((path) => path !== HOME_PATH).map((path) => ({ segments: path.split('/') }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const path = (await params).segments.join('/');
  const page = await getCachedPageByPath(path);
  if (!page) return {};

  return buildPageMetadata(page, await getCachedSiteChrome());
}

export default async function CmsPage({ params }: { params: Promise<RouteParams> }) {
  const path = (await params).segments.join('/');
  const page = await getCachedPageByPath(path);
  if (!page) notFound();

  return <PageView page={page} chrome={await getCachedSiteChrome()} />;
}
