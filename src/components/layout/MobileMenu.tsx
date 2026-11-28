import Link from 'next/link';

import type { NavLink } from '@/cms/site-chrome';
import { messages } from '@/messages';

import { MenuIcon, PhoneIcon } from './icons';
import { NavAnchor } from './NavAnchor';

const actionPrimary =
  'inline-flex min-h-11 items-center justify-center rounded-input bg-brand-primary px-4 text-sm font-medium text-brand-primary-contrast';

const actionOutline =
  'inline-flex min-h-11 items-center justify-center rounded-input border border-line px-4 text-sm font-medium text-ink';

/**
 * Native `<details>` disclosure: keyboard operable with no client JavaScript.
 * Nested children are shown only here (desktop shows top-level links).
 */
export function MobileMenu({
  items,
  phone,
}: {
  items: NavLink[];
  phone: { href: string; display: string } | null;
}) {
  return (
    <details className="relative xl:hidden">
      <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-input border border-line px-3 text-sm font-medium text-ink">
        <MenuIcon />
        {messages.common.menu}
      </summary>

      <div className="absolute end-0 top-full z-40 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-card border border-line bg-surface p-4 shadow-card">
        <nav aria-label={messages.a11y.primaryNav}>
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={`${item.href}-${item.label}`}>
                <NavAnchor
                  href={item.href}
                  className="flex min-h-11 items-center rounded-input px-2 text-base font-medium text-ink hover:bg-surface-alt"
                >
                  {item.label}
                </NavAnchor>

                {item.children.length > 0 ? (
                  <ul className="ms-4 border-s border-line ps-3">
                    {item.children.map((child) => (
                      <li key={`${child.href}-${child.label}`}>
                        <NavAnchor
                          href={child.href}
                          className="flex min-h-11 items-center rounded-input px-2 text-sm text-ink-muted hover:bg-surface-alt hover:text-ink"
                        >
                          {child.label}
                        </NavAnchor>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-4 grid gap-2 border-t border-line pt-4">
          {phone ? (
            <a href={phone.href} className={actionOutline}>
              <PhoneIcon className="me-2 h-5 w-5" />
              {phone.display}
            </a>
          ) : null}
          <Link href="/free-inspection" className={actionPrimary}>
            {messages.cta.freeInspection}
          </Link>
          <Link href="/get-a-quote" className={actionOutline}>
            {messages.cta.getQuote}
          </Link>
        </div>
      </div>
    </details>
  );
}
