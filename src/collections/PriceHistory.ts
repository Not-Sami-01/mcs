import type { CollectionConfig } from 'payload';

import { readPriceHistory } from '../access/roles';
import { textField } from '../cms/fields';

/**
 * Price and discount history (CP-5.3, docs/DATABASE.md §2).
 *
 * Create-only: written by the `products` afterChange hook with
 * `overrideAccess: true`; no HTTP caller may create, edit or delete an entry.
 * Super Admin and Product Manager may read it. `changedAt` is stored at the
 * moment of the change (UTC); business dates are displayed in Asia/Karachi.
 */
export const PriceHistory: CollectionConfig = {
  slug: 'price-history',
  labels: { singular: 'Price change', plural: 'Price history' },
  admin: {
    useAsTitle: 'packSku',
    defaultColumns: ['changedAt', 'product', 'packSku', 'oldRate', 'newRate', 'source'],
    group: 'Catalogue',
    description: 'Read-only. Written automatically whenever a published price or discount changes.',
  },
  access: {
    create: () => false,
    read: readPriceHistory,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'product',
      label: 'Product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      index: true,
    },
    textField({
      name: 'packSku',
      label: 'Pack',
      preset: 'slug',
      required: true,
      admin: { description: 'The pack SKU, or its label when no SKU is set.' },
    }),
    {
      name: 'oldRate',
      label: 'Old rate (PKR)',
      type: 'number',
      min: 0,
      admin: { step: 1, description: 'Empty for the opening price.' },
    },
    {
      name: 'newRate',
      label: 'New rate (PKR)',
      type: 'number',
      min: 0,
      required: true,
      admin: { step: 1 },
    },
    { name: 'oldDiscount', label: 'Old discount', type: 'json' },
    { name: 'newDiscount', label: 'New discount', type: 'json' },
    {
      name: 'changedBy',
      label: 'Changed by',
      type: 'relationship',
      relationTo: 'users',
      admin: { description: 'Empty for scheduled or system saves.' },
    },
    {
      name: 'changedAt',
      label: 'Changed at',
      type: 'date',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'source',
      label: 'Source',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: [
        { label: 'Admin panel', value: 'admin' },
        { label: 'Inline editor', value: 'inline' },
        { label: 'CSV import', value: 'csv' },
      ],
    },
  ],
};
