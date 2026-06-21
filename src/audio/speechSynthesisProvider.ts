import type { AudioProvider } from './provider';
import { silentAudio } from './provider';

/**
 * MVP audio: the browser's built-in Web Speech API with a Hebrew (he-IL) voice.
 *
 * KNOWN QUALITY GAP (for Director review): synthesized speech is
 * device-dependent and not liturgical — quality varies by OS/browser and some
 * devices have no Hebrew voice at all. This is a deliberate MVP choice to avoid
 * external credentials / paid TTS. The AudioProvider seam lets us drop in
 * recorded human clips later with no UI change.
 */
export function createSpeechSynthesisProvider(): AudioProvider {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return silentAudio;
  }

  const synth = window.speechSynthesis;

  function pickHebrewVoice(): SpeechSynthesisVoice | undefined {
    const voices = synth.getVoices();
    return voices.find((v) => v.lang.toLowerCase().startsWith('he'));
  }

  return {
    isAvailable: () => true,
    speak(hebrew: string) {
      synth.cancel();
      const utt = new SpeechSynthesisUtterance(hebrew);
      utt.lang = 'he-IL';
      const voice = pickHebrewVoice();
      if (voice) utt.voice = voice;
      utt.rate = 0.85; // slightly slower aids learners
      synth.speak(utt);
    },
    stop() {
      synth.cancel();
    },
  };
}
