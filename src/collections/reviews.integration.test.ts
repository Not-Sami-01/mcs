import { getPayload, type Payload } from 'payload';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { FIRST_USER_BOOTSTRAP_CONTEXT } from '../access/first-user';

try {
  process.loadEnvFile('.env');
} catch {}
try {
  process.loadEnvFile('.env.local');
} catch {}

const enabled = Boolean(process.env.DATABASE_URL && process.env.PAYLOAD_SECRET);
const config = enabled ? (await import('../payload.config')).default : null;

describe.skipIf(!enabled)('reviews (CP-5.5)', () => {
  let payload: Payload;
  let superAdmin: { id: number };
  let editor: { id: number };
  let sales: { id: number };
  const reviewIds: number[] = [];

  const stamp = Date.now();
  const review = (verified: boolean, name: string) => ({
    reviewerName: name,
    city: 'Lahore',
    text: `Test review ${stamp} ${name}.`,
    rating: 5,
    source: 'direct' as const,
    reviewDate: new Date().toISOString(),
    permissionConfirmed: true,
    verified,
  });

  beforeAll(async () => {
    if (!config) throw new Error('integration test enabled but config failed to load');
    payload = await getPayload({ config });

    superAdmin = await payload.create({
      collection: 'users',
      data: {
        email: `cp55-admin-${stamp}@example.com`,
        password: `cp55-admin-${stamp}-password`,
        roles: ['super-admin'],
      },
      overrideAccess: true,
      context: { [FIRST_USER_BOOTSTRAP_CONTEXT]: true },
    });

    editor = await payload.create({
      collection: 'users',
      data: {
        email: `cp55-editor-${stamp}@example.com`,
        password: `cp55-editor-${stamp}-password`,
        roles: ['editor'],
      },
      user: superAdmin,
      overrideAccess: false,
    });

    sales = await payload.create({
      collection: 'users',
      data: {
        email: `cp55-sales-${stamp}@example.com`,
        password: `cp55-sales-${stamp}-password`,
        roles: ['sales-support'],
      },
      user: superAdmin,
      overrideAccess: false,
    });

    for (const [verified, name] of [
      [true, `verified-${stamp}`],
      [true, `verified-two-${stamp}`],
      [false, `unverified-${stamp}`],
    ] as const) {
      const doc = await payload.create({
        collection: 'reviews',
        data: review(verified, name),
        user: editor,
        overrideAccess: false,
      });
      reviewIds.push(doc.id);
    }
  }, 120_000);

  afterAll(async () => {
    if (!payload) return;
    for (const id of reviewIds) {
      await payload.delete({ collection: 'reviews', id, overrideAccess: true }).catch(() => {});
    }
    for (const user of [editor, sales, superAdmin]) {
      if (user) {
        await payload
          .delete({ collection: 'users', id: user.id, overrideAccess: true })
          .catch(() => {});
      }
    }
    await payload.destroy();
  });

  it('shows only verified reviews to anonymous readers', async () => {
    const anon = await payload.find({
      collection: 'reviews',
      where: { text: { like: `Test review ${stamp}` } },
      overrideAccess: false,
    });

    expect(anon.docs).toHaveLength(2);
    expect(anon.docs.every((doc) => doc.verified === true)).toBe(true);
  });

  it('lets every staff role read both verified and unverified reviews', async () => {
    for (const user of [editor, sales]) {
      const result = await payload.find({
        collection: 'reviews',
        where: { text: { like: `Test review ${stamp}` } },
        user,
        overrideAccess: false,
      });
      expect(result.docs).toHaveLength(3);
    }
  });

  it('keeps writes with Super Admin and Editor only', async () => {
    for (const user of [sales]) {
      await expect(
        payload.create({
          collection: 'reviews',
          data: review(false, `denied-${stamp}`),
          user,
          overrideAccess: false,
        }),
      ).rejects.toThrow();
    }

    const byEditor = await payload.update({
      collection: 'reviews',
      id: reviewIds[0],
      data: { verified: false },
      user: editor,
      overrideAccess: false,
    });
    expect(byEditor.verified).toBe(false);

    const bySuperAdmin = await payload.update({
      collection: 'reviews',
      id: reviewIds[0],
      data: { verified: true },
      user: superAdmin,
      overrideAccess: false,
    });
    expect(bySuperAdmin.verified).toBe(true);
  });
});
