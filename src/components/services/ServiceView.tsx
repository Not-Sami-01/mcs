import Link from 'next/link';

import type { SiteChrome } from '@/cms/site-chrome';
import { messages } from '@/messages';
import type { Location, Product, Service } from '@/payload-types';

import { BlockAction, resolveAction } from '../blocks/BlockAction';
import { Faq } from '../blocks/Faq';
import { Section, SectionHeading } from '../blocks/Section';
import { SiteImage } from '../blocks/SiteImage';
import { BlockRenderer } from '../blocks';

/**
 * Service detail (docs/CONTENT.md §7.2): one H1, the short description, an
 * optional starting price, signs, treatment steps, FAQs and an enquiry CTA.
 * Prices appear only when staff have saved one, and the optional extra layout
 * never adds a second hero (see `SERVICE_BLOCKS`).
 */
export function ServiceView({ service, chrome }: { service: Service; chrome: SiteChrome }) {
  const price = typeof service.startingPrice === 'number' ? service.startingPrice : null;
  const unit = service.priceUnit?.trim();

  const inspection = resolveAction(
    { label: messages.blocks.startInspection, kind: 'inspection', href: '/free-inspection' },
    chrome,
  );
  const call = resolveAction({ label: messages.cta.call, kind: 'call', href: '' }, chrome);
  const whatsapp = resolveAction(
    { label: messages.cta.whatsapp, kind: 'whatsapp', href: '' },
    chrome,
  );
  const signs = service.signs ?? [];
  const steps = service.treatmentSteps ?? [];
  const faqs = service.faqs ?? [];
  const areas = (service.areasServed ?? []).flatMap((entry) =>
    typeof entry === 'object' && entry !== null && 'name' in entry ? [entry as Location] : [],
  );
  const productsUsed = (service.productsUsed ?? []).flatMap((entry) =>
    typeof entry === 'object' && entry !== null && 'title' in entry ? [entry as Product] : [],
  );

  return (
    <>
      <Section>
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-ink-muted">
              <span aria-hidden="true" className="h-2 w-2 bg-brand-accent" />
              Service
            </p>
            <h1 className="content-text mt-4 text-[2.4rem] leading-[1.1] text-ink md:text-5xl">
              {service.title}
            </h1>
            <p className="content-text mt-4 text-lg text-ink-muted">{service.shortDescription}</p>

            {price !== null ? (
              <p className="tabular mt-5 text-base text-brand-primary">
                {messages.servicesPage.fromPrice.replace('{price}', price.toLocaleString('en-US'))}
                {unit ? <span className="text-ink-muted"> · {unit}</span> : null}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <BlockAction action={inspection} variant="primary" />
              <BlockAction action={call} variant="outline" />
              <BlockAction action={whatsapp} variant="whatsapp" />
            </div>
          </div>

          {service.heroImage && typeof service.heroImage === 'object' ? (
            <SiteImage
              image={service.heroImage}
              priority
              sizes="(max-width: 767px) 100vw, 50vw"
              className="aspect-[4/3] w-full rounded-panel border border-line object-cover"
            />
          ) : (
            <div className="rounded-panel border border-line bg-surface p-6 md:p-8">
              <p className="text-sm font-medium text-ink">What the visit includes</p>
              <ul role="list" className="mt-5 space-y-3">
                {[
                  'Inspection and species check',
                  'Written plan and price',
                  'Treatment by a technician',
                  'Follow-up visit',
                ].map((item, index) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="tabular mt-0.5 grid h-5 w-5 shrink-0 place-items-center bg-surface-alt text-[11px] text-ink-muted"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm leading-relaxed text-ink">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {signs.length > 0 ? (
        <Section tone="alt">
          <SectionHeading>{messages.servicesPage.signs}</SectionHeading>
          <ul role="list" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {signs.map((item, index) => (
              <li
                key={item.id ?? `sign-${index}`}
                className="content-text rounded-card border border-line bg-surface p-4 text-sm text-ink"
              >
                {item.sign}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {steps.length > 0 ? (
        <Section>
          <SectionHeading>{messages.servicesPage.treatmentSteps}</SectionHeading>
          <ol className="mt-6 grid gap-6 md:grid-cols-2">
            {steps.map((step, index) => (
              <li key={step.id ?? `step-${index}`} className="rounded-card border border-line p-5">
                <h3 className="content-text text-lg font-medium text-ink">{step.title}</h3>
                <p className="content-text mt-2 text-sm text-ink-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {productsUsed.length > 0 ? (
        <Section tone="alt">
          <SectionHeading>{messages.servicesPage.productsUsed}</SectionHeading>
          <ul className="mt-4 flex flex-wrap gap-2">
            {productsUsed.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/products/${product.slug}`}
                  className="inline-block rounded-input border border-line bg-surface px-4 py-2 text-sm text-ink transition-colors hover:border-brand-primary"
                >
                  {product.title}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {areas.length > 0 ? (
        <Section tone="alt">
          <SectionHeading>{messages.servicesPage.areasServed}</SectionHeading>
          <ul className="mt-4 flex flex-wrap gap-2">
            {areas.map((area) => {
              const parent =
                typeof area.parent === 'object' && area.parent !== null ? area.parent : null;
              const href =
                area.type === 'area' && parent?.slug
                  ? `/locations/${parent.slug}/${area.slug}`
                  : `/locations/${area.slug}`;

              return (
                <li key={area.id}>
                  <Link
                    href={href}
                    className="inline-block rounded-input border border-line bg-surface px-4 py-2 text-sm text-ink transition-colors hover:border-brand-primary"
                  >
                    {area.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null}

      {faqs.length > 0 ? (
        <Faq
          block={{
            blockType: 'faq',
            headline: messages.servicesPage.faqs,
            items: faqs.map((faq) => ({ question: faq.question, answer: faq.answer })),
          }}
        />
      ) : null}

      {service.layout && service.layout.length > 0 ? (
        <BlockRenderer blocks={service.layout} chrome={chrome} />
      ) : null}

      <Section tone="brand">
        <div className="max-w-2xl">
          <h2 className="content-text text-2xl font-medium md:text-3xl">
            {messages.servicesPage.ctaTitle}
          </h2>
          <p className="content-text mt-3 text-brand-primary-contrast/90">
            {messages.servicesPage.ctaBody}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <BlockAction action={inspection} variant="on-brand" />
            <BlockAction action={call} variant="on-brand-outline" />
            <BlockAction action={whatsapp} variant="on-brand-outline" />
          </div>
        </div>
      </Section>
    </>
  );
}
