import type { Epoch, Rng } from '../time';
import { isDue } from './scheduler';
import type { CardState } from './types';

export interface SessionLimits {
  /** Max brand-new cards to introduce in this session. */
  newCards: number;
  /** Max total cards in the session queue (new + due). */
  maxTotal: number;
}

export const DEFAULT_LIMITS: SessionLimits = { newCards: 10, maxTotal: 40 };

/**
 * In-place Fisher–Yates shuffle driven by an injected Rng, so a given seed
 * always produces the same order. Returns the same array reference.
 */
export function shuffle<T>(items: T[], rng: Rng): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    const a = items[i] as T;
    const b = items[j] as T;
    items[i] = b;
    items[j] = a;
  }
  return items;
}

/**
 * Build the ordered list of word ids to review now. Due (learning/review) cards
 * come first, shuffled; then up to `newCards` new cards, in dataset order.
 * Deterministic given (cards, now, limits, rng).
 */
export function buildSession(
  cards: Readonly<Record<string, CardState>>,
  now: Epoch,
  limits: SessionLimits,
  rng: Rng,
): string[] {
  const due: string[] = [];
  const fresh: string[] = [];

  for (const [id, card] of Object.entries(cards)) {
    if (card.phase === 'new') fresh.push(id);
    else if (isDue(card, now)) due.push(id);
  }

  shuffle(due, rng);
  const newcomers = fresh.slice(0, Math.max(0, limits.newCards));

  return [...due, ...newcomers].slice(0, Math.max(0, limits.maxTotal));
}

/** Count of cards due (excluding new) at `now`. */
export function dueCount(cards: Readonly<Record<string, CardState>>, now: Epoch): number {
  let n = 0;
  for (const card of Object.values(cards)) {
    if (card.phase !== 'new' && isDue(card, now)) n++;
  }
  return n;
}
