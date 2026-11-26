import type { Payload } from 'payload';

import { TEXT_LIMITS } from '../cms/limits';
import { slugError } from '../cms/slugs';
import { DISCOUNT_PROBLEMS, discountProblem, type DiscountInput } from '../lib/pricing';
import type { Product, User } from '../payload-types';
import { CsvError, parseCsvRecords, serializeCsv } from './csv';

/**
 * Product CSV import and export (CP-5.4, docs/API.md §4).
 *
 * One row per pack, grouped by `slug`: a price list is the thing staff actually
 * edit, and it keeps the format readable in a spreadsheet. Discount and product
 * settings repeat on every row of a product and must agree. Export is
 * formula-injection safe; import is validated in full before anything is
 * written, so a single bad row blocks the whole file rather than applying half
 * a new price list.
 */

export const PRODUCT_CSV_COLUMNS = [
  'slug',
  'title',
  'pack_label',
  'pack_sku',
  'rate',
  'stock_status',
  'discount_type',
  'discount_value',
  'discount_starts',
  'discount_ends',
  'featured',
  'status',
] as const;

/** Request caps (enforced by the route as well). */
export const CSV_MAX_BYTES = 1024 * 1024;
export const CSV_MAX_ROWS = 500;

const STOCK_STATUSES = ['in_stock', 'low', 'out', 'preorder'] as const;
type StockStatus = (typeof STOCK_STATUSES)[number];

const DISCOUNT_TYPES = ['percent', 'fixed'] as const;
type DiscountType = (typeof DISCOUNT_TYPES)[number];

export type ParsedDiscount = {
  type: DiscountType;
  value: number;
  startsAt?: string;
  endsAt?: string;
};

export type PlannedProduct = {
  slug: string;
  /** Empty when the export/import only updates an existing product. */
  title: string | null;
  featured: boolean;
  /** `null` keeps the current status on update. */
  status: 'draft' | 'published' | null;
  packs: {
    label: string;
    sku?: string;
    rate: number;
    stockStatus: StockStatus;
  }[];
  discount: ParsedDiscount | null;
};

export type ImportRowResult = {
  row: number;
  slug: string;
  packLabel: string;
  action: 'create' | 'update';
  errors: string[];
};

