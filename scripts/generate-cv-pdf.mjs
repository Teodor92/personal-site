// Renders the already-built /cv/ page to dist/cv.pdf with headless Chromium.
//
// Runs *after* `astro build` (it serves dist/, it doesn't create it), so a plain
// `npm run build` stays Playwright-free — see the `build:pdf` npm script and the
// deploy workflow. dist/ is served by a throwaway in-process static server on an
// OS-assigned port: nothing to spawn, no port clashes, and no way to leak an
// orphan process if this script dies. Any failure exits non-zero so CI is loud.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { cvFileBase } from '../src/data/cv-filename.mjs';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const output = path.join(root, `${cvFileBase}.pdf`);

const MIME = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// URLs are directory-style (build.format: 'directory'), so /cv/ -> dist/cv/index.html.
async function resolveFile(url) {
  const pathname = decodeURIComponent(url.split(/[?#]/)[0]);
  const target = path.join(root, path.normalize(pathname));
  if (!target.startsWith(root)) return null; // no traversal out of dist/
  for (const candidate of [target, path.join(target, 'index.html')]) {
    const info = await stat(candidate).catch(() => null);
    if (info?.isFile()) return candidate;
  }
  return null;
}

const server = createServer(async (req, res) => {
  const file = await resolveFile(req.url ?? '/');
  if (!file) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  res.writeHead(200, {
    'content-type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
  });
  res.end(await readFile(file));
});

async function generate() {
  const entry = path.join(root, 'cv', 'index.html');
  if (!(await stat(entry).catch(() => null))) {
    throw new Error(`${entry} not found — run \`npm run build\` first.`);
  }

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const url = `http://127.0.0.1:${server.address().port}/cv/`;
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const response = await page.goto(url, { waitUntil: 'load' });
    if (!response?.ok()) throw new Error(`GET ${url} responded ${response?.status()}`);

    // Collapsed <details> (the older roles) render nothing, and Chromium's
    // print-to-PDF never fires `beforeprint`, so the page's own handler can't
    // help here — open them before printing so the PDF is the full CV.
    await page.evaluate(() => {
      for (const details of document.querySelectorAll('details')) details.open = true;
    });
    // Avoid printing a fallback-font flash of the variable Inter face.
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    // page.pdf() emulates print media by default, so the print stylesheet
    // (light palette, no header/footer/nav) is what lands in the PDF.
    await page.pdf({
      path: output,
      format: 'A4',
      printBackground: true,
      margin: { top: '14mm', bottom: '14mm', left: '12mm', right: '12mm' },
    });
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  const { size } = await stat(output);
  console.log(`Wrote ${path.relative(process.cwd(), output)} (${Math.round(size / 1024)} kB)`);
}

try {
  await generate();
} catch (error) {
  console.error(`CV PDF generation failed: ${error.message}`);
  process.exitCode = 1;
}
