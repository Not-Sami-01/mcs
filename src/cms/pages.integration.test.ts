import { getPayload, type Payload } from 'payload';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Vitest does not load .env files the way `next dev`/`next start` do.
try {
  process.loadEnvFile('.env');
} catch {
  // no .env — the environment may provide the variables
}
try {
  process.loadEnvFile('.env.local');
} catch {
  // no .env.local — nothing to override
}

const enabled = Boolean(process.env.DATABASE_URL && process.env.PAYLOAD_SECRET);
const config = enabled ? (await import('../payload.config')).default : null;

describe.skipIf(!enabled)('published page queries (CP-3.2)', () => {
  let payload: Payload;
  let categoryId: number | string;
  let pageId: number | string;
  let pagePath: string;

  const stamp = Date.now();
  const categorySlug = `cp32-category-${stamp}`;
  const pageSlug = `cp32-page-${stamp}`;

  beforeAll(async () => {
    if (!config) throw new Error('integration test enabled but config failed to load');
    payload = await getPayload({ config });

    const category = await payload.create({
      collection: 'categories',
      data: {
        title: `CP-3.2 category ${stamp}`,
        slug: categorySlug,
        kind: 'general',
      },
      overrideAccess: true,
    });
    categoryId = category.id;

    const page = await payload.create({
      collection: 'pages',
      data: {
        title: `CP-3.2 page ${stamp}`,
        slug: pageSlug,
        category: category.id,
        template: 'standard',
        _status: 'published',
        layout: [
          {
            blockType: 'hero',
            headline: `CP-3.2 headline ${stamp}`,
            primaryAction: { label: 'Home', kind: 'link', href: '/' },
          },
          {
            blockType: 'textBlocks',
            headline: 'Details',
            paragraphs: [{ paragraph: 'Published page fixture.' }],
          },
        ],
      },
      overrideAccess: true,
    });

    pageId = page.id;
    pagePath = `${categorySlug}/${pageSlug}`;
    expect(page.path).toBe(pagePath);
  }, 120_000);

  afterAll(async () => {
    if (!payload) return;
    await payload
      .delete({ collection: 'pages', id: pageId, overrideAccess: true })
      .catch(() => undefined);
    await payload
      .delete({ collection: 'categories', id: categoryId, overrideAccess: true })
      .catch(() => undefined);
    await payload.destroy();
  });

  it('finds a published page by its nested category path', async () => {
    const { findPublishedPage } = await import('./pages');
    const page = await findPublishedPage(pagePath);

    expect(page?.id).toBe(pageId);
    expect(page?.layout?.[0]?.blockType).toBe('hero');
  });

  it('lists the page path for static generation', async () => {
    const { listPublishedPagePaths } = await import('./pages');
    await expect(listPublishedPagePaths()).resolves.toContain(pagePath);
  });

  it('stops resolving the page once it is unpublished', async () => {
    const { findPublishedPage } = await import('./pages');

    await payload.update({
      collection: 'pages',
      id: pageId,
      data: { _status: 'draft' },
      overrideAccess: true,
    });

    await expect(findPublishedPage(pagePath)).resolves.toBeNull();
  });
});
