'use client';

import { useEffect, useId, useState } from 'react';

import { listMediaAction, type MediaOption } from '@/app/(edit)/actions/media';
import type { EditArray, EditGroup, EditNode, EditScalar } from '@/edit/registry';
import { messages } from '@/messages';

import { getAtPath } from './paths';

type Change = (path: string, value: unknown) => void;

function pathFor(prefix: string, name: string): string {
  return prefix ? `${prefix}.${name}` : name;
}

function defaultsFor(fields: EditNode[]): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.type === 'array') row[field.name] = [];
    else if (field.type === 'group') row[field.name] = defaultsFor(field.fields);
    else if (field.type === 'boolean') row[field.name] = false;
    else if (field.type === 'upload') row[field.name] = null;
    else row[field.name] = '';
  }
  return row;
}

/** Shared counter/help line for a field. */
function Help({ id, error, help }: { id: string; error?: string; help: string }) {
  return (
    <p id={id} className="mt-1 text-xs text-ink-muted">
      {error ? <span className="text-red-700">{error}</span> : help}
    </p>
  );
}

function ScalarControl({
  node,
  path,
  value,
  error,
  onChange,
  idBase,
}: {
  node: EditScalar;
  path: string;
  value: unknown;
  error?: string;
  onChange: Change;
  idBase: string;
}) {
  const id = `${idBase}-${path}`;
  const helpId = `${id}-help`;
  const countId = `${id}-count`;
  const describedBy =
    node.type === 'text' || node.type === 'textarea' ? `${helpId} ${countId}` : helpId;

  if (node.type === 'boolean') {
    return (
      <div>
        <label
          htmlFor={id}
          className="flex min-h-11 items-center gap-3 text-sm font-semibold text-ink"
        >
          <input
            id={id}
            type="checkbox"
            checked={value === true}
            onChange={(event) => onChange(path, event.target.checked)}
            aria-describedby={helpId}
            aria-invalid={Boolean(error)}
            className="h-5 w-5 rounded border-line text-brand-primary"
          />
          {node.label}
        </label>
        <Help id={helpId} error={error} help="Tick when confirmed." />
      </div>
    );
  }

  if (node.type === 'upload') {
    return (
      <ImageControl
        node={node}
        path={path}
        value={value}
        error={error}
        onChange={onChange}
        idBase={idBase}
      />
    );
  }

  const text = typeof value === 'string' || typeof value === 'number' ? String(value) : '';

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {node.label}
          {node.required ? <span className="text-ink-muted"> *</span> : null}
        </label>
        {node.type === 'text' || node.type === 'textarea' ? (
          <span id={countId} className="text-xs tabular-nums text-ink-muted" aria-live="polite">
            {text.length} / {node.maxLength ?? 0}
          </span>
        ) : null}
      </div>

      {node.type === 'textarea' ? (
        <textarea
          id={id}
          value={text}
          maxLength={node.maxLength}
          rows={4}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(path, event.target.value)}
          className="mt-2 w-full rounded-input border border-line bg-surface px-3 py-2 text-sm text-ink"
        />
      ) : node.type === 'select' ? (
        <select
          id={id}
          value={text}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(path, event.target.value)}
          className="mt-2 min-h-11 w-full rounded-input border border-line bg-surface px-3 text-sm text-ink"
        >
          {!node.required ? <option value="">—</option> : null}
          {(node.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={node.type === 'number' ? 'number' : 'text'}
          inputMode={node.type === 'number' ? 'numeric' : undefined}
          min={node.min}
          max={node.max}
          step={node.type === 'number' ? 1 : undefined}
          value={text}
          maxLength={node.type === 'number' ? undefined : node.maxLength}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(path, event.target.value)}
          className="mt-2 min-h-11 w-full rounded-input border border-line bg-surface px-3 text-sm text-ink"
        />
      )}

      <Help
        id={helpId}
        error={error}
        help={
          node.type === 'number'
            ? `Whole number${node.min !== undefined ? `, minimum ${node.min}` : ''}${
                node.max !== undefined ? `, maximum ${node.max}` : ''
              }.`
            : `Max ${node.maxLength ?? '—'} characters.`
        }
      />
    </div>
  );
}

let mediaCache: Promise<MediaOption[]> | null = null;

function loadMedia(): Promise<MediaOption[]> {
  mediaCache ??= listMediaAction().catch(() => {
    mediaCache = null;
    return [];
  });
  return mediaCache;
}

