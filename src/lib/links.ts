/**
 * Link and contact-target helpers (docs/SECURITY.md C5).
 *
 * CMS values are untrusted: only http(s), mailto, tel and same-site relative
 * paths are allowed. `javascript:` and `data:` URLs are replaced with `#`.
 */

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

export function safeHref(value: string | null | undefined): string | null {
  if (!value) return null;
  const href = value.trim();
  if (!href) return null;

  // A single leading slash is same-site; `//host` is protocol-relative and denied.
  if (href.startsWith('/')) return href.startsWith('//') ? null : href;

  try {
    const url = new URL(href);
    return ALLOWED_PROTOCOLS.has(url.protocol) ? href : null;
  } catch {
    return null;
  }
}

/** `tel:` target from a display number; null when there are no digits. */
export function telHref(number: string | null | undefined): string | null {
  if (!number) return null;
  const cleaned = number.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  return /\d/.test(cleaned) ? `tel:${cleaned}` : null;
}

/**
 * `wa.me` link from a digits-only international number (docs/CONTENT.md §9).
 * The number is normalised defensively; an empty number yields null.
 */
export function whatsappHref(number: string | null | undefined, message?: string): string | null {
  const digits = (number ?? '').replace(/\D/g, '');
  if (!digits) return null;
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${query}`;
}
