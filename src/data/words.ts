import rawWords from './words.json';
import type { Word } from './types';

/**
 * The curated prayer-book vocabulary, ordered by frequency rank. Validated at
 * build time by scripts/lint-content.mjs and at test time in words.test.ts.
 */
export const words: readonly Word[] = (rawWords as Word[])
  .slice()
  .sort((a, b) => a.frequencyRank - b.frequencyRank);

export const wordsById: Readonly<Record<string, Word>> = Object.fromEntries(
  words.map((w) => [w.id, w]),
);

export function getWord(id: string): Word | undefined {
  return wordsById[id];
}
