import { describe, it, expect } from 'vitest';
import { mulberry32, MS_PER_DAY } from '../time';
import { newCard, review } from './scheduler';
import { buildSession, dueCount, shuffle, DEFAULT_LIMITS } from './session';
import type { CardState } from './types';

const T0 = 1_700_000_000_000;

function makeCards(): Record<string, CardState> {
  const cards: Record<string, CardState> = {};
  // 3 new cards
  for (const id of ['n1', 'n2', 'n3']) cards[id] = newCard(T0);
  // 2 graduated cards due now
  for (const id of ['d1', 'd2']) {
    const g = review(review(newCard(T0), 'good', T0), 'good', T0 + 600_000);
    cards[id] = { ...g, due: T0 }; // force due
  }
  // 1 graduated card NOT due (far future)
  const future = review(review(newCard(T0), 'good', T0), 'good', T0 + 600_000);
  cards['f1'] = { ...future, due: T0 + 30 * MS_PER_DAY };
  return cards;
}

describe('shuffle', () => {
  it('is deterministic for a given seed and preserves elements', () => {
    const a = shuffle([1, 2, 3, 4, 5], mulberry32(42));
    const b = shuffle([1, 2, 3, 4, 5], mulberry32(42));
    expect(a).toEqual(b);
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('different seeds can produce different orders', () => {
    const a = shuffle([1, 2, 3, 4, 5, 6, 7, 8], mulberry32(1));
    const b = shuffle([1, 2, 3, 4, 5, 6, 7, 8], mulberry32(2));
    expect(a).not.toEqual(b);
  });
});

describe('buildSession', () => {
  it('includes due cards and up to the new-card limit', () => {
    const cards = makeCards();
    const queue = buildSession(cards, T0, { newCards: 2, maxTotal: 40 }, mulberry32(7));
    expect(queue).toContain('d1');
    expect(queue).toContain('d2');
    expect(queue).not.toContain('f1'); // not due
    const newInQueue = queue.filter((id) => id.startsWith('n'));
    expect(newInQueue.length).toBe(2);
  });

  it('respects maxTotal', () => {
    const cards = makeCards();
    const queue = buildSession(cards, T0, { newCards: 10, maxTotal: 3 }, mulberry32(7));
    expect(queue.length).toBe(3);
  });

  it('is deterministic for a fixed seed', () => {
    const cards = makeCards();
    const q1 = buildSession(cards, T0, DEFAULT_LIMITS, mulberry32(99));
    const q2 = buildSession(cards, T0, DEFAULT_LIMITS, mulberry32(99));
    expect(q1).toEqual(q2);
  });
});

describe('dueCount', () => {
  it('counts due non-new cards only', () => {
    const cards = makeCards();
    expect(dueCount(cards, T0)).toBe(2); // d1, d2 (not f1, not new)
  });
});
