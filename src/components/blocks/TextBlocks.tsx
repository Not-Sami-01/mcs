import { Section, SectionHeading } from './Section';
import type { BlockOf } from './types';

export function TextBlocks({ block }: { block: BlockOf<'textBlocks'> }) {
  return (
    <Section>
      <div className="max-w-3xl">
        <SectionHeading>{block.headline}</SectionHeading>
        <div className="mt-6 space-y-4">
          {(block.paragraphs ?? []).map((item, index) => (
            <p key={item.id ?? `paragraph-${index}`} className="content-text text-ink-muted">
              {item.paragraph}
            </p>
          ))}
        </div>
      </div>
    </Section>
  );
}
