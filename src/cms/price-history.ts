import type { PayloadRequest } from 'payload';

import { hashIp, writeAuditLog } from '../audit/log';
import { discountSnapshot, type DiscountInput } from '../lib/pricing';

/**
 * Writes a `price-history` entry for every pack whose rate, or the product's
 * discount, changed on a **published** save (CP-5.3, docs/DATABASE.md §2).
 *
 * Draft edits stay out of the history so the log matches the prices customers
 * could actually see; the publish save is the one that lands. A brand-new
 * published product records its opening rates with an empty `oldRate`.
 *
 * History is best-effort: a failure is logged and never blocks the product
 * save. The audit trail gets one `price_change` line per save, not per pack.
 */

type PackLike = {
  sku?: string | null;
  label?: string | null;
  rate?: number | null;
};

export type PriceHistoryProduct = {
  id: number;
  title?: string | null;
  _status?: string | null;
  packSizes?: PackLike[] | null;
  discount?: DiscountInput | null;
};

function packKey(pack: PackLike, index: number): string {
  const sku = pack.sku?.trim();
  if (sku) return sku;
  const label = pack.label?.trim();
  if (label) return label;
  return `pack-${index + 1}`;
}

export async function recordPriceChanges({
  doc,
  previousDoc,
  req,
}: {
  doc: PriceHistoryProduct;
  previousDoc?: PriceHistoryProduct | null;
  req: PayloadRequest;
}): Promise<void> {
  if (doc._status !== 'published') return;

  const newPacks = doc.packSizes ?? [];
  if (newPacks.length === 0) return;

  const oldPacks = previousDoc?.packSizes ?? [];
  const oldByKey = new Map(oldPacks.map((pack, index) => [packKey(pack, index), pack]));

  const source = req.context?.priceHistorySource === 'csv' ? ('csv' as const) : ('admin' as const);
  const oldDiscount = discountSnapshot(previousDoc?.discount);
  const newDiscount = discountSnapshot(doc.discount);
  const discountChanged = JSON.stringify(oldDiscount) !== JSON.stringify(newDiscount);

  const changes = newPacks.flatMap((pack, index) => {
    const old = oldByKey.get(packKey(pack, index));
    const rateChanged = !old || old.rate !== pack.rate;
    if (!rateChanged && !discountChanged) return [];

    return [
      {
        product: doc.id,
        packSku: packKey(pack, index),
        oldRate: typeof old?.rate === 'number' ? old.rate : null,
        newRate: typeof pack.rate === 'number' ? pack.rate : 0,
        oldDiscount,
        newDiscount,
        changedBy: req.user?.id ?? null,
        changedAt: new Date().toISOString(),
        source,
      },
    ];
  });

  if (changes.length === 0) return;

  try {
    for (const data of changes) {
      await req.payload.create({
        collection: 'price-history',
        data,
        overrideAccess: true,
        req,
      });
    }
  } catch (error) {
    req.payload.logger.error({ err: error, product: doc.id }, 'Could not write price history');
  }

  await writeAuditLog({
    payload: req.payload,
    req,
    action: 'price_change',
    collectionSlug: 'products',
    documentId: String(doc.id),
    actorId: req.user?.id,
    summary: `Price or discount changed on product #${doc.id} (${changes.length} pack${
      changes.length === 1 ? '' : 's'
    })`,
    ipHash: hashIp(req.headers),
  });
}
