'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, type ReactNode } from 'react';

import { saveDraftAction } from '@/app/(edit)/actions/save-draft';
import type { EditNode } from '@/edit/registry';
import { messages } from '@/messages';

import { ContentBox } from './ContentBox';

/**
 * Edit-mode wrapper (docs/INLINE-EDITING.md §4). It is only rendered inside
 * the `/edit` route, so public HTML never contains edit buttons, document ids
 * or field paths. The outline uses `outline` (not borders) and therefore
 * cannot shift layout.
 */
export function Editable({
  children,
  label,
  schema,
  initialValues,
  pageId,
  blockId,
  blockIndex,
  hidden = false,
  tools,
  expectedUpdatedAt = null,
}: {
  children: ReactNode;
  label: string;
  schema: EditNode[];
  initialValues: Record<string, unknown>;
  pageId: number | string;
  blockId?: string | null;
  blockIndex: number;
  hidden?: boolean;
  tools?: ReactNode;
  expectedUpdatedAt?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Keep the newest saved timestamp here, not only inside the drawer: closing
  // and reopening a box must not fall back to the page-load version.
  const [version, setVersion] = useState<string | null>(expectedUpdatedAt);
  const [lastProp, setLastProp] = useState<string | null>(expectedUpdatedAt);
  // A server refresh (for example after a block toolbar action) brings a new
  // base version. Adjust during render instead of an effect so the box never
  // opens with a stale timestamp.
  if (expectedUpdatedAt !== lastProp) {
    setLastProp(expectedUpdatedAt);
    setVersion(expectedUpdatedAt);
  }
  const triggerRef = useRef<HTMLButtonElement>(null);
  const editLabel = messages.edit.editSection.replace('{label}', label);

  function close() {
    setOpen(false);
    // Focus returns to the control that opened the box (docs/INLINE-EDITING.md §11).
    triggerRef.current?.focus();
  }

  function reload() {
    // Drop local state and pull the other editor's version from the server.
    setVersion(expectedUpdatedAt);
    setOpen(false);
    router.refresh();
    triggerRef.current?.focus();
  }

  return (
    <div className="group/edit relative outline-2 outline-offset-[-2px] outline-dashed outline-transparent hover:outline-brand-primary/70 focus-within:outline-brand-primary">
      <div className={hidden ? 'opacity-50' : undefined}>{children}</div>

      {hidden ? (
        <p className="pointer-events-none absolute inset-x-0 bottom-3 z-20 mx-auto w-fit rounded-full bg-ink px-3 py-1 text-xs font-medium text-brand-primary-contrast">
          {messages.edit.hiddenSection}
        </p>
      ) : null}

      {tools}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={editLabel}
        className="absolute end-3 top-3 z-20 inline-flex min-h-11 items-center rounded-input border border-line bg-surface px-3 text-sm font-medium text-ink opacity-0 shadow-sm transition-opacity hover:border-brand-primary hover:text-brand-primary focus:opacity-100 focus-visible:opacity-100 group-hover/edit:opacity-100 motion-reduce:transition-none"
      >
        {messages.edit.edit}
      </button>

      {open ? (
        <>
          <div aria-hidden="true" className="fixed inset-0 z-40 bg-ink/40" />
          <ContentBox
            schema={schema}
            initialValues={initialValues}
            label={label}
            onSave={async (values, expected) => {
              const result = await saveDraftAction({
                pageId,
                blockId,
                blockIndex,
                values,
                expectedUpdatedAt: expected,
              });
              if (result.ok) setVersion(result.updatedAt);
              return result;
            }}
            onClose={close}
            onReload={reload}
            expectedUpdatedAt={version}
          />
        </>
      ) : null}
    </div>
  );
}
