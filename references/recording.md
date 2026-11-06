# Recording videos

Two sets per project: laptop **16:9 at 1920×1080** (YouTube, slides) and phone **9:16 at 1080×1920** (YouTube Shorts,
Instagram Reels, WhatsApp). One video per style. Silent pages, soft music added in code, nothing to license.

## How it works

`scripts/record.mjs` opens the page in headless Chrome and **replaces its clocks** (timers, requestAnimationFrame,
performance.now, Date.now) with one that moves only when stepped, exactly 1/30 s per frame; each frame is captured
after the step. A screen recorder drops frames on heavy pages; this does not, however slow the capture. A drawn pointer
glides to each control and presses it (a red ring pulses on the press): an arrow on laptops, a fingertip dot on phones.
Drags are real mouse events, so 3D orbit controls turn exactly as they would for a person.

## Steps

1. Serve the project (`node scripts/serve.mjs <dir>`) and open pages with `?autoplay=0` (Working Model:
   `?mode=manual`) so the demo itself presses Play or Auto.
2. Find the selectors and positions of the controls: `node scripts/shot.mjs <url> x.png 1600 900 0 3000
   '(()=>[...].map(s=>document.querySelector(s)?.getBoundingClientRect()))()'`.
3. Write a demo JSON per style (format in the header of `record.mjs`) and record:
   `node scripts/record.mjs demo.json frames/<style>`. Check the last line says `"finished":true` and no errors.
4. Encode with music: `bash scripts/make-video.sh frames/<style> <out>.mp4 --key 0 --seed 7 --lufs -20`
   (phones: `--lufs -18`). Give each video in a set its own `--key` (e.g. 0, 2, −3) so they do not sound identical.
5. **Check the MP4 itself**: a contact sheet from the encoded file, one frame every 5–6 s:
   `ffmpeg -i out.mp4 -vf "fps=1/6,scale=640:-1,tile=3x4" -frames:v 1 sheet.png`, and look at it. Then one full-size
   frame mid-run. Say that you could not listen to the music.

Run several recordings in parallel only if the machine has headroom; each takes minutes (about 2 frames per second at
phone size).

## Sizes

| Target | CSS viewport | scale | Output |
|---|---|---|---|
| Laptop 16:9 | 1600×900 (`mobile: false`) | 1.2 | 1920×1080 |
| Phone 9:16 | 405×720 (`mobile: true`, real phone layout) | 2.6667 | 1080×1920 |

1600×900 at 1.2× shows the laptop layout at a size that reads well in a video; check that the page fits 1600×900.

## Demo scripts that work

Start the pointer somewhere neutral, let the page sit still ~1.5 s, then act. Give each action time to land
(0.8 s pointer travel is built in).

- **Sketchbook**: press Play; a few seconds later turn the window's Labels on. On phones: Play, tap the window inset to
  enlarge it during the first colour change and tap again to shrink, then Bench out and back.
- **Turntable**: show that it is 3D *before* playing: drag across the bench (turn ~90°), drag down (tilt), click Back
  and Top views, zoom in twice, rotate with the buttons, return to Corner, then Play; once more mid-run, drag it round.
  On phones: drag to turn, drag to tilt, Bench out, drag the other way, Bench back, Play, tap the inset once.
- **Working Model**: click Auto, then toggle Whole bench and Follow the rack twice during the run (e.g. at 11 s and
  19 s, then at 44 s and 52 s), so viewers see both views.
- `done` is the page's own end state, e.g. `st.step === 7 && !st.busy && !st.playing`; `hold` 2.5–3 s.

## Music

`scripts/music.py <seconds> <out.wav> [key] [seed]` writes a calm bed: a warm detuned pad, a gentle electric-piano
arpeggio and a round bass on Fmaj7, Em7, Dm7, Cmaj7 at 70 BPM, with fades and no clicks at chord changes (notes
release, never stop dead). `make-video.sh` normalises it (−20 LUFS laptop, −18 phones, true peak −2 dB) and muxes it.
Check by measurement: `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -` and a spectrogram
(`showspectrumpic`) for clicks (vertical lines) or harsh highs.

## Lessons

- Record from the finished, checked pages; any later page change means re-recording.
- The laptop video shows the whole layout, with the site bar, footer and QR code in view.
- Do not put a figure number or engine name in the heading; the page's title is the heading.
- Keep each short under 3 minutes (Shorts and Reels both allow that).
