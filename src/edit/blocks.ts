import type { Payload } from 'payload';

import { PAGE_BLOCKS } from '@/blocks/allowed';
import { COUNT_LIMITS } from '@/cms/limits';
import type { Page } from '@/payload-types';
import type { EditSession } from './session';

type SessionUser = Extract<EditSession, { status: 'ok' }>['user'];
type Block = NonNullable<Page['layout']>[number];

export type BlockActionInput =
  | { op: 'add'; pageId: number | string; blockType: string; index: number }
  | { op: 'duplicate' | 'remove' | 'toggleHidden'; pageId: number | string; blockId: string }
  | { op: 'move'; pageId: number | string; blockId: string; direction: 'up' | 'down' };

export type BlockActionResult =
  { ok: true } | { ok: false; code: 'INVALID' | 'NOT_FOUND' | 'FORBIDDEN'; message: string };

const { min, max } = COUNT_LIMITS.blocksPerPage;

function findIndex(layout: Block[], blockId: string): number {
  return layout.findIndex((block) => block.id === blockId);
}

/**
 * Draft-only block management for the edit route (CP-4.2). Every operation
 * writes the whole layout as a draft, so a visitor never sees the change until
 * publishing (CP-4.3).
 */
export async function applyBlockAction({
  payload,
  user,
  input,
}: {
  payload: Payload;
  user: SessionUser;
  input: BlockActionInput;
}): Promise<BlockActionResult> {
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

  switch (input.op) {
    case 'add': {
      if (!PAGE_BLOCKS.some((block) => block.slug === input.blockType)) {
        return { ok: false, code: 'INVALID', message: 'That section type is not available.' };
      }
      if (layout.length >= max) {
        return { ok: false, code: 'INVALID', message: `Limit reached: ${max} sections.` };
      }
      const index = Math.max(0, Math.min(input.index, layout.length));
      layout.splice(index, 0, { blockType: input.blockType } as Block);
      break;
    }

    case 'duplicate': {
      const index = findIndex(layout, input.blockId);
      if (index < 0) return { ok: false, code: 'NOT_FOUND', message: 'Section not found.' };
      if (layout.length >= max) {
        return { ok: false, code: 'INVALID', message: `Limit reached: ${max} sections.` };
      }
      const copy = { ...layout[index] } as Block & { id?: string };
      delete copy.id;
      layout.splice(index + 1, 0, copy as Block);
      break;
    }

    case 'remove': {
      const index = findIndex(layout, input.blockId);
      if (index < 0) return { ok: false, code: 'NOT_FOUND', message: 'Section not found.' };
      if (layout.length <= min) {
        return { ok: false, code: 'INVALID', message: `Keep at least ${min} section.` };
      }
      layout.splice(index, 1);
      break;
    }

    case 'move': {
      const index = findIndex(layout, input.blockId);
      if (index < 0) return { ok: false, code: 'NOT_FOUND', message: 'Section not found.' };
      const target = input.direction === 'up' ? index - 1 : index + 1;
      if (target >= 0 && target < layout.length) {
        [layout[index], layout[target]] = [layout[target], layout[index]];
      }
      break;
    }

    case 'toggleHidden': {
      const index = findIndex(layout, input.blockId);
      if (index < 0) return { ok: false, code: 'NOT_FOUND', message: 'Section not found.' };
      layout[index] = { ...layout[index], hidden: !layout[index].hidden } as Block;
      break;
    }
  }

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

  return { ok: true };
}
