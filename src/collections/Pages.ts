import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload';
import { APIError } from 'payload';

import { hasRole, readPublished, writeContent } from '../access/roles';
import { auditDelete, auditPublish } from '../audit/hooks';
import { PAGE_BLOCKS } from '../blocks/allowed';
import { rows, seoGroup, slugField, textField } from '../cms/fields';
import { TEXT_LIMITS } from '../cms/limits';
import { joinPath, validateSlug } from '../cms/slugs';
import { revalidatePagesAfterChange, revalidatePagesAfterDelete } from '../cms/revalidate-hooks';

/**
 * CMS-driven pages (docs/DATABASE.md §2). The public site's catch-all route
 * (CP-3.2) renders `layout`. Drafts, scheduled publish, version history and
 * trash are all on, and `path` is unique so one page has one canonical URL.
 */
const computePath: CollectionBeforeChangeHook = async ({ data, req }) => {
  const slug = typeof data.slug === 'string' ? data.slug.trim().toLowerCase() : '';
  if (!slug) return data;

  let parentPath = '';
  if (data.category) {
    const categoryId =
      typeof data.category === 'object' && data.category !== null
        ? (data.category as { id: unknown }).id
        : data.category;

    const category = await req.payload
      .findByID({ collection: 'categories', id: categoryId as string | number, depth: 0, req })
      .catch(() => null);

    if (!category) {
      throw new APIError('The selected category does not exist.', 400);
    }
    parentPath = typeof category.path === 'string' ? category.path : '';
  }

  data.path = joinPath(parentPath, slug);
  return data;
};

/**
 * Publish gate (docs/INLINE-EDITING.md §9): legal pages flagged `isLegal` may
 * only be published by a Super Admin, whatever route the update comes from.
 */
const guardLegalPublish: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
  const status = data._status ?? originalDoc?._status;
  const isLegal = data.isLegal ?? originalDoc?.isLegal;

  if (status === 'published' && isLegal === true && !hasRole(req.user, 'super-admin')) {
    throw new APIError('Legal pages can only be published by a Super Admin.', 403);
  }

  return data;
};

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'path', 'template', '_status', 'updatedAt'],
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
      admin: { description: 'Optional. The page URL is prefixed with the category path.' },
    },
    {
      name: 'path',
      label: 'Full path',
      type: 'text',
      unique: true,
      maxLength: TEXT_LIMITS.path,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Computed from the category path and slug. Unique per page.',
      },
    },
    {
      name: 'template',
      label: 'Template',
      type: 'select',
      required: true,
      defaultValue: 'standard',
      options: [
        { label: 'Standard', value: 'standard' },
        { label: 'Landing', value: 'landing' },
        { label: 'Legal', value: 'legal' },
        { label: 'Form', value: 'form' },
      ],
    },
    {
      name: 'isLegal',
      label: 'Legal page',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Legal pages can only be published by a Super Admin.',
      },
    },
    {
      name: 'layout',
      label: 'Layout',
      type: 'blocks',
      blocks: PAGE_BLOCKS,
      ...rows('blocksPerPage'),
    },
    seoGroup(),
    {
      name: 'noindex',
      label: 'Hide from search engines',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      label: 'Published at',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
  hooks: {
    beforeChange: [computePath, guardLegalPublish],
    afterChange: [auditPublish, revalidatePagesAfterChange],
    afterDelete: [auditDelete('pages'), revalidatePagesAfterDelete],
  },
};
