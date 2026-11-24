import { messages } from '@/messages';

import { BlockAction } from './BlockAction';
import { Section, SectionHeading } from './Section';
import type { BlockOf } from './types';

/**
 * The inspection fields are fixed and belong to the form page (CP-8). This
 * block introduces the offer and links to that page; it does not fake a form
 * that cannot submit yet.
 */
export function InspectionForm({ block }: { block: BlockOf<'inspectionForm'> }) {
  return (
    <Section tone="alt">
      <div className="max-w-3xl">
        <SectionHeading>{block.headline}</SectionHeading>
        <p className="content-text mt-4 text-ink-muted">{block.shortParagraph}</p>
        <div className="mt-8">
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
    </Section>
  );
}
