import type { SiteChrome } from '@/cms/site-chrome';
import type { Page } from '@/payload-types';

import { BlockRenderer } from './blocks';

/**
 * Renders a CMS page's blocks. The hidden H1 keeps every page with a single
 * top-level heading when no hero supplies one (docs/DESIGNS.md §4).
 */
export function PageView({
  page,
  chrome,
  edit,
}: {
  page: Page;
  chrome: SiteChrome;
  edit?: { pageId: number | string; updatedAt?: string | null };
}) {
  const hasHero = (page.layout ?? []).some((block) => block.blockType === 'hero');

  return (
    <div>
      {hasHero ? null : <h1 className="sr-only">{page.title}</h1>}
      <BlockRenderer blocks={page.layout} chrome={chrome} edit={edit} />
    </div>
  );
}
