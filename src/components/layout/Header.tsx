import Link from 'next/link';

import type { NavLink } from '@/cms/site-chrome';
import { messages } from '@/messages';

import { PhoneIcon } from './icons';
import { MobileMenu } from './MobileMenu';
import { NavAnchor } from './NavAnchor';

const primaryAction =
  'inline-flex min-h-11 items-center justify-center rounded-input bg-brand-primary px-4 text-sm font-semibold text-brand-primary-contrast hover:bg-ink';

const outlineAction =
  'inline-flex min-h-11 items-center justify-center rounded-input border border-line px-4 text-sm font-semibold text-ink hover:border-brand-primary hover:text-brand-primary';

export function Header({
  companyName,
  items,
  phone,
}: {
  companyName: string;
  items: NavLink[];
  phone: { href: string; display: string } | null;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="me-auto text-lg font-semibold tracking-tight text-brand-primary">
          {companyName}
        </Link>

        <nav aria-label={messages.a11y.primaryNav} className="hidden xl:block">
          <ul className="flex items-center gap-5">
            {items.map((item) => (
              <li key={`${item.href}-${item.label}`}>
                <NavAnchor
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-sm font-medium text-ink-muted hover:text-brand-primary"
                >
                  {item.label}
                </NavAnchor>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          {phone ? (
            <a
              href={phone.href}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink hover:text-brand-primary"
            >
              <PhoneIcon />
              {phone.display}
            </a>
          ) : null}
          <Link href="/free-inspection" className={primaryAction}>
            {messages.cta.freeInspection}
          </Link>
          <Link href="/get-a-quote" className={outlineAction}>
            {messages.cta.getQuote}
          </Link>
        </div>

        {phone ? (
          <a
            href={phone.href}
            aria-label={messages.a11y.call}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-input border border-line text-ink xl:hidden"
          >
            <PhoneIcon />
          </a>
        ) : null}

        <MobileMenu items={items} phone={phone} />
      </div>
    </header>
  );
}
