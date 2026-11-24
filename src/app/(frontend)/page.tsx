import type { Metadata } from 'next';

import { getCachedPageByPath, getCachedSiteChrome } from '@/cms/cache';
import { buildPageMetadata } from '@/cms/page-meta';
import { HOME_PATH } from '@/cms/pages';
import { PageView } from '@/components/PageView';
import { messages } from '@/messages';

export const revalidate = 300;

/**
 * The root URL is the `pages` document with slug `home` (CP-3.3). It is served
 * here rather than by the catch-all so `/` and `/home` never duplicate.
 *
 * Until that page is published the site shows a neutral holding message and
 * asks search engines not to index it. No content is invented in code.
 */
export async function generateMetadata(): Promise<Metadata> {
  const page = await getCachedPageByPath(HOME_PATH);
  if (!page) {
    return { title: messages.homePending.title, robots: { index: false, follow: false } };
  }

  return buildPageMetadata(page, await getCachedSiteChrome());
}

export default async function HomePage() {
  const page = await getCachedPageByPath(HOME_PATH);

  if (!page) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-4 px-4 py-16 md:py-24">
        <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          {messages.homePending.title}
        </h1>
        <p className="text-ink-muted">{messages.homePending.body}</p>
      </div>
    );
  }

  return <PageView page={page} chrome={await getCachedSiteChrome()} />;
}
