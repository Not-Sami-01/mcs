import type { Payload } from 'payload';

import type { Page } from '@/payload-types';
import type { EditField } from './registry';
import { getEditableFields } from './registry';
import type { EditSession } from './session';

type SessionUser = Extract<EditSession, { status: 'ok' }>['user'];
type Block = NonNullable<Page['layout']>[number];

export type SaveDraftInput = {
  pageId: number | string;
  blockId?: string | null;
  blockIndex: number;
  values: Record<string, string>;
};

export type SaveDraftResult =
  | { ok: true; updatedAt: string }
  | {
      ok: false;
      code: 'INVALID' | 'NOT_FOUND' | 'FORBIDDEN';
      message: string;
      fields?: Record<string, string>;
    };

function validateValue(
  field: EditField,
  raw: string,
): { value: string | number } | { error: string } {
  if (field.type === 'number') {
    if (raw.trim() === '') {
      return field.required ? { error: `${field.label} is required.` } : { value: '' };
    }

    const value = Number(raw);
    if (!Number.isFinite(value) || !Number.isInteger(value))
      return { error: 'Use a whole number.' };
    if (field.min !== undefined && value < field.min) return { error: `Minimum is ${field.min}.` };
    if (field.max !== undefined && value > field.max) return { error: `Maximum is ${field.max}.` };
    return { value };
  }

  if (field.type === 'select') {
    if (raw === '' && !field.required) return { value: raw };
    if (!field.options?.some((option) => option.value === raw)) {
      return { error: 'Choose one of the listed options.' };
    }
    return { value: raw };
  }

  if (raw === '' && field.required) return { error: `${field.label} is required.` };
  if (field.maxLength !== undefined && raw.length > field.maxLength) {
    return { error: `Limit reached: ${field.maxLength} characters.` };
  }

  return { value: raw };
}

/**
 * Save scalar block fields to a **draft** (CP-4.1). Publishing is a separate
 * explicit action (CP-4.3), so a visitor keeps seeing the published version.
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

  const fields = getEditableFields(block.blockType);
  if (fields.length === 0) {
    return { ok: false, code: 'FORBIDDEN', message: 'This section is not editable here.' };
  }

  const values: Record<string, string | number> = {};
  const errors: Record<string, string> = {};

  for (const [name, raw] of Object.entries(input.values)) {
    const field = fields.find((candidate) => candidate.name === name);
    if (!field || typeof raw !== 'string') {
      return { ok: false, code: 'INVALID', message: 'Unknown field in this section.' };
    }

    const result = validateValue(field, raw);
    if ('error' in result) {
      errors[name] = result.error;
    } else {
      values[name] = result.value;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, code: 'INVALID', message: 'Some fields need attention.', fields: errors };
  }

  layout[index] = { ...block, ...values } as Block;

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

  return { ok: true, updatedAt: updated.updatedAt };
}
