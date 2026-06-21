import type { DeckApi } from '../app/useDeck';

interface SettingsViewProps {
  deck: DeckApi;
  audioAvailable: boolean;
}

/**
 * Settings panel. STUB — to be implemented by the Settings slice.
 * Contract: drive all changes through `deck.settings` / `deck.updateSettings`.
 * Expose the existing Settings fields (showTransliteration, newCardsPerDay,
 * pronunciation) and surface audio availability. Persisted-shape changes must
 * bump SCHEMA_VERSION + add a migration + a golden fixture. Must not import
 * App.tsx or other views.
 */
export function SettingsView({ deck, audioAvailable }: SettingsViewProps) {
  return (
    <section className="settings">
      <label className="app__toggle">
        <input
          type="checkbox"
          checked={deck.settings.showTransliteration}
          onChange={(e) => deck.updateSettings({ showTransliteration: e.target.checked })}
        />
        Show transliteration
      </label>
      <p className="app__progress">Audio is {audioAvailable ? 'available' : 'unavailable'}.</p>
    </section>
  );
}
