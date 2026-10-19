// Frame-perfect recorder. Writes one PNG per frame at 30 fps; make-video.sh turns them into an MP4 with music.
//
// Why frame-perfect: a screen recorder drops frames on heavy pages (WebGL, big SVGs). Here the page's clocks
// (setTimeout, setInterval, requestAnimationFrame, performance.now, Date.now) are replaced by one that only moves
// when we step it, exactly 1/30 s per frame, and each frame is captured after the step. However slow the capture,
// every animation comes out smooth and at true speed.
//
// A drawn pointer (an arrow on laptops, a fingertip dot on phones) glides to each control and presses it, so viewers
// see what is being clicked. Drags are real mouse events, so 3D orbit controls turn as they would for a person.
//
// node record.mjs <demo.json> <framesDir>
//
// demo.json:
// {
//   "url": "http://127.0.0.1:8765/project/sketchbook/?autoplay=0",   start still; the demo presses Play itself
//   "width": 1600, "height": 900, "scale": 1.2,     CSS size x scale = video size (1920x1080 here)
//   "mobile": false,                                true: phone emulation + fingertip (405x720 x 2.6667 = 1080x1920)
//   "loadWait": 4000,                               ms to let the page (and Three.js) load before frame 0
//   "start": [1000, 560],                           where the pointer rests at frame 0 (CSS px)
//   "events": [                                     times are in seconds of video
//     { "at": 1.6, "do": "click", "sel": "#play" },
//     { "at": 5.0, "do": "drag", "sel": "#gl", "from": [0.3, 0.55], "to": [0.72, 0.52], "dur": 2.4 },   fractions of the element's box
//     { "at": 9.0, "do": "eval", "js": "someGlobal.go('back')" },
//     { "at": 12.0, "do": "move", "sel": ".card" }      glide the pointer there without pressing (park it off the buttons)
//   ],
//   "done": "state.step === 7 && !state.busy",       JS that is true when the run has finished
//   "hold": 3, "minSeconds": 5, "maxSeconds": 150    seconds to hold after done; safety limits
// }
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { open } from './chrome.mjs';

const [demoFile, dir] = process.argv.slice(2);
if (!demoFile || !dir) { console.error('usage: node record.mjs <demo.json> <framesDir>'); process.exit(2); }
const demo = JSON.parse(readFileSync(demoFile, 'utf8'));
const FPS = 30, W = demo.width || 1920, H = demo.height || 1080, MOVE = 0.8, HOLD = demo.hold ?? 3;

const CLOCK = `(() => {
  let now = 0, id = 0; const q = []; let raf = []; const dead = new Set();
  window.setTimeout = (fn, ms = 0, ...a) => { q.push({ t: now + Math.max(0, +ms || 0), fn: () => fn(...a), id: ++id }); return id; };
  window.clearTimeout = i => { const k = q.findIndex(x => x.id === i); if (k >= 0) q.splice(k, 1); };
  window.setInterval = (fn, ms) => { const me = ++id; const rep = () => { if (dead.has(me)) return; fn(); q.push({ t: now + Math.max(1, +ms || 1), fn: rep, id: me }); }; q.push({ t: now + Math.max(1, +ms || 1), fn: rep, id: me }); return me; };
  window.clearInterval = i => { dead.add(i); window.clearTimeout(i); };
  window.requestAnimationFrame = fn => { raf.push({ fn, id: ++id }); return id; };
  window.cancelAnimationFrame = i => { raf = raf.filter(r => r.id !== i); };
  performance.now = () => now; Date.now = () => 1.7e12 + now;
  window.__advance = ms => { const end = now + ms;
    for (;;) { q.sort((a, b) => a.t - b.t || a.id - b.id); const n = q[0]; if (!n || n.t > end) break; q.shift(); now = n.t; n.fn(); }
    now = end; const cbs = raf; raf = []; cbs.forEach(r => r.fn(now)); };
})();`;

const POINTER = mobile => `(() => {
  const c = document.createElement('div'); c.id = 'rec-pointer';
  c.innerHTML = ${mobile
    ? `'<div class="ring"></div><div class="dot"></div>'`
    : `'<div class="ring"></div><svg width="34" height="40" viewBox="0 0 34 40"><path d="M3 2 L3 30 L10.5 23.5 L15.5 35 L20.5 32.8 L15.6 21.6 L25 21.6 Z" fill="#fffdf6" stroke="#231e16" stroke-width="2.4" stroke-linejoin="round"/></svg>'`};
  const s = document.createElement('style');
  s.textContent = '#rec-pointer{position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none}'
    + '#rec-pointer svg{transform:translate(-3px,-2px);filter:drop-shadow(2px 3px 0 rgba(35,30,22,.25))}'
    + '#rec-pointer .dot{position:absolute;left:-15px;top:-15px;width:30px;height:30px;border-radius:50%;background:rgba(35,30,22,.28);border:2.5px solid rgba(255,253,246,.95);box-shadow:0 0 0 1.5px rgba(35,30,22,.5)}'
    + '#rec-pointer .ring{position:absolute;left:-22px;top:-22px;width:44px;height:44px;border-radius:50%;border:3px solid #e2483d;opacity:0}';
  document.head.appendChild(s); document.body.appendChild(c);
  window.__pointer = (x, y, ring) => { c.style.left = x + 'px'; c.style.top = y + 'px';
    const r = c.firstChild; r.style.opacity = ring > 0 ? String(1 - ring) : '0'; r.style.transform = 'scale(' + (0.5 + ring) + ')'; };
})();`;

