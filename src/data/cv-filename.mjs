// Shared by cv.astro and both scripts/generate-cv-* generators, so the link
// hrefs and the emitted files can't drift apart. Plain .mjs (not .ts) because
// generate-cv-pdf.mjs runs under bare node, which can't import TypeScript.
// The year is stamped at build time; every deploy in a new year renames the
// artifacts automatically.
export const cvFileBase = `Teodor-Kurtev-CV-${new Date().getFullYear()}`;
