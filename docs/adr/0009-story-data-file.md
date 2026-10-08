# 0009. Stories live in their own script file, mostly as data

- **Status:** Proposed
- **Date:** 2026-10-08
- **Issue:** #19

## Context

All 31 story cards live inside `index.html`, mixed with the rules, written as compact JavaScript. A writer has to understand functions such as `chk`, `odds` and `R.p` to add one. Stories are the main way the game will grow: more careers (#39), replay variety (#22) and a daily story (#35) all need many more.

Most cards use a few simple patterns: a minimum week and fan count for `when`; a fixed result; a stat check with two results; or a 50/50 gamble. A few, such as `jingleFallout`, need real logic.

## Options considered

1. **A JavaScript file, `stories.js`, loaded by a second `<script>` tag.** Writers use plain fields for the common patterns, such as `when: { week: 4, fans: 1000 }`, `check: { stat: 'links', need: 30, pass: {...}, fail: {...} }` and `gamble: { odds: 0.5, win: {...}, lose: {...} }`, and can still write a function for the rare card that needs logic. No build step. The simulator and linter load both files.
2. **JSON with a rule language.** Writers never see code, and everything can be validated. But every new kind of rule needs engine support, and the few logic-heavy cards become awkward.
3. **YAML or Markdown files converted to JSON.** Easiest to write by hand, but needs a build step or a parser in the page. That conflicts with [ADR 0002](0002-single-html-file-no-framework.md).

## Decision

We will use option 1. `stories.js` defines `EVENTS`, `FOLLOWUPS` and `DECEMBER`. A small interpreter in `index.html` turns the plain fields (`when`, `check`, `gamble`, `fx`) into the functions the engine already uses. A card may still give `when`, `text` or `run` as a function.

## Consequences

- Most stories become data a writer can copy, change and read without knowing JavaScript.
- The game is two files, not one. This amends [ADR 0002](0002-single-html-file-no-framework.md): still no framework and no build, and opening `index.html` from disk still works because both files sit side by side.
- `simulate.js`, `lint-stories.js` and `try-story.js` must load `stories.js` too. The linter can now check the plain fields directly.
- Every existing card must convert with identical behaviour, checked with `node simulate.js --seed=N` before and after (#20).
