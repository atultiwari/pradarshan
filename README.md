# pradarshan

A skill for [Claude Code](https://claude.com/claude-code) by Dr. Atul Tiwari.

*प्रदर्शन, "demonstration".* Builds an interactive, step-by-step figure of how something works (a lab procedure, a
medical device, a clinical process, or any machine, from a microwave to a vending machine) as a website in up to three
styles that share one spec:

- **Sketchbook**: hand-inked isometric 2D, the fastest and clearest on phones
- **Turntable**: the same in rotatable 3D (drag, zoom, view from any side, full screen)
- **Working Model**: a precise machine where every number on screen comes from one small model

Every page works on laptops and phones, publishes to GitHub Pages, and records as frame-perfect videos with a soft
music bed for YouTube (16:9) and Shorts/Reels (9:16). It is self-contained: engines, a full worked example (H&E
staining in all three styles, see [Stain Bench](https://atultiwari.github.io/stain-bench/)) and scripts are included.

## Install

```bash
git clone https://github.com/atultiwari/pradarshan.git ~/Projects/claude-skills/pradarshan
ln -s ~/Projects/claude-skills/pradarshan ~/.claude/skills/pradarshan
```

Then ask Claude Code for something like *"make an interactive figure of how a sphygmomanometer measures blood
pressure"*, or type `/pradarshan`.

Needs Node 22+, Google Chrome (or Chromium/Edge; set `CHROME_PATH`), ffmpeg, and python3 with `numpy` (music) and
`segno` (QR code).

### Credits

Inspired by interactive figures shared on X by [@Aprilzz423](https://x.com/Aprilzz423),
[@elvar_official](https://x.com/elvar_official) and [@wheresryan22](https://x.com/wheresryan22).

MIT licence; the engines' original notices are in `pradarshan/THIRD_PARTY_LICENSES.md`.
