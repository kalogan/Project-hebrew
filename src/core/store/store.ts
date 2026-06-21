import type { Epoch } from '../time';
import { migrate } from './migrate';
import type { PersistedState } from './schema';

export const STORAGE_KEY = 'siddur-100/state';

/**
 * Minimal storage port. Production passes window.localStorage; tests pass an
 * in-memory fake. Keeping the core decoupled from the browser keeps it testable
 * and deterministic.
 */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** Load + migrate persisted state. Never throws: bad data → fresh default. */
export function loadState(store: KeyValueStore, now: Epoch): PersistedState {
  let raw: unknown = null;
  try {
    const text = store.getItem(STORAGE_KEY);
    raw = text === null ? null : JSON.parse(text);
  } catch {
    raw = null; // corrupt JSON — start fresh rather than crash
  }
  return migrate(raw, now);
}

/** Persist state, stamping updatedAt. Returns the stamped state actually saved. */
export function saveState(store: KeyValueStore, state: PersistedState, now: Epoch): PersistedState {
  const stamped: PersistedState = { ...state, updatedAt: now };
  store.setItem(STORAGE_KEY, JSON.stringify(stamped));
  return stamped;
}

/** A simple in-memory KeyValueStore, handy for tests and SSR-less previews. */
export function memoryStore(seed?: Record<string, string>): KeyValueStore {
  const map = new Map<string, string>(seed ? Object.entries(seed) : []);
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
  };
}
