import { getPayload, type Payload } from 'payload';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { FIRST_USER_BOOTSTRAP_CONTEXT } from '../access/first-user';

try {
  process.loadEnvFile('.env');
} catch {}
try {
  process.loadEnvFile('.env.local');
} catch {}

const enabled = Boolean(process.env.DATABASE_URL && process.env.PAYLOAD_SECRET);
const config = enabled ? (await import('../payload.config')).default : null;

describe.skipIf(!enabled)('inline draft saves (CP-4.1)', () => {
  let payload: Payload;
  let pageId: number | string;
  let blockId: string | null | undefined;
  let superAdmin: { id: number | string };
  let editor: { id: number | string };
  let sales: { id: number | string };

  const stamp = Date.now();
  const initialHeadline = `CP-4.1 original ${stamp}`;

  beforeAll(async () => {
    if (!config) throw new Error('integration test enabled but config failed to load');
    payload = await getPayload({ config });

    superAdmin = await payload.create({
      collection: 'users',
      data: {
        email: `cp41-admin-${stamp}@example.com`,
        password: `cp41-admin-${stamp}-password`,
        roles: ['super-admin'],
      },
      overrideAccess: true,
      context: { [FIRST_USER_BOOTSTRAP_CONTEXT]: true },
    });

    editor = await payload.create({
      collection: 'users',
      data: {
        email: `cp41-editor-${stamp}@example.com`,
        password: `cp41-editor-${stamp}-password`,
        roles: ['editor'],
      },
      user: superAdmin,
      overrideAccess: false,
    });

    sales = await payload.create({
      collection: 'users',
      data: {
        email: `cp41-sales-${stamp}@example.com`,
        password: `cp41-sales-${stamp}-password`,
        roles: ['sales-support'],
      },
      user: superAdmin,
      overrideAccess: false,
    });

    const page = await payload.create({
      collection: 'pages',
      data: {
        title: `CP-4.1 page ${stamp}`,
        slug: `cp41-page-${stamp}`,
        template: 'standard',
        _status: 'published',
        layout: [
          {
            blockType: 'hero',
            headline: initialHeadline,
            primaryAction: { label: 'Contact', kind: 'link', href: '/contact-us' },
          },
          {
            blockType: 'textBlocks',
            headline: 'Second block',
            paragraphs: [{ paragraph: 'Fixture text.' }],
          },
        ],
      },
      overrideAccess: true,
    });

    pageId = page.id;
    blockId = page.layout?.[0]?.id;
    expect(blockId).toBeTruthy();
  }, 120_000);

  afterAll(async () => {
    if (!payload) return;
    if (pageId) {
      await payload
        .delete({ collection: 'pages', id: pageId, overrideAccess: true })
        .catch(() => {});
    }
    for (const user of [editor, sales, superAdmin]) {
      if (user) {
        await payload
          .delete({ collection: 'users', id: user.id, overrideAccess: true })
          .catch(() => {});
      }
    }
    await payload.destroy();
  });

  it('writes a draft without changing the published headline', async () => {
    const { saveBlockDraft } = await import('./save-draft');
    const headline = `CP-4.1 draft ${stamp}`;

    const result = await saveBlockDraft({
      payload,
      user: editor,
      input: { pageId, blockId, blockIndex: 0, values: { headline } },
    });

    expect(result.ok).toBe(true);

    const published = await payload.findByID({
      collection: 'pages',
      id: pageId,
      depth: 0,
      overrideAccess: true,
    });
    expect(published.layout?.[0]).toMatchObject({ blockType: 'hero', headline: initialHeadline });

    const draft = await payload.findByID({
      collection: 'pages',
      id: pageId,
      draft: true,
      depth: 0,
      overrideAccess: true,
    });
    expect(draft.layout?.[0]).toMatchObject({ blockType: 'hero', headline });
    expect(draft.layout?.[1]).toMatchObject({ blockType: 'textBlocks' });
  });

  it('rejects a value over the shared limit without saving it', async () => {
    const { saveBlockDraft } = await import('./save-draft');
    const tooLong = 'x'.repeat(81);

    const result = await saveBlockDraft({
      payload,
      user: editor,
      input: { pageId, blockId, blockIndex: 0, values: { headline: tooLong } },
    });

    expect(result).toMatchObject({ ok: false, code: 'INVALID' });
    if (!result.ok) expect(result.fields?.headline).toMatch(/80/);

    const draft = await payload.findByID({
      collection: 'pages',
      id: pageId,
      draft: true,
      depth: 0,
      overrideAccess: true,
    });
    expect((draft.layout?.[0] as { headline?: string }).headline).not.toBe(tooLong);
  });

  it('rejects unknown fields and roles without content access', async () => {
    const { saveBlockDraft } = await import('./save-draft');

    const unknown = await saveBlockDraft({
      payload,
      user: editor,
      input: { pageId, blockId, blockIndex: 0, values: { image: 'x' } },
    });
    expect(unknown).toMatchObject({ ok: false, code: 'INVALID' });

    const denied = await saveBlockDraft({
      payload,
      user: sales,
      input: { pageId, blockId, blockIndex: 0, values: { headline: 'Denied' } },
    }).catch((error: unknown) => error);

    // Payload throws Forbidden before the helper can return; either shape is a denial.
    if (denied && typeof denied === 'object' && 'ok' in denied) {
      expect(denied).toMatchObject({ ok: false, code: 'FORBIDDEN' });
    }
  });
});
