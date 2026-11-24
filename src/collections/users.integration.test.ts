import { getPayload, type Payload } from 'payload';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { FIRST_USER_BOOTSTRAP_CONTEXT } from '../access/first-user';
import { sendStaffInvite } from '../auth/invites';

// Vitest does not load .env files the way `next dev`/`next start` do.
try {
  process.loadEnvFile('.env');
} catch {
  // no .env — the environment may provide the variables
}
try {
  process.loadEnvFile('.env.local');
} catch {
  // no .env.local — nothing to override
}

const PLACEHOLDER = 'ci-placeholder';
const enabled = Boolean(
  process.env.DATABASE_URL &&
  process.env.PAYLOAD_SECRET &&
  process.env.PAYLOAD_SECRET !== PLACEHOLDER,
);

const config = enabled ? (await import('../payload.config')).default : null;

let sequence = 0;
const uniqueEmail = () => `cp21-test-${Date.now()}-${sequence++}@example.invalid`;

describe.skipIf(!enabled)('invite-only staff accounts (CP-2.1)', () => {
  let payload: Payload;
  const createdIds: (number | string)[] = [];

  const randomPassword = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}-password`;

  const createTestUser = async (data: Record<string, unknown> = {}) => {
    const user = await payload.create({
      collection: 'users',
      data: { email: uniqueEmail(), roles: ['editor'], password: randomPassword(), ...data },
      overrideAccess: true,
      context: { [FIRST_USER_BOOTSTRAP_CONTEXT]: true },
    });
    createdIds.push(user.id);
    return user;
  };

  beforeAll(async () => {
    if (!config) throw new Error('integration test enabled but config failed to load');
    payload = await getPayload({ config });
  }, 120_000);

  afterAll(async () => {
    if (!payload) return;
    for (const id of createdIds) {
      await payload
        .delete({ collection: 'users', id, overrideAccess: true })
        .catch(() => undefined);
    }
    await payload.destroy();
  });

  it('rejects the Payload first-register path: unauthenticated create bypassing access control', async () => {
    // `registerFirstUserOperation` calls payload.create({ overrideAccess: true }),
    // so this is exactly the request a stranger would reach.
    await expect(
      payload.create({
        collection: 'users',
        data: { email: uniqueEmail(), roles: ['super-admin'] },
        overrideAccess: true,
      }),
    ).rejects.toThrow();
  });

  it('rejects a user created by an anonymous caller without access bypass', async () => {
    await expect(
      payload.create({
        collection: 'users',
        data: { email: uniqueEmail(), roles: ['editor'] },
        overrideAccess: false,
      }),
    ).rejects.toThrow();
  });

  it('lets the explicit bootstrap context create the first Super Admin', async () => {
    const email = uniqueEmail();
    const user = await payload.create({
      collection: 'users',
      data: { email, roles: ['editor'], password: randomPassword() },
      overrideAccess: true,
      context: { [FIRST_USER_BOOTSTRAP_CONTEXT]: true },
    });
    createdIds.push(user.id);

    expect(user.email).toBe(email);
    // The bootstrap hook forces the role: an unauthenticated create cannot
    // choose its own privileges.
    expect(user.roles).toEqual(['super-admin']);
  });

  it('issues a single-use 24-hour invite that can set a password', async () => {
    const user = await createTestUser();
    const invite = await sendStaffInvite({ payload, email: user.email });

    expect(invite).not.toBeNull();
    const token = decodeURIComponent(invite!.url.split('/').pop() ?? '');
    expect(token.length).toBeGreaterThan(20);

    const invited = await payload.findByID({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
      showHiddenFields: true,
    });
    expect(invited.resetPasswordToken).toBe(token);
    const expiration = new Date(invited.resetPasswordExpiration ?? 0).getTime();
    const remainingHours = (expiration - Date.now()) / (60 * 60 * 1000);
    expect(remainingHours).toBeGreaterThan(23);
    expect(remainingHours).toBeLessThanOrEqual(24);

    const password = 'a-long-invite-test-password';
    await payload.resetPassword({
      collection: 'users',
      data: { token, password },
      overrideAccess: true,
    });

    // One-time: the same token cannot be replayed.
    await expect(
      payload.resetPassword({
        collection: 'users',
        data: { token, password: 'another-long-password' },
        overrideAccess: true,
      }),
    ).rejects.toThrow();

    await expect(
      payload.login({ collection: 'users', data: { email: user.email, password } }),
    ).resolves.toMatchObject({ user: { email: user.email } });
  }, 120_000);

  it('discards the password typed by a Super Admin and keeps the account invite-only', async () => {
    const superAdmin = await createTestUser();
    const email = uniqueEmail();
    const knownPassword = 'typed-by-the-super-admin';

    const invited = await payload.create({
      collection: 'users',
      data: { email, roles: ['editor'], password: knownPassword },
      // CP-2.2: a staff actor must have enrolled before using the data API.
      user: { ...superAdmin, totp: { enabled: true } },
      overrideAccess: false,
    });
    createdIds.push(invited.id);

    const refreshed = await payload.findByID({
      collection: 'users',
      id: invited.id,
      overrideAccess: true,
      showHiddenFields: true,
    });
    expect(refreshed.resetPasswordToken).toBeTruthy();
    await expect(
      payload.login({ collection: 'users', data: { email, password: knownPassword } }),
    ).rejects.toThrow();
  }, 120_000);

  it('locks the account after five failed logins, not before', async () => {
    const password = 'correct-horse-battery-staple';
    const user = await createTestUser({ password });

    for (let attempt = 0; attempt < 4; attempt += 1) {
      await expect(
        payload.login({
          collection: 'users',
          data: { email: user.email, password: 'wrong-password' },
        }),
      ).rejects.toThrow();
    }

    // Four failures: the correct password still works.
    await expect(
      payload.login({ collection: 'users', data: { email: user.email, password } }),
    ).resolves.toMatchObject({ user: { email: user.email } });

    for (let attempt = 0; attempt < 4; attempt += 1) {
      await expect(
        payload.login({
          collection: 'users',
          data: { email: user.email, password: 'wrong-password' },
        }),
      ).rejects.toThrow();
    }
    await expect(
      payload.login({
        collection: 'users',
        data: { email: user.email, password: 'wrong-password' },
      }),
    ).rejects.toThrow();

    // Fifth failure in the window: even the correct password is refused.
    await expect(
      payload.login({ collection: 'users', data: { email: user.email, password } }),
    ).rejects.toThrow(/lock/i);
  }, 120_000);
});
