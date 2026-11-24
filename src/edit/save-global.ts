import type { Payload } from 'payload';

import { getGlobalRegion, getGlobalSchema, type GlobalRegionKey } from './global-regions';
import type { EditSession } from './session';
import { isRecord, validateGroup } from './validation';

type SessionUser = Extract<EditSession, { status: 'ok' }>['user'];

export type SaveGlobalInput = {
  region: GlobalRegionKey;
  values: Record<string, unknown>;
};

export type SaveGlobalResult =
  | { ok: true }
  | {
      ok: false;
      code: 'INVALID' | 'NOT_FOUND' | 'FORBIDDEN';
      message: string;
      fields?: Record<string, string>;
    };

/**
 * Save a whitelisted global region (menu/footer or contact details) from the
 * content box. Field-level access on the globals still decides what an Editor
 * may write; the Local API call runs as that user with `overrideAccess: false`.
 */
export async function saveGlobalRegion({
  payload,
  user,
  input,
}: {
  payload: Payload;
  user: SessionUser;
  input: SaveGlobalInput;
}): Promise<SaveGlobalResult> {
  const region = getGlobalRegion(input.region);
  const schema = getGlobalSchema(input.region);

  const { values, errors } = validateGroup(schema, input.values, '');
  if (Object.keys(errors).length > 0) {
    return { ok: false, code: 'INVALID', message: 'Some fields need attention.', fields: errors };
  }

  const slug = region.slug as 'navigation' | 'site-settings';
  const current = (await payload
    .findGlobal({
      slug,
      depth: 0,
      overrideAccess: false,
      user,
    })
    .catch(() => null)) as Record<string, unknown> | null;

  if (!current) {
    return { ok: false, code: 'NOT_FOUND', message: 'These settings are not available.' };
  }

  const data: Record<string, unknown> = {};
  for (const node of schema) {
    const existing = current[node.name];
    const next = values[node.name];
    if (node.type === 'group' && isRecord(existing) && isRecord(next)) {
      data[node.name] = { ...existing, ...next };
    } else if (next !== undefined) {
      data[node.name] = next;
    }
  }

  const updated = await payload
    .updateGlobal({
      slug,
      data,
      overrideAccess: false,
      user,
    })
    .catch(() => null);

  if (!updated) {
    return { ok: false, code: 'FORBIDDEN', message: 'You cannot change these settings.' };
  }

  return { ok: true };
}
