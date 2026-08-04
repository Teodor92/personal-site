import { toString } from 'mdast-util-to-string';
import getReadingTime from 'reading-time';

// Injects `minutesRead` into remark frontmatter, exposed on
// entry.render()'s remarkPluginFrontmatter (standard Astro recipe).
export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    data.astro.frontmatter.minutesRead = readingTime.text;
  };
}
