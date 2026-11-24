import Link from 'next/link';

import type { GlobalRegionKey } from '@/edit/global-regions';
import type { EditNode } from '@/edit/registry';
import { messages } from '@/messages';

import { GlobalEditorButton } from './GlobalEditorButton';

/**
 * Thin staff bar for the edit route (docs/INLINE-EDITING.md §1). It is not part
 * of the public design and exists only on `/edit/*`.
 *
 * "View as visitor" uses a one-request `?view=visitor` hint rather than a
 * stored preference, so the next navigation returns to edit mode and the
 * public page never needs a staff-only link back.
 */
export function StaffBar({
  publicPath,
  pageTitle,
  globals = [],
}: {
  publicPath: string;
  pageTitle: string;
  globals?: Array<{
    region: GlobalRegionKey;
    label: string;
    schema: EditNode[];
    initialValues: Record<string, unknown>;
  }>;
}) {
  const previewUrl = `${publicPath}${publicPath.includes('?') ? '&' : '?'}view=visitor`;

  return (
    <nav
      aria-label={messages.edit.staffBar}
      className="sticky top-0 z-40 border-b border-line bg-ink text-brand-primary-contrast"
    >
      <div className="mx-auto flex min-h-11 w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="rounded-full bg-brand-accent px-2 py-0.5 text-xs font-semibold text-ink">
            {messages.edit.mode}
          </span>
          <span className="truncate text-sm font-semibold">{pageTitle}</span>
          <span className="hidden text-xs text-brand-primary-contrast/80 sm:inline">
            {messages.edit.draftPreview}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {globals.map((global) => (
            <GlobalEditorButton key={global.region} {...global} />
          ))}

          <Link
            href={previewUrl}
            prefetch={false}
            className="inline-flex min-h-11 items-center rounded-input border border-brand-primary-contrast/40 px-3 text-xs font-semibold hover:bg-brand-primary hover:text-brand-primary-contrast"
          >
            {messages.edit.viewAsVisitor}
          </Link>
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center rounded-input bg-surface px-3 text-xs font-semibold text-ink hover:bg-surface-alt"
          >
            {messages.edit.admin}
          </Link>
        </div>
      </div>
    </nav>
  );
}
