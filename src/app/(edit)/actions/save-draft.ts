'use server';

import { headers } from 'next/headers';

import { saveBlockDraft } from '@/edit/save-draft';
import { getEditSession } from '@/edit/session';

export type SaveDraftActionInput = {
  pageId: number | string;
  blockId?: string | null;
  blockIndex: number;
  values: Record<string, unknown>;
  expectedUpdatedAt?: string | null;
};

export type SaveDraftActionResult =
  | { ok: true; updatedAt: string }
  | {
      ok: false;
      code: 'AUTH' | 'TWO_FACTOR' | 'INVALID' | 'NOT_FOUND' | 'FORBIDDEN' | 'CONFLICT';
      message: string;
      fields?: Record<string, string>;
      serverUpdatedAt?: string;
      serverValues?: Record<string, unknown>;
    };

function parseInput(value: unknown): SaveDraftActionInput | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;

  const pageId = input.pageId;
  if (
    !(typeof pageId === 'string' && pageId.length > 0 && pageId.length <= 64) &&
    !(typeof pageId === 'number' && Number.isInteger(pageId))
  ) {
    return null;
  }

  if (typeof input.blockIndex !== 'number' || !Number.isInteger(input.blockIndex)) return null;
  if (input.blockId !== undefined && input.blockId !== null && typeof input.blockId !== 'string') {
    return null;
  }
  if (!input.values || typeof input.values !== 'object' || Array.isArray(input.values)) {
    return null;
  }

  // Nested repeaters make the payload bigger, so cap the serialized size and
  // trust the recursive registry validation for shape and limits.
  const serialized = JSON.stringify(input.values);
  if (serialized.length > 100_000) return null;

  const expectedUpdatedAt = input.expectedUpdatedAt;
  if (
    expectedUpdatedAt !== undefined &&
    expectedUpdatedAt !== null &&
    typeof expectedUpdatedAt !== 'string'
  ) {
    return null;
  }

  return {
    pageId,
    blockId: (input.blockId as string | null | undefined) ?? null,
    blockIndex: input.blockIndex,
    values: input.values as Record<string, unknown>,
    expectedUpdatedAt: (expectedUpdatedAt as string | null | undefined) ?? null,
  };
}

/**
 * Server Action for the content box (CP-4.1). Authorization, role and
 * two-factor state are checked here on every save, then again by the
 * collection access rules inside `saveBlockDraft`.
 */
export async function saveDraftAction(input: unknown): Promise<SaveDraftActionResult> {
  const session = await getEditSession(await headers());

  if (session.status === 'anonymous') {
    return { ok: false, code: 'AUTH', message: 'Sign in again to save.' };
  }
  if (session.status === 'totp') {
    return { ok: false, code: 'TWO_FACTOR', message: 'Verify two-factor authentication again.' };
  }
  if (session.status === 'forbidden') {
    return { ok: false, code: 'FORBIDDEN', message: 'You cannot edit this content.' };
  }

  const parsed = parseInput(input);
  if (!parsed) {
    return { ok: false, code: 'INVALID', message: 'That change could not be read.' };
  }

  return saveBlockDraft({ payload: session.payload, user: session.user, input: parsed });
}
