import type { SiteChrome } from '@/cms/site-chrome';

import { BlockAction, resolveAction } from './BlockAction';
import { Section, SectionHeading } from './Section';
import type { BlockOf } from './types';

export function Cta({ block, chrome }: { block: BlockOf<'cta'>; chrome: SiteChrome }) {
  return (
    <Section tone="brand">
      <div className="max-w-3xl">
        <SectionHeading tone="on-brand">{block.headline}</SectionHeading>
        <p className="content-text mt-4 text-brand-primary-contrast/90">{block.cardBody}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          {(block.buttons ?? []).map((action, index) => (
            <BlockAction
              key={action.id ?? `cta-${index}`}
              action={resolveAction(action, chrome)}
              variant={index === 0 ? 'on-brand' : 'on-brand-outline'}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
