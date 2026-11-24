import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload';
import { APIError } from 'payload';

import { readPublic, writeContent } from '../access/roles';
import { auditDelete } from '../audit/hooks';
import { seoGroup, slugField, textField, textareaField } from '../cms/fields';
import { TEXT_LIMITS } from '../cms/limits';
import { joinPath, validateSlug } from '../cms/slugs';

/**
 * Nested category tree (docs/DATABASE.md §2, docs/CONTENT.md §3).
 *
 * `path` is computed from the parent chain and slug, so a category URL is
 * `/industries/restaurants-and-hotels`. Categories have no drafts: every
 * non-trashed category is public, which is why `readPublic` is correct here
 * (see the note in `src/access/roles.ts`).
 */
const computePath: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const slug = typeof data.slug === 'string' ? data.slug.trim().toLowerCase() : '';
  if (!slug) return data;

  let parentPath = '';
  let parentRef = data.parent;
  const visited = new Set<string>();

  while (parentRef) {
    const parentId =
      typeof parentRef === 'object' && parentRef !== null
        ? (parentRef as { id: unknown }).id
        : parentRef;

    // A category cannot be its own ancestor; without this a cycle would hang
    // the walk and produce an invalid path.
    if (originalDoc?.id !== undefined && String(parentId) === String(originalDoc.id)) {
      throw new APIError('A category cannot be its own parent.', 400);
    }
    if (visited.has(String(parentId))) {
      throw new APIError('Category parents form a cycle.', 400);
    }
    visited.add(String(parentId));

    const parent = await req.payload
      .findByID({ collection: 'categories', id: parentId as string | number, depth: 0, req })
      .catch(() => null);

    if (!parent) {
      throw new APIError('The selected parent category does not exist.', 400);
    }

    parentPath = typeof parent.path === 'string' ? parent.path : '';
    parentRef = parent.parent;
  }

  data.path = joinPath(parentPath, slug);
  return data;
};

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'path', 'updatedAt'],
  },
  access: {
    create: writeContent,
    read: readPublic,
    update: writeContent,
    delete: writeContent,
  },
  trash: true,
  fields: [
    textField({ name: 'title', label: 'Title', preset: 'headline', required: true }),
    slugField({ validate: validateSlug }),
    {
      name: 'parent',
      label: 'Parent category',
      type: 'relationship',
      relationTo: 'categories',
      admin: { description: 'Leave empty for a top-level category.' },
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
        description: 'Computed from the parent chain and slug. Used in the URL.',
      },
    },
    {
      name: 'kind',
      label: 'Kind',
      type: 'select',
      required: true,
      defaultValue: 'general',
      options: [
        { label: 'Services', value: 'services' },
        { label: 'Industries', value: 'industries' },
        { label: 'Locations', value: 'locations' },
        { label: 'Blog', value: 'blog' },
        { label: 'Products', value: 'products' },
        { label: 'General', value: 'general' },
      ],
    },
    textareaField({ name: 'intro', label: 'Intro', preset: 'shortParagraph' }),
    {
      name: 'showInNav',
      label: 'Show in navigation',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'navOrder',
      label: 'Navigation order',
      type: 'number',
      min: 0,
      admin: { position: 'sidebar' },
    },
    seoGroup(),
  ],
  hooks: {
    beforeChange: [computePath],
    afterDelete: [auditDelete('categories')],
  },
};
