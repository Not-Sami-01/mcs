import type { Block } from 'payload';

import { BLOCKS } from './index';

/**
 * Which blocks each collection may use (docs/DATABASE.md §3).
 * `pages` gets the full implemented set; other collections opt in as they land.
 */
export const allowedBlocks: Record<string, Block[]> = {
  pages: BLOCKS,
  // A service detail already renders its H1, signs, steps and FAQs. Extra
  // blocks are optional; a grid or a second hero would duplicate the page's
  // own heading and service list.
  services: BLOCKS.filter((block) => block.slug !== 'servicesGrid' && block.slug !== 'hero'),
};

/** Block slugs used by the `pages` `layout` field. */
export const PAGE_BLOCKS = allowedBlocks.pages;

/** Blocks allowed in a service's optional extra layout. */
export const SERVICE_BLOCKS = allowedBlocks.services;
