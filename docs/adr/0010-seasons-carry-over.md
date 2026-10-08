# 0010. A season ends in December and the career carries on

- **Status:** Proposed
- **Date:** 2026-10-08
- **Issue:** #32

## Context

Every game ends after 26 weeks. Deals take their cut "forever", but the player never lives with them for long. Seasons (#31) make December a yearly finale. A comparable game uses a calendar in years, which supports this.

## Decision

At the end of each December, the player sees their season result and can start the next season with the same career.

| State | Next season |
| --- | --- |
| Fans | 80% carry over. Fans drift away over January |
| Money and debt | As they are. SapaLoan doesn't forgive |
| Skill, street cred, links | Stay |
| Hype | Resets to 0 |
| Deals and `recoup` | Stay. This is the point of seasons |
| Released songs | Stay, and keep earning through the existing stream fade |
| Vault | Stays |
| Seen stories | Reset, except stories that can happen only once per career (offers already taken or refused). A `once: 'career'` field marks those |
| Flags | Stay. Follow-ups can now span seasons |
| Rent | Stays, including any increase |
| Season length | 26 weeks, ending in a December booking as now |
| Tier thresholds | Unchanged. The season result names the tier reached that year |

The game still ends early on "Sapa won". The player can also retire, which shows a career summary across all seasons.

## Consequences

- The save format needs a version 2 with a migration (#33). A version 1 save becomes season 1.
- The economy has to hold over several seasons. The simulator plays two seasons back to back, and season 2 gets its own targets (#34).
- Story writers can plan arcs that span years.
