import type { SiteChrome } from '@/cms/site-chrome';
import { messages } from '@/messages';

import { NavAnchor } from './NavAnchor';

export function Footer({ chrome }: { chrome: SiteChrome }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-deep text-brand-primary-contrast">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid h-10 w-10 place-items-center rounded-input bg-brand-accent text-brand-accent-ink"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
                  <path
                    d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1v-8.5Z"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <p className="text-base font-medium">{chrome.companyName}</p>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-primary-contrast/70">
              {messages.footer.description}
            </p>

            {chrome.phone || chrome.email || chrome.address || chrome.hours ? (
              <address className="mt-6 space-y-2 text-sm not-italic text-brand-primary-contrast/70">
                {chrome.phone ? (
                  <p>
                    <a href={chrome.phone.href} className="hover:text-brand-accent">
                      {chrome.phone.display}
                    </a>
                  </p>
                ) : null}
                {chrome.email ? (
                  <p>
                    <a href={chrome.email.href} className="break-all hover:text-brand-accent">
                      {chrome.email.display}
                    </a>
                  </p>
                ) : null}
                {chrome.address ? <p className="content-text">{chrome.address}</p> : null}
                {chrome.hours ? <p>{chrome.hours}</p> : null}
              </address>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {chrome.footerColumns.map((column) => (
              <nav key={column.title} aria-label={`${messages.a11y.footerNav}: ${column.title}`}>
                <h2 className="text-sm font-medium text-brand-accent">{column.title}</h2>
                <ul className="mt-4 space-y-1">
                  {column.links.map((link) => (
                    <li key={`${link.href}-${link.label}`}>
                      <NavAnchor
                        href={link.href}
                        className="inline-flex min-h-9 items-center text-sm text-brand-primary-contrast/75 transition hover:text-brand-accent"
                      >
                        {link.label}
                      </NavAnchor>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-brand-primary-contrast/10 pt-6 text-xs text-brand-primary-contrast/60">
          <p>
            © {year} {chrome.companyName}. {messages.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
