// Finds Chrome / Chromium / Edge and opens a headless page over the DevTools protocol. No npm packages:
// Node 22+ has fetch and WebSocket built in. Used by shot.mjs, check-pages.mjs and record.mjs.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);

export function chromePath() {
  const p = CANDIDATES.find(existsSync);
  if (!p) throw new Error('No Chrome, Chromium or Edge found. Set CHROME_PATH to the browser executable.');
  return p;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// open({ width, height, scale, mobile, gl }) -> { send, js, close }
export async function open({ width = 1440, height = 900, scale = 1, mobile = false, gl = false } = {}) {
  const port = 9300 + Math.floor(Math.random() * 600), prof = mkdtempSync(join(tmpdir(), 'pradarshan-'));
  const args = ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--hide-scrollbars', 'about:blank'];
  if (gl) args.splice(3, 0, '--use-angle=swiftshader', '--enable-unsafe-swiftshader');   // WebGL without a GPU
  const chrome = spawn(chromePath(), args, { stdio: 'ignore' });
  let ws;
  for (let i = 0; i < 60 && !ws; i++) {
    try { ws = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(x => x.type === 'page').webSocketDebuggerUrl; }
    catch { await sleep(200); }
  }
  if (!ws) { chrome.kill(); throw new Error('Chrome did not start'); }
  const sock = new WebSocket(ws); let id = 0; const pending = new Map();
  sock.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  await new Promise(r => { sock.onopen = r; });
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); sock.send(JSON.stringify({ id: i, method, params })); });
  const js = async expr => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.result?.exceptionDetails) throw new Error(`${expr.slice(0, 80)}: ${r.result.exceptionDetails.exception?.description || JSON.stringify(r.result.exceptionDetails)}`);
    return r.result?.result?.value;
  };
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile });
  if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await send('Page.enable');
  // collect uncaught errors on <html data-errors>, so every check can read them
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `addEventListener('error', e => { document.documentElement.dataset.errors = (document.documentElement.dataset.errors || '') + ' ' + e.message + ';'; });` });
  const close = () => { try { sock.close(); } catch {} chrome.kill(); };
  return { send, js, close, sleep };
}
