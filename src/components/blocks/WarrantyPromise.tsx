import type { SiteChrome } from '@/cms/site-chrome';

import { BlockAction, resolveAction } from './BlockAction';
import { Section, SectionHeading } from './Section';
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
      <div className="max-w-3xl">
        <SectionHeading>{block.headline}</SectionHeading>
        <p className="content-text mt-4 text-ink-muted">{block.shortParagraph}</p>

        {(block.highlights ?? []).length > 0 ? (
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {(block.highlights ?? []).map((item, index) => (
              <li key={item.id ?? `highlight-${index}`} className="content-text text-sm">
                {item.highlight}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-8">
          {' '}
          <BlockAction action={resolveAction(block.link, chrome)} variant="outline" />
        </div>
      </div>
    </Section>
  );
}
