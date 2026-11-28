import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { getCachedSiteChrome } from '@/cms/cache';
import { HOME_PATH } from '@/cms/pages';
import { PageView } from '@/components/PageView';
import { EditSessionGuard } from '@/components/edit/EditSessionGuard';
import { StaffBar } from '@/components/edit/StaffBar';
import {
  GLOBAL_REGION_KEYS,
  getGlobalInitialValues,
  getGlobalRegion,
  getGlobalSchema,
} from '@/edit/global-regions';
import { getEditSession } from '@/edit/session';

type RouteParams = { segments: string[] };

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Edit content',
  robots: { index: false, follow: false },
};

/**
 * Draft preview and inline editing (CP-4.1). The proxy only rewrites requests
 * that carry a session cookie; this route re-checks session, role and
 * two-factor state, and loads the **draft** with `overrideAccess: false`.
 * `next.config.mjs` marks `/edit/*` no-store and this route adds noindex.
 */
export default async function EditPage({ params }: { params: Promise<RouteParams> }) {
  const segments = (await params).segments;
  const path = segments.join('/');
  const publicPath = path === HOME_PATH ? '/' : `/${path}`;

  // A signed-out or unauthorised visitor falls back to the public page, per
  // docs/INLINE-EDITING.md §3. `view=visitor` stops the proxy from rewriting the
  // same stale cookie straight back to this route.
  const visitorUrl = `${publicPath}${publicPath.includes('?') ? '&' : '?'}view=visitor`;

  const session = await getEditSession(await headers());
  if (session.status === 'anonymous' || session.status === 'forbidden') {
    redirect(visitorUrl);
  }
  if (session.status === 'totp') {
    redirect(session.redirectTo);
  }

  const { docs } = await session.payload.find({
    collection: 'pages',
    where: { path: { equals: path } },
    draft: true,
    depth: 2,
    limit: 1,
    pagination: false,
    overrideAccess: false,
    user: session.user,
  });
  const page = docs[0];

  if (!page) notFound();

  const [navigation, settings] = await Promise.all([
    session.payload.findGlobal({
      slug: 'navigation',
      depth: 0,
      overrideAccess: false,
      user: session.user,
    }),
    session.payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
      overrideAccess: false,
      user: session.user,
    }),
  ]);
  const globalDocs = { navigation, 'site-settings': settings } as const;
  const globals = GLOBAL_REGION_KEYS.map((key) => {
    const region = getGlobalRegion(key);
    return {
      region: key,
      label: region.label,
      schema: getGlobalSchema(key),
      initialValues: getGlobalInitialValues(key, {
        ...globalDocs[region.slug],
      }),
    };
  });

  return (
    <>
      <EditSessionGuard visitorUrl={visitorUrl} />
      <StaffBar
        publicPath={publicPath}
        pageTitle={page.title}
        pageId={page.id}
        status={page._status ?? 'draft'}
        globals={globals}
      />
      <PageView
        page={page}
        chrome={await getCachedSiteChrome()}
        edit={{ pageId: page.id, updatedAt: page.updatedAt }}
      />
    </>
  );
}
