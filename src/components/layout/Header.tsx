import Link from 'next/link';

import type { NavLink } from '@/cms/site-chrome';
import { messages } from '@/messages';

import { PhoneIcon } from './icons';
import { MobileMenu } from './MobileMenu';
import { NavAnchor } from './NavAnchor';

const primaryAction =
  'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand-primary px-5 text-sm font-semibold text-brand-primary-contrast shadow-sm transition hover:bg-brand-deep';

const outlineAction =
  'inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full px-4 text-sm font-semibold text-ink transition hover:bg-surface-alt';

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
            className="relative grid h-10 w-10 place-items-center rounded-2xl bg-brand-deep text-brand-accent"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
              <path
                d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1v-8.5Z"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
            <span className="absolute -end-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand-accent" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-semibold tracking-tight whitespace-nowrap text-ink">
              MCS
            </span>
            <span className="hidden text-[11px] font-medium tracking-wide whitespace-nowrap text-ink-muted uppercase sm:block">
              Malaysian Care System
            </span>
          </span>
        </Link>

        <nav aria-label={messages.a11y.primaryNav} className="mx-auto hidden xl:block">
          <ul className="flex items-center gap-0.5 rounded-full border border-line/80 bg-surface-alt/70 p-1">
            {items.map((item) => (
              <li key={`${item.href}-${item.label}`}>
                <NavAnchor
                  href={item.href}
                  className="inline-flex min-h-9 items-center rounded-full px-3.5 text-[13px] font-semibold whitespace-nowrap text-ink-muted transition hover:bg-surface hover:text-ink hover:shadow-sm"
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
              className="hidden min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold whitespace-nowrap text-ink transition hover:bg-surface-alt 2xl:inline-flex"
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
            <span aria-hidden="true">→</span>
          </Link>

          {phone ? (
            <a
              href={phone.href}
              aria-label={messages.a11y.call}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line text-ink sm:hidden"
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
