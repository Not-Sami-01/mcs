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
      <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">{children}</div>
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
      className={`content-text flex max-w-3xl items-start gap-3 text-3xl leading-[1.15] md:text-4xl ${
        tone === 'on-brand' ? 'text-brand-primary-contrast' : 'text-ink'
      } ${className}`}
    >
      {/* Signature: the lime treatment marker, used before section headings only. */}
      <span aria-hidden="true" className="mt-[0.7em] h-2 w-2 shrink-0 bg-brand-accent" />
      <span>{children}</span>
    </h2>
  );
}
