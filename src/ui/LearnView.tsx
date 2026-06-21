import { useState } from 'react';
import { Flashcard } from './Flashcard';
import { RatingBar } from './RatingBar';
import { getWord } from '../data/words';
import type { Rating } from '../core/srs/types';
import type { DeckApi } from '../app/useDeck';
import type { AudioProvider } from '../audio/provider';

interface LearnViewProps {
  deck: DeckApi;
  audio: AudioProvider;
}

/** The review loop: one card at a time, reveal, then rate. */
export function LearnView({ deck, audio }: LearnViewProps) {
  const [revealed, setRevealed] = useState(false);
  const word = deck.currentId ? getWord(deck.currentId) : undefined;

  function handleRate(rating: Rating) {
    setRevealed(false);
    deck.rate(rating);
  }

  function handleRestart() {
    setRevealed(false);
    deck.startSession();
  }

  return (
    <>
      <main className="app__main">
        {word ? (
          <>
            <div className="app__progress">{deck.remaining} left in this session</div>
            <Flashcard
              key={word.id}
              word={word}
              revealed={revealed}
              showTransliteration={deck.settings.showTransliteration}
              audioAvailable={audio.isAvailable()}
              onReveal={() => setRevealed(true)}
              onSpeak={() => audio.speak(word.hebrew)}
            />
            {revealed && <RatingBar onRate={handleRate} />}
          </>
        ) : (
          <div className="app__done">
            <p className="app__done-title">🎉 Session complete</p>
            <p>{deck.due} cards due for review.</p>
            <button type="button" className="app__restart" onClick={handleRestart}>
              Start another session
            </button>
          </div>
        )}
      </main>

      <footer className="app__footer">
        <label className="app__toggle">
          <input
            type="checkbox"
            checked={deck.settings.showTransliteration}
            onChange={(e) => deck.updateSettings({ showTransliteration: e.target.checked })}
          />
          Show transliteration
        </label>
      </footer>
    </>
  );
}
