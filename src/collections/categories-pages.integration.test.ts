import { getPayload, type Payload } from 'payload';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

try {
  process.loadEnvFile('.env');
} catch {}
try {
  process.loadEnvFile('.env.local');
} catch {}

const PLACEHOLDER = 'ci-placeholder';
const enabled = Boolean(
  process.env.DATABASE_URL &&
  process.env.PAYLOAD_SECRET &&
  process.env.FILEBASE_ACCESS_KEY_ID &&
  process.env.FILEBASE_SECRET_ACCESS_KEY &&
  process.env.FILEBASE_ACCESS_KEY_ID !== PLACEHOLDER &&
  process.env.FILEBASE_SECRET_ACCESS_KEY !== PLACEHOLDER,
);

const config = enabled ? (await import('../payload.config')).default : null;

describe.skipIf(!enabled)('categories and pages integration (CP-1.2 exit criteria)', () => {
  let payload: Payload;
  const createdCategoryIds: number[] = [];
  const createdPageIds: number[] = [];

  const superAdminUser = {
    id: 999991,
    email: 'superadmin-test@example.com',
    roles: ['super-admin'],
    collection: 'users' as const,
    _strategy: 'local',
  };

  const editorUser = {
    id: 999992,
    email: 'editor-test@example.com',
    roles: ['editor'],
    collection: 'users' as const,
    _strategy: 'local',
  };

  beforeAll(async () => {
    if (!config) throw new Error('integration test enabled but config failed to load');
    payload = await getPayload({ config });
  }, 60_000);

  afterAll(async () => {
    for (const id of createdPageIds) {
      await payload
        .delete({ collection: 'pages', id, overrideAccess: true })
        .catch(() => undefined);
    }
    for (const id of createdCategoryIds.reverse()) {
      await payload
        .delete({ collection: 'categories', id, overrideAccess: true })
        .catch(() => undefined);
    }
  });

  it('creates parent and child categories with computed hierarchical paths', async () => {
    const parent = await payload.create({
      collection: 'categories',
      data: {
        title: 'Services',
        slug: 'services',
        kind: 'services',
      },
      overrideAccess: true,
    });
    createdCategoryIds.push(parent.id);
    expect(parent.path).toBe('services');

    const child = await payload.create({
      collection: 'categories',
      data: {
        title: 'Residential Pest Control',
        slug: 'residential',
        kind: 'services',
        parent: parent.id,
      },
      overrideAccess: true,
    });
    createdCategoryIds.push(child.id);
    expect(child.path).toBe('services/residential');
  });

  it('creates a page with blocks and computed path from category', async () => {
    const parentCatId = createdCategoryIds[0];
    const page = await payload.create({
      collection: 'pages',
      data: {
        title: 'Termite Control Lahore',
        slug: 'termite-control',
        template: 'standard',
        category: parentCatId,
        layout: [
          {
            blockType: 'hero',
            headline: 'Safe & Effective Termite Control',
            subheadline: 'Protect your property with guaranteed results.',
            primaryAction: {
              label: 'Book Free Inspection',
              kind: 'inspection',
              href: '/contact',
            },
          },
          {
            blockType: 'faq',
            headline: 'Common Questions',
            items: [
              {
                question: 'How long does the termite treatment take?',
                answer: 'Typically 3 to 5 hours depending on property size.',
              },
              {
                question: 'Is the treatment safe for pets and children?',
                answer: 'Yes, our products are eco-friendly and safe once dry.',
              },
              {
                question: 'How often should inspection be done?',
                answer: 'We recommend annual inspections for all properties.',
              },
            ],
          },
        ],
      },
      overrideAccess: true,
    });
    createdPageIds.push(page.id);

    expect(page.path).toBe('services/termite-control');
    expect(page.layout).toHaveLength(2);
    expect(page.layout?.[0].blockType).toBe('hero');
    expect(page.layout?.[1].blockType).toBe('faq');
  });

  it('rejects field exceeding maxLength on the server', async () => {
    // headline limit is 80 characters (TEXT_LIMITS.headline)
    const tooLongHeadline = 'A'.repeat(81);

    await expect(
      payload.create({
        collection: 'pages',
        data: {
          title: tooLongHeadline,
          slug: 'too-long-test',
          template: 'standard',
        },
        overrideAccess: true,
      }),
    ).rejects.toThrow();
  });

  it('rejects invalid reserved slug on the server', async () => {
    await expect(
      payload.create({
        collection: 'pages',
        data: {
          title: 'Admin Reserved Page',
          slug: 'admin',
          template: 'standard',
        },
        overrideAccess: true,
      }),
    ).rejects.toThrow(/Slug/);
  });

  it('enforces legal page publish guard (super-admin only)', async () => {
    // Editor cannot publish a legal page
    await expect(
      payload.create({
        collection: 'pages',
        data: {
          title: 'Terms of Service',
          slug: 'terms-of-service',
          template: 'legal',
          isLegal: true,
          _status: 'published',
        },
        user: editorUser,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/Legal pages can only be published by a Super Admin/);

    // Super Admin CAN publish a legal page
    const legalPage = await payload.create({
      collection: 'pages',
      data: {
        title: 'Terms of Service',
        slug: 'terms-of-service',
        template: 'legal',
        isLegal: true,
        _status: 'published',
      },
      user: superAdminUser,
      overrideAccess: false,
    });
    createdPageIds.push(legalPage.id);
    expect(legalPage._status).toBe('published');
    expect(legalPage.isLegal).toBe(true);
  });
});
