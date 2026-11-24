import { handleTOTPMiddleware } from '@purposeinplay/payload-totp/middleware';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * CP-2.2: a TOTP-enabled session without a valid verification cookie is
 * redirected to /admin/verify-totp before any admin page renders. This is
 * defence in depth; `TOTPGuard` and the plugin's `beforeOperation` hook
 * re-check on every server render and data-API operation.
 *
 * CP-4.1: a GET from a browser that carries a Payload session cookie is
 * rewritten to the dynamic edit route. This is only a routing hint — the edit
 * route and every action re-check the session, role and two-factor state.
 * Public pages stay static for everyone else.
 *
 * Next 16 names this file `proxy.ts` (the `middleware.ts` convention is
 * deprecated and is Node.js-runtime only).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin') || pathname === '/api/users/logout';

  if (isAdminRoute) {
    const totpResponse = await handleTOTPMiddleware(request);
    if (totpResponse) return totpResponse;

    // The plugin's server-side guard has no access to the pathname otherwise and
    // would treat every request as the admin root. Forgetting this header causes
    // a redirect loop on the verify page.
    const headers = new Headers(request.headers);
    headers.set('x-pathname', request.nextUrl.pathname);

    return NextResponse.next({ request: { headers } });
  }

  const wantsEdit =
    (request.method === 'GET' || request.method === 'HEAD') &&
    Boolean(request.cookies.get('payload-token')) &&
    request.nextUrl.searchParams.get('view') !== 'visitor';

  if (wantsEdit) {
    // `/` is the `home` page document; every other public path maps directly.
    const editPath = pathname === '/' ? '/edit/home' : `/edit${pathname}`;
    const url = new URL(editPath, request.url);
    url.search = request.nextUrl.search;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/users/logout',
    '/((?!api|admin|edit|_next|media-test|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
};
