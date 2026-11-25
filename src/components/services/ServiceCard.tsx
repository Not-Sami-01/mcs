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
        className="flex h-full flex-col justify-between gap-4 rounded-card border border-line bg-surface p-5 text-ink transition-colors hover:border-brand-primary focus-visible:outline-brand-primary"
      >
        <div>
          <h3 className="content-text text-lg font-semibold">{service.title}</h3>
          <p className="content-text mt-2 text-sm text-ink-muted">{service.shortDescription}</p>
        </div>
        <span className="text-sm font-semibold text-brand-primary">
          {messages.blocks.learnMore}
        </span>
      </Link>
    </li>
  );
}
