// One screenshot of a page, optionally after running some JavaScript in it.
// node shot.mjs <url> <out.png> [width] [height] [mobile 0|1] [waitMs] [js] [waitAfterJsMs]
// Prints anything the JS returns, then {cw, sw, sh, err}: client width, scroll width, page height, page errors.
// sw > cw means the page scrolls sideways (a bug). sh > height means it does not fit one screen.
import { writeFileSync } from 'node:fs';
import { open } from './chrome.mjs';

const [url, out, w = '1440', h = '900', mobile = '0', wait = '2500', js = '', waitAfter = '0'] = process.argv.slice(2);
if (!url || !out) { console.error('usage: node shot.mjs <url> <out.png> [width] [height] [mobile 0|1] [waitMs] [js] [waitAfterJsMs]'); process.exit(2); }

const page = await open({ width: +w, height: +h, scale: 2, mobile: mobile === '1', gl: true });
try {
  await page.send('Page.navigate', { url });
  await page.sleep(+wait);
  if (js) { const v = await page.js(js); if (v !== undefined) console.log(JSON.stringify(v)); await page.sleep(+waitAfter); }
  const m = JSON.parse(await page.js('JSON.stringify({cw:document.documentElement.clientWidth, sw:document.documentElement.scrollWidth, sh:document.documentElement.scrollHeight, err:document.documentElement.dataset.errors||""})'));
  console.log(JSON.stringify(m));
  const shot = await page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: +w, height: Math.min(m.sh, 2400), scale: 1 } });
  writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
} finally { page.close(); }
