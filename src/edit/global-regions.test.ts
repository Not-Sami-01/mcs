import { describe, expect, it } from 'vitest';

import {
  GLOBAL_REGION_KEYS,
  getGlobalInitialValues,
  getGlobalRegion,
  getGlobalSchema,
} from './global-regions';
import type { EditNode } from './registry';

function walk(nodes: EditNode[]): EditNode[] {
  return nodes.flatMap((node) => [
    node,
    ...(node.type === 'group' || node.type === 'array' ? walk(node.fields) : []),
  ]);
}

describe('editable global regions', () => {
  it('exposes only the two staff-editable regions', () => {
    expect(GLOBAL_REGION_KEYS).toEqual(['navigation', 'contact']);
    expect(getGlobalRegion('navigation').slug).toBe('navigation');
    expect(getGlobalRegion('contact').slug).toBe('site-settings');
  });

  it('describes menu and footer arrays with row bounds', () => {
    const names = getGlobalSchema('navigation').map((node) => node.name);
    expect(names).toEqual(['headerItems', 'headerButtons', 'footerColumns', 'legalLinks']);

    for (const node of walk(getGlobalSchema('navigation'))) {
      if (node.type === 'array') {
        expect(node.maxRows).toBeGreaterThan(0);
      }
      if (node.type === 'text') {
        expect(node.maxLength).toBeGreaterThan(0);
      }
    }
  });

  it('keeps sensitive site settings out of the contact box', () => {
    const names = getGlobalSchema('contact').map((node) => node.name);
    expect(names).toContain('companyName');
    expect(names).toContain('phones');
    expect(names).not.toContain('chat');
    expect(names).not.toContain('leadAlertRecipients');
    expect(names).not.toContain('retentionMonths');
  });

  it('builds initial values for nested menu links', () => {
    const values = getGlobalInitialValues('navigation', {
      headerItems: [{ id: 'nav-1', label: 'Home', href: '/', children: [] }],
    });
    expect(values.headerItems).toEqual([{ id: 'nav-1', label: 'Home', href: '/', children: [] }]);
  });
});
