import { describe, expect, it } from 'vitest';

import type { Product } from '../payload-types';
import { CsvError } from './csv';
import {
  CSV_MAX_ROWS,
  exportProductsCsv,
  PRODUCT_CSV_COLUMNS,
  planProductImport,
} from './products';

type Column = (typeof PRODUCT_CSV_COLUMNS)[number];

const header = PRODUCT_CSV_COLUMNS.join(',');

function row(values: Partial<Record<Column, string>>): string {
  return PRODUCT_CSV_COLUMNS.map((column) => values[column] ?? '').join(',');
}

function csv(...rows: string[]): string {
  return [header, ...rows].join('\n');
}

const base = {
  slug: 'ant-gel',
  title: 'Ant gel',
  pack_label: '500 ml',
  pack_sku: 'AG-500',
  rate: '900',
  stock_status: 'in_stock',
  featured: 'false',
} satisfies Partial<Record<Column, string>>;

describe('planProductImport', () => {
  it('groups rows into one new product with its packs', () => {
    const plan = planProductImport(
      csv(row(base), row({ ...base, pack_label: '1 litre', pack_sku: 'AG-1000', rate: '1500' })),
      new Set(),
    );

    expect(plan.valid).toBe(true);
    expect(plan.totalRows).toBe(2);
    expect(plan.creates).toBe(1);
    expect(plan.updates).toBe(0);
    expect(plan.products).toEqual([
      {
        slug: 'ant-gel',
        title: 'Ant gel',
        featured: false,
        status: null,
        discount: null,
        packs: [
          { label: '500 ml', sku: 'AG-500', rate: 900, stockStatus: 'in_stock' },
          { label: '1 litre', sku: 'AG-1000', rate: 1500, stockStatus: 'in_stock' },
        ],
      },
    ]);
  });

  it('updates an existing product without requiring a title', () => {
    const plan = planProductImport(
      csv(row({ ...base, title: '', rate: '950' })),
      new Set(['ant-gel']),
    );

    expect(plan.valid).toBe(true);
    expect(plan.updates).toBe(1);
    expect(plan.rows[0]?.action).toBe('update');
  });

  it('requires a title for a new product', () => {
    const plan = planProductImport(csv(row({ ...base, title: '' })), new Set());

    expect(plan.valid).toBe(false);
    expect(plan.products).toEqual([]);
    expect(plan.rows[0]?.errors.join(' ')).toMatch(/Title is required/);
  });

  it('reports bad rates, stock, booleans and statuses per row', () => {
    const plan = planProductImport(
      csv(
        row({ ...base, rate: '9.5' }),
        row({ ...base, stock_status: 'plenty' }),
        row({ ...base, featured: 'maybe' }),
        row({ ...base, status: 'live' }),
      ),
      new Set(),
    );

    expect(plan.valid).toBe(false);
    expect(plan.rows[0]?.errors).toContain('Rate must be a whole number of rupees.');
    expect(plan.rows[1]?.errors.join(' ')).toMatch(/Stock status must be one of/);
    expect(plan.rows[2]?.errors).toContain('Featured must be true or false.');
    expect(plan.rows[3]?.errors).toContain('Status must be "draft" or "published".');
  });

  it('applies the shared discount rules', () => {
    const fixedTooHigh = planProductImport(
      csv(row({ ...base, discount_type: 'fixed', discount_value: '900' })),
      new Set(),
    );
    expect(fixedTooHigh.rows[0]?.errors.join(' ')).toMatch(/lower than the cheapest/);

    const missingValue = planProductImport(
      csv(row({ ...base, discount_type: 'percent' })),
      new Set(),
    );
    expect(missingValue.rows[0]?.errors.join(' ')).toMatch(/needs a value/);

    const badDates = planProductImport(
      csv(
        row({
          ...base,
          discount_type: 'percent',
          discount_value: '10',
          discount_starts: '2026-12-10',
          discount_ends: '2026-12-01',
        }),
      ),
      new Set(),
    );
    expect(badDates.rows[0]?.errors.join(' ')).toMatch(/cannot be before/);

    const valid = planProductImport(
      csv(
        row({
          ...base,
          discount_type: 'percent',
          discount_value: '10',
          discount_starts: '2026-12-01',
          discount_ends: '2026-12-31',
        }),
      ),
      new Set(),
    );
    expect(valid.valid).toBe(true);
    expect(valid.products[0]?.discount).toEqual({
      type: 'percent',
      value: 10,
      startsAt: '2026-12-01',
      endsAt: '2026-12-31',
    });
  });

  it('rejects settings that disagree across rows of one product', () => {
    const plan = planProductImport(
      csv(
        row({ ...base, discount_type: 'percent', discount_value: '10' }),
        row({
          ...base,
          pack_label: '1 litre',
          pack_sku: 'AG-1000',
          discount_type: 'percent',
          discount_value: '20',
        }),
      ),
      new Set(),
    );

    expect(plan.valid).toBe(false);
    expect(plan.rows[1]?.errors.join(' ')).toMatch(/Discount conflicts with row 2/);
  });

  it('rejects duplicate pack SKUs and labels', () => {
    const plan = planProductImport(
      csv(row(base), row({ ...base, pack_label: '500 ml' })),
      new Set(),
    );

    expect(plan.valid).toBe(false);
    expect(plan.rows[1]?.errors.join(' ')).toMatch(/appears more than once/);
  });

  it('caps the number of rows', () => {
    const rows = Array.from({ length: CSV_MAX_ROWS + 1 }, (_, index) =>
      row({ ...base, slug: `product-${index}` }),
    );

    expect(() => planProductImport(csv(...rows), new Set())).toThrow(CsvError);
  });
});

describe('exportProductsCsv', () => {
  const product = {
    id: 1,
    title: '=HYPERLINK("http://example.com")',
    slug: 'ant-gel',
    featured: true,
    _status: 'published',
    packSizes: [
      { id: 'a', label: '500 ml', sku: 'AG-500', rate: 900, stockStatus: 'in_stock' },
      { id: 'b', label: '1 litre', sku: 'AG-1000', rate: '1500', stockStatus: 'low' },
    ],
    discount: { type: 'percent', value: 10, startsAt: '2026-12-01T00:00:00.000Z' },
  } as unknown as Product;

  it('round-trips through the import planner', () => {
    const plan = planProductImport(exportProductsCsv([product]), new Set(['ant-gel']));

    expect(plan.rows.flatMap((row) => row.errors)).toEqual([]);
    expect(plan.valid).toBe(true);
  });

  it('writes one formula-safe row per pack with ISO dates reduced to a day', () => {
    const lines = exportProductsCsv([product]).trimEnd().split('\r\n');

    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe(header);
    expect(lines[1]).toContain(`"'=HYPERLINK(""http://example.com"")"`);
    expect(lines[1]).toContain('900,in_stock,percent,10,2026-12-01,,true,published');
    expect(lines[2]).toContain('1500,low,percent,10,2026-12-01,,true,published');
  });
});
