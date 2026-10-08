# Balance

The balance framework: what "balanced" means for this game, how to check it, and the current numbers.

## How to check

```
node simulate.js                     # 2,000 games per row, a few seconds
node simulate.js 500                 # quicker while iterating
node simulate.js 1000 --detail       # also cash and fans by week, and each story's effect
node simulate.js 1000 --stories=all  # compare story-choice strategies
node simulate.js 500 --seed=42       # the same results every run, to compare two versions exactly
node simulate.js 1000 --seasons=2    # play each game on into a second season, with its own table
```

The simulator plays every combination of three kinds of player and three starting backgrounds. It prints how often each ending happens, with the median fans and money at the end.

| Player | How it plays |
| --- | --- |
| Sensible | Keeps cash above ₦60,000, records when the vault is empty, releases every two weeks or more, mixes the other moves |
| Random | Taps any move it can afford |
| Lazy | Only posts and rehearses. Never earns from moves, never records |

`--stories` sets how they pick story choices:

| Strategy | How it picks |
| --- | --- |
| `random` (default) | Any choice it can afford |
| `money` | Tries each choice on a copy of the game and keeps the one that leaves the most cash |
| `purist` | Never signs a deal, protects street cred, then minds the money |

`--detail` adds two reports. The first is median cash and fans at the end of weeks 4, 8, 12, 16, 20 and 26, counting only games still running. Those are all rent weeks, so cash is measured just after rent. The second lists, for the sensible player, how often each story appears and the median end of games with and without it. Stories that need many fans (`visa`, `awards`) only appear in games that were already going well, so read that column with care.

## Targets

These are the design targets for the music career, with random story choices, for every starting background. Each target in `TARGETS` names its career, and rows in `balance-baseline.json` are keyed `career/player/background/strategy`, so a new career brings its own targets ([ADR 0008](adr/0008-careers-share-one-engine.md)). `node simulate.js --check` tests them on every pull request. The numbers live in `TARGETS` at the top of `simulate.js`. Change both places together, and say why in the pull request.

