import { afterEach, describe, expect, it, vi } from 'vitest';

import { getRobotsDirectives, getRobotsFile, getSiteEnvironment } from './site-env';

describe('site environment indexing gate', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to development when SITE_ENV is missing or invalid', () => {
    vi.stubEnv('SITE_ENV', '');
    expect(getSiteEnvironment()).toBe('development');
    expect(getRobotsDirectives()).toEqual({ index: false, follow: false });

    expect(getSiteEnvironment('unexpected')).toBe('development');
  });

  it('blocks indexing and crawling outside production', () => {
    expect(getRobotsDirectives('staging')).toEqual({ index: false, follow: false });
    expect(getRobotsFile('development').rules).toEqual({
      userAgent: '*',
      disallow: '/',
    });
  });

  it('allows indexing only in production and keeps private routes out of robots', () => {
    expect(getRobotsDirectives('production')).toEqual({ index: true, follow: true });
    expect(getRobotsFile('production').rules).toEqual({
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/edit'],
    });
  });
});
