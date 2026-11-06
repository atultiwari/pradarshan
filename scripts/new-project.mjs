// Scaffolds a new project from the worked example, with only the styles asked for.
//
// node new-project.mjs <dir> --styles sketchbook,turntable,working-model --name "Microwave Bench"
//                      --tagline "How a microwave heats food" [--credit "Made with ♥ by …"] [--url https://…]
//
// What it does (mechanical work only; the content is yours to write, see SKILL.md):
//  - copies each chosen style folder from examples/he-staining as the starting point, with its engine
//  - copies the generic version switcher and fills in the site name, tagline and styles
//  - writes index.html (redirects to the first style), docs/spec.md (from the template), .gitignore, .nojekyll
//  - replaces the example's footer credit and website if --credit / --url are given
//  - prints the checklist of example-specific things to replace
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SKILL = resolve(HERE, '..');
const EXAMPLE = join(SKILL, 'examples', 'he-staining');
const STYLES = {
  sketchbook: { name: 'Sketchbook', hint: 'Hand-drawn 2D' },
  turntable: { name: 'Turntable', hint: 'Rotate in 3D' },
  'working-model': { name: 'Working Model', hint: 'Every number from one model' },
};

const argv = process.argv.slice(2);
const dir = argv[0];
const opt = k => { const i = argv.indexOf('--' + k); return i > 0 ? argv[i + 1] : undefined; };
if (!dir || dir.startsWith('--')) { console.error('usage: node new-project.mjs <dir> --styles a,b --name "…" --tagline "…" [--credit "…"] [--url …]'); process.exit(2); }
const styles = (opt('styles') || 'sketchbook').split(',').map(s => s.trim()).filter(Boolean);
for (const s of styles) if (!STYLES[s]) { console.error(`unknown style "${s}"; choose from ${Object.keys(STYLES).join(', ')}`); process.exit(2); }
const name = opt('name') || 'Project name', tagline = opt('tagline') || 'An interactive guide to …';
const credit = opt('credit'), url = opt('url');

const out = resolve(dir);
if (existsSync(out) && readdirSync(out).length) { console.error(`${out} exists and is not empty`); process.exit(1); }
mkdirSync(out, { recursive: true });

for (const s of styles) {
  cpSync(join(EXAMPLE, s), join(out, s), { recursive: true });
  if (s === 'working-model' && existsSync(join(out, s, 'index.html'))) rmSync(join(out, s, 'index.html'));
}
mkdirSync(join(out, 'shared'), { recursive: true });
mkdirSync(join(out, 'docs'), { recursive: true });

// the switcher, configured
const versions = styles.map(s => `      { dir: '${s}', name: '${STYLES[s].name}', hint: '${STYLES[s].hint}' },`).join('\n');
let sw = readFileSync(join(SKILL, 'assets', 'shared', 'switcher.js'), 'utf8')
  .replace("name: 'Project name',", `name: ${JSON.stringify(name)},`)
  .replace("tagline: 'An interactive guide to …',", `tagline: ${JSON.stringify(tagline)},`)
  .replace(/versions: \[\n[\s\S]*?\n    \],/, `versions: [\n${versions}\n    ],`);
writeFileSync(join(out, 'shared', 'switcher.js'), sw);
cpSync(join(EXAMPLE, 'shared', 'qr.svg'), join(out, 'shared', 'qr.svg'));

// root redirect, docs, housekeeping
const first = styles[0];
writeFileSync(join(out, 'index.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name}: ${tagline}</title>
<meta http-equiv="refresh" content="0; url=${first}/">
<script>location.replace('${first}/' + location.search + location.hash);</script>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f2efe7;color:#231e16;font:16px/1.5 system-ui,sans-serif}a{color:inherit}</style>
</head>
<body><p>Opening <a href="${first}/">${name}</a>…</p></body>
</html>
`);
cpSync(join(SKILL, 'references', 'spec-template.md'), join(out, 'docs', 'spec.md'));
writeFileSync(join(out, '.gitignore'), '.DS_Store\nnode_modules/\n*.log\nshots/\nframes/\n');
writeFileSync(join(out, '.nojekyll'), '');

// footer credit / website
const EX_CREDITS = ['and a passion for teaching pathology · Dr. Atul Tiwari', 'and a passion for teaching pathology &middot; Dr. Atul Tiwari'];
const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(out).filter(f => /\.(html|js|mjs)$/.test(f));
for (const f of files) {
  let s = readFileSync(f, 'utf8'), o = s;
  s = s.replace(/<script src="\.\.\/shared\/switcher\.js" defer><\/script>/g, '<script src="../shared/switcher.js" defer></script>');
  if (credit) for (const c of EX_CREDITS) s = s.split(c).join(credit.replace(/^Made with ♥ ?/, ''));
  if (url) s = s.split('https://atultiwari.com/').join(url).split('atultiwari.com').join(url.replace(/^https?:\/\//, '').replace(/\/$/, ''));
  if (s !== o) writeFileSync(f, s);
}

console.log(`created ${out} with ${styles.join(', ')}

Next (see SKILL.md):
  1. Write docs/spec.md first: steps, parts, the window, the numbers and their sources.
  2. In each style folder, replace the H&E content with yours. Example-specific names to replace:
     ${styles.includes('sketchbook') ? 'sketchbook/index.html: HE_STATIONS, HE_STEPS, HE_LOOK, the jars, rack, microscope field, notes\n     ' : ''}${styles.includes('turntable') ? 'turntable/he-data.js, he-build.js, he-scope.js, he-app.js (rename he- files freely)\n     ' : ''}${styles.includes('working-model') ? 'working-model/src/model.mjs, world.mjs, art.mjs, tissue.mjs, live.js, build.mjs\n     ' : ''}page titles ("H&E Staining · …"), the hint lines, the footer credit${credit ? '' : ' (pass --credit)'}, shared/qr.svg${url ? ' (regenerate: python3 scripts/qr.py <url> shared/qr.svg)' : ' (remove the QR link, or pass --url and run qr.py)'}
  3. node scripts/serve.mjs ${dir} and node scripts/check-pages.mjs http://127.0.0.1:8765/<name> ${styles.join(',')}`);
