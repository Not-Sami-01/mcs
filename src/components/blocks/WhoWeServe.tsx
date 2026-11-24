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
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(block.items ?? []).map((item, index) => (
          <li
            key={item.id ?? `audience-${index}`}
            className="flex h-full flex-col rounded-card border border-line bg-surface p-5"
          >
            <h3 className="content-text line-clamp-2 text-lg font-semibold text-ink">
              {item.title}
            </h3>
            <p className="content-text mt-2 line-clamp-4 text-sm text-ink-muted">{item.cardBody}</p>
            <div className="mt-auto pt-4">
              <BlockAction action={resolveAction(item.link, chrome)} variant="outline" />
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
