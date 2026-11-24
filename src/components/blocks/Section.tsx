import type { ReactNode } from 'react';

/**
 * Shared block wrapper (docs/DESIGNS.md §3/§4): consistent padding, one
 * max-width and alternating backgrounds. Headings stay inside the block so the
 * page keeps a logical order.
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
    brand: 'bg-brand-primary text-brand-primary-contrast',
  } as const;

  return (
    <section aria-label={label} className={`${tones[tone]} ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">{children}</div>
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
      className={`content-text text-2xl font-semibold tracking-tight md:text-3xl ${
        tone === 'on-brand' ? 'text-brand-primary-contrast' : 'text-ink'
      } ${className}`}
    >
      {children}
    </h2>
  );
}
