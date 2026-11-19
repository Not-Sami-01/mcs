import type { Block, Field, GroupField, TextField, TextareaField } from 'payload';

import { COUNT_LIMITS, TEXT_LIMITS, type CountPreset, type TextPreset } from './limits';

/**
 * Field factories that apply the limits from `src/cms/limits.ts`
 * (docs/DATABASE.md §1: every text field has maxLength, every list has
 * minRows/maxRows — a test walks every collection and block and enforces it).
 *
 * Factories return plain Payload field configs, so they compose anywhere a
 * field literal would: collections, groups and block definitions.
 */

type Extra<T> = Omit<T, 'name' | 'type' | 'maxLength'> & { name: string };

/** A single-line text field capped at a named preset. */
export function textField(args: Extra<TextField> & { preset: TextPreset }): TextField {
  const { preset, admin, ...rest } = args;
  const maxLength = TEXT_LIMITS[preset];
  return {
    type: 'text',
    maxLength,
    admin: {
      description: `Max ${maxLength} characters.`,
      ...admin,
    },
    ...rest,
  } as TextField;
}

/** A multi-line text field capped at a named preset. */
export function textareaField(args: Extra<TextareaField> & { preset: TextPreset }): TextareaField {
  const { preset, admin, ...rest } = args;
  const maxLength = TEXT_LIMITS[preset];
  return {
    type: 'textarea',
    maxLength,
    admin: {
      description: `Max ${maxLength} characters.`,
      ...admin,
    },
    ...rest,
  };
}

/** Row bounds for a list field, taken from a count preset. */
export function rows(preset: CountPreset): { minRows: number; maxRows: number } {
  const { min, max } = COUNT_LIMITS[preset];
  return { minRows: min, maxRows: max };
}

/** The `seo` group shared by every indexable collection (docs/SEO.md §1). */
export function seoGroup(): GroupField {
  return {
    name: 'seo',
    type: 'group',
    label: 'SEO',
    fields: [
      textField({ name: 'metaTitle', label: 'Meta title', preset: 'metaTitle' }),
      textareaField({
        name: 'metaDescription',
        label: 'Meta description',
        preset: 'metaDescription',
      }),
    ],
  };
}

/** A slug field: capped, lowercase ASCII with hyphens, validated by `validateSlug`. */
export function slugField(args: {
  name?: string;
  label?: string;
  validate: (value: string | undefined) => true | string;
}): TextField {
  const { name = 'slug', label = 'Slug', validate } = args;
  return {
    name,
    label,
    type: 'text',
    required: true,
    unique: true,
    maxLength: TEXT_LIMITS.slug,
    admin: {
      description: 'Lowercase letters, numbers and hyphens. Used in the URL.',
      position: 'sidebar',
    },
    validate: (value) => validate(value as string | undefined),
  };
}

/**
 * Fields for one entry of an action list (hero buttons, CTA buttons, …):
 * a label plus where it goes.
 */
export function actionFields(): Field[] {
  return [
    textField({ name: 'label', label: 'Label', preset: 'buttonLabel', required: true }),
    {
      name: 'kind',
      type: 'select',
      label: 'Action type',
      required: true,
      defaultValue: 'link',
      options: [
        { label: 'Call (tel: link)', value: 'call' },
        { label: 'WhatsApp (wa.me link)', value: 'whatsapp' },
        { label: 'Free inspection (internal)', value: 'inspection' },
        { label: 'Link', value: 'link' },
      ],
    },
    textField({ name: 'href', label: 'Target', preset: 'url', required: true }),
  ];
}

/** Convenience: the same block factory shape Payload expects, typed. */
export type BlockDef = Block;
