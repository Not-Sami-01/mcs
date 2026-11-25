import type { CollectionBeforeChangeHook, CollectionConfig, Where } from 'payload';
import { APIError } from 'payload';

import { readPublished, writeContent } from '../access/roles';
import { auditDelete, auditPublishFor } from '../audit/hooks';
import { seoGroup, slugField, textField, textareaField } from '../cms/fields';
import { TEXT_LIMITS } from '../cms/limits';
import {
  revalidateLocationsAfterChange,
  revalidateLocationsAfterDelete,
} from '../cms/revalidate-hooks';
import {
  mostSimilarLocation,
  SIMILARITY_BLOCK,
  SIMILARITY_WARN,
  similarityPercent,
} from '../cms/similarity';
import { validateSlug } from '../cms/slugs';

/**
 * Service areas (docs/DATABASE.md §2, docs/CONTENT.md §7.4). A location is a
 * city, or an area inside one city (`parent`). Areas render at
 * `/locations/[city]/[area]`; cities at `/locations/[city]`.
 *
 * The unique-local-content rule is a **publish** gate, not a storage rule:
 * drafts may be incomplete or near-duplicate while staff write them. On publish
 * the document needs 400+ characters of `localNotes`, three neighbourhoods, two
 * common pests, at least one available service and three FAQs; copy that is
 * 80% or more similar to a sibling is refused (60–79% sets the sidebar warning).
 */

const PUBLISH_NOTES_MIN = 400;
const PUBLISH_NEIGHBOURHOODS_MIN = 3;
const PUBLISH_PESTS_MIN = 2;
const PUBLISH_FAQS_MIN = 3;

/** Resolve a relationship value (id or populated document) to its id. */
function relationshipId(value: unknown): string | number | null {
  if (typeof value === 'number' || typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id: unknown }).id;
    if (typeof id === 'number' || typeof id === 'string') return id;
  }
  return null;
}

function itemCount(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

/**
 * Cities never have a parent; areas always have one, and it must be a city.
 * Payload cannot express a conditional required relation, so it is enforced here
 * for every save, drafts included — a stray parent would produce a wrong URL.
 */
const validateHierarchy: CollectionBeforeChangeHook = async ({ data, req }) => {
  const type = data.type as string | undefined;
  const parentId = relationshipId(data.parent);

  if (type === 'city') {
    if (parentId !== null) {
      throw new APIError('A city cannot have a parent location. Choose type "area" instead.', 400);
    }
    return data;
  }

  if (type !== 'area') return data;

  if (parentId === null) {
    throw new APIError('An area needs a parent city.', 400);
  }

  const parent = await req.payload
    .findByID({ collection: 'locations', id: parentId, depth: 0, req })
    .catch(() => null);

  if (!parent || parent.type !== 'city') {
    throw new APIError('The parent of an area must be an existing city.', 400);
  }

  return data;
};

/**
 * Compare `localNotes` against sibling locations (other cities, or other areas
 * in the same city). A 60%+ match writes a visible warning; publishing at 80%+
 * is refused (docs/CONTENT.md §7.4).
 */
const checkSimilarity: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const localNotes = typeof data.localNotes === 'string' ? data.localNotes.trim() : '';
  if (!localNotes) {
    data.similarityWarning = null;
    return data;
  }

  const type = (data.type ?? originalDoc?.type) as string | undefined;
  const parentId = relationshipId(data.parent ?? originalDoc?.parent);
  const selfId = originalDoc?.id;

  const where: Where[] = [{ type: { equals: type } }];
  if (selfId !== undefined) where.push({ id: { not_equals: selfId } });
  if (type === 'area' && parentId !== null) where.push({ parent: { equals: parentId } });

  const { docs } = await req.payload.find({
    collection: 'locations',
    where: { and: where },
    depth: 0,
    limit: 100,
    pagination: false,
    overrideAccess: true,
  });

  const match = mostSimilarLocation(
    localNotes,
    docs.map((sibling) => ({
      id: sibling.id,
      name: typeof sibling.name === 'string' ? sibling.name : 'another location',
      localNotes: typeof sibling.localNotes === 'string' ? sibling.localNotes : null,
    })),
  );

  if (!match || match.score < SIMILARITY_WARN) {
    data.similarityWarning = null;
    return data;
  }

  const percent = similarityPercent(match.score);
  const status = data._status ?? originalDoc?._status ?? 'draft';

  if (match.score >= SIMILARITY_BLOCK && status === 'published') {
    throw new APIError(
      `Local notes are ${percent}% similar to "${match.name}". Rewrite them below ${similarityPercent(
        SIMILARITY_BLOCK,
      )}% before publishing.`,
      400,
    );
  }

  data.similarityWarning = `${percent}% similar to "${match.name}". Rewrite below ${similarityPercent(
    SIMILARITY_BLOCK,
  )}% before publishing.`;
  return data;
};

