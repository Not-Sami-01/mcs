import { messages } from '@/messages';

import { Section } from './Section';
import type { BlockOf } from './types';

/** `proofNote` is internal and deliberately never rendered. */
export function TrustStrip({ block }: { block: BlockOf<'trustStrip'> }) {
  const items = block.items ?? [];
  if (items.length === 0) return null;

  return (
    <Section tone="alt" label={messages.blocks.trustStripLabel}>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
        {items.map((item, index) => (
          <div key={item.id ?? `stat-${index}`}>
            <dt className="text-3xl font-semibold tracking-tight text-brand-primary">
              <span className="content-text">{item.statValue}</span>
            </dt>
            <dd className="content-text mt-1 text-sm text-ink-muted">{item.statLabel}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