| Player | Target | Checked as |
| --- | --- | --- |
| Sensible | Usually Buzzing or Next rated | Buzzing + Next rated at least 90% |
| Sensible | Lagos star is rare | Lagos star at most 5% |
| Sensible | Almost never Sapa won | Sapa won at most 1% |
| Sensible | Money stays tight but out of debt: under ₦300,000 at the end of week 20, after rent. Agreed on 5 October 2026 ([#3](https://github.com/tiwadara/lagos-superstar/issues/3)) | Median cash at week 20 between −₦25,000 and ₦300,000. The ₦25,000 allows for noise |
| Random | Mostly Buzzing or Area champion | Buzzing + Area champion at least 60% |
| Random | Sometimes Sapa won | Sapa won between 2% and 25% |
| Lazy | Never Next rated or Lagos star | Next rated + Lagos star at most 0.5% |
| Lazy | Usually Sapa won or Area champion | Sapa won + Area champion at least 80% |

## The automatic balance check

`node simulate.js --check` takes about 2 to 3 minutes. It plays 2,000 games per row, for every career, with random story choices and with the money-chaser. The games with random story choices then play on into a second season. Then it:

1. Tests the targets above, and the [season 2 targets](#season-2).
2. Compares every row with `balance-baseline.json`. It fails if an ending moves more than 7 points, or median fans, median money or the sensible player's week 20 cash move more than 30%. Below a floor (2,000 fans, ₦100,000 money, ₦45,000 week 20 cash), small moves always pass. Season 2 rows skip median money, because about half of the sensible games headline December and are paid ₦8,000,000, so the median flips between runs; their week 20 cash is compared instead. Median money is not compared for a row where a quarter or more of games end in Sapa won, because its median flips between the debt and the positive games from run to run; that row's endings are still compared.

These limits come from measuring noise. On the unchanged game the check passed 12 runs out of 12. It fails when the investor or jingle payout is doubled, or the side hustle pays double. Smaller changes can stay within the noise. Removing the weekly cost of fame, for example, moves the sensible player's week 20 cash by ₦30,000 to ₦50,000, which the check does not reliably catch. So when you change numbers, still compare the full tables yourself.

When a change moves balance on purpose:

```
node simulate.js 4000 --save-baseline   # about a minute; 4,000 games per row keeps the baseline steady
```

Commit the new `balance-baseline.json`, update the tables below, and explain the change in the pull request.

## Current baseline

Seasons (#33, #34) do not change the first season: with the same seed it plays exactly as before. `balance-baseline.json` was saved again with 4,000 games per row to add the [season 2](#season-2) rows, so its season 1 rows moved only by noise. The tables below are season 1.

`node simulate.js 2000 --detail`, 8 October 2026, after relationships (#28, #29): characters remember how you treated them, and seven new stories react to it (four for music, two for the actor, and one city story for both careers). The new stories only appear once you have met the character, so they come up in 2 to 22% of games. Every ending stayed within about 4 points of the previous baseline (the replay variety changes, #23, #24, #25, #52), and median cash and fans within noise. The money-chaser's lazy actor from a theatre background is close to half Sapa won, so its median money swings across zero between runs: in the check it went from ₦593,001 to −₦173,864, with Sapa won up about 2 points.

| Player | Start | Lagos star | Next rated | Buzzing | Area champion | Upcoming artist | Sapa won | Median fans | Median money |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sensible | choir | 0.5% | 26.5% | 72.7% | 0.3% | 0.0% | 0.1% | 58,152 | ₦726,806 |
| Sensible | street | 0.3% | 21.9% | 77.6% | 0.1% | 0.0% | 0.1% | 48,455 | ₦684,052 |
| Sensible | island | 0.2% | 16.9% | 81.8% | 1.0% | 0.0% | 0.1% | 41,171 | ₦654,679 |
| Random | choir | 0.0% | 4.9% | 66.3% | 23.6% | 0.0% | 5.3% | 15,993 | ₦347,972 |
| Random | street | 0.0% | 4.4% | 71.2% | 20.4% | 0.0% | 4.0% | 18,197 | ₦386,215 |
| Random | island | 0.0% | 0.3% | 57.4% | 39.0% | 0.0% | 3.5% | 11,093 | ₦190,079 |
| Lazy | choir | 0.0% | 0.0% | 1.1% | 14.6% | 0.0% | 84.3% | 1,829 | −₦425,920 |
| Lazy | street | 0.0% | 0.0% | 1.7% | 15.4% | 0.0% | 83.0% | 2,142 | −₦422,760 |
| Lazy | island | 0.0% | 0.0% | 0.9% | 41.3% | 0.1% | 57.7% | 2,950 | −₦408,826 |

Median cash for the sensible player at the end of each week, after rent:

| Start | Week 4 | Week 8 | Week 12 | Week 16 | Week 20 | Week 26 |
| --- | --- | --- | --- | --- | --- | --- |
| choir | −₦51k | −₦37k | −₦30k | −₦17k | −₦1k | ₦200k |
| street | −₦43k | −₦37k | −₦29k | −₦23k | −₦7k | ₦181k |
| island | ₦62k | −₦35k | −₦36k | −₦27k | −₦15k | ₦160k |

The endings and money meet their targets. The replay variety changes before this moved endings more than 5 points on purpose. With more stories in the pool, the big fan stories (`feature`, `dance`, `skit`) come up less often, and deals now cost fans through their follow-ups. Next rated for the sensible player fell from 29 to 39% to 18 to 27%. Week 20 cash fell with fewer fans, so the weekly food, data and transport cost came down by ₦3,000 to keep the sensible player near zero rather than in debt. The stories that need many fans by mid-game are rarer than before: `visa` 7% of games, `awards` 22%, `brand` 19%, `label` 31%.

A sensible music player now sees a median of 20 of the 43 stories in `EVENTS` open to music (47%), down from 20 of 38 before relationships. The simulator prints this line on every run.

## Nollywood actor

The actor (#42) has the same targets as music for now. `node simulate.js 2000 --detail --career=actor`, 8 October 2026, after relationships (#28, #29):

| Player | Start | Nollywood star | Leading actor | Familiar face | Skit regular | Extra | Sapa won | Median fans | Median money |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sensible | drama | 0.2% | 28.7% | 71.0% | 0.0% | 0.0% | 0.0% | 66,062 | ₦844,058 |
| Sensible | skits | 0.4% | 32.3% | 67.2% | 0.0% | 0.0% | 0.1% | 69,047 | ₦859,287 |
| Sensible | theatre | 0.2% | 28.0% | 71.8% | 0.1% | 0.0% | 0.0% | 64,072 | ₦841,555 |
| Random | drama | 0.0% | 2.0% | 59.4% | 28.1% | 0.0% | 10.6% | 12,828 | ₦228,239 |
| Random | skits | 0.0% | 1.7% | 68.1% | 24.5% | 0.0% | 5.7% | 14,719 | ₦232,922 |
| Random | theatre | 0.0% | 0.9% | 66.3% | 29.0% | 0.0% | 3.8% | 13,530 | ₦229,439 |
| Lazy | drama | 0.0% | 0.0% | 0.3% | 2.8% | 0.0% | 97.0% | 1,155 | −₦434,437 |
| Lazy | skits | 0.0% | 0.0% | 0.3% | 3.6% | 0.0% | 96.2% | 1,398 | −₦426,689 |
| Lazy | theatre | 0.0% | 0.0% | 0.1% | 11.6% | 0.0% | 88.3% | 1,700 | −₦436,154 |

Median cash for the sensible actor at the end of week 20 is ₦49k to ₦56k, a little above music's, because actors have fewer deal follow-ups that cost money. A sensible actor sees a median of 20 of the 38 stories open to actors (53%).

The actor's money is tuned so it plays like music: auditions cost ₦30,000, role fees run from ₦8,000 to ₦200,000 by fame, and streaming licences pay half what music streams would. With role fees of ₦20,000 to ₦500,000 and ₦15,000 auditions, the sensible actor reached Leading actor 71% of the time.

The money-chaser leads here as it does in music (#52): 78 to 82% Leading actor or better against 26 to 33% with random choices. The actor purist does better than in music (42 to 48%), because actor stories have fewer deals to refuse.

## Season 2

Seasons ([ADR 0010](adr/0010-seasons-carry-over.md)) let a game play on after December. `node simulate.js --seasons=2` plays every game on into a second season and prints its results in a separate table; `--check` and `--save-baseline` always do, with random story choices. A game that ended in Sapa won in season 1 is still Sapa won in season 2. Baseline rows for season 2 are keyed `s2/career/player/background/strategy`; season 1 rows keep their keys.

Without a limit, the second season ran away: the sensible player started it with about 45,000 fans, and because releases and many stories add a share of current fans, it ended with hundreds of millions of fans and over ₦1 billion. So from the second season every fan gain is scaled by `REACH ÷ (REACH + fans)`, with `REACH` at 50,000 ([architecture](architecture.md#seasons)). With `REACH` at 100,000 the sensible player still reached Lagos star 30 to 50% of the time, with ₦5 million in cash. The first season never uses it, and plays exactly as before.

### Targets

The thresholds do not change between seasons, so a good first year should make the second one better, not just repeat it. Lagos star stays the goal that is still out of reach. Money should still matter: a promo at the top venue costs ₦900,000.

| Player | Target | Checked as |
| --- | --- | --- |
| Sensible | Holds or improves its tier almost always | Same tier or better than season 1, of games that finished season 1 on a tier, at least 90% |
| Sensible | Usually climbs to Next rated | Next rated + Lagos star at least 85% |
| Sensible | Lagos star is still rare | Lagos star at most 10% |
| Sensible | Almost never Sapa won | Sapa won at most 2%, counting games that ended in season 1 |
| Sensible | Money matters: some cash at week 20, but less than two top promos | Median cash at week 20 of season 2 between ₦0 and ₦1,500,000 |
| Random | Mostly Buzzing or Next rated | Buzzing + Next rated at least 75% |
| Random | Sometimes Sapa won | Sapa won between 2% and 25% |
| Lazy | Never Next rated or Lagos star | Next rated + Lagos star at most 0.5% |
| Lazy | Still fails | Sapa won at least 75% |

### Numbers

`node simulate.js 4000 --save-baseline --detail`, 8 October 2026, season 2 rows. "Held" is the share of games that ended season 1 on a tier and end season 2 on the same tier or better.

| Career | Player | Start | Lagos star | Next rated | Buzzing | Area champion | Sapa won | Median fans | Median money | Held |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Music | Sensible | choir | 4.0% | 95.7% | 0.1% | 0.0% | 0.3% | 497,969 | ₦3,148,072 | 99.8% |
| Music | Sensible | street | 3.8% | 96.0% | 0.1% | 0.0% | 0.1% | 490,865 | ₦3,039,067 | 99.9% |
| Music | Sensible | island | 1.6% | 97.7% | 0.3% | 0.0% | 0.4% | 431,998 | ₦2,970,892 | 99.6% |
| Music | Random | choir | 0.1% | 79.1% | 13.0% | 0.0% | 7.9% | 203,994 | ₦3,019,913 | 98.0% |
| Music | Random | street | 0.0% | 85.8% | 9.5% | 0.0% | 4.7% | 224,008 | ₦3,536,863 | 98.5% |
| Music | Random | island | 0.0% | 71.9% | 21.6% | 0.0% | 6.6% | 155,623 | ₦2,276,137 | 97.5% |
| Music | Lazy | choir | 0.0% | 0.0% | 6.1% | 0.3% | 93.5% | 1,913 | −₦432,373 | 38.9% |
| Music | Lazy | street | 0.0% | 0.0% | 6.4% | 0.2% | 93.3% | 2,102 | −₦429,776 | 40.0% |
| Music | Lazy | island | 0.0% | 0.0% | 15.0% | 2.1% | 82.9% | 3,349 | −₦429,717 | 40.4% |
| Actor | Sensible | drama | 2.3% | 97.7% | 0.0% | 0.0% | 0.0% | 494,962 | ₦6,706,661 | 100.0% |
| Actor | Sensible | skits | 3.3% | 96.7% | 0.0% | 0.0% | 0.0% | 535,409 | ₦8,243,099 | 100.0% |
| Actor | Sensible | theatre | 2.6% | 97.4% | 0.0% | 0.0% | 0.0% | 504,253 | ₦5,028,354 | 100.0% |
| Actor | Random | drama | 0.0% | 68.3% | 20.6% | 0.0% | 11.1% | 155,074 | ₦2,331,714 | 98.6% |
| Actor | Random | skits | 0.0% | 78.0% | 15.0% | 0.0% | 7.0% | 183,723 | ₦2,849,075 | 99.0% |
| Actor | Random | theatre | 0.0% | 76.5% | 19.1% | 0.0% | 4.3% | 167,544 | ₦2,592,329 | 99.1% |
| Actor | Lazy | drama | 0.0% | 0.0% | 0.2% | 0.0% | 99.8% | 1,190 | −₦434,667 | 8.2% |
| Actor | Lazy | skits | 0.0% | 0.0% | 0.2% | 0.0% | 99.8% | 1,402 | −₦428,340 | 7.4% |
| Actor | Lazy | theatre | 0.0% | 0.0% | 0.6% | 0.3% | 99.2% | 1,660 | −₦439,641 | 7.0% |

No row reaches Upcoming artist in season 2. Median cash for the sensible player in season 2, after rent:

| Career | Start | Week 4 | Week 8 | Week 12 | Week 16 | Week 20 | Week 26 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Music | choir | ₦188k | ₦287k | ₦496k | ₦635k | ₦800k | ₦1.1m |
| Music | street | ₦171k | ₦254k | ₦433k | ₦600k | ₦769k | ₦1.1m |
| Music | island | ₦139k | ₦213k | ₦355k | ₦532k | ₦682k | ₦1.0m |
| Actor | drama | ₦197k | ₦282k | ₦431k | ₦576k | ₦662k | ₦949k |
| Actor | skits | ₦209k | ₦299k | ₦476k | ₦613k | ₦700k | ₦988k |
| Actor | theatre | ₦217k | ₦294k | ₦469k | ₦588k | ₦677k | ₦965k |

The median money at the end is much higher than at week 26 because a headline December booking pays ₦8,000,000, before any cuts. Season 2 is easier than season 1 for every player who did not end in debt, which is the point of carrying a career over, but it is close to a sure thing for the sensible player: nearly every one ends Next rated. Season 3 is not checked yet; at these numbers it would start with about 400,000 fans and plenty of cash, so a third season will need its own look.

## Known problems

**Taking every bag is still the best strategy** (#52). With `node simulate.js 1000 --stories=all`, the money-chaser reaches Next rated or Lagos star 50 to 68% of the time, against 18 to 25% with random choices and 13 to 22% for the purist. Before this change it was 79 to 89%, against 29 to 39% and 19 to 27%, so the gap narrowed from about 50 points to about 40, short of the 15 the issue asks for.

Measured with a diagnostic money-chaser that takes its usual choice on some stories and a random one elsewhere:

- No single story explains the gap. Letting the money-chaser decide only one story at a time moves its result by under 2 points.
- The four big bags (`jingle`, `investor`, `label`, `brand`) on their own were worth about 13 points before this change, and about 3 points after the new fan costs.
- Most of the gap is compounding. Cash keeps the sensible player out of side hustles (about 17 a game against 24), so it rehearses and records more. Better songs earn more fans per release, and each release adds a share of current fans, so a small early lead grows through the game. Releases account for most of the fan difference, with the same number of releases.
- Rules tried in a scratch copy and not adopted: promo that weakens when bought two weeks running, promo that adds less hype when hype is already high, street cred counting more in releases, deals costing a move, a weekly tax on cash above ₦500,000, and a release formula that compounds less. Each one shrank the gap in proportion but kept the money-chaser at about 2 to 3 times the others, and most of them lowered every player's results.

Closing the gap to 15 points needs a decision about the economy as a whole, not more story costs. #52 stays open for it.
