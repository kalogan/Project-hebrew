import type { Epoch } from '../time';

/** How well the learner recalled a card. Maps to the four review buttons. */
export type Rating = 'again' | 'hard' | 'good' | 'easy';

/** Lifecycle phase of a card in the scheduler. */
export type Phase = 'new' | 'learning' | 'review';

/**
 * The full scheduling state of a single word's card. This is the authoritative,
 * persisted unit the SRS reasons about. Pure data — no methods, no clock.
 */
export interface CardState {
  /** Ease factor (SM-2). Higher = intervals grow faster. Floored at MIN_EASE. */
  ease: number;
  /** Current review interval in days (0 while new/learning). */
  intervalDays: number;
  /** Index into the (re)learning steps; -1 once graduated to review. */
  step: number;
  /** Consecutive successful reviews. */
  reps: number;
  /** Number of times the card was forgotten (rated `again` in review). */
  lapses: number;
  /** When the card next becomes due. */
  due: Epoch;
  /** When the card was last reviewed, or null if never. */
  lastReviewed: Epoch | null;
  phase: Phase;
}

/** Tunable scheduler parameters. Frozen defaults below; deterministic. */
export interface SchedulerConfig {
  /** (Re)learning steps in minutes, applied in order before graduation. */
  learningStepsMin: readonly number[];
  /** Interval (days) when a card graduates via `good`. */
  graduatingIntervalDays: number;
  /** Interval (days) when a card graduates via `easy`. */
  easyIntervalDays: number;
  startingEase: number;
  minEase: number;
  /** Multiplier applied to interval on a `hard` review. */
  hardMultiplier: number;
  /** Extra multiplier applied on top of ease for an `easy` review. */
  easyBonus: number;
  /** Ease delta per rating in the review phase. */
  easeDelta: { again: number; hard: number; good: number; easy: number };
  /** Cap on any single interval, in days. */
  maxIntervalDays: number;
}

export const DEFAULT_CONFIG: SchedulerConfig = {
  learningStepsMin: [1, 10],
  graduatingIntervalDays: 1,
  easyIntervalDays: 4,
  startingEase: 2.5,
  minEase: 1.3,
  hardMultiplier: 1.2,
  easyBonus: 1.3,
  easeDelta: { again: -0.2, hard: -0.15, good: 0, easy: 0.15 },
  maxIntervalDays: 365,
};
