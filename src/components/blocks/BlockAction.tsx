import Link from 'next/link';

import type { SiteChrome } from '@/cms/site-chrome';
import { safeHref } from '@/lib/links';

import { PhoneIcon, WhatsAppIcon } from '../layout/icons';

export type RawAction = {
  label: string;
  kind: 'call' | 'whatsapp' | 'inspection' | 'link';
  href: string;
};

export type ResolvedAction = {
  label: string;
  href: string;
  kind: RawAction['kind'];
  external: boolean;
};

/**
 * A block action is resolved against the **saved** contact settings, never a
 * placeholder. Call and WhatsApp disappear when staff have not saved a number
 * (same rule as the header), so a fake number can never ship.
 */
export function resolveAction(
  action: RawAction | null | undefined,
  chrome: Pick<SiteChrome, 'phone' | 'whatsapp'>,
): ResolvedAction | null {
  const label = action?.label?.trim();
  if (!action || !label) return null;

  switch (action.kind) {
    case 'call':
      return chrome.phone ? { label, href: chrome.phone.href, kind: 'call', external: true } : null;
    case 'whatsapp':
      return chrome.whatsapp
        ? { label, href: chrome.whatsapp.href, kind: 'whatsapp', external: true }
        : null;
    case 'inspection':
      return { label, href: '/free-inspection', kind: 'inspection', external: false };
    default: {
      const href = safeHref(action.href);
      if (!href) return null;
      return {
        label,
        href,
        kind: 'link',
        external: !href.startsWith('/'),
      };
    }
  }
}

const styles = {
  primary: 'bg-brand-primary text-brand-primary-contrast hover:bg-brand-deep',
  outline: 'border border-line bg-surface text-ink hover:border-brand-primary',
  whatsapp: 'border border-line bg-surface text-ink hover:border-brand-primary',
  'on-brand': 'bg-brand-accent text-brand-accent-ink hover:bg-surface',
  'on-brand-outline':
    'border border-brand-primary-contrast/40 text-brand-primary-contrast hover:border-brand-accent hover:text-brand-accent',
} as const;

export type ActionVariant = keyof typeof styles;

export function BlockAction({
  action,
  variant = 'primary',
}: {
  action: ResolvedAction | null;
  variant?: ActionVariant;
}) {
  if (!action) return null;

  const className = `inline-flex min-h-11 items-center justify-center gap-2 rounded-input px-5 text-sm font-medium transition-colors ${styles[variant]}`;

  const content = (
    <>
      {action.kind === 'call' ? <PhoneIcon /> : null}
      {action.kind === 'whatsapp' ? <WhatsAppIcon /> : null}
      {action.label}
    </>
  );

  if (action.external) {
    return (
      <a
        href={action.href}
        className={className}
        {...(action.href.startsWith('http') ? { rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={action.href} className={className}>
      {content}
    </Link>
  );
}
