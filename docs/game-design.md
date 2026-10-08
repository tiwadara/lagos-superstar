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
3. **Pay the bills.** Streams pay in, food and transport go out, your people cost money once you are famous, hype cools, and rent is due every fourth week.

After week 26 comes the December show and an ending.

Above the moves, one line tells the player what to do next (`nextGoal`). The most urgent need wins: debt, then rent due this week, then the first song, the first release, a song waiting in the vault, low hype, and finally the next song.

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

## Money in and out

| Each week | Amount |
| --- | --- |
| Streams | Up to `fans × 1.5`, mostly from recent releases. Each song's share fades 10% a week, down to a 10% tail. Full pay needs about three fresh songs |
| Food, data, transport | −₦12,000 |
| Your people (stylist, security, cousins) | −₦15,000 when Buzzing, −₦50,000 when Next rated, −₦120,000 when a Lagos star |
| Rent, every fourth week | −₦100,000 to start. The landlord may raise it |
| Debt | 10% interest a week while cash is below zero, plus −3 street cred and −2 links |

The money target is in [balance](balance.md#targets): a sensible player should be out of debt but under ₦300,000 at week 20.

## Deals

Deals are the game's long-term trade: money or help now, a share of your music income for the rest of the game. See [Who takes a cut](architecture.md#who-takes-a-cut) for the order.

| Deal | Story | Cut |
| --- | --- | --- |
| Gbedu Empire, standard contract | `label` | Pays back the ₦1,500,000 advance first, then keeps 70% |
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
3. Otherwise, a random story whose `when` condition fits the player: always in week 1, and with an 85% chance after that. Stories with a higher `weight` come up more often, and once a story from a `group` has appeared, the rest of that group is out for the game. A sensible player sees about half of the stories in a game, so each game draws a different set.

Each story appears once per game. How to write one is in the [story-writing guide](story-writing-guide.md).

## Careers

Every career plays in the same Lagos, with the same week, money, stats, cast and city stories ([ADR 0008](adr/0008-careers-share-one-engine.md)). The sections above describe music, the first career. Each career swaps in its own moves, venues, tier names, income, December booking and endings, and draws its own stories alongside the city ones.

### Nollywood actor

You arrive with the same one-room in Yaba and a face the camera likes. The goal is a Christmas premiere.

| Music | Actor | How it differs |
| --- | --- | --- |
| Rehearse | Rehearse lines | Same: skill up, less as skill gets higher |
| Record a song (2 moves, ₦40,000) | Go to an audition (2 moves, ₦30,000 for transport, headshots and a costume) | Adds a role offer. Its quality depends on skill. Sometimes the producer "will call you". The offer still lands, but it is smaller |
| Release a song | Shoot a role | Plays the best offer. Fans as for a release, plus a role fee of ₦8,000 to ₦200,000 that grows with your fame and the role's quality |
| Play a show | Stage play | Fans, cred and a small fee. The stage grows with your fans |
| Buy promo | Hire a publicist | Hype up, once a week, priced by venue size |
| Post content, show face, side hustle | Same | Shared moves |

| | Actor |
| --- | --- |
| Backgrounds | Church drama star from Ebute Metta (skill, no money), skit maker from Ikorodu (cred and fans, little skill), Theatre Arts graduate from Unilag (money and links, little cred) |
| Venue ladder | Church drama in Ebute Metta, a walk-on in a Lagos series, a supporting role on an Asaba set, the lead in a streaming series |
| Tiers | Extra, Skit regular, Familiar face, Leading actor, Nollywood star. The fan thresholds are the same as music's |
| Weekly income | Streaming licences: half of what music streams would pay, from roles already on screen. The rest of an actor's money comes as role fees when you shoot |
| December | Christmas premieres. Over 100,000 fans, you lead a cinema premiere. Over 15,000, a supporting role. Or pay for a cameo, or make your own short film and screen it in a hall |
| Endings | The same five tiers and the same debt ending, in the actor's words |

Actor stories cover casting couches (told without anything explicit), unpaid "exposure" roles, Asaba producers who pay later, a director who rewrites your part, a co-star feud, a brand deal, the fictional Golden Clapper awards, dubbing, piracy at Alaba market, and fans who think you are your villain. Three stories are crossovers that the musician and the actor see from different sides: Mama Tobi Comedy's skit, Zaddy Blaze's music video, and the Chief's campaign.

The actor cast adds a director, Ebube "Action" Nwachukwu; an Asaba producer, Alhaja Kudi of Kudi Pictures; and a rival, Princess Ifunanya.

## Known design issues

These are tracked as epics and issues on GitHub. See the [roadmap](roadmap.md).

- **Taking every bag is the best strategy.** A player who always takes the biggest payout reaches Next rated far more often than one who doesn't (#52).
- **Little replay variety.** A sensible player sees about 20 of the 26 stories in every game.
