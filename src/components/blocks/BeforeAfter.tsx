import { messages } from '@/messages';

import { Section, SectionHeading } from './Section';
import { SiteImage } from './SiteImage';
import type { BlockOf } from './types';

/** Pairs without recorded photo consent are never published (Q15). */
export function BeforeAfter({ block }: { block: BlockOf<'beforeAfter'> }) {
  const pairs = (block.pairs ?? []).filter((pair) => pair.consentConfirmed === true);
  if (pairs.length === 0) return null;

  return (
    <Section tone="alt">
      <SectionHeading>{block.headline}</SectionHeading>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {pairs.map((pair, index) => (
          <figure key={pair.id ?? `pair-${index}`}>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { label: messages.blocks.before, image: pair.before },
                  { label: messages.blocks.after, image: pair.after },
                ] as const
              ).map((side) => (
                <div key={side.label}>
                  <div className="aspect-square overflow-hidden rounded-card bg-surface">
                    <SiteImage
                      image={side.image}
                      sizes="(max-width: 767px) 50vw, 300px"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-2 text-xs font-medium text-ink-muted ">{side.label}</p>
                </div>
              ))}
            </div>
            {pair.caption || pair.area ? (
              <figcaption className="content-text mt-3 text-sm text-ink-muted">
                {pair.caption}
                {pair.caption && pair.area ? ' — ' : null}
                {pair.area}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </Section>
  );
}
