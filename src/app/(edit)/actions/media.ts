'use server';

import { headers } from 'next/headers';

import { getEditSession } from '@/edit/session';

export type MediaOption = {
  id: number | string;
  alt: string;
  url: string | null;
  thumb: string | null;
};

/** Images for the content box picker. Editors only; returns no secrets. */
export async function listMediaAction(): Promise<MediaOption[]> {
  const session = await getEditSession(await headers());
  if (session.status !== 'ok') return [];

  const { docs } = await session.payload.find({
    collection: 'media',
    limit: 200,
    depth: 0,
    sort: '-createdAt',
    overrideAccess: false,
    user: session.user,
  });

  return docs.flatMap((doc) => {
    const media = doc as {
      id: number | string;
      alt?: string | null;
      url?: string | null;
      sizes?: { thumb?: { url?: string | null } | null } | null;
    };
    if (typeof media.id !== 'number' && typeof media.id !== 'string') return [];
    return [
      {
        id: media.id,
        alt: media.alt ?? '',
        url: media.url ?? null,
        thumb: media.sizes?.thumb?.url ?? media.url ?? null,
      },
    ];
  });
}
