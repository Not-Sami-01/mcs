import type { CollectionConfig } from 'payload';

import { AuditLogs } from './AuditLogs';
import { Categories } from './Categories';
import { Locations } from './Locations';
import { Media } from './Media';
import { Pages } from './Pages';
import { Posts } from './Posts';
import { PriceHistory } from './PriceHistory';
import { Products } from './Products';
import { Reviews } from './Reviews';
import { Services } from './Services';
import { Users } from './Users';

/**
 * Every collection, in one place so `payload.config.ts` and the config test
 * (`src/cms/config.test.ts`) walk exactly the same set.
 */
export const COLLECTIONS: CollectionConfig[] = [
  Users,
  Media,
  Categories,
  Pages,
  Services,
  Locations,
  Products,
  Posts,
  Reviews,
  PriceHistory,
  AuditLogs,
];
