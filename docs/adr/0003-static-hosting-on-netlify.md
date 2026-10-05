# 0003. Static hosting on Netlify, deployed from `main`

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

The game is a static page with no server. It needs a public link that updates whenever the game changes. The repo README first suggested GitHub Pages. A Netlify project, `next-lagos-star`, was set up and linked to this repo.

## Options considered

1. **GitHub Pages.** Free and built in, but no deploy previews for pull requests.
2. **Netlify.** Free for this size, deploys every push to `main`, can build a preview for each pull request, and offers forms and analytics if the game needs them later.

## Decision

We will host on Netlify at https://next-lagos-star.netlify.app, deploying the repo root from `main` with no build command.

## Consequences

- Merging to `main` is releasing. Keep `main` playable at all times.
- Every file in the repo root is public, including `README.md`, `simulate.js` and `docs/`. Nothing secret is exposed because the repo is public, but serving only the game is tracked in the tooling epic.
- Netlify Forms are available for a playtest feedback form without a server.
