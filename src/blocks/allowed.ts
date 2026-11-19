import type { Block } from 'payload';

import { BLOCKS } from './index';

/**
 * Which blocks each collection may use (docs/DATABASE.md §3).
 * `pages` gets the full implemented set; other collections opt in as they land.
 */
export const allowedBlocks: Record<string, Block[]> = {
  pages: BLOCKS,
};

/** Block slugs used by the `pages` `layout` field. */
export const PAGE_BLOCKS = allowedBlocks.pages;
