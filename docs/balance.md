# Balance

The balance framework: what "balanced" means for this game, how to check it, and the current numbers.

## How to check

```
node simulate.js                     # 2,000 games per row, a few seconds
node simulate.js 500                 # quicker while iterating
node simulate.js 1000 --detail       # also cash and fans by week, and each story's effect
node simulate.js 1000 --stories=all  # compare story-choice strategies
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

These are the design targets, with random story choices, for every starting background. `node simulate.js --check` tests them on every pull request. The numbers live in `TARGETS` at the top of `simulate.js`. Change both places together, and say why in the pull request.

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

`node simulate.js --check` takes about 40 seconds. It plays 2,000 games per row with random story choices and with the money-chaser, then:

1. Tests the targets above.
2. Compares every row with `balance-baseline.json`. It fails if an ending moves more than 7 points, or median fans, median money or the sensible player's week 20 cash move more than 30%. Below a floor (2,000 fans, ₦100,000 money, ₦45,000 week 20 cash), small moves always pass.

These limits come from measuring noise. On the unchanged game the check passed 12 runs out of 12. It fails when the investor or jingle payout is doubled, or the side hustle pays double. Smaller changes can stay within the noise. Removing the weekly cost of fame, for example, moves the sensible player's week 20 cash by ₦30,000 to ₦50,000, which the check does not reliably catch. So when you change numbers, still compare the full tables yourself.

When a change moves balance on purpose:

```
node simulate.js 4000 --save-baseline   # about a minute; 4,000 games per row keeps the baseline steady
```

Commit the new `balance-baseline.json`, update the tables below, and explain the change in the pull request.

## Current baseline

`node simulate.js 2000 --detail`, 5 October 2026, after the economy changes (#3, #4): smaller bags, streams from recent releases, and weekly costs for fame.

| Player | Start | Lagos star | Next rated | Buzzing | Area champion | Upcoming artist | Sapa won | Median fans | Median money |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sensible | choir | 1.2% | 38.7% | 59.9% | 0.2% | 0.0% | 0.0% | 80,334 | ₦761,784 |
| Sensible | street | 0.4% | 34.5% | 64.6% | 0.4% | 0.0% | 0.1% | 68,280 | ₦705,086 |
| Sensible | island | 0.3% | 29.3% | 69.8% | 0.7% | 0.0% | 0.0% | 58,433 | ₦700,595 |
| Random | choir | 0.0% | 7.4% | 64.3% | 16.9% | 0.0% | 11.4% | 19,047 | ₦724,788 |
| Random | street | 0.0% | 8.3% | 71.1% | 12.7% | 0.0% | 8.0% | 21,821 | ₦806,397 |
| Random | island | 0.0% | 1.0% | 59.3% | 31.1% | 0.0% | 8.6% | 12,611 | ₦755,914 |
| Lazy | choir | 0.0% | 0.0% | 0.7% | 16.6% | 0.0% | 82.8% | 1,660 | −₦431,891 |
| Lazy | street | 0.0% | 0.0% | 1.1% | 14.8% | 0.0% | 84.1% | 1,819 | −₦435,208 |
| Lazy | island | 0.0% | 0.0% | 0.9% | 46.1% | 0.0% | 53.0% | 2,851 | −₦406,153 |

Median cash for the sensible player at the end of each week, after rent:

| Start | Week 4 | Week 8 | Week 12 | Week 16 | Week 20 | Week 26 |
| --- | --- | --- | --- | --- | --- | --- |
| choir | −₦55k | −₦42k | −₦34k | −₦14k | ₦70k | ₦271k |
| street | −₦46k | −₦41k | −₦32k | −₦18k | ₦35k | ₦237k |
| island | ₦50k | −₦42k | −₦40k | −₦20k | ₦43k | ₦243k |

Before the economy changes, the same measure at week 20 was ₦362k (choir), ₦206k (street) and ₦603k (island), and ₦0.9m to ₦1.5m at week 26.

The endings and money meet their targets. The economy changes moved endings more than 5 points on purpose: Next rated for the sensible player fell from about 45 to 55% to about 29 to 39%, because tighter money buys less promo.

## Known problems

**Taking every bag is still the best strategy** (#52). A sensible player who always takes the choice that leaves the most cash reaches Next rated 73 to 83% of the time and Lagos star 3 to 7%, against 29 to 39% and under 1% with random choices. Cash still buys promo, and the deals add links and hype, while their costs (street cred, cuts on music income) barely touch fans.

**Little replay variety.** A sensible player sees about 20 of the 26 stories per game, one of them a week 1 story. The least-seen are `visa` (35% of games), `awards` (44%), `brand` (59%) and `label` (69%).
