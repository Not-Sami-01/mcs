import { describe, expect, it } from 'vitest';

import { richTextLength } from './Posts';

const text = (value: string) => ({ type: 'text', text: value });

describe('richTextLength', () => {
  it('counts text nested inside the Lexical root', () => {
    expect(
      richTextLength({
        root: {
          children: [
            { type: 'paragraph', children: [text('Termite')] },
            { type: 'heading', children: [text('signs')] },
          ],
        },
      }),
    ).toBe(12);
  });

  it('counts list items', () => {
    expect(
      richTextLength({
        root: { children: [{ type: 'list', children: [{ children: [text('mud tubes')] }] }] },
      }),
    ).toBe(9);
  });

  it('returns zero for empty and missing values', () => {
    expect(richTextLength(undefined)).toBe(0);
    expect(richTextLength({ root: { children: [] } })).toBe(0);
  });
});
