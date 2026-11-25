import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  getCachedProductBySlug,
  getCachedPublishedProductSlugs,
  getCachedSiteChrome,
} from '@/cms/cache';
import { ProductView } from '@/components/products/ProductView';
import { messages } from '@/messages';

type RouteParams = { slug: string };

export const revalidate = 300;

export async function generateStaticParams(): Promise<RouteParams[]> {
  const slugs = await getCachedPublishedProductSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const product = await getCachedProductBySlug((await params).slug);
  if (!product) return { title: messages.productsPage.notFoundTitle };

  const chrome = await getCachedSiteChrome();
  const title = product.seo?.metaTitle?.trim() || product.title;
  const description =
    product.seo?.metaDescription?.trim() || product.description?.[0]?.body || undefined;

  return {
    title: title === chrome.companyName ? title : `${title} | ${chrome.companyName}`,
    description,
  };
}

/** Product detail route (docs/CONTENT.md §3, §7.3). */
export default async function ProductPage({ params }: { params: Promise<RouteParams> }) {
  const product = await getCachedProductBySlug((await params).slug);
  if (!product) notFound();

  return <ProductView product={product} chrome={await getCachedSiteChrome()} />;
}
