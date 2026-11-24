'use server';

import { headers } from 'next/headers';

import { applyBlockAction, type BlockActionInput, type BlockActionResult } from '@/edit/blocks';
import { getEditSession } from '@/edit/session';

export type BlockActionResponse =
  | BlockActionResult
  | {
      ok: false;
      code: 'AUTH' | 'TWO_FACTOR';
      message: string;
    };

function parsePageId(value: unknown): number | string | null {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value === 'string' && value.length > 0 && value.length <= 64) return value;
  return null;
}

function parseInput(value: unknown): BlockActionInput | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  const pageId = parsePageId(input.pageId);
  if (pageId === null) return null;

  if (input.op === 'add') {
    if (typeof input.blockType !== 'string' || input.blockType.length > 80) return null;
    if (typeof input.index !== 'number' || !Number.isInteger(input.index)) return null;
    return { op: 'add', pageId, blockType: input.blockType, index: input.index };
  }

  if (
    typeof input.blockId !== 'string' ||
    input.blockId.length === 0 ||
    input.blockId.length > 64
  ) {
    return null;
  }

  if (input.op === 'duplicate' || input.op === 'remove' || input.op === 'toggleHidden') {
    return { op: input.op, pageId, blockId: input.blockId };
  }

  if (input.op === 'move' && (input.direction === 'up' || input.direction === 'down')) {
    return { op: 'move', pageId, blockId: input.blockId, direction: input.direction };
  }

  return null;
}

/**
 * Server Action for the block toolbar (CP-4.2). Authorization, role and
 * two-factor state are checked here on every change, then again by the
 * collection access rules inside `applyBlockAction`.
 */
export async function blockAction(input: unknown): Promise<BlockActionResponse> {
  const session = await getEditSession(await headers());

  if (session.status === 'anonymous') {
    return { ok: false, code: 'AUTH', message: 'Sign in again to edit.' };
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

  return applyBlockAction({ payload: session.payload, user: session.user, input: parsed });
}
