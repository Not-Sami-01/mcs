import Link from 'next/link';
import type { ReactNode } from 'react';

/** Internal hrefs use `next/link`; validated external links use a plain anchor. */
export function NavAnchor({
  href,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  if (href.startsWith('/')) {
    return (
      <Link href={href} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  const isHttp = href.startsWith('http://') || href.startsWith('https://');

  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      {...(isHttp ? { rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  );
}
