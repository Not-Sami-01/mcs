import { Section, SectionHeading } from './Section';
import type { BlockOf } from './types';

export function Faq({ block }: { block: BlockOf<'faq'> }) {
  return (
    <Section>
      <SectionHeading>{block.headline}</SectionHeading>
      <div className="mt-10 max-w-3xl overflow-hidden rounded-panel border border-line bg-surface">
        {(block.items ?? []).map((item, index) => (
          <details
            key={item.id ?? `faq-${index}`}
            className="group border-b border-line px-5 last:border-b-0 md:px-7"
          >
            <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 py-3 text-base font-medium text-ink">
              <span className="content-text">{item.question}</span>
              <span
                aria-hidden="true"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-input bg-surface-alt text-lg leading-none text-brand-primary transition group-open:rotate-45 group-open:bg-brand-accent group-open:text-brand-accent-ink"
              >
                +
              </span>
            </summary>
            <p className="content-text pb-5 text-sm leading-relaxed text-ink-muted">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}
