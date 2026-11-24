import { safeHref } from '@/lib/links';
import type { EditNode } from './registry';

export type Validation = { values: Record<string, unknown>; errors: Record<string, string> };

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Recursively validate content-box values against the derived registry. Shared
 * by block saves and global saves; the client is a convenience, this is the
 * server-side limit check (docs/INLINE-EDITING.md §5).
 */
export function validateGroup(nodes: EditNode[], input: unknown, prefix: string): Validation {
  const values: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  const record = isRecord(input) ? input : {};

  if (typeof record.id === 'string') values.id = record.id;

  const known = new Set(nodes.map((node) => node.name));
  for (const key of Object.keys(record)) {
    if (key !== 'id' && !known.has(key)) {
      errors[prefix ? `${prefix}.${key}` : key] = 'Unknown field.';
    }
  }

  for (const node of nodes) {
    const path = prefix ? `${prefix}.${node.name}` : node.name;
    const raw = record[node.name];
    // A missing key means "leave this field alone"; the content box always
    // sends the full set, while a partial save updates only what it names.
    if (raw === undefined) continue;

    if (node.type === 'array') {
      const rows = Array.isArray(raw) ? raw : [];
      if (rows.length < node.minRows) {
        errors[path] = `Add at least ${node.minRows}.`;
        continue;
      }
      if (rows.length > node.maxRows) {
        errors[path] = `Limit reached: ${node.maxRows} items.`;
        continue;
      }

      const out: Record<string, unknown>[] = [];
      for (const [index, row] of rows.entries()) {
        const result = validateGroup(node.fields, row, `${path}.${index}`);
        Object.assign(errors, result.errors);
        out.push(result.values);
      }
      values[node.name] = out;
      continue;
    }

    if (node.type === 'group') {
      if (!isRecord(raw)) {
        if (node.required) errors[path] = `${node.label} is required.`;
        continue;
      }
      const result = validateGroup(node.fields, raw, path);
      Object.assign(errors, result.errors);
      values[node.name] = result.values;
      continue;
    }

    if (node.type === 'boolean') {
      if (typeof raw !== 'boolean') {
        if (node.required) errors[path] = `${node.label} is required.`;
        continue;
      }
      if (node.required && raw !== true) {
        errors[path] = `${node.label} must be confirmed.`;
        continue;
      }
      values[node.name] = raw;
      continue;
    }

    if (node.type === 'upload') {
      const id = raw;
      if (id === null || id === undefined || id === '') {
        if (node.required) errors[path] = `${node.label} is required.`;
        else values[node.name] = null;
        continue;
      }
      if (typeof id !== 'string' && typeof id !== 'number') {
        errors[path] = `${node.label} must be an image from the media library.`;
        continue;
      }
      values[node.name] = id;
      continue;
    }

    if (node.type === 'number') {
      if (raw === '' || raw === null) {
        if (node.required) errors[path] = `${node.label} is required.`;
        continue;
      }
      const number = typeof raw === 'number' ? raw : Number(raw);
      if (!Number.isFinite(number) || !Number.isInteger(number)) {
        errors[path] = 'Use a whole number.';
        continue;
      }
      if (node.min !== undefined && number < node.min) {
        errors[path] = `Minimum is ${node.min}.`;
        continue;
      }
      if (node.max !== undefined && number > node.max) {
        errors[path] = `Maximum is ${node.max}.`;
        continue;
      }
      values[node.name] = number;
      continue;
    }

    if (node.type === 'select') {
      if (typeof raw !== 'string' || raw === '') {
        if (node.required) errors[path] = `${node.label} is required.`;
        else values[node.name] = '';
        continue;
      }
      if (!node.options?.some((option) => option.value === raw)) {
        errors[path] = 'Choose one of the listed options.';
        continue;
      }
      values[node.name] = raw;
      continue;
    }

    // text / textarea
    if (typeof raw !== 'string') {
      if (node.required) errors[path] = `${node.label} is required.`;
      continue;
    }
    if (node.required && raw.trim() === '') {
      errors[path] = `${node.label} is required.`;
      continue;
    }
    if (node.maxLength !== undefined && raw.length > node.maxLength) {
      errors[path] = `Limit reached: ${node.maxLength} characters.`;
      continue;
    }
    values[node.name] = raw;
  }

  // Action links (label + kind + href) are only fetched for `kind: 'link'`;
  // call/WhatsApp/inspection resolve their target from settings.
  const kind = values.kind;
  const href = values.href;
  if (typeof kind === 'string' && typeof href === 'string' && kind === 'link') {
    if (!safeHref(href)) {
      errors[prefix ? `${prefix}.href` : 'href'] =
        'Use http(s), mailto, tel or a path starting with /.';
    }
  }

  return { values, errors };
}
