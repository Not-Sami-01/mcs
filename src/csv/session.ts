import type { Payload } from 'payload';

import { getRoleSession } from '../edit/session';
import type { User } from '../payload-types';

/**
 * Shared guard for the staff CSV routes (docs/API.md §4): Super Admin and
 * Product Manager only, an enrolled account must have completed its second
 * factor, and a browser request must come from our own origin.
 */

export const PRODUCTS_CSV_ROLES = ['super-admin', 'product-manager'] as const;

export type StaffAccess =
  { ok: true; payload: Payload; user: User } | { ok: false; status: number; error: string };

export async function productsCsvAccess(request: Request): Promise<StaffAccess> {
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

  const session = await getRoleSession(request.headers, PRODUCTS_CSV_ROLES);

  if (session.status === 'anonymous') {
    return { ok: false, status: 401, error: 'Sign in required.' };
  }
  if (session.status === 'totp') {
    return { ok: false, status: 403, error: 'Two-factor verification is required.' };
  }
  if (session.status === 'forbidden') {
    return { ok: false, status: 403, error: 'This role cannot import or export products.' };
  }

  return {
    ok: true,
    payload: session.payload,
    user: session.user as unknown as User,
  };
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
