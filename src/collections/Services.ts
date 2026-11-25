import type { CollectionConfig } from 'payload';

import { readPublished, writeContent } from '../access/roles';
import { auditDelete, auditPublishFor } from '../audit/hooks';
import { SERVICE_BLOCKS } from '../blocks/allowed';
import { rows, seoGroup, slugField, textField, textareaField } from '../cms/fields';
import { COUNT_LIMITS } from '../cms/limits';
import {
  revalidateServicesAfterChange,
  revalidateServicesAfterDelete,
} from '../cms/revalidate-hooks';
import { validateSlug } from '../cms/slugs';

/**
 * Pest-control services (docs/DATABASE.md §2, docs/CONTENT.md §7.2). A service
 * is a typed document rendered at `/services/[slug]`: signs, treatment steps,
 * a starting price and FAQs, plus an optional extra block layout.
 *
 * `areasServed` arrived with CP-5.2 and `productsUsed` with CP-5.3, once the
 * `products` collection existed (Payload rejects relations to unregistered
 * collections).
 */
export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'order', 'updatedAt'],
  },
  access: {
    create: writeContent,
    read: readPublished,
    update: writeContent,
    delete: writeContent,
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
    textField({
      name: 'icon',
      label: 'Icon key',
      preset: 'slug',
      admin: { description: 'Optional icon name used by cards, for example "termite".' },
    }),
    textareaField({
      name: 'shortDescription',
      label: 'Short description',
      preset: 'cardBody',
      required: true,
      admin: { description: 'One or two lines for cards and the service hero.' },
    }),
    {
      name: 'heroImage',
      label: 'Hero image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'signs',
      label: 'Signs of an infestation',
      type: 'array',
      ...rows('serviceSigns'),
      fields: [textField({ name: 'sign', label: 'Sign', preset: 'listItem', required: true })],
    },
    {
      name: 'treatmentSteps',
      label: 'Treatment steps',
      type: 'array',
      ...rows('serviceTreatmentSteps'),
      fields: [
        textField({ name: 'title', label: 'Title', preset: 'cardTitle', required: true }),
        textareaField({ name: 'body', label: 'Body', preset: 'paragraph', required: true }),
      ],
    },
    {
      name: 'startingPrice',
      label: 'Starting price (PKR)',
      type: 'number',
      min: 0,
      admin: {
        position: 'sidebar',
        description: 'Whole rupees. Leave empty when the client has not confirmed a price.',
      },
    },
    textField({
      name: 'priceUnit',
      label: 'Price unit',
      preset: 'caption',
      admin: { description: 'For example "per room" or "per inspection".' },
    }),
    {
      name: 'areasServed',
      label: 'Areas served',
      type: 'relationship',
      relationTo: 'locations',
      hasMany: true,
      minRows: 0,
      maxRows: 24,
      admin: { description: 'Optional. Published locations that appear on this service page.' },
    },
    {
      name: 'productsUsed',
      label: 'Products used',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      ...rows('productsUsed'),
      admin: { description: 'Optional. Products that appear on this service page.' },
    },
    {
      name: 'faqs',
      label: 'FAQs',
      type: 'array',
      ...rows('serviceFaqs'),
      fields: [
        textField({ name: 'question', label: 'Question', preset: 'faqQuestion', required: true }),
        textareaField({ name: 'answer', label: 'Answer', preset: 'faqAnswer', required: true }),
      ],
    },
    {
      name: 'layout',
      label: 'Extra sections',
      type: 'blocks',
      blocks: SERVICE_BLOCKS,
      minRows: 0,
      maxRows: COUNT_LIMITS.blocksPerPage.max,
      admin: { description: 'Optional. The service content above is always shown first.' },
    },
    seoGroup(),
    {
      name: 'order',
      label: 'Order',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first in automatic lists.',
      },
    },
  ],
  hooks: {
    afterChange: [auditPublishFor('services', 'service'), revalidateServicesAfterChange],
    afterDelete: [auditDelete('services'), revalidateServicesAfterDelete],
  },
};
