import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createSpeechSynthesisProvider } from './speechSynthesisProvider';

/** Minimal fake of window.speechSynthesis with a settable voice list. */
function mockSynth(voices: Array<{ lang: string }>) {
  const listeners: Record<string, Array<() => void>> = {};
  return {
    getVoices: () => voices,
    speak: vi.fn(),
    cancel: vi.fn(),
    addEventListener: (type: string, cb: () => void) => {
      (listeners[type] ??= []).push(cb);
    },
    removeEventListener: vi.fn(),
  };
}

describe('createSpeechSynthesisProvider', () => {
  const OriginalUtt = (globalThis as { SpeechSynthesisUtterance?: unknown })
    .SpeechSynthesisUtterance;

  beforeEach(() => {
    (globalThis as { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance = class {
      lang = '';
      voice: unknown = null;
      rate = 1;
      onerror: unknown = null;
      constructor(public text: string) {}
    };
  });

  afterEach(() => {
    delete (window as { speechSynthesis?: unknown }).speechSynthesis;
    (globalThis as { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance = OriginalUtt;
    vi.restoreAllMocks();
  });

  function setSynth(synth: unknown) {
    Object.defineProperty(window, 'speechSynthesis', {
      value: synth,
      configurable: true,
      writable: true,
    });
  }

  it('falls back to silent audio when speech synthesis is missing', () => {
    delete (window as { speechSynthesis?: unknown }).speechSynthesis;
    const audio = createSpeechSynthesisProvider();
    expect(audio.isAvailable()).toBe(false);
    expect(audio.hasHebrewVoice()).toBe(false);
  });

  it('reports a Hebrew voice when one is installed', () => {
    setSynth(mockSynth([{ lang: 'en-US' }, { lang: 'he-IL' }]));
    const audio = createSpeechSynthesisProvider();
    expect(audio.isAvailable()).toBe(true);
    expect(audio.hasHebrewVoice()).toBe(true);
  });

  it('reports no Hebrew voice when only other languages exist (desktop-Windows case)', () => {
    setSynth(mockSynth([{ lang: 'en-US' }, { lang: 'fr-FR' }]));
    const audio = createSpeechSynthesisProvider();
    expect(audio.isAvailable()).toBe(true);
    expect(audio.hasHebrewVoice()).toBe(false);
  });

  it('speak() cancels in-flight speech then speaks an he-IL utterance', () => {
    const synth = mockSynth([{ lang: 'he-IL' }]);
    setSynth(synth);
    const audio = createSpeechSynthesisProvider();
    audio.speak('שָׁלוֹם');
    expect(synth.cancel).toHaveBeenCalled();
    expect(synth.speak).toHaveBeenCalledTimes(1);
    const utt = synth.speak.mock.calls[0]?.[0] as { lang: string };
    expect(utt.lang).toBe('he-IL');
  });
});
