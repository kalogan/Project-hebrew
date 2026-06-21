import type { Word } from '../data/types';

interface FlashcardProps {
  word: Word;
  revealed: boolean;
  showTransliteration: boolean;
  audioAvailable: boolean;
  onReveal: () => void;
  onSpeak: () => void;
}

/**
 * Presentational flashcard. Hebrew is always shown (it's the thing being
 * learned); the meaning is hidden until revealed. Transliteration is gated on
 * the both-audiences toggle.
 */
export function Flashcard({
  word,
  revealed,
  showTransliteration,
  audioAvailable,
  onReveal,
  onSpeak,
}: FlashcardProps) {
  return (
    <div className="card" role="group" aria-label="Flashcard">
      <div className="card__hebrew" lang="he" dir="rtl">
        {word.hebrew}
      </div>

      {showTransliteration && <div className="card__translit">{word.translit}</div>}

      {audioAvailable ? (
        <button type="button" className="card__audio" onClick={onSpeak} aria-label="Play pronunciation">
          🔊 Listen
        </button>
      ) : (
        <p className="card__audio-note">🔇 No Hebrew voice on this device</p>
      )}

      {revealed ? (
        <div className="card__back">
          <div className="card__gloss">{word.gloss}</div>
          <dl className="card__meta">
            {word.root && (
              <>
                <dt>Root</dt>
                <dd lang="he" dir="rtl">
                  {word.root}
                </dd>
              </>
            )}
            <dt>Appears in</dt>
            <dd>{word.source}</dd>
          </dl>
        </div>
      ) : (
        <button type="button" className="card__reveal" onClick={onReveal}>
          Show meaning
        </button>
      )}
    </div>
  );
}
