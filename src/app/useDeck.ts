import { useCallback, useMemo, useRef, useState } from 'react';
import { systemClock } from '../services/systemClock';
import { loadState, saveState } from '../core/store/store';
import type { KeyValueStore } from '../core/store/store';
import type { PersistedState, Settings } from '../core/store/schema';
import { newCard, review as reviewCard } from '../core/srs/scheduler';
import { buildSession, dueCount } from '../core/srs/session';
import { mulberry32, MS_PER_DAY } from '../core/time';
import type { Rating } from '../core/srs/types';
import { words } from '../data/words';

/** Ensure every word has a card; missing ones become new cards due now. */
function seedCards(state: PersistedState, now: number): PersistedState {
  let changed = false;
  const cards = { ...state.cards };
  for (const w of words) {
    if (!cards[w.id]) {
      cards[w.id] = newCard(now);
      changed = true;
    }
  }
  return changed ? { ...state, cards } : state;
}

export interface DeckApi {
  state: PersistedState;
  settings: Settings;
  queue: string[];
  position: number;
  currentId: string | null;
  remaining: number;
  due: number;
  rate: (rating: Rating) => void;
  startSession: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
}

/**
 * App-layer hook that wires the deterministic core to React + persistence.
 * The browser concerns (clock, localStorage) live here, outside the core.
 */
export function useDeck(store: KeyValueStore): DeckApi {
  const now0 = systemClock.now();
  const [state, setState] = useState<PersistedState>(() => seedCards(loadState(store, now0), now0));
  const [queue, setQueue] = useState<string[]>(() =>
    buildSession(state.cards, now0, { newCards: state.settings.newCardsPerDay, maxTotal: 40 }, mulberry32(daySeed(now0))),
  );
  const [position, setPosition] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  const persist = useCallback(
    (next: PersistedState) => {
      const now = systemClock.now();
      const saved = saveState(store, next, now);
      setState(saved);
    },
    [store],
  );

  const startSession = useCallback(() => {
    const now = systemClock.now();
    const current = stateRef.current;
    setQueue(
      buildSession(
        current.cards,
        now,
        { newCards: current.settings.newCardsPerDay, maxTotal: 40 },
        mulberry32(daySeed(now) + current.updatedAt),
      ),
    );
    setPosition(0);
  }, []);

  const rate = useCallback(
    (rating: Rating) => {
      const now = systemClock.now();
      const current = stateRef.current;
      const id = queue[position];
      if (!id) return;
      const card = current.cards[id];
      if (!card) return;
      const updated = reviewCard(card, rating, now);
      persist({ ...current, cards: { ...current.cards, [id]: updated } });
      setPosition((p) => p + 1);
    },
    [queue, position, persist],
  );

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      const current = stateRef.current;
      persist({ ...current, settings: { ...current.settings, ...patch } });
    },
    [persist],
  );

  const currentId = position < queue.length ? (queue[position] ?? null) : null;
  const remaining = Math.max(0, queue.length - position);
  const due = useMemo(() => dueCount(state.cards, systemClock.now()), [state.cards]);

  return {
    state,
    settings: state.settings,
    queue,
    position,
    currentId,
    remaining,
    due,
    rate,
    startSession,
    updateSettings,
  };
}

function daySeed(now: number): number {
  return Math.floor(now / MS_PER_DAY);
}
