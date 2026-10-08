# 0010. A season ends in December and the career carries on

- **Status:** Accepted
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

### How it was built (#33, #34)

Where the table left a choice open, the simplest option was taken:

- **Fans** drop to 80% at once, when the new season starts, and the opening line says how many drifted away.
- **Weeks.** Flags, songs and `lastRelease` store week numbers. They move back 27 weeks, so the January break counts as one week. A deal's follow-up that was due after December arrives early in the new year, and songs keep fading from where they were.
- **Seen stories.** Follow-ups happen once per career. So does every story that starts a follow-up, plus the moving-day stories and the deal offers. The linter makes any story that starts a follow-up carry `once: 'career'`. The December booking resets.
- **Relationships** (`rel`, #28) carry over unchanged, like flags: people remember you across years. A version 1 save without `rel` gets an empty one.
- **January** has its own opening line and bus slogans, from each career's `year` entry in `CAREERS`.
- **New stories.** `fromSeason: 2` keeps a story out of the first year. Three are written: a city story (`harvest`), one for music (`samesound`) and one for the actor (`typecast`).
- **Growth levels off.** With thresholds unchanged, the second year starts where the first one ended, and fans and money compound: without a limit, the sensible player ended season 2 with hundreds of millions of fans. From the second season every fan gain is scaled by `50,000 ÷ (50,000 + fans)`. The first season is untouched.
- **Retiring.** "Play again" ends the career. The end screen lists every season so far, which is the career summary.

## Consequences

- The save format needs a version 2 with a migration (#33). A version 1 save becomes season 1.
- The economy has to hold over several seasons. The simulator plays two seasons back to back, and season 2 gets its own targets (#34).
- Story writers can plan arcs that span years.
