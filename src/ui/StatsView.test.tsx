import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsView } from './StatsView';
import type { DeckApi } from '../app/useDeck';
import type { CardState } from '../core/srs/types';

function card(overrides: Partial<CardState> = {}): CardState {
  return {
    ease: 2.5,
    intervalDays: 0,
    step: 0,
    reps: 0,
    lapses: 0,
    due: 0,
    lastReviewed: null,
    phase: 'new',
    ...overrides,
  };
}

/** Minimal fake deck; only `state.cards` is read by StatsView. */
function fakeDeck(cards: Record<string, CardState>): DeckApi {
  return { state: { cards } } as unknown as DeckApi;
}

describe('StatsView', () => {
  it('renders the started headline and a breakdown', () => {
    const deck = fakeDeck({
      a: card({ phase: 'new' }),
      b: card({ phase: 'learning' }),
      c: card({ phase: 'review', intervalDays: 30 }),
    });

    render(<StatsView deck={deck} />);

    // 1 learning + 1 review = 2 of 100 started.
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/of 100 words started/)).toBeInTheDocument();

    // Breakdown definition list values.
    expect(screen.getByText('New').nextElementSibling).toHaveTextContent('1');
    expect(screen.getByText('Mature').nextElementSibling).toHaveTextContent('1');
  });
});
