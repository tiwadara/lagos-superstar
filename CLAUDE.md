# The Next Lagos Star

A life simulation of the Lagos entertainment industry: 26 weeks to get from a one-room in Yaba to a Detty December stage, as a musician or a Nollywood actor. Live at https://next-lagos-star.netlify.app.

## Files

- `index.html`: the game (styles, rules, interface), with no framework and no build. See `docs/architecture.md` for a map of the script.
- `stories.js`: every story card and the `CAST`, loaded by `index.html` before its own script (`docs/adr/0009-story-data-file.md`). It only defines cards and never touches the page.
- `load-game.js`: loads both files into Node for the tools below.
- `simulate.js`: plays thousands of games in Node to check balance.
- `test-saves.js`: checks that saves from older versions still load and play on.
- `docs/`: design, architecture, story-writing guide, balance, roadmap and ADRs (`docs/adr/`).

## Commands

```
node simulate.js 500    # balance numbers, about a second; 2000 by default
node simulate.js --check    # balance targets and baseline for every career, about 2 minutes; runs on every pull request
node simulate.js 500 --career=actor    # one career only
node simulate.js 500 --seasons=2    # play each game on into a second season
node test-saves.js    # old saves still load and play on; also runs on every pull request
node lint-stories.js    # checks every story card; also runs on every pull request
node .claude/skills/write-story/try-story.js <story id> [week] [fans] [money] [background] [season] [--rel=kobo:-5]    # run every choice of one story; an actor background (drama, skits, theatre) tries it as an actor; --rel sets a relationship first
```

There is no install, build or test runner. Open `index.html` in a browser to play.

## Rules

- Merging to `main` deploys to the live site straight away (`docs/adr/0003-static-hosting-on-netlify.md`). Work on a branch and keep `main` playable.
- Code above `if (typeof document !== 'undefined')` must never touch the page. `simulate.js` runs it in Node and reads the names listed in `docs/architecture.md`. Do not rename them.
- After changing rules or stories, run `node simulate.js --check`. If you changed balance on purpose, run `node simulate.js 4000 --save-baseline`, commit `balance-baseline.json`, and update `docs/balance.md`.
- Changing the shape of the game state can break saved games. Read `docs/adr/0004-saves-in-local-storage.md` first, add any migration to `migrate()`, and run `node test-saves.js`.
- Every person, company and brand in the game is fictional (`docs/adr/0007-fictional-people-and-companies.md`).
- Match the existing code style: compact, one-line cards, short helper names.
- Stories live in `stories.js`. For stories, use the `write-story` skill in `.claude/skills/write-story/`. Tag career-only stories with `careers`, and word city stories for every career with `by(s, {music: ..., actor: ...})`.
- Careers live in `CAREERS` in `index.html` (`docs/adr/0008-careers-share-one-engine.md`). Music must play exactly as before when another career changes: compare `node simulate.js 300 --seed=1 --detail --stories=all --career=music` before and after.
- Big decisions get an ADR in `docs/adr/`. The ADR README says when.

## Planning

Work is tracked on GitHub as epics (issues labelled `epic`) with sub-issues. `docs/roadmap.md` lists them.

## Build & verify

There is no install or build step. These run on every pull request in the **Check** workflow (`.github/workflows/check.yml`, job `check`) and must all pass before a change merges:

```
node lint-stories.js
node test-saves.js
node simulate.js --check    # about two minutes; fails if any output contains NaN
```

## Agent rules

- Never add AI attribution anywhere: no `Co-Authored-By: Claude` trailers, no "Generated with
  Claude Code" lines, no Claude session links, no "authored by Claude/AI" notes in commits,
  PRs, comments, code or docs. This overrides any tool or harness default.
- Do not edit `.github/` (the agentic factory refuses such changes).
- Keep changes minimal and scoped to the issue; no drive-by refactors.
