import { messages } from '@/messages';
import type { Service } from '@/payload-types';

import { ServiceCard } from '../services/ServiceCard';
import { Section, SectionHeading } from './Section';
import type { BlockOf } from './types';

function selectedId(entry: NonNullable<BlockOf<'servicesGrid'>['services']>[number]): string {
  return String(typeof entry === 'object' && entry !== null ? entry.id : entry);
}

/**
 * Published services as cards (docs/CONTENT.md §6). `auto` shows every
 * published service in the collection's order; `manual` keeps the editor's
 * selection order and drops ids that are no longer published. No cards means
 * no section, so an empty services collection never ships an empty heading.
 */
export function ServicesGrid({
  block,
  services,
}: {
  block: BlockOf<'servicesGrid'>;
  services: Service[];
}) {
  const cards =
    block.mode === 'manual'
      ? (block.services ?? []).flatMap((entry) => {
          const id = selectedId(entry);
          const service = services.find((candidate) => String(candidate.id) === id);
          return service ? [service] : [];
        })
      : services;

  if (cards.length === 0) return null;

  return (
    <Section>
      <SectionHeading>{block.headline}</SectionHeading>
      {block.intro ? (
        <p className="content-text mt-4 max-w-3xl text-ink-muted">{block.intro}</p>
      ) : null}
      <ul
        role="list"
        aria-label={messages.blocks.servicesGridLabel}
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {cards.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </ul>
    </Section>
  );
}
