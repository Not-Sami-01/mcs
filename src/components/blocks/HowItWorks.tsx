import { Section, SectionHeading } from './Section';
import type { BlockOf } from './types';

export function HowItWorks({ block }: { block: BlockOf<'howItWorks'> }) {
  return (
    <Section>
      <SectionHeading>{block.headline}</SectionHeading>
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {(block.steps ?? []).map((step, index) => (
          <li
            key={step.id ?? `step-${index}`}
            className="h-full rounded-card border border-line bg-surface p-5"
          >
            <span
              aria-hidden="true"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-brand-primary-contrast"
            >
              {index + 1}
            </span>
            <h3 className="content-text mt-3 line-clamp-2 text-base font-semibold text-ink">
              {step.cardTitle}
            </h3>
            <p className="content-text mt-2 line-clamp-4 text-sm text-ink-muted">{step.cardBody}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
