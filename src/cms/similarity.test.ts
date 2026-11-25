import { describe, expect, it } from 'vitest';

import {
  mostSimilarLocation,
  notesShingles,
  similarityScore,
  SIMILARITY_BLOCK,
  SIMILARITY_WARN,
} from './similarity';

const base =
  'DHA Phase 5 has wide streets, mature trees and many family homes. Termites ' +
  'and cockroaches are common in older kitchens, and mosquitoes breed in the ' +
  'standing water that collects after monsoon rain. Our team treats the whole ' +
  'property, including the garden and the water tanks, and returns for a ' +
  'follow-up inspection after two weeks.';

describe('location similarity', () => {
  it('scores identical copy at 1 and unrelated copy at 0', () => {
    expect(similarityScore(base, base)).toBe(1);
    expect(similarityScore(base, 'Completely different words about mountain hiking.')).toBe(0);
  });

  it('ignores case, punctuation and whitespace when shingling', () => {
    const messy = base.toUpperCase().replaceAll(' ', '   \n ');
    expect(similarityScore(base, messy)).toBe(1);
    expect(notesShingles('One two three four').size).toBe(2);
  });

  it('scores copy with one extra sentence above the block threshold', () => {
    const extended = `${base} Parking is limited near the main market.`;
    expect(similarityScore(base, extended)).toBeGreaterThanOrEqual(SIMILARITY_BLOCK);
  });

  it('places a partly reworded page between warn and block', () => {
    const reworded = base.replace('wide streets', 'broad roads').replace('family homes', 'houses');
    const score = similarityScore(base, reworded);
    expect(score).toBeGreaterThanOrEqual(SIMILARITY_WARN);
    expect(score).toBeLessThan(SIMILARITY_BLOCK);
  });

  it('returns the closest sibling and skips empty notes', () => {
    const match = mostSimilarLocation(base, [
      { id: 1, name: 'Empty', localNotes: null },
      { id: 2, name: 'Far', localNotes: 'Mountain hiking and cold weather gear.' },
      { id: 3, name: 'Close', localNotes: base },
    ]);

    expect(match).toMatchObject({ id: 3, name: 'Close', score: 1 });
    expect(mostSimilarLocation('', [{ id: 1, name: 'A', localNotes: base }])).toBeNull();
  });
});
