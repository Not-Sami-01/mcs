'use client';

import { useRef, useState } from 'react';

import { saveGlobalAction } from '@/app/(edit)/actions/save-global';
import type { GlobalRegionKey } from '@/edit/global-regions';
import type { EditNode } from '@/edit/registry';
import { messages } from '@/messages';

import { ContentBox } from './ContentBox';

/**
 * Staff-bar entry point for a global region (menu/footer or contact details).
 * Globals have no drafts, so this box saves the live values.
 */
export function GlobalEditorButton({
  region,
  label,
  schema,
  initialValues,
}: {
  region: GlobalRegionKey;
  label: string;
  schema: EditNode[];
  initialValues: Record<string, unknown>;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex min-h-11 items-center rounded-input border border-brand-primary-contrast/40 px-3 text-xs font-medium hover:bg-brand-primary hover:text-brand-primary-contrast"
      >
        {label}
      </button>

      {open ? (
        <>
          <div aria-hidden="true" className="fixed inset-0 z-40 bg-ink/40" />
          <ContentBox
            schema={schema}
            initialValues={initialValues}
            label={label}
            saveLabel={messages.edit.saveChanges}
            savedLabel={messages.edit.savedSettings}
            onSave={(values) => saveGlobalAction({ region, values })}
            onClose={close}
          />
        </>
      ) : null}
    </>
  );
}
