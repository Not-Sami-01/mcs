import type { Payload } from 'payload';

import { hasRole } from '@/access/roles';
import type { Page } from '@/payload-types';
import type { EditSession } from './session';

type SessionUser = Extract<EditSession, { status: 'ok' }>['user'];

export type PublishProblem = { field: string; message: string };

export type PublishResult =
  | { ok: true; updatedAt: string }
  | {
      ok: false;
      code: 'INVALID' | 'NOT_FOUND' | 'FORBIDDEN' | 'GATES';
      message: string;
      problems?: PublishProblem[];
    };

const SYSTEM_KEYS = new Set(['id', 'createdAt', 'updatedAt', 'blockName', 'hidden']);

function findTodo(value: unknown, path: string, problems: PublishProblem[]): void {
  if (typeof value === 'string') {
    if (value.includes('TODO(client)')) {
      problems.push({
        field: path,
        message: 'Replace the TODO(client) placeholder before publishing.',
      });
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => findTodo(item, `${path}.${index}`, problems));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (SYSTEM_KEYS.has(key)) continue;
      findTodo(child, path ? `${path}.${key}` : key, problems);
    }
  }
}

/**
 * Publish gates from docs/INLINE-EDITING.md §9, checked on the server before
 * the page goes live. Field-level rules (required proof notes, consent) are
 * also enforced by Payload; this layer adds the cross-field and text rules.
 */
export function collectPublishProblems(page: Page): PublishProblem[] {
  const problems: PublishProblem[] = [];
  const metaTitle = page.seo?.metaTitle?.trim();
  const metaDescription = page.seo?.metaDescription?.trim();

  if (!metaTitle) {
    problems.push({ field: 'seo.metaTitle', message: 'Add a meta title before publishing.' });
  }
  if (!metaDescription) {
    problems.push({
      field: 'seo.metaDescription',
      message: 'Add a meta description before publishing.',
    });
  }

  findTodo({ title: page.title, seo: page.seo, layout: page.layout }, '', problems);

  for (const [index, block] of (page.layout ?? []).entries()) {
    if (block.hidden) continue;

    if (block.blockType === 'trustStrip') {
      for (const [itemIndex, item] of (block.items ?? []).entries()) {
        if (!item.proofNote?.trim()) {
          problems.push({
            field: `layout.${index}.items.${itemIndex}.proofNote`,
            message: 'Every stat needs a proof note before publishing.',
          });
        }
      }
    }

    if (block.blockType === 'ourDifference' && !block.proofNote?.trim()) {
      problems.push({
        field: `layout.${index}.proofNote`,
        message: 'Add a proof note before publishing this section.',
      });
    }
  }

  return problems;
}

function writableData(page: Page): Record<string, unknown> {
  const data = { ...(page as unknown as Record<string, unknown>) };
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  return data;
}

/** Publish the current draft; visitors only see it after this succeeds. */
export async function publishPage({
  payload,
  user,
  pageId,
}: {
  payload: Payload;
  user: SessionUser;
  pageId: number | string;
}): Promise<PublishResult> {
  const page = await payload
    .findByID({
      collection: 'pages',
      id: pageId,
      draft: true,
      depth: 2,
      overrideAccess: false,
      user,
    })
    .catch(() => null);

  if (!page) {
    return { ok: false, code: 'NOT_FOUND', message: 'This page is no longer available.' };
  }

  if (page.isLegal && !hasRole(user, 'super-admin')) {
    return {
      ok: false,
      code: 'FORBIDDEN',
      message: 'Legal pages can only be published by a Super Admin.',
    };
  }

  const problems = collectPublishProblems(page);
  if (problems.length > 0) {
    return {
      ok: false,
      code: 'GATES',
      message: 'Fix these before publishing:',
      problems,
    };
  }

  const updated = await payload
    .update({
      collection: 'pages',
      id: page.id,
      data: {
        ...writableData(page),
        _status: 'published',
        publishedAt: page.publishedAt ?? new Date().toISOString(),
      },
      overrideAccess: false,
      user,
    })
    .catch(() => null);

  if (!updated) {
    return { ok: false, code: 'FORBIDDEN', message: 'You cannot publish this page.' };
  }

  return { ok: true, updatedAt: updated.updatedAt };
}

/** Roll the draft back to the currently published content. */
export async function discardPageDraft({
  payload,
  user,
  pageId,
}: {
  payload: Payload;
  user: SessionUser;
  pageId: number | string;
}): Promise<PublishResult> {
  const published = await payload
    .findByID({
      collection: 'pages',
      id: pageId,
      depth: 2,
      overrideAccess: false,
      user,
    })
    .catch(() => null);

  if (!published) {
    return { ok: false, code: 'NOT_FOUND', message: 'This page is no longer available.' };
  }
  if (published._status !== 'published') {
    return {
      ok: false,
      code: 'INVALID',
      message: 'This page has no published version to restore the draft from.',
    };
  }

  const updated = await payload
    .update({
      collection: 'pages',
      id: pageId,
      data: { ...writableData(published), _status: 'draft' },
      draft: true,
      overrideAccess: false,
      user,
    })
    .catch(() => null);

  if (!updated) {
    return { ok: false, code: 'FORBIDDEN', message: 'You cannot edit this page.' };
  }

  return { ok: true, updatedAt: updated.updatedAt };
}

export type ScheduleWindow = { publishAt: Date; unpublishAt: Date | null };

/**
 * `schedulePublish` input check shared by the action and the UI. Both dates are
 * ISO strings; the publish time must be in the future and an unpublish time
 * must come after it (docs/INLINE-EDITING.md §5).
 */
