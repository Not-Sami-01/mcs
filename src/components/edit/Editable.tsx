'use client';

import { useRef, useState, type ReactNode } from 'react';

import type { EditField } from '@/edit/registry';
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
  fields,
  initialValues,
  pageId,
  blockId,
  blockIndex,
}: {
  children: ReactNode;
  label: string;
  fields: EditField[];
  initialValues: Record<string, string>;
  pageId: number | string;
  blockId?: string | null;
  blockIndex: number;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const editLabel = messages.edit.editSection.replace('{label}', label);

  function close() {
    setOpen(false);
    // Focus returns to the control that opened the box (docs/INLINE-EDITING.md §11).
    triggerRef.current?.focus();
  }

  return (
    <div className="group/edit relative outline-2 outline-offset-[-2px] outline-dashed outline-transparent hover:outline-brand-primary/70 focus-within:outline-brand-primary">
      {children}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={editLabel}
        className="absolute end-3 top-3 z-20 inline-flex min-h-11 items-center rounded-input border border-line bg-surface px-3 text-sm font-semibold text-ink opacity-0 shadow-sm transition-opacity hover:border-brand-primary hover:text-brand-primary focus:opacity-100 focus-visible:opacity-100 group-hover/edit:opacity-100 motion-reduce:transition-none"
      >
        {messages.edit.edit}
      </button>

      {open ? (
        <>
          <div aria-hidden="true" className="fixed inset-0 z-40 bg-ink/40" />
          <ContentBox
            fields={fields}
            initialValues={initialValues}
            pageId={pageId}
            blockId={blockId}
            blockIndex={blockIndex}
            label={label}
            onClose={close}
          />
        </>
      ) : null}
    </div>
  );
}
