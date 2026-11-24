import { expect, test } from '@playwright/test';

test('the home page renders one heading inside the site chrome', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Primary navigation' }).first()).toBeVisible();
});

test('an unknown URL returns the public 404 page inside the site chrome', async ({ page }) => {
  const response = await page.goto('/cp32-does-not-exist');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Primary navigation' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go to the home page' })).toBeVisible();
});
