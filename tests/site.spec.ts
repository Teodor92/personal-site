import { expect, test } from '@playwright/test';

// Smoke tests for the invariants that are easy to break and invisible in a
// normal `npm run build`: the print stylesheet the CV PDF depends on, mobile
// overflow, the keyboard entry point, and progressive enhancement.

test.describe('print stylesheet', () => {
  test('/cv/ drops site chrome but keeps every role heading', async ({ page }) => {
    await page.goto('/cv/');
    await page.emulateMedia({ media: 'print' });

    await expect(page.locator('body > header')).toBeHidden();
    await expect(page.locator('body > footer')).toBeHidden();
    await expect(page.locator('.toc')).toBeHidden();

    // Roles past the fourth wrap their bullets in <details>, but the heading
    // lives outside it — every one of them has to survive into the PDF.
    const headings = page.locator('.timeline article header h3');
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      await expect(headings.nth(i)).toBeVisible();
    }
  });
});

test.describe('narrow viewports', () => {
  for (const path of ['/', '/cv/', '/blog/']) {
    test(`${path} does not scroll sideways at 320px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(path);
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(320);
    });
  }
});

test('the skip link is the first tab stop and moves focus to <main>', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('a.skip-link')).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test.describe('without JavaScript', () => {
  // A separate context with scripting off — the static HTML has to stand alone.
  test.use({ javaScriptEnabled: false });

  test('home page content is not hidden behind a script-driven reveal', async ({ page }) => {
    await page.goto('/');
    const opacities = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll('main section, .post-list li'),
        (el) => getComputedStyle(el).opacity,
      ),
    );
    expect(opacities.length).toBeGreaterThan(0);
    expect(opacities.filter((value) => value !== '1')).toEqual([]);
  });
});

test('a blog post has one h1 and BlogPosting structured data', async ({ page }) => {
  await page.goto('/blog/capturing-qa-context-before-it-evaporates/');
  await expect(page.locator('h1')).toHaveCount(1);

  const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(ld).toContain('"@type":"BlogPosting"');
});

test('the current nav link is underlined, not colour-only', async ({ page }) => {
  await page.goto('/cv/');
  const current = page.locator('body > header nav a[aria-current="page"]');
  await expect(current).toHaveCount(1);

  const decoration = await current.evaluate((el) => getComputedStyle(el).textDecorationLine);
  expect(decoration).toContain('underline');
});
