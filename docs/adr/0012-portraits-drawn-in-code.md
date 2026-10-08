# 0012. Character portraits are drawn in code

- **Status:** Proposed
- **Date:** 2026-10-08
- **Issue:** #30

## Context

Recurring characters (#26) need a face. The game loads on mobile data in Lagos, and it has no image files today. Commissioned illustrations would look best, but they cost money and time, and each new character needs a new drawing.

## Options considered

1. **Commissioned illustrations.** Best look, but each image adds page weight and every new character waits on an artist.
2. **Avatars drawn in code (inline SVG built from simple shapes).** No image files and almost no weight. Each cast member gets a fixed look: face shape, skin tone, hair or gele, glasses, colour. They can match any brand palette.
3. **Monograms.** Initials in a coloured badge. Cheapest, but no faces.

## Decision

We will use option 2: one small `avatar(castId)` function that draws each character's portrait from a short description in the cast list (#27). If the brand (ADR 0011) later wants illustrations for key characters, they can replace the drawn ones one at a time.

## Consequences

- No new files or downloads. Every character, including new ones, gets a face as soon as they're in the cast list.
- The drawings stay simple and stylised. That should be a deliberate look, matched to the brand.
