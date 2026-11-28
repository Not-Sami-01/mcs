import Link from 'next/link';

import type { SiteChrome } from '@/cms/site-chrome';
import { messages } from '@/messages';
import type { Location, Service } from '@/payload-types';

import { BlockAction, resolveAction } from '../blocks/BlockAction';
import { Faq } from '../blocks/Faq';
import { Section, SectionHeading } from '../blocks/Section';
import { ServiceCard } from '../services/ServiceCard';

function areaHref(citySlug: string, area: Location): string {
  return `/locations/${citySlug}/${area.slug}`;
}

/** Services listed on a location come from the relation; unpublished ids are dropped. */
function publishedServices(services: Location['servicesAvailable']): Service[] {
  return (services ?? []).flatMap((entry) =>
    typeof entry === 'object' && entry !== null && 'title' in entry ? [entry as Service] : [],
  );
}

/**
 * City or area page (docs/CONTENT.md §7.4). One H1, the intro and unique local
 * notes, neighbourhoods, common pests, services available there, local FAQs and
 * a booking CTA. A city page also lists its published areas. Nothing is
 * invented: a missing list renders no section at all.
 */
export function LocationView({
  location,
  city,
  areas = [],
  chrome,
}: {
  location: Location;
  /** For an area page: its city, used for breadcrumb-style links. */
  city?: Location;
  /** For a city page: the published areas inside it. */
  areas?: Location[];
  chrome: SiteChrome;
}) {
  const inspection = resolveAction(
    { label: messages.blocks.startInspection, kind: 'inspection', href: '/free-inspection' },
    chrome,
  );
  const call = resolveAction({ label: messages.cta.call, kind: 'call', href: '' }, chrome);
  const whatsapp = resolveAction(
    { label: messages.cta.whatsapp, kind: 'whatsapp', href: '' },
    chrome,
  );

  const citySlug = city?.slug ?? (location.type === 'city' ? location.slug : '');
  const neighbourhoods = location.neighbourhoods ?? [];
  const pests = location.commonPests ?? [];
  const services = publishedServices(location.servicesAvailable);
  const faqs = location.faqs ?? [];
  const nearby = (location.nearbyAreas ?? []).flatMap((entry) =>
    typeof entry === 'object' && entry !== null && 'slug' in entry ? [entry as Location] : [],
  );

  return (
    <>
      <Section>
        {city ? (
          <nav aria-label={messages.locationsPage.breadcrumb} className="mb-3 text-sm">
            <Link
              href={`/locations/${city.slug}`}
              className="text-brand-primary underline-offset-4 hover:underline"
            >
              {city.name}
            </Link>
            <span className="mx-2 text-ink-muted" aria-hidden="true">
              /
            </span>
            <span className="text-ink-muted">{location.name}</span>
          </nav>
        ) : null}

        <p className="text-xs font-medium text-ink-muted">
          {location.type === 'city' ? 'City coverage' : 'Local coverage'}
        </p>
        <h1 className="content-text mt-4 text-[2.4rem] leading-[1.1] text-ink md:text-5xl">
          Pest control in {location.name}
        </h1>
        {location.intro ? (
          <p className="content-text mt-4 max-w-3xl text-lg text-ink-muted">{location.intro}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <BlockAction action={inspection} variant="primary" />
          <BlockAction action={call} variant="outline" />
          <BlockAction action={whatsapp} variant="whatsapp" />
        </div>

        {location.localNotes ? (
          <div className="content-text mt-8 max-w-3xl whitespace-pre-line text-ink">
            {location.localNotes}
          </div>
        ) : null}
      </Section>

      {neighbourhoods.length > 0 ? (
        <Section tone="alt">
          <SectionHeading>{messages.locationsPage.neighbourhoods}</SectionHeading>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {neighbourhoods.map((item, index) => (
              <li
                key={item.id ?? `neighbourhood-${index}`}
                className="content-text rounded-card border border-line bg-surface p-4 text-sm"
              >
                {item.name}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {pests.length > 0 ? (
        <Section>
          <SectionHeading>{messages.locationsPage.commonPests}</SectionHeading>
          <ul className="mt-6 flex flex-wrap gap-2">
            {pests.map((item, index) => (
              <li
                key={item.id ?? `pest-${index}`}
                className="content-text rounded-input border border-line px-4 py-2 text-sm"
              >
                {item.pest}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {areas.length > 0 ? (
        <Section>
          <SectionHeading>{messages.locationsPage.areasInCity}</SectionHeading>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <li key={area.id} className="h-full">
                <Link
                  href={areaHref(String(citySlug), area)}
                  className="flex h-full flex-col gap-2 rounded-card border border-line bg-surface p-5 text-ink transition-colors hover:border-brand-primary focus-visible:outline-brand-primary"
                >
                  <span className="content-text text-lg font-medium">{area.name}</span>
                  {area.intro ? (
                    <span className="content-text text-sm text-ink-muted">{area.intro}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {services.length > 0 ? (
        <Section tone="alt">
          <SectionHeading>{messages.locationsPage.servicesAvailable}</SectionHeading>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </ul>
        </Section>
      ) : null}

      {faqs.length > 0 ? (
        <Faq
          block={{
            blockType: 'faq',
            headline: messages.locationsPage.faqs,
            items: faqs.map((faq) => ({ question: faq.question, answer: faq.answer })),
          }}
        />
      ) : null}

      {nearby.length > 0 ? (
        <Section>
          <SectionHeading>{messages.locationsPage.nearbyAreas}</SectionHeading>
          <ul className="mt-4 flex flex-wrap gap-2">
            {nearby.map((entry) => {
              const parent =
                typeof entry.parent === 'object' && entry.parent !== null ? entry.parent : null;
              const href =
                entry.type === 'area' && parent
                  ? areaHref(String(parent.slug), entry)
                  : `/locations/${entry.slug}`;

              return (
                <li key={entry.id}>
                  <Link
                    href={href}
                    className="inline-block rounded-input border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-brand-primary"
                  >
                    {entry.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null}

      <Section>
        <div className="relative overflow-hidden rounded-panel bg-brand-deep px-6 py-12 text-brand-primary-contrast md:px-14">
          <div className="max-w-2xl">
            <h2 className="content-text text-3xl font-medium md:text-4xl">
              {messages.locationsPage.ctaTitle.replace('{place}', location.name)}
            </h2>
            <p className="content-text mt-3 text-brand-primary-contrast/80">
              {messages.locationsPage.ctaBody}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <BlockAction action={inspection} variant="on-brand" />
              <BlockAction action={call} variant="on-brand-outline" />
              <BlockAction action={whatsapp} variant="on-brand-outline" />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
