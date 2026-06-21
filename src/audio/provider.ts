/**
 * Audio abstraction. The UI talks only to this interface, so the MVP's
 * browser-speech implementation can later be swapped for pre-recorded human
 * clips without touching any component.
 */
export interface AudioProvider {
  /** Whether playback is available in this environment. */
  isAvailable(): boolean;
  /**
   * Whether a Hebrew voice is actually loaded right now. `isAvailable()` can be
   * true while this is false (e.g. a browser with speech synthesis but no
   * installed Hebrew voice — common on desktop Windows), in which case calling
   * `speak` would produce no audio. The UI uses this to stay honest.
   */
  hasHebrewVoice(): boolean;
  /** Speak the given pointed-Hebrew text. Resolves when playback starts/ends. */
  speak(hebrew: string): void;
  /** Stop any in-flight playback. */
  stop(): void;
}

/** A no-op provider for environments without speech (tests, SSR, previews). */
export const silentAudio: AudioProvider = {
  isAvailable: () => false,
  hasHebrewVoice: () => false,
  speak: () => {},
  stop: () => {},
};
