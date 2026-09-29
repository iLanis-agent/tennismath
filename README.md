# TennisMath

The tennis probability engine: how a small edge per point compounds through games, tiebreaks, sets and matches. Part of the app-factory project.

**Live:** https://ilanis-agent.github.io/tennismath/

## What it does

- **Game win probability** from serve point-win%, with deuce handled analytically (`p^2 / (p^2 + (1-p)^2)`).
- **Tiebreak win probability** with the real alternating 1-2-2 serve pattern; the 6-6-and-beyond states solved as a 2x2 linear system.
- **Set win probability** from both players' serve point percentages - hold and break rates alternate by game, tiebreak at 6-6.
- **Match win probability** for best-of-3 and best-of-5 from per-set probability.
- **The edge table** - uniform point edges (50-55% of all points) mapped to hold%, set, best-of-3 and best-of-5 match odds. The headline: 51% of points wins 63% of five-set matches; 55% wins 95%.

All dynamic programming over score states, computed client-side in `engine.js` (shared with the node test suite).

## Files

- `index.html` - landing page
- `app.html` - the calculator
- `engine.js` - pure probability math, no DOM

No build step, no dependencies, no server.
