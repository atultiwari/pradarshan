# Worked example: AED Bench (illustrated people)

Using an AED on a collapsed adult, from ERC 2025 / AHA 2025 adult BLS: 7 steps, 18 stations, three people.
Live at https://atultiwari.github.io/aed-bench/, full project (pages, all sprites, tools) at
https://github.com/atultiwari/aed-bench.

This folder keeps the parts that teach the method, without the 2 MB of images:

| File | What |
|---|---|
| `spec.md` | The approved spec: every station cited to a guideline section, "typical" marked |
| `aed-people.js`, `people.test.mjs` | The posture-tested skeleton (two-bone IK, patient landmarks, poses) and its tests (`node --test people.test.mjs`) |
| `assets-plan.md` | The plan shown to the user before any paid image was made: order, costs, risks |
| `image-log.md` | Every image: model, job id, reference, verdict, including the rejected ones and why |
| `aed-sprites.js` | Station-to-sprite mapping and the anchor table measured on the illustrations |
| `cast-sheet.webp` | The approved cast sheet, attached to every later image |
| `before-after.webp` | Code-drawn people (left) vs illustrations (right) at six key steps |

How it went, in order: spec → code-drawn people (rejected) → research → cast sheet → posture-tested skeleton →
one pose at a time (pose reference, then image, then a check against the guideline, then the user's approval) →
registration → overlays measured on the pictures → review of every station, zoomed in. See
`references/illustrated-people.md` for the method.