const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

mkdirSync(dir, { recursive: true });
const page = await open({ width: W, height: H, scale: demo.scale || 1, mobile: !!demo.mobile, gl: true });
try {
  const { send, js } = page;
  const mouse = (type, x, y) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, pointerType: 'mouse' });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: CLOCK });
  await send('Page.navigate', { url: demo.url });
  await page.sleep(demo.loadWait || 4000);
  for (let i = 0; i < 30; i++) await js('__advance(33.3)');          // let the page settle on the frozen clock
  await js(POINTER(!!demo.mobile));
  const err0 = await js('document.documentElement.dataset.errors || ""');
  if (err0) throw new Error('page errors: ' + err0);

  const where = (sel, fx = .5, fy = .5) => js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) throw new Error('no element ' + ${JSON.stringify(sel)}); const r = e.getBoundingClientRect(); return [r.left + r.width * ${fx}, r.top + r.height * ${fy}]; })()`);
  const events = demo.events.slice().sort((a, b) => a.at - b.at);
  let cur = demo.start || [W * .62, H * .55], seg = null, press = -1, drag = null, doneAt = -1, f = 0;
  const MAX = (demo.maxSeconds || 150) * FPS;
  for (; f < MAX; f++) {
    const t = f / FPS;
    while (events.length && t >= events[0].at - MOVE && !seg && !drag) {
      const ev = events.shift();
      if (ev.do === 'eval') { await js(ev.js); continue; }
      seg = { from: cur, to: await where(ev.sel, ev.from?.[0] ?? .5, ev.from?.[1] ?? .5), t0: t, t1: ev.at, ev };
    }
    if (seg) {
      const u = Math.min(1, (t - seg.t0) / Math.max(.05, seg.t1 - seg.t0));
      cur = [seg.from[0] + (seg.to[0] - seg.from[0]) * ease(u), seg.from[1] + (seg.to[1] - seg.from[1]) * ease(u)];
      if (u >= 1) {
        const ev = seg.ev; seg = null;
        if (ev.do === 'click') { press = t; await mouse('mouseMoved', cur[0], cur[1]); await js(`document.querySelector(${JSON.stringify(ev.sel)}).click()`); }
        else if (ev.do === 'drag') {
          drag = { from: cur, to: await where(ev.sel, ev.to[0], ev.to[1]), t0: t, t1: t + (ev.dur || 1.5) };
          await mouse('mouseMoved', cur[0], cur[1]); await mouse('mousePressed', cur[0], cur[1]); press = t;
        }
      }
    }
    if (drag) {
      const u = Math.min(1, (t - drag.t0) / (drag.t1 - drag.t0));
      cur = [drag.from[0] + (drag.to[0] - drag.from[0]) * ease(u), drag.from[1] + (drag.to[1] - drag.from[1]) * ease(u)];
      await mouse('mouseMoved', cur[0], cur[1]);
      if (u >= 1) { await mouse('mouseReleased', cur[0], cur[1]); drag = null; }
    }
    const ring = press >= 0 && t - press < .45 ? (t - press) / .45 : (drag ? .15 : 0);
    await js(`__pointer(${cur[0].toFixed(1)}, ${cur[1].toFixed(1)}, ${ring.toFixed(3)})`);
    await js(`__advance(${1000 / FPS})`);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(dir, `f_${String(f).padStart(5, '0')}.png`), Buffer.from(shot.result.data, 'base64'));
    if (doneAt < 0 && !events.length && !seg && !drag && t > (demo.minSeconds || 5) && await js(demo.done)) doneAt = f;
    if (doneAt >= 0 && f >= doneAt + HOLD * FPS) break;
    if (f % 300 === 0) console.log(`frame ${f} (${t.toFixed(1)} s)`);
  }
  const errs = await js('document.documentElement.dataset.errors || ""');
  console.log(JSON.stringify({ frames: f + 1, seconds: +((f + 1) / FPS).toFixed(2), finished: doneAt >= 0, errors: errs }));
  if (doneAt < 0) process.exitCode = 1;
} finally { page.close(); }
