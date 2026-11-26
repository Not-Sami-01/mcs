import { Section, SectionHeading } from './Section';
import type { BlockOf } from './types';

export function WhyChoose({ block }: { block: BlockOf<'whyChoose'> }) {
  return (
    <Section>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeading>{block.headline}</SectionHeading>
        <p className="max-w-xs text-sm font-medium text-ink-muted md:pb-2">
          No theatre. Just the steps that make a treatment work.
        </p>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {(block.items ?? []).map((item, index) => (
          <li
            key={item.id ?? `why-${index}`}
            className="group relative h-full overflow-hidden rounded-[1.25rem] border border-line bg-surface p-6 transition hover:border-brand-primary/30"
          >
            <div className="flex items-start justify-between gap-4">
              <span
                aria-hidden="true"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-alt text-sm font-semibold text-brand-primary"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-brand-accent transition group-hover:scale-150"
              />
            </div>
            <h3 className="content-text mt-5 text-lg font-semibold tracking-tight text-ink">
              {item.cardTitle}
            </h3>
            <p className="content-text mt-2 text-sm leading-relaxed text-ink-muted">
              {item.cardBody}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
