import { getCachedPublishedServices } from '@/cms/cache';
import type { SiteChrome } from '@/cms/site-chrome';
import type { Page } from '@/payload-types';

import { BlockRenderer } from './blocks';

/**
 * Renders a CMS page's blocks. The hidden H1 keeps every page with a single
 * top-level heading when no hero supplies one (docs/DESIGNS.md §4).
 *
 * Published services are loaded here (tagged cache) because a `servicesGrid`
 * block may fill itself automatically; one read serves every grid on the page.
 */
export async function PageView({
  page,
  chrome,
  edit,
}: {
  page: Page;
  chrome: SiteChrome;
  edit?: { pageId: number | string; updatedAt?: string | null };
}) {
  const hasHero = (page.layout ?? []).some((block) => block.blockType === 'hero');
  const services = (page.layout ?? []).some((block) => block.blockType === 'servicesGrid')
    ? await getCachedPublishedServices()
    : [];

  return (
    <div>
      {hasHero ? null : <h1 className="sr-only">{page.title}</h1>}
      <BlockRenderer blocks={page.layout} chrome={chrome} services={services} edit={edit} />
    </div>
  );
}
