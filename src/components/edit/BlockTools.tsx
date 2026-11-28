'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { blockAction } from '@/app/(edit)/actions/blocks';
import { messages } from '@/messages';

export type BlockTypeOption = { value: string; label: string };

const button =
  'inline-flex min-h-11 items-center rounded-input border border-line bg-surface px-2.5 text-xs font-medium text-ink hover:border-brand-primary hover:text-brand-primary disabled:opacity-40';

/**
 * Per-section toolbar (docs/INLINE-EDITING.md §6). Buttons only — every action
 * is reachable by keyboard and touch. Each call writes a draft and refreshes
 * the server-rendered edit route.
 */
export function BlockTools({
  pageId,
  blockId,
  index,
  total,
  hidden,
  blockTypes,
}: {
  pageId: number | string;
  blockId: string | null;
  index: number;
  total: number;
  hidden: boolean;
  blockTypes: BlockTypeOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addType, setAddType] = useState(blockTypes[0]?.value ?? '');

  function run(input: Parameters<typeof blockAction>[0]) {
    if (busy) return;
    setBusy(true);
    setError(null);

    void blockAction(input)
      .then((result) => {
        if (!result.ok) {
          setError(result.message);
          return;
        }
        startTransition(() => router.refresh());
      })
      .catch(() => setError(messages.edit.saveFailed))
      .finally(() => setBusy(false));
  }

  const disabled = busy || pending || !blockId;

  return (
    <div
      role="group"
      aria-label={messages.edit.sectionTools}
      className="absolute start-3 top-3 z-30 flex max-w-[calc(100%-6rem)] flex-wrap items-center gap-1.5 rounded-input border border-line bg-surface/95 p-1.5 shadow-sm"
    >
      <button
        type="button"
        className={button}
        disabled={disabled || index === 0}
        onClick={() => run({ op: 'move', pageId, blockId: blockId!, direction: 'up' })}
      >
        {messages.edit.moveUp}
      </button>
      <button
        type="button"
        className={button}
        disabled={disabled || index === total - 1}
        onClick={() => run({ op: 'move', pageId, blockId: blockId!, direction: 'down' })}
      >
        {messages.edit.moveDown}
      </button>
      <button
        type="button"
        className={button}
        disabled={disabled}
        onClick={() => run({ op: 'duplicate', pageId, blockId: blockId! })}
      >
        {messages.edit.duplicate}
      </button>
      <button
        type="button"
        className={button}
        disabled={disabled}
        onClick={() => run({ op: 'toggleHidden', pageId, blockId: blockId! })}
        aria-pressed={hidden}
      >
        {hidden ? messages.edit.show : messages.edit.hide}
      </button>
      <button
        type="button"
        className={`${button} text-red-700 hover:border-red-700`}
        disabled={disabled}
        onClick={() => {
          if (!window.confirm(messages.edit.confirmDelete)) return;
          run({ op: 'remove', pageId, blockId: blockId! });
        }}
      >
        {messages.edit.delete}
      </button>

      <span className="mx-1 h-6 w-px bg-line" aria-hidden="true" />

      <label htmlFor={`add-section-${blockId ?? index}`} className="sr-only">
        {messages.edit.sectionType}
      </label>
      <select
        id={`add-section-${blockId ?? index}`}
        value={addType}
        disabled={disabled}
        onChange={(event) => setAddType(event.target.value)}
        className="min-h-11 rounded-input border border-line bg-surface px-2 text-xs text-ink"
      >
        {blockTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        className={button}
        disabled={disabled || !addType}
        onClick={() => run({ op: 'add', pageId, blockType: addType, index: index + 1 })}
      >
        {messages.edit.addSection}
      </button>

      {error ? (
        <p role="status" className="w-full px-1 text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** "Add section" after the last block, or the first one on an empty page. */
export function AddSection({
  pageId,
  index,
  blockTypes,
  first = false,
}: {
  pageId: number | string;
  index: number;
  blockTypes: BlockTypeOption[];
  first?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [addType, setAddType] = useState(blockTypes[0]?.value ?? '');
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-input border border-dashed border-line p-3">
      <div className="min-w-40 flex-1">
        <label htmlFor="add-section-end" className="text-xs font-medium text-ink">
          {messages.edit.sectionType}
        </label>
        <select
          id="add-section-end"
          value={addType}
          disabled={pending}
          onChange={(event) => setAddType(event.target.value)}
          className="mt-1 min-h-11 w-full rounded-input border border-line bg-surface px-3 text-sm text-ink"
        >
          {blockTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        disabled={pending || !addType}
        onClick={() => {
          setError(null);
          void blockAction({ op: 'add', pageId, blockType: addType, index })
            .then((result) => {
              if (!result.ok) setError(result.message);
              else startTransition(() => router.refresh());
            })
            .catch(() => setError(messages.edit.saveFailed));
        }}
        className="inline-flex min-h-11 items-center rounded-input bg-brand-primary px-4 text-sm font-medium text-brand-primary-contrast hover:bg-ink disabled:opacity-50"
      >
        {first ? messages.edit.addFirstSection : messages.edit.addSection}
      </button>
      {error ? (
        <p role="status" className="w-full text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
