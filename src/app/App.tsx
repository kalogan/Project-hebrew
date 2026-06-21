import { useMemo, useState } from 'react';
import { useDeck } from './useDeck';
import { LearnView } from '../ui/LearnView';
import { StatsView } from '../ui/StatsView';
import { SettingsView } from '../ui/SettingsView';
import { createSpeechSynthesisProvider } from '../audio/speechSynthesisProvider';
import type { KeyValueStore } from '../core/store/store';

interface AppProps {
  /** Injectable for tests/previews; defaults to localStorage in main.tsx. */
  store: KeyValueStore;
}

type Tab = 'learn' | 'stats' | 'settings';

const TABS: ReadonlyArray<{ id: Tab; label: string }> = [
  { id: 'learn', label: 'Learn' },
  { id: 'stats', label: 'Stats' },
  { id: 'settings', label: 'Settings' },
];

export function App({ store }: AppProps) {
  const audio = useMemo(() => createSpeechSynthesisProvider(), []);
  const deck = useDeck(store);
  const [tab, setTab] = useState<Tab>('learn');

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Siddur 100</h1>
        <p className="app__subtitle">The prayer book, one word at a time</p>
      </header>

      {tab === 'learn' && <LearnView deck={deck} audio={audio} />}
      {tab === 'stats' && <StatsView deck={deck} />}
      {tab === 'settings' && <SettingsView deck={deck} audioAvailable={audio.isAvailable()} />}

      <nav className="nav" aria-label="Sections">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'nav__btn nav__btn--active' : 'nav__btn'}
            aria-current={tab === id ? 'page' : undefined}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
