import { describe, expect, it } from 'vitest';

import { publicFileUrl } from './media-urls';

describe('publicFileUrl (ADR-015 direct Filebase delivery)', () => {
  it('joins origin, prefix and filename into the documented public URL form', () => {
    expect(
      publicFileUrl({
        baseUrl: 'https://vaultifier.s3.filebase.io',
        prefix: 'media',
        filename: 'hero-960x540.webp',
      }),
    ).toBe('https://vaultifier.s3.filebase.io/media/hero-960x540.webp');
  });

  it('tolerates a trailing slash on the base and a missing prefix', () => {
    expect(
      publicFileUrl({
        baseUrl: 'https://vaultifier.s3.filebase.io/',
        prefix: null,
        filename: 'a.png',
      }),
    ).toBe('https://vaultifier.s3.filebase.io/a.png');
    expect(
      publicFileUrl({
        baseUrl: 'https://vaultifier.s3.filebase.io/',
        prefix: 'media/',
        filename: 'b.png',
      }),
    ).toBe('https://vaultifier.s3.filebase.io/media/b.png');
  });

  it('never produces an empty segment or a double slash', () => {
    expect(publicFileUrl({ baseUrl: 'https://x.test', prefix: '', filename: '/c.png' })).toBe(
      'https://x.test/c.png',
    );
  });
});
