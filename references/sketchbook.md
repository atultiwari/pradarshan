# Sketchbook (hand-inked isometric 2D)

One HTML page per figure: `sketchbook/index.html` loads `engine.js` (`assets/engines/sketchbook-engine.js`) and one
inline script that models the object in 3D and draws it with the engine's shapes. No build step. The worked example is
`examples/he-staining/sketchbook/index.html` (about 760 lines): start from it and replace the content.

## The look

Flat colour in three tones (light, mid, dark by how each face meets the light), a heavy ink silhouette with finer inner
lines, a short blue-grey cast shadow, warm paper with grain, and a hand-drawn wobble filter. One fixed view (front, left
side and top toward the viewer) and one fixed light. No turning: for that, build the Turntable style.

## Coordinates

- `x` = depth (the front face is at `x = W`, facing viewer-right), `y` = width (+y goes viewer-left), `z` = up; ground
  at `z = 0`. About 1 unit per mm (or per cm for big machines). Small objects can be modelled larger so detail reads.
- Visible faces: `+x` (front, lit), `+y` (left side, in shade), `+z` (top).
- Seeing inside an opening: a point `(x, y, z)` behind the front plane `x = W` appears at `y' = y + (W − x)`,
  `z' = z + (W − x)`. Only things whose `(y', z')` land inside the opening are visible.

## The page contract

```js
ui = mountFigure({
  fig, title, hint,                 // the example replaces the heading after mounting
  size: [W, D, H],                  // the true bounding box incl. everything that moves; framing is automatic
  palette: 'cobalt', state: st,
  scene: (st, m) => svgString,      // redrawn every frame of an animation
  buttons: [{ label, onClick(st, ui) }, ...],   // the steps, in order
  stats: st => [{ label, value, small }],
  acts: { name(st, el, ui) {} },    // presses on act('name', svg) groups (pointerdown, not click)
  params(st, q) {},                 // read URL params into state, for screenshots of any step
});
ui.animate(dt => { ...; return stillRunning; });   ui.flash('a short note');
```

The example wraps this with its own step runner (`heRun`, `heMovesTo`, `heGo`), player (`hePlay`, `hePause`,
`heStop`, `heSyncPlayer`), the panel (window, notes, active card), the phone layout (`heCam`, `heBuildPhone`,
`hePhoneSync`) and the footer. Keep all of that; replace the stations, steps, looks and drawing functions.

## Shapes (all return SVG strings)

| Helper | Use |
|---|---|
| `P(x,y,z)`, `pd(pts)`, `pd(pts,false)` | project a point; a closed or open path through 3D points |
| `box(x0,y0,z0,x1,y1,z1,m)` | a shaded box |
| `rrUV`, `rectUV`, `ellUV`, `arcUV` + `on(PX(x)/PY(y)/PZ(z), uv)` | 2D shapes placed on a plane |
| `extrude(profileUV, x0, x1, m)` | a rounded body swept along x (draw the front cap and silhouette yourself) |
| `loft(ringA, ringB, colourFn)` | between two rings: cups, cones, bottles, domes (convex only) |
| `cyl`, `cylX`, `rod(a, b, r, m)` | upright cylinder, one pointing out of the front, a rod between any two points |
| `shape(pts, colour, w)`, `fill`, `ink`, `line` | filled and inked polygons, ink lines |
| `hullInk(points, w)` | the silhouette ink (weight follows the part's thickness) |
| `tone(normal, m)`, `toneI` | the three-tone shade for a face; `matOf('#hex')`, `mix(a,b,t)` |
| `castShadow(points, z0, clip)`, `board(...)`, `boardTop(...)` | shadows; a board for things that sit on a table |
| `tx`, `txY`, `txM` | text on the front plane, on the side plane, on any surface |
| `act(name, svg, data)`, `clipTo(points, svg)`, `byDepth([{at, svg}])` | clickable groups, clip to an opening, depth sort |
| `tag(p3, dx, dy, text, on)` | a label pill with a leader (use for the window's labels, not for stations) |

## Painter's order (there is no depth buffer)

Draw back to front: board, shadows, things seen through an opening (clipped to it: back wall, floor, contents sorted
by `x+y+z`), the opening's reveals, glass tint and streaks, the front face (one path with holes, `fill-rule:evenodd`),
things mounted on the front, the outer body, side details, silhouette ink, labels last. In a row of objects, draw far to
near (`byDepth`), each object complete with its own ink before the next.

## Lessons

- Never declare names the engine owns: its public helpers are short (`P`, `pd`, `f`, `sp`, `box`, `tx`, `mix`, `INK`,
  `INK_K`, `OX`, `OY`, `VIEW`, `RC`). A clash is a SyntaxError that blanks the page. Prefix your own (`mwS`, `jarL`).
  The internal constants are prefixed already (`ISO_C`, `ISO_S`, `LIGHT`).
- The paper grain and wobble filter stays inside drawn shapes, so embedded images (illustrated people,
  `references/illustrated-people.md`) get no pale halo.
- A row of 17 jars in one line becomes unreadable: fold it into a U on two tiers (front row on the bench, back row on a
  raised shelf), with the carrier crossing at one end.
- Jar labels are tape on the front face (`heTape` in the example): large type, two lines, a numbered badge; the active
  one lights up.
- Clear liquids still get a tint, a surface line and a highlight.
- Glass: far wall, contents, then a light tint and one or two white streaks on top.
- The window (microscope, inside view) is a separate SVG in the side panel, drawn from named colours that blend
  between steps (`HE_LOOK` and `heLook()` in the example).
- The phone close-up is the same SVG with an eased `viewBox` around the carrier; `INK_K` is reset from the viewBox
  width so lines and pills keep their size when zoomed.
- Text: plain letters and digits; emoji render as blobs.
