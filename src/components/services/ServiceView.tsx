import type { SiteChrome } from '@/cms/site-chrome';
import { messages } from '@/messages';
import type { Service } from '@/payload-types';

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

  return (
    <>
      <Section>
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="content-text text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              {service.title}
            </h1>
            <p className="content-text mt-4 text-lg text-ink-muted">{service.shortDescription}</p>

            {price !== null ? (
              <p className="mt-4 text-base font-semibold text-brand-primary">
                {messages.servicesPage.fromPrice.replace('{price}', price.toLocaleString('en-US'))}
                {unit ? <span className="font-normal text-ink-muted"> · {unit}</span> : null}
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
              className="w-full rounded-card object-cover"
            />
          ) : null}
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
                <h3 className="content-text text-lg font-semibold text-ink">{step.title}</h3>
                <p className="content-text mt-2 text-sm text-ink-muted">{step.body}</p>
              </li>
            ))}
          </ol>
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
          <h2 className="content-text text-2xl font-semibold tracking-tight md:text-3xl">
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
