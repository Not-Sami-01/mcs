import Link from 'next/link';

import { messages } from '@/messages';

import { PhoneIcon, WhatsAppIcon } from './icons';

/**
 * Mobile-only sticky action bar (docs/DESIGNS.md §3). Call and WhatsApp appear
 * only when staff saved real numbers; Free Inspection is always available.
 * A spacer in the layout keeps the footer clear of the bar.
 */
export function MobileStickyBar({
  phone,
  whatsapp,
}: {
  phone: { href: string } | null;
  whatsapp: { href: string } | null;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex">
        {phone ? (
          <a
            href={phone.href}
            aria-label={messages.a11y.call}
            className="flex min-h-14 flex-1 items-center justify-center gap-2 border-e border-line text-sm font-medium text-ink"
          >
            <PhoneIcon />
            {messages.cta.call}
          </a>
        ) : null}

        {whatsapp ? (
          <a
            href={whatsapp.href}
            aria-label={messages.a11y.chatOnWhatsApp}
            className="flex min-h-14 flex-1 items-center justify-center gap-2 border-e border-line bg-whatsapp text-sm font-medium text-ink"
          >
            <WhatsAppIcon />
            {messages.cta.whatsapp}
          </a>
        ) : null}

        <Link
          href="/free-inspection"
          className="flex min-h-14 flex-1 items-center justify-center bg-brand-primary px-3 text-center text-sm font-medium text-brand-primary-contrast"
        >
          {messages.cta.freeInspection}
        </Link>
      </div>
    </div>
  );
}
