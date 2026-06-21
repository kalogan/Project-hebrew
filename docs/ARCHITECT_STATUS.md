# Architect Status — Siddur 100

Durable project memory for the Architect–Builder Pipeline. Update every slice so
a fresh context can resume cold.

_Last updated: 2026-06-21 — dataset expanded to 100 words (builder slice, independently verified), gate green._

## Locked design (from the Director grill)

| Fork | Decision |
| --- | --- |
| Audience | Both readers & non-readers — transliteration is a toggle |
| Core mechanic | Spaced-repetition flashcards (SM-2 variant) |
| Pronunciation | Sephardi / Modern Israeli, with audio |
| Word list | Architect-curated from siddur frequency; full fields |
| Platform | Static installable PWA (Vite + React + TS) — Architect's call |
| Audio (MVP) | Browser Web Speech `he-IL` behind `AudioProvider` — Architect's call (avoids paid TTS / external creds) |

## Non-negotiable constraints (gated)

1. **Core is UI-agnostic** — `src/core/**` may not import React or `src/ui`/`src/app`. (arch-guard)
2. **Core is deterministic** — no wall-clock / `Math.random` in core; inject `Clock`/`Rng`. (eslint + arch-guard)
3. **Persistence is versioned & migrates forward** — bump `SCHEMA_VERSION`, add a migration, ship a golden fixture. (tests)
4. **Word data is validated** — every entry passes `validate-words.mjs`. (lint:content + tests)
5. **Every new system ships tests.**

## The gate (`pnpm gate`) — last known green

`typecheck=0 lint=0 guard=0 content=0 test=0 build=0`
**Tests: 35 passed across 5 files.** Dataset: 100 words valid.
_(A drop in these counts with everything "green" means tests/words were removed, not passing — investigate.)_

## Slices

### Done
- **F0 — Toolchain + gate** — Vite/React/TS, Vitest, ESLint flat config, arch-guard, content-lint, `gate.sh`. ✅ green
- **F1 — Deterministic core** — `Clock`/`Rng`, SM-2 scheduler, session builder. ✅ green, fully tested
- **F2 — Versioned persistence** — schema v1, forward-migration, golden fixture, KV store. ✅ green
- **S1a/b — Dataset, 100 words** — curated (85 content + 15 particles), popular `ch`/`tz` translit. Builder slice `315774e`, independently re-gated by Architect. ✅ green ⚠️ _accuracy review pending (see queue)_
- **S2a — Audio seam** — `AudioProvider` + Web Speech `he-IL`. ✅ green
- **S3a — MVP review UI** — flashcard, rating bar, translit toggle, session flow + tests. ✅ green

### Queued (next fan-out — disjoint surfaces)
- **S4 — Dashboard / progress** — surface: `src/ui/dashboard/**` + `src/app/`. Streak, due counts, deck overview.
- **S5 — Settings screen** — pronunciation, new-cards/day, reset. surface: `src/ui/settings/**`.
- **S6 — PWA polish** — real app icons (192/512 png), offline verification. surface: `public/**`, `vite.config.ts`.
- **S2b — Recorded audio (later)** — swap Web Speech for human clips behind the existing seam.

## Review queue (needs Director taste — non-blocking)

1. **Word list accuracy.** 100 words now in place (popular `ch`/`tz` translit; 15 particles). Needs a native/liturgical spot-check before this is "done." Builder flagged lower-confidence ROOTS to verify: `shem`, `yad`, `pe`, `esh`, `am`, `rav`/`rabbah`, `or`, `mayim`, `av`/`avoteinu`, `vaed`, `tov`. Also spot-check niqqud on newer verb entries: `yevarech` (יְבָרֵךְ), `kibetz` (קִבֵּץ), `hodu` (הוֹדוּ).
2. **Audio quality.** MVP uses synthesized `he-IL` speech — device-dependent, not liturgical. Judge whether that's acceptable for v1 or we should source recordings sooner.
3. **Visual/feel.** Dark theme, card layout, Hebrew font size — needs a real-device look (esp. RTL + niqqud rendering). Browser smoke not yet run on a real device.

## Safety boundaries (stop-and-ask)
Paid TTS / external API creds; deploys; force-push/history rewrite; deleting user data.
