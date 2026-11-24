import type { Field } from 'payload';

import { PAGE_BLOCKS } from '@/blocks/allowed';

/**
 * Fields the CP-4.1 content box may edit: top-level text, textarea, select and
 * number fields of a block. Lists, groups and uploads arrive in CP-4.2.
 *
 * The registry is derived from the Payload block definitions, so a field's
 * label and limit still come from one place (`src/cms/fields.ts` →
 * `src/cms/limits.ts`). A test walks every entry and fails if a text field has
 * no limit.
 */
export type EditField = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  maxLength?: number;
  min?: number;
  max?: number;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
};

function fieldLabel(field: Field): string {
  const label = (field as { label?: unknown }).label;
  if (typeof label === 'string') return label;
  if (label && typeof label === 'object' && 'en' in label) {
    const english = (label as { en?: unknown }).en;
    if (typeof english === 'string') return english;
  }
  return 'name' in field && field.name ? field.name : 'Field';
}

function toEditField(field: Field): EditField | null {
  if (!('name' in field) || typeof field.name !== 'string') return null;

  const base = {
    name: field.name,
    label: fieldLabel(field),
    required: Boolean((field as { required?: boolean }).required),
  };

  switch (field.type) {
    case 'text':
      return {
        ...base,
        type: 'text',
        maxLength: (field as { maxLength?: number }).maxLength,
      };
    case 'textarea':
      return {
        ...base,
        type: 'textarea',
        maxLength: (field as { maxLength?: number }).maxLength,
      };
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
    default:
      return null;
  }
}

const byBlockType = new Map(
  PAGE_BLOCKS.map((block) => [
    block.slug,
    block.fields.flatMap((field) => {
      const editable = toEditField(field);
      return editable ? [editable] : [];
    }),
  ]),
);

export function getEditableFields(blockType: string): EditField[] {
  return byBlockType.get(blockType) ?? [];
}
