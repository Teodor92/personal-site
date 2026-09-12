import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { cvFileBase } from '../src/data/cv-filename.mjs';

// Guards the artifact `npm run build:pdf` ships inside the Pages deploy. It is
// skipped rather than failed when the PDF is absent, so `npm test` still works
// after a plain `npm run build`.
const pdfPath = path.join(fileURLToPath(new URL('../dist/', import.meta.url)), `${cvFileBase}.pdf`);

test('the generated CV PDF is a real, non-empty document', async () => {
  const info = await stat(pdfPath).catch(() => null);
  test.skip(
    info === null,
    `${cvFileBase}.pdf is not in dist/ — run \`npm run build && npm run build:pdf\` to cover it.`,
  );

  // A CV that failed to render still writes a few kB of blank pages.
  expect(info?.size ?? 0).toBeGreaterThan(50 * 1024);

  // Chromium stores the text as subset-font glyph indices, so asserting on the
  // wording would need a full PDF text extractor (see the report). Structure is
  // what is cheap to check here: a valid header and at least one real page.
  const bytes = await readFile(pdfPath);
  expect(bytes.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  expect(bytes.toString('latin1').match(/\/Type\s*\/Page[^s]/g)?.length ?? 0).toBeGreaterThan(0);
});
