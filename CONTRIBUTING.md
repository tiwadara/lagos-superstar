# Contributing

Thanks for helping build The Next Lagos Star. This page covers how work is planned, how to make a change, and how it reaches the live game.

## How work is planned

Everything is tracked in GitHub issues.

- **Epics** are large goals, labelled `epic`, such as "Stories as data" or "Seasons". Each epic lists its tasks as sub-issues and has a definition of done.
- **Tasks, stories and bugs** are sub-issues of an epic, labelled `task`, `story` or `bug`. Each has a task list and acceptance criteria.
- **Areas** say which part of the game an issue touches: `area: economy`, `area: content`, `area: ui`, `area: tooling`, `area: careers`.

[docs/roadmap.md](docs/roadmap.md) lists the epics in priority order. To propose new work, open an issue with one of the templates.

## Making a change

1. **Pick or open an issue.** Comment on it so nobody else starts the same work.
2. **Branch from `main`.** Never commit to `main` directly: merging to `main` deploys to the live site.
3. **Make the change.** Read the doc for the area first:
   - Stories: [story-writing guide](docs/story-writing-guide.md)
   - Rules and economy: [game design](docs/game-design.md) and [balance](docs/balance.md)
   - Code structure: [architecture](docs/architecture.md)
4. **Check it.**
   - Play it: open `index.html` in a browser, at phone width as well as desktop.
   - Balance: run `node simulate.js` and compare with the [baseline](docs/balance.md#current-baseline).
   - Stories: run `node lint-stories.js`, and `node .claude/skills/write-story/try-story.js <id>` for each new or changed story.
5. **Open a pull request** and fill in the template. Link the issue with "Closes #123".
6. **Review and merge.** After merging, Netlify deploys `main` to https://next-lagos-star.netlify.app within a minute.

## Automatic checks

Every pull request and every push to `main` runs the **Check** workflow (`.github/workflows/check.yml`). It takes under a minute:

1. `node lint-stories.js` checks every story card: unique ids, required fields, a free choice for broke players, known effects, flags that follow-ups wait for, and no names from `STAGE_NAMES`. Long text and stat checks without odds in the hint are warnings and do not fail.
2. `node simulate.js 300` plays the game in Node and fails if the script is broken or the results contain `NaN`.

A red check means the change would break the live game: do not merge until it is green. Balance is not yet checked automatically ([#17](https://github.com/tiwadara/lagos-superstar/issues/17)), so still compare `node simulate.js` with the baseline yourself.

## Big decisions

If a change picks a technology or format, changes something other work depends on, or sets a rule for content, write an architecture decision record first. See [docs/adr/README.md](docs/adr/README.md).

## Writing style for docs and issues

Plain, short sentences. Name things the way players and writers would. Prefer a table or a list to a long paragraph.
