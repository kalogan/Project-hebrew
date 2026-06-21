import { useEffect, useMemo, useState } from 'react';
import { createSpeechSynthesisProvider } from '../audio/speechSynthesisProvider';
import type { AudioProvider } from '../audio/provider';

export interface AudioApi {
  provider: AudioProvider;
  /** True once a Hebrew voice is actually loaded — reactive to `voiceschanged`. */
  hebrewVoiceAvailable: boolean;
}

/**
 * Wires the audio provider to React. Browser speech voices load asynchronously,
 * so a single check at mount can miss a Hebrew voice that arrives moments later
 * (or report one that never comes). We subscribe to `voiceschanged` and keep
 * availability in state so the UI reflects reality instead of failing silently.
 */
export function useAudio(): AudioApi {
  const provider = useMemo(() => createSpeechSynthesisProvider(), []);
  const [hebrewVoiceAvailable, setHebrewVoiceAvailable] = useState(() =>
    provider.hasHebrewVoice(),
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    const update = () => setHebrewVoiceAvailable(provider.hasHebrewVoice());
    update();
    synth.addEventListener?.('voiceschanged', update);
    return () => synth.removeEventListener?.('voiceschanged', update);
  }, [provider]);

  return { provider, hebrewVoiceAvailable };
}
