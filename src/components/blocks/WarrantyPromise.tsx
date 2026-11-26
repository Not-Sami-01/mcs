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
      <div className="grid gap-10 rounded-[2rem] border border-line bg-surface p-6 md:grid-cols-[1.1fr_0.9fr] md:p-10">
        <div>
          <span aria-hidden="true" className="mb-4 block h-1.5 w-10 rounded-full bg-brand-accent" />
          <h2 className="content-text text-3xl leading-[1.1] font-semibold tracking-tight text-ink md:text-4xl">
            {block.headline}
          </h2>
          <p className="content-text mt-4 text-base leading-relaxed text-ink-muted">
            {block.shortParagraph}
          </p>
          <div className="mt-7">
            <BlockAction action={resolveAction(block.link, chrome)} variant="outline" />
          </div>
        </div>

        <div className="rounded-[1.25rem] bg-surface-alt p-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-brand-primary uppercase">
            What you get in writing
          </p>
          <ul role="list" className="mt-4 space-y-3">
            {(block.highlights ?? []).map((item, index) => (
              <li
                key={item.id ?? `highlight-${index}`}
                className="content-text flex gap-3 text-sm font-medium text-ink"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-primary/10 text-[11px] font-bold text-brand-primary"
                >
                  ✓
                </span>
                {item.highlight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
