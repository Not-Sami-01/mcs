import { timingSafeEqual } from 'node:crypto';
import { getPayload } from 'payload';

import config from '@payload-config';

export const dynamic = 'force-dynamic';

function authorized(header: string | null, secret: string): boolean {
  const expected = `Bearer ${secret}`;
  if (!header || header.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}

/**
 * Runs Payload's queued jobs, including scheduled publish and unpublish
 * (CP-4.3). Call it from the host's cron with
 * `Authorization: Bearer $CRON_SECRET`; see docs/OPERATIONS.md.
 */
export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return Response.json(
      { ok: false, error: 'CRON_SECRET is not configured.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (!authorized(request.headers.get('authorization'), secret)) {
    return Response.json(
      { ok: false, error: 'Unauthorized.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const payload = await getPayload({ config });
  const result = await payload.jobs.run({ allQueues: true, limit: 100, overrideAccess: true });

  return Response.json(
    {
      ok: true,
      noJobsRemaining: result.noJobsRemaining ?? false,
      remaining: result.remainingJobsFromQueried,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
