# Architecture

How The Next Lagos Star is built, how a week runs through the code, and what can break if you change it.

## The short version

- The whole game is one file, `index.html`: styles, content, rules and interface. There is no framework, no build step and no dependencies apart from two Google Fonts. See [ADR 0002](adr/0002-single-html-file-no-framework.md).
- Netlify serves the repo root as a static site. Every push to `main` goes live. See [ADR 0003](adr/0003-static-hosting-on-netlify.md).
- Each player's game is saved in their own browser's `localStorage`. There is no server. See [ADR 0004](adr/0004-saves-in-local-storage.md).
- `simulate.js` loads the same script out of `index.html` and plays thousands of games in Node to check balance. See [ADR 0006](adr/0006-headless-simulator-for-balance.md).

## Layout of the script

The `<script>` block in `index.html` runs top to bottom in this order.

| Part | What is in it | Touches the page? |
| --- | --- | --- |
| Helpers | `TOTAL_WEEKS`, `SAVE_KEY`, the random helpers `R`, `clamp`, `val`, money and fan formatting | No |
| Content | `BACKGROUNDS`, `TIERS`, `SLOGANS`, `OPENERS`, `SONG_TITLES`, `STAGE_NAMES`, `songTitle`, `qWord` | No |
| Money and checks | `takeHome` (who takes a cut), `chk` and `odds` (stat checks), `apply` (applies effects) | No |
| Weekly moves | `venue`, the `ACTIONS` list, `actionState`, `doAction` | No |
| Stories | `EVENTS`, `FOLLOWUPS`, `DECEMBER`, `pickEvent`, `choiceState`, `choose` | No |
| End of week | `wrapWeek` | No |
| Endings | `tally`, `debtEnding`, `finale`, `newGame` | No |
| Interface | everything inside `if (typeof document !== 'undefined')` | Yes |

Everything above the interface block must stay free of `document`, `window` and `localStorage`. That rule is what lets `simulate.js` run the rules in Node.

## Game state

`newGame(name, backgroundId)` returns one plain object. Everything about a game lives in it, and it is saved to `localStorage` as JSON after every change.

| Field | Meaning |
| --- | --- |
| `v` | Save format version. Currently `1` |
| `name`, `bg` | Stage name and starting background id |
| `week` | Current week, 1 to 26. Becomes 27 after the last `wrapWeek` |
| `energy`, `energyNext` | Moves left this week, and the change to next week's moves |
| `money`, `fans` | Cash in naira (can go negative) and fan count |
| `skill`, `hype`, `cred`, `links` | Stats from 0 to 100 |
| `rent` | Rent due every fourth week. Starts at ₦100,000 |
| `vault`, `songs` | Recorded songs not yet out, and released songs. Each is `{ title, q }`, released ones also have `week` |
| `flags` | Anything a story needs to remember, such as `manager`, `investor`, `signed`, `jingle`, `dec` |
| `seen` | Ids of stories already shown. Each story appears once per game |
| `promoWeek`, `lastRelease`, `recoup` | Promo limiter, release fatigue, and the label advance still to pay back |
| `log`, `opener`, `slogan` | Text shown on the game screen this week |
| `over` | `null` while playing, then the ending object from `finale` or `debtEnding` |

Changing the shape of this object can break saved games. If a change is not backwards compatible, bump `v` and either migrate old saves or let `load()` ignore them. `load()` currently ignores anything where `v !== 1`.

## How a week runs

```mermaid
flowchart TD
  A[Week starts: 3 moves, plus energyNext] --> B[Player taps moves: doAction]
  B --> B
  B --> C[Player taps End week]
  C --> D{pickEvent}
  D -- week 22 --> E[DECEMBER booking]
  D -- a follow-up is due --> F[First due FOLLOWUP]
  D -- always in week 1, then 85% chance, if any fit --> G[Weighted random EVENT, one per group]
  D -- otherwise --> H[Quiet week]
  E & F & G --> I[Player picks a choice: choose]
  I --> J[wrapWeek]
  H --> J
  J --> K{Over?}
  K -- debt past ₦400,000 --> L[debtEnding: Sapa won]
  K -- week > 26 --> M[finale: December show and ending tier]
  K -- no --> A
```

`wrapWeek` does the weekly bookkeeping in this order:

1. Stream income from `streamGross`: `fans × 1.5 × min(1, w ÷ 3)`, where `w` adds up each released song's weight `max(0.1, 0.9 ^ weeks since release) × (0.5 + quality ÷ 100)`. Paid through `takeHome`.
2. Food, data and transport: −₦12,000.
3. Your people: `PEOPLE_COST` by tier, from ₦15,000 a week at Buzzing.
4. Rent on every fourth week.
5. Aunty Bisi adds 2 links a week if she manages you.
6. Hype cools: `round(hype × 0.8 − 2)`.
7. If cash is below zero: 10% interest on the debt, −3 street cred, −2 links.
8. Next week: moves reset to `max(1, 3 + energyNext)`, new opener and slogan.
9. Cash below −₦400,000 ends the game with `debtEnding`.

## Who takes a cut

`takeHome(s, gross)` is applied to all music income (`earn` effects and streams). It takes cuts in this order:

1. Gbedu Empire, bad contract (`flags.signed`): pays back the advance (`recoup`) first, then keeps 70%.
2. Gbedu Empire, negotiated contract (`flags.signedGood`): keeps 20%.
3. Aunty Bisi, manager (`flags.manager`): keeps 20%.
4. Chad, investor (`flags.investor`): keeps 30%.

`money` effects skip `takeHome`. Use `earn` for music income and `money` for anything else.

## Stat checks

`chk(s, stat, need)` passes when `stat + (8 if managed) + a random number from −6 to 6 ≥ need`. `odds(s, stat, need)` writes the hint the player sees: "Should work." when the gap is 6 or more, "Could go either way." within 6, and "Long shot." below that.

## Interface

The interface keeps a small `ui` object (`screen`, `sheet`, `prev`, `fresh`, `confirmRestart`) and redraws with `innerHTML` on every change. There are three screens (title, game, end) and one bottom sheet (`#sheet`) that shows a story, then the result and the end-of-week summary. Clicks are handled in one listener on `document` using `data-act`, `data-choice` and `data-cmd` attributes.

## What the simulator depends on

`simulate.js` extracts the first `<script>…</script>` block with a regex and evaluates it with `new Function`, then reads these names:

`newGame`, `doAction`, `actionState`, `pickEvent`, `choose`, `choiceState`, `wrapWeek`, `finale`, `val`, `R`, `ACTIONS`, `BACKGROUNDS`, `TOTAL_WEEKS`

Renaming any of them, adding a `<script>` block before the game script, or using the page above the interface block will break the simulator. Run `node simulate.js 200` after any change to the rules.

`lint-stories.js` loads the script the same way and reads `newGame`, `val`, `EVENTS`, `FOLLOWUPS`, `DECEMBER`, `STAGE_NAMES` and `BACKGROUNDS`. Both run on every pull request in `.github/workflows/check.yml`.

## Deploys

| Event | Result |
| --- | --- |
| Push or merge to `main` | Netlify deploys to https://next-lagos-star.netlify.app in a few seconds |
| Pull request | Netlify builds a deploy preview, if previews are on for the project |

Netlify publishes the whole repo root, so `README.md`, `simulate.js` and `docs/` are public too. The repo is public, so nothing secret is exposed, but see the tooling epic for tidying this.
