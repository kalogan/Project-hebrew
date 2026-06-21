import { describe, it, expect } from 'vitest';
import { MS_PER_DAY } from '../time';
import { newCard, isDue, review } from './scheduler';
import { DEFAULT_CONFIG } from './types';

const T0 = 1_700_000_000_000; // fixed epoch for determinism
const MIN = 60_000;

describe('newCard', () => {
  it('creates a new card due immediately', () => {
    const c = newCard(T0);
    expect(c.phase).toBe('new');
    expect(c.due).toBe(T0);
    expect(c.ease).toBe(DEFAULT_CONFIG.startingEase);
    expect(c.reps).toBe(0);
    expect(isDue(c, T0)).toBe(true);
  });
});

describe('learning phase', () => {
  it('advances through learning steps on good, then graduates to review', () => {
    const c0 = newCard(T0);
    const c1 = review(c0, 'good', T0); // step 0 -> step 1 (10 min)
    expect(c1.phase).toBe('learning');
    expect(c1.step).toBe(1);
    expect(c1.due).toBe(T0 + 10 * MIN);

    const c2 = review(c1, 'good', T0 + 10 * MIN); // graduate
    expect(c2.phase).toBe('review');
    expect(c2.step).toBe(-1);
    expect(c2.intervalDays).toBe(DEFAULT_CONFIG.graduatingIntervalDays);
    expect(c2.due).toBe(T0 + 10 * MIN + 1 * MS_PER_DAY);
  });

  it('again resets to the first learning step', () => {
    const c1 = review(newCard(T0), 'good', T0);
    const c2 = review(c1, 'again', T0 + 10 * MIN);
    expect(c2.phase).toBe('learning');
    expect(c2.step).toBe(0);
    expect(c2.due).toBe(T0 + 10 * MIN + 1 * MIN);
  });

  it('easy graduates immediately with the easy interval', () => {
    const c = review(newCard(T0), 'easy', T0);
    expect(c.phase).toBe('review');
    expect(c.intervalDays).toBe(DEFAULT_CONFIG.easyIntervalDays);
    expect(c.due).toBe(T0 + DEFAULT_CONFIG.easyIntervalDays * MS_PER_DAY);
  });
});

describe('review phase', () => {
  // A graduated card: 1-day interval, ease 2.5.
  function graduated() {
    return review(review(newCard(T0), 'good', T0), 'good', T0 + 10 * MIN);
  }

  it('good multiplies interval by ease', () => {
    const g = graduated(); // interval 1, ease 2.5
    const now = g.due;
    const r = review(g, 'good', now);
    expect(r.intervalDays).toBe(Math.round(1 * 2.5)); // 3 (rounded from 2.5)
    expect(r.ease).toBe(2.5);
    expect(r.due).toBe(now + r.intervalDays * MS_PER_DAY);
  });

  it('easy grows faster and raises ease', () => {
    const g = graduated();
    const r = review(g, 'easy', g.due);
    expect(r.ease).toBeCloseTo(2.65, 5);
    expect(r.intervalDays).toBe(Math.round(1 * 2.5 * DEFAULT_CONFIG.easyBonus));
  });

  it('hard shrinks growth and lowers ease', () => {
    const g = graduated();
    const r = review(g, 'hard', g.due);
    expect(r.ease).toBeCloseTo(2.35, 5);
    expect(r.intervalDays).toBe(1); // 1 * 1.2 = 1.2 -> rounded & min-clamped to 1
  });

  it('again lapses: relearning, ease drops, lapse counted', () => {
    const g = graduated();
    const r = review(g, 'again', g.due);
    expect(r.phase).toBe('learning');
    expect(r.lapses).toBe(1);
    expect(r.ease).toBeCloseTo(2.3, 5);
    expect(r.intervalDays).toBe(0);
    expect(r.due).toBe(g.due + 1 * MIN);
  });

  it('never lets ease fall below the floor', () => {
    let c = graduated();
    for (let i = 0; i < 20; i++) c = review(c, 'again', c.due);
    expect(c.ease).toBeGreaterThanOrEqual(DEFAULT_CONFIG.minEase);
  });

  it('caps interval at the configured maximum', () => {
    let c = graduated();
    for (let i = 0; i < 50; i++) c = review(c, 'easy', c.due);
    expect(c.intervalDays).toBeLessThanOrEqual(DEFAULT_CONFIG.maxIntervalDays);
  });
});

describe('purity', () => {
  it('does not mutate the input card', () => {
    const c = newCard(T0);
    const snapshot = JSON.stringify(c);
    review(c, 'good', T0);
    expect(JSON.stringify(c)).toBe(snapshot);
  });
});
