import { handleTOTPMiddleware } from '@purposeinplay/payload-totp/middleware';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * CP-2.2: a TOTP-enabled session without a valid verification cookie is
 * redirected to /admin/verify-totp before any admin page renders. This is
 * defence in depth; `TOTPGuard` and the plugin's `beforeOperation` hook
 * re-check on every server render and data-API operation.
 *
 * Next 16 names this file `proxy.ts` (the `middleware.ts` convention is
 * deprecated and is Node.js-runtime only).
 */
export async function proxy(request: NextRequest) {
  const totpResponse = await handleTOTPMiddleware(request);
  if (totpResponse) return totpResponse;

  // The plugin's server-side guard has no access to the pathname otherwise and
  // would treat every request as the admin root. Forgetting this header causes
  // a redirect loop on the verify page.
  const headers = new Headers(request.headers);
  headers.set('x-pathname', request.nextUrl.pathname);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/admin/:path*', '/api/users/logout'],
};
