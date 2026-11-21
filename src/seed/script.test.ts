import { afterEach, describe, expect, it, vi } from 'vitest';

// The real payload.config throws without env vars and would open a DB
// connection; the production guard runs before either matters.
vi.mock('../payload.config', () => ({ default: {} }));

const { script } = await import('./index');

describe('seed bin script exit code', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    process.exitCode = undefined;
  });

  it('sets a non-zero exit code when the seed refuses to run', async () => {
    vi.stubEnv('SITE_ENV', 'production');

    await expect(script()).rejects.toThrow(/prohibited in production/);
    expect(process.exitCode).toBe(1);
  });
});
