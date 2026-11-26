import Link from 'next/link';

import { messages } from '@/messages';
import type { Service } from '@/payload-types';

/**
 * One service card, shared by the services grid block and the `/services`
 * index. Text is plain CMS text (never rich HTML) and the whole card is one
 * link target with a visible label.
 */
export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  return (
    <li className="h-full">
      <Link
        href={`/services/${service.slug}`}
        className="group relative flex h-full flex-col justify-between gap-8 rounded-[1.25rem] border border-line bg-surface p-6 text-ink transition duration-200 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-[var(--shadow-lift)] focus-visible:outline-brand-primary"
      >
        <div>
          <span
            aria-hidden="true"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-alt text-sm font-semibold text-brand-primary transition group-hover:bg-brand-accent group-hover:text-brand-accent-ink"
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="content-text mt-5 text-lg font-semibold tracking-tight">
            {service.title}
          </h3>
          <p className="content-text mt-2 text-sm leading-relaxed text-ink-muted">
            {service.shortDescription}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">
          {messages.blocks.learnMore}
          <span aria-hidden="true" className="transition group-hover:translate-x-1">
            →
          </span>
        </span>
      </Link>
    </li>
  );
}
