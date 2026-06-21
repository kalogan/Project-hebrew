import type { DeckApi } from '../app/useDeck';

interface StatsViewProps {
  deck: DeckApi;
}

/**
 * Progress dashboard. STUB — to be implemented by the Stats slice.
 * Contract: read-only view of the deck. Derive aggregate stats from
 * `deck.state.cards` via a pure helper in src/core/srs (do not reach into
 * the wall-clock or localStorage here). Must not import App.tsx or other views.
 */
export function StatsView({ deck }: StatsViewProps) {
  return (
    <section className="stats">
      <p className="app__progress">{deck.due} cards due for review.</p>
    </section>
  );
}
