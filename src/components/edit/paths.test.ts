import { describe, expect, it } from 'vitest';

import { getAtPath, setAtPath } from './paths';

describe('content box paths', () => {
  it('sets nested array values without mutating the source', () => {
    const source = { headline: 'Hi', items: [{ question: 'A' }, { question: 'B' }] };
    const updated = setAtPath(source, 'items.1.question', 'Changed');

    expect(getAtPath(updated, 'items.1.question')).toBe('Changed');
    expect(source.items[1].question).toBe('B');
  });

  it('creates missing arrays and objects', () => {
    const updated = setAtPath({}, 'items.0.answer', 'New');
    expect(updated).toEqual({ items: [{ answer: 'New' }] });
  });

  it('replaces a whole array at its path', () => {
    const updated = setAtPath({ items: [{ a: 1 }] }, 'items', [{ a: 2 }, { a: 3 }]);
    expect(updated.items).toEqual([{ a: 2 }, { a: 3 }]);
  });
});
