import { Section, SectionHeading } from './Section';
import type { BlockOf } from './types';

export function HowItWorks({ block }: { block: BlockOf<'howItWorks'> }) {
  const steps = block.steps ?? [];

  return (
    <Section tone="alt">
      <SectionHeading>{block.headline}</SectionHeading>

      <ol className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-6 hidden h-px bg-gradient-to-r from-line via-brand-primary/30 to-line lg:block"
        />
        {steps.map((step, index) => (
          <li key={step.id ?? `step-${index}`} className="relative">
            <span
              aria-hidden="true"
              className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface text-sm font-semibold text-brand-primary shadow-sm"
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="content-text mt-5 text-base font-semibold text-ink">{step.cardTitle}</h3>
            <p className="content-text mt-2 text-sm leading-relaxed text-ink-muted">
              {step.cardBody}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