/** The rest of the unique-local-content gate (docs/CONTENT.md §7.4). */
const guardUniqueContentPublish: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const status = data._status ?? originalDoc?._status ?? 'draft';
  if (status !== 'published') return data;

  const notes = typeof data.localNotes === 'string' ? data.localNotes.trim().length : 0;
  const problems: string[] = [];

  if (notes < PUBLISH_NOTES_MIN) {
    problems.push(`local notes of at least ${PUBLISH_NOTES_MIN} characters (currently ${notes})`);
  }
  if (itemCount(data.neighbourhoods) < PUBLISH_NEIGHBOURHOODS_MIN) {
    problems.push(`at least ${PUBLISH_NEIGHBOURHOODS_MIN} neighbourhoods or landmarks`);
  }
  if (itemCount(data.commonPests) < PUBLISH_PESTS_MIN) {
    problems.push(`at least ${PUBLISH_PESTS_MIN} common pests or conditions`);
  }
  if (itemCount(data.servicesAvailable) < 1) {
    problems.push('at least one service available there');
  }
  if (itemCount(data.faqs) < PUBLISH_FAQS_MIN) {
    problems.push(`at least ${PUBLISH_FAQS_MIN} local FAQs`);
  }

  if (problems.length > 0) {
    throw new APIError(`This location cannot be published yet. Add ${problems.join(', ')}.`, 400);
  }

  return data;
};

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'slug', '_status', 'updatedAt'],
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
    textField({ name: 'name', label: 'Name', preset: 'cardTitle', required: true }),
    slugField({ validate: validateSlug }),
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      defaultValue: 'city',
      options: [
        { label: 'City', value: 'city' },
        { label: 'Area', value: 'area' },
      ],
      admin: {
        position: 'sidebar',
        description: 'An area always belongs to one city.',
      },
    },
    {
      name: 'parent',
      label: 'Parent city',
      type: 'relationship',
      relationTo: 'locations',
      admin: {
        position: 'sidebar',
        condition: (data) => data?.type === 'area',
        description: 'Required for an area. Leave empty for a city.',
      },
    },
    textareaField({
      name: 'intro',
      label: 'Intro',
      preset: 'shortParagraph',
      admin: { description: 'One short paragraph for cards and the top of the page.' },
    }),
    textareaField({
      name: 'localNotes',
      label: 'Local notes',
      preset: 'localNotes',
      admin: {
        description: `Unique local content: at least ${PUBLISH_NOTES_MIN} characters to publish.`,
      },
    }),
    {
      name: 'similarityWarning',
      label: 'Similarity check',
      type: 'text',
      maxLength: TEXT_LIMITS.caption,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Set automatically by the unique-content check on save.',
      },
    },
    {
      name: 'neighbourhoods',
      label: 'Neighbourhoods and landmarks',
      type: 'array',
      minRows: 0,
      maxRows: 12,
      fields: [textField({ name: 'name', label: 'Name', preset: 'listItem', required: true })],
      admin: { description: 'At least 3 to publish.' },
    },
    {
      name: 'commonPests',
      label: 'Common pests and conditions',
      type: 'array',
      minRows: 0,
      maxRows: 12,
      fields: [
        textField({ name: 'pest', label: 'Pest or condition', preset: 'listItem', required: true }),
      ],
      admin: { description: 'At least 2 to publish.' },
    },
    {
      name: 'servicesAvailable',
      label: 'Services available here',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      minRows: 0,
      maxRows: 24,
      admin: { description: 'At least 1 to publish.' },
    },
    {
      name: 'faqs',
      label: 'Local FAQs',
      type: 'array',
      minRows: 0,
      maxRows: 8,
      fields: [
        textField({ name: 'question', label: 'Question', preset: 'faqQuestion', required: true }),
        textareaField({ name: 'answer', label: 'Answer', preset: 'faqAnswer', required: true }),
      ],
      admin: { description: 'At least 3 to publish.' },
    },
    {
      name: 'nearbyAreas',
      label: 'Nearby areas',
      type: 'relationship',
      relationTo: 'locations',
      hasMany: true,
      maxRows: 8,
    },
    {
      name: 'geo',
      label: 'Coordinates',
      type: 'group',
      admin: { description: 'Optional. Used for maps; never invented.' },
      fields: [
        {
          name: 'latitude',
          label: 'Latitude',
          type: 'number',
          min: -90,
          max: 90,
        },
        {
          name: 'longitude',
          label: 'Longitude',
          type: 'number',
          min: -180,
          max: 180,
        },
      ],
    },
    seoGroup(),
  ],
  hooks: {
    beforeChange: [validateHierarchy, checkSimilarity, guardUniqueContentPublish],
    afterChange: [auditPublishFor('locations', 'location'), revalidateLocationsAfterChange],
    afterDelete: [auditDelete('locations'), revalidateLocationsAfterDelete],
  },
};
