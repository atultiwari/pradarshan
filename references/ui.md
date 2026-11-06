# Pages: layout, devices and controls

Rules every style follows. The worked example implements all of them; copy its code rather than re-inventing it.

## Site structure

```
<project>/
  index.html          redirects to the first style (keeps ?query and #hash)
  shared/switcher.js  the site bar: name, tagline, a switch between styles (configured by new-project.mjs)
  shared/qr.svg       the footer QR code (scripts/qr.py)
  sketchbook/  turntable/  working-model/    one folder per style, each with its own index.html
  docs/spec.md        the shared spec
```

Every page loads `<script src="../shared/switcher.js" defer></script>` in `<head>`. The switcher adds the bar as the
first element of `<body>`, using `grid-column: 1/-1`, so pages laid out as a grid must give it the first row (see the
Sketchbook laptop grid in the example). The site name is the largest text on the page; the page's own title
(`<Subject> · <Style>`) is one size smaller, which the switcher enforces on laptops.

## Laptop (≥ 1100 px wide)

- **One screen.** Everything from the site bar to the footer fits 1440×900 and 1280×800 without scrolling. Check it
  with `check-pages.mjs`; when it fails, shrink the title on short screens (`@media (max-height:820px)`), tighten
  margins, or limit the figure's height (`calc(100vh - <chrome>)`). Do not cut content.
- **Two columns.** Steps and the figure on the left; the window (microscope, inside view), the active card and
  "what is happening" on the right. This is also the video layout.
- A view that zooms to follow the action keeps the whole view's shape, so the page height does not change.

## Phone (≤ 560 px, and phones turned sideways)

"Follow the action": never show every station small and hope it can be read; frame the active part up close and give
the overview as a rail.

1. Site bar: name and the style switch as a full-width segmented control.
2. **Step strip**: the steps in one horizontal row that scrolls sideways, **sticky at the top**; the active step is
   centred automatically (`container.scrollTo({left})`, smooth unless `prefers-reduced-motion`). Never use
   `scrollIntoView` for this: it scrolls the page too.
3. Step count and total time, one compact row.
4. **Close-up view** (about 44% of the viewport height) framing the active station plus one neighbour each side,
   gliding as the carrier moves (ease the camera toward the live position; do not jump per station). A **Bench** button
   in the player zooms out to the whole view and back.
5. **Window inset**: a ~56 px circle in a corner of the view, no labels; tap to enlarge, tap again to shrink. During a
   close-up step (mounting, pouring) the inset shows that close-up instead.
6. **Station rail**: numbered chips coloured by what they hold, the active one lit and centred; tapping a chip acts
   like tapping that station.
7. **Active card**: number badge, full name, time in this station ("4:12 of 5:00").
8. **What is happening**: clamped to two lines with More / Less.
9. **Player**, sticky at the bottom: Play, Pause, Stop, Bench; thumb-sized (≥ 40 px). Hide Loop and Labels.
10. Footer: the credit line and a plain website link (no QR on phones).

Phones turned sideways (`(orientation: landscape) and (max-height: 500px)`) use the same layout with a taller view.
No sideways page scroll at 360, 375 and 390 px.

## Labels and legibility

- Labels belong **on** the object: tape on a jar's front face, a printed panel on a machine. Large type, two lines
  when the word is long ("ACID / ALC"), a numbered badge for the order. The active one lights up in the accent colour.
- Floating label pills that face the camera look tidy in one view but cover neighbouring parts and drift onto the
  wrong object in others: avoid them for stations. Keep pills only for a few start/end markers.
- Labels inside the window (NUCLEUS, CYTOPLASM) start **off** by default, with a Labels button to turn them on.
- Every container shows its contents, even clear liquids (a faint tint, a surface line and a highlight under it).
- Things that run look running: a faucet and stream over a running-water bath, a fan that turns.

## Interaction

- Every step runs from its button, from tapping its part on the drawing, and from Play. Tapping the wrong part
  explains why ("Next: Haematoxylin. Tap the HAEM jar").
- Wrong-order presses get the spec's reason as a short toast; nothing fails silently.
- Pages autoplay one run on load (no loop). `?autoplay=0` starts still, `?autoplay=1` loops (for kiosks).
  A Working Model with its own Auto/Manual switch opens in Auto, following the action; `?mode=manual` opens in Manual.
  Do not restore last choices from `localStorage`: every visitor should get the same start.
- Player states: Play is disabled and reads "Playing" during a run, reads "Resume" when paused; Pause is enabled only
  while running; Stop only while running or paused. Disabled buttons are faded (Play stays solid while it reads
  Playing).
- Respect `prefers-reduced-motion`: no pulsing, instant scrolls.

## Footer

One quiet centred line, e.g. "Made with ♥ and a passion for teaching <field> · <Name>" (heart in red), and at the
bottom-right on laptops a 76 px QR code (`shared/qr.svg`, made with `scripts/qr.py`, verified to decode) with the
domain under it. Nothing else in the footer: no engine credits, no sliders, no colour pickers.
