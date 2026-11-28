import type { CollectionConfig } from 'payload';

import { readPublished, writeContent } from '../access/roles';
import { auditDelete, auditPublishFor } from '../audit/hooks';
import { seoGroup, slugField, textField, textareaField } from '../cms/fields';
import { TEXT_LIMITS } from '../cms/limits';
import { revalidatePostsAfterChange, revalidatePostsAfterDelete } from '../cms/revalidate-hooks';
import { validateSlug } from '../cms/slugs';

/**
 * Plain-text length of a Lexical document, for the `postBody` cap.
 *
 * The editor stores `{ root: { children: [...] } }`; the length must descend
 * into `root`, otherwise every body looks empty (and the `required` field is
 * rejected with "Write the article body.").
 */
export function richTextLength(node: unknown): number {
  if (!node || typeof node !== 'object') return 0;
  const record = node as { text?: unknown; children?: unknown; root?: unknown };
  const own = typeof record.text === 'string' ? record.text.length : 0;
  const nested = Array.isArray(record.children)
    ? record.children.reduce((total: number, child) => total + richTextLength(child), 0)
    : richTextLength(record.root);
  return own + nested;
}

/**
 * Pest Library articles (docs/DATABASE.md §2, docs/CONTENT.md §7.6).
 *
 * Long-form advice is the one place rich text is allowed (ADR-014); the body is
 * capped at `postBody` and the editor is the shared Lexical editor. Every
 * article links to at least one service and one location, which is a content
 * rule checked in review rather than a publish gate.
 */
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Pest Library article', plural: 'Pest Library' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedAt', '_status', 'updatedAt'],
    group: 'Content',
  },
  access: {
    create: writeContent,
    read: readPublished,
    update: writeContent,
    delete: writeContent,
  },
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
  trash: true,
  fields: [
    textField({ name: 'title', label: 'Title', preset: 'headline', required: true }),
    slugField({ validate: validateSlug }),
    textareaField({
      name: 'excerpt',
      label: 'Excerpt',
      preset: 'cardBody',
      required: true,
      admin: { description: 'One or two lines for the Pest Library cards and search results.' },
    }),
    {
      name: 'coverImage',
      label: 'Cover image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'category',
      label: 'Category',
      type: 'relationship',
      relationTo: 'categories',
      admin: { description: 'Optional. Used for grouping in the admin panel.' },
    },
    {
      name: 'body',
      label: 'Article',
      type: 'richText',
      required: true,
      admin: { description: `Long-form copy, capped at ${TEXT_LIMITS.postBody} characters.` },
      validate: (value: unknown) => {
        const length = richTextLength(value);
        if (length === 0) return 'Write the article body.';
        return length > TEXT_LIMITS.postBody
          ? `Article is ${length} characters; the limit is ${TEXT_LIMITS.postBody}.`
          : true;
      },
    },
    {
      name: 'author',
      label: 'Author',
      type: 'relationship',
      relationTo: 'users',
      admin: { description: 'Optional. Shown as the display name on the article.' },
    },
    {
      name: 'relatedServices',
      label: 'Related services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      maxRows: 4,
    },
    {
      name: 'relatedLocations',
      label: 'Related locations',
      type: 'relationship',
      relationTo: 'locations',
      hasMany: true,
      maxRows: 4,
    },
    {
      name: 'publishedAt',
      label: 'Published at',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    seoGroup(),
  ],
  hooks: {
    afterChange: [auditPublishFor('posts', 'article'), revalidatePostsAfterChange],
    afterDelete: [auditDelete('posts'), revalidatePostsAfterDelete],
  },
};
