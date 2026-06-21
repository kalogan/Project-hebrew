import type { DeckApi } from '../app/useDeck';

interface SettingsViewProps {
  deck: DeckApi;
  audioAvailable: boolean;
}

const NEW_CARDS_MIN = 0;
const NEW_CARDS_MAX = 50;

function clampNewCards(value: number): number {
  if (Number.isNaN(value)) return NEW_CARDS_MIN;
  return Math.min(NEW_CARDS_MAX, Math.max(NEW_CARDS_MIN, Math.round(value)));
}

/**
 * Settings panel. Drives all changes through `deck.settings` /
 * `deck.updateSettings`. Surfaces the existing Settings fields
 * (showTransliteration, newCardsPerDay, pronunciation) plus audio
 * availability. Must not import App.tsx or other views.
 */
export function SettingsView({ deck, audioAvailable }: SettingsViewProps) {
  const { settings, updateSettings } = deck;

  return (
    <section className="settings">
      <label className="app__toggle">
        <input
          type="checkbox"
          checked={settings.showTransliteration}
          onChange={(e) => updateSettings({ showTransliteration: e.target.checked })}
        />
        Show transliteration
      </label>

      <label className="app__toggle" htmlFor="settings-new-cards">
        New cards per day
        <input
          id="settings-new-cards"
          type="number"
          inputMode="numeric"
          min={NEW_CARDS_MIN}
          max={NEW_CARDS_MAX}
          step={1}
          value={settings.newCardsPerDay}
          onChange={(e) =>
            updateSettings({ newCardsPerDay: clampNewCards(e.target.valueAsNumber) })
          }
        />
      </label>

      <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
        <legend>Pronunciation</legend>
        <label className="app__toggle">
          <input
            type="radio"
            name="pronunciation"
            value="sephardi"
            checked={settings.pronunciation === 'sephardi'}
            onChange={() => updateSettings({ pronunciation: 'sephardi' })}
          />
          Sephardi
        </label>
        <label className="app__toggle">
          <input
            type="radio"
            name="pronunciation"
            value="ashkenazi"
            checked={settings.pronunciation === 'ashkenazi'}
            onChange={() => updateSettings({ pronunciation: 'ashkenazi' })}
          />
          Ashkenazi
        </label>
      </fieldset>

      <p className="app__progress">Audio: {audioAvailable ? 'available' : 'unavailable'}</p>
    </section>
  );
}
