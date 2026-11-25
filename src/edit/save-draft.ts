import type { Payload } from 'payload';

import type { Page } from '@/payload-types';
import { getEditableSchema } from './registry';
import type { EditSession } from './session';
import { isRecord, validateGroup } from './validation';

type SessionUser = Extract<EditSession, { status: 'ok' }>['user'];
type Block = NonNullable<Page['layout']>[number];

export type SaveDraftInput = {
  pageId: number | string;
  blockId?: string | null;
  blockIndex: number;
  values: Record<string, unknown>;
  expectedUpdatedAt?: string | null;
};

export type SaveDraftResult =
  | { ok: true; updatedAt: string }
  | {
      ok: false;
      code: 'INVALID' | 'NOT_FOUND' | 'FORBIDDEN' | 'CONFLICT';
      message: string;
      fields?: Record<string, string>;
      serverUpdatedAt?: string;
      /** The saved values the editor can compare against when a conflict is shown. */
      serverValues?: Record<string, unknown>;
    };

/**
 * Save editable block fields to a **draft** (CP-4.1/CP-4.2). Publishing is a
 * separate explicit action (CP-4.3), so a visitor keeps seeing the published
 * version.
 *
 * Access is enforced twice: the caller must have an Editor/Super Admin
 * session, and the Local API call runs with `overrideAccess: false` and the
 * staff user so the collection's own rules apply.
 */
export async function saveBlockDraft({
  payload,
  user,
  input,
}: {
  payload: Payload;
  user: SessionUser;
  input: SaveDraftInput;
}): Promise<SaveDraftResult> {
  const page = await payload
    .findByID({
      collection: 'pages',
      id: input.pageId,
      draft: true,
      depth: 0,
      overrideAccess: false,
      user,
    })
    .catch(() => null);

  if (!page) {
    return { ok: false, code: 'NOT_FOUND', message: 'This page is no longer available.' };
  }

  const layout: Block[] = (page.layout ?? []).map((block) => ({ ...block }));
  const index = input.blockId
    ? layout.findIndex((block) => block.id === input.blockId)
    : input.blockIndex;

  const block = layout[index];
  if (!block || !Number.isInteger(index) || index < 0) {
    return {
      ok: false,
      code: 'NOT_FOUND',
      message: 'This section was changed by someone else. Reload the page.',
    };
  }

  const schema = getEditableSchema(block.blockType);
  if (schema.length === 0) {
    return { ok: false, code: 'FORBIDDEN', message: 'This section is not editable here.' };
  }

  if (input.expectedUpdatedAt && page.updatedAt !== input.expectedUpdatedAt) {
    const saved = block as unknown as Record<string, unknown>;
    const serverValues: Record<string, unknown> = {};
    for (const node of schema) {
      if (saved[node.name] !== undefined) serverValues[node.name] = saved[node.name];
    }

    return {
      ok: false,
      code: 'CONFLICT',
      message: 'This content changed while you were editing.',
      serverUpdatedAt: page.updatedAt,
      serverValues,
    };
  }

  const { values, errors } = validateGroup(schema, input.values, '');

  if (Object.keys(errors).length > 0) {
    return { ok: false, code: 'INVALID', message: 'Some fields need attention.', fields: errors };
  }

  const current = block as unknown as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...current };

  for (const node of schema) {
    const existing = current[node.name];
    const next = values[node.name];
    if (node.type === 'group' && isRecord(existing) && isRecord(next)) {
      merged[node.name] = { ...existing, ...next };
    } else if (next !== undefined) {
      merged[node.name] = next;
    }
  }

  layout[index] = merged as Block;

  const updated = await payload
    .update({
      collection: 'pages',
      id: page.id,
      data: { layout },
      draft: true,
      overrideAccess: false,
      user,
    })
    .catch(() => null);

  if (!updated) {
    return { ok: false, code: 'FORBIDDEN', message: 'You cannot edit this page.' };
  }

  // `update` returns the document, but the optimistic check above reads the
  // latest **draft** version. Return that same timestamp so the next save from
  // this content box compares like with like.
  const fresh = await payload
    .findByID({
      collection: 'pages',
      id: page.id,
      draft: true,
      depth: 0,
      overrideAccess: false,
      user,
    })
    .catch(() => null);

  return { ok: true, updatedAt: fresh?.updatedAt ?? updated.updatedAt };
}
