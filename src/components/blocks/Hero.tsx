import type { SiteChrome } from '@/cms/site-chrome';

import { BlockAction, resolveAction } from './BlockAction';
import { SiteImage } from './SiteImage';
import type { BlockOf } from './types';

export function Hero({ block, chrome }: { block: BlockOf<'hero'>; chrome: SiteChrome }) {
  const hasImage = Boolean(block.image);

  return (
    <section className="relative overflow-hidden bg-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_85%_10%,var(--surface-soft),transparent_70%),radial-gradient(45%_45%_at_0%_90%,#f7fbf4,transparent_70%)]"
      />
      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          {block.eyebrow ? (
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-4 py-1.5 text-xs font-semibold tracking-[0.12em] text-brand-primary uppercase">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
              {block.eyebrow}
            </p>
          ) : null}

          <h1 className="content-text mt-6 text-[2.6rem] leading-[1.03] font-semibold tracking-[-0.03em] text-ink sm:text-5xl lg:text-6xl">
            {block.headline}
          </h1>

          {block.subheadline ? (
            <p className="content-text mt-6 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
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

          <ul
            role="list"
            className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-ink-muted"
          >
            {['Inspection before treatment', 'Written quote', 'Follow-up included'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="grid h-5 w-5 place-items-center rounded-full bg-brand-primary/10 text-[11px] font-bold text-brand-primary"
                >
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-[2rem] border border-line bg-brand-deep shadow-[var(--shadow-lift)]">
            {hasImage ? (
              <SiteImage
                image={block.image}
                priority
                sizes="(max-width: 1023px) 100vw, 44vw"
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="grid aspect-[4/3] place-items-center bg-[radial-gradient(120%_120%_at_20%_0%,#14563d,var(--brand-deep))]">
                <span className="text-6xl font-semibold tracking-tight text-brand-accent">MCS</span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-deep/55 via-transparent to-transparent" />
          </div>

          <div className="absolute bottom-4 start-4 end-4 rounded-2xl border border-line bg-surface/95 p-4 shadow-[var(--shadow-card)] backdrop-blur sm:end-auto sm:max-w-xs">
            <p className="text-xs font-semibold tracking-[0.12em] text-brand-primary uppercase">
              Start here
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">
              Free inspection, clear options, no pressure to book.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
