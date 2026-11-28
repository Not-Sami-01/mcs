'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

import type { EditNode } from '@/edit/registry';
import { messages } from '@/messages';

import { EditFields } from './EditFields';
import { setAtPath } from './paths';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type ContentBoxSaveResult =
  | { ok: true; updatedAt?: string }
  | {
      ok: false;
      code?: string;
      message?: string;
      fields?: Record<string, string>;
      serverUpdatedAt?: string;
      serverValues?: Record<string, unknown>;
    };

type Conflict = { serverUpdatedAt: string | null; serverValues: Record<string, unknown> };

const shownValue = (value: unknown): string =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
    ? String(value)
    : JSON.stringify(value ?? null);

export function ContentBox({
  schema,
  initialValues,
  label,
  onSave,
  onClose,
  onReload,
  expectedUpdatedAt = null,
  saveLabel = messages.edit.saveDraft,
  savedLabel = messages.edit.saved,
}: {
  schema: EditNode[];
  initialValues: Record<string, unknown>;
  label: string;
  onSave: (
    values: Record<string, unknown>,
    expectedUpdatedAt: string | null,
  ) => Promise<ContentBoxSaveResult | null>;
  onClose: () => void;
  onReload?: () => void;
  expectedUpdatedAt?: string | null;
  saveLabel?: string;
  savedLabel?: string;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [baseline, setBaseline] = useState<Record<string, unknown>>(initialValues);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflict, setConflict] = useState<Conflict | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingId = useId();

  const dirty = JSON.stringify(values) !== JSON.stringify(baseline);

  // Autosave and the explicit Save button can fire together. Saves run one at
  // a time; a request that arrives mid-save is replayed with the newest text,
  // so the second request never reuses the first one's stale version.
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const baselineRef = useRef(baseline);
  baselineRef.current = baseline;
  const expectedRef = useRef<string | null>(expectedUpdatedAt);
  const pendingSave = useRef<Promise<boolean> | null>(null);
  const queuedSave = useRef(false);

  const performSave = useCallback(
    async (expectedOverride: string | null): Promise<boolean> => {
      const snapshot = valuesRef.current;
      if (JSON.stringify(snapshot) === JSON.stringify(baselineRef.current)) return true;

      setStatus('saving');
      setMessage(null);
      setConflict(null);

      const result = await onSave(snapshot, expectedOverride ?? expectedRef.current).catch(
        () => null,
      );

      if (!result) {
        setStatus('error');
        setMessage(messages.edit.saveFailed);
        return false;
      }

      if (result.ok) {
        baselineRef.current = snapshot;
        setBaseline(snapshot);
        setStatus('saved');
        setErrors({});
        if (result.updatedAt) expectedRef.current = result.updatedAt;
        return true;
      }

      if (result.code === 'CONFLICT') {
        setStatus('error');
        setMessage(result.message ?? messages.edit.conflict);
        setConflict({
          serverUpdatedAt: result.serverUpdatedAt ?? null,
          serverValues: result.serverValues ?? {},
        });
        return false;
      }

      setStatus('error');
      setErrors(result.fields ?? {});
      setMessage(result.message ?? messages.edit.saveFailed);
      return false;
    },
    [onSave],
  );

  const save = useCallback(
    (expectedOverride?: string | null): Promise<boolean> => {
      if (pendingSave.current) {
        queuedSave.current = true;
        return pendingSave.current;
      }

      const run = async () => {
        let override: string | null = expectedOverride ?? null;
        for (;;) {
          queuedSave.current = false;
          const ok = await performSave(override);
          override = null;
          if (!ok) return false;
          if (!queuedSave.current) return true;
        }
      };

      const promise = run().finally(() => {
        pendingSave.current = null;
      });
      pendingSave.current = promise;
      return promise;
    },
    [performSave],
  );

  // Autosave after a short pause (docs/INLINE-EDITING.md §5 rule 6). An error
  // waits for the next edit or an explicit Save instead of retrying forever.
  useEffect(() => {
    if (!dirty || status === 'saving' || status === 'error') return;
    const timer = window.setTimeout(() => void save(), 2000);
    return () => window.clearTimeout(timer);
  }, [dirty, save, status]);

  useEffect(() => {
    dialogRef.current?.querySelector<HTMLElement>('input, textarea, select, button')?.focus();
  }, []);

  async function close() {
    // Do not throw away unsaved text: keep the box open if the save fails.
    if (dirty && !(await save())) return;
    onClose();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      void close();
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

  function update(path: string, value: unknown) {
    setValues((current) => setAtPath(current, path, value));
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
          <p className="text-xs font-medium text-ink-muted">{messages.edit.contentBox}</p>
          <h2 id={headingId} className="mt-1 text-lg font-medium text-ink">
            {label}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => void close()}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-input border border-line px-3 text-sm font-medium text-ink hover:border-brand-primary hover:text-brand-primary"
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
        <EditFields schema={schema} values={values} errors={errors} onChange={update} />
      </form>

      {conflict ? (
        <div role="alert" className="border-t border-line bg-surface-alt p-4 text-sm text-ink">
          <p className="font-medium">{messages.edit.conflict}</p>
          <p className="mt-1 text-xs text-ink-muted">{messages.edit.conflictHelp}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onReload?.()}
              className="inline-flex min-h-11 items-center rounded-input border border-line px-4 text-sm font-medium text-ink hover:border-brand-primary"
            >
              {messages.edit.reloadTheirs}
            </button>
            <button
              type="button"
              onClick={() => void save(conflict.serverUpdatedAt)}
              className="inline-flex min-h-11 items-center rounded-input bg-brand-primary px-4 text-sm font-medium text-brand-primary-contrast hover:bg-ink"
            >
              {messages.edit.keepMine}
            </button>
            <button
              type="button"
              aria-expanded={showDiff}
              onClick={() => setShowDiff((current) => !current)}
              className="inline-flex min-h-11 items-center rounded-input border border-line px-4 text-sm font-medium text-ink hover:border-brand-primary"
            >
              {messages.edit.seeDifferences}
            </button>
          </div>

          {showDiff ? (
            <dl className="mt-3 space-y-2 text-xs">
              {schema
                .filter(
                  (node) =>
                    JSON.stringify(values[node.name] ?? null) !==
                    JSON.stringify(conflict.serverValues[node.name] ?? null),
                )
                .map((node) => (
                  <div key={node.name} className="rounded-input border border-line p-2">
                    <dt className="font-medium">{node.label}</dt>
                    <dd className="mt-1">
                      {messages.edit.yours}: {shownValue(values[node.name])}
                    </dd>
                    <dd>
                      {messages.edit.theirs}: {shownValue(conflict.serverValues[node.name])}
                    </dd>
                  </div>
                ))}
            </dl>
          ) : null}
        </div>
      ) : null}

      <div className="border-t border-line p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role="status" aria-live="polite" className="text-xs text-ink-muted">
            {message
              ? message
              : status === 'saving'
                ? messages.edit.saving
                : status === 'saved'
                  ? savedLabel
                  : dirty
                    ? messages.edit.unsaved
                    : messages.edit.noChanges}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void close()}
              className="inline-flex min-h-11 items-center rounded-input border border-line px-4 text-sm font-medium text-ink hover:border-brand-primary"
            >
              {messages.edit.close}
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={!dirty || status === 'saving'}
              className="inline-flex min-h-11 items-center rounded-input bg-brand-primary px-4 text-sm font-medium text-brand-primary-contrast hover:bg-ink disabled:opacity-50"
            >
              {status === 'saving' ? messages.edit.saving : saveLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
