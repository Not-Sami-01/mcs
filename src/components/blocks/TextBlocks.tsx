import { Section, SectionHeading } from './Section';
import type { BlockOf } from './types';

export function TextBlocks({ block }: { block: BlockOf<'textBlocks'> }) {
  const paragraphs = block.paragraphs ?? [];
  const split = paragraphs.length > 0 && paragraphs.length <= 3;

  return (
    <Section>
      <div className={split ? 'grid gap-6 md:grid-cols-[0.85fr_1.15fr] md:gap-12' : 'max-w-3xl'}>
        <SectionHeading>{block.headline}</SectionHeading>
        <div className="space-y-4">
          {paragraphs.map((item, index) => (
            <p
              key={item.id ?? `paragraph-${index}`}
              className={`content-text leading-relaxed text-ink-muted ${
                index === 0 && split ? 'text-lg text-ink' : 'text-base'
              }`}
            >
              {item.paragraph}
            </p>
          ))}
        </div>
      </div>
    </Section>
  );
}
