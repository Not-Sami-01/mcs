import { Section, SectionHeading } from './Section';
import type { BlockOf } from './types';

export function WhyChoose({ block }: { block: BlockOf<'whyChoose'> }) {
  return (
    <Section>
      <SectionHeading>{block.headline}</SectionHeading>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(block.items ?? []).map((item, index) => (
          <li
            key={item.id ?? `why-${index}`}
            className="h-full rounded-card border border-line bg-surface p-5"
          >
            {/* `icon` is a reserved slug; the icon set is not finalised yet. */}
            <span aria-hidden="true" className="block h-1 w-8 rounded bg-brand-accent" />
            <h3 className="content-text mt-4 line-clamp-2 text-lg font-semibold text-ink">
              {item.cardTitle}
            </h3>
            <p className="content-text mt-2 line-clamp-4 text-sm text-ink-muted">{item.cardBody}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
