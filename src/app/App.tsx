import { useMemo, useState } from 'react';
import { useDeck } from './useDeck';
import { Flashcard } from '../ui/Flashcard';
import { RatingBar } from '../ui/RatingBar';
import { createSpeechSynthesisProvider } from '../audio/speechSynthesisProvider';
import { getWord } from '../data/words';
import type { Rating } from '../core/srs/types';
import type { KeyValueStore } from '../core/store/store';

interface AppProps {
  /** Injectable for tests/previews; defaults to localStorage in main.tsx. */
  store: KeyValueStore;
}

export function App({ store }: AppProps) {
  const audio = useMemo(() => createSpeechSynthesisProvider(), []);
  const deck = useDeck(store);
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
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Siddur 100</h1>
        <p className="app__subtitle">The prayer book, one word at a time</p>
      </header>

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
    </div>
  );
}
