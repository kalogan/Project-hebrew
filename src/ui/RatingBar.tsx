import type { Rating } from '../core/srs/types';

interface RatingBarProps {
  onRate: (rating: Rating) => void;
}

const BUTTONS: { rating: Rating; label: string; hint: string }[] = [
  { rating: 'again', label: 'Again', hint: 'Forgot' },
  { rating: 'hard', label: 'Hard', hint: 'Struggled' },
  { rating: 'good', label: 'Good', hint: 'Recalled' },
  { rating: 'easy', label: 'Easy', hint: 'Instant' },
];

/** The four SRS recall buttons shown once the meaning is revealed. */
export function RatingBar({ onRate }: RatingBarProps) {
  return (
    <div className="ratings" role="group" aria-label="Rate your recall">
      {BUTTONS.map((b) => (
        <button
          key={b.rating}
          type="button"
          className={`ratings__btn ratings__btn--${b.rating}`}
          onClick={() => onRate(b.rating)}
        >
          <span className="ratings__label">{b.label}</span>
          <span className="ratings__hint">{b.hint}</span>
        </button>
      ))}
    </div>
  );
}
