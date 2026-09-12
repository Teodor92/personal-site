import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
const baseURL = `http://localhost:${PORT}`;

// `astro build` wipes dist/ — and by the time the deploy workflow runs the
// tests, dist/ also holds the generated CV PDF and DOCX, which a rebuild would
// delete before the Pages artifact is uploaded. So build only when there is
// nothing to serve: CI (and anyone who ran `npm run build`) gets a plain
// preview, a cold checkout still gets a working `npm test`.
const distIndex = fileURLToPath(new URL('./dist/index.html', import.meta.url));
const command = existsSync(distIndex) ? 'npm run preview' : 'npm run build && npm run preview';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
    // Astro 7 auto-daemonises `astro preview` when it detects an AI coding
    // agent driving the terminal, and Playwright then reports the webServer as
    // having "exited early". This env var is Astro's opt-out of that
    // detection; CI never triggers it, but local `npm test` runs do.
    env: { ASTRO_PREVIEW_BACKGROUND: '0' },
  },
});
