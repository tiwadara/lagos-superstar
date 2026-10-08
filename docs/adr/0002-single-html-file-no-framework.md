# 0002. One HTML file, no framework, no build step

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

The game is a text-and-buttons simulation with a few screens. It needs to load fast on mobile data in Lagos, be easy to host anywhere, and be easy for writers to contribute to. The prototype was written as a single `index.html` with plain JavaScript and CSS.

## Options considered

1. **One HTML file with plain JavaScript.** Opens straight from disk, nothing to install, works on any static host. The file grows long and has no modules or types.
2. **A framework with a build step (for example React or Svelte with Vite).** Components, modules and tooling. Adds `npm install`, a build, a `node_modules` folder and a heavier page, for a game that redraws a few hundred lines of HTML.
3. **Several plain files without a build** (`game.js`, `stories.js`, `styles.css`). Splits the file up but breaks "open the file and play", and the simulator would need to load several files.

## Decision

We will keep the game in one `index.html` with plain JavaScript and CSS, no framework and no build step. The rules stay above the interface block and never touch the page, so they can run in Node.

## Consequences

- Anyone can play by opening the file, and deploys are a straight copy.
- The only external requests are two Google Fonts. The page works if they fail to load.
- The file is long (about 940 lines). Sections are marked with comments, and [architecture.md](../architecture.md) maps them.
- Moving stories into a data file is planned and needs its own ADR. It must keep the no-build property or replace this ADR.
- Amended by [ADR 0009](0009-story-data-file.md): the story cards now live in `stories.js`, loaded by a plain `<script>` tag next to `index.html`. Still no framework and no build, and opening `index.html` from disk still works.
