import { messages } from '@/messages';

import { Section, SectionHeading } from './Section';
import { SiteImage } from './SiteImage';
import type { BlockOf } from './types';

export function Certificates({ block }: { block: BlockOf<'certificates'> }) {
  return (
    <Section>
      <SectionHeading>{block.headline}</SectionHeading>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {(block.items ?? []).map((item, index) => (
          <li key={item.id ?? `certificate-${index}`}>
            <div className="aspect-[4/3] overflow-hidden rounded-card border border-line bg-surface-alt p-3">
              <SiteImage
                image={item.image}
                sizes="(max-width: 767px) 100vw, 280px"
                className="h-full w-full object-contain"
              />
            </div>
            <h3 className="content-text mt-3 line-clamp-2 text-base font-medium text-ink">
              {item.title}
            </h3>
            <p className="content-text mt-1 text-sm text-ink-muted">
              {messages.blocks.issuedBy} {item.issuer}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
