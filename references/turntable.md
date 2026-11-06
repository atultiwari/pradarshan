# Turntable (rotatable 3D)

The same bench or machine in real 3D with Three.js, matching the Sketchbook's look: paper background, flat toon shading,
ink outlines, translucent glass. No build step. The worked example is `examples/he-staining/turntable/`.

## Files (as in the example)

| File | What |
|---|---|
| `index.html` | the page: CSS for laptop and phone, the import map pinning Three.js, the DOM for steps, canvas, camera buttons, panel and player |
| `he-data.js` | the spec as data: stations, steps, looks, liquids, notes; shares coordinates with the 2D figure |
| `he-build.js` | `heBuild(THREE, lines)` builds the scene and returns the objects the app animates |
| `he-scope.js` | the window panel (a flat SVG, same as the 2D one) |
| `he-phone.js` | the phone layout: follow camera, rail, inset, folding camera buttons |
| `he-app.js` | loads Three.js, runs the step runner and player, handles taps and camera controls |

Rename the `he-` prefix for a new subject if you like; keep the split.

## Three.js

- Pin the version in an import map: `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js` and
  `.../examples/jsm/` for `OrbitControls` and fat lines. Load with dynamic `import()` from a classic script so the page
  also opens from disk.
- World space: X along the bench, Y up, Z toward the viewer. Map the spec's coordinates once (`heW()` in the example).
- Toon look: `MeshToonMaterial` (with a small stepped `DataTexture` gradient) for solid parts, ink outlines from
  `EdgesGeometry` drawn as fat lines, dark ink `#231e16`; glass as transparent `MeshBasicMaterial` boxes with the
  liquid as an inner tinted box; jar labels as `CanvasTexture`s on the front faces; a hemisphere plus a directional light.
- `OrbitControls`: damping on, clamp the polar angle so the camera never goes under the bench, clamp the distance.
  Double-tap empty space resets.
- Render only while something moves or the user is interacting; cap the device pixel ratio at 2.

## Controls

- Drag to turn, pinch or scroll to zoom.
- View chips: Corner, Front, Back, Left, Right, Top (eased camera moves).
- A round button cluster in a corner of the canvas: turn left/right, tilt up/down, zoom in/out, reset, full screen
  (Fullscreen API on the canvas wrapper; the icon swaps; Esc exits). On phones it folds behind one button.
- On phones the camera follows the carrier (close-up of the active station and its neighbours); a drag pauses the
  follow until the next step starts; Bench frames the whole bench.

## Lessons

- Keep the 2D and 3D layouts the same (U-shaped two-tier bench in the example), so the styles feel like one product.
- Taps on the canvas: raycast to find the station or the carrier; ignore drags (more than ~7 px or 600 ms).
- The window panel is plain SVG beside the canvas: smaller on laptops, no label pills, an active card under it.
- Headless checks need WebGL in software: the scripts start Chrome with SwiftShader.