function ImageControl({
  node,
  path,
  value,
  error,
  onChange,
  idBase,
}: {
  node: EditScalar;
  path: string;
  value: unknown;
  error?: string;
  onChange: Change;
  idBase: string;
}) {
  const id = `${idBase}-${path}`;
  const helpId = `${id}-help`;
  const [media, setMedia] = useState<MediaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [alt, setAlt] = useState('');

  useEffect(() => {
    let cancelled = false;
    void loadMedia().then((items) => {
      if (!cancelled) {
        setMedia(items);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = media.find((item) => String(item.id) === String(value));
  const selectedId = selected ? String(selected.id) : '';

  async function upload(file: File) {
    if (!alt.trim()) {
      setUploadError(messages.edit.altRequired);
      return;
    }

    setUploading(true);
    setUploadError(null);
    const body = new FormData();
    body.set('file', file);
    body.set('alt', alt.trim());

    try {
      const response = await fetch('/api/media', { method: 'POST', body });
      if (!response.ok) throw new Error('upload failed');
      const doc = (await response.json()) as { doc?: { id?: number | string } };
      if (doc.doc?.id === undefined) throw new Error('upload failed');

      mediaCache = null;
      const items = await loadMedia();
      setMedia(items);
      onChange(path, String(doc.doc.id));
      setAlt('');
    } catch {
      setUploadError(messages.edit.uploadFailed);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {node.label}
        {node.required ? <span className="text-ink-muted"> *</span> : null}
      </label>

      <div className="mt-2 flex items-start gap-3">
        {selected?.thumb ? (
          // eslint-disable-next-line @next/next/no-img-element -- media URLs come from the CMS
          <img
            src={selected.thumb}
            alt={selected.alt}
            className="h-16 w-16 rounded-input border border-line object-cover"
          />
        ) : null}

        <select
          id={id}
          value={selectedId}
          disabled={loading}
          aria-describedby={helpId}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(path, event.target.value || null)}
          className="min-h-11 flex-1 rounded-input border border-line bg-surface px-3 text-sm text-ink"
        >
          <option value="">{loading ? messages.edit.loadingImages : messages.edit.noImage}</option>
          {media.map((item) => (
            <option key={item.id} value={String(item.id)}>
              {item.alt || `#${item.id}`}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 rounded-input border border-dashed border-line p-3">
        <label htmlFor={`${id}-alt`} className="text-xs font-semibold text-ink">
          {messages.edit.altText}
        </label>
        <input
          id={`${id}-alt`}
          value={alt}
          maxLength={160}
          onChange={(event) => setAlt(event.target.value)}
          className="mt-1 min-h-11 w-full rounded-input border border-line bg-surface px-3 text-sm text-ink"
        />
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          disabled={uploading}
          aria-label={messages.edit.uploadImage}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = '';
          }}
          className="mt-2 block w-full text-xs text-ink-muted"
        />
        <p className="mt-1 text-xs text-ink-muted">
          {uploading ? messages.edit.uploading : messages.edit.uploadHint}
        </p>
      </div>

      <Help id={helpId} error={error ?? uploadError ?? undefined} help={messages.edit.imageHelp} />
    </div>
  );
}

function GroupControl({
  node,
  path,
  value,
  errors,
  onChange,
  idBase,
}: {
  node: EditGroup;
  path: string;
  value: unknown;
  errors: Record<string, string>;
  onChange: Change;
  idBase: string;
}) {
  const groupValue =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  return (
    <fieldset className="rounded-input border border-line p-3">
      <legend className="px-1 text-sm font-semibold text-ink">
        {node.label}
        {node.required ? <span className="text-ink-muted"> *</span> : null}
      </legend>
      <div className="space-y-4">
        <FieldList
          nodes={node.fields}
          values={groupValue}
          errors={errors}
          path={path}
          onChange={onChange}
          idBase={idBase}
        />
      </div>
    </fieldset>
  );
}

function ArrayControl({
  node,
  path,
  value,
  errors,
  onChange,
  idBase,
}: {
  node: EditArray;
  path: string;
  value: unknown;
  errors: Record<string, string>;
  onChange: Change;
  idBase: string;
}) {
  const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
  const atMax = items.length >= node.maxRows;
  const atMin = items.length <= node.minRows;

  function replace(next: Record<string, unknown>[]) {
    onChange(path, next);
  }

  return (
    <div className="rounded-input border border-line p-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-ink">{node.label}</p>
        <p className="text-xs tabular-nums text-ink-muted">
          {items.length} / {node.maxRows}
        </p>
      </div>
      {errors[path] ? <p className="mt-1 text-xs text-red-700">{errors[path]}</p> : null}

      <div className="mt-3 space-y-3">
        {items.map((item, index) => {
          const rowPath = `${path}.${index}`;
          return (
            <fieldset
              key={typeof item.id === 'string' ? item.id : rowPath}
              className="rounded-input border border-line p-3"
            >
              <legend className="px-1 text-xs font-semibold text-ink-muted">
                {node.label} {index + 1}
              </legend>
              <div className="space-y-4">
                <FieldList
                  nodes={node.fields}
                  values={item}
                  errors={errors}
                  path={rowPath}
                  onChange={onChange}
                  idBase={idBase}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => {
                    const next = [...items];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    replace(next);
                  }}
                  className="inline-flex min-h-11 items-center rounded-input border border-line px-3 text-xs font-semibold text-ink hover:border-brand-primary disabled:opacity-40"
                >
                  {messages.edit.moveUp}
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => {
                    const next = [...items];
                    [next[index], next[index + 1]] = [next[index + 1], next[index]];
                    replace(next);
                  }}
                  className="inline-flex min-h-11 items-center rounded-input border border-line px-3 text-xs font-semibold text-ink hover:border-brand-primary disabled:opacity-40"
                >
                  {messages.edit.moveDown}
                </button>
                <button
                  type="button"
                  disabled={atMin}
                  title={atMin ? messages.edit.minimumReached : undefined}
                  onClick={() => replace(items.filter((_, position) => position !== index))}
                  className="inline-flex min-h-11 items-center rounded-input border border-line px-3 text-xs font-semibold text-red-700 hover:border-red-700 disabled:opacity-40"
                >
                  {messages.edit.remove}
                </button>
              </div>
            </fieldset>
          );
        })}
      </div>

      <button
        type="button"
        disabled={atMax}
        title={atMax ? messages.edit.limitReached : undefined}
        onClick={() => replace([...items, defaultsFor(node.fields)])}
        className="mt-3 inline-flex min-h-11 items-center rounded-input border border-line px-3 text-sm font-semibold text-ink hover:border-brand-primary disabled:opacity-40"
      >
        {atMax ? messages.edit.limitReached : `${messages.edit.add} ${node.label}`}
      </button>
      <p className="mt-1 text-xs text-ink-muted">
        {messages.edit.itemsBetween
          .replace('{min}', String(node.minRows))
          .replace('{max}', String(node.maxRows))}
      </p>
    </div>
  );
}

export function FieldList({
  nodes,
  values,
  errors,
  path,
  onChange,
  idBase,
}: {
  nodes: EditNode[];
  values: Record<string, unknown>;
  errors: Record<string, string>;
  path: string;
  onChange: Change;
  idBase: string;
}) {
  return (
    <>
      {nodes.map((node) => {
        const nodePath = pathFor(path, node.name);
        const value = values[node.name] ?? getAtPath(values, node.name);

        if (node.type === 'array') {
          return (
            <ArrayControl
              key={nodePath}
              node={node}
              path={nodePath}
              value={value}
              errors={errors}
              onChange={onChange}
              idBase={idBase}
            />
          );
        }

        if (node.type === 'group') {
          return (
            <GroupControl
              key={nodePath}
              node={node}
              path={nodePath}
              value={value}
              errors={errors}
              onChange={onChange}
              idBase={idBase}
            />
          );
        }

        return (
          <ScalarControl
            key={nodePath}
            node={node}
            path={nodePath}
            value={value}
            error={errors[nodePath]}
            onChange={onChange}
            idBase={idBase}
          />
        );
      })}
    </>
  );
}

export function EditFields({
  schema,
  values,
  errors,
  onChange,
}: {
  schema: EditNode[];
  values: Record<string, unknown>;
  errors: Record<string, string>;
  onChange: Change;
}) {
  const idBase = useId();
  return (
    <FieldList
      nodes={schema}
      values={values}
      errors={errors}
      path=""
      onChange={onChange}
      idBase={idBase}
    />
  );
}
