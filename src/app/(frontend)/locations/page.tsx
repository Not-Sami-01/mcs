import { ArrowUpRight } from 'lucide-react';
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
        <h1 className="text-[2.4rem] leading-[1.1] text-ink md:text-5xl">
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
                className="group flex h-full flex-col justify-between gap-6 rounded-card border border-line bg-surface p-6 text-ink transition-colors hover:border-brand-primary"
              >
                <div>
                  <h2 className="content-text text-xl font-medium">{city.name}</h2>
                  {city.intro ? (
                    <p className="content-text mt-2 text-sm leading-relaxed text-ink-muted">
                      {city.intro}
                    </p>
                  ) : null}
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary">
                  {messages.blocks.learnMore}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={1.5}
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
