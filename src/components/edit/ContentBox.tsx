'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

import { saveDraftAction } from '@/app/(edit)/actions/save-draft';
import type { EditField } from '@/edit/registry';
import { messages } from '@/messages';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function counterLabel(count: number, max: number): string {
  return `${count} / ${max}`;
}

export function ContentBox({
  fields,
  initialValues,
  pageId,
  blockId,
  blockIndex,
  label,
  onClose,
}: {
  fields: EditField[];
  initialValues: Record<string, string>;
  pageId: number | string;
  blockId?: string | null;
  blockIndex: number;
  label: string;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [baseline, setBaseline] = useState<Record<string, string>>(initialValues);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLElement | null>(null);
  const headingId = useId();

  const dirty = JSON.stringify(values) !== JSON.stringify(baseline);

  const save = useCallback(async (): Promise<boolean> => {
    if (!dirty || status === 'saving') return true;
    setStatus('saving');
    setMessage(null);

    const result = await saveDraftAction({
      pageId,
      blockId,
      blockIndex,
      values,
    }).catch(() => null);

    if (!result) {
      setStatus('error');
      setMessage(messages.edit.saveFailed);
      return false;
    }

    if (result.ok) {
      setBaseline(values);
      setStatus('saved');
      setErrors({});
      return true;
    }

    setStatus('error');
    setErrors(result.fields ?? {});
    setMessage(result.message);
    return false;
  }, [blockId, blockIndex, dirty, pageId, status, values]);

  // Autosave after a short pause (docs/INLINE-EDITING.md §5 rule 6). An error
  // waits for the next edit or an explicit Save instead of retrying forever.
  useEffect(() => {
    if (!dirty || status === 'saving' || status === 'error') return;
    const timer = window.setTimeout(() => void save(), 2000);
    return () => window.clearTimeout(timer);
  }, [dirty, save, status]);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  async function close() {
    // Do not throw away unsaved text: keep the box open if the save fails.
    if (dirty && !(await save())) return;
    onClose();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key !== 'Tab' || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function field(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setStatus('idle');
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      onKeyDown={onKeyDown}
      className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-card border border-line bg-surface shadow-xl md:inset-y-0 md:right-0 md:left-auto md:w-[460px] md:max-h-none md:rounded-none md:border-y-0 md:border-r-0"
    >
      <div className="flex items-start justify-between gap-4 border-b border-line p-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-brand-primary uppercase">
            {messages.edit.contentBox}
          </p>
          <h2 id={headingId} className="mt-1 text-lg font-semibold text-ink">
            {label}
          </h2>
        </div>
        <button
          type="button"
          onClick={close}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-input border border-line px-3 text-sm font-semibold text-ink hover:border-brand-primary hover:text-brand-primary"
        >
          {messages.edit.close}
        </button>
      </div>

      <form
        className="flex-1 space-y-5 overflow-y-auto p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        {fields.map((fieldDef, index) => {
          const id = `${headingId}-${fieldDef.name}`;
          const value = values[fieldDef.name] ?? '';
          const error = errors[fieldDef.name];
          const describedBy = `${id}-help`;

          return (
            <div key={fieldDef.name}>
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={id} className="text-sm font-semibold text-ink">
                  {fieldDef.label}
                </label>
                {fieldDef.type === 'text' || fieldDef.type === 'textarea' ? (
                  <span
                    id={`${id}-count`}
                    className="text-xs tabular-nums text-ink-muted"
                    aria-live="polite"
                  >
                    {counterLabel(value.length, fieldDef.maxLength ?? 0)}
                  </span>
                ) : null}
              </div>

              {fieldDef.type === 'textarea' ? (
                <textarea
                  id={id}
                  ref={
                    index === 0
                      ? (element) => {
                          firstFieldRef.current = element;
                        }
                      : undefined
                  }
                  value={value}
                  maxLength={fieldDef.maxLength}
                  rows={4}
                  aria-describedby={`${describedBy} ${id}-count`}
                  aria-invalid={Boolean(error)}
                  onChange={(event) => field(fieldDef.name, event.target.value)}
                  className="mt-2 w-full rounded-input border border-line bg-surface px-3 py-2 text-sm text-ink"
                />
              ) : fieldDef.type === 'select' ? (
                <select
                  id={id}
                  ref={
                    index === 0
                      ? (element) => {
                          firstFieldRef.current = element;
                        }
                      : undefined
                  }
                  value={value}
                  aria-describedby={describedBy}
                  aria-invalid={Boolean(error)}
                  onChange={(event) => field(fieldDef.name, event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-input border border-line bg-surface px-3 text-sm text-ink"
                >
                  {!fieldDef.required ? <option value="">—</option> : null}
                  {(fieldDef.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={id}
                  ref={
                    index === 0
                      ? (element) => {
                          firstFieldRef.current = element;
                        }
                      : undefined
                  }
                  type={fieldDef.type === 'number' ? 'number' : 'text'}
                  inputMode={fieldDef.type === 'number' ? 'numeric' : undefined}
                  min={fieldDef.min}
                  max={fieldDef.max}
                  step={fieldDef.type === 'number' ? 1 : undefined}
                  value={value}
                  maxLength={fieldDef.type === 'number' ? undefined : fieldDef.maxLength}
                  aria-describedby={`${describedBy} ${id}-count`}
                  aria-invalid={Boolean(error)}
                  onChange={(event) => field(fieldDef.name, event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-input border border-line bg-surface px-3 text-sm text-ink"
                />
              )}

              <p id={describedBy} className="mt-1 text-xs text-ink-muted">
                {error ? (
                  <span className="text-red-700">{error}</span>
                ) : fieldDef.type === 'number' ? (
                  `Whole number${fieldDef.min !== undefined ? `, minimum ${fieldDef.min}` : ''}${
                    fieldDef.max !== undefined ? `, maximum ${fieldDef.max}` : ''
                  }.`
                ) : (
                  `Max ${fieldDef.maxLength ?? '—'} characters.`
                )}
              </p>
            </div>
          );
        })}
      </form>

      <div className="border-t border-line p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role="status" aria-live="polite" className="text-xs text-ink-muted">
            {message
              ? message
              : status === 'saving'
                ? messages.edit.saving
                : status === 'saved'
                  ? messages.edit.saved
                  : dirty
                    ? messages.edit.unsaved
                    : messages.edit.noChanges}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={close}
              className="inline-flex min-h-11 items-center rounded-input border border-line px-4 text-sm font-semibold text-ink hover:border-brand-primary"
            >
              {messages.edit.close}
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={!dirty || status === 'saving'}
              className="inline-flex min-h-11 items-center rounded-input bg-brand-primary px-4 text-sm font-semibold text-brand-primary-contrast hover:bg-ink disabled:opacity-50"
            >
              {status === 'saving' ? messages.edit.saving : messages.edit.saveDraft}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
