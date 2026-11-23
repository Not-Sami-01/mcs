import { describe, expect, it } from 'vitest';

import {
  assertFirstUserRegistrationAllowed,
  FIRST_USER_BOOTSTRAP_CONTEXT,
  isFirstUserBootstrapAllowed,
} from './first-user';

describe('first-user registration guard (docs/SECURITY.md C1)', () => {
  it('rejects every unauthenticated create that is not the bootstrap seed', () => {
    expect(() =>
      assertFirstUserRegistrationAllowed({
        operation: 'create',
        hasAuthenticatedUser: false,
        context: {},
      }),
    ).toThrow();
  });

  it('allows the explicit bootstrap context used by pnpm seed:admin', () => {
    expect(isFirstUserBootstrapAllowed({ [FIRST_USER_BOOTSTRAP_CONTEXT]: true })).toBe(true);
    expect(() =>
      assertFirstUserRegistrationAllowed({
        operation: 'create',
        hasAuthenticatedUser: false,
        context: { [FIRST_USER_BOOTSTRAP_CONTEXT]: true },
      }),
    ).not.toThrow();
  });

  it('does not treat a forged or unrelated context as bootstrap consent', () => {
    expect(isFirstUserBootstrapAllowed({ [FIRST_USER_BOOTSTRAP_CONTEXT]: 'true' })).toBe(false);
    expect(isFirstUserBootstrapAllowed({ someOtherFlag: true })).toBe(false);
    expect(isFirstUserBootstrapAllowed(null)).toBe(false);
  });

  it('lets an authenticated Super Admin create users', () => {
    expect(() =>
      assertFirstUserRegistrationAllowed({
        operation: 'create',
        hasAuthenticatedUser: true,
        context: undefined,
      }),
    ).not.toThrow();
  });

  it('never blocks updates (password resets and invites use them)', () => {
    expect(() =>
      assertFirstUserRegistrationAllowed({
        operation: 'update',
        hasAuthenticatedUser: false,
        context: undefined,
      }),
    ).not.toThrow();
  });
});
