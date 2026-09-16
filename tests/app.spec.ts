import { test, expect } from '@playwright/test';

test('has title and renders canvas', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Babylon\.js Lite App/);

  // Expect the canvas to be present
  const canvas = page.locator('#renderCanvas');
  await expect(canvas).toBeVisible();
});

test('babylon engine loads successfully without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (exception) => {
    errors.push(exception.message);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto('/');

  // Wait for the model to finish loading by checking the flag set in main.ts
  await page.waitForFunction(() => (window as any).modelLoaded === true, { timeout: 10000 });

  // Check if Babylon was successfully initialized by looking at canvas elements
  // In our code, we didn't expose the engine to window, but we know the canvas is used
  const canvasCount = await page.locator('canvas').count();
  expect(canvasCount).toBeGreaterThan(0);

  // Verify there are no uncaught errors related to loading
  const loadErrors = errors.filter(e => e.includes('SceneLoader') || e.includes('Babylon'));
  expect(loadErrors.length).toBe(0);
});
