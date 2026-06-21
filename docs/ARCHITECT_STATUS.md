# Architect Status — Siddur 100

Durable project memory for the Architect–Builder Pipeline. Update every slice so
a fresh context can resume cold.

_Last updated: 2026-06-21 — parallel wave shipped: tabbed shell + Stats dashboard + Settings panel + real PWA icons. Deploy pivoted from GitHub Pages → Vercel (Git integration; awaiting Director connect). Gate green, 48 tests._

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
**Tests: 48 passed across 8 files.** Dataset: 100 words valid.
_(A drop in these counts with everything "green" means tests/words were removed, not passing — investigate.)_

## Slices

### Done
- **F0 — Toolchain + gate** — Vite/React/TS, Vitest, ESLint flat config, arch-guard, content-lint, `gate.sh`. ✅ green
- **F1 — Deterministic core** — `Clock`/`Rng`, SM-2 scheduler, session builder. ✅ green, fully tested
- **F2 — Versioned persistence** — schema v1, forward-migration, golden fixture, KV store. ✅ green
- **S1a/b — Dataset, 100 words** — curated (85 content + 15 particles), popular `ch`/`tz` translit. Builder slice `315774e`, independently re-gated by Architect. ✅ green ⚠️ _accuracy review pending (see queue)_
- **S2a — Audio seam** — `AudioProvider` + Web Speech `he-IL`. ✅ green
- **S3a — MVP review UI** — flashcard, rating bar, translit toggle, session flow + tests. ✅ green
- **S3b — Tabbed shell** — Learn/Stats/Settings nav; review loop extracted to `LearnView`. ✅ green
- **S4 — Stats dashboard** — pure `deckStats(cards, now)` helper (new/learning/review/due/mature/young/reps/lapses/avg-ease) + `StatsView`. ✅ green
- **S5 — Settings panel** — transliteration, new-cards/day (0–50), pronunciation (Sephardi/Ashkenazi), audio status. ✅ green
- **S6 — PWA icons** — real 192/512/maskable/apple-touch PNGs, manifest + apple-touch link. ✅ green
- **CI/Deploy** — standalone CI gate workflow; `vercel.json` for Vercel Git integration (preview per push/PR). ⏳ awaiting Director's one-time Vercel connect.

### Queued
- **S2b — Recorded audio (later)** — swap Web Speech for human clips behind the existing seam.
- **S7 — Streak/history (later)** — persisted daily review streak (needs schema v2 + migration + golden fixture).

## Review queue (needs Director taste — non-blocking)

1. **Word list accuracy.** 100 words now in place (popular `ch`/`tz` translit; 15 particles). Needs a native/liturgical spot-check before this is "done." Builder flagged lower-confidence ROOTS to verify: `shem`, `yad`, `pe`, `esh`, `am`, `rav`/`rabbah`, `or`, `mayim`, `av`/`avoteinu`, `vaed`, `tov`. Also spot-check niqqud on newer verb entries: `yevarech` (יְבָרֵךְ), `kibetz` (קִבֵּץ), `hodu` (הוֹדוּ).
2. **Audio quality.** MVP uses synthesized `he-IL` speech — device-dependent, not liturgical. Judge whether that's acceptable for v1 or we should source recordings sooner.
3. **Visual/feel.** Dark theme, card layout, Hebrew font size — needs a real-device look (esp. RTL + niqqud rendering). Browser smoke not yet run on a real device.

## Safety boundaries (stop-and-ask)
Paid TTS / external API creds; deploys; force-push/history rewrite; deleting user data.
