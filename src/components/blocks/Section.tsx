import type { ReactNode } from 'react';

/**
 * Shared block wrapper (docs/DESIGNS.md §3/§4): one max-width, generous
 * vertical rhythm and alternating backgrounds. Headings stay inside the block
 * so the page keeps a logical order.
 */
export function Section({
  children,
  tone = 'surface',
  label,
  className = '',
}: {
  children: ReactNode;
  tone?: 'surface' | 'alt' | 'brand';
  label?: string;
  className?: string;
}) {
  const tones = {
    surface: 'bg-surface text-ink',
    alt: 'bg-surface-alt text-ink',
    brand: 'bg-brand-deep text-brand-primary-contrast',
  } as const;

  return (
    <section aria-label={label} className={`relative ${tones[tone]} ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8 md:py-20">{children}</div>
    </section>
  );
}

export function SectionHeading({
  children,
  tone = 'default',
  className = '',
}: {
  children: ReactNode;
  tone?: 'default' | 'on-brand';
  className?: string;
}) {
  return (
    <h2
      className={`content-text max-w-3xl text-3xl leading-[1.1] font-semibold tracking-tight md:text-4xl ${
        tone === 'on-brand' ? 'text-brand-primary-contrast' : 'text-ink'
      } ${className}`}
    >
      <span aria-hidden="true" className="mb-4 block h-1.5 w-10 rounded-full bg-brand-accent" />
      {children}
    </h2>
  );
}
