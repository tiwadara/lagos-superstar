# 0004. Saves in the player's browser

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

A game takes 26 weeks of play, and players will close the tab part way through. The game has no server and no accounts.

## Options considered

1. **`localStorage` in the player's browser.** No server, no sign-in, instant. Saves stay on one device and vanish if the player clears site data.
2. **Accounts and a server.** Saves follow the player across devices. Needs a backend, sign-in and privacy work.

## Decision

We will save the whole game state as JSON in `localStorage` under the key `next-lagos-star-v1` after every change. The state carries a version number, `v`, and `load()` ignores saves with a different version.

## Consequences

- No backend to run or pay for, and no personal data collected.
- Progress does not move between devices.
- Any change to the state shape that old saves cannot handle must bump `v`, and either migrate old saves or accept that they are dropped.
- Seasons ([ADR 0010](0010-seasons-carry-over.md), #33) brought version 2. `load()` now passes every save through `migrate()`, which turns a version 1 save into season 1 of a version 2 save and drops anything it does not recognise. The key stays `next-lagos-star-v1`, so nobody loses a game. `node test-saves.js` keeps real version 1 saves from the live game and checks on every pull request that they still load and play on. A future version adds its own step to `migrate()` and its own saves to that test.
