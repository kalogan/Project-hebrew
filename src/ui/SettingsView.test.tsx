import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SettingsView } from './SettingsView';
import type { DeckApi } from '../app/useDeck';
import type { Settings } from '../core/store/schema';

function fakeDeck(settings: Settings) {
  const updateSettings = vi.fn();
  const deck = { settings, updateSettings } as unknown as DeckApi;
  return { deck, updateSettings };
}

const defaults: Settings = {
  showTransliteration: true,
  newCardsPerDay: 10,
  pronunciation: 'sephardi',
};

describe('<SettingsView>', () => {
  beforeEach(() => cleanup());

  it('renders the current settings values', () => {
    const { deck } = fakeDeck(defaults);
    render(<SettingsView deck={deck} audioAvailable={false} />);

    expect(screen.getByLabelText('Show transliteration')).toBeChecked();
    expect(screen.getByLabelText('New cards per day')).toHaveValue(10);
    expect(screen.getByLabelText('Sephardi')).toBeChecked();
    expect(screen.getByLabelText('Ashkenazi')).not.toBeChecked();
  });

  it('toggles transliteration through updateSettings', () => {
    const { deck, updateSettings } = fakeDeck(defaults);
    render(<SettingsView deck={deck} audioAvailable={false} />);

    fireEvent.click(screen.getByLabelText('Show transliteration'));
    expect(updateSettings).toHaveBeenCalledWith({ showTransliteration: false });
  });

  it('changes new cards per day, clamping to the allowed range', () => {
    const { deck, updateSettings } = fakeDeck(defaults);
    render(<SettingsView deck={deck} audioAvailable={false} />);

    fireEvent.change(screen.getByLabelText('New cards per day'), { target: { value: '20' } });
    expect(updateSettings).toHaveBeenCalledWith({ newCardsPerDay: 20 });

    fireEvent.change(screen.getByLabelText('New cards per day'), { target: { value: '999' } });
    expect(updateSettings).toHaveBeenCalledWith({ newCardsPerDay: 50 });
  });

  it('changes pronunciation through updateSettings', () => {
    const { deck, updateSettings } = fakeDeck(defaults);
    render(<SettingsView deck={deck} audioAvailable={false} />);

    fireEvent.click(screen.getByLabelText('Ashkenazi'));
    expect(updateSettings).toHaveBeenCalledWith({ pronunciation: 'ashkenazi' });
  });

  it('reflects audio availability from the prop', () => {
    const { deck } = fakeDeck(defaults);
    const { rerender } = render(<SettingsView deck={deck} audioAvailable={true} />);
    expect(screen.getByText('Audio: available')).toBeInTheDocument();

    rerender(<SettingsView deck={deck} audioAvailable={false} />);
    expect(screen.getByText('Audio: unavailable')).toBeInTheDocument();
  });
});
