import type { CollectionConfig } from 'payload';

import { Categories } from './Categories';
import { Media } from './Media';
import { Pages } from './Pages';
import { Users } from './Users';

/**
 * Every collection, in one place so `payload.config.ts` and the config test
 * (`src/cms/config.test.ts`) walk exactly the same set.
 */
export const COLLECTIONS: CollectionConfig[] = [Users, Media, Categories, Pages];
