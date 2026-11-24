import type { SiteChrome } from '@/cms/site-chrome';
import { messages } from '@/messages';

import { NavAnchor } from './NavAnchor';

export function Footer({ chrome }: { chrome: SiteChrome }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface-alt">
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-semibold text-brand-primary">{chrome.companyName}</p>
            <p className="mt-3 max-w-xs text-sm text-ink-muted">{messages.footer.description}</p>

            {chrome.phone || chrome.email || chrome.address || chrome.hours ? (
              <address className="mt-5 space-y-2 text-sm not-italic text-ink-muted">
                {chrome.phone ? (
                  <p>
                    <a href={chrome.phone.href} className="hover:text-brand-primary">
                      {chrome.phone.display}
                    </a>
                  </p>
                ) : null}
                {chrome.email ? (
                  <p>
                    <a href={chrome.email.href} className="break-all hover:text-brand-primary">
                      {chrome.email.display}
                    </a>
                  </p>
                ) : null}
                {chrome.address ? <p className="content-text">{chrome.address}</p> : null}
                {chrome.hours ? <p>{chrome.hours}</p> : null}
              </address>
            ) : null}
          </div>

          {chrome.footerColumns.map((column) => (
            <nav key={column.title} aria-label={`${messages.a11y.footerNav}: ${column.title}`}>
              <h2 className="text-sm font-semibold tracking-wide text-ink uppercase">
                {column.title}
              </h2>
              <ul className="mt-4 space-y-2">
                {column.links.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <NavAnchor
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-sm text-ink-muted hover:text-brand-primary"
                    >
                      {link.label}
                    </NavAnchor>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {chrome.companyName}. {messages.footer.rights}
          </p>
          <nav aria-label={messages.a11y.footerNav}>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {chrome.legalLinks.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <NavAnchor
                    href={link.href}
                    className="inline-flex min-h-11 items-center hover:text-brand-primary"
                  >
                    {link.label}
                  </NavAnchor>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
