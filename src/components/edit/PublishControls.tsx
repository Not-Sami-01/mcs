'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  discardDraftAction,
  listVersionsAction,
  publishPageAction,
  restoreVersionAction,
  schedulePublishAction,
} from '@/app/(edit)/actions/publish';
import type { PageVersionSummary, PublishProblem } from '@/edit/publish';
import { messages } from '@/messages';

const button =
  'inline-flex min-h-11 items-center rounded-input border border-brand-primary-contrast/40 px-3 text-xs font-semibold hover:bg-brand-primary hover:text-brand-primary-contrast disabled:opacity-50';

/**
 * Publish / discard / version history for the open page (CP-4.3). Publishing is
 * always explicit and confirmed by the server-side gates; version restore
 * writes the old version back as a draft.
 */
export function PublishControls({
  pageId,
  status,
}: {
  pageId: number | string;
  status: 'draft' | 'published' | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [problems, setProblems] = useState<PublishProblem[]>([]);
  const [versions, setVersions] = useState<PageVersionSummary[] | null>(null);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [publishAt, setPublishAt] = useState('');
  const [unpublishAt, setUnpublishAt] = useState('');

  async function publish() {
    setBusy(true);
    setMessage(null);
    setProblems([]);

    const result = await publishPageAction(pageId).catch(() => null);
    setBusy(false);

    if (!result) {
      setMessage(messages.edit.saveFailed);
      return;
    }
    if (result.ok) {
      setMessage(messages.edit.published);
      router.refresh();
      return;
    }
    setMessage(result.message);
    if (result.code === 'GATES') setProblems(result.problems ?? []);
  }

  async function discard() {
    if (!window.confirm(messages.edit.discardConfirm)) return;
    setBusy(true);
    setMessage(null);

    const result = await discardDraftAction(pageId).catch(() => null);
    setBusy(false);

    if (!result) {
      setMessage(messages.edit.saveFailed);
      return;
    }
    setMessage(result.ok ? messages.edit.draftDiscarded : result.message);
    if (result.ok) router.refresh();
  }

  async function schedule() {
    // datetime-local values are in the browser's timezone; send UTC ISO.
    const publishDate = publishAt ? new Date(publishAt) : null;
    const unpublishDate = unpublishAt ? new Date(unpublishAt) : null;
    if (
      !publishDate ||
      Number.isNaN(publishDate.getTime()) ||
      (unpublishDate !== null &&
        (Number.isNaN(unpublishDate.getTime()) || unpublishDate <= publishDate))
    ) {
      setMessage(messages.edit.scheduleInvalid);
      return;
    }

    setBusy(true);
    setMessage(null);
    const result = await schedulePublishAction(
      pageId,
      publishDate.toISOString(),
      unpublishDate ? unpublishDate.toISOString() : null,
    ).catch(() => null);
    setBusy(false);

    if (!result) {
      setMessage(messages.edit.saveFailed);
      return;
    }
    if (result.ok) {
      setScheduling(false);
      setMessage(messages.edit.scheduled);
      return;
    }
    setMessage(result.message);
  }

  async function openVersions() {
    setVersionsLoading(true);
    setMessage(null);
    const result = await listVersionsAction(pageId).catch(() => null);
    setVersionsLoading(false);

    if (!result || !result.ok) {
      setMessage(result && !result.ok ? result.message : messages.edit.saveFailed);
      return;
    }
    setVersions(result.versions);
  }

  async function restore(versionId: string) {
    setBusy(true);
    const result = await restoreVersionAction(pageId, versionId).catch(() => null);
    setBusy(false);

    if (!result) {
      setMessage(messages.edit.saveFailed);
      return;
    }
    if (result.ok) {
      setVersions(null);
      setMessage(messages.edit.versionRestored);
      router.refresh();
    } else {
      setMessage(result.message);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className={button} disabled={busy} onClick={() => void publish()}>
        {busy ? messages.edit.saving : messages.edit.publish}
      </button>
      {status === 'published' ? (
        <button type="button" className={button} disabled={busy} onClick={() => void discard()}>
          {messages.edit.discardDraft}
        </button>
      ) : null}
      <button
        type="button"
        className={button}
        disabled={busy || versionsLoading}
        onClick={() => void openVersions()}
      >
        {versionsLoading ? messages.edit.saving : messages.edit.versions}
      </button>
      <button
        type="button"
        className={button}
        disabled={busy}
        aria-expanded={scheduling}
        onClick={() => setScheduling((current) => !current)}
      >
        {messages.edit.schedule}
      </button>

      {scheduling ? (
        <form
          className="flex w-full flex-wrap items-end gap-2 rounded-input border border-line bg-surface-alt p-3 text-xs"
          onSubmit={(event) => {
            event.preventDefault();
            void schedule();
          }}
        >
          <label className="flex flex-col gap-1 font-semibold">
            {messages.edit.publishAt}
            <input
              type="datetime-local"
              required
              value={publishAt}
              onChange={(event) => setPublishAt(event.target.value)}
              className="min-h-11 rounded-input border border-line bg-surface px-2 text-sm font-normal"
            />
          </label>
          <label className="flex flex-col gap-1 font-semibold">
            {messages.edit.unpublishAt}
            <input
              type="datetime-local"
              value={unpublishAt}
              onChange={(event) => setUnpublishAt(event.target.value)}
              className="min-h-11 rounded-input border border-line bg-surface px-2 text-sm font-normal"
            />
          </label>
          <button type="submit" className={button} disabled={busy || !publishAt}>
            {messages.edit.scheduleConfirm}
          </button>
          <button
            type="button"
            className={button}
            disabled={busy}
            onClick={() => setScheduling(false)}
          >
            {messages.edit.cancel}
          </button>
        </form>
      ) : null}

      {message ? (
        <p role="status" aria-live="polite" className="text-xs font-semibold text-brand-accent">
          {message}
        </p>
      ) : null}

      {problems.length > 0 ? (
        <div role="alert" className="w-full rounded-input border border-brand-accent p-3 text-xs">
          <p className="font-semibold">{messages.edit.publishGates}</p>
          <ul className="mt-1 list-inside list-disc">
            {problems.map((problem) => (
              <li key={`${problem.field}-${problem.message}`}>{problem.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {versions ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={messages.edit.versionHistory}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setVersions(null);
          }}
          className="fixed inset-x-4 top-24 z-50 mx-auto max-h-[70vh] max-w-lg overflow-y-auto rounded-card border border-line bg-surface p-4 text-ink shadow-xl"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{messages.edit.versionHistory}</h2>
            <button
              type="button"
              onClick={() => setVersions(null)}
              className="inline-flex min-h-11 items-center rounded-input border border-line px-3 text-sm font-semibold"
            >
              {messages.edit.close}
            </button>
          </div>

          {versions.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">{messages.edit.noVersions}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {versions.map((version) => (
                <li
                  key={version.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-input border border-line p-3 text-sm"
                >
                  <span>
                    {new Date(version.updatedAt).toLocaleString()}{' '}
                    <span className="text-ink-muted">
                      {version.status === 'published'
                        ? messages.edit.versionPublished
                        : messages.edit.versionDraft}
                    </span>
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void restore(version.id)}
                    className="inline-flex min-h-11 items-center rounded-input border border-line px-3 text-xs font-semibold hover:border-brand-primary disabled:opacity-50"
                  >
                    {messages.edit.restore}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
