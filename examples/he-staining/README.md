# Worked example: H&E staining (Stain Bench)

The complete project this skill was distilled from, live at https://atultiwari.github.io/stain-bench/.
All three styles, one shared spec (`docs/protocol.md`), the phone layout (`docs/mobile-layout.md`). Start new projects
from it with `scripts/new-project.mjs`.

## Three versions of the same protocol

Switch between them with the bar at the top of every page.

| Version | What it is |
|---|---|
| **Sketchbook** | A hand-drawn 2D staining bench. Tap the jars or the steps; the microscope view changes with each reagent. |
| **Turntable** | The same bench in 3D. Drag to turn it, pinch to zoom, view it from any side or full screen. |
| **Working Model** | A linear slide stainer where every number on screen (lab clock, time in each bath, pH, stain uptake) comes from one small model of the protocol. |

All three share the same stations, jar names and lab times (47 min 10 s in total), and work on phones: on small screens the view follows the rack up close, with the steps and stations as swipeable strips.

## Protocol and reference

The staining sequence, reagents and times follow:

> **Bancroft's Theory and Practice of Histological Techniques, 8th edition**
> Edited by S. Kim Suvarna, Christopher Layton and John D. Bancroft. Elsevier, 2019.
> Chapter 10, *The hematoxylins and eosin* (regressive alum haematoxylin and eosin method for paraffin sections), and chapter 11, *Automation in the histology department* (reagent layout of a linear stainer).

The full station list, with the source of each time, is in [docs/protocol.md](docs/protocol.md). Times the book does not give (xylene and alcohol baths) are common laboratory practice and marked as such. Always follow your own laboratory's validated protocol.

## Run it

```bash
node ../../scripts/serve.mjs .     # then open http://127.0.0.1:8765/he-staining/
node working-model/src/build.mjs  # builds working-model/index.html
```
