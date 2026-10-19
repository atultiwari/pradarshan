# Review checklist

Run `check-pages.mjs` first; it catches errors, sideways scroll and laptop overflow. Then go through this list by
looking at screenshots of a full run. Every item below was a real review comment on an earlier build.

## Correctness

- [ ] Every station, label, time and total matches `docs/spec.md`, on every page (compare the data tables side by side;
      a single differing full name counts).
- [ ] The order is the source's order, and **the carrier only moves forward**. Trace it: record the active station every
      ~50 ms through a full Play run and confirm the sequence is 1, 2, 3 … N with no repeats.
- [ ] Notes and done lines agree with the source (no "no rinse after eosin" when the book says rinse).
- [ ] The big idea is true and fits on one line.

## Legibility

- [ ] Station labels read at laptop size and in the phone close-up (≥ 11 px on screen); none is hidden behind another
      object; none sits on the wrong object.
- [ ] Every container visibly holds something.
- [ ] The active station's full name is shown in a card on every screen.
- [ ] The window shows a clear change after every step.

## Layout

- [ ] Laptop: site bar to footer fits 1440×900 and 1280×800; figure left, window and notes right.
- [ ] The site name is larger than the page title; the tagline is meaningful.
- [ ] Phone: sticky step strip centred on the active step, close-up follows the carrier, rail centred, inset tappable,
      card readable, notes two lines + More, sticky player, no sideways scroll at 360/375/390, landscape works.
- [ ] Nothing important hides under the sticky player or a toast.

## Behaviour

- [ ] Autoplays one run on load; `?autoplay=0` and `=1` work; Working Model opens in Auto, following.
- [ ] Player states are right before, during, paused and after a run.
- [ ] Tapping a part runs its step; a wrong part explains why.
- [ ] A finished run ends tidily (last close-up held, Play enabled again).
- [ ] No console errors on any page at any size.

## Look

- [ ] Nothing floats: every part sits on or joins something.
- [ ] Shadows are short and attached; no dark outline strips along edges.
- [ ] Look at every step, not just the first frame. A beautiful opening and a broken middle is the most common failure.
