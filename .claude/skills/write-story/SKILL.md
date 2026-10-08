---
name: write-story
description: Write, edit or review a story card (an entry in EVENTS, FOLLOWUPS or DECEMBER) for The Next Lagos Star, then check it against the story-writing guide and the balance baseline. Use when asked to add a story, event, follow-up or character moment to the game, to rework an existing one, or to review a story pull request.
---

# Write a story for The Next Lagos Star

Stories live in `stories.js`, next to `index.html`: the `EVENTS` list (random weekly stories), `FOLLOWUPS` (stories that wait for a flag set earlier), `DECEMBER` (music's week-22 booking) and `PREMIERES` (the actor's). The cast is `CAST`, at the top of the same file. Each story is a self-contained card. See `docs/adr/0005-stories-as-independent-cards.md` and `docs/adr/0009-story-data-file.md`. A story change touches only `stories.js`; never edit the rules in `index.html` for one.

## 1. Read before writing

- `docs/story-writing-guide.md`: voice, the fiction rule, card anatomy, choice design, reward sizes and the checklist. Follow it.
- The "Adding a story" section of `README.md`: the card format and every `fx` key.
- `docs/balance.md`: the targets and the current baseline.

## 2. Check what already exists

```
grep -n "^  {id:'" stories.js                        # every story id (the first is the template)
grep -o "flag:{[a-zA-Z]*" stories.js | sort -u      # flags already in use
grep -n "^  [a-z]*:{name:" stories.js               # the cast
grep -n "STAGE_NAMES=" index.html                   # names players can take, never use them for characters
```

Reuse an existing character where one fits. The cast is the `CAST` list at the top of `stories.js`. Tag the card with `cast:'id'` (or a list of ids), and add any new recurring character to `CAST` first.

## 3. Write the card

- A story that sets a flag a follow-up waits for needs `once: 'career'`, because follow-ups happen once per career and the story would otherwise come back in a later season without its consequence. The linter checks this. A story that only makes sense from the second year on gets `fromSeason: 2` (see `docs/adr/0010-seasons-carry-over.md`).
- Decide whose story it is: one career (`careers: ['actor']`), a city story for every career (no tag, wording through `by(s, {music, actor})`), or a crossover. See the Careers section of the guide.
- Start from the commented template at the top of `stories.js`. Add the card to `EVENTS`, or to `FOLLOWUPS` if it waits for a flag. Keep the existing one-line, no-space code style of the surrounding cards.
- A card may only call the game's helpers (`by`, `chk`, `odds`, `rel`, `R`) inside its functions. `stories.js` loads before the game script, so a call outside a function breaks the page. Never touch the page from `stories.js`.
- Give `when` a minimum week. Line fan thresholds up with the tiers (1,000, 10,000, 100,000).
- Two or three choices, at least one with no `cost`.
- Use `chk(s, stat, need)` with `odds(s, stat, need)` as the hint for stat checks, and `R.p(x)` with a hint like "A gamble." for luck.
- Every name is invented. Check that it is not a real artist, company or public figure.

## 4. Try every choice

```
node .claude/skills/write-story/try-story.js <id> [week] [fans] [money] [background] [season] [--rel=id:n]
```

This prints whether the story can appear for that player, and what each choice does, including both sides of a check or gamble. Try a player who meets `when` and one who is broke (money `0`). The background picks the career: `choir`, `street` or `island` for music, `drama`, `skits` or `theatre` for the actor. Try a city story or crossover with both. For a story that reads a relationship, add `--rel=id:n` to set how a `CAST` character feels about the player first, such as `--rel=kobo:-5` or `--rel=sapa:3,mum:-2`, and try a friend, an enemy and a stranger (no `--rel`). For a second-season story (`fromSeason: 2`), add the season after the background, such as `choir 2`. Fix anything that warns: a duplicate id, or every choice costing money.

Then check every card at once:

```
node lint-stories.js
```

It must report no errors: the same check runs on every pull request. Fix warnings unless there is a good reason, and say why in the pull request.

## 5. Check balance

```
node simulate.js 1000
```

Compare with the baseline table in `docs/balance.md`. If any ending moves by more than about 5 points for any row, reduce the rewards, or explain in the pull request why the shift is intended. Big cash payouts are the usual cause: late-game money already piles up.

## 6. Open the pull request

- Work on a branch, never directly on `main`. Merging to `main` deploys to the live site.
- Fill in `.github/pull_request_template.md`, link the issue, and paste the `try-story.js` output for the new card.
- If the change moves the baseline on purpose, update the table in `docs/balance.md` in the same pull request.

## Reviewing a story pull request

Run steps 4 and 5 on the branch, then go through the checklist at the end of `docs/story-writing-guide.md` and report each item that fails, with the line.
