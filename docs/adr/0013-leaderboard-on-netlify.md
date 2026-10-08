# 0013. The leaderboard runs on Netlify, and ranks weekly challenges by replay

- **Status:** Proposed
- **Date:** 2026-10-08
- **Issue:** #62

## Context

A leaderboard (#61) needs shared storage, but the game has no server ([ADR 0004](0004-saves-in-local-storage.md)) and is hosted on Netlify ([ADR 0003](0003-static-hosting-on-netlify.md)). The game runs entirely in the browser, so any score a browser posts can be faked.

## Options considered

1. **Netlify Functions with Netlify Blobs.** Same host, same deploys, nothing new to sign up for. Check the current free-plan limits before launch.
2. **A hosted database (Supabase, Firebase).** More features, but a second service, another account and more keys to manage.
3. **No server: a share card only.** No faking problem, but no board.

## Decision

We will use option 1, with two boards:

- **Weekly challenge board (ranked).** Everyone plays the same seed (#64, using `R.seed` from #36). The game posts the seed, the career, the background and the list of the player's moves and choices. The function replays the run with the same game script the simulator uses, and stores only the score it computes. Faked scores are impossible without playing.
- **All-time board (for fun).** Normal games post their result as-is, clearly labelled unverified.

The score is fans at the end of the season, shown with the ending tier, per career. Posting is opt-in, under the stage name, with a word filter and a way to report a name.

## Consequences

- The game script must stay runnable outside the page, which [ADR 0006](0006-headless-simulator-for-balance.md) already requires.
- Every move and choice in a challenge run has to be recorded in the save.
- The game must work exactly as now when the function is unreachable.
- A Netlify Function means the repo gains a `netlify/functions/` folder and a `netlify.toml`.
