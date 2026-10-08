# The Next Lagos Star

A life simulation of the Lagos entertainment industry. You arrive with a one-room in Yaba, a cracked phone and a voice, and you have 26 weeks to get on a Detty December stage.

This is a playable prototype with two careers: the music artist and the Nollywood actor. All characters, companies and events are fictional.

## Play it

Play online at https://next-lagos-star.netlify.app.

To play locally, open `index.html` in a browser. It loads `stories.js` from the same folder. There is nothing to install or build.

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
| `index.html` | The game: styles, content, rules and interface |
| `stories.js` | Every story card and the cast. Writers add stories here. `index.html` loads it |
| `load-game.js` | Loads `index.html` and `stories.js` into Node for the tools below |
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

`stories.js` runs first and only defines the cards: `CAST`, `EVENTS`, `FOLLOWUPS`, music's `DECEMBER` booking and the actor's `PREMIERES`. The script inside `index.html` then runs in this order:

1. Helpers: random numbers and money formatting
2. Content: fan tiers, bus slogans, song and film titles
3. Money and checks: `takeHome` (who takes a cut), `chk` (stat checks), `apply` (applies effects)
4. Weekly moves: the `ACTIONS` list
5. Stories: `pickEvent` and `choose`, which pick a card and apply the chosen result
6. End of week: `wrapWeek`
7. Careers: `CAREERS`, with each career's backgrounds, moves, venues and December
8. Endings, seasons and saves: `finale`, `debtEnding`, `newSeason`, `migrate`
9. Interface: everything inside `if (typeof document !== 'undefined')`

`stories.js` and parts 1 to 8 never touch the page, which is why `simulate.js` can run them in Node. [docs/architecture.md](docs/architecture.md) has the full map.

## Adding a story

Stories are not a decision tree. Each one is a self-contained card, and every week the game draws one that fits the player's situation. All the cards live in `stories.js`, apart from the rules, so you can add one without reading the game code:

| List in `stories.js` | What goes there |
| --- | --- |
| `CAST` | Every recurring character. Add a new one here before a story uses them |
| `EVENTS` | Stories the game draws at random each week |
| `FOLLOWUPS` | Stories that come back weeks later, after a choice set a flag |
| `DECEMBER`, `PREMIERES` | The week-22 December booking, for music and for the actor |

To add a story, copy the template at the top of `stories.js` into `EVENTS` and change it. A finished card looks like this:

```js
  {id:'pastor',careers:['music'],cast:'mum',title:'Sunday special',who:'Your old choir director',when:s=>s.week>=4&&s.fans>=500,
    text:'He wants you back for the Christmas cantata. “Your mother has already told the whole church.”',
    choices:[
      {label:'Sing at the cantata',hint:'Free. Costs you a day.',run:()=>({text:'Your mother cries in the front row. The choir director pretends not to.',fx:{cred:3,energyNext:-1,rel:{mum:2}}})},
      {label:'Send a donation instead',cost:20000,hint:'₦20,000. He will announce it.',run:()=>({text:'He announces the amount from the pulpit, twice, slowly.',fx:{links:2}})},
      {label:'Ask to lead a song',hint:s=>odds(s,'skill',40),run:s=>chk(s,'skill',40)
        ?{text:'You take the second verse up a key. Three aunties stand. One of them owns a radio station.',fx:{fansUp:[150,0.05],hype:8}}
        :{text:'You take the second verse up a key and stay there alone.',fx:{hype:-3,cred:-1}}}
    ]},
```

| Field | What it does |
| --- | --- |
| `id` | Unique. Each story appears once per season |
| `careers` | Optional. `['music']` or `['actor']` for a story that belongs to one career. Leave it out for a city story every career can draw, and word it for each with `by(s, {music: '…', actor: '…'})` |
| `cast` | Optional. The `CAST` id of the character in the story, or a list of ids |
| `title`, `who` | The headline, and who is talking or where we are |
| `when` | When the story may appear. Always give a minimum week |
| `text` | The situation, ending on the decision. `{n}` shows the player's stage name |
| `choices` | Two or three. Each has a `label`, an optional `cost` (taken automatically; the choice locks if the player cannot pay), a `hint`, and a `run` that returns `{ text, fx }` |

`title`, `who`, `text` and `choices` can be plain values, or functions of `s`, the game state, when they change with the player.

Check a new card with `node .claude/skills/write-story/try-story.js pastor`, which runs every choice, and `node lint-stories.js`, which checks every card. [docs/story-writing-guide.md](docs/story-writing-guide.md) has the voice, the rules for choices and the checklist.

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
| `rel: { kobo: -3 }` | Change how a `CAST` character feels about you. Each stays between −10 and 10, starts at 0, and the player sees “Lil Kobo will hold that against you” (or “… will remember that kindly” for a positive change) |
| `note` | Extra line shown to the player |

More optional fields change when and how often a story is drawn:

| Field | Meaning |
| --- | --- |
| `weight` | How likely the story is, against the others that fit. Defaults to 1. `2` comes up twice as often, `0.5` half as often |
| `group` | A name shared by stories that exclude each other. Once one has appeared, the rest of its group never does in that season |
| `once: 'career'` | The story happens once per career instead of once per season. Needed on a story that sets a flag a follow-up waits for |
| `fromSeason` | The first season the story can appear in, such as `2` for a story about last year |

To make a choice depend on a stat, use `chk(s, 'links', 30)` inside `run` and `odds(s, 'links', 30)` as the hint, so the player sees their chances.

To make a choice come back later, set a flag with the current week, then add a card to `FOLLOWUPS` that waits for it:

```js
// in the first story
fx: { flag: { pastor: s.week } }

// in FOLLOWUPS
when: s => s.flags.pastor && s.week >= s.flags.pastor + 3
```

To make a story react to how the player treated someone, read `rel(s, 'kobo')` in `when`, `text` or `choices`. It returns a number from −10 to 10, and 0 for anyone the player has not met:

```js
text: s => rel(s, 'kobo') >= 2 ? 'He sends an olive branch.' : 'He drops a diss track.'
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
