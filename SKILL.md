---
name: pradarshan
description: Build an interactive, step-by-step teaching figure of how something works (a lab procedure, a medical device, a clinical process, or any everyday machine like a microwave, kettle or vending machine) as a website in up to three styles that share one spec: Sketchbook (hand-drawn isometric 2D), Turntable (rotatable 3D with Three.js) and Working Model (a model-driven machine where every number comes from one model). Pages work on laptops and phones, publish to GitHub Pages, and record as frame-perfect videos with soft music for YouTube (16:9) and Shorts/Reels (9:16). Use it whenever someone asks for an interactive explainer, an animated or clickable demonstration, a "how does X work" figure, a teaching simulation, a procedure walkthrough, or a demo video of a process or machine, in medicine (staining, pathology lab tests, devices, emergency care) or any other field, even if they never name the skill.
---

# Pradarshan (प्रदर्शन, "demonstration")

Turn a process into something people can press, watch and understand: a real-looking bench or machine, a button for every
step, a window into the part doing the work, and numbers that come from the real thing. Then make it work on every screen
and record it as video.

Everything needed is inside this skill: the drawing engines (`assets/engines/`), two worked examples
(`examples/he-staining/`, H&E staining in all three styles, and `examples/aed-bench/`, an AED procedure with
illustrated people), and scripts to scaffold, serve, check, place illustrations and record (`scripts/`). Nothing else has to be installed except Node 22+, Chrome, ffmpeg, and python3 with numpy (music) and
segno (QR code).

## The three styles

