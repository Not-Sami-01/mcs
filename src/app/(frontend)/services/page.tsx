import type { Metadata } from 'next';

import { getCachedPublishedServices, getCachedSiteChrome } from '@/cms/cache';
import { Section } from '@/components/blocks/Section';
import { ServiceCard } from '@/components/services/ServiceCard';
import { messages } from '@/messages';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const chrome = await getCachedSiteChrome();

  return {
    title: `${messages.servicesPage.indexTitle} | ${chrome.companyName}`,
    description: messages.servicesPage.indexIntro,
  };
}

/** Services index: every published service as a card (CP-5.1). */
export default async function ServicesIndexPage() {
  const services = await getCachedPublishedServices();

  return (
    <Section>
      <div className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.14em] text-brand-primary uppercase">
          Services
        </p>
        <h1 className="mt-4 text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-ink md:text-5xl">
          {messages.servicesPage.indexTitle}
        </h1>
        <p className="content-text mt-5 text-base leading-relaxed text-ink-muted md:text-lg">
          {messages.servicesPage.indexIntro}
        </p>
      </div>

      {services.length === 0 ? (
        <p className="mt-10 text-ink-muted">{messages.servicesPage.indexEmpty}</p>
      ) : (
        <ul role="list" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </ul>
      )}
    </Section>
  );
}
