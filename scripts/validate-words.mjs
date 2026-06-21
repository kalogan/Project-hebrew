/**
 * Single source of truth for word-dataset validation.
 *
 * Used by two independent gate paths so a bad dataset cannot slip through:
 *   - scripts/lint-content.mjs  (the `lint:content` gate command)
 *   - src/data/words.test.ts    (the unit-test gate)
 *
 * Pure, dependency-free, deterministic.
 */

const HEBREW_LETTER = /[א-ת]/; // alef..tav
const NIQQUD = /[ְ-ׇּׁׂ]/; // vowel points + dagesh
const ID_RE = /^[a-z0-9-]+$/;
const TRANSLIT_RE = /^[A-Za-z'’\- ]+$/;

const REQUIRED_STRING_FIELDS = ['id', 'hebrew', 'translit', 'gloss', 'source'];

/**
 * @param {unknown} data parsed words dataset (expected: array of entries)
 * @returns {string[]} list of human-readable errors; empty array == valid
 */
export function validateWords(data) {
  /** @type {string[]} */
  const errors = [];

  if (!Array.isArray(data)) {
    return ['dataset is not an array'];
  }

  const seenIds = new Set();
  const seenRanks = new Set();

  data.forEach((w, i) => {
    const where = `entry[${i}]${w && typeof w === 'object' && 'id' in w ? ` (${w.id})` : ''}`;

    if (w === null || typeof w !== 'object') {
      errors.push(`${where}: not an object`);
      return;
    }

    for (const field of REQUIRED_STRING_FIELDS) {
      const v = w[field];
      if (typeof v !== 'string' || v.trim() === '') {
        errors.push(`${where}: missing/empty required field "${field}"`);
      }
    }

    if (typeof w.id === 'string') {
      if (!ID_RE.test(w.id)) errors.push(`${where}: id must match ${ID_RE}`);
      if (seenIds.has(w.id)) errors.push(`${where}: duplicate id "${w.id}"`);
      seenIds.add(w.id);
    }

    if (typeof w.hebrew === 'string' && !HEBREW_LETTER.test(w.hebrew)) {
      errors.push(`${where}: "hebrew" contains no Hebrew letters`);
    }
    if (typeof w.hebrew === 'string' && !NIQQUD.test(w.hebrew)) {
      errors.push(`${where}: "hebrew" has no niqqud (vowel points) — pointed text required`);
    }

    if (typeof w.translit === 'string' && !TRANSLIT_RE.test(w.translit)) {
      errors.push(`${where}: "translit" has unexpected characters (Latin transliteration only)`);
    }

    if (w.root !== undefined && w.root !== null) {
      if (typeof w.root !== 'string' || !HEBREW_LETTER.test(w.root)) {
        errors.push(`${where}: "root" must be Hebrew letters or null`);
      }
    }

    if (!Number.isInteger(w.frequencyRank) || w.frequencyRank < 1) {
      errors.push(`${where}: "frequencyRank" must be a positive integer`);
    } else {
      if (seenRanks.has(w.frequencyRank)) {
        errors.push(`${where}: duplicate frequencyRank ${w.frequencyRank}`);
      }
      seenRanks.add(w.frequencyRank);
    }
  });

  return errors;
}
