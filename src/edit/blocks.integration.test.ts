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

describe.skipIf(!enabled)('inline block management (CP-4.2)', () => {
  let payload: Payload;
  let pageId: number | string;
  let superAdmin: { id: number | string };
  let editor: { id: number | string };
  let sales: { id: number | string };

  const stamp = Date.now();

  beforeAll(async () => {
    if (!config) throw new Error('integration test enabled but config failed to load');
    payload = await getPayload({ config });

    superAdmin = await payload.create({
      collection: 'users',
      data: {
        email: `cp42-admin-${stamp}@example.com`,
        password: `cp42-admin-${stamp}-password`,
        roles: ['super-admin'],
      },
      overrideAccess: true,
      context: { [FIRST_USER_BOOTSTRAP_CONTEXT]: true },
    });

    editor = await payload.create({
      collection: 'users',
      data: {
        email: `cp42-editor-${stamp}@example.com`,
        password: `cp42-editor-${stamp}-password`,
        roles: ['editor'],
      },
      user: superAdmin,
      overrideAccess: false,
    });

    sales = await payload.create({
      collection: 'users',
      data: {
        email: `cp42-sales-${stamp}@example.com`,
        password: `cp42-sales-${stamp}-password`,
        roles: ['sales-support'],
      },
      user: superAdmin,
      overrideAccess: false,
    });

    const page = await payload.create({
      collection: 'pages',
      data: {
        title: `CP-4.2 page ${stamp}`,
        slug: `cp42-page-${stamp}`,
        template: 'standard',
        _status: 'published',
        layout: [
          {
            blockType: 'hero',
            headline: 'First section',
            primaryAction: { label: 'Contact', kind: 'link', href: '/contact-us' },
          },
          {
            blockType: 'textBlocks',
            headline: 'Second section',
            paragraphs: [{ paragraph: 'Fixture.' }],
          },
        ],
      },
      overrideAccess: true,
    });

    pageId = page.id;
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

  async function draftLayout() {
    const draft = await payload.findByID({
      collection: 'pages',
      id: pageId,
      draft: true,
      depth: 0,
      overrideAccess: true,
    });
    return draft.layout ?? [];
  }

  it('adds, duplicates, moves, hides and removes sections as drafts', async () => {
    const { applyBlockAction } = await import('./blocks');
    const first = (await draftLayout())[0];

    const added = await applyBlockAction({
      payload,
      user: editor,
      input: { op: 'add', pageId, blockType: 'faq', index: 1 },
    });
    expect(added.ok).toBe(true);
    let layout = await draftLayout();
    expect(layout.map((block) => block.blockType)).toEqual(['hero', 'faq', 'textBlocks']);

    const duplicated = await applyBlockAction({
      payload,
      user: editor,
      input: { op: 'duplicate', pageId, blockId: first.id! },
    });
    expect(duplicated.ok).toBe(true);
    layout = await draftLayout();
    expect(layout.map((block) => block.blockType)).toEqual(['hero', 'hero', 'faq', 'textBlocks']);

    const moved = await applyBlockAction({
      payload,
      user: editor,
      input: { op: 'move', pageId, blockId: first.id!, direction: 'down' },
    });
    expect(moved.ok).toBe(true);
    layout = await draftLayout();
    expect(layout[0].id).not.toBe(first.id);

    const hidden = await applyBlockAction({
      payload,
      user: editor,
      input: { op: 'toggleHidden', pageId, blockId: layout[0].id! },
    });
    expect(hidden.ok).toBe(true);
    expect((await draftLayout())[0].hidden).toBe(true);

    const removed = await applyBlockAction({
      payload,
      user: editor,
      input: { op: 'remove', pageId, blockId: layout[0].id! },
    });
    expect(removed.ok).toBe(true);
    expect((await draftLayout()).length).toBe(3);
  });

  it('never changes the published layout', async () => {
    const published = await payload.findByID({
      collection: 'pages',
      id: pageId,
      depth: 0,
      overrideAccess: true,
    });
    expect(published.layout?.map((block) => block.blockType)).toEqual(['hero', 'textBlocks']);
  });

  it('rejects unknown types and users without content access', async () => {
    const { applyBlockAction } = await import('./blocks');

    const unknown = await applyBlockAction({
      payload,
      user: editor,
      input: { op: 'add', pageId, blockType: 'not-a-block', index: 0 },
    });
    expect(unknown).toMatchObject({ ok: false, code: 'INVALID' });

    const denied = await applyBlockAction({
      payload,
      user: sales,
      input: { op: 'add', pageId, blockType: 'faq', index: 0 },
    }).catch((error: unknown) => error);

    if (denied && typeof denied === 'object' && 'ok' in denied) {
      expect(denied).toMatchObject({ ok: false, code: 'FORBIDDEN' });
    }
    expect((await draftLayout()).map((block) => block.blockType)).toEqual([
      'hero',
      'faq',
      'textBlocks',
    ]);
  });
});
