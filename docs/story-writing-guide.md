# Story-writing guide

The content framework for The Next Lagos Star. Read this before writing or editing a story. The mechanics of adding a card are in the [README](../README.md#adding-a-story). This page covers what makes a good one.

## Voice

- **Second person, present tense.** "A hand comes through the danfo window and your phone is gone."
- **Short sentences.** The story text is read on a phone in a bottom sheet. Aim for 25 to 45 words.
- **Specific over general.** Name the place, the price, the time: "Lekki-Epe Expressway, 11pm", "₦20,000", "day nine".
- **Let characters talk.** One line of quoted speech, in their own voice, often does more than a paragraph. Pidgin and Yoruba belong in dialogue, kept short enough for any reader to follow.
- **Funny, not mocking.** Laugh at the system (the checkpoint, the loan app, the 47-page contract), not at people for being poor, from a place, or how they speak.
- **Plain English in labels.** Choice labels are actions in the imperative: "Pay the chairman", "Call him out online".

## Fiction rule

Every person, company, brand, blog, label, radio station and investor is invented. Real places, real foods and real things Lagos lives with (NEPA, danfos, Third Mainland Bridge, Computer Village) are welcome. Never name or clearly imitate a real artist, politician, company or public figure. See [ADR 0007](adr/0007-fictional-people-and-companies.md).

Before adding a new name, check the cast already in the game. Every recurring character is listed in `CAST` in `index.html`, with their role and where they live: your mother, your landlord, Iya Sikirat, Beatz by Sapa, Smooth Lanre of Vibe 99.9 FM, Aunty Bisi, Zaddy Blaze, Chief Dr. Bamidele Oyelaran, Lil Kobo, Mama Tobi Comedy, Chad Whitlock of Afrowave Capital, Big Tunde of Gbedu Empire and Barrister Amaka. Reusing a character is often better than inventing one. Do not reuse a name from `STAGE_NAMES` for a character, because players can pick those as their own name.

When a story features a cast member, tag the card with `cast: 'bisi'`, or a list such as `cast: ['tunde', 'amaka']`. A new recurring character goes into `CAST` first. `node lint-stories.js` fails on a tag that is not in `CAST` and warns about a cast member who is in no story.

Brands and places that are not people (Kogbagidi Herbal Bitters, Amebo Central, Eko Rave, SapaLoan, the talent show Who Get Voice?) are not in `CAST`, but check the stories before reusing or inventing one.

## Anatomy of a card

| Field | Rules |
| --- | --- |
| `id` | Unique, camelCase, a word or two: `areaboys`, `jingleFallout` |
| `cast` | Optional. The `CAST` id of the character in the story, or a list of ids |
| `title` | One to four words. A headline, not a summary: "Checkpoint", "Stems hostage" |
| `who` | Who is speaking or where we are: "Your landlord, at your door, 7am" |
| `when` | When the story may appear. Always set a minimum week. Use fan thresholds that line up with the tiers (1,000, 10,000, 100,000) |
| `text` | The situation, ending on the decision. A string, or a function of `s` when it changes with the player's state |
| `choices` | Two or three. A list, or a function of `s` that returns one |

Each choice has a `label`, an optional `cost`, an optional `hint`, and a `run` that returns `{ text, fx }`. The `fx` keys are listed in the [README](../README.md#adding-a-story).

## Designing choices

1. **Always include a free choice.** A choice with a `cost` locks when the player cannot afford it, so at least one option must cost nothing. Otherwise a broke player is stuck.
2. **Each choice trades something different.** Typical axes: money against cred, money against time (`energyNext: -1`), now against later (a deal or a flag), safe against a gamble.
3. **No option should win in every case.** If you would always pick it, rebalance it or cut it.
4. **Show the odds.** If a choice depends on a stat, use `chk(s, stat, need)` in `run` and `odds(s, stat, need)` as the `hint`. If it is pure luck, say so in the hint: "A gamble."
5. **Say what it costs in the hint.** "Costs you a day.", "₦4,500,000 now. 30% of you, forever."
6. **Every outcome gets its own line of story.** A result is never just numbers.

## Follow-ups

To make a choice come back later, set a flag to the current week (`flag: { jingle: s.week }`) and add a card to `FOLLOWUPS` whose `when` waits for it (`s.flags.jingle && s.week >= s.flags.jingle + 3`). Follow-ups jump the queue: the first one that is due always shows before a random story. Keep the wait between 2 and 6 weeks so it lands before December.

## Sizing rewards

Match rewards to the stage of the game the story appears in. Existing stories give a sense of scale:

| Stage | Example | Typical effects |
| --- | --- | --- |
| Early (week 2+, any fans) | `cypher`, `nepa`, `police` | ±₦20,000 to ₦80,000, hype ±5 to 15, cred ±2 to 10, `fansUp` with a small floor like `[80, 0.04]` |
| Middle (1,000+ fans) | `beef`, `skit`, `dance`, `oap` | Costs ₦80,000 to ₦200,000, hype +12 to 30, `fansUp` up to `[600, 0.3]` |
| Late (8,000+ fans) | `label`, `brand`, `visa`, `awards` | Payouts in the millions, `fansPct: 0.25`, deals that last the rest of the game |

Big payouts are where balance usually breaks. Late-game money already piles up (see [balance](balance.md)), so prefer rewards that cost something later over plain cash.

## Checklist before opening a pull request

- [ ] The `id` is unique, and every flag a follow-up waits for is set somewhere.
- [ ] `when` has a minimum week and sensible thresholds.
- [ ] At least one choice is free.
- [ ] No choice is best in every case.
- [ ] Stat checks show their odds in the hint.
- [ ] All names are fictional and not already used for something else. Recurring characters are in `CAST` and the card has a `cast` tag.
- [ ] The text reads well on a phone: 25 to 45 words, one decision.
- [ ] `node lint-stories.js` reports no errors. It also runs on every pull request.
- [ ] `node simulate.js` shows no ending more than about 5 points away from the [baseline](balance.md#current-baseline), or the change explains why.
