import { Section, SectionHeading } from './Section';
import type { BlockOf } from './types';

export function HowItWorks({ block }: { block: BlockOf<'howItWorks'> }) {
  const steps = block.steps ?? [];

  return (
    <Section tone="alt">
      <SectionHeading>{block.headline}</SectionHeading>

      <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
        {steps.map((step, index) => (
          <li key={step.id ?? `step-${index}`} className="border-t border-line pt-4">
            <span className="tabular text-sm text-brand-primary">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="content-text mt-3 text-base text-ink">{step.cardTitle}</h3>
            <p className="content-text mt-2 text-sm leading-relaxed text-ink-muted">
              {step.cardBody}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
