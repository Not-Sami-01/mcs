import type { SiteChrome } from '@/cms/site-chrome';

import { BlockAction, resolveAction } from './BlockAction';
import { Section, SectionHeading } from './Section';
import type { BlockOf } from './types';

export function WhoWeServe({
  block,
  chrome,
}: {
  block: BlockOf<'whoWeServe'>;
  chrome: SiteChrome;
}) {
  return (
    <Section>
      <SectionHeading>{block.headline}</SectionHeading>
      <ul className="mt-10 grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {(block.items ?? []).map((item, index) => (
          <li
            key={item.id ?? `audience-${index}`}
            className="group flex h-full flex-col bg-surface p-6 transition hover:bg-surface-alt"
          >
            <span className="text-xs font-medium text-ink-muted">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="content-text mt-3 line-clamp-2 text-lg font-medium text-ink">
              {item.title}
            </h3>
            <p className="content-text mt-2 line-clamp-4 text-sm leading-relaxed text-ink-muted">
              {item.cardBody}
            </p>
            <div className="mt-auto pt-5">
              <BlockAction action={resolveAction(item.link, chrome)} variant="outline" />
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
