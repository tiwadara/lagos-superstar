# 0005. Stories are independent cards, not a decision tree

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

The game's events are its main content, and there will be many more of them, written by several people. A branching decision tree grows too fast to write and test, and every new branch has to fit the ones around it.

## Decision

We will write each story as a self-contained card with a `when` condition. At the end of each week the game shows the December booking in week 22, otherwise the first follow-up that is due, otherwise, in most weeks, a random card whose condition fits. The exact odds are a tuning detail, documented in [architecture.md](../architecture.md#how-a-week-runs). Each card appears once per game. Consequences that come back later use flags and follow-up cards.

## Consequences

- A writer can add a story without reading the others, as long as its condition and flags make sense.
- Order is emergent, so two stories can clash in tone or logic in the same game. Conditions and flags are the tool for preventing that.
- With about 24 stories and about 20 story weeks, a player sees most of them every game. Replay variety needs more cards, not more branches.
