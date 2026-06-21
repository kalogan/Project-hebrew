/**
 * Audio abstraction. The UI talks only to this interface, so the MVP's
 * browser-speech implementation can later be swapped for pre-recorded human
 * clips without touching any component.
 */
export interface AudioProvider {
  /** Whether playback is available in this environment. */
  isAvailable(): boolean;
  /** Speak the given pointed-Hebrew text. Resolves when playback starts/ends. */
  speak(hebrew: string): void;
  /** Stop any in-flight playback. */
  stop(): void;
}

/** A no-op provider for environments without speech (tests, SSR, previews). */
export const silentAudio: AudioProvider = {
  isAvailable: () => false,
  speak: () => {},
  stop: () => {},
};
