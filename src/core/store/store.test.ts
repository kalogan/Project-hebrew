import { describe, it, expect } from 'vitest';
import { migrate } from './migrate';
import { SCHEMA_VERSION, defaultState, DEFAULT_SETTINGS } from './schema';
import { loadState, saveState, memoryStore, STORAGE_KEY } from './store';
import goldenV1 from './__fixtures__/golden-v1.json';

const NOW = 1_700_900_000_000;

describe('migrate — golden fixture', () => {
  it('migrates the v1 golden fixture to current with stable output', () => {
    const result = migrate(goldenV1, NOW);
    // The current schema IS v1, so the fixture is preserved field-for-field
    // (migration is a faithful transform — it does not re-stamp timestamps).
    // This guards against silent shape drift: change the schema and this fails
    // until you migrate + rebless.
    expect(result).toEqual({
      version: SCHEMA_VERSION,
      cards: goldenV1.cards,
      settings: goldenV1.settings,
      createdAt: goldenV1.createdAt,
      updatedAt: goldenV1.updatedAt,
    });
  });

  it('preserves every card field through migration', () => {
    const result = migrate(goldenV1, NOW);
    expect(result.cards.barukh).toEqual(goldenV1.cards.barukh);
    expect(Object.keys(result.cards)).toEqual(['barukh', 'atah']);
  });
});

describe('migrate — defensive paths', () => {
  it('returns a fresh default for null/garbage', () => {
    expect(migrate(null, NOW)).toEqual(defaultState(NOW));
    expect(migrate('nonsense', NOW)).toEqual(defaultState(NOW));
    expect(migrate(42, NOW)).toEqual(defaultState(NOW));
  });

  it('upgrades a pre-versioned (v0) blob to a v1 skeleton', () => {
    const v0 = { cards: { foo: { phase: 'new' } } };
    const result = migrate(v0, NOW);
    expect(result.version).toBe(SCHEMA_VERSION);
    expect(result.cards).toEqual({ foo: { phase: 'new' } });
    expect(result.settings).toEqual(DEFAULT_SETTINGS);
  });

  it('refuses to misread state from a newer schema', () => {
    const future = { version: 999, cards: { x: {} } };
    expect(migrate(future, NOW)).toEqual(defaultState(NOW));
  });

  it('fills in missing/invalid settings with defaults', () => {
    const partial = { version: 1, cards: {}, settings: { showTransliteration: false } };
    const result = migrate(partial, NOW);
    expect(result.settings.showTransliteration).toBe(false);
    expect(result.settings.newCardsPerDay).toBe(DEFAULT_SETTINGS.newCardsPerDay);
    expect(result.settings.pronunciation).toBe(DEFAULT_SETTINGS.pronunciation);
  });
});

describe('store round-trip', () => {
  it('saves and loads state through a key-value store', () => {
    const store = memoryStore();
    const state = saveState(store, defaultState(NOW), NOW);
    const loaded = loadState(store, NOW + 1000);
    expect(loaded).toEqual(state);
  });

  it('stamps updatedAt on save', () => {
    const store = memoryStore();
    const saved = saveState(store, defaultState(NOW), NOW + 5000);
    expect(saved.updatedAt).toBe(NOW + 5000);
  });

  it('recovers from corrupt JSON in storage', () => {
    const store = memoryStore({ [STORAGE_KEY]: '{ not valid json' });
    expect(loadState(store, NOW)).toEqual(defaultState(NOW));
  });

  it('migrates the golden fixture on load', () => {
    const store = memoryStore({ [STORAGE_KEY]: JSON.stringify(goldenV1) });
    const loaded = loadState(store, NOW);
    expect(loaded.cards.barukh).toEqual(goldenV1.cards.barukh);
  });
});
