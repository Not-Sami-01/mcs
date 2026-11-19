import { readFileSync } from 'node:fs';

import type { Field } from 'payload';
import { describe, expect, it } from 'vitest';

import { BLOCKS } from '../blocks';
import { COLLECTIONS } from '../collections';
import { COUNT_LIMITS, TEXT_LIMITS } from './limits';

/**
 * Enforces docs/DATABASE.md §1: every text field has `maxLength`, every array
 * and blocks field has `minRows`/`maxRows`, and `src/cms/limits.ts` matches the
 * tables in `docs/CONTENT.md` §5 exactly (the doc and the code change together).
 */

const targets = [
  ...COLLECTIONS.map((collection) => ({
    name: `collection:${collection.slug}`,
    fields: collection.fields,
  })),
  ...BLOCKS.map((block) => ({ name: `block:${block.slug}`, fields: block.fields })),
];

type VisitableField = Extract<Field, { name: string }>;

function walk(
  fields: Field[],
  owner: string,
  visit: (field: VisitableField, label: string) => void,
): void {
  for (const field of fields) {
    const label = `${owner}.${'name' in field ? field.name : '<anonymous>'}`;

    if (field.type === 'blocks') {
      visit(field, label);
      for (const block of field.blocks) {
        walk(block.fields, `${label}.${block.slug}`, visit);
      }
      continue;
    }

    if ('name' in field) {
      visit(field, label);
    }

    // `group`, `array`, `row` and `collapsible` all nest their fields.
    if ('fields' in field && Array.isArray(field.fields)) {
      walk(field.fields, label, visit);
    }
  }
}

describe('field limits', () => {
  it('covers every collection and block currently configured', () => {
    expect(targets.length).toBeGreaterThanOrEqual(COLLECTIONS.length + BLOCKS.length);
  });

  for (const { name, fields } of targets) {
    it(`${name}: texts are capped and lists are bounded`, () => {
      walk(fields, name, (field, label) => {
        if (field.type === 'text' || field.type === 'textarea' || field.type === 'email') {
          const f = field as { maxLength?: number };
          expect(typeof f.maxLength, `${label} needs maxLength`).toBe('number');
          expect(f.maxLength, `${label} needs a positive maxLength`).toBeGreaterThan(0);
        }

        if (field.type === 'array' || field.type === 'blocks') {
          expect(typeof field.minRows, `${label} needs minRows`).toBe('number');
          expect(typeof field.maxRows, `${label} needs maxRows`).toBe('number');
          expect(field.minRows as number, `${label} minRows <= maxRows`).toBeLessThanOrEqual(
            field.maxRows as number,
          );
        }
      });
    });
  }
});

describe('limits registry matches docs/CONTENT.md §5', () => {
  const doc = readFileSync(new URL('../../docs/CONTENT.md', import.meta.url), 'utf8');
  const start = doc.indexOf('## 5. Text and count limits');
  const end = doc.indexOf('## 6. Block catalogue');
  const section = doc.slice(start, end);

  it('finds the limits section', () => {
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
  });

  it('text presets are identical to the documentation table', () => {
    const documented: Record<string, number> = {};
    // | `eyebrow` | 40 | Small label above a headline |
    for (const match of section.matchAll(/^\|\s*`([a-zA-Z]+)`\s*\|\s*([\d,]+)\s*\|/gm)) {
      documented[match[1]] = Number(match[2].replace(/,/g, ''));
    }

    expect(documented).toEqual({ ...TEXT_LIMITS });
  });

  it('count presets are identical to the documentation table', () => {
    const documented: Record<string, { min: number; max: number }> = {};
    // | Blocks per page | 1 | 30 |
    for (const match of section.matchAll(
      /^\|\s*([A-Z][^|\n]+?)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|/gm,
    )) {
      documented[match[1].trim()] = { min: Number(match[2]), max: Number(match[3]) };
    }

    const fromCode = Object.fromEntries(
      Object.values(COUNT_LIMITS).map(({ label, min, max }) => [label, { min, max }]),
    );

    expect(documented).toEqual(fromCode);
  });
});
