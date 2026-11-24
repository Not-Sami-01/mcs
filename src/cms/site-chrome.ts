import { getPayload } from 'payload';

import config from '@payload-config';
import { safeHref, telHref, whatsappHref } from '@/lib/links';
import { messages } from '@/messages';

/**
 * Site chrome (header, footer, contact actions) from the `navigation` and
 * `site-settings` globals. Public reads only.
 *
 * Contact facts are rendered **only when staff have saved them**. With no
 * rows, no phone, email, address or WhatsApp button appears — deliberately, so
 * a placeholder can never look real (docs/DATABASE.md §2 row lifecycle).
 * Menu structure has safe fallbacks from the message catalogue; links to pages
 * that do not exist yet return 404 until the page routes land (CP-3.2).
 */

export type NavLink = {
  label: string;
  href: string;
  children: NavLink[];
};

export type FooterColumn = {
  title: string;
  links: NavLink[];
};

export type SiteChrome = {
  companyName: string;
  navItems: NavLink[];
  footerColumns: FooterColumn[];
  legalLinks: NavLink[];
  phone: { href: string; display: string } | null;
  email: { href: string; display: string } | null;
  address: string | null;
  hours: string | null;
  whatsapp: { href: string } | null;
};

type RawLink = {
  label?: string | null;
  href?: string | null;
  children?: RawLink[] | null;
};

function toNavLink(raw: RawLink): NavLink | null {
  const label = raw.label?.trim();
  const href = safeHref(raw.href);
  if (!label || !href) return null;

  return {
    label,
    href,
    children: (raw.children ?? []).flatMap((child) => toNavLink(child) ?? []),
  };
}

function fallbackNavItems(): NavLink[] {
  return [
    { label: messages.nav.home, href: '/' },
    { label: messages.nav.about, href: '/about-us' },
    { label: messages.nav.services, href: '/services' },
    { label: messages.nav.products, href: '/products' },
    { label: messages.nav.locations, href: '/locations' },
    { label: messages.nav.warranty, href: '/warranty' },
    { label: messages.nav.pestLibrary, href: '/pest-library' },
    { label: messages.nav.contact, href: '/contact-us' },
  ].map((item) => ({ ...item, children: [] }));
}

function fallbackFooterColumns(): FooterColumn[] {
  return [
    {
      title: messages.footer.company,
      links: [
        { label: messages.footer.about, href: '/about-us', children: [] },
        { label: messages.footer.contact, href: '/contact-us', children: [] },
      ],
    },
    {
      title: messages.footer.explore,
      links: [
        { label: messages.footer.allServices, href: '/services', children: [] },
        { label: messages.footer.products, href: '/products', children: [] },
      ],
    },
    {
      title: messages.footer.areas,
      links: [{ label: messages.footer.allLocations, href: '/locations', children: [] }],
    },
  ];
}

function fallbackLegalLinks(): NavLink[] {
  return [
    { label: messages.footer.terms, href: '/terms-and-conditions', children: [] },
    { label: messages.footer.privacy, href: '/privacy-policy', children: [] },
  ];
}

export async function loadSiteChrome(): Promise<SiteChrome> {
  const payload = await getPayload({ config });

  const [navigation, settings] = await Promise.all([
    payload.findGlobal({ slug: 'navigation', depth: 0 }),
    payload.findGlobal({ slug: 'site-settings', depth: 0 }),
  ]);

  const navItems = (navigation.headerItems ?? []).flatMap((item) => toNavLink(item) ?? []);
  const footerColumns = (navigation.footerColumns ?? []).flatMap((column) => {
    const title = column.title?.trim();
    if (!title) return [];
    return [
      {
        title,
        links: (column.links ?? []).flatMap((link) => toNavLink(link) ?? []),
      },
    ];
  });
  const legalLinks = (navigation.legalLinks ?? []).flatMap((link) => toNavLink(link) ?? []);

  const firstPhone = settings.phones?.[0]?.number?.trim() ?? '';
  const phoneHref = telHref(firstPhone);
  const contactEmail = settings.email?.trim() ?? '';
  const emailHref = contactEmail ? safeHref(`mailto:${contactEmail}`) : null;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000').replace(
    /\/+$/,
    '',
  );

  return {
    companyName: settings.companyName?.trim() || 'Malaysian Care System',
    navItems: navItems.length > 0 ? navItems : fallbackNavItems(),
    footerColumns: footerColumns.length > 0 ? footerColumns : fallbackFooterColumns(),
    legalLinks: legalLinks.length > 0 ? legalLinks : fallbackLegalLinks(),
    phone: phoneHref ? { href: phoneHref, display: firstPhone } : null,
    email: emailHref ? { href: emailHref, display: contactEmail } : null,
    address: settings.address?.trim() || null,
    hours: settings.workingHours?.trim() || null,
    whatsapp: (() => {
      const href = whatsappHref(
        settings.whatsappNumber,
        `${messages.whatsapp.greeting} ${siteUrl}`,
      );
      return href ? { href } : null;
    })(),
  };
}
