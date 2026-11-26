import { getPayload, type Payload } from 'payload';

import { hasAnyRole, type UserRole } from '@/access/roles';

/**
 * Server-side staff check shared by the edit route and every edit action
 * (docs/INLINE-EDITING.md §3). The proxy cookie is only a routing hint; this
 * runs on the server for every request and every save.
 */
export type EditSession =
  | {
      status: 'ok';
      payload: Payload;
      user: { id: number | string; email?: string; roles?: unknown; totp?: { enabled?: boolean } };
    }
  | { status: 'anonymous' }
  | { status: 'forbidden' }
  | { status: 'totp'; redirectTo: string };

function cookieValue(header: string | null, name: string): string | null {
  if (!header) return null;
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1].trim()) : null;
}

/** Payload's JWT `iat`; the token was already verified by `payload.auth`. */
function jwtIssuedAt(token: string | null): number | undefined {
  if (!token) return undefined;

  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString());
    return typeof payload.iat === 'number' ? payload.iat : undefined;
  } catch {
    return undefined;
  }
}

export async function getRoleSession(
  requestHeaders: Headers,
  roles: readonly UserRole[],
): Promise<EditSession> {
  // Imported lazily so rendering paths and unit tests that only reach this
  // module do not load the full Payload config (and its admin CSS bundle).
  const { default: config } = await import('@payload-config');
  const payload = await getPayload({ config });
  // The plugin's guard/middleware entries pull in admin UI components; import
  // them only when a real request is checked.
  const [{ getTOTPRedirectPath }, { getTOTPVerifiedCookieName }] = await Promise.all([
    import('@purposeinplay/payload-totp/guard'),
    import('@purposeinplay/payload-totp/middleware'),
  ]);
  const { user } = await payload.auth({ headers: requestHeaders });

  if (!user) return { status: 'anonymous' };
  if (!hasAnyRole(user, roles)) return { status: 'forbidden' };

  const cookieHeader = requestHeaders.get('cookie');
  const redirectTo = getTOTPRedirectPath({
    user: user as { id: number | string; totp?: { enabled?: boolean } | null },
    pathname: '/edit',
    totpVerifiedCookieValue: cookieValue(cookieHeader, getTOTPVerifiedCookieName()),
    adminRoute: '/admin',
    forceSetup: false,
    jwtIat: jwtIssuedAt(cookieValue(cookieHeader, 'payload-token')),
  });

  if (redirectTo) return { status: 'totp', redirectTo };

  return {
    status: 'ok',
    payload,
    user: user as Extract<EditSession, { status: 'ok' }>['user'],
  };
}

/** The edit UI and its server actions allow Editor and Super Admin only. */
export function getEditSession(requestHeaders: Headers): Promise<EditSession> {
  return getRoleSession(requestHeaders, ['super-admin', 'editor']);
}
