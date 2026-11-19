/**
 * Single source of truth for content and upload limits (AGENTS.md golden rule 2).
 *
 * Payload field configs, the inline editor and tests all read from here —
 * never hard-code a limit anywhere else.
 *
 * CP-1.2 extends this file with the rest of the collections' text/list limits.
 */

export const MEDIA_LIMITS = {
  /** Alt text cap. Short and descriptive (screen readers read it out loud). */
  altMaxLength: 160,
  /** Upload size caps in bytes: images 8 MB, PDFs (safety documents) 10 MB (docs/STORAGE.md §4). */
  maxImageBytes: 8 * 1024 * 1024,
  maxPdfBytes: 10 * 1024 * 1024,
  /** Widths in px of the generated variants. Never enlarge an upload. */
  imageWidths: {
    thumb: 400,
    card: 800,
    hero: 1600,
  },
  /** Allowed upload types, verified against the file's declared mime type. */
  mediaMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'application/pdf',
  ] as const,
} as const;

export type MediaLimits = typeof MEDIA_LIMITS;
