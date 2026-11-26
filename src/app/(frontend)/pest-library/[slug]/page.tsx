import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getCachedPostBySlug, getCachedPublishedPostSlugs, getCachedSiteChrome } from '@/cms/cache';
import { PostView } from '@/components/posts/PostView';
import { messages } from '@/messages';

type RouteParams = { slug: string };

export const revalidate = 300;

export async function generateStaticParams(): Promise<RouteParams[]> {
  const slugs = await getCachedPublishedPostSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const post = await getCachedPostBySlug((await params).slug);
  if (!post) return { title: messages.postsPage.notFoundTitle };

  const chrome = await getCachedSiteChrome();
  const title = post.seo?.metaTitle?.trim() || post.title;

  return {
    title: title === chrome.companyName ? title : `${title} | ${chrome.companyName}`,
    description: post.seo?.metaDescription?.trim() || post.excerpt || undefined,
  };
}

/** Pest Library article route (CP-5.5). */
export default async function PostPage({ params }: { params: Promise<RouteParams> }) {
  const post = await getCachedPostBySlug((await params).slug);
  if (!post) notFound();

  return <PostView post={post} chrome={await getCachedSiteChrome()} />;
}
