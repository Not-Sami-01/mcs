import type { Metadata } from 'next';

import { getRobotsDirectives } from '@/config/site-env';

import './globals.css';

export const metadata: Metadata = {
  title: 'Malaysian Care System',
  description: 'Pest control services in Lahore, Pakistan.',
  robots: getRobotsDirectives(),
};

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
