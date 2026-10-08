# The Next Lagos Star

A life simulation of the Lagos entertainment industry. You arrive with a one-room in Yaba, a cracked phone and a voice, and you have 26 weeks to get on a Detty December stage.

This is a playable prototype with two careers: the music artist and the Nollywood actor. All characters, companies and events are fictional.

## Play it

Play online at https://next-lagos-star.netlify.app.

To play locally, open `index.html` in a browser. There is nothing to install or build.

The site is hosted on Netlify, which serves the repo root as it is, with no build command. Once the Netlify project is linked to this repo, every push to `main` goes live.

Progress is saved in the browser's local storage, so each player's game stays on their own device.

Players can send playtest feedback from the end screen or the "Send feedback" link during a game. Submissions arrive in Netlify under the project's Forms tab. See [docs/architecture.md](docs/architecture.md#player-feedback).

## How a game goes

- Each week you get 3 moves: rehearse, record, release, post content, play a show, show face on the Island, side hustle, or buy promo.
- When you end the week, a story usually happens and you choose how to handle it. Some choices come back weeks later.
- Streams pay in, food and transport go out, hype cools, and rent is due every fourth week.
- After week 26 you get a December show and one of five endings, from "Upcoming artist" to "Lagos star". Run more than ₦400,000 into debt and the game ends early.

| Stat | What it does |
| --- | --- |
| Skill | Makes better songs |
| Hype | Makes a release travel. Fades every week |
| Street cred | Helps releases spread and opens doors on the mainland |
| Links | Helps releases spread and opens doors on the Island |

## What is in the repo

| File | What it is |
| --- | --- |
| `index.html` | The whole game: styles, content, rules and interface in one file |
| `simulate.js` | Plays thousands of games without a browser, to check balance |
| `lint-stories.js` | Checks every story card for mistakes. Runs on every pull request with the simulator |
| `test-saves.js` | Checks that saves from older versions of the game still load and play on. Runs on every pull request |
| `balance-baseline.json` | The simulator's saved results, which `node simulate.js --check` compares against |
| `README.md` | This file |
| `docs/` | Game design, story-writing guide, balance, architecture, roadmap and decision records. Start at [docs/README.md](docs/README.md) |
| `CONTRIBUTING.md` | How work is planned on GitHub and how a change reaches the live game |
| `CLAUDE.md` | A short guide for AI coding agents working in this repo |
| `.claude/skills/write-story/` | A Claude skill for writing stories, with `try-story.js` to run every choice of a story |
| `.github/` | Issue templates (bug, story idea, task, epic), the pull request template, and the Check workflow that runs on every pull request |

The script inside `index.html` is laid out in this order:

1. Helpers: random numbers and money formatting
2. Content: starting backgrounds, fan tiers, bus slogans, song titles
3. Money and checks: `takeHome` (who takes a cut), `chk` (stat checks), `apply` (applies effects)
4. Weekly moves: the `ACTIONS` list
5. Stories: `EVENTS`, `FOLLOWUPS` and the `DECEMBER` booking
6. End of week: `wrapWeek`
7. Endings: `finale` and `debtEnding`
8. Interface: everything inside `if (typeof document !== 'undefined')`

Parts 1 to 7 never touch the page, which is why `simulate.js` can run them in Node.

## Adding a story

Stories are not a decision tree. Each one is a self-contained card in the `EVENTS` list, and the game draws one that fits the player's situation. To add a story, add a card:

```js
{ id: 'pastor',                        // unique, each story appears once per game
  title: 'Sunday special',
  who: 'Your old choir director',
  when: s => s.week >= 4 && s.fans >= 500,   // when this story may appear
  text: 'He wants you back for the Christmas cantata.',
  choices: [
    { label: 'Sing at the cantata',
      hint: 'Costs you a day.',
      run: s => ({
        text: 'Your mother cries in the front row.',
        fx: { cred: 3, energyNext: -1 }
      }) },
    { label: 'Send a donation instead',
      cost: 20000,                     // taken automatically, option locks if the player is broke
      run: s => ({ text: 'He announces the amount from the pulpit.' }) }
  ] }
```

Effects you can put in `fx`:

| Key | Meaning |
| --- | --- |
| `money` | Add or remove cash directly |
| `earn` | Music income. The label, manager and investor take their cuts first |
| `fans` | Add a fixed number of fans |
| `fansUp: [min, share]` | Add `share` of current fans, but at least `min` |
| `fansPct` | Add or remove a share of current fans. Can be negative |
| `skill`, `hype`, `cred`, `links` | Add or remove points. Each stat stays between 0 and 100 |
| `energyNext: -1` | One fewer move next week |
| `rent` | Change the monthly rent |
| `flag: { name: value }` | Remember something for later stories |
| `note` | Extra line shown to the player |

Two optional fields change how often a story is drawn:

| Field | Meaning |
| --- | --- |
| `weight` | How likely the story is, against the others that fit. Defaults to 1. `2` comes up twice as often, `0.5` half as often |
| `group` | A name shared by stories that exclude each other. Once one has appeared, the rest of its group never does in that game |

A story that only makes sense in one career gets `careers: ['music']`. Untagged stories are city stories that every career can draw.

To make a choice depend on a stat, use `chk(s, 'links', 30)` inside `run` and `odds(s, 'links', 30)` as the hint, so the player sees their chances.

To make a choice come back later, set a flag with the current week, then add a card to `FOLLOWUPS` that waits for it:

```js
// in the first story
fx: { flag: { pastor: s.week } }

// in FOLLOWUPS
when: s => s.flags.pastor && s.week >= s.flags.pastor + 3
```

## Checking balance

After adding or changing stories, run:

```
node simulate.js
```

It plays 2,000 games for each kind of player (sensible, random, lazy) from each starting background and prints how often each ending happens. With the current numbers a sensible player usually ends at "Buzzing" or "Next rated", and "Lagos star" is rare. If a new story makes one ending far more common, its rewards are probably too large.

Run `node simulate.js --check` to test the balance targets and compare with the saved baseline in `balance-baseline.json`. The same check runs on every pull request.

Pass a number to change how many games are played, for example `node simulate.js 5000`. Add `--seasons=2` to play each game on into a second season and see those results in a table of their own. Add `--detail` to see cash and fans week by week and how much each story moves a game, or `--stories=all` to compare players who pick story choices at random, for the most cash, or to stay clean. [docs/balance.md](docs/balance.md) has the targets and the current numbers.

## Ideas for what comes next

- A daily story that every player gets on the same day
- More careers that share the same city and cast: actor, skit-maker, DJ, producer, video director, colourist, manager, label boss, investor, politician, club owner
- Recurring characters with a face and a memory of how you treated them
- Stories moved out of the code into a data file, so they can be written without touching the game rules
