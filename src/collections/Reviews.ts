import type { CollectionConfig } from 'payload';

import { readVerifiedReviews, writeContent } from '../access/roles';
import { textareaField, textField } from '../cms/fields';
import {
  revalidateReviewsAfterChange,
  revalidateReviewsAfterDelete,
} from '../cms/revalidate-hooks';

/**
 * Customer reviews (CP-5.5, docs/DATABASE.md §2).
 *
 * A review is only ever public when `verified` is true: the collection's read
 * access returns `{ verified: true }` for anonymous callers and the `reviews`
 * block also filters before rendering. `permissionConfirmed` records that the
 * customer agreed to publication (Q15) and is shown in the admin list so staff
 * can check it before ticking `verified`.
 *
 * No drafts: a review is a small, factual record, and the verified flag is the
 * only gate (docs/DATABASE.md §4 matrix: CRUD, not CRUDP).
 */
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Review', plural: 'Reviews' },
  admin: {
    useAsTitle: 'reviewerName',
    defaultColumns: ['reviewerName', 'rating', 'city', 'source', 'verified', 'reviewDate'],
    group: 'Content',
    description: 'Only verified reviews appear on the public site.',
  },
  access: {
    create: writeContent,
    read: readVerifiedReviews,
    update: writeContent,
    delete: writeContent,
  },
  trash: true,
  fields: [
    textField({
      name: 'reviewerName',
      label: 'Reviewer name',
      preset: 'reviewerName',
      required: true,
    }),
    textField({ name: 'city', label: 'City', preset: 'reviewCity', required: true }),
    textareaField({
      name: 'text',
      label: 'Review',
      preset: 'reviewText',
      required: true,
    }),
    {
      name: 'rating',
      label: 'Rating (1–5)',
      type: 'number',
      min: 1,
      max: 5,
      required: true,
      admin: { step: 1, description: 'Whole stars only.' },
      validate: (value: number | null | undefined) =>
        value === null || value === undefined || Number.isInteger(value)
          ? true
          : 'Use a whole number from 1 to 5.',
    },
    {
      name: 'source',
      label: 'Source',
      type: 'select',
      required: true,
      options: [
        { label: 'Google', value: 'google' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'Direct', value: 'direct' },
      ],
    },
    textField({
      name: 'sourceUrl',
      label: 'Source URL',
      preset: 'url',
      admin: { description: 'Link to the original review, when there is one.' },
      validate: (value: string | string[] | null | undefined) => {
        if (!value) return true;
        return typeof value === 'string' && /^https?:\/\//i.test(value)
          ? true
          : 'Enter a full http:// or https:// address.';
      },
    }),
    {
      name: 'reviewDate',
      label: 'Review date',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'permissionConfirmed',
      label: 'Customer agreed to publication',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Confirm the customer allowed this review to be shown (Q15).',
      },
    },
    {
      name: 'verified',
      label: 'Verified',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description: 'Only verified reviews render on the public site.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateReviewsAfterChange],
    afterDelete: [revalidateReviewsAfterDelete],
  },
};
