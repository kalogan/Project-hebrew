import type { Epoch } from '../time';
import type { CardState, Phase } from './types';

/** Interval (days) at which a 'review' card is considered mature. */
const MATURE_INTERVAL_DAYS = 21;

/**
 * Aggregate, derived view over a deck of cards at a given instant. Pure data —
 * everything here is a function of (cards, now), so it is reproducible.
 */
export interface DeckStats {
  /** Total number of cards in the deck. */
  total: number;
  /** Cards still in the 'new' phase (never studied). */
  new: number;
  /** Cards in the 'learning' phase. */
  learning: number;
  /** Cards in the 'review' phase. */
  review: number;
  /** Cards whose `due` is at or before `now`. */
  due: number;
  /** 'review' cards with `intervalDays >= 21`. */
  mature: number;
  /** 'review' cards with `intervalDays < 21`. */
  young: number;
  /** Sum of `reps` across all cards. */
  totalReps: number;
  /** Sum of `lapses` across all cards. */
  totalLapses: number;
  /** Mean `ease` over all cards; 0 when the deck is empty. */
  averageEase: number;
}

/**
 * Compute aggregate deck statistics in a single pass over the cards.
 * Deterministic given `(cards, now)`; reads no wall-clock.
 */
export function deckStats(cards: Readonly<Record<string, CardState>>, now: Epoch): DeckStats {
  let total = 0;
  let newCount = 0;
  let learning = 0;
  let review = 0;
  let due = 0;
  let mature = 0;
  let young = 0;
  let totalReps = 0;
  let totalLapses = 0;
  let easeSum = 0;

  for (const card of Object.values(cards)) {
    total++;
    easeSum += card.ease;
    totalReps += card.reps;
    totalLapses += card.lapses;

    if (card.due <= now) due++;

    const phase: Phase = card.phase;
    if (phase === 'new') {
      newCount++;
    } else if (phase === 'learning') {
      learning++;
    } else {
      review++;
      if (card.intervalDays >= MATURE_INTERVAL_DAYS) mature++;
      else young++;
    }
  }

  return {
    total,
    new: newCount,
    learning,
    review,
    due,
    mature,
    young,
    totalReps,
    totalLapses,
    averageEase: total === 0 ? 0 : easeSum / total,
  };
}
