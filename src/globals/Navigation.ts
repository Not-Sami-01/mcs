import type { GlobalConfig } from 'payload';

import { canEditNavigation, readPublic, writeNavigation } from '../access/roles';
import { actionFields, rows, textField } from '../cms/fields';

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  access: {
    read: readPublic,
    update: writeNavigation,
  },
  fields: [
    {
      name: 'headerItems',
      label: 'Header navigation items',
      type: 'array',
      ...rows('headerMenuItems'),
      access: { update: ({ req }) => canEditNavigation(req.user) },
      fields: [
        textField({ name: 'label', label: 'Label', preset: 'menuLabel', required: true }),
        textField({ name: 'href', label: 'Link target', preset: 'url', required: true }),
        {
          name: 'children',
          label: 'Sub-menu items',
          type: 'array',
          ...rows('menuItemChildren'),
          fields: [
            textField({ name: 'label', label: 'Label', preset: 'menuLabel', required: true }),
            textField({ name: 'href', label: 'Link target', preset: 'url', required: true }),
          ],
        },
      ],
    },
    {
      name: 'headerButtons',
      label: 'Header CTA buttons',
      type: 'array',
      ...rows('headerButtons'),
      access: { update: ({ req }) => canEditNavigation(req.user) },
      fields: actionFields(),
    },
    {
      name: 'footerColumns',
      label: 'Footer link columns',
      type: 'array',
      ...rows('footerColumns'),
      access: { update: ({ req }) => canEditNavigation(req.user) },
      fields: [
        textField({ name: 'title', label: 'Column title', preset: 'cardTitle', required: true }),
        {
          name: 'links',
          label: 'Links',
          type: 'array',
          ...rows('footerColumnLinks'),
          fields: [
            textField({ name: 'label', label: 'Label', preset: 'menuLabel', required: true }),
            textField({ name: 'href', label: 'Link target', preset: 'url', required: true }),
          ],
        },
      ],
    },
    {
      name: 'legalLinks',
      label: 'Footer legal links (bottom bar)',
      type: 'array',
      ...rows('legalLinks'),
      access: { update: ({ req }) => canEditNavigation(req.user) },
      fields: [
        textField({ name: 'label', label: 'Label', preset: 'menuLabel', required: true }),
        textField({ name: 'href', label: 'Link target', preset: 'url', required: true }),
      ],
    },
  ],
};
