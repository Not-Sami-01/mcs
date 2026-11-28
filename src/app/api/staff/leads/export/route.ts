import { hashIp, writeAuditLog } from '@/audit/log';
import { exportLeadsCsv } from '@/csv/leads';
import { jsonResponse, LEADS_CSV_ROLES, staffCsvAccess } from '@/csv/session';
import { todayInKarachi } from '@/lib/pricing';
import type { Where } from 'payload';
import type { Lead } from '@/payload-types';

export const dynamic = 'force-dynamic';

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost', 'spam'] as const;

/**
 * `GET /api/staff/leads/export` (docs/API.md §4).
 *
 * Super Admin and Sales and Support only. Optional filters `leadStatus` and
 * `assignedTo` narrow the file to what the inbox is showing. Audited; never
 * cached.
 */
export async function GET(request: Request): Promise<Response> {
  const access = await staffCsvAccess(request, LEADS_CSV_ROLES, 'This role cannot export leads.');
  if (!access.ok) return jsonResponse({ ok: false, error: access.error }, access.status);

  const url = new URL(request.url);
  const status = url.searchParams.get('leadStatus');
  const assignedTo = url.searchParams.get('assignedTo');
  const where: Where = {};

  if (status) {
    if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
      return jsonResponse({ ok: false, error: 'Unknown lead status.' }, 400);
    }
    where.leadStatus = { equals: status };
  }

  if (assignedTo) {
    const id = Number(assignedTo);
    if (!Number.isInteger(id) || id <= 0) {
      return jsonResponse({ ok: false, error: 'Unknown assignee.' }, 400);
    }
    where.assignedTo = { equals: id };
  }

  const { docs } = await access.payload.find({
    collection: 'leads',
    depth: 1,
    limit: 5000,
    pagination: false,
    sort: '-createdAt',
    where: Object.keys(where).length > 0 ? where : undefined,
    overrideAccess: false,
    user: access.user,
  });

  await writeAuditLog({
    payload: access.payload,
    action: 'export',
    collectionSlug: 'leads',
    actorId: access.user.id,
    summary: `Exported ${docs.length} leads to CSV`,
    ipHash: hashIp(request.headers),
  });

  return new Response(exportLeadsCsv(docs as Lead[]), {
    status: 200,
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${todayInKarachi()}.csv"`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
