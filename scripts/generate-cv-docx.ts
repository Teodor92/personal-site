// Builds dist/cv.docx straight from the CV data — no HTML in the loop.
//
// Word's own semantics (Title/Heading styles, real bullet numbering, a proper
// hyperlink field) are what ATS parsers read cleanly, so this composes the
// document from src/data/cv.ts rather than converting the rendered page. The
// PDF (scripts/generate-cv-pdf.mjs) is the pixel-faithful artifact; this is the
// machine-readable one. Run it after `astro build`, which clears dist/.
//
// TypeScript entry point: run through tsx (see the build:docx npm script), not
// bare `node`. Node only strips types without a flag from 22.18, and this repo
// still supports Node 22.12 (package.json engines).
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  convertInchesToTwip,
} from 'docx';
import { roles, education, skills, volunteering, interests } from '../src/data/cv';
import { site } from '../src/data/site';
import { cvFileBase } from '../src/data/cv-filename.mjs';

const output = fileURLToPath(new URL(`../dist/${cvFileBase}.docx`, import.meta.url));

const FONT = 'Calibri';
const INK = '1A1A1A';
const MUTED = '555555';

// Section label: Experience / Education / Skills / …
const section = (text: string) =>
  new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 120 } });

// One entry's title line: "Senior AI Software Engineer · YuLife".
const entry = (text: string) =>
  new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 220, after: 0 } });

// Dates / location / grade — the grey line under an entry title.
const meta = (text: string) =>
  new Paragraph({
    children: [new TextRun({ text, color: MUTED, italics: true })],
    spacing: { after: 80 },
  });

const body = (text: string) => new Paragraph({ text, spacing: { after: 80 } });

const bullet = (text: string) =>
  new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 40 } });

const join = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' · ');

const header = [
  new Paragraph({ text: site.name, heading: HeadingLevel.TITLE, spacing: { after: 40 } }),
  new Paragraph({
    children: [new TextRun({ text: site.role, color: MUTED })],
    spacing: { after: 40 },
  }),
  new Paragraph({
    children: [
      new TextRun(site.email),
      new TextRun(' · '),
      new ExternalHyperlink({
        children: [new TextRun({ text: site.url.replace(/^https?:\/\//, ''), style: 'Hyperlink' })],
        link: site.url,
      }),
    ],
  }),
];

const experience = roles.flatMap((role) => [
  entry(join(role.title, role.company)),
  meta(join(role.period, role.location)),
  ...(role.intro ? [body(role.intro)] : []),
  ...role.bullets.map(bullet),
]);

const studies = education.flatMap((item) => [
  entry(join(item.degree, item.school)),
  meta(join(item.location, item.note)),
  body(item.details),
]);

// Mirrors the web CV's <dl>: bold group label, then the items beneath it.
const expertise = skills.flatMap((group) => [
  new Paragraph({
    children: [new TextRun({ text: group.group, bold: true })],
    spacing: { before: 160, after: 20 },
  }),
  body(group.items),
]);

const giving = volunteering.flatMap((item) => [
  entry(join(item.role, item.org)),
  body(item.details),
]);

const doc = new Document({
  creator: site.name,
  title: `${site.name} — Curriculum Vitae`,
  description: site.description,
  styles: {
    default: {
      document: { run: { font: FONT, size: 21, color: INK } },
      title: {
        run: { font: FONT, size: 40, bold: true, color: INK },
        paragraph: { alignment: AlignmentType.LEFT },
      },
      heading1: {
        run: { font: FONT, size: 26, bold: true, color: INK },
      },
      heading2: {
        run: { font: FONT, size: 22, bold: true, color: INK },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(0.7),
            bottom: convertInchesToTwip(0.7),
            left: convertInchesToTwip(0.75),
            right: convertInchesToTwip(0.75),
          },
        },
      },
      children: [
        ...header,
        section('Experience'),
        ...experience,
        section('Education'),
        ...studies,
        section('Skills'),
        ...expertise,
        section('Volunteering'),
        ...giving,
        section('Interests'),
        body(interests.join(' · ')),
      ],
    },
  ],
});

try {
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, await Packer.toBuffer(doc));
  const { size } = await stat(output);
  console.log(`Wrote ${path.relative(process.cwd(), output)} (${Math.round(size / 1024)} kB)`);
} catch (error) {
  console.error(`CV DOCX generation failed: ${(error as Error).message}`);
  process.exitCode = 1;
}
