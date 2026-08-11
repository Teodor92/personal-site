// URL slugs for tags: lowercase, and any run of non-alphanumerics (spaces,
// punctuation, slashes) collapses to a single hyphen — so `Claude Code` is
// served at /tags/claude-code/ and nothing can emit a path with a space or a
// stray `/` in it. Display casing is never derived from the slug; the original
// tag string from the frontmatter is what gets rendered.
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
