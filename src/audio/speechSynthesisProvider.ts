import type { AudioProvider } from './provider';
import { silentAudio } from './provider';

/**
 * MVP audio: the browser's built-in Web Speech API with a Hebrew (he-IL) voice.
 *
 * KNOWN QUALITY GAP (for Director review): synthesized speech is
 * device-dependent and not liturgical — quality varies by OS/browser and many
 * devices (notably desktop Windows) have NO Hebrew voice installed, in which
 * case playback is silent. This is a deliberate MVP choice to avoid external
 * credentials / paid TTS. The AudioProvider seam lets us drop in recorded human
 * clips later with no UI change. `hasHebrewVoice()` lets the UI stay honest
 * about whether anything will actually be heard.
 */
export function createSpeechSynthesisProvider(): AudioProvider {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return silentAudio;
  }

  const synth = window.speechSynthesis;

  // Voices load asynchronously; warm the list and keep it fresh so the first
  // click isn't a silent miss. getVoices() can return [] until this fires.
  let voices = synth.getVoices();
  const refresh = () => {
    voices = synth.getVoices();
  };
  synth.addEventListener?.('voiceschanged', refresh);

  function pickHebrewVoice(): SpeechSynthesisVoice | undefined {
    if (voices.length === 0) refresh();
    return voices.find((v) => v.lang.toLowerCase().startsWith('he'));
  }

  return {
    isAvailable: () => true,
    hasHebrewVoice: () => pickHebrewVoice() !== undefined,
    speak(hebrew: string) {
      synth.cancel();
      const utt = new SpeechSynthesisUtterance(hebrew);
      utt.lang = 'he-IL';
      const voice = pickHebrewVoice();
      if (voice) utt.voice = voice;
      utt.rate = 0.85; // slightly slower aids learners
      // Surface failures rather than failing silently (helps diagnose the
      // "nothing plays" case on voiceless devices).
      utt.onerror = (e) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn(`[audio] speech synthesis error: ${e.error}`);
        }
      };
      synth.speak(utt);
    },
    stop() {
      synth.cancel();
    },
  };
}
