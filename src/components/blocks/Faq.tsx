import { Section, SectionHeading } from './Section';
import type { BlockOf } from './types';

export function Faq({ block }: { block: BlockOf<'faq'> }) {
  return (
    <Section>
      <SectionHeading>{block.headline}</SectionHeading>
      <div className="mt-8 max-w-3xl divide-y divide-line border-y border-line">
        {(block.items ?? []).map((item, index) => (
          <details key={item.id ?? `faq-${index}`} className="group py-2">
            <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 py-2 text-base font-semibold text-ink">
              <span className="content-text">{item.question}</span>
              <span
                aria-hidden="true"
                className="shrink-0 text-xl leading-none text-brand-primary group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="content-text pb-4 text-sm text-ink-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
