import { expect, test } from '@playwright/test';

test('media test page renders uploads with alt text, or an empty-library notice', async ({
  page,
}) => {
  const response = await page.goto('/media-test');

  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Media delivery test' })).toBeVisible();
  // Never indexable, whatever SITE_ENV the build used.
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);

  const images = page.locator('main img');
  if ((await images.count()) === 0) {
    // CI's database starts empty (Filebase integration tests are skipped there).
    await expect(page.getByText('The media library is empty.')).toBeVisible();
    return;
  }

  const image = images.first();
  await expect(image).toBeVisible();

  // Alt text is enforced at upload time, so it must be present and meaningful.
  const alt = (await image.getAttribute('alt'))?.trim();
  expect(alt?.length ?? 0).toBeGreaterThan(0);

  // The rendered URL must be a real media file URL…
  const src = await image.getAttribute('src');
  expect(src).toMatch(/\.(png|jpe?g|webp|avif)(\?|$)/i);

  // …and it must actually load bytes: the delivery path works end to end.
  await expect
    .poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth), { timeout: 30_000 })
    .toBeGreaterThan(0);
});
