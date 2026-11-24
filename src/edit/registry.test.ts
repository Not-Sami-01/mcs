import { describe, expect, it } from 'vitest';

import { PAGE_BLOCKS } from '@/blocks/allowed';
import { getEditableFields } from './registry';

describe('inline edit field registry', () => {
  it('derives fields for every implemented block', () => {
    for (const block of PAGE_BLOCKS) {
      expect(getEditableFields(block.slug), block.slug).toBeInstanceOf(Array);
    }
  });

  it('gives every text and textarea field a positive limit', () => {
    for (const block of PAGE_BLOCKS) {
      for (const field of getEditableFields(block.slug)) {
        if (field.type === 'text' || field.type === 'textarea') {
          expect(field.maxLength, `${block.slug}.${field.name}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('exposes the hero headline with its 80-character limit', () => {
    const headline = getEditableFields('hero').find((field) => field.name === 'headline');
    expect(headline).toMatchObject({ type: 'text', maxLength: 80 });
  });

  it('does not expose groups, arrays or uploads as scalar fields', () => {
    const names = getEditableFields('hero').map((field) => field.name);
    expect(names).not.toContain('primaryAction');
    expect(names).not.toContain('secondaryActions');
    expect(names).not.toContain('image');
  });
});
