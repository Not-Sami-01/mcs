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

describe.skipIf(!enabled)('publish, discard, conflict and versions (CP-4.3)', () => {
  let payload: Payload;
  let pageId: number | string;
  let gatePageId: number | string;
  let legalPageId: number | string;
  let scheduledPageId: number | string;
  let superAdmin: { id: number | string };
  let editor: { id: number | string };

  const stamp = Date.now();

  beforeAll(async () => {
    if (!config) throw new Error('integration test enabled but config failed to load');
    payload = await getPayload({ config });

    superAdmin = await payload.create({
      collection: 'users',
      data: {
        email: `cp43-admin-${stamp}@example.com`,
        password: `cp43-admin-${stamp}-password`,
        roles: ['super-admin'],
      },
      overrideAccess: true,
      context: { [FIRST_USER_BOOTSTRAP_CONTEXT]: true },
    });

    editor = await payload.create({
      collection: 'users',
      data: {
        email: `cp43-editor-${stamp}@example.com`,
        password: `cp43-editor-${stamp}-password`,
        roles: ['editor'],
      },
      user: superAdmin,
      overrideAccess: false,
    });

    const base = {
      template: 'standard' as const,
      seo: { metaTitle: 'CP-4.3 title', metaDescription: 'CP-4.3 description' },
      layout: [
        {
          blockType: 'hero' as const,
          headline: 'Published headline',
          primaryAction: { label: 'Contact', kind: 'link' as const, href: '/contact-us' },
        },
      ],
    };

    const page = await payload.create({
      collection: 'pages',
      data: {
        ...base,
        title: `CP-4.3 page ${stamp}`,
        slug: `cp43-page-${stamp}`,
        _status: 'published',
      },
      overrideAccess: true,
    });
    pageId = page.id;

    const gatePage = await payload.create({
      collection: 'pages',
      data: {
        ...base,
        title: `CP-4.3 gates ${stamp}`,
        slug: `cp43-gates-${stamp}`,
        _status: 'draft',
        layout: [
          {
            blockType: 'textBlocks',
            headline: 'TODO(client): headline',
            paragraphs: [{ paragraph: 'Body' }],
          },
        ],
      },
      overrideAccess: true,
    });
    gatePageId = gatePage.id;

    const legalPage = await payload.create({
      collection: 'pages',
      data: {
        ...base,
        title: `CP-4.3 legal ${stamp}`,
        slug: `cp43-legal-${stamp}`,
        isLegal: true,
        _status: 'draft',
      },
      overrideAccess: true,
    });
    legalPageId = legalPage.id;

    const scheduledPage = await payload.create({
      collection: 'pages',
      data: {
        ...base,
        title: `CP-4.3 scheduled ${stamp}`,
        slug: `cp43-scheduled-${stamp}`,
        _status: 'draft',
        layout: [
          {
            blockType: 'hero',
            headline: 'Scheduled headline',
            primaryAction: { label: 'Contact', kind: 'link', href: '/contact-us' },
          },
        ],
      },
      overrideAccess: true,
    });
    scheduledPageId = scheduledPage.id;
  }, 120_000);

  afterAll(async () => {
    if (!payload) return;
    for (const id of [pageId, gatePageId, legalPageId, scheduledPageId]) {
      if (id) {
        await payload.delete({ collection: 'pages', id, overrideAccess: true }).catch(() => {});
      }
    }
    for (const user of [editor, superAdmin]) {
      if (user) {
        await payload
          .delete({ collection: 'users', id: user.id, overrideAccess: true })
          .catch(() => {});
      }
    }
    await payload.destroy();
  });

  async function draft() {
    return payload.findByID({
      collection: 'pages',
      id: pageId,
      draft: true,
      depth: 0,
      overrideAccess: true,
    });
  }

  it('detects a stale expected version and then saves with the fresh one', async () => {
    const { saveBlockDraft } = await import('./save-draft');
    const current = await draft();
    const blockId = current.layout?.[0]?.id;

    const stale = await saveBlockDraft({
      payload,
      user: editor,
      input: {
        pageId,
        blockId,
        blockIndex: 0,
        values: { headline: 'Stale edit' },
        expectedUpdatedAt: '2000-01-01T00:00:00.000Z',
      },
    });
    expect(stale).toMatchObject({ ok: false, code: 'CONFLICT' });
    if (!stale.ok) expect(stale.serverUpdatedAt).toBe(current.updatedAt);

    const fresh = await saveBlockDraft({
      payload,
      user: editor,
      input: {
        pageId,
        blockId,
        blockIndex: 0,
        values: { headline: 'Draft headline' },
        expectedUpdatedAt: current.updatedAt,
      },
    });
    expect(fresh.ok).toBe(true);
  });

  it('publishes the draft and blocks gate failures and legal pages', async () => {
    const { publishPage, discardPageDraft } = await import('./publish');

    const published = await publishPage({ payload, user: editor, pageId });
    expect(published.ok).toBe(true);

    const live = await payload.findByID({
      collection: 'pages',
      id: pageId,
      depth: 0,
      overrideAccess: true,
    });
    expect(live._status).toBe('published');
    expect((live.layout?.[0] as { headline?: string }).headline).toBe('Draft headline');

    const gates = await publishPage({ payload, user: editor, pageId: gatePageId });
    expect(gates).toMatchObject({ ok: false, code: 'GATES' });
    if (!gates.ok) expect(gates.problems?.length).toBeGreaterThan(0);

    const legal = await publishPage({ payload, user: editor, pageId: legalPageId });
    expect(legal).toMatchObject({ ok: false, code: 'FORBIDDEN' });

    // Put the page back into a mutated draft, then discard to the published text.
    const { saveBlockDraft } = await import('./save-draft');
    const current = await draft();
    const saved = await saveBlockDraft({
      payload,
      user: editor,
      input: {
        pageId,
        blockId: current.layout?.[0]?.id,
        blockIndex: 0,
        values: { headline: 'Unpublished change' },
        expectedUpdatedAt: current.updatedAt,
      },
    });
    expect(saved.ok).toBe(true);

    const discarded = await discardPageDraft({ payload, user: editor, pageId });
    expect(discarded.ok).toBe(true);
    expect((await draft()).layout?.[0]).toMatchObject({ headline: 'Draft headline' });
  });

  it('rejects an invalid schedule window and schedules legal pages for Super Admin only', async () => {
    const { schedulePagePublish } = await import('./publish');

    const invalid = await schedulePagePublish({
      payload,
      user: editor,
      pageId: scheduledPageId,
      publishAt: '2000-01-01T00:00:00.000Z',
    });
    expect(invalid).toMatchObject({ ok: false, code: 'INVALID' });

    const legal = await schedulePagePublish({
      payload,
      user: editor,
      pageId: legalPageId,
      publishAt: new Date(Date.now() + 60_000).toISOString(),
    });
    expect(legal).toMatchObject({ ok: false, code: 'FORBIDDEN' });
  });

  it('queues a scheduled publish that the jobs runner applies', async () => {
    const { schedulePagePublish } = await import('./publish');

    const publishAt = new Date(Date.now() + 300);
    const scheduled = await schedulePagePublish({
      payload,
      user: editor,
      pageId: scheduledPageId,
      publishAt: publishAt.toISOString(),
      unpublishAt: new Date(Date.now() + 86_400_000).toISOString(),
    });
    expect(scheduled.ok).toBe(true);

    const queued = await payload.find({
      collection: 'payload-jobs',
      where: {
        and: [{ taskSlug: { equals: 'schedulePublish' } }, { completedAt: { exists: false } }],
      },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    });
    const jobs = queued.docs.filter(
      (job) =>
        String((job.input as { doc?: { value?: string } })?.doc?.value ?? '') ===
        String(scheduledPageId),
    );
    expect(jobs).toHaveLength(2);

    // Re-scheduling replaces the pending jobs instead of stacking them.
    const rescheduled = await schedulePagePublish({
      payload,
      user: editor,
      pageId: scheduledPageId,
      publishAt: new Date(Date.now() + 300).toISOString(),
    });
    expect(rescheduled.ok).toBe(true);

    const after = await payload.find({
      collection: 'payload-jobs',
      where: {
        and: [{ taskSlug: { equals: 'schedulePublish' } }, { completedAt: { exists: false } }],
      },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    });
    expect(
      after.docs.filter(
        (job) =>
          String((job.input as { doc?: { value?: string } })?.doc?.value ?? '') ===
          String(scheduledPageId),
      ),
    ).toHaveLength(1);

    await new Promise((resolve) => setTimeout(resolve, 500));
    await payload.jobs.run({ allQueues: true, limit: 20, overrideAccess: true });

    const live = await payload.findByID({
      collection: 'pages',
      id: scheduledPageId,
      depth: 0,
      overrideAccess: true,
    });
    expect(live._status).toBe('published');
  });

  it('lists versions and restores an older one as the draft', async () => {
    const { listPageVersions, restorePageVersion } = await import('./publish');

    const versions = await listPageVersions({ payload, user: editor, pageId });
    expect(versions.length).toBeGreaterThan(1);

    const { docs } = await payload.findVersions({
      collection: 'pages',
      where: { parent: { equals: pageId } },
      sort: '-updatedAt',
      limit: 50,
      depth: 0,
      overrideAccess: true,
    });
    const older = docs.find(
      (doc) =>
        ((doc.version as { layout?: Array<{ headline?: string }> }).layout?.[0]?.headline ?? '') ===
        'Published headline',
    );
    expect(older).toBeTruthy();
    if (!older) return;

    const restored = await restorePageVersion({
      payload,
      user: editor,
      pageId,
      versionId: String(older.id),
    });
    expect(restored.ok).toBe(true);
    expect((await draft()).layout?.[0]).toMatchObject({ headline: 'Published headline' });

    const foreign = await restorePageVersion({
      payload,
      user: editor,
      pageId,
      versionId: 'not-a-real-version',
    });
    expect(foreign).toMatchObject({ ok: false, code: 'NOT_FOUND' });
  });
});
