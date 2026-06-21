# Siddur 100

Learn the ~100 most frequent **Hebrew prayer-book words** through spaced
repetition. A static, installable PWA — works offline on phone and desktop.

- **Audience:** both Hebrew readers and non-readers — transliteration toggles on/off.
- **Mechanic:** Anki-style spaced repetition (SM-2 variant).
- **Pronunciation:** Sephardi / Modern Israeli, with audio.
- **Content:** curated siddur vocabulary with niqqud, transliteration, gloss,
  root, and the prayer each word appears in.

## Develop

```bash
pnpm install
pnpm dev        # local dev server
pnpm gate       # the full hard-gate (typecheck · lint · guard · content · test · build)
```

## Architecture

This project is built and maintained with the **Architect–Builder Pipeline**.
The shape that matters:

- `src/core/**` — the **authoritative, deterministic core**. SRS scheduling,
  session building, and versioned persistence. It is UI-agnostic and never reads
  the wall-clock or `Math.random` directly (time + randomness are injected via
  `Clock`/`Rng`). Both rules are enforced by `scripts/arch-guard.mjs` in the gate.
- `src/data/**` — the curated word dataset (`words.json`) + typed loader. The
  dataset is validated by `scripts/validate-words.mjs`, shared verbatim by the
  `lint:content` gate command and the unit tests (one source of truth).
- `src/services/**` — boundary adapters (the one real wall-clock read lives here).
- `src/audio/**` — the `AudioProvider` seam; MVP uses Web Speech (`he-IL`).
- `src/ui/**` — presentational components.
- `src/app/**` — wiring: hooks, the React shell, persistence glue.

### The gate

`pnpm gate` runs every check under a hard timeout and reports real exit codes.
Nothing is "done" until this is green. See `docs/ARCHITECT_STATUS.md` for live
project state, the last known-green counts, and the review queue.
