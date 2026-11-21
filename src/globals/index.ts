import type { GlobalConfig } from 'payload';

import { Navigation } from './Navigation';
import { SiteSettings } from './SiteSettings';

export const GLOBALS: GlobalConfig[] = [SiteSettings, Navigation];

export { Navigation, SiteSettings };
