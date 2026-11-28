import { Section, SectionHeading } from './Section';
import type { BlockOf } from './types';

export function OurDifference({ block }: { block: BlockOf<'ourDifference'> }) {
  return (
    <Section tone="alt">
      <div className="max-w-3xl">
        <SectionHeading>{block.headline}</SectionHeading>
        <p className="content-text mt-4 text-ink-muted">{block.shortParagraph}</p>

        {(block.points ?? []).length > 0 ? (
          <ul className="mt-6 space-y-3">
            {(block.points ?? []).map((item, index) => (
              <li key={item.id ?? `point-${index}`} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 h-2 w-2 shrink-0 rounded-sm bg-brand-primary"
                />
                <span className="content-text">{item.point}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Section>
  );
}
