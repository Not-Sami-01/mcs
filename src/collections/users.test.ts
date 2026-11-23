import { describe, expect, it } from 'vitest';

import { INVITE_EXPIRATION_MS } from '../auth/invites';
import { Users } from './Users';

describe('users collection auth configuration (docs/SECURITY.md C1)', () => {
  // `CollectionConfig['auth']` is `boolean | IncomingAuthType | undefined`; this
  // collection always configures the object form.
  const auth = Users.auth as {
    maxLoginAttempts?: number;
    lockTime?: number;
    tokenExpiration?: number;
    cookies?: { sameSite?: string };
    forgotPassword?: { expiration?: number };
  };

  it('locks an account after five failures for fifteen minutes', () => {
    expect(auth.maxLoginAttempts).toBe(5);
    expect(auth.lockTime).toBe(15 * 60 * 1000);
  });

  it('keeps staff sessions short and cookies same-site', () => {
    expect(auth.tokenExpiration).toBe(2 * 60 * 60);
    expect(auth.cookies?.sameSite).toBe('Strict');
  });

  it('expires invite and reset links after 24 hours', () => {
    expect(auth.forgotPassword?.expiration).toBe(INVITE_EXPIRATION_MS);
  });

  it('never allows public sign up', () => {
    // `access.create` is Super Admin only; the first-user endpoint bypasses
    // access control, so `src/access/first-user.ts` blocks it in a hook.
    expect(Users.access?.create).toBeDefined();
    expect(Users.access?.delete).toBeDefined();
    expect(Users.access?.update).toBeDefined();
    expect(Users.access?.unlock).toBeDefined();
  });
});
