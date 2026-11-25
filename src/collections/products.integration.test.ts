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

describe.skipIf(!enabled)('products and pricing (CP-5.3)', () => {
  let payload: Payload;
  let productId: number;
  let publishedProductId: number | null = null;
  let superAdmin: { id: number };
  let manager: { id: number };
  let editor: { id: number };
  let sales: { id: number };

  const stamp = Date.now();
  const draftSlug = `cp53-draft-${stamp}`;
  const publishedSlug = `cp53-published-${stamp}`;

  const pack = (label: string, sku: string, rate: number) => ({
    label,
    sku,
    rate,
    stockStatus: 'in_stock' as const,
  });

  const baseProduct = (slug: string, title: string) => ({
    title,
    slug,
    packSizes: [pack('500 ml', 'SKU-A', 1000), pack('1 litre', 'SKU-B', 1800)],
  });

  beforeAll(async () => {
    if (!config) throw new Error('integration test enabled but config failed to load');
    payload = await getPayload({ config });

    superAdmin = await payload.create({
      collection: 'users',
      data: {
        email: `cp53-admin-${stamp}@example.com`,
        password: `cp53-admin-${stamp}-password`,
        roles: ['super-admin'],
      },
      overrideAccess: true,
      context: { [FIRST_USER_BOOTSTRAP_CONTEXT]: true },
    });

    manager = await payload.create({
      collection: 'users',
      data: {
        email: `cp53-manager-${stamp}@example.com`,
        password: `cp53-manager-${stamp}-password`,
        roles: ['product-manager'],
      },
      user: superAdmin,
      overrideAccess: false,
    });

    editor = await payload.create({
      collection: 'users',
      data: {
        email: `cp53-editor-${stamp}@example.com`,
        password: `cp53-editor-${stamp}-password`,
        roles: ['editor'],
      },
      user: superAdmin,
      overrideAccess: false,
    });

    sales = await payload.create({
      collection: 'users',
      data: {
        email: `cp53-sales-${stamp}@example.com`,
        password: `cp53-sales-${stamp}-password`,
        roles: ['sales-support'],
      },
      user: superAdmin,
      overrideAccess: false,
    });

    const draft = await payload.create({
      collection: 'products',
      data: { ...baseProduct(draftSlug, `CP-5.3 draft ${stamp}`), _status: 'draft' },
      user: manager,
      overrideAccess: false,
    });
    productId = draft.id;
  }, 120_000);

  afterAll(async () => {
    if (!payload) return;
    for (const id of [productId, publishedProductId]) {
      if (id) {
        await payload.delete({ collection: 'products', id, overrideAccess: true }).catch(() => {});
      }
    }
    for (const user of [manager, editor, sales, superAdmin]) {
      if (user) {
        await payload
          .delete({ collection: 'users', id: user.id, overrideAccess: true })
          .catch(() => {});
      }
    }
    await payload.destroy();
  });

  it('keeps drafts out of public reads and lets every role read them', async () => {
    const { findPublishedProductBySlug } = await import('../cms/products');

    expect(await findPublishedProductBySlug(draftSlug)).toBeNull();

    const asEditor = await payload.find({
      collection: 'products',
      where: { slug: { equals: draftSlug } },
      user: editor,
      overrideAccess: false,
    });
    expect(asEditor.docs).toHaveLength(1);
  });

  it('denies editors and sales support the write access the matrix withholds', async () => {
    for (const user of [editor, sales]) {
      await expect(
        payload.create({
          collection: 'products',
          data: baseProduct(`cp53-denied-${stamp}-${user.id}`, 'Denied product'),
          user,
          overrideAccess: false,
        }),
      ).rejects.toThrow();
    }
  });

  it('validates percent, fixed and date rules on save', async () => {
    const attempt = (discount: Record<string, unknown>, slug: string) =>
      payload.create({
        collection: 'products',
        data: { ...baseProduct(slug, 'Discount rule fixture'), discount },
        user: manager,
        overrideAccess: false,
      });

    await expect(attempt({ type: 'percent', value: 95 }, `cp53-pct-${stamp}`)).rejects.toThrow(
      /between 1 and 90/,
    );
    await expect(attempt({ type: 'fixed', value: 1000 }, `cp53-fixed-${stamp}`)).rejects.toThrow(
      /lower than the cheapest/,
    );
    await expect(
      attempt(
        { type: 'percent', value: 10, startsAt: '2026-12-10', endsAt: '2026-12-01' },
        `cp53-dates-${stamp}`,
      ),
    ).rejects.toThrow(/cannot be before/);
  });

  it('records opening prices, then rate and discount changes in price history', async () => {
    const published = await payload.create({
      collection: 'products',
      data: {
        ...baseProduct(publishedSlug, `CP-5.3 published ${stamp}`),
        _status: 'published',
      },
      user: manager,
      overrideAccess: false,
    });
    publishedProductId = published.id;

    const history = async () =>
      payload.find({
        collection: 'price-history',
        where: { product: { equals: published.id } },
        sort: ['-changedAt'],
        limit: 50,
        overrideAccess: true,
      });

    const opening = await history();
    expect(opening.docs).toHaveLength(2);
    expect(opening.docs.map((row) => row.packSku).sort()).toEqual(['SKU-A', 'SKU-B']);
    expect(opening.docs.every((row) => row.oldRate === null && row.source === 'admin')).toBe(true);
    expect(opening.docs.find((row) => row.packSku === 'SKU-B')?.newRate).toBe(1800);

    await payload.update({
      collection: 'products',
      id: published.id,
      data: {
        packSizes: [pack('500 ml', 'SKU-A', 1200), pack('1 litre', 'SKU-B', 1800)],
      },
      user: manager,
      overrideAccess: false,
    });

    const afterRate = await history();
    expect(afterRate.docs).toHaveLength(3);
    expect(afterRate.docs.find((row) => row.oldRate === 1000)?.newRate).toBe(1200);

    // Saving the same values again must not add a row.
    await payload.update({
      collection: 'products',
      id: published.id,
      data: {
        packSizes: [pack('500 ml', 'SKU-A', 1200), pack('1 litre', 'SKU-B', 1800)],
      },
      user: manager,
      overrideAccess: false,
    });
    expect((await history()).docs).toHaveLength(3);

    await payload.update({
      collection: 'products',
      id: published.id,
      data: { discount: { type: 'percent', value: 10 } },
      user: manager,
      overrideAccess: false,
    });

    const afterDiscount = await history();
    expect(afterDiscount.docs).toHaveLength(5);
    expect(afterDiscount.docs.filter((row) => row.newDiscount !== null)).toHaveLength(2);

    const audits = await payload.find({
      collection: 'audit-logs',
      where: {
        and: [
          { action: { equals: 'price_change' } },
          { documentId: { equals: String(published.id) } },
        ],
      },
      overrideAccess: true,
    });
    expect(audits.totalDocs).toBe(3);

    const { findPublishedProductBySlug } = await import('../cms/products');
    const found = await findPublishedProductBySlug(publishedSlug);
    expect(found?.packSizes?.map((entry) => entry.rate)).toEqual([1200, 1800]);
    expect(found?.discount?.value).toBe(10);
  });

  it('keeps price history readable only to Super Admin and Product Manager', async () => {
    for (const user of [editor, sales]) {
      await expect(
        payload.find({ collection: 'price-history', user, overrideAccess: false }),
      ).rejects.toThrow();
    }
    await expect(
      payload.find({ collection: 'price-history', overrideAccess: false }),
    ).rejects.toThrow();

    await expect(
      payload.create({
        collection: 'price-history',
        data: {
          product: productId,
          packSku: 'SKU-A',
          newRate: 1,
          changedAt: new Date().toISOString(),
          source: 'admin',
        },
        user: superAdmin,
        overrideAccess: false,
      }),
    ).rejects.toThrow();
  });
});
