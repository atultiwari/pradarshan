# Illustrated people

Code-drawn people look like mannequins. When a figure shows people, draw them as illustrations, made one pose at a
time from a posture-tested reference, then placed in the scene by code. The worked example is `examples/aed-bench/`
(full project: github.com/atultiwari/aed-bench).

## 1. Choose the image source (ask once, at the start)

Only the "generate" step changes; everything before it (spec, skeleton, pose reference, prompt) and after it
(checking, background removal, placement, anchors) is the same.

| Source | Who presses "generate" | Cost |
|---|---|---|
| A paid image tool connected to Claude (e.g. a Higgsfield MCP) | Claude | Credits. Check the price first (`get_cost`): in 2026 about 2.75 credits per high-quality 2k image (GPT Image 2.5), about 3 per pose with retries, about 75 for a 20–25 pose figure |
| Manual, free: ChatGPT, Gemini or any image chat | The user | Free, within those apps' daily limits. About 1–2 minutes of the user's time per image |
| Code-drawn | Nobody | Free, not good enough for people |

Always write a **prompt pack** first (`scripts/people/prompt_pack.py`), one folder per image in
`assets/generated/requests/<id>/`:
- `ref.png`: the pose reference, from the skeleton;
- `cast.png` (and any approved identity reference, e.g. the patient's earlier sprite);
- `prompt.txt`: the exact prompt;
- `README.txt`: which app, the 3:2 aspect ratio, a plain white background, and where to save the result
  (`assets/generated/<id>.png`).

With a paid tool the pack is sent automatically. With the manual route the user pastes it in, downloads the result
into place and says "<id> is in". Switching source mid-project then costs nothing.

Ask every source for a **plain white background**: Gemini cannot make transparent images, and transparent output
from other models still needs cleaning. `scripts/people/remove_bg.py` always runs. It flood-fills white from the
edges, removes large enclosed white areas (the gap between a rescuer's arms) and cleans halos.

Log every image in `assets/generated/README.md`: what it shows, the source app and model, the date, the prompt
reference, the job id when there is one, and the verdict (accepted / rejected and why).

## 2. Cast sheet first

One image of every person, front and three-quarter view, on white, in the agreed style. Attach it to every later
request so faces, hair, skin and clothes stay the same. Get it approved before anything else.

Style that worked for medical teaching: "flat vector medical illustration in the style of guideline figures: clean thin
dark-navy outlines, soft flat colours, gentle shading, natural adult proportions". For an India-relevant cast, vary
skin tones (Fitzpatrick III–V) across the people.

## 3. Pose references from a posture-tested skeleton

Text prompts do not get technique right ("hands on the lower half of the sternum, arms straight, shoulders over the
hands" came back with hands at the collar and sloping arms, three times). What works is a picture of the pose:
- a skeleton module (`examples/aed-bench/aed-people.js`): joints in world units, two-bone IK, landmarks on the patient
  (lower sternum, pad sites, forehead, chin), poses as functions;
- tests for every pose that teaches something (`examples/aed-bench/people.test.mjs`): e.g. shoulders within 3 cm of
  over the hands, elbows ≥ 170°, hands at 70–86 % of the way from hips to shoulders;
- `scripts/people/pose-ref.html?sprite=<id>` renders the pose in the scene camera, in a frame padded to exactly 3:2,
  and prints the frame (origin, size in scene units) for registration. `?mask=1` gives a depth-correct silhouette of
  one person; `props` adds placeholders such as the AED; a `fit` frame fits the figures themselves.

Then ask the model to redraw the FIRST image (the pose reference) with the people of the SECOND (the cast sheet),
keeping the camera, framing and positions. GPT Image 2.5 (high, 2k) followed the pose; Nano Banana Pro kept identity
well but drifted to a side view.

## 4. Rules learned the hard way

- **Anyone touching another person is generated together with them.** A rescuer generated alone, then placed, knelt on
  the patient's head. The two-person image replaces the patient sprite for that station and is aligned to it by the
  legs (the part that never moves), with `scripts/people/extract_layer.py`.
- **Never pass a flawed image as a reference**: the model copies the flaw.
- **Small variants are edits of an approved image** ("edit this image: keep everything, change only his right hand"),
  so pose and framing stay identical (helper pressing SHOCK → pressing ON → idle).
- **Small motions are made in code**, not generated: the compression "down" frame lowers the shoulders 5–6 cm over
  hands that stay on the chest (`scripts/people/make_push_frame.py`, a mesh warp that clears only the band above
  the back). Two separately generated frames flicker.
- **Running needs two clearly different frames**: the second run frame first came back as a copy of the first. Make
  it from its own pose reference and the person's standing sprite, not from the first run frame.
- One image at a time, checked against the source before it is shown. Real errors caught this way: hands too high on
  the chest, a forehead hand over the eyes, a copied run frame, the wrong button pressed.

## 5. Placing sprites in the scene

- `scripts/people/register_sprite.py <id> '<frame json>'`: single figures; `anchor=bottom` keeps the image's shape
  (one scale, knees or feet on the floor line); `like=<id> region=…` aligns a variant to an approved sprite by the
  parts that do not move.
- `scripts/people/extract_layer.py`: two-person images, aligned to the base sprite by the legs; `whole=1` (default)
  uses the whole image as the station's people layer.
- `scripts/people/defringe.py`: run on every sprite.
- `scripts/people/compose_preview.py out.png P1 A4 …`: composes sprites in scene space to check they fit together.
- Sprites are WebP, about 40–120 KB each; a 25-sprite figure stays under about 2.5 MB.

## 6. Anchors: measure everything on the pictures

Every overlay (the active-station ring, speech bubbles, pads, cables, the shock flash, timers, the phone camera's
focus) must use points **measured on the illustration itself**, never the old code skeleton.
`scripts/people/sprite_grid.py <id> [x0 y0 x1 y1]` draws the sprite at its scene placement with a labelled grid. Read
the head, hands, mouth, pad sites, buttons, screen and socket off it, and keep them in one table next to the sprite
placements. Pads that a picture already shows are not drawn again.

## 7. The window (inside view)

The same approach works for the window: an anatomically checked image (e.g. a heart, anterior view) and a host image
(the bare chest, front view), composed and checked once (heart behind the sternum, apex at the left 5th intercostal
space; pads at the guideline sites). Then animate in code on top: quiver (an SVG displacement filter), squeeze with
each push, current between the pads, blood arrows. Never show a state the source does not support (no pulse returning
straight after a shock).
