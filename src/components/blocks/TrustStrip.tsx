import { messages } from '@/messages';

import type { BlockOf } from './types';

/** `proofNote` is internal and deliberately never rendered. */
export function TrustStrip({ block }: { block: BlockOf<'trustStrip'> }) {
  const items = block.items ?? [];
  if (items.length === 0) return null;

  return (
    <section aria-label={messages.blocks.trustStripLabel} className="bg-surface-alt">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">
        <dl className="grid gap-px overflow-hidden rounded-[1.5rem] border border-line bg-line sm:grid-cols-3">
          {items.map((item, index) => (
            <div key={item.id ?? `stat-${index}`} className="bg-surface px-6 py-7">
              <dt className="text-4xl font-semibold tracking-[-0.03em] text-brand-primary">
                <span className="content-text">{item.statValue}</span>
              </dt>
              <dd className="content-text mt-2 text-sm font-medium text-ink-muted">
                {item.statLabel}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
