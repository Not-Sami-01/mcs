'use server';

import { headers } from 'next/headers';

import {
  discardPageDraft,
  listPageVersions,
  publishPage,
  restorePageVersion,
  schedulePagePublish,
  type PageVersionSummary,
  type PublishResult,
} from '@/edit/publish';
import { getEditSession } from '@/edit/session';

type Denied = { ok: false; code: 'AUTH' | 'TWO_FACTOR' | 'FORBIDDEN'; message: string };

function parsePageId(value: unknown): number | string | null {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value === 'string' && value.length > 0 && value.length <= 64) return value;
  return null;
}

type Authorized =
  | { ok: true; session: Extract<Awaited<ReturnType<typeof getEditSession>>, { status: 'ok' }> }
  | { ok: false; denied: Denied };

async function authorized(): Promise<Authorized> {
  const session = await getEditSession(await headers());
  if (session.status === 'ok') return { ok: true, session };

  const denied: Denied =
    session.status === 'anonymous'
      ? { ok: false, code: 'AUTH', message: 'Sign in again.' }
      : session.status === 'totp'
        ? { ok: false, code: 'TWO_FACTOR', message: 'Verify two-factor authentication again.' }
        : { ok: false, code: 'FORBIDDEN', message: 'You cannot edit this content.' };
  return { ok: false, denied };
}

export async function publishPageAction(pageIdValue: unknown): Promise<PublishResult | Denied> {
  const auth = await authorized();
  if (!auth.ok) return auth.denied;

  const pageId = parsePageId(pageIdValue);
  if (pageId === null) {
    return { ok: false, code: 'INVALID', message: 'That page could not be read.' };
  }

  return publishPage({ payload: auth.session.payload, user: auth.session.user, pageId });
}

export async function discardDraftAction(pageIdValue: unknown): Promise<PublishResult | Denied> {
  const auth = await authorized();
  if (!auth.ok) return auth.denied;

  const pageId = parsePageId(pageIdValue);
  if (pageId === null) {
    return { ok: false, code: 'INVALID', message: 'That page could not be read.' };
  }

  return discardPageDraft({ payload: auth.session.payload, user: auth.session.user, pageId });
}

export async function schedulePublishAction(
  pageIdValue: unknown,
  publishAtValue: unknown,
  unpublishAtValue: unknown,
): Promise<PublishResult | Denied> {
  const auth = await authorized();
  if (!auth.ok) return auth.denied;

  const pageId = parsePageId(pageIdValue);
  if (pageId === null) {
    return { ok: false, code: 'INVALID', message: 'That page could not be read.' };
  }

  return schedulePagePublish({
    payload: auth.session.payload,
    user: auth.session.user,
    pageId,
    publishAt: publishAtValue,
    unpublishAt: unpublishAtValue,
  });
}

export async function listVersionsAction(
  pageIdValue: unknown,
): Promise<{ ok: true; versions: PageVersionSummary[] } | Denied> {
  const auth = await authorized();
  if (!auth.ok) return auth.denied;

  const pageId = parsePageId(pageIdValue);
  if (pageId === null) return { ok: false, code: 'AUTH', message: 'That page could not be read.' };

  return {
    ok: true,
    versions: await listPageVersions({
      payload: auth.session.payload,
      user: auth.session.user,
      pageId,
    }),
  };
}

export async function restoreVersionAction(
  pageIdValue: unknown,
  versionIdValue: unknown,
): Promise<PublishResult | Denied> {
  const auth = await authorized();
  if (!auth.ok) return auth.denied;

  const pageId = parsePageId(pageIdValue);
  if (pageId === null || typeof versionIdValue !== 'string' || versionIdValue.length > 64) {
    return { ok: false, code: 'INVALID', message: 'That version could not be read.' };
  }

  return restorePageVersion({
    payload: auth.session.payload,
    user: auth.session.user,
    pageId,
    versionId: versionIdValue,
  });
}
