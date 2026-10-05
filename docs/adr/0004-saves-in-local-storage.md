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
- Any change to the state shape that old saves cannot handle must bump `v`, and either migrate old saves or accept that they are dropped. Seasons will need this.
