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

`node simulate.js 2000` on `main` at commit `525b248`, 5 October 2026.

| Player | Start | Lagos star | Next rated | Buzzing | Area champion | Upcoming artist | Sapa won | Median fans | Median money |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sensible | choir | 3.6% | 51.3% | 45.0% | 0.0% | 0.0% | 0.0% | 114,608 | ₦1,944,572 |
| Sensible | street | 2.5% | 48.1% | 49.1% | 0.3% | 0.0% | 0.0% | 101,912 | ₦1,810,025 |
| Sensible | island | 1.8% | 44.6% | 53.1% | 0.5% | 0.0% | 0.0% | 89,381 | ₦2,043,682 |
| Random | choir | 0.1% | 10.8% | 65.0% | 13.1% | 0.0% | 11.1% | 22,152 | ₦2,436,474 |
| Random | street | 0.0% | 10.4% | 71.7% | 11.6% | 0.0% | 6.4% | 25,226 | ₦2,869,030 |
| Random | island | 0.0% | 1.7% | 63.8% | 28.1% | 0.0% | 6.4% | 13,817 | ₦2,530,374 |
| Lazy | choir | 0.0% | 0.0% | 1.3% | 25.7% | 0.0% | 73.0% | 1,855 | −₦420,763 |
| Lazy | street | 0.0% | 0.0% | 2.9% | 24.3% | 0.0% | 72.8% | 2,085 | −₦430,571 |
| Lazy | island | 0.0% | 0.0% | 0.9% | 56.9% | 0.0% | 42.1% | 3,171 | ₦110,000 |

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

**Little replay variety.** A sensible player sees about 20 of the 24 stories per game. The least-seen are `visa` (35% of games), `awards` (44%), `brand` (59%) and `label` (69%).

**Week 1 is always quiet.** Every story requires week 2 or later.
