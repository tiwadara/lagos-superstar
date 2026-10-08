# Balance

The balance framework: what "balanced" means for this game, how to check it, and the current numbers.

## How to check

```
node simulate.js                     # 2,000 games per row, a few seconds
node simulate.js 500                 # quicker while iterating
node simulate.js 1000 --detail       # also cash and fans by week, and each story's effect
node simulate.js 1000 --stories=all  # compare story-choice strategies
node simulate.js 500 --seed=42       # the same results every run, to compare two versions exactly
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

`node simulate.js --check` takes about 2 minutes. It plays 2,000 games per row, for every career, with random story choices and with the money-chaser, then:

1. Tests the targets above.
2. Compares every row with `balance-baseline.json`. It fails if an ending moves more than 7 points, or median fans, median money or the sensible player's week 20 cash move more than 30%. Below a floor (2,000 fans, ₦100,000 money, ₦45,000 week 20 cash), small moves always pass.

These limits come from measuring noise. On the unchanged game the check passed 12 runs out of 12. It fails when the investor or jingle payout is doubled, or the side hustle pays double. Smaller changes can stay within the noise. Removing the weekly cost of fame, for example, moves the sensible player's week 20 cash by ₦30,000 to ₦50,000, which the check does not reliably catch. So when you change numbers, still compare the full tables yourself.

When a change moves balance on purpose:

```
node simulate.js 4000 --save-baseline   # about a minute; 4,000 games per row keeps the baseline steady
```

Commit the new `balance-baseline.json`, update the tables below, and explain the change in the pull request.

## Current baseline

`node simulate.js 2000 --detail`, 8 October 2026, after the replay variety changes (#23, #24, #25, #52): 12 new stories, 9 new follow-ups, weighted and grouped story draws, fan costs on deals, and food, data and transport down from ₦15,000 to ₦12,000 a week.

| Player | Start | Lagos star | Next rated | Buzzing | Area champion | Upcoming artist | Sapa won | Median fans | Median money |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sensible | choir | 0.6% | 27.0% | 72.2% | 0.1% | 0.0% | 0.2% | 57,692 | ₦722,789 |
| Sensible | street | 0.3% | 21.8% | 77.5% | 0.4% | 0.0% | 0.0% | 51,192 | ₦699,827 |
| Sensible | island | 0.2% | 18.1% | 80.3% | 1.2% | 0.0% | 0.1% | 43,883 | ₦670,064 |
| Random | choir | 0.1% | 5.1% | 64.7% | 23.8% | 0.0% | 6.5% | 15,749 | ₦362,421 |
| Random | street | 0.0% | 5.4% | 72.3% | 19.4% | 0.0% | 3.0% | 17,805 | ₦413,507 |
| Random | island | 0.0% | 0.8% | 55.7% | 40.3% | 0.0% | 3.3% | 11,050 | ₦219,279 |
| Lazy | choir | 0.0% | 0.0% | 1.1% | 18.4% | 0.0% | 80.5% | 1,946 | −₦425,836 |
| Lazy | street | 0.0% | 0.0% | 1.6% | 15.8% | 0.0% | 82.6% | 2,101 | −₦421,905 |
| Lazy | island | 0.0% | 0.0% | 0.6% | 44.4% | 0.1% | 54.9% | 2,964 | −₦406,560 |

Median cash for the sensible player at the end of each week, after rent:

| Start | Week 4 | Week 8 | Week 12 | Week 16 | Week 20 | Week 26 |
| --- | --- | --- | --- | --- | --- | --- |
| choir | −₦54k | −₦36k | −₦28k | −₦18k | ₦9k | ₦216k |
| street | −₦40k | −₦38k | −₦29k | −₦21k | −₦7k | ₦177k |
| island | ₦64k | −₦37k | −₦32k | −₦24k | −₦7k | ₦171k |

The endings and money meet their targets. This change moved endings more than 5 points on purpose. With more stories in the pool, the big fan stories (`feature`, `dance`, `skit`) come up less often, and deals now cost fans through their follow-ups. Next rated for the sensible player fell from 29 to 39% to 18 to 27%. Week 20 cash fell with fewer fans, so the weekly food, data and transport cost came down by ₦3,000 to keep the sensible player near zero rather than in debt. The stories that need many fans by mid-game are rarer than before: `visa` 7% of games, `awards` 22%, `brand` 19%, `label` 31%.

A sensible player now sees a median of 20 of the 38 stories in `EVENTS` (53%), down from about 20 of 26. The simulator prints this line on every run.

## Nollywood actor

The actor (#42) has the same targets as music for now. `node simulate.js 2000 --detail --career=actor`, 8 October 2026:

| Player | Start | Nollywood star | Leading actor | Familiar face | Skit regular | Extra | Sapa won | Median fans | Median money |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sensible | drama | 0.3% | 30.8% | 69.0% | 0.0% | 0.0% | 0.0% | 68,875 | ₦856,080 |
| Sensible | skits | 0.1% | 30.1% | 69.8% | 0.0% | 0.0% | 0.0% | 67,791 | ₦851,677 |
| Sensible | theatre | 0.3% | 27.7% | 72.1% | 0.0% | 0.0% | 0.0% | 61,799 | ₦836,670 |
| Random | drama | 0.0% | 1.8% | 60.8% | 28.0% | 0.0% | 9.5% | 13,087 | ₦209,925 |
| Random | skits | 0.1% | 1.5% | 69.3% | 23.6% | 0.0% | 5.6% | 15,046 | ₦267,869 |
| Random | theatre | 0.0% | 1.1% | 67.0% | 28.7% | 0.0% | 3.1% | 13,862 | ₦282,453 |
| Lazy | drama | 0.0% | 0.0% | 0.1% | 2.9% | 0.0% | 97.0% | 1,175 | −₦432,105 |
| Lazy | skits | 0.0% | 0.0% | 0.2% | 3.5% | 0.0% | 96.3% | 1,419 | −₦426,757 |
| Lazy | theatre | 0.0% | 0.0% | 0.1% | 11.6% | 0.0% | 88.3% | 1,691 | −₦434,111 |

Median cash for the sensible actor at the end of week 20 is ₦48k to ₦64k, a little above music's, because actors have fewer deal follow-ups that cost money. A sensible actor sees a median of 20 of the 35 stories open to actors (57%).

The actor's money is tuned so it plays like music: auditions cost ₦30,000, role fees run from ₦8,000 to ₦200,000 by fame, and streaming licences pay half what music streams would. With role fees of ₦20,000 to ₦500,000 and ₦15,000 auditions, the sensible actor reached Leading actor 71% of the time.

The money-chaser leads here as it does in music (#52): 78 to 82% Leading actor or better against 26 to 33% with random choices. The actor purist does better than in music (42 to 48%), because actor stories have fewer deals to refuse.

## Known problems

**Taking every bag is still the best strategy** (#52). With `node simulate.js 1000 --stories=all`, the money-chaser reaches Next rated or Lagos star 50 to 68% of the time, against 18 to 25% with random choices and 13 to 22% for the purist. Before this change it was 79 to 89%, against 29 to 39% and 19 to 27%, so the gap narrowed from about 50 points to about 40, short of the 15 the issue asks for.

Measured with a diagnostic money-chaser that takes its usual choice on some stories and a random one elsewhere:

- No single story explains the gap. Letting the money-chaser decide only one story at a time moves its result by under 2 points.
- The four big bags (`jingle`, `investor`, `label`, `brand`) on their own were worth about 13 points before this change, and about 3 points after the new fan costs.
- Most of the gap is compounding. Cash keeps the sensible player out of side hustles (about 17 a game against 24), so it rehearses and records more. Better songs earn more fans per release, and each release adds a share of current fans, so a small early lead grows through the game. Releases account for most of the fan difference, with the same number of releases.
- Rules tried in a scratch copy and not adopted: promo that weakens when bought two weeks running, promo that adds less hype when hype is already high, street cred counting more in releases, deals costing a move, a weekly tax on cash above ₦500,000, and a release formula that compounds less. Each one shrank the gap in proportion but kept the money-chaser at about 2 to 3 times the others, and most of them lowered every player's results.

Closing the gap to 15 points needs a decision about the economy as a whole, not more story costs. #52 stays open for it.
