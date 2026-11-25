/**
 * Near-duplicate detection for location copy (docs/CONTENT.md §7.4).
 *
 * The unique-local-content rule exists so city and area pages are genuinely
 * different, not one template with the town name swapped. We compare
 * `localNotes` with sibling pages using three-word shingles: the score is the
 * Jaccard overlap of the two shingle sets (shared / all distinct shingles),
 * from 0 (nothing in common) to 1 (identical wording).
 *
 * Thresholds are publish rules, not storage rules: a draft may be similar
 * while staff are still writing it.
 */

export const SIMILARITY_WARN = 0.6;
export const SIMILARITY_BLOCK = 0.8;

/** Words per shingle. Three is short enough to catch light rephrasing. */
const SHINGLE_WORDS = 3;

/** Lowercase word tokens; punctuation and line breaks collapse to spaces. */
export function notesWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/** Distinct word shingles for a text. Very short texts become one shingle. */
export function notesShingles(text: string, size = SHINGLE_WORDS): Set<string> {
  const words = notesWords(text);
  if (words.length === 0) return new Set();

  if (words.length <= size) return new Set([words.join(' ')]);

  const shingles = new Set<string>();
  for (let index = 0; index <= words.length - size; index += 1) {
    shingles.add(words.slice(index, index + size).join(' '));
  }
  return shingles;
}

/** Jaccard overlap of two texts' shingle sets, between 0 and 1. */
export function similarityScore(first: string, second: string): number {
  const a = notesShingles(first);
  const b = notesShingles(second);
  if (a.size === 0 || b.size === 0) return 0;

  let shared = 0;
  for (const shingle of a) {
    if (b.has(shingle)) shared += 1;
  }

  const union = a.size + b.size - shared;
  return union === 0 ? 0 : shared / union;
}

export type SimilarLocation = {
  id: number | string;
  name: string;
  localNotes: string | null | undefined;
};

export type SimilarityMatch = {
  id: number | string;
  name: string;
  score: number;
};

/** The closest sibling, or `null` when nothing shares any wording. */
export function mostSimilarLocation(
  localNotes: string | null | undefined,
  siblings: SimilarLocation[],
): SimilarityMatch | null {
  if (!localNotes) return null;

  let best: SimilarityMatch | null = null;
  for (const sibling of siblings) {
    if (!sibling.localNotes) continue;
    const score = similarityScore(localNotes, sibling.localNotes);
    if (score > 0 && (!best || score > best.score)) {
      best = { id: sibling.id, name: sibling.name, score };
    }
  }

  return best;
}

/** Round a 0–1 score to a whole percentage for messages. */
export function similarityPercent(score: number): number {
  return Math.round(score * 100);
}
