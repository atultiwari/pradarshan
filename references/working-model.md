# Working Model (model-driven machine)

A precise isometric machine where the model comes first: one small pure module computes every number and colour, and
the drawing and the page only read it. The worked example is `examples/he-staining/working-model/src/`; `node
working-model/src/build.mjs` writes one standalone `working-model/index.html`.

## Files (as in the example)

| File | What |
|---|---|
| `model.mjs` | the model: stations with times and sources, the clock, a function giving the window's state at any moment (`sectionAt(station, seconds)` in the example), a self-check |
| `model.test.mjs` | `node --test`: totals, ordering, end states |
| `world.mjs` | layout shared by the build and the page: sizes, station positions, the follow camera's frame |
| `art.mjs` | the static art, drawn once at build time with the engine |
| `tissue.mjs` | the window's drawing (seeded random, so every build is identical); colours come from CSS variables the page sets from the model |
| `live.js` | the page: Auto/Manual, step pills, the timeline, moving parts, readout chips, the follow camera, the phone layout |
| `build.mjs` | prints the model's self-check, draws the art, inlines engine + world + model + live code into one page |
| `kit.mjs`, `lathe.mjs`, `engine/` | the isometric engine (`iso-engine.mjs`) and round-part maker (`lathe.mjs`) |

## The engine in brief

`iso-engine.mjs`: `fitProjection(points, w, h, {pad, azimuth})` sets the camera; solids from `slabOf(plan, z, h)`,
`cylinder(cx, cy, r, z, h)`, `extrude`, `roundedPlan`, `insetPlan`; details `knurl`, `coil`, `topTicks`, `sideTicks`,
`radialTicks`, `dotGrid`; output `solidSvg(paths, {tone, lit})`, `lineSvg`, `wireSvg`, `dotsSvg`, `faceTextSvg`,
`groupSvg`, `figureSvg`, `pageHtml`; motion `translateAlong`. Four tones by facing; exactly one part `lit` (the one to
watch). `lathe.mjs`: round parts along any axis (`lathe`, `disc`, `ringBand`, `sphereOf`, `rodOut`), and `fillet` for
pipe routes. Read the example's `art.mjs` for working calls of each.

## Rules

- **Model before drawing.** Write `model.mjs` from the spec first and make the self-check print the totals, then draw.
  The clock, "time in this bath", the speed badge (×N computed from real seconds), pH or temperature chips and the
  window's colours all read the same function, so they cannot disagree.
- **Real detail, not noise.** A recognisable machine (gantry, rack, timer box, manifold), parts that sit on parts.
- **Auto and Manual**: Auto plays the whole run (and loops); Manual waits for each press and pulses the next button.
  Opens in Auto, following the carrier; `?mode=manual` opens in Manual.
- **Follow the rack / Whole bench** toggle. On laptops the follow view keeps the whole view's shape (zoomed ~2×), so
  the page height does not change.
- A strip of every station (numbered, coloured chips) under the figure, readout chips under that, the big idea under
  the card, sources behind a small "Sources" disclosure so the page still fits one screen.
- Sound words drawn on the action ("plop", "drip", "swish") are a nice touch; keep them short-lived.
- Rebuild after every edit to `src/`; the shipped page is the built `index.html`.
