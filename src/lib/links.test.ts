import { describe, expect, it } from 'vitest';

import { safeHref, telHref, whatsappHref } from './links';

describe('safeHref', () => {
  it('allows relative, http(s), mailto and tel targets', () => {
    expect(safeHref('/services')).toBe('/services');
    expect(safeHref('https://example.com/a')).toBe('https://example.com/a');
    expect(safeHref('http://example.com')).toBe('http://example.com');
    expect(safeHref('mailto:hello@example.com')).toBe('mailto:hello@example.com');
    expect(safeHref('tel:+923001234567')).toBe('tel:+923001234567');
  });

  it('rejects javascript, data, protocol-relative and malformed targets', () => {
    expect(safeHref('javascript:alert(1)')).toBeNull();
    expect(safeHref('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(safeHref('//evil.example')).toBeNull();
    expect(safeHref('not a url')).toBeNull();
    expect(safeHref('')).toBeNull();
    expect(safeHref(null)).toBeNull();
  });
});

describe('telHref', () => {
  it('normalises a display number', () => {
    expect(telHref('+92 300 123 4567')).toBe('tel:+923001234567');
    expect(telHref('042-111-222-333')).toBe('tel:042111222333');
  });

  it('returns null without digits', () => {
    expect(telHref('')).toBeNull();
    expect(telHref(null)).toBeNull();
    expect(telHref('call us')).toBeNull();
  });
});

describe('whatsappHref', () => {
  it('builds a wa.me link with a pre-filled message', () => {
    expect(whatsappHref('923001234567', 'Hi MCS')).toBe('https://wa.me/923001234567?text=Hi%20MCS');
    expect(whatsappHref('+92 (300) 123-4567')).toBe('https://wa.me/923001234567');
  });

  it('returns null without a number', () => {
    expect(whatsappHref('')).toBeNull();
    expect(whatsappHref(undefined)).toBeNull();
  });
});
