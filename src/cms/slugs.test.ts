import { describe, expect, it } from 'vitest';

import { joinPath, normalizeSlug, RESERVED_SLUGS, slugError, validateSlug } from './slugs';

describe('slug rules (docs/CONTENT.md §3)', () => {
  it('normalises free text into lowercase ASCII with single hyphens', () => {
    expect(normalizeSlug('  About Us  ')).toBe('about-us');
    expect(normalizeSlug('Pest   Library!!')).toBe('pest-library');
    expect(normalizeSlug('--already--good--')).toBe('already-good');
  });

  it('rejects reserved slugs', () => {
    for (const reserved of RESERVED_SLUGS) {
      expect(slugError(reserved)).toContain('reserved');
      expect(validateSlug(reserved)).not.toBe(true);
    }
  });

  it('rejects uppercase, spaces, slashes, dots and empty values', () => {
    expect(slugError('About')).not.toBeNull();
    expect(slugError('about us')).not.toBeNull();
    expect(slugError('about/us')).not.toBeNull();
    expect(slugError('about.us')).not.toBeNull();
    expect(slugError('')).not.toBeNull();
    expect(slugError(undefined)).not.toBeNull();
  });

  it('accepts lowercase slugs and enforces the max length', () => {
    expect(slugError('about-us')).toBeNull();
    expect(validateSlug('about-us')).toBe(true);
    expect(slugError('a'.repeat(81))).toContain('Max 80 characters');
  });
});

describe('joinPath', () => {
  it('joins segments without leading, trailing or double slashes', () => {
    expect(joinPath('industries', 'restaurants-and-hotels')).toBe(
      'industries/restaurants-and-hotels',
    );
    expect(joinPath('/industries/', '/restaurants/')).toBe('industries/restaurants');
    expect(joinPath('', undefined, null, 'page')).toBe('page');
    expect(joinPath()).toBe('');
  });
});
