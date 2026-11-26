import { getPayload, type Payload } from 'payload';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { FIRST_USER_BOOTSTRAP_CONTEXT } from '../access/first-user';
import type { User } from '../payload-types';
import { applyProductImport, exportProductsCsv, planProductImport } from './products';
import { CsvError } from './csv';

try {
  process.loadEnvFile('.env');
} catch {}
try {
  process.loadEnvFile('.env.local');
} catch {}

const enabled = Boolean(process.env.DATABASE_URL && process.env.PAYLOAD_SECRET);
const config = enabled ? (await import('../payload.config')).default : null;

describe.skipIf(!enabled)('product CSV import (CP-5.4)', () => {
  let payload: Payload;
  let manager: User;
  let superAdmin: User;
  let productId: number;

  const stamp = Date.now();
  const slug = `cp54-export-${stamp}`;
  const newSlug = `cp54-new-${stamp}`;

  beforeAll(async () => {
    if (!config) throw new Error('integration test enabled but config failed to load');
    payload = await getPayload({ config });

    superAdmin = await payload.create({
      collection: 'users',
      data: {
        email: `cp54-admin-${stamp}@example.com`,
        password: `cp54-admin-${stamp}-password`,
        roles: ['super-admin'],
      },
      overrideAccess: true,
      context: { [FIRST_USER_BOOTSTRAP_CONTEXT]: true },
    });

    manager = await payload.create({
      collection: 'users',
      data: {
        email: `cp54-manager-${stamp}@example.com`,
        password: `cp54-manager-${stamp}-password`,
        roles: ['product-manager'],
      },
      user: superAdmin,
      overrideAccess: false,
    });

    const product = await payload.create({
      collection: 'products',
      data: {
        title: `CP-5.4 product ${stamp}`,
        slug,
        packSizes: [
          { label: '500 ml', sku: 'CP54-A', rate: 1000, stockStatus: 'in_stock' },
          { label: '1 litre', sku: 'CP54-B', rate: 1800, stockStatus: 'in_stock' },
        ],
        _status: 'published',
      },
      user: manager,
      overrideAccess: false,
    });
    productId = product.id;
  }, 120_000);

  afterAll(async () => {
    if (!payload) return;

    const { docs: products } = await payload.find({
      collection: 'products',
      where: { slug: { in: [slug, newSlug] } },
      pagination: false,
      overrideAccess: true,
    });

    for (const product of products) {
      const { docs: history } = await payload.find({
        collection: 'price-history',
        where: { product: { equals: product.id } },
        pagination: false,
        overrideAccess: true,
      });
      for (const entry of history) {
        await payload
          .delete({ collection: 'price-history', id: entry.id, overrideAccess: true })
          .catch(() => {});
      }
      await payload
        .delete({ collection: 'products', id: product.id, overrideAccess: true })
        .catch(() => {});
    }

    for (const user of [manager, superAdmin]) {
      if (user) {
        await payload
          .delete({ collection: 'users', id: user.id, overrideAccess: true })
          .catch(() => {});
      }
    }

    await payload.destroy();
  });

  it('exports a published product and imports a rate change into price history', async () => {
    const { docs } = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      depth: 0,
      overrideAccess: true,
    });

    const exported = exportProductsCsv(docs);
    expect(exported).toContain('CP54-A');
    expect(exported).toContain(',1000,');

    const edited = exported.replace(',1000,', ',1200,');
    const existing = new Set([slug]);
    const plan = planProductImport(edited, existing);
    expect(plan.rows.flatMap((row) => row.errors)).toEqual([]);
    expect(plan.valid).toBe(true);
    expect(plan.updates).toBe(1);

    const result = await applyProductImport({ payload, plan, user: manager });
    expect(result).toEqual({ created: 0, updated: 1 });

    const updated = await payload.findByID({
      collection: 'products',
      id: productId,
      depth: 0,
      overrideAccess: true,
    });
    expect(updated.packSizes?.map((pack) => pack.rate)).toEqual([1200, 1800]);
    expect(updated._status).toBe('published');

    const history = await payload.find({
      collection: 'price-history',
      where: { product: { equals: productId } },
      pagination: false,
      overrideAccess: true,
    });
    const changed = history.docs.find((entry) => entry.oldRate === 1000);
    expect(changed).toMatchObject({ newRate: 1200, source: 'csv' });
  });

  it('creates a new product from CSV as a draft', async () => {
    const csv = [
      'slug,title,pack_label,pack_sku,rate,stock_status,discount_type,discount_value,discount_starts,discount_ends,featured,status',
      `${newSlug},Imported product,Pack A,${newSlug}-A,750,in_stock,,,,,false,draft`,
      `${newSlug},Imported product,Pack B,${newSlug}-B,1350,low,,,,,false,draft`,
    ].join('\n');

    const plan = planProductImport(csv, new Set());
    expect(plan.valid).toBe(true);

    const result = await applyProductImport({ payload, plan, user: manager });
    expect(result).toEqual({ created: 1, updated: 0 });

    const { docs } = await payload.find({
      collection: 'products',
      where: { slug: { equals: newSlug } },
      depth: 0,
      overrideAccess: true,
    });
    expect(docs[0]?._status).toBe('draft');
    expect(docs[0]?.packSizes?.map((pack) => pack.rate)).toEqual([750, 1350]);
  });

  it('refuses to apply a plan with an invalid row', async () => {
    const csv = [
      'slug,title,pack_label,pack_sku,rate,stock_status,discount_type,discount_value,discount_starts,discount_ends,featured,status',
      `${newSlug},Imported product,Pack A,${newSlug}-A,seven,in_stock,,,,,false,draft`,
    ].join('\n');

    const plan = planProductImport(csv, new Set([newSlug]));
    expect(plan.valid).toBe(false);

    await expect(applyProductImport({ payload, plan, user: manager })).rejects.toThrow(CsvError);
  });
});
