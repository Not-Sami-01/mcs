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
      <div className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.14em] text-brand-primary uppercase">
          Coverage
        </p>
        <h1 className="mt-4 text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-ink md:text-5xl">
          {messages.locationsPage.indexTitle}
        </h1>
        <p className="content-text mt-5 text-base leading-relaxed text-ink-muted md:text-lg">
          {messages.locationsPage.indexIntro}
        </p>
      </div>

      {cities.length === 0 ? (
        <p className="mt-10 text-ink-muted">{messages.locationsPage.indexEmpty}</p>
      ) : (
        <ul role="list" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <li key={city.id} className="h-full">
              <Link
                href={`/locations/${city.slug}`}
                className="group flex h-full flex-col justify-between gap-6 rounded-[1.25rem] border border-line bg-surface p-6 text-ink transition duration-200 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-[var(--shadow-lift)] focus-visible:outline-brand-primary"
              >
                <div>
                  <h2 className="content-text text-xl font-semibold">{city.name}</h2>
                  {city.intro ? (
                    <p className="content-text mt-2 text-sm leading-relaxed text-ink-muted">
                      {city.intro}
                    </p>
                  ) : null}
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">
                  {messages.blocks.learnMore}
                  <span aria-hidden="true" className="transition group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
