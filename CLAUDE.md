# The Next Lagos Star

A life simulation of the Lagos entertainment industry: 26 weeks to get from a one-room in Yaba to a Detty December stage. Live at https://next-lagos-star.netlify.app.

## Files

- `index.html`: the whole game in one file, with no framework and no build. See `docs/architecture.md` for a map of the script.
- `simulate.js`: plays thousands of games in Node to check balance.
- `docs/`: design, architecture, story-writing guide, balance, roadmap and ADRs (`docs/adr/`).

## Commands

```
node simulate.js 500    # balance check, about a second; 2000 by default
node lint-stories.js    # checks every story card; also runs on every pull request
node .claude/skills/write-story/try-story.js <story id>    # run every choice of one story
```

There is no install, build or test runner. Open `index.html` in a browser to play.

## Rules

- Merging to `main` deploys to the live site straight away (`docs/adr/0003-static-hosting-on-netlify.md`). Work on a branch and keep `main` playable.
- Code above `if (typeof document !== 'undefined')` must never touch the page. `simulate.js` runs it in Node and reads the names listed in `docs/architecture.md`. Do not rename them.
- After changing rules or stories, run `node simulate.js` and compare with the baseline in `docs/balance.md`.
- Changing the shape of the game state can break saved games. Read `docs/adr/0004-saves-in-local-storage.md` first.
- Every person, company and brand in the game is fictional (`docs/adr/0007-fictional-people-and-companies.md`).
- Match the existing code style: compact, one-line cards, short helper names.
- For stories, use the `write-story` skill in `.claude/skills/write-story/`.
- Big decisions get an ADR in `docs/adr/`. The ADR README says when.

## Planning

Work is tracked on GitHub as epics (issues labelled `epic`) with sub-issues. `docs/roadmap.md` lists them.
