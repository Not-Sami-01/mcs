'use client';

import { useEffect } from 'react';

const EDIT_ROLES = ['super-admin', 'editor'];

/**
 * Drops stale edit-mode content after sign-out.
 *
 * The proxy rewrites public URLs to `/edit/*` when a session cookie is present,
 * and Next may keep the prefetched edit payload (or a back/forward-cache
 * snapshot) for that URL. Without this guard, signing out in another tab — or
 * through `/admin/logout` and then pressing Back — can leave the editing bar
 * and draft content on screen until a hard refresh.
 *
 * The check is client-side only; it never grants access. The `/edit` route and
 * every action still verify session, role and two-factor state on the server
 * (docs/INLINE-EDITING.md §3). A visitor without an edit role is sent to the
 * public page with `?view=visitor`, which also stops the proxy from rewriting.
 */
export function EditSessionGuard({ visitorUrl }: { visitorUrl: string }) {
  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const response = await fetch('/api/users/me', {
          cache: 'no-store',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) return;

        const data = (await response.json()) as {
          user?: { roles?: unknown } | null;
        };
        const roles = Array.isArray(data.user?.roles) ? data.user.roles : [];
        const mayEdit = roles.some((role) => EDIT_ROLES.includes(String(role)));

        if (!cancelled && (!data.user || !mayEdit)) {
          window.location.replace(visitorUrl);
        }
      } catch {
        // Offline or a transient error: leave the page alone, the server
        // still rejects any save.
      }
    }

    void check();

    const recheck = () => {
      if (document.visibilityState === 'visible') void check();
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void check();
    };

    document.addEventListener('visibilitychange', recheck);
    window.addEventListener('pageshow', onPageShow);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', recheck);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [visitorUrl]);

  return null;
}