| Style | What it is | Best for | Engine |
|---|---|---|---|
| **Sketchbook** | Hand-inked isometric 2D: flat colour, three tones, wobbly ink, paper. One fixed view. | The default. Fastest to build, clearest on phones, friendliest for beginners. | `assets/engines/sketchbook-engine.js` (plain JS, no build) |
| **Turntable** | The same bench or machine in real 3D: drag to turn, pinch to zoom, view from any side, full screen. | When seeing it from all sides matters (a device's back panel, a layout). | Three.js 0.160 from jsDelivr (pinned), no build |
| **Working Model** | A precise isometric machine where every number on screen (clock, time in each step, readings, colours) comes from one small pure model. | When the numbers are the lesson (dose, pressure, timing). Most work. | `assets/engines/iso-engine.mjs` + `lathe.mjs`, built by Node into one page |

Build one, two or all three. When building more than one, they share **one spec** (`docs/spec.md`) so names, steps and
numbers never drift apart, and a bar at the top switches between them.

## Workflow

Follow this order. Every step exists because skipping it caused a round of revisions before.

### 1. Ask only what you cannot decide

Ask in one go, with a recommended default for each:
- the subject and the audience (students, patients, the public, children);
- which styles (default: Sketchbook only; all three when they want to compare);
- the authoritative source (a textbook and edition, a manufacturer's manual, a guideline). If they have a PDF, ask
  for the chapter or pages;
- the site name and tagline, the footer credit line, and a website for the QR code (optional);
- whether to publish (GitHub repo and Pages) and record videos (laptop 16:9, phone 9:16);
- **if the figure shows people**: where the illustrations come from (see `references/illustrated-people.md`):
  a paid image tool connected to Claude (state the price per image first), the free manual route (the user pastes
  prepared prompt packs into ChatGPT or Gemini), or code-drawn (free, but not good enough for people).

### 2. Spec first: truth before drawing

Write `docs/spec.md` from `references/spec-template.md` **before any geometry**. Read `references/spec.md`.
- The real sequence of steps. Each step is one button. **Everything moves forward only:** if a real process reuses a
  station (a rinse bath used three times), give each use its own station, so nothing ever goes backwards on screen.
- Every station, part or control with a short label (fits a jar or button) and a full name (for the "active" card).
- Every number with its source: page or section for book values, "typical practice" when the source does not give one.
  Read the source yourself (`pdftotext -layout` then `grep`; render the page if a two-column layout scrambles text).
  Never invent a clinical number.
- The window: what happens inside the part doing the work (cells taking up stain, food molecules heating, a valve
  opening) and how it looks after each step.
- One big idea in one sentence.
- Wrong-order presses and what the page says ("Wax keeps water-based stains out: dewax first").

Show the spec to the user if the subject is clinical or anything is uncertain.

For clinical figures, **medical accuracy comes first**: regenerate or redraw as often as needed, and show a result
only after checking it against the source. If a publisher's site blocks scripted downloads, use the official PDF
mirrors and cite figure and section numbers (e.g. "ERC 2025 BLS, Fig. 7").

### 2b. People: a character sheet before any scene

If the figure shows people (rescuers, patients, a cook at a stove), **code-drawn people are not good enough**: tubes
and balls, even with faces and clothes, look like mannequins, and users reject them. Machines and benches are fine in
code; people are illustrations. Read `references/illustrated-people.md` and, before building any page:
1. agree the cast (who, skin, hair, clothes) and get one cast reference sheet approved;
2. write a posture-tested skeleton for the poses that teach something (CPR posture, hand position), with tests;
3. make each pose one at a time from a pose reference, check it against the source, show it, then the next.

### 3. Scaffold

```bash
node <skill>/scripts/new-project.mjs <dir> --styles sketchbook,turntable,working-model \
  --name "Microwave Bench" --tagline "How a microwave heats food" --credit "Made with ♥ by …" --url https://…
```

It copies each chosen style from the worked example as a starting point, the version switcher (configured), the spec
template, and a root redirect. Each project gets its own folder; if the user keeps several projects in one parent
folder, each is a separate git repo.

### 4. Build each style

Replace the example's content with the spec's, keeping its structure: state, step runner, player, phone layout,
panel. Read the style's guide first:
- Sketchbook: `references/sketchbook.md`
- Turntable: `references/turntable.md`
- Working Model: `references/working-model.md`

The shared rules for every style and every screen are in `references/ui.md`. The ones that matter most:
- **Labels are readable**: printed on the object (tape on a jar, a panel on a machine), large, two lines when needed,
  a numbered badge; never floating pills that cover other parts. The active item's full name is also shown in a card.
- **Everything is visibly what it is**: a filled jar shows its liquid even when it is clear (a faint tint and a surface
  line); a running tap has a faucet and a stream.
- **Tap anything**: the next step runs from its button, from the part on the drawing, or from Play.
- **Player**: Play / Pause / Stop (+ Loop). Play shows "Playing" and is disabled while running, "Resume" when paused;
  Pause and Stop work only during a run. Pages autoplay **one** run on load; `?autoplay=0` starts still, `=1` loops.
- **Laptop**: everything from the site bar to the footer fits one screen at 1440×900 and 1280×800. The figure on the
  left, the window and notes on the right.
- **Phone ("follow the action")**: sticky step strip, a close-up that follows the moving part, a station rail, a small
  window inset, the active card, two-line notes with More, a sticky player. See `references/ui.md`.
- **Footer**: one quiet credit line and, on laptops, a QR code to the author's site (`scripts/qr.py`); on phones a plain
  link instead (nobody can scan the screen they are holding).

### 5. Check like a critic

Serve and check every page at every size:

```bash
node <skill>/scripts/serve.mjs <dir>                 # http://127.0.0.1:8765/<dir name>/
node <skill>/scripts/check-pages.mjs http://127.0.0.1:8765/<name> sketchbook,turntable,working-model
```

It fails on page errors, sideways scroll on phones, and laptop pages taller than the screen, and saves screenshots.
Then look at the screenshots yourself, plus a full run: read `references/review.md` and go through its checklist,
including a forward-only trace of the active station from start to finish (`scripts/trace-run.mjs`). Look at every
step, not just the first frame, **zoomed in, at several moments of each station**: device checks and run traces pass
even when the picture is wrong (pads on the head, a ring in mid-air, a hand on the wrong button).

### 6. Publish (when asked)

A git repo per project, a README (what it is, the styles, the source with title and edition, how to run, credits), an
MIT `LICENSE`, and `THIRD_PARTY_LICENSES.md` copied from this skill (the engines' notices must travel with them).
Then `gh repo create <name> --public --source . --push` and enable Pages from `main` / root:
`gh api -X POST repos/<owner>/<name>/pages -f "source[branch]=main" -f "source[path]=/"`. Wait for the build, then
check the live URLs.

### 7. Record (when asked)

Read `references/recording.md`. Frame-perfect capture with a visible pointer, scripted demos per style (drag the 3D
bench round; switch between whole view and follow view), a soft music bed made in code, laptop 1920×1080 and phone
1080×1920. Check every MP4 with a contact sheet before handing it over.

## Files

| Path | What |
|---|---|
| `references/spec.md`, `spec-template.md` | How to research and write the spec; the template |
| `references/ui.md` | Layout, devices, player, labels, footer, switcher: the rules every page follows |
| `references/sketchbook.md`, `turntable.md`, `working-model.md` | How to build each style from the example |
| `references/illustrated-people.md` | People: image source (paid, free manual, code), prompt packs, pose references, two-person images, registration, anchors |
| `references/review.md` | The critic's checklist, built from real review rounds |
| `references/recording.md` | Videos: demo scripts, pointer, music, encoding, checks |
| `assets/engines/` | The 2D sketch engine and the isometric engine (with `lathe.mjs` for round parts) |
| `assets/shared/switcher.js` | The site bar and version switch |
| `examples/he-staining/` | The full worked example: 17-station H&E staining in all three styles |
| `examples/aed-bench/` | The people example: spec, posture-tested skeleton and tests, the image log, tool page (full project: github.com/atultiwari/aed-bench) |
| `scripts/` | `new-project`, `serve`, `check-pages`, `shot`, `trace-run`, `record`, `make-video.sh`, `music.py`, `qr.py` |
| `scripts/people/` | Illustration pipeline: `pose-ref.html`, `prompt_pack.py`, `remove_bg.py`, `register_sprite.py`, `extract_layer.py`, `make_push_frame.py`, `defringe.py`, `sprite_grid.py`, `compose_preview.py` |

Inspired by interactive figures shared on X by @Aprilzz423, @elvar_official and @wheresryan22.
