import { Check } from 'lucide-react';

import type { SiteChrome } from '@/cms/site-chrome';

import { BlockAction, resolveAction } from './BlockAction';
import { Section } from './Section';
import type { BlockOf } from './types';

export function WarrantyPromise({
  block,
  chrome,
}: {
  block: BlockOf<'warrantyPromise'>;
  chrome: SiteChrome;
}) {
  return (
    <Section tone="alt">
      <div className="grid gap-10 rounded-panel border border-line bg-surface p-6 md:grid-cols-[1.1fr_0.9fr] md:p-10">
        <div>
          <span aria-hidden="true" className="mb-5 block h-2 w-2 bg-brand-accent" />
          <h2 className="content-text text-3xl leading-[1.15] text-ink md:text-4xl">
            {block.headline}
          </h2>
          <p className="content-text mt-4 text-base leading-relaxed text-ink-muted">
            {block.shortParagraph}
          </p>
          <div className="mt-7">
            <BlockAction action={resolveAction(block.link, chrome)} variant="outline" />
          </div>
        </div>

        <div className="rounded-card bg-surface-alt p-6">
          <p className="text-sm font-medium text-ink-muted">What you get in writing</p>
          <ul role="list" className="mt-4 space-y-3">
            {(block.highlights ?? []).map((item, index) => (
              <li
                key={item.id ?? `highlight-${index}`}
                className="content-text flex gap-3 text-sm text-ink"
              >
                <Check
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary"
                  strokeWidth={1.5}
                />
                {item.highlight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
