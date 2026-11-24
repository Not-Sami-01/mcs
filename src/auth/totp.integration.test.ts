import { TOTP } from 'otpauth';
import { getPayload, type Payload, type PayloadRequest } from 'payload';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { FIRST_USER_BOOTSTRAP_CONTEXT } from '../access/first-user';
import { getTOTPVerifiedCookieName } from '@purposeinplay/payload-totp/middleware';

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

const TOTP_KEY = process.env.TOTP_ENCRYPTION_KEY ?? '';
const enabled = Boolean(
  process.env.DATABASE_URL &&
  process.env.PAYLOAD_SECRET &&
  process.env.PAYLOAD_SECRET !== 'ci-placeholder' &&
  /^[0-9a-f]{64}$/.test(TOTP_KEY),
);

const config = enabled ? (await import('../payload.config')).default : null;

let sequence = 0;
const uniqueEmail = () => `cp22-test-${Date.now()}-${sequence++}@example.invalid`;
const PASSWORD = 'cp22-long-test-password-value';

type Json = Record<string, unknown>;

function cookieHeaders(token: string, extra?: string): Headers {
  // Payload rejects cookie auth without an Origin or Sec-Fetch-Site header when
  // a CSRF allowlist exists (docs/SECURITY.md C3). A browser sends the latter.
  return new Headers({
    cookie: `payload-token=${token}${extra ? `; ${extra}` : ''}`,
    'Sec-Fetch-Site': 'same-origin',
  });
}

function cookieValue(setCookies: string[], name: string): string | undefined {
  for (const raw of setCookies) {
    const pair = raw.split(';', 1)[0];
    const separator = pair.indexOf('=');
    if (separator === -1) continue;
    if (pair.slice(0, separator).trim() === name) {
      return decodeURIComponent(pair.slice(separator + 1).trim());
    }
  }
  return undefined;
}

