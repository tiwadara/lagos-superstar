# Game design

The design framework for The Next Lagos Star: what the game is trying to be, and the systems that make it. New features and stories should fit this page. If one does not, change this page first, in the same pull request.

## What the game is

A life simulation of the Lagos entertainment industry. You arrive with a one-room in Yaba, a cracked phone and a voice, and you have 26 weeks to get on a Detty December stage.

The current build has one career, the music artist. More careers are planned in the same city, with the same cast.

## Design pillars

These are drawn from the current build and the README. They are the tests every new feature should pass.

1. **Lagos is the main character.** Real places, real prices, real pressures: NEPA, danfos, area boys, Detty December. People, companies and brands are fictional ([ADR 0007](adr/0007-fictional-people-and-companies.md)).
2. **Every choice costs something.** Money, street cred, links, a day of your week, or a share of your future. If one option is best in every case, it is not a choice.
3. **Your choices follow you.** Deals take a cut forever. Some stories come back weeks later.
4. **Short and on the phone.** A week is a few taps. The layout is built for a phone first, at most 480px wide.
5. **Funny, not mocking.** The humour punches up at the system, not down at the people living in it.

## Core loop

Each week:

1. **Spend 3 moves.** Pick from the moves below. Some cost money, recording costs two moves, and promo costs none.
2. **End the week.** A story usually happens and you choose how to handle it.
3. **Pay the bills.** Streams pay in, food and transport go out, hype cools, and rent is due every fourth week.

After week 26 comes the December show and an ending.

## Moves

| Move | Moves used | Cost | What it does |
| --- | --- | --- | --- |
| Rehearse | 1 | Free | Skill up, less as skill gets higher |
| Record a song | 2 | ₦40,000, or free after a producer offers a session | Adds a song to the vault. Quality depends on skill, with a 12% chance a power cut lowers it |
| Release a song | 1 | Free | Releases the best song in the vault. Fans gained depend on quality, hype, links and cred, and drop if you released recently |
| Post content | 1 | Free | Hype up. Small chance of going viral |
| Play a show | 1 | Free | Fans, cred and income. The venue grows with your fans |
| Show face | 1 | ₦20,000 | Links up. Sometimes a free studio session or radio play |
| Side hustle | 1 | Free | ₦35,000 to ₦60,000 cash |
| Buy promo | 0 | ₦60,000 to ₦900,000, by venue size | Hype up. Once a week |

## Stats and resources

| Stat | What it does |
| --- | --- |
| Skill | Makes better songs and passes performance checks |
| Hype | Makes a release travel. Fades every week |
| Street cred | Helps releases spread and opens doors on the mainland |
| Links | Helps releases spread and opens doors on the Island |
| Money | Pays for moves and choices. Below zero, debt grows 10% a week |
| Fans | The score. Decides the venue, the December offer and the ending |

## Deals

Deals are the game's long-term trade: money or help now, a share of your music income for the rest of the game. See [Who takes a cut](architecture.md#who-takes-a-cut) for the order.

| Deal | Story | Cut |
| --- | --- | --- |
| Gbedu Empire, standard contract | `label` | Pays back ₦3,000,000 first, then keeps 70% |
| Gbedu Empire, negotiated | `label` | 20%, you keep your masters |
| Aunty Bisi, manager | `manager` | 20%, plus 8 on every stat check and 2 links a week |
| Chad, Afrowave Capital | `investor` | 30% |

## Progression and endings

| Fans | Tier |
| --- | --- |
| 1,000,000 | Lagos star |
| 100,000 | Next rated |
| 10,000 | Buzzing |
| 1,000 | Area champion |
| 0 | Upcoming artist |

The ending is the tier you reach after the December show. Debt past ₦400,000 at the end of any week ends the game early with **Sapa won**.

The December booking appears in week 22. What you get depends on your fans then: a headline slot from 100,000, a second-stage slot from 15,000, or nothing. You can also pay for an early slot or rent a hall for your own show.

## Story system

Stories are self-contained cards, not a decision tree ([ADR 0005](adr/0005-stories-as-independent-cards.md)). At the end of each week the game picks one:

1. In week 22, the December booking.
2. Otherwise, the first follow-up whose condition is met.
3. Otherwise, with an 85% chance, a random story whose `when` condition fits the player.

Each story appears once per game. How to write one is in the [story-writing guide](story-writing-guide.md).

## Known design issues

These are tracked as epics and issues on GitHub. See the [roadmap](roadmap.md).

- **Money stops mattering late in the game.** Median cash for a sensible player stays near ₦100,000 until week 16, then reaches about ₦840,000 by week 26 and about ₦1.9m after December. Rent and debt stop being decisions.
- **Little replay variety.** A sensible player sees about 20 of the 24 stories in every game.
- **Week 1 never has a story.** Every story needs week 2 or later.
