import type { SiteChrome } from '@/cms/site-chrome';

import { BlockAction, resolveAction } from './BlockAction';
import { SiteImage } from './SiteImage';
import type { BlockOf } from './types';

export function Hero({ block, chrome }: { block: BlockOf<'hero'>; chrome: SiteChrome }) {
  const hasImage = Boolean(block.image);
  const text = hasImage ? 'text-brand-primary-contrast' : 'text-ink';
  const muted = hasImage ? 'text-brand-primary-contrast/85' : 'text-ink-muted';

  return (
    <section className={`relative overflow-hidden ${hasImage ? 'bg-ink' : 'bg-surface-alt'}`}>
      {hasImage ? (
        <div className="absolute inset-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_picture]:block [&_picture]:h-full">
          <SiteImage
            image={block.image}
            priority
            sizes="100vw"
            className="h-full w-full object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-ink/75" />
        </div>
      ) : null}

      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
        <div className="max-w-2xl">
          {block.eyebrow ? (
            <p className={`text-sm font-semibold tracking-wide uppercase ${muted}`}>
              {block.eyebrow}
            </p>
          ) : null}

          <h1
            className={`content-text mt-3 text-4xl font-semibold tracking-tight md:text-5xl ${text}`}
          >
            {block.headline}
          </h1>

          {block.subheadline ? (
            <p className={`content-text mt-4 text-lg ${muted}`}>{block.subheadline}</p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <BlockAction
              action={resolveAction(block.primaryAction, chrome)}
              variant={hasImage ? 'on-brand' : 'primary'}
            />
            {(block.secondaryActions ?? []).map((action, index) => (
              <BlockAction
                key={action.id ?? `secondary-${index}`}
                action={resolveAction(action, chrome)}
                variant={hasImage ? 'on-brand-outline' : 'outline'}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
