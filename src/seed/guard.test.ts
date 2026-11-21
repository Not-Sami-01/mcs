import { describe, expect, it } from 'vitest';

import { validateSeedEnvironment } from './guard';

describe('sample seed environment guard', () => {
  it.each([
    { nodeEnv: 'production', siteEnv: 'development' },
    { nodeEnv: 'development', siteEnv: 'production' },
  ])('refuses production (%o)', (environment) => {
    expect(() => validateSeedEnvironment(environment)).toThrow(/prohibited in production/);
  });

  it('requires an explicit development or staging site environment', () => {
    expect(() => validateSeedEnvironment({ nodeEnv: 'development', siteEnv: '' })).toThrow(
      /Set SITE_ENV/,
    );
    expect(() => validateSeedEnvironment({ nodeEnv: 'development', siteEnv: 'test' })).toThrow(
      /Set SITE_ENV/,
    );
  });

  it.each(['development', 'staging'])('allows %s', (siteEnv) => {
    expect(() => validateSeedEnvironment({ nodeEnv: 'development', siteEnv })).not.toThrow();
  });
});
