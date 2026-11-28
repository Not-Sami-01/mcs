import { Check } from 'lucide-react';

import type { SiteChrome } from '@/cms/site-chrome';

import { BlockAction, resolveAction } from './BlockAction';
import type { BlockOf } from './types';

/** The facts every visit starts with; the same three on every hero. */
const VISIT_ITEMS = [
  'Inspection before treatment',
  'Written quote before work starts',
  'Follow-up included',
];

export function Hero({ block, chrome }: { block: BlockOf<'hero'>; chrome: SiteChrome }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 md:px-8 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          {block.eyebrow ? (
            <p className="flex items-center gap-2 text-sm font-medium text-ink-muted">
              <span aria-hidden="true" className="h-2 w-2 bg-brand-accent" />
              {block.eyebrow}
            </p>
          ) : null}

          <h1 className="content-text mt-6 text-[2.4rem] leading-[1.05] text-ink sm:text-5xl lg:text-[3.5rem]">
            {block.headline}
          </h1>

          {block.subheadline ? (
            <p className="content-text mt-5 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
              {block.subheadline}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <BlockAction action={resolveAction(block.primaryAction, chrome)} variant="primary" />
            {(block.secondaryActions ?? []).map((action, index) => (
              <BlockAction
                key={action.id ?? `secondary-${index}`}
                action={resolveAction(action, chrome)}
                variant="outline"
              />
            ))}
          </div>

          <ul role="list" className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
            {VISIT_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check
                  aria-hidden="true"
                  className="h-4 w-4 text-brand-primary"
                  strokeWidth={1.5}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-panel border border-line bg-surface p-6 md:p-8">
          <p className="text-sm font-medium text-ink">What an inspection covers</p>
          <ul role="list" className="mt-5 space-y-3">
            {VISIT_ITEMS.map((item, index) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="tabular mt-0.5 grid h-5 w-5 shrink-0 place-items-center bg-surface-alt text-[11px] text-ink-muted"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-sm leading-relaxed text-ink">{item}</span>
              </li>
            ))}
          </ul>
          {chrome.hours ? (
            <p className="mt-6 border-t border-line pt-4 text-sm text-ink-muted">{chrome.hours}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
