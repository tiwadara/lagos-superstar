---
name: write-story
description: Write, edit or review a story card (an entry in EVENTS, FOLLOWUPS or DECEMBER) for The Next Lagos Star, then check it against the story-writing guide and the balance baseline. Use when asked to add a story, event, follow-up or character moment to the game, to rework an existing one, or to review a story pull request.
---

# Write a story for The Next Lagos Star

Stories live in `index.html` in the `EVENTS` list (random weekly stories), `FOLLOWUPS` (stories that wait for a flag set earlier) and `DECEMBER` (the week-22 booking). Each is a self-contained card. See `docs/adr/0005-stories-as-independent-cards.md`.

## 1. Read before writing

- `docs/story-writing-guide.md`: voice, the fiction rule, card anatomy, choice design, reward sizes and the checklist. Follow it.
- The "Adding a story" section of `README.md`: the card format and every `fx` key.
- `docs/balance.md`: the targets and the current baseline.

## 2. Check what already exists

```
grep -n "{id:'" index.html                         # every story id (and the move ids)
grep -no "flag:{[a-zA-Z]*" index.html | sort -u     # flags already in use
grep -n "STAGE_NAMES=" index.html                   # names players can take, never use them for characters
```

Reuse an existing character where one fits. The cast is listed in the guide.

## 3. Write the card

- Add it to `EVENTS`, or to `FOLLOWUPS` if it waits for a flag. Keep the existing one-line, no-space code style of the surrounding cards.
- Give `when` a minimum week. Line fan thresholds up with the tiers (1,000, 10,000, 100,000).
- Two or three choices, at least one with no `cost`.
- Use `chk(s, stat, need)` with `odds(s, stat, need)` as the hint for stat checks, and `R.p(x)` with a hint like "A gamble." for luck.
- Every name is invented. Check that it is not a real artist, company or public figure.

## 4. Try every choice

```
node .claude/skills/write-story/try-story.js <id> [week] [fans] [money] [background]
```

This prints whether the story can appear for that player, and what each choice does, including both sides of a check or gamble. Try a player who meets `when` and one who is broke (money `0`). Fix anything that warns: a duplicate id, or every choice costing money.

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
