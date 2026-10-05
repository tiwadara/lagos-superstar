# 0001. Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

The game is growing from a prototype into a project with planned epics: stories as data, seasons, more careers. Several of these need decisions that later work will depend on. Without a record, the reasons behind those decisions get lost and get argued again.

## Decision

We will record each significant decision as a short ADR in `docs/adr/`, numbered in order, using the template in [`template.md`](template.md).

## Consequences

- Each decision has one place that explains it, linked from issues and pull requests.
- Writing an ADR adds a small step before big changes. The [ADR index](README.md) lists when one is needed, so small changes skip it.
