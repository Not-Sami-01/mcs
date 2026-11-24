import type { Page } from '@/payload-types';

export type PageBlock = NonNullable<Page['layout']>[number];

/** Narrow the Page layout union to one block type. */
export type BlockOf<T extends PageBlock['blockType']> = Extract<PageBlock, { blockType: T }>;
