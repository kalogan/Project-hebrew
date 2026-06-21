/**
 * Injected time and randomness. The core never reads the wall-clock or calls
 * Math.random directly (enforced by eslint + arch-guard) — callers pass these
 * in, so every scheduling decision is reproducible and testable.
 */

/** Milliseconds since the Unix epoch. */
export type Epoch = number;

/** A source of "now". Production passes `systemClock`; tests pass a fixed one. */
export interface Clock {
  now(): Epoch;
}

/** A deterministic source of randomness in [0, 1). */
export interface Rng {
  next(): number;
}

export const MS_PER_DAY = 86_400_000;

/**
 * A fixed clock for tests and previews. The real wall-clock adapter
 * (`systemClock`) lives outside the core, at src/services/systemClock.ts, so the
 * core stays deterministic and free of any wall-clock read.
 */
export function fixedClock(at: Epoch): Clock {
  return { now: () => at };
}

/**
 * Mulberry32 — a tiny, fast, fully deterministic PRNG. Seeding the same value
 * always yields the same sequence, so shuffles are reproducible in tests.
 */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return {
    next() {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
  };
}
