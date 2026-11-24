import { describe, expect, it } from 'vitest';

import { PAGE_BLOCKS } from '@/blocks/allowed';
import { getEditableSchema, getInitialValues, type EditNode } from './registry';

function walk(nodes: EditNode[]): EditNode[] {
  return nodes.flatMap((node) => [
    node,
    ...(node.type === 'group' || node.type === 'array' ? walk(node.fields) : []),
  ]);
}

describe('inline edit field registry', () => {
  it('derives fields for every implemented block', () => {
    for (const block of PAGE_BLOCKS) {
      expect(getEditableSchema(block.slug), block.slug).toBeInstanceOf(Array);
    }
  });

  it('gives every text and textarea field a positive limit', () => {
    for (const block of PAGE_BLOCKS) {
      for (const field of walk(getEditableSchema(block.slug))) {
        if (field.type === 'text' || field.type === 'textarea') {
          expect(field.maxLength, `${block.slug}.${field.name}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('gives every list sensible row bounds', () => {
    for (const block of PAGE_BLOCKS) {
      for (const field of walk(getEditableSchema(block.slug))) {
        if (field.type === 'array') {
          expect(field.maxRows, `${block.slug}.${field.name}`).toBeGreaterThan(0);
          expect(field.minRows, `${block.slug}.${field.name}`).toBeGreaterThanOrEqual(0);
          expect(field.minRows, `${block.slug}.${field.name}`).toBeLessThanOrEqual(field.maxRows);
        }
      }
    }
  });

  it('exposes the hero headline with its 80-character limit', () => {
    const headline = getEditableSchema('hero').find((field) => field.name === 'headline');
    expect(headline).toMatchObject({ type: 'text', maxLength: 80 });
  });

  it('describes hero actions, repeaters and images', () => {
    const schema = getEditableSchema('hero');
    expect(schema.find((field) => field.name === 'primaryAction')).toMatchObject({
      type: 'group',
      required: true,
    });
    expect(schema.find((field) => field.name === 'secondaryActions')).toMatchObject({
      type: 'array',
      maxRows: 2,
    });
    expect(schema.find((field) => field.name === 'image')).toMatchObject({
      type: 'upload',
      relationTo: 'media',
    });
  });

  it('describes trust-strip items so a block with no scalar field is editable', () => {
    const items = getEditableSchema('trustStrip').find((field) => field.name === 'items');
    expect(items).toMatchObject({ type: 'array', minRows: 3, maxRows: 5 });
    if (items?.type === 'array') {
      expect(items.fields.map((field) => field.name)).toEqual([
        'statValue',
        'statLabel',
        'proofNote',
      ]);
    }
  });

  it('never exposes Payload-internal block fields', () => {
    for (const block of PAGE_BLOCKS) {
      for (const node of walk(getEditableSchema(block.slug))) {
        expect(['id', 'blockName', 'hidden'], `${block.slug}.${node.name}`).not.toContain(
          node.name,
        );
      }
    }
  });

  it('builds initial values from nested content and keeps row ids', () => {
    const values = getInitialValues(getEditableSchema('trustStrip'), {
      items: [{ id: 'row-1', statValue: '10+', statLabel: 'Years', proofNote: 'Registry' }],
    });

    expect(values.items).toEqual([
      { id: 'row-1', statValue: '10+', statLabel: 'Years', proofNote: 'Registry' },
    ]);
  });
});
