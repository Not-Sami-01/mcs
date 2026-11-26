import { hashIp, writeAuditLog } from '@/audit/log';
import { exportProductsCsv } from '@/csv/products';
import { jsonResponse, productsCsvAccess } from '@/csv/session';
import { todayInKarachi } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

/**
 * `GET /api/staff/products/export` (docs/API.md §4).
 *
 * Every product, one row per pack. Super Admin and Product Manager only; the
 * export is audited and every cell is formula-injection safe.
 */
export async function GET(request: Request): Promise<Response> {
  const access = await productsCsvAccess(request);
  if (!access.ok) return jsonResponse({ ok: false, error: access.error }, access.status);

  const { docs } = await access.payload.find({
    collection: 'products',
    depth: 0,
    limit: 5000,
    pagination: false,
    sort: 'slug',
    overrideAccess: false,
    user: access.user,
  });

  await writeAuditLog({
    payload: access.payload,
    action: 'export',
    collectionSlug: 'products',
    actorId: access.user.id,
    summary: `Exported ${docs.length} products to CSV`,
    ipHash: hashIp(request.headers),
  });

  return new Response(exportProductsCsv(docs), {
    status: 200,
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="products-${todayInKarachi()}.csv"`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
