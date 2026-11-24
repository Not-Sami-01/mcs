import type { Field } from 'payload';

import { Navigation } from '@/globals/Navigation';
import { SiteSettings } from '@/globals/SiteSettings';
import { getInitialValues, toEditNodes, type EditNode } from './registry';

/**
 * Global regions editable from the staff bar (CP-4.2). Only fields an Editor
 * may change are exposed: the sensitive `site-settings` fields (chat, alert
 * recipients, retention) stay admin-panel only, enforced by field access.
 */
const REGIONS = {
  navigation: {
    slug: 'navigation',
    label: 'Menu and footer',
    fields: ['headerItems', 'headerButtons', 'footerColumns', 'legalLinks'],
  },
  contact: {
    slug: 'site-settings',
    label: 'Contact details',
    fields: ['companyName', 'phones', 'whatsappNumber', 'email', 'address', 'workingHours'],
  },
} as const;

export type GlobalRegionKey = keyof typeof REGIONS;
export const GLOBAL_REGION_KEYS = Object.keys(REGIONS) as GlobalRegionKey[];

function configFields(slug: string): Field[] {
  const config = slug === 'navigation' ? Navigation : SiteSettings;
  return config.fields as Field[];
}

function regionFields(key: GlobalRegionKey): Field[] {
  const config = REGIONS[key];
  const byName = new Map(
    configFields(config.slug).flatMap((field) =>
      'name' in field && typeof field.name === 'string' ? [[field.name, field] as const] : [],
    ),
  );

  return config.fields.flatMap((name) => {
    const field = byName.get(name);
    return field ? [field] : [];
  });
}

export function getGlobalSchema(key: GlobalRegionKey): EditNode[] {
  return toEditNodes(regionFields(key));
}

export function getGlobalRegion(key: GlobalRegionKey) {
  return { slug: REGIONS[key].slug, label: REGIONS[key].label };
}

export function getGlobalInitialValues(
  key: GlobalRegionKey,
  doc: Record<string, unknown>,
): Record<string, unknown> {
  return getInitialValues(getGlobalSchema(key), doc);
}
