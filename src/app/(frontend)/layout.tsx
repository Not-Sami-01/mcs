import type { Metadata } from 'next';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MobileStickyBar } from '@/components/layout/MobileStickyBar';
import { SkipLink } from '@/components/layout/SkipLink';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { getRobotsDirectives } from '@/config/site-env';
import { getSiteChrome } from '@/cms/site-chrome';

import './globals.css';

export const metadata: Metadata = {
  title: 'Malaysian Care System',
  description: 'Pest control services in Lahore, Pakistan.',
  robots: getRobotsDirectives(),
};

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const chrome = await getSiteChrome();

  return (
    <html lang="en" dir="ltr">
      <body className="bg-surface font-sans text-ink antialiased">
        <SkipLink />
        <Header companyName={chrome.companyName} items={chrome.navItems} phone={chrome.phone} />

        <main id="main-content" tabIndex={-1}>
          {children}
        </main>

        <Footer chrome={chrome} />

        {/* Keeps the last footer links clear of the fixed mobile bar. */}
        <div aria-hidden="true" className="h-16 lg:hidden" />

        <MobileStickyBar phone={chrome.phone} whatsapp={chrome.whatsapp} />
        <WhatsAppButton whatsapp={chrome.whatsapp} />
      </body>
    </html>
  );
}
