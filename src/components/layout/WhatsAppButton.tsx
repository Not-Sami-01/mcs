import { messages } from '@/messages';

import { WhatsAppIcon } from './icons';

/** Desktop floating WhatsApp button; mobile uses the sticky bar instead. */
export function WhatsAppButton({ whatsapp }: { whatsapp: { href: string } | null }) {
  if (!whatsapp) return null;

  return (
    <a
      href={whatsapp.href}
      aria-label={messages.a11y.chatOnWhatsApp}
      className="fixed end-6 bottom-6 z-[45] hidden h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-ink shadow-card lg:inline-flex"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
