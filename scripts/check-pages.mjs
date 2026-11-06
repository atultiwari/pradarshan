// The device check: every page at laptop, phone and phone-landscape sizes.
// node check-pages.mjs <siteUrl> <page1,page2,...> [outDir]
//   siteUrl  e.g. http://127.0.0.1:8765/my-project   pages  e.g. sketchbook,turntable,working-model
// For each page and size it saves a screenshot and reports: page errors, sideways scroll, and whether the
// laptop sizes fit one screen. Exits 1 if anything fails. Pages are opened with ?autoplay=0 so they start still.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { open } from './chrome.mjs';

const [site, list, outDir = 'shots/check'] = process.argv.slice(2);
if (!site || !list) { console.error('usage: node check-pages.mjs <siteUrl> <page1,page2,...> [outDir]'); process.exit(2); }
mkdirSync(outDir, { recursive: true });

const SIZES = [
  { name: 'laptop-1440', w: 1440, h: 900, mobile: false, mustFit: true },
  { name: 'laptop-1280', w: 1280, h: 800, mobile: false, mustFit: true },
  { name: 'phone-390', w: 390, h: 844, mobile: true },
  { name: 'phone-375', w: 375, h: 812, mobile: true },
  { name: 'phone-360', w: 360, h: 780, mobile: true },
  { name: 'phone-landscape', w: 812, h: 375, mobile: true },
];

let failed = 0;
for (const p of list.split(',')) {
  for (const s of SIZES) {
    const page = await open({ width: s.w, height: s.h, scale: 1, mobile: s.mobile, gl: true });
    try {
      const url = `${site.replace(/\/$/, '')}/${p}/?autoplay=0`;
      await page.send('Page.navigate', { url });
      await page.sleep(4500);
      const m = JSON.parse(await page.js('JSON.stringify({cw:document.documentElement.clientWidth, sw:document.documentElement.scrollWidth, sh:document.documentElement.scrollHeight, err:document.documentElement.dataset.errors||""})'));
      const problems = [];
      if (m.err) problems.push('errors: ' + m.err.trim());
      if (m.sw > m.cw) problems.push(`scrolls sideways (${m.sw} > ${m.cw})`);
      if (s.mustFit && m.sh > s.h) problems.push(`taller than the screen (${m.sh} > ${s.h})`);
      const shot = await page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: s.w, height: Math.min(m.sh, 2400), scale: 1 } });
      writeFileSync(join(outDir, `${p}-${s.name}.png`), Buffer.from(shot.result.data, 'base64'));
      console.log(`${problems.length ? 'FAIL' : 'ok  '} ${p} ${s.name}${problems.length ? ': ' + problems.join('; ') : ''}`);
      failed += problems.length ? 1 : 0;
    } catch (e) { console.log(`FAIL ${p} ${s.name}: ${e.message}`); failed++; }
    finally { page.close(); }
  }
}
console.log(failed ? `${failed} check(s) failed; screenshots in ${outDir}` : `all checks passed; screenshots in ${outDir}`);
process.exitCode = failed ? 1 : 0;
