import { messages } from '@/messages';

import { WhatsAppIcon } from './icons';

/** Desktop floating WhatsApp button; mobile uses the sticky bar instead. */
export function WhatsAppButton({ whatsapp }: { whatsapp: { href: string } | null }) {
  if (!whatsapp) return null;

  return (
    <a
      href={whatsapp.href}
      aria-label={messages.a11y.chatOnWhatsApp}
      className="fixed end-6 bottom-6 z-40 hidden h-12 w-12 items-center justify-center rounded-input bg-brand-deep text-brand-primary-contrast shadow-card transition-colors hover:bg-brand-primary lg:inline-flex"
    >
      <WhatsAppIcon className="h-5 w-5" />
    </a>
  );
}
