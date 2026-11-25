import type { Metadata } from 'next';
import Link from 'next/link';

import { getCachedPublishedCities, getCachedSiteChrome } from '@/cms/cache';
import { Section } from '@/components/blocks/Section';
import { messages } from '@/messages';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const chrome = await getCachedSiteChrome();

  return {
    title: `${messages.locationsPage.indexTitle} | ${chrome.companyName}`,
    description: messages.locationsPage.indexIntro,
  };
}

/** Locations index: every published city (CP-5.2). */
export default async function LocationsIndexPage() {
  const cities = await getCachedPublishedCities();

  return (
    <Section>
      <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
        {messages.locationsPage.indexTitle}
      </h1>
      <p className="content-text mt-4 max-w-3xl text-ink-muted">
        {messages.locationsPage.indexIntro}
      </p>

      {cities.length === 0 ? (
        <p className="mt-8 text-ink-muted">{messages.locationsPage.indexEmpty}</p>
      ) : (
        <ul role="list" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <li key={city.id} className="h-full">
              <Link
                href={`/locations/${city.slug}`}
                className="flex h-full flex-col justify-between gap-4 rounded-card border border-line bg-surface p-5 text-ink transition-colors hover:border-brand-primary focus-visible:outline-brand-primary"
              >
                <div>
                  <h2 className="content-text text-lg font-semibold">{city.name}</h2>
                  {city.intro ? (
                    <p className="content-text mt-2 text-sm text-ink-muted">{city.intro}</p>
                  ) : null}
                </div>
                <span className="text-sm font-semibold text-brand-primary">
                  {messages.blocks.learnMore}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
