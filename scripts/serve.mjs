// A tiny static server that behaves like GitHub Pages: everything under /<base>/, and a folder URL serves its
// index.html (a folder without a trailing slash redirects to one). Needed because pages link ../other-style/.
// node serve.mjs <projectDir> [port=8765] [base=/<projectDir name>]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, basename, resolve } from 'node:path';

const root = resolve(process.argv[2] || '.');
const port = +(process.argv[3] || 8765);
const base = process.argv[4] || '/' + basename(root);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.css': 'text/css', '.md': 'text/plain; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4' };

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p === '/' ) { res.writeHead(302, { Location: base + '/' }).end(); return; }
    if (!p.startsWith(base)) { res.writeHead(404).end('not found'); return; }
    p = normalize(p.slice(base.length) || '/');
    if (p.includes('..')) { res.writeHead(400).end(); return; }
    let f = join(root, p);
    if ((await stat(f)).isDirectory()) {
      if (!req.url.split('?')[0].endsWith('/')) { res.writeHead(301, { Location: req.url.replace(/(\?|$)/, '/$1') }).end(); return; }
      f = join(f, 'index.html');
    }
    const body = await readFile(f);
    res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(body);
  } catch { res.writeHead(404).end('not found'); }
}).listen(port, '127.0.0.1', () => console.log(`serving ${root} at http://127.0.0.1:${port}${base}/`));
