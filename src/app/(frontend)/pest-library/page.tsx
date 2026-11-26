import type { Metadata } from 'next';

import { getCachedPublishedPosts, getCachedSiteChrome } from '@/cms/cache';
import { PestLibrary } from '@/components/posts/PestLibrary';
import { messages } from '@/messages';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const chrome = await getCachedSiteChrome();

  return {
    title: `${messages.postsPage.indexTitle} | ${chrome.companyName}`,
    description: messages.postsPage.indexIntro,
  };
}

/** Pest Library index (CP-5.5). */
export default async function PestLibraryPage() {
  const posts = await getCachedPublishedPosts();

  return <PestLibrary posts={posts} />;
}
