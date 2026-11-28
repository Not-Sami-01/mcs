import type { SiteChrome } from '@/cms/site-chrome';

import { BlockAction, resolveAction } from './BlockAction';
import { Section } from './Section';
import type { BlockOf } from './types';

export function Cta({ block, chrome }: { block: BlockOf<'cta'>; chrome: SiteChrome }) {
  return (
    <Section>
      <div className="rounded-panel bg-brand-deep px-6 py-12 text-brand-primary-contrast md:px-12 md:py-16">
        <div className="max-w-2xl">
          <span aria-hidden="true" className="mb-5 block h-2 w-2 bg-brand-accent" />
          <h2 className="content-text text-3xl leading-[1.15] md:text-4xl">{block.headline}</h2>
          <p className="content-text mt-4 text-base leading-relaxed text-brand-primary-contrast/80">
            {block.cardBody}
          </p>

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
      </div>
    </Section>
  );
}
