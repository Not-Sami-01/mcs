import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload';
import { APIError } from 'payload';

import { readPublished, writeProducts } from '../access/roles';
import { auditDelete, auditPublishFor } from '../audit/hooks';
import { rows, seoGroup, slugField, textField, textareaField } from '../cms/fields';
import { COUNT_LIMITS } from '../cms/limits';
import { recordPriceChanges } from '../cms/price-history';
import {
  revalidateProductsAfterChange,
  revalidateProductsAfterDelete,
} from '../cms/revalidate-hooks';
import { validateSlug } from '../cms/slugs';
import { DISCOUNT_PROBLEMS, discountProblem } from '../lib/pricing';

type PackLike = { rate?: number | null };

/**
 * Products (docs/DATABASE.md §2, docs/CONTENT.md §7.3). Each pack size carries
 * its own PKR rate and stock status; one discount (percent or fixed) applies to
 * every pack while its Karachi date window is open (ADR-013). The public page
 * computes prices only through `src/lib/pricing.ts`.
 *
 * Images and the three paragraph blocks stay optional so staff can save a
 * draft at any point; the public page renders cleanly with no images. Price
 * history and the audit trail are written for published saves.
 */

const validateDiscount: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return data;

  const packSizes = (data.packSizes ?? []) as PackLike[];
  const rates = packSizes.flatMap((pack) => (typeof pack.rate === 'number' ? [pack.rate] : []));
  const problem = discountProblem(data.discount as never, rates);

  if (problem) throw new APIError(DISCOUNT_PROBLEMS[problem], 400);

  return data;
};

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Product', plural: 'Products' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'featured', '_status', 'updatedAt'],
    group: 'Catalogue',
  },
  access: {
    create: writeProducts,
    read: readPublished,
    update: writeProducts,
    delete: writeProducts,
  },
  versions: {
    drafts: { schedulePublish: true },
    maxPerDoc: 50,
  },
  trash: true,
  fields: [
    textField({ name: 'title', label: 'Title', preset: 'headline', required: true }),
    slugField({ validate: validateSlug }),
    {
      name: 'category',
      label: 'Category',
      type: 'relationship',
      relationTo: 'categories',
      admin: { description: 'Optional. Used for grouping in the admin panel.' },
    },
    {
      name: 'images',
      label: 'Images',
      type: 'array',
      minRows: 0,
      maxRows: COUNT_LIMITS.productImages.max,
      admin: { description: 'Optional. Alt text lives on each image.' },
      fields: [
        {
          name: 'image',
          label: 'Image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'description',
      label: 'Description',
      type: 'array',
      ...rows('productParagraphs'),
      admin: { description: 'One paragraph per row. Limited text, no HTML.' },
      fields: [
        textareaField({
          name: 'body',
          label: 'Paragraph',
          preset: 'paragraph',
          required: true,
        }),
      ],
    },
    {
      name: 'howToUse',
      label: 'How to use',
      type: 'array',
      ...rows('productParagraphs'),
      fields: [
        textareaField({
          name: 'body',
          label: 'Paragraph',
          preset: 'paragraph',
          required: true,
        }),
      ],
    },
    {
      name: 'safetyInfo',
      label: 'Safety information',
      type: 'array',
      ...rows('productParagraphs'),
      admin: { description: 'Accurate safety instructions supplied by the client.' },
      fields: [
        textareaField({
          name: 'body',
          label: 'Paragraph',
          preset: 'paragraph',
          required: true,
        }),
      ],
    },
    {
      name: 'packSizes',
      label: 'Pack sizes',
      type: 'array',
      ...rows('productPackSizes'),
      fields: [
        textField({ name: 'label', label: 'Pack label', preset: 'listItem', required: true }),
        textField({
          name: 'sku',
          label: 'SKU',
          preset: 'slug',
          admin: {
            description: 'Optional internal code. Used to match CSV rows and price history.',
          },
        }),
        {
          name: 'rate',
          label: 'Rate (PKR)',
          type: 'number',
          required: true,
          min: 0,
          admin: { step: 1, description: 'Whole rupees.' },
        },
        {
          name: 'stockStatus',
          label: 'Stock status',
          type: 'select',
          required: true,
          defaultValue: 'in_stock',
          options: [
            { label: 'In stock', value: 'in_stock' },
            { label: 'Low stock', value: 'low' },
            { label: 'Out of stock', value: 'out' },
            { label: 'Pre-order', value: 'preorder' },
          ],
        },
      ],
    },
    {
      name: 'discount',
      label: 'Discount',
      type: 'group',
      admin: {
        description: 'Applies to every pack while the date window is open (Karachi dates).',
      },
      fields: [
        {
          name: 'type',
          label: 'Discount type',
          type: 'select',
          defaultValue: 'percent',
          options: [
            { label: 'Percent off', value: 'percent' },
            { label: 'Fixed rupees off', value: 'fixed' },
          ],
        },
        {
          name: 'value',
          label: 'Discount value',
          type: 'number',
          min: 0,
          admin: {
            step: 1,
            description: 'Percent (1–90) or whole rupees, depending on the type.',
          },
        },
        {
          name: 'startsAt',
          label: 'Starts on',
          type: 'date',
          admin: { date: { pickerAppearance: 'dayOnly' }, description: 'Optional. Inclusive.' },
        },
        {
          name: 'endsAt',
          label: 'Ends on',
          type: 'date',
          admin: { date: { pickerAppearance: 'dayOnly' }, description: 'Optional. Inclusive.' },
        },
      ],
    },
    {
      name: 'safetyDocuments',
      label: 'Safety documents',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      ...rows('productSafetyDocuments'),
      admin: { description: 'Optional PDFs (safety data sheets, labels).' },
    },
    {
      name: 'featured',
      label: 'Featured product',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    seoGroup(),
  ],
  hooks: {
    beforeValidate: [validateDiscount],
    afterChange: [
      auditPublishFor('products', 'product'),
      revalidateProductsAfterChange,
      async ({ doc, previousDoc, req, operation }) => {
        if (operation === 'create' || operation === 'update') {
          await recordPriceChanges({ doc, previousDoc, req });
        }
        return doc;
      },
    ],
    afterDelete: [auditDelete('products'), revalidateProductsAfterDelete],
  },
};
