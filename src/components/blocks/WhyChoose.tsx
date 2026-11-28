import { Section, SectionHeading } from './Section';
import type { BlockOf } from './types';

export function WhyChoose({ block }: { block: BlockOf<'whyChoose'> }) {
  return (
    <Section>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeading>{block.headline}</SectionHeading>
        <p className="max-w-xs text-sm text-ink-muted md:pb-2">
          No theatre. Just the steps that make a treatment work.
        </p>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {(block.items ?? []).map((item, index) => (
          <li
            key={item.id ?? `why-${index}`}
            className="h-full rounded-card border border-line bg-surface p-6"
          >
            <span aria-hidden="true" className="block h-2 w-2 bg-brand-accent" />
            <h3 className="content-text mt-4 text-lg text-ink">{item.cardTitle}</h3>
            <p className="content-text mt-2 text-sm leading-relaxed text-ink-muted">
              {item.cardBody}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
