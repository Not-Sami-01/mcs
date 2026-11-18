import { expect, test } from '@playwright/test';

test('public page is reachable but marked noindex outside production', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.getByRole('heading', { name: 'Website scaffold is running' })).toBeVisible();

  const headers = response?.headers();
  expect(headers?.['x-robots-tag']).toBe('noindex, nofollow');
  expect(headers?.['x-content-type-options']).toBe('nosniff');
  expect(headers?.['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers?.['content-security-policy-report-only']).toContain("frame-ancestors 'none'");
});

test('robots disallows crawling outside production', async ({ request }) => {
  const response = await request.get('/robots.txt');

  expect(response.status()).toBe(200);
  await expect(response.text()).resolves.toContain('Disallow: /');
});
