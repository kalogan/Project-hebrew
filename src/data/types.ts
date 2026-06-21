/**
 * A single prayer-book vocabulary entry. Mirrors the validation in
 * scripts/validate-words.mjs (the gate's source of truth for the dataset).
 */
export interface Word {
  /** Stable slug id, used as the SRS card key. */
  id: string;
  /** Pointed Hebrew (with niqqud). */
  hebrew: string;
  /** Latin transliteration (Sephardi/Modern). */
  translit: string;
  /** English meaning. */
  gloss: string;
  /** Hebrew root (shoresh), or null where not applicable (names, particles). */
  root: string | null;
  /** Where the word characteristically appears in the siddur. */
  source: string;
  /** 1-based rank by frequency in the prayer book (1 = most frequent). */
  frequencyRank: number;
  /** Optional grammatical category. */
  partOfSpeech?: string;
}
