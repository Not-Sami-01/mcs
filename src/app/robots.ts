import type { MetadataRoute } from 'next';

import { getRobotsFile } from '@/config/site-env';

export default function robots(): MetadataRoute.Robots {
  return getRobotsFile();
}
