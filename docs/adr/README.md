# Architecture decision records

An architecture decision record (ADR) is a short note about one decision that shapes the project: what we chose, why, and what it costs us. They explain why the game is built the way it is, so nobody has to guess or re-argue it.

## When to write one

Write an ADR when a change:

- picks a technology, format or service (a data format for stories, a hosting setup)
- changes something other work depends on (the save format, the state shape, what the simulator reads)
- sets a rule for content or process (the fiction rule)

Bug fixes, new stories and balance tweaks do not need one.

## How to write one

1. Copy [`template.md`](template.md) to the next number, for example `0008-stories-as-data.md`.
2. Fill it in with status **Proposed** and open a pull request. Discussion happens on the pull request.
3. When it merges, set the status to **Accepted**.
4. Never edit the decision in an accepted ADR. To change course, write a new ADR and set the old one's status to **Superseded by ADR NNNN**.

## Index

| ADR | Decision | Status |
| --- | --- | --- |
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](0002-single-html-file-no-framework.md) | One HTML file, no framework, no build step | Accepted |
| [0003](0003-static-hosting-on-netlify.md) | Static hosting on Netlify, deployed from `main` | Accepted |
| [0004](0004-saves-in-local-storage.md) | Saves in the player's browser | Accepted |
| [0005](0005-stories-as-independent-cards.md) | Stories are independent cards, not a decision tree | Accepted |
| [0006](0006-headless-simulator-for-balance.md) | A headless simulator checks balance | Accepted |
| [0007](0007-fictional-people-and-companies.md) | All people and companies are fictional | Accepted |
| [0008](0008-careers-share-one-engine.md) | Careers share one city, one engine and one cast | Proposed |

ADRs 0002 to 0007 were recorded on 5 October 2026 for decisions already in the first playable build.
