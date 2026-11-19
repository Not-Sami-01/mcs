import type { CollectionConfig } from 'payload';
import { ValidationError } from 'payload';

import { readPublic, writeMedia } from '../access/roles';
import { MEDIA_LIMITS } from '../cms/limits';

const mb = (bytes: number) => Math.round(bytes / (1024 * 1024));

/**
 * Public media library (site images, product/blog images, safety PDFs).
 * Storage: Filebase via the S3 adapter, under the `media/` key prefix (docs/STORAGE.md).
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: {
    create: writeMedia,
    read: readPublic,
    update: writeMedia,
    delete: writeMedia,
  },
  upload: {
    adminThumbnail: 'thumb',
    displayPreview: true,
    mimeTypes: [...MEDIA_LIMITS.mediaMimeTypes],
    imageSizes: [
      {
        name: 'thumb',
        width: MEDIA_LIMITS.imageWidths.thumb,
        formatOptions: { format: 'webp' },
        withoutEnlargement: true,
      },
      {
        name: 'card',
        width: MEDIA_LIMITS.imageWidths.card,
        formatOptions: { format: 'webp' },
        withoutEnlargement: true,
      },
      {
        name: 'hero',
        width: MEDIA_LIMITS.imageWidths.hero,
        formatOptions: { format: 'webp' },
        withoutEnlargement: true,
      },
      {
        name: 'card-avif',
        width: MEDIA_LIMITS.imageWidths.card,
        formatOptions: { format: 'avif' },
        withoutEnlargement: true,
      },
      {
        name: 'hero-avif',
        width: MEDIA_LIMITS.imageWidths.hero,
        formatOptions: { format: 'avif' },
        withoutEnlargement: true,
      },
    ],
  },
  hooks: {
    // Server-side size cap. Payload has no built-in file size limit; the picker
    // mimeTypes list above is convenience, this is the enforcement.
    beforeValidate: [
      ({ req }) => {
        const file = req.file;
        if (!file) return;

        // Payload quirk (observed 2026-11-19): for non-image files `req.file.size`
        // is clobbered to undefined by generateFileData, so measure the buffer
        // that is actually about to be stored and fall back to `size`.
        const byteLength = file.data?.length ?? file.size ?? 0;
        const maxBytes =
          file.mimetype === 'application/pdf'
            ? MEDIA_LIMITS.maxPdfBytes
            : MEDIA_LIMITS.maxImageBytes;

        if (byteLength > maxBytes) {
          throw new ValidationError(
            {
              collection: 'media',
              errors: [
                {
                  path: 'filename',
                  message: `File is larger than the ${mb(maxBytes)} MB limit`,
                },
              ],
            },
            req.t,
          );
        }
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      maxLength: MEDIA_LIMITS.altMaxLength,
      admin: {
        description: 'Describe the image for screen readers and search. Required before saving.',
      },
    },
  ],
};
