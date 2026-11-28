import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import type { NavLink } from '@/cms/site-chrome';
import { messages } from '@/messages';

import { PhoneIcon } from './icons';
import { MobileMenu } from './MobileMenu';
import { NavAnchor } from './NavAnchor';

const primaryAction =
  'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-input bg-brand-primary px-5 text-sm font-medium text-brand-primary-contrast transition-colors hover:bg-brand-deep';

const outlineAction =
  'inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-input px-3 text-sm font-medium text-ink transition-colors hover:bg-surface-alt';

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
    <header className="sticky top-0 z-40 border-b border-line/70 bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-5 py-3 md:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          aria-label={`${companyName} — home`}
        >
          <span
            aria-hidden="true"
            className="grid h-10 w-10 place-items-center rounded-input bg-brand-deep text-brand-accent"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
              <path
                d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1v-8.5Z"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block text-base font-medium whitespace-nowrap text-ink">MCS</span>
            <span className="hidden text-xs whitespace-nowrap text-ink-muted sm:block">
              Malaysian Care System
            </span>
          </span>
        </Link>

        <nav aria-label={messages.a11y.primaryNav} className="mx-auto hidden xl:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={`${item.href}-${item.label}`}>
                <NavAnchor
                  href={item.href}
                  className="inline-flex min-h-9 items-center rounded-input px-3 text-sm font-medium whitespace-nowrap text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
                >
                  {item.label}
                </NavAnchor>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-2 xl:ms-0">
          {phone ? (
            <a
              href={phone.href}
              className="hidden min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium whitespace-nowrap text-ink transition hover:bg-surface-alt 2xl:inline-flex"
            >
              <PhoneIcon />
              {phone.display}
            </a>
          ) : null}
          <Link href="/get-a-quote" className={`hidden xl:inline-flex ${outlineAction}`}>
            {messages.cta.getQuote}
          </Link>
          <Link href="/free-inspection" className={`hidden sm:inline-flex ${primaryAction}`}>
            {messages.cta.freeInspection}
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
          </Link>

          {phone ? (
            <a
              href={phone.href}
              aria-label={messages.a11y.call}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-input border border-line text-ink sm:hidden"
            >
              <PhoneIcon />
            </a>
          ) : null}

          <MobileMenu items={items} phone={phone} />
        </div>
      </div>
    </header>
  );
}
