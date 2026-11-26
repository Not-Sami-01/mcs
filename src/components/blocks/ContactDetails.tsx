import type { ReactNode } from 'react';

import type { SiteChrome } from '@/cms/site-chrome';
import { messages } from '@/messages';

import { Section, SectionHeading } from './Section';
import type { BlockOf } from './types';

/** Every value comes from `site-settings`; nothing is hard-coded or invented. */
export function ContactDetails({
  block,
  chrome,
}: {
  block: BlockOf<'contactDetails'>;
  chrome: SiteChrome;
}) {
  const hasFacts = Boolean(chrome.phone || chrome.email || chrome.address || chrome.hours);

  const rows = [
    chrome.phone && {
      label: messages.blocks.contactPhone,
      value: (
        <a href={chrome.phone.href} className="text-brand-primary hover:underline">
          {chrome.phone.display}
        </a>
      ),
    },
    chrome.email && {
      label: messages.blocks.contactEmail,
      value: (
        <a href={chrome.email.href} className="break-all text-brand-primary hover:underline">
          {chrome.email.display}
        </a>
      ),
    },
    chrome.address && { label: messages.blocks.contactAddress, value: chrome.address },
    chrome.hours && { label: messages.blocks.contactHours, value: chrome.hours },
  ].filter(Boolean) as { label: string; value: ReactNode }[];

  return (
    <Section>
      <div className="grid gap-8 md:grid-cols-[0.7fr_1.3fr]">
        <SectionHeading>{block.headline}</SectionHeading>

        {hasFacts ? (
          <dl className="grid gap-4 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.label} className="rounded-[1.25rem] border border-line bg-surface p-5">
                <dt className="text-[11px] font-semibold tracking-[0.12em] text-ink-muted uppercase">
                  {row.label}
                </dt>
                <dd className="content-text mt-2 text-sm font-medium text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-ink-muted">{messages.blocks.contactEmpty}</p>
        )}
      </div>
    </Section>
  );
}
