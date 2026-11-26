import type { SiteChrome } from '@/cms/site-chrome';

import { BlockAction, resolveAction } from './BlockAction';
import { Section } from './Section';
import type { BlockOf } from './types';

export function Cta({ block, chrome }: { block: BlockOf<'cta'>; chrome: SiteChrome }) {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-[2rem] bg-brand-deep px-6 py-12 text-brand-primary-contrast md:px-14 md:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-brand-accent/15 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 start-1/3 h-72 w-72 rounded-full bg-brand-primary/40 blur-3xl"
        />

        <div className="relative max-w-2xl">
          <span aria-hidden="true" className="mb-4 block h-1.5 w-10 rounded-full bg-brand-accent" />
          <h2 className="content-text text-3xl leading-[1.1] font-semibold tracking-tight md:text-4xl">
            {block.headline}
          </h2>
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
