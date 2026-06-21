import type { Epoch } from '../time';
import type { CardState } from '../srs/types';

/**
 * Bump this whenever the persisted shape changes, add a migration in migrate.ts,
 * and ship a golden fixture. Everything persisted is versioned and migrates
 * forward — a non-negotiable constraint, gated by the migration tests.
 */
export const SCHEMA_VERSION = 1 as const;

export type Pronunciation = 'sephardi' | 'ashkenazi';

export interface Settings {
  /** Show Latin transliteration alongside the Hebrew (the both-audiences toggle). */
  showTransliteration: boolean;
  /** How many brand-new cards to introduce per day. */
  newCardsPerDay: number;
  /** Pronunciation tradition for audio + transliteration. */
  pronunciation: Pronunciation;
}

export const DEFAULT_SETTINGS: Settings = {
  showTransliteration: true,
  newCardsPerDay: 10,
  pronunciation: 'sephardi',
};

/** The current (latest) persisted shape. */
export interface PersistedState {
  version: typeof SCHEMA_VERSION;
  /** Per-word scheduling state, keyed by word id. */
  cards: Record<string, CardState>;
  settings: Settings;
  createdAt: Epoch;
  updatedAt: Epoch;
}

export function defaultState(now: Epoch): PersistedState {
  return {
    version: SCHEMA_VERSION,
    cards: {},
    settings: { ...DEFAULT_SETTINGS },
    createdAt: now,
    updatedAt: now,
  };
}
