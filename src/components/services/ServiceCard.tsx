import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import { messages } from '@/messages';
import type { Service } from '@/payload-types';

/**
 * One service card, shared by the services grid block and the `/services`
 * index. Text is plain CMS text (never rich HTML) and the whole card is one
 * link target with a visible label.
 */
export function ServiceCard({ service }: { service: Service }) {
  return (
    <li className="h-full">
      <Link
        href={`/services/${service.slug}`}
        className="group flex h-full flex-col rounded-card border border-line bg-surface p-6 text-ink transition-colors hover:border-brand-primary"
      >
        <h3 className="content-text text-xl leading-snug text-ink">{service.title}</h3>
        <p className="content-text mt-3 text-sm leading-relaxed text-ink-muted">
          {service.shortDescription}
        </p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-brand-primary">
          {messages.blocks.learnMore}
          <ArrowUpRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={1.5}
          />
        </span>
      </Link>
    </li>
  );
}
