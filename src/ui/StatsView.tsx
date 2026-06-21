import type { DeckApi } from '../app/useDeck';
import { systemClock } from '../services/systemClock';
import { deckStats } from '../core/srs/stats';

interface StatsViewProps {
  deck: DeckApi;
}

/** Goal vocabulary size for the "Siddur 100" challenge. */
const GOAL = 100;

/**
 * Progress dashboard. Read-only view of the deck: derives aggregate stats from
 * `deck.state.cards` via the pure `deckStats` helper. The single wall-clock read
 * is fenced behind `systemClock` (UI may read it; the core may not).
 */
export function StatsView({ deck }: StatsViewProps) {
  const stats = deckStats(deck.state.cards, systemClock.now());
  const started = stats.learning + stats.review;

  return (
    <section className="stats" aria-label="Progress dashboard">
      <p className="app__progress">
        <strong>{started}</strong> of {GOAL} words started
      </p>

      <div className="card">
        <dl className="card__meta">
          <dt>New</dt>
          <dd>{stats.new}</dd>

          <dt>Learning</dt>
          <dd>{stats.learning}</dd>

          <dt>Review</dt>
          <dd>{stats.review}</dd>

          <dt>Due now</dt>
          <dd>{stats.due}</dd>

          <dt>Mature</dt>
          <dd>{stats.mature}</dd>

          <dt>Young</dt>
          <dd>{stats.young}</dd>

          <dt>Total reps</dt>
          <dd>{stats.totalReps}</dd>

          <dt>Lapses</dt>
          <dd>{stats.totalLapses}</dd>

          <dt>Avg. ease</dt>
          <dd>{stats.averageEase.toFixed(2)}</dd>
        </dl>
      </div>
    </section>
  );
}