export function parseScheduleWindow({
  publishAt,
  unpublishAt,
  now = new Date(),
}: {
  publishAt: unknown;
  unpublishAt?: unknown;
  now?: Date;
}): { ok: true; window: ScheduleWindow } | { ok: false } {
  if (typeof publishAt !== 'string' || !publishAt.trim()) return { ok: false };
  const publishDate = new Date(publishAt);
  if (Number.isNaN(publishDate.getTime()) || publishDate.getTime() <= now.getTime()) {
    return { ok: false };
  }

  if (unpublishAt === undefined || unpublishAt === null || unpublishAt === '') {
    return { ok: true, window: { publishAt: publishDate, unpublishAt: null } };
  }
  if (typeof unpublishAt !== 'string') return { ok: false };

  const unpublishDate = new Date(unpublishAt);
  if (Number.isNaN(unpublishDate.getTime()) || unpublishDate.getTime() <= publishDate.getTime()) {
    return { ok: false };
  }

  return { ok: true, window: { publishAt: publishDate, unpublishAt: unpublishDate } };
}

/** Remove queued publish or unpublish jobs for this page before scheduling again. */
async function clearScheduledPublishes({
  payload,
  pageId,
}: {
  payload: Payload;
  pageId: number | string;
}): Promise<void> {
  try {
    const { docs } = await payload.find({
      collection: 'payload-jobs',
      where: {
        and: [{ taskSlug: { equals: 'schedulePublish' } }, { completedAt: { exists: false } }],
      },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    });

    for (const job of docs) {
      const input = job.input as { doc?: { value?: string } } | null | undefined;
      if (String(input?.doc?.value ?? '') !== String(pageId)) continue;
      await payload
        .delete({ collection: 'payload-jobs', id: job.id, overrideAccess: true })
        .catch(() => null);
    }
  } catch {
    // A missing job collection must not stop a schedule; old jobs simply stay.
  }
}

/**
 * Queue Payload's `schedulePublish` job at a future time. Jobs run when the
 * protected `/api/cron/jobs` endpoint is called by the host's cron (see
 * docs/OPERATIONS.md); nothing is published before then.
 */
export async function schedulePagePublish({
  payload,
  user,
  pageId,
  publishAt,
  unpublishAt,
}: {
  payload: Payload;
  user: SessionUser;
  pageId: number | string;
  publishAt: unknown;
  unpublishAt?: unknown;
}): Promise<PublishResult> {
  const page = await payload
    .findByID({
      collection: 'pages',
      id: pageId,
      draft: true,
      depth: 0,
      overrideAccess: false,
      user,
    })
    .catch(() => null);

  if (!page) {
    return { ok: false, code: 'NOT_FOUND', message: 'This page is no longer available.' };
  }

  if (page.isLegal && !hasRole(user, 'super-admin')) {
    return {
      ok: false,
      code: 'FORBIDDEN',
      message: 'Legal pages can only be published by a Super Admin.',
    };
  }

  const parsed = parseScheduleWindow({ publishAt, unpublishAt });
  if (!parsed.ok) {
    return {
      ok: false,
      code: 'INVALID',
      message: 'Choose a future date, with the unpublish time after the publish time.',
    };
  }

  await clearScheduledPublishes({ payload, pageId });

  const jobs = payload.jobs as unknown as {
    queue: (args: {
      task: 'schedulePublish';
      waitUntil: Date;
      input: Record<string, unknown>;
    }) => Promise<unknown>;
  };
  const doc = { relationTo: 'pages', value: String(page.id) };
  const actor = { relationTo: 'users', value: user.id };

  try {
    await jobs.queue({
      task: 'schedulePublish',
      waitUntil: parsed.window.publishAt,
      input: { type: 'publish', doc, user: actor },
    });

    if (parsed.window.unpublishAt) {
      await jobs.queue({
        task: 'schedulePublish',
        waitUntil: parsed.window.unpublishAt,
        input: { type: 'unpublish', doc, user: actor },
      });
    }
  } catch {
    return { ok: false, code: 'INVALID', message: 'The publish could not be scheduled.' };
  }

  return { ok: true, updatedAt: page.updatedAt };
}

export type PageVersionSummary = {
  id: string;
  updatedAt: string;
  status: 'draft' | 'published' | null;
};

export async function listPageVersions({
  payload,
  user,
  pageId,
}: {
  payload: Payload;
  user: SessionUser;
  pageId: number | string;
}): Promise<PageVersionSummary[]> {
  const { docs } = await payload.findVersions({
    collection: 'pages',
    where: { parent: { equals: pageId } },
    sort: '-updatedAt',
    limit: 20,
    depth: 0,
    overrideAccess: false,
    user,
  });

  return docs.flatMap((doc) => {
    const version = doc.version as { _status?: 'draft' | 'published' | null } | undefined;
    if (doc.id === undefined) return [];
    return [
      {
        id: String(doc.id),
        updatedAt: doc.updatedAt,
        status: version?._status ?? null,
      },
    ];
  });
}

/** Restore one version of this page as the draft (never another page's version). */
export async function restorePageVersion({
  payload,
  user,
  pageId,
  versionId,
}: {
  payload: Payload;
  user: SessionUser;
  pageId: number | string;
  versionId: string;
}): Promise<PublishResult> {
  const versions = await listPageVersions({ payload, user, pageId });
  if (!versions.some((version) => version.id === versionId)) {
    return { ok: false, code: 'NOT_FOUND', message: 'That version is not available.' };
  }

  const restored = await payload
    .restoreVersion({
      collection: 'pages',
      id: versionId,
      draft: true,
      overrideAccess: false,
      user,
    })
    .catch(() => null);

  if (!restored) {
    return { ok: false, code: 'FORBIDDEN', message: 'You cannot restore this version.' };
  }

  return { ok: true, updatedAt: restored.updatedAt };
}
