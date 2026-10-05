# 0006. A headless simulator checks balance

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

Every story changes the economy. Playing by hand cannot show how often each ending happens, and balance problems only show up across many games.

## Decision

We will keep a Node script, `simulate.js`, that loads the game script straight out of `index.html` and plays thousands of games with three kinds of player: sensible, random and lazy. It prints how often each ending happens. Changes to rules or stories are checked against it.

## Consequences

- Balance is measured against the real game, not a copy of the rules.
- The game script must stay runnable in Node: no page access above the interface block, and the names the simulator reads must not be renamed. [architecture.md](../architecture.md#what-the-simulator-depends-on) lists them.
- The simulator picks story choices at random, so it does not show what a deliberate strategy earns. That is tracked in the economy epic.