describe.skipIf(!enabled)('two-factor login (CP-2.2)', () => {
  let payload: Payload;
  let admin: { id: number | string; email: string };
  let adminPasswordLoginToken: string;
  let adminVerifiedToken: string;
  let adminVerifiedCookie: string;
  let backupCodes: string[];

  const createdIds: (number | string)[] = [];

  const endpoint = (path: string) => {
    const registered = payload.collections.users.config.endpoints;
    const match = (Array.isArray(registered) ? registered : []).find(
      (candidate) => candidate.path === path,
    );
    if (!match) throw new Error(`users endpoint ${path} is not registered`);
    return match.handler as unknown as (req: PayloadRequest) => Promise<Response>;
  };

  const request = (url: string, headers: Headers, data?: Json) =>
    ({ payload, headers, data, url }) as unknown as PayloadRequest;

  const createUser = async (email: string) => {
    const user = await payload.create({
      collection: 'users',
      data: { email, roles: ['editor'], password: PASSWORD },
      overrideAccess: true,
      context: { [FIRST_USER_BOOTSTRAP_CONTEXT]: true },
    });
    createdIds.push(user.id);
    return user;
  };

  /** Runs the plugin's setup + verify endpoints and returns the fresh session cookies. */
  const enroll = async (email: string) => {
    const login = await payload.login({
      collection: 'users',
      data: { email, password: PASSWORD },
    });
    const firstToken = login.token;
    if (!firstToken) throw new Error('login did not return a token');

    const setup = await endpoint('/totp/setup')(
      request('http://localhost:3000/api/users/totp/setup', cookieHeaders(firstToken)),
    );
    expect(setup.status).toBe(200);
    const setupBody = (await setup.json()) as { manualEntryKey: string; qrCode: string };
    expect(setupBody.qrCode.startsWith('data:image/png')).toBe(true);

    const code = new TOTP({
      secret: setupBody.manualEntryKey,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    }).generate();

    const verify = await endpoint('/totp/verify')(
      request('http://localhost:3000/api/users/totp/verify', cookieHeaders(firstToken), {
        token: code,
      }),
    );
    expect(verify.status).toBe(200);
    const verifyBody = (await verify.json()) as { backupCodes: string[] };
    expect(verifyBody.backupCodes).toHaveLength(10);

    const setCookies = verify.headers.getSetCookie();
    const verifiedToken = cookieValue(setCookies, 'payload-token');
    const verifiedCookie = cookieValue(setCookies, getTOTPVerifiedCookieName());
    if (!verifiedToken || !verifiedCookie) {
      throw new Error('verification did not issue the rotated session cookies');
    }

    return { firstToken, verifiedToken, verifiedCookie, backupCodes: verifyBody.backupCodes };
  };

  beforeAll(async () => {
    if (!config) throw new Error('integration test enabled but config failed to load');
    payload = await getPayload({ config });

    const email = uniqueEmail();
    admin = await createUser(email);
    const enrolled = await enroll(email);
    adminPasswordLoginToken = enrolled.firstToken;
    adminVerifiedToken = enrolled.verifiedToken;
    adminVerifiedCookie = enrolled.verifiedCookie;
    backupCodes = enrolled.backupCodes;
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

  it('stores the TOTP secret encrypted at rest (never the base32 secret)', async () => {
    const fresh = await payload.findByID({
      collection: 'users',
      id: admin.id,
      overrideAccess: true,
      showHiddenFields: true,
    });

    expect(fresh.totp?.enabled).toBe(true);
    expect(fresh.totp?.secret).toBeTruthy();
    // The stored value is ciphertext, not the secret the QR code carried.
    expect(fresh.totp?.secret).not.toMatch(/^[A-Z2-7]{16,}$/);
    expect(fresh.totp?.backupCodes?.[0]?.hash).toBeTruthy();
    for (const code of backupCodes) {
      expect(fresh.totp?.backupCodes?.map((entry) => entry.hash)).not.toContain(code);
    }
  });

  it('rejects a password-only session on the data API (REST/GraphQL path)', async () => {
    const enforcementHooks = payload.collections.users.config.hooks?.beforeOperation ?? [];
    const enforcement = enforcementHooks[enforcementHooks.length - 1];
    expect(enforcement).toBeDefined();

    // The token issued by the password login, without the verified cookie:
    // this is exactly what a stolen password would carry.
    await expect(async () =>
      enforcement!({
        operation: 'find',
        overrideAccess: false,
        req: {
          payload,
          headers: cookieHeaders(adminPasswordLoginToken),
          user: { id: admin.id, totp: { enabled: true } },
        },
      } as never),
    ).rejects.toThrow();

    // The verified session passes.
    await expect(
      (async () =>
        enforcement!({
          operation: 'find',
          overrideAccess: false,
          req: {
            payload,
            headers: cookieHeaders(
              adminVerifiedToken,
              `${getTOTPVerifiedCookieName()}=${adminVerifiedCookie}`,
            ),
            user: { id: admin.id, totp: { enabled: true } },
          },
        } as never))(),
    ).resolves.toBeUndefined();
  });

  it('blocks data-API use until the account has enrolled', async () => {
    const unenrolled = await createUser(uniqueEmail());

    // Staff operations are refused while `totp.enabled` is false…
    await expect(
      payload.find({
        collection: 'users',
        limit: 1,
        user: unenrolled,
        overrideAccess: false,
      }),
    ).rejects.toThrow();

    // …but the login handshake still works, so setup remains reachable.
    await expect(
      payload.login({
        collection: 'users',
        data: { email: unenrolled.email, password: PASSWORD },
      }),
    ).resolves.toMatchObject({ user: { email: unenrolled.email } });

    // Trusted server code may still read with an explicit access bypass.
    await expect(
      payload.find({ collection: 'users', limit: 1, overrideAccess: true }),
    ).resolves.toBeDefined();
  });

  it('consumes a recovery code once', async () => {
    const validate = endpoint('/totp/validate');
    const headers = cookieHeaders(adminVerifiedToken);

    const first = await validate(
      request('http://localhost:3000/api/users/totp/validate', headers, {
        backupCode: backupCodes[0],
      }),
    );
    expect(first.status).toBe(200);

    const replay = await validate(
      request('http://localhost:3000/api/users/totp/validate', headers, {
        backupCode: backupCodes[0],
      }),
    );
    expect(replay.status).toBe(422);
  });

  it('lets a verified Super Admin re-enrol another staff member', async () => {
    const targetEmail = uniqueEmail();
    const target = await createUser(targetEmail);
    await enroll(targetEmail);

    const reenroll = endpoint('/totp/reenroll');
    const headersFor = (token: string, verified?: string) =>
      cookieHeaders(token, verified ? `${getTOTPVerifiedCookieName()}=${verified}` : undefined);

    // A first-factor-only session cannot reset anyone.
    const denied = await reenroll(
      request(
        'http://localhost:3000/api/users/totp/reenroll',
        headersFor(adminPasswordLoginToken),
        {
          email: targetEmail,
        },
      ),
    );
    expect(denied.status).toBe(403);

    const stillEnrolled = await payload.findByID({
      collection: 'users',
      id: target.id,
      overrideAccess: true,
      showHiddenFields: true,
    });
    expect(stillEnrolled.totp?.enabled).toBe(true);

    const allowed = await reenroll(
      request(
        'http://localhost:3000/api/users/totp/reenroll',
        headersFor(adminVerifiedToken, adminVerifiedCookie),
        { email: targetEmail },
      ),
    );
    expect(allowed.status).toBe(200);

    const cleared = await payload.findByID({
      collection: 'users',
      id: target.id,
      overrideAccess: true,
      showHiddenFields: true,
    });
    expect(cleared.totp?.enabled ?? false).toBe(false);
    expect(cleared.totp?.secret ?? '').toBe('');
    expect(cleared.totp?.backupCodes ?? []).toHaveLength(0);
  }, 120_000);
});
