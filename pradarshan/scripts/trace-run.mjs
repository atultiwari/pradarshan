// Forward-only trace of the active station through a full autoplay run.
// node trace-run.mjs <page url> [seconds=120] [js giving the active station index, default __st.at] [number of steps=7]
// Prints the sequence of active stations and whether it only ever moves forward, and when the run ended.
import { open } from './chrome.mjs';
const [url, secs = '120', expr = '__st.at', steps = '7'] = process.argv.slice(2);
const page = await open({ width: 1440, height: 900, scale: 1, mobile: false, gl: true });
try {
  await page.send('Page.navigate', { url });
  await page.sleep(1500);
  const seq = [], t0 = Date.now(); let last = null, endAt = null;
  while (Date.now() - t0 < secs * 1000) {
    const v = await page.js(`(window.__st ? (${expr}) : null)`);
    if (v !== last) { seq.push(v); last = v; }
    const done = await page.js(`JSON.stringify({p:(window.__st||{}).playing, s:(window.__st||{}).step, e:document.documentElement.dataset.errors||''})`);
    const d = JSON.parse(done);
    if (d.e) { console.log('ERR', d.e); break; }
    if (Date.now() - t0 > 3000 && d.p === false && d.s >= +steps && !endAt) { endAt = (Date.now() - t0) / 1000; break; }
    await page.sleep(100);
  }
  console.log('sequence:', seq.join(','));
  const forward = seq.filter(v => v !== null).every((v, i, a) => i === 0 || v === a[i - 1] + 1);
  console.log('forward-only 0..17:', forward, 'run ended at', endAt, 's');
} finally { page.close(); }
