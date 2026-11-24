'use server';

import { headers } from 'next/headers';

import { GLOBAL_REGION_KEYS, type GlobalRegionKey } from '@/edit/global-regions';
import { saveGlobalRegion } from '@/edit/save-global';
import { getEditSession } from '@/edit/session';

export type SaveGlobalActionInput = {
  region: GlobalRegionKey;
  values: Record<string, unknown>;
};

export type SaveGlobalActionResult =
  | { ok: true }
  | {
      ok: false;
      code: 'AUTH' | 'TWO_FACTOR' | 'INVALID' | 'NOT_FOUND' | 'FORBIDDEN';
      message: string;
      fields?: Record<string, string>;
    };

function parseInput(value: unknown): SaveGlobalActionInput | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  if (typeof input.region !== 'string') return null;
  if (!GLOBAL_REGION_KEYS.includes(input.region as GlobalRegionKey)) return null;
  if (!input.values || typeof input.values !== 'object' || Array.isArray(input.values)) {
    return null;
  }
  if (JSON.stringify(input.values).length > 100_000) return null;

  return {
    region: input.region as GlobalRegionKey,
    values: input.values as Record<string, unknown>,
  };
}

/** Server Action for global regions (CP-4.2); same checks as block saves. */
export async function saveGlobalAction(input: unknown): Promise<SaveGlobalActionResult> {
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

  return saveGlobalRegion({ payload: session.payload, user: session.user, input: parsed });
}
