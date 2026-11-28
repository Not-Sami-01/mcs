import { messages } from '@/messages';

import { BlockAction } from './BlockAction';
import { Section } from './Section';
import type { BlockOf } from './types';

/**
 * The inspection fields are fixed and belong to the form page (CP-8). This
 * block introduces the offer and links to that page; it does not fake a form
 * that cannot submit yet.
 */
export function InspectionForm({ block }: { block: BlockOf<'inspectionForm'> }) {
  return (
    <Section tone="alt">
      <div className="relative overflow-hidden rounded-panel border border-line bg-surface p-7 md:p-12">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <span aria-hidden="true" className="mb-5 block h-2 w-2 bg-brand-accent" />
            <h2 className="content-text text-3xl leading-[1.1] font-medium text-ink md:text-4xl">
              {block.headline}
            </h2>
            <p className="content-text mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
              {block.shortParagraph}
            </p>
          </div>
          <div className="md:justify-self-end">
            <BlockAction
              action={{
                label: messages.blocks.startInspection,
                href: '/free-inspection',
                kind: 'inspection',
                external: false,
              }}
              variant="primary"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
