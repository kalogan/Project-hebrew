import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { App } from './App';
import { memoryStore } from '../core/store/store';

describe('<App> review flow', () => {
  beforeEach(() => cleanup());

  it('shows the first card and reveals its meaning', () => {
    render(<App store={memoryStore()} />);
    // Transliteration is on by default; first card is the highest-frequency word.
    expect(screen.getByText('barukh')).toBeInTheDocument();
    expect(screen.queryByText('blessed')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Show meaning'));
    expect(screen.getByText('blessed')).toBeInTheDocument();
  });

  it('advances to the next card after rating', () => {
    render(<App store={memoryStore()} />);
    fireEvent.click(screen.getByText('Show meaning'));
    fireEvent.click(screen.getByText('Good'));
    // Card 1 (barukh) gone; next card revealed fresh (meaning hidden again).
    expect(screen.queryByText('barukh')).not.toBeInTheDocument();
    expect(screen.getByText('Show meaning')).toBeInTheDocument();
  });

  it('toggles transliteration off', () => {
    render(<App store={memoryStore()} />);
    expect(screen.getByText('barukh')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Show transliteration'));
    expect(screen.queryByText('barukh')).not.toBeInTheDocument();
  });
});
