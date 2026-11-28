import type { Payload } from 'payload';

import { getRoleSession } from '../edit/session';
import type { UserRole } from '../access/roles';
import type { User } from '../payload-types';

/**
 * Shared guard for the staff CSV routes (docs/API.md §4): the listed roles
 * only, an enrolled account must have completed its second factor, and a
 * browser request must come from our own origin.
 */

export const PRODUCTS_CSV_ROLES = ['super-admin', 'product-manager'] as const;
export const LEADS_CSV_ROLES = ['super-admin', 'sales-support'] as const;

export type StaffAccess =
  { ok: true; payload: Payload; user: User } | { ok: false; status: number; error: string };

export async function staffCsvAccess(
  request: Request,
  roles: readonly UserRole[],
  forbiddenMessage: string,
): Promise<StaffAccess> {
  const origin = request.headers.get('origin');
  if (origin) {
    const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    let allowed = false;
    try {
      allowed = site ? new URL(origin).origin === new URL(site).origin : false;
    } catch {
      allowed = false;
    }
    if (!allowed) return { ok: false, status: 403, error: 'Cross-origin request refused.' };
  }

  const session = await getRoleSession(request.headers, roles);

  if (session.status === 'anonymous') {
    return { ok: false, status: 401, error: 'Sign in required.' };
  }
  if (session.status === 'totp') {
    return { ok: false, status: 403, error: 'Two-factor verification is required.' };
  }
  if (session.status === 'forbidden') {
    return { ok: false, status: 403, error: forbiddenMessage };
  }

  return {
    ok: true,
    payload: session.payload,
    user: session.user as unknown as User,
  };
}

export function productsCsvAccess(request: Request): Promise<StaffAccess> {
  return staffCsvAccess(
    request,
    PRODUCTS_CSV_ROLES,
    'This role cannot import or export products.',
  );
}

export function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
