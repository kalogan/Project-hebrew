import { describe, expect, it } from 'vitest';
import { deckStats } from './stats';
import type { CardState, Phase } from './types';
import type { Epoch } from '../time';

const NOW: Epoch = 1_000_000;

/** Build a CardState fixture with sane defaults, overridable per field. */
function card(overrides: Partial<CardState> = {}): CardState {
  return {
    ease: 2.5,
    intervalDays: 0,
    step: 0,
    reps: 0,
    lapses: 0,
    due: NOW,
    lastReviewed: null,
    phase: 'new',
    ...overrides,
  };
}

function deck(...cards: CardState[]): Record<string, CardState> {
  const out: Record<string, CardState> = {};
  cards.forEach((c, i) => {
    out[`c${i}`] = c;
  });
  return out;
}

describe('deckStats', () => {
  it('returns all zeros (and averageEase 0) for an empty deck', () => {
    const stats = deckStats({}, NOW);
    expect(stats).toEqual({
      total: 0,
      new: 0,
      learning: 0,
      review: 0,
      due: 0,
      mature: 0,
      young: 0,
      totalReps: 0,
      totalLapses: 0,
      averageEase: 0,
    });
  });

  it('counts phases for a mixed deck', () => {
    const stats = deckStats(
      deck(
        card({ phase: 'new', due: NOW + 10_000 }),
        card({ phase: 'new', due: NOW + 10_000 }),
        card({ phase: 'learning', due: NOW + 10_000 }),
        card({ phase: 'review', intervalDays: 5, due: NOW + 10_000 }),
      ),
      NOW,
    );
    expect(stats.total).toBe(4);
    expect(stats.new).toBe(2);
    expect(stats.learning).toBe(1);
    expect(stats.review).toBe(1);
  });

  it('treats due === now as due (boundary)', () => {
    const stats = deckStats(
      deck(
        card({ due: NOW }), // exactly now -> due
        card({ due: NOW - 1 }), // past -> due
        card({ due: NOW + 1 }), // future -> not due
      ),
      NOW,
    );
    expect(stats.due).toBe(2);
  });

  it('treats intervalDays === 21 as mature (boundary)', () => {
    const phase: Phase = 'review';
    const stats = deckStats(
      deck(
        card({ phase, intervalDays: 20 }), // young
        card({ phase, intervalDays: 21 }), // mature (>= 21)
        card({ phase, intervalDays: 22 }), // mature
      ),
      NOW,
    );
    expect(stats.young).toBe(1);
    expect(stats.mature).toBe(2);
    expect(stats.review).toBe(3);
  });

  it('does not count new/learning cards as mature or young', () => {
    const stats = deckStats(
      deck(
        card({ phase: 'new', intervalDays: 30 }),
        card({ phase: 'learning', intervalDays: 30 }),
      ),
      NOW,
    );
    expect(stats.mature).toBe(0);
    expect(stats.young).toBe(0);
  });

  it('averages ease across all cards', () => {
    const stats = deckStats(deck(card({ ease: 2.0 }), card({ ease: 3.0 }), card({ ease: 2.5 })), NOW);
    expect(stats.averageEase).toBeCloseTo(2.5, 10);
  });

  it('sums reps and lapses across all cards', () => {
    const stats = deckStats(
      deck(
        card({ reps: 3, lapses: 1 }),
        card({ reps: 5, lapses: 0 }),
        card({ reps: 2, lapses: 4 }),
      ),
      NOW,
    );
    expect(stats.totalReps).toBe(10);
    expect(stats.totalLapses).toBe(5);
  });
});
