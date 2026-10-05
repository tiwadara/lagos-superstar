# Balance

The balance framework: what "balanced" means for this game, how to check it, and the current numbers.

## How to check

```
node simulate.js          # 2,000 games per row, a few seconds
node simulate.js 500      # quicker while iterating
```

The simulator plays every combination of three kinds of player and three starting backgrounds. It prints how often each ending happens, with the median fans and money at the end.

| Player | How it plays |
| --- | --- |
| Sensible | Keeps cash above ₦60,000, records when the vault is empty, releases every two weeks or more, mixes the other moves |
| Random | Taps any move it can afford |
| Lazy | Only posts and rehearses. Never earns, never records |

Story choices are picked at random for all three players. That means the simulator does not yet show what a player who always takes the money gets. See the economy epic in the [roadmap](roadmap.md).

## Targets

These come from the README and the current build. A change that moves an ending more than about 5 points away from the baseline below should explain why in its pull request.

| Player | Target |
| --- | --- |
| Sensible | Usually Buzzing or Next rated. Lagos star is rare, under 5%. Almost never Sapa won |
| Random | Mostly Buzzing or Area champion. Sometimes Sapa won |
| Lazy | Never Next rated or Lagos star. Usually Sapa won or Area champion |

There is no target for money yet. Agreeing one is the first task in the economy epic.

## Current baseline

`node simulate.js 2000`, 5 October 2026, after week 1 stories were added (#10). Every ending is within about 2.5 points of the first baseline on `525b248`.

| Player | Start | Lagos star | Next rated | Buzzing | Area champion | Upcoming artist | Sapa won | Median fans | Median money |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sensible | choir | 3.6% | 53.1% | 43.1% | 0.1% | 0.0% | 0.0% | 124,069 | ₦1,882,030 |
| Sensible | street | 3.5% | 48.2% | 48.1% | 0.2% | 0.0% | 0.0% | 104,608 | ₦1,837,770 |
| Sensible | island | 1.8% | 44.5% | 53.3% | 0.4% | 0.0% | 0.0% | 90,369 | ₦2,066,715 |
| Random | choir | 0.3% | 9.9% | 65.5% | 14.2% | 0.0% | 10.1% | 22,684 | ₦2,538,816 |
| Random | street | 0.1% | 8.9% | 71.1% | 13.0% | 0.0% | 6.9% | 24,119 | ₦2,754,711 |
| Random | island | 0.0% | 1.8% | 65.3% | 25.7% | 0.0% | 7.2% | 13,961 | ₦2,607,984 |
| Lazy | choir | 0.0% | 0.0% | 1.1% | 26.4% | 0.0% | 72.5% | 1,934 | −₦417,723 |
| Lazy | street | 0.0% | 0.0% | 2.1% | 26.2% | 0.0% | 71.8% | 2,067 | −₦421,023 |
| Lazy | island | 0.0% | 0.0% | 1.1% | 54.4% | 0.1% | 44.5% | 3,045 | ₦43,257 |

The endings meet the targets. Money does not, as the next section explains.

## Known problems

**Late-game money piles up.** For a sensible choir player, median cash is about ₦68,000 at week 4, ₦113,000 at week 16, ₦480,000 at week 20 and ₦840,000 at week 26, before the December payout. After a big payout lands, rent (₦100,000 a month) and the debt limit stop shaping decisions. The largest one-off payouts are:

| Story | Payout |
| --- | --- |
| `investor` | ₦4,500,000 cash, or ₦1,500,000 for one song |
| `brand` | ₦3,000,000 to ₦5,000,000 as music income |
| `label` | ₦3,000,000 advance, recouped from music income |
| `jingle` | ₦2,000,000, or ₦1,000,000 under a fake name |
| `visa` | ₦1,500,000 as music income |
| December headline | ₦8,000,000 as music income |

Stream income also grows with total fans, not recent releases (`fans × 1.5 × min(1, songs ÷ 3)`), so a large fan base pays every week without new music.

**Little replay variety.** A sensible player sees about 20 of the 26 stories per game, one of them a week 1 story. The least-seen are `visa` (35% of games), `awards` (44%), `brand` (59%) and `label` (69%).
