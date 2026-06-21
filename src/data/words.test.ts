import { describe, it, expect } from 'vitest';
import { validateWords } from '../../scripts/validate-words.mjs';
import rawWords from './words.json';
import { words, wordsById, getWord } from './words';

describe('word dataset', () => {
  it('passes the shared content validator (same check as the gate)', () => {
    expect(validateWords(rawWords)).toEqual([]);
  });

  it('has unique ids and frequency ranks', () => {
    const ids = words.map((w) => w.id);
    const ranks = words.map((w) => w.frequencyRank);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(ranks).size).toBe(ranks.length);
  });

  it('is sorted by frequency rank', () => {
    const ranks = words.map((w) => w.frequencyRank);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it('indexes every word by id', () => {
    expect(Object.keys(wordsById).length).toBe(words.length);
    expect(getWord('barukh')?.gloss).toBe('blessed');
    expect(getWord('does-not-exist')).toBeUndefined();
  });

  it('every Hebrew entry carries niqqud', () => {
    const niqqud = /[ְ-ׇ]/;
    for (const w of words) {
      expect(niqqud.test(w.hebrew), `${w.id} missing niqqud`).toBe(true);
    }
  });
});
