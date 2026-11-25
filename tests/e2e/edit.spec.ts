import { expect, test, type Page } from '@playwright/test';
import type { Payload } from 'payload';

import { FIRST_USER_BOOTSTRAP_CONTEXT } from '../../src/access/first-user';

/**
 * CP-4.3 exit flow (docs/INLINE-EDITING.md §13): edit a headline, hit the
 * limit, save a draft, publish, resolve a conflict and restore a version.
 * Fixtures are created through the Local API; the page starts as a draft so
 * the public URL is a 404 until the test publishes it.
 */

const stamp = Date.now();
const email = `cp43-e2e-${stamp}@example.com`;
const password = `cp43-e2e-${stamp}-password`;
const pageSlug = `cp43-e2e-${stamp}`;
const publishedHeadline = `E2E published ${stamp}`;

let payload: Payload;
let pageId: number | string;
let userId: number | string;

async function login(page: Page) {
  await page.goto('/admin/login');
  await page.fill('#field-email', email);
  await page.fill('#field-password', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(
    (url) => url.pathname.startsWith('/admin') && !url.pathname.includes('login'),
  );
}

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  process.loadEnvFile('.env');
  try {
    process.loadEnvFile('.env.local');
  } catch {}

  const { getPayload } = await import('payload');
  const { default: config } = await import('../../src/payload.config');
  payload = await getPayload({ config });

  const user = await payload.create({
    collection: 'users',
    data: { email, password, roles: ['super-admin'] },
    overrideAccess: true,
    context: { [FIRST_USER_BOOTSTRAP_CONTEXT]: true },
  });
  userId = user.id;
  expect(userId).toBeTruthy();

  const page = await payload.create({
    collection: 'pages',
    data: {
      title: `CP-4.3 E2E ${stamp}`,
      slug: pageSlug,
      template: 'standard',
      _status: 'draft',
      seo: { metaTitle: `CP-4.3 E2E ${stamp}`, metaDescription: 'End-to-end publish fixture.' },
      layout: [
        {
          blockType: 'textBlocks',
          headline: 'E2E draft headline',
          paragraphs: [{ paragraph: 'E2E fixture body.' }],
        },
      ],
    },
    overrideAccess: true,
  });
  pageId = page.id;
});

test.afterAll(async () => {
  if (!payload) return;
  await payload.delete({ collection: 'pages', id: pageId, overrideAccess: true }).catch(() => {});
  await payload.delete({ collection: 'users', id: userId, overrideAccess: true }).catch(() => {});
  await payload.destroy();
});

test('edit, limit, publish, conflict and version restore', async ({ page }) => {
  // A draft is not public.
  expect((await page.request.get(`/${pageSlug}`)).status()).toBe(404);

  await login(page);
  await page.goto(`/${pageSlug}`);
  await expect(page.getByText('Editing', { exact: true })).toBeVisible();

  // Edit a headline and save a draft; visitors still see nothing.
  await page.getByRole('button', { name: 'Edit Text Blocks' }).click();
  const box = page.getByRole('dialog');
  await box.waitFor();
  const headline = box.getByLabel('Headline');
  await headline.fill('E2E saved draft headline');
  await box.getByRole('button', { name: 'Save draft' }).click();
  await expect(box.getByText('Draft saved')).toBeVisible();
  await box.getByRole('button', { name: 'Close' }).last().click();
  await expect(box).toBeHidden();
  expect((await page.request.get(`/${pageSlug}`)).status()).toBe(404);

  // The field hard-stops at the shared limit.
  await page.getByRole('button', { name: 'Edit Text Blocks' }).click();
  const limitBox = page.getByRole('dialog');
  const limitInput = limitBox.getByLabel('Headline');
  await limitInput.fill('x'.repeat(120));
  expect((await limitInput.inputValue()).length).toBe(80);
  await expect(limitBox.getByText('80 / 80')).toBeVisible();
  await limitBox.getByLabel('Headline').fill(publishedHeadline);
  await limitBox.getByRole('button', { name: 'Save draft' }).click();
  await expect(limitBox.getByText('Draft saved')).toBeVisible();
  await limitBox.getByRole('button', { name: 'Close' }).last().click();

  // Publishing makes the draft live and drops all edit markup from public HTML.
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await expect(page.getByText('Published', { exact: true })).toBeVisible({ timeout: 15000 });

  expect(
    (
      await payload.findByID({
        collection: 'pages',
        id: pageId,
        depth: 0,
        overrideAccess: true,
      })
    )._status,
  ).toBe('published');

  // The public route is tag-revalidated by the publish; allow the cache a moment.
  await expect
    .poll(async () => (await page.request.get(`/${pageSlug}`)).status(), { timeout: 15000 })
    .toBe(200);
  const publicHtml = await (await page.request.get(`/${pageSlug}`)).text();
  expect(publicHtml).toContain(publishedHeadline);
  expect(publicHtml).not.toContain('aria-label="Edit ');

  // A stale expected version shows the conflict choices, including the diff.
  await page.getByRole('button', { name: 'Edit Text Blocks' }).click();
  const conflictBox = page.getByRole('dialog');
  await conflictBox.getByLabel('Headline').fill('E2E mine wins');

  // Another editor changes the same block while this box is open. Keep the
  // block id so this is a real version conflict, not a removed section.
  const currentDraft = await payload.findByID({
    collection: 'pages',
    id: pageId,
    draft: true,
    depth: 0,
    overrideAccess: true,
  });
  const layout = currentDraft.layout ?? [];
  await payload.update({
    collection: 'pages',
    id: pageId,
    data: {
      layout: layout.map((block, index) =>
        index === 0 ? { ...block, headline: 'E2E theirs' } : block,
      ),
    },
    draft: true,
    overrideAccess: true,
  });

  await conflictBox.getByRole('button', { name: 'Save draft' }).click();
  await expect(
    conflictBox.getByText('This content changed while you were editing.').first(),
  ).toBeVisible();
  await conflictBox.getByRole('button', { name: 'See differences' }).click();
  await expect(conflictBox.getByText('Theirs: E2E theirs')).toBeVisible();
  await conflictBox.getByRole('button', { name: 'Keep mine' }).click();
  await expect(conflictBox.getByText('Draft saved')).toBeVisible();
  await conflictBox.getByRole('button', { name: 'Close' }).last().click();

  // Version history restores an earlier version as the draft.
  await page.getByRole('button', { name: 'Versions', exact: true }).click();
  const versions = page.getByRole('dialog', { name: 'Version history' });
  await expect(versions).toBeVisible();
  await expect(
    versions.getByRole('button', { name: 'Restore this version' }).first(),
  ).toBeVisible();
  await versions.getByRole('button', { name: 'Restore this version' }).first().click();
  await expect(page.getByText('Version restored as a draft')).toBeVisible();
  await expect(versions).toBeHidden();

  // The same flow fits a 360 px viewport (mobile staff bar and edit buttons).
  await page.setViewportSize({ width: 360, height: 740 });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Publish', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Edit Text Blocks' })).toBeVisible();
});