export type ImportPlan = {
  valid: boolean;
  totalRows: number;
  /** Products that would be created (one product can span several rows). */
  creates: number;
  /** Products that would be updated. */
  updates: number;
  rows: ImportRowResult[];
  products: PlannedProduct[];
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isDateOnly(value: string): boolean {
  if (!datePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function parseInteger(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value : null;
}

function parseBoolean(raw: string): boolean | null {
  const value = raw.toLowerCase();
  if (!value) return false;
  if (['true', '1', 'yes'].includes(value)) return true;
  if (['false', '0', 'no'].includes(value)) return false;
  return null;
}

/** One product's pack and settings, before cross-row checks. */
type Draft = {
  row: number;
  slug: string;
  title: string;
  featured: boolean;
  status: 'draft' | 'published' | null;
  discount: ParsedDiscount | null;
  pack: PlannedProduct['packs'][number] | null;
  errors: string[];
};

function parseRow(values: Record<string, string>, rowNumber: number): Draft {
  const errors: string[] = [];
  const slug = values.slug ?? '';
  const slugProblem = slugError(slug);
  if (slugProblem) errors.push(slugProblem);

  const title = values.title ?? '';
  if (title.length > TEXT_LIMITS.headline) {
    errors.push(`Title must be ${TEXT_LIMITS.headline} characters or fewer.`);
  }

  const label = values.pack_label ?? '';
  if (!label) errors.push('Pack label is required.');
  else if (label.length > TEXT_LIMITS.listItem) {
    errors.push(`Pack label must be ${TEXT_LIMITS.listItem} characters or fewer.`);
  }

  const sku = values.pack_sku ?? '';
  if (sku.length > TEXT_LIMITS.slug) {
    errors.push(`SKU must be ${TEXT_LIMITS.slug} characters or fewer.`);
  }

  const rawRate = values.rate ?? '';
  const rate = parseInteger(rawRate);
  if (rate === null) errors.push('Rate must be a whole number of rupees.');

  const rawStock = (values.stock_status ?? '').toLowerCase();
  const stockStatus = (rawStock || 'in_stock') as StockStatus;
  if (!STOCK_STATUSES.includes(stockStatus)) {
    errors.push(`Stock status must be one of: ${STOCK_STATUSES.join(', ')}.`);
  }

  const rawType = (values.discount_type ?? '').toLowerCase();
  const rawValue = values.discount_value ?? '';
  const startsAt = values.discount_starts ?? '';
  const endsAt = values.discount_ends ?? '';
  let discount: ParsedDiscount | null = null;

  if (rawType && !DISCOUNT_TYPES.includes(rawType as DiscountType)) {
    errors.push('Discount type must be "percent" or "fixed".');
  } else if (!rawType && rawValue) {
    errors.push('A discount value needs a discount type.');
  } else if (rawType && !rawValue) {
    errors.push('A discount type needs a value.');
  } else if (rawType && rawValue) {
    const value = parseInteger(rawValue);
    if (value === null) errors.push('Discount value must be a whole number.');
    else {
      discount = { type: rawType as DiscountType, value };
      if (startsAt) {
        if (!isDateOnly(startsAt)) errors.push('Discount start must be a YYYY-MM-DD date.');
        else discount.startsAt = startsAt;
      }
      if (endsAt) {
        if (!isDateOnly(endsAt)) errors.push('Discount end must be a YYYY-MM-DD date.');
        else discount.endsAt = endsAt;
      }
      if (discount.startsAt && discount.endsAt && discount.endsAt < discount.startsAt) {
        errors.push('Discount end date cannot be before the start date.');
      }
    }
  } else if (startsAt || endsAt) {
    errors.push('Discount dates need a discount type and value.');
  }

  const featured = parseBoolean(values.featured ?? '');
  if (featured === null) errors.push('Featured must be true or false.');

  const rawStatus = (values.status ?? '').toLowerCase();
  if (rawStatus && rawStatus !== 'draft' && rawStatus !== 'published') {
    errors.push('Status must be "draft" or "published".');
  }

  return {
    row: rowNumber,
    slug,
    title,
    featured: featured ?? false,
    status: (rawStatus || null) as 'draft' | 'published' | null,
    discount,
    pack:
      label && rate !== null && STOCK_STATUSES.includes(stockStatus)
        ? { label, ...(sku ? { sku } : {}), rate, stockStatus }
        : null,
    errors,
  };
}

/** Validate a CSV completely. Never writes; safe for the dry-run preview. */
export function planProductImport(input: string, existingSlugs: ReadonlySet<string>): ImportPlan {
  const records = parseCsvRecords(input, ['slug', 'title', 'pack_label', 'rate']);
  if (records.length === 0) throw new CsvError('The file has no data rows.');
  if (records.length > CSV_MAX_ROWS) {
    throw new CsvError(`A file may contain at most ${CSV_MAX_ROWS} rows.`);
  }

  const drafts = records.map((record) => parseRow(record.values, record.rowNumber));

  // Group by slug; settings must agree across every row of one product.
  const groups = new Map<string, Draft[]>();
  for (const draft of drafts) {
    const key = draft.slug.trim();
    if (!key) continue;
    const group = groups.get(key) ?? [];
    group.push(draft);
    groups.set(key, group);
  }

  for (const [slug, group] of groups) {
    const first = group[0];
    const create = !existingSlugs.has(slug);

    if (create && !first.title.trim()) {
      first.errors.push('Title is required for a new product.');
    }

    for (const draft of group.slice(1)) {
      if (draft.title.trim() !== first.title.trim()) {
        draft.errors.push(`Title conflicts with row ${first.row} for the same product.`);
      }
      if (draft.featured !== first.featured) {
        draft.errors.push(`Featured conflicts with row ${first.row} for the same product.`);
      }
      if (draft.status !== first.status) {
        draft.errors.push(`Status conflicts with row ${first.row} for the same product.`);
      }
      if (JSON.stringify(draft.discount) !== JSON.stringify(first.discount)) {
        draft.errors.push(`Discount conflicts with row ${first.row} for the same product.`);
      }
    }

    const seenSkus = new Set<string>();
    const seenLabels = new Set<string>();
    for (const draft of group) {
      const sku = draft.pack?.sku;
      if (sku && seenSkus.has(sku)) {
        draft.errors.push(`SKU "${sku}" appears more than once for this product.`);
      }
      if (sku) seenSkus.add(sku);

      const label = draft.pack?.label;
      if (label && seenLabels.has(label)) {
        draft.errors.push(`Pack label "${label}" appears more than once for this product.`);
      }
      if (label) seenLabels.add(label);
    }

    const rates = group.flatMap((draft) => (draft.pack ? [draft.pack.rate] : []));
    const problem = discountProblem(first.discount as DiscountInput | null, rates);
    if (problem) first.errors.push(DISCOUNT_PROBLEMS[problem]);
  }

  const rows: ImportRowResult[] = drafts.map((draft) => ({
    row: draft.row,
    slug: draft.slug,
    packLabel: draft.pack?.label ?? '',
    action: existingSlugs.has(draft.slug) ? 'update' : 'create',
    errors: draft.errors,
  }));

  const valid = rows.every((row) => row.errors.length === 0);
  const creates = [...groups.keys()].filter((slug) => !existingSlugs.has(slug)).length;
  const products: PlannedProduct[] = valid
    ? [...groups.entries()].map(([slug, group]) => ({
        slug,
        title: group[0].title.trim() || null,
        featured: group[0].featured,
        status: group[0].status,
        packs: group.flatMap((draft) => (draft.pack ? [draft.pack] : [])),
        discount: group[0].discount,
      }))
    : [];

  return {
    valid,
    totalRows: rows.length,
    creates,
    updates: groups.size - creates,
    rows,
    products,
  };
}

/** One row per pack of every product, with a formula-safe writer. */
export function exportProductsCsv(products: Product[]): string {
  const rows = products.flatMap((product) => {
    // The group's select has a default of "percent", so a product with no
    // discount still stores that type. Only a real value makes it a discount.
    const hasDiscount = typeof product.discount?.value === 'number';

    return (product.packSizes ?? []).map((pack) => [
      product.slug,
      product.title,
      pack.label,
      pack.sku ?? '',
      pack.rate,
      pack.stockStatus ?? 'in_stock',
      hasDiscount ? (product.discount?.type ?? '') : '',
      hasDiscount ? product.discount?.value : '',
      hasDiscount ? (product.discount?.startsAt ?? '').slice(0, 10) : '',
      hasDiscount ? (product.discount?.endsAt ?? '').slice(0, 10) : '',
      product.featured ? 'true' : 'false',
      product._status ?? 'draft',
    ]);
  });

  return serializeCsv(PRODUCT_CSV_COLUMNS, rows);
}

/**
 * Apply a fully valid plan. Products are matched by slug, so an import updates
 * existing prices instead of duplicating them. Existing published products stay
 * published unless the file sets a status, which lets the products hook write
 * `price-history` and the `price_change` audit entry.
 */
export async function applyProductImport({
  payload,
  plan,
  user,
}: {
  payload: Payload;
  plan: ImportPlan;
  user: User;
}): Promise<{ created: number; updated: number }> {
  if (!plan.valid) throw new CsvError('The file has validation errors.');

  let created = 0;
  let updated = 0;

  for (const product of plan.products) {
    const existing = await payload.find({
      collection: 'products',
      where: { slug: { equals: product.slug } },
      depth: 0,
      limit: 1,
      pagination: false,
      overrideAccess: false,
      user,
    });

    const discount = product.discount ?? {
      type: null,
      value: null,
      startsAt: null,
      endsAt: null,
    };

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'products',
        id: existing.docs[0]!.id,
        data: {
          ...(product.title ? { title: product.title } : {}),
          packSizes: product.packs,
          discount: discount as Product['discount'],
          featured: product.featured,
          ...(product.status ? { _status: product.status } : {}),
        },
        context: { priceHistorySource: 'csv' },
        user,
        overrideAccess: false,
      });
      updated += 1;
    } else {
      await payload.create({
        collection: 'products',
        data: {
          slug: product.slug,
          title: product.title ?? product.slug,
          packSizes: product.packs,
          discount: discount as Product['discount'],
          featured: product.featured,
          _status: product.status ?? 'draft',
        },
        context: { priceHistorySource: 'csv' },
        user,
        overrideAccess: false,
      });
      created += 1;
    }
  }

  return { created, updated };
}
