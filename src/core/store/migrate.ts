import type { Epoch } from '../time';
import { DEFAULT_SETTINGS, SCHEMA_VERSION, defaultState, type PersistedState, type Settings } from './schema';

/**
 * Migrate any previously-persisted blob forward to the current schema.
 *
 * Strategy: detect the stored version, then apply step migrations in sequence
 * up to SCHEMA_VERSION. Unknown/corrupt input degrades gracefully to a fresh
 * default rather than throwing — losing progress is bad, but a crash-on-boot is
 * worse, and the data here is reconstructable by re-learning.
 *
 * When you add v2: add a `migrations[2]` that takes the v1 shape to v2, and a
 * golden fixture proving the upgrade.
 */
export function migrate(raw: unknown, now: Epoch): PersistedState {
  if (raw === null || typeof raw !== 'object') {
    return defaultState(now);
  }

  const obj = raw as Record<string, unknown>;
  const version = typeof obj.version === 'number' ? obj.version : 0;

  if (version > SCHEMA_VERSION) {
    // Persisted by a newer build than this one — don't pretend to understand it.
    return defaultState(now);
  }

  let state = obj;
  for (let v = version; v < SCHEMA_VERSION; v++) {
    const step = MIGRATIONS[v];
    if (!step) return defaultState(now);
    state = step(state);
  }

  return coerceCurrent(state, now);
}

/** Step migrations: MIGRATIONS[n] upgrades a v{n} blob to v{n+1}. */
const MIGRATIONS: Record<number, (s: Record<string, unknown>) => Record<string, unknown>> = {
  // 0 -> 1: pre-versioned/empty blobs become a fresh v1 skeleton.
  0: (s) => ({ ...s, version: 1, cards: isRecord(s.cards) ? s.cards : {} }),
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** Final defensive coercion: guarantee a well-formed current state. */
function coerceCurrent(s: Record<string, unknown>, now: Epoch): PersistedState {
  const base = defaultState(now);
  return {
    version: SCHEMA_VERSION,
    cards: isRecord(s.cards) ? (s.cards as PersistedState['cards']) : base.cards,
    settings: coerceSettings(s.settings),
    createdAt: typeof s.createdAt === 'number' ? s.createdAt : now,
    // Migration is a faithful transform of stored data — preserve timestamps.
    // Re-stamping updatedAt is the job of saveState, not load/migrate.
    updatedAt: typeof s.updatedAt === 'number' ? s.updatedAt : now,
  };
}

function coerceSettings(s: unknown): Settings {
  if (!isRecord(s)) return { ...DEFAULT_SETTINGS };
  return {
    showTransliteration:
      typeof s.showTransliteration === 'boolean' ? s.showTransliteration : DEFAULT_SETTINGS.showTransliteration,
    newCardsPerDay: typeof s.newCardsPerDay === 'number' ? s.newCardsPerDay : DEFAULT_SETTINGS.newCardsPerDay,
    pronunciation:
      s.pronunciation === 'sephardi' || s.pronunciation === 'ashkenazi'
        ? s.pronunciation
        : DEFAULT_SETTINGS.pronunciation,
  };
}
