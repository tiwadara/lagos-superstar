# Lagos Superstar

An Afrobeats rhythm game that runs in the browser. Start at an open mic in Yaba and work your way to headlining Tafawa Balewa Square.

## Play

Open `index.html` in a browser. There's no build step and nothing to install.

- Hit the falling notes on the beat with **D F J K**, or tap the lanes on a phone.
- Each hit is rated **Omo!** (perfect, within 50 ms), **Sharp** (100 ms), **Manage** (150 ms) or **Wahala** (missed).
- Reach each show's pass mark to unlock the next one.

| # | Show | Area | Tempo | Pass mark |
|---|------|------|-------|-----------|
| 1 | Yaba Open Mic | Yaba | 100 BPM | 60% |
| 2 | Bariga Block Party | Bariga | 106 BPM | 65% |
| 3 | Lekki Beach Session | Lekki Phase 1 | 112 BPM | 70% |
| 4 | Eko Convention Centre | Victoria Island | 116 BPM | 75% |
| 5 | Tafawa Balewa Square | Lagos Island | 120 BPM | 80% |

The music is synthesized live with the Web Audio API. Progress is saved in the browser's `localStorage`.
