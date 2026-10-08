# 0008. Careers share one city, one engine and one cast

- **Status:** Accepted
- **Date:** 2026-10-06
- **Issue:** #40

## Context

The game was always meant to cover the whole Lagos entertainment industry, with more careers in the same city and the same cast (see the README). Today everything is built for one career, music: the moves, venues, tier names, endings, the December booking, stream income, backgrounds and song titles.

Another Lagos music game, Road to Number One, now covers the musician's path. Breadth is where this game can stand apart, and the next career is the Nollywood actor (#42).

What the current code already shares, and what is music-only:

| Part of the script | Today | For careers |
| --- | --- | --- |
| Weeks, moves per week, rent, food, "Your people", debt and "Sapa won" | Generic | Shared |
| Stats (skill, hype, street cred, links), `chk`, `odds`, `apply` | Generic | Shared. Each career explains what skill means |
| Deals and cuts (`takeHome`) | Generic mechanism, music partners | Shared mechanism. Partners come from stories |
| Story picking (`pickEvent`), follow-ups, saves | Generic | Shared |
| `ACTIONS` | Rehearse, record, release and promo are music; post, show face and side hustle are generic | Per career, with the three generic moves shared |
| `venue`, `TIERS` names, `DECEMBER`, `finale` texts | Music | Per career. Fan thresholds stay the same |
| `streamGross` | Music income | Per career weekly income |
| `BACKGROUNDS`, `SONG_TITLES`, `qWord` | Music | Per career |
| `STAGE_NAMES`, `SLOGANS`, most `OPENERS` | Generic | Shared |
| Stories | 30 cards. About 11 are Lagos-life stories that mention music only in a line (`houserules`, `mamaput`, `mamaPutBack`, `mum`, `police`, `nepa`, `phone`, `landlord`, `blog`, `brand`, `awards`). About 19 are music-only | City stories shared, with career-aware wording. Music stories tagged |

## Options considered

1. **Career definitions inside the one file.** A `CAREERS` object, where each career supplies its moves, venues, tier names, income, backgrounds and December. The weekly loop, money, stats, story picking, deals and saves stay shared. Stories get an optional `careers` tag. This keeps [ADR 0002](0002-single-html-file-no-framework.md) (one file, no build), and a new career is mostly writing. The file grows by roughly 300 to 400 lines per career.
2. **A copy of the game per career** (`actor.html`). Fastest to start, but every fix has to be made twice, and there is no shared cast or crossover stories.
3. **Make careers pure data, after stories move to a data file** (#18). Cleanest in the long run, but it blocks careers behind a format decision (#19) that hasn't been made.

## Decision

We will use option 1:

- **State:** the game state gets `career`. A save without it is a music save, so no version bump is needed ([ADR 0004](0004-saves-in-local-storage.md)).
- **Per career, in `CAREERS[id]`:** name, backgrounds, moves, venue ladder, tier names, weekly income, the December booking, finale texts, and a few words that shared stories use (for example the career's work: "music" or "acting").
- **Shared moves:** post content, show face and side hustle stay shared.
- **Stories:** a card can have `careers: ['music']`. Untagged cards are city stories that every career can draw, and they use the career's words instead of hard-coded music words. A card tagged with several careers can tell one event from different sides.
- **Tools:** `simulate.js` and `lint-stories.js` run every career. `TARGETS` and `balance-baseline.json` gain a career key.
- **Order:** music moves into the framework first and must play exactly as before (#41). The actor is added only after that (#42).
- **Screen:** the title screen asks for the career before the background.

## Consequences

- A new career is mostly writing: moves, about 15 stories of its own, tier names and a December booking. City stories, the economy, deals and the cast come with it.
- Crossover stories become possible, which is the thing a single-career game can't do.
- The shared engine must stop assuming music. Words like "song", "single" and "streams" move into the career definition, and #41 has to find every one. The story linter can help by flagging music words in untagged stories.
- `index.html` grows. If it passes about 2,000 lines, revisit [ADR 0002](0002-single-html-file-no-framework.md) together with stories as data (#18, #19).
- Balance targets become per career, and `node simulate.js --check` takes about twice as long with two careers, roughly 80 seconds.
