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

  return (
    <Section>
      <SectionHeading>{block.headline}</SectionHeading>

      {hasFacts ? (
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          {chrome.phone ? (
            <div>
              <dt className="font-semibold text-ink">{messages.blocks.contactPhone}</dt>
              <dd className="mt-1">
                <a href={chrome.phone.href} className="text-brand-primary hover:underline">
                  {chrome.phone.display}
                </a>
              </dd>
            </div>
          ) : null}
          {chrome.email ? (
            <div>
              <dt className="font-semibold text-ink">{messages.blocks.contactEmail}</dt>
              <dd className="mt-1">
                <a
                  href={chrome.email.href}
                  className="break-all text-brand-primary hover:underline"
                >
                  {chrome.email.display}
                </a>
              </dd>
            </div>
          ) : null}
          {chrome.address ? (
            <div>
              <dt className="font-semibold text-ink">{messages.blocks.contactAddress}</dt>
              <dd className="content-text mt-1 text-ink-muted">{chrome.address}</dd>
            </div>
          ) : null}
          {chrome.hours ? (
            <div>
              <dt className="font-semibold text-ink">{messages.blocks.contactHours}</dt>
              <dd className="content-text mt-1 text-ink-muted">{chrome.hours}</dd>
            </div>
          ) : null}
        </dl>
      ) : (
        <p className="mt-4 text-sm text-ink-muted">{messages.blocks.contactEmpty}</p>
      )}
    </Section>
  );
}
