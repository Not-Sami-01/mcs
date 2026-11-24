import type { Field } from 'payload';

import { PAGE_BLOCKS } from '@/blocks/allowed';

/**
 * Editable field schema for the content box (CP-4.1/CP-4.2).
 *
 * The schema is derived from the Payload block definitions, so labels and
 * limits still come from one place (`src/cms/fields.ts` → `src/cms/limits.ts`).
 * A test walks every entry and fails if a text field has no limit or a list
 * has no row bounds.
 */
export type EditOption = { label: string; value: string };

export type EditScalar = {
  type: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'upload';
  name: string;
  label: string;
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: EditOption[];
  relationTo?: string;
};

export type EditGroup = {
  type: 'group';
  name: string;
  label: string;
  required?: boolean;
  fields: EditNode[];
};

export type EditArray = {
  type: 'array';
  name: string;
  label: string;
  minRows: number;
  maxRows: number;
  fields: EditNode[];
};

export type EditNode = EditScalar | EditGroup | EditArray;

function fieldLabel(field: Field, fallback: string): string {
  const label = (field as { label?: unknown }).label;
  if (typeof label === 'string') return label;
  if (label && typeof label === 'object' && 'en' in label) {
    const english = (label as { en?: unknown }).en;
    if (typeof english === 'string') return english;
  }
  return fallback;
}

function toEditNode(field: Field): EditNode | null {
  if (!('name' in field) || typeof field.name !== 'string') return null;
  // Block visibility is managed by the toolbar; `id`/`blockName` are
  // Payload-internal block fields and must never appear in the content box.
  if (field.name === 'hidden' || field.name === 'id' || field.name === 'blockName') return null;

  const base = {
    name: field.name,
    label: fieldLabel(field, field.name),
    required: Boolean((field as { required?: boolean }).required),
  };

  switch (field.type) {
    case 'text':
      return { ...base, type: 'text', maxLength: (field as { maxLength?: number }).maxLength };
    case 'textarea':
      return { ...base, type: 'textarea', maxLength: (field as { maxLength?: number }).maxLength };
    case 'select': {
      const options = ((field as { options?: unknown }).options ?? []) as Array<
        { label?: unknown; value: unknown } | string
      >;
      return {
        ...base,
        type: 'select',
        options: options.flatMap((option) => {
          if (typeof option === 'string') return [{ label: option, value: option }];
          if (typeof option?.value !== 'string') return [];
          return [
            {
              label: typeof option.label === 'string' ? option.label : option.value,
              value: option.value,
            },
          ];
        }),
      };
    }
    case 'number':
      return {
        ...base,
        type: 'number',
        min: (field as { min?: number }).min,
        max: (field as { max?: number }).max,
      };
    case 'checkbox':
      return { ...base, type: 'boolean' };
    case 'upload': {
      const relationTo = (field as { relationTo?: unknown }).relationTo;
      const slug = typeof relationTo === 'string' ? relationTo : null;
      return slug ? { ...base, type: 'upload', relationTo: slug } : null;
    }
    case 'group': {
      const fields = ((field as { fields?: Field[] }).fields ?? []).flatMap(
        (child) => toEditNode(child) ?? [],
      );
      return fields.length > 0 ? { ...base, type: 'group', fields } : null;
    }
    case 'array': {
      const fields = ((field as { fields?: Field[] }).fields ?? []).flatMap(
        (child) => toEditNode(child) ?? [],
      );
      if (fields.length === 0) return null;
      return {
        ...base,
        type: 'array',
        minRows: (field as { minRows?: number }).minRows ?? 0,
        maxRows: (field as { maxRows?: number }).maxRows ?? 30,
        fields,
      };
    }
    default:
      return null;
  }
}

/** Convert any Payload field list into editable nodes (used by globals too). */
export function toEditNodes(fields: Field[]): EditNode[] {
  return fields.flatMap((field) => toEditNode(field) ?? []);
}

const byBlockType = new Map(
  PAGE_BLOCKS.map((block) => [
    block.slug,
    block.fields.flatMap((field) => toEditNode(field) ?? []),
  ]),
);

export function getEditableSchema(blockType: string): EditNode[] {
  return byBlockType.get(blockType) ?? [];
}

/** Payload upload values arrive as ids or populated documents; keep the id. */
function relationId(value: unknown): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id: unknown }).id;
    if (typeof id === 'number' || typeof id === 'string') return id;
  }
  return null;
}

function pickValue(node: EditNode, source: unknown): unknown {
  if (!source || typeof source !== 'object') {
    if (node.type === 'array') return [];
    if (node.type === 'group') return undefined;
    if (node.type === 'boolean') return false;
    if (node.type === 'upload') return null;
    return '';
  }

  const record = source as Record<string, unknown>;
  const raw = record[node.name];

  switch (node.type) {
    case 'array':
      return Array.isArray(raw)
        ? raw.map((item) => pickGroup(node.fields, item)).filter((item) => item !== undefined)
        : [];
    case 'group':
      return pickGroup(node.fields, raw);
    case 'upload':
      return relationId(raw);
    case 'boolean':
      return raw === true;
    case 'number':
      return typeof raw === 'number' ? raw : '';
    default:
      return typeof raw === 'string' ? raw : '';
  }
}

function pickGroup(fields: EditNode[], source: unknown): Record<string, unknown> | undefined {
  if (!source || typeof source !== 'object') return undefined;

  const values: Record<string, unknown> = {};
  // Keep Payload's row id so reordering and saving does not churn ids.
  if (typeof (source as { id?: unknown }).id === 'string') {
    values.id = (source as { id: string }).id;
  }
  for (const field of fields) {
    const value = pickValue(field, source);
    if (value !== undefined) values[field.name] = value;
  }
  return values;
}

/** Values the content box starts from; only editable fields are included. */
export function getInitialValues(
  schema: EditNode[],
  source: Record<string, unknown>,
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const node of schema) {
    const value = pickValue(node, source);
    if (value !== undefined) values[node.name] = value;
  }
  return values;
}
