const { test, expect } = require('@playwright/test');
const { PAGES, galleryIndex } = require('./_support');

test('@engines gallery, search and notebook restoration', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('index.html#work');
  await page.locator('#next').click();
  await expect.poll(() => galleryIndex(page)).toBe(1);
  await page.locator('#deck-link').click();
  await expect(page).toHaveURL(/projects\/tutor\.html/);
  await page.goBack();
  await expect.poll(() => galleryIndex(page)).toBe(1);

  await page.keyboard.press('Control+k');
  const palette = page.locator('#palette');
  await expect(palette).toBeVisible();
  await palette.getByRole('combobox').fill('notebook');
  await expect(palette.getByRole('option').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await page.goto('projects/notebook.html#insertion?step=3');
  await expect(page.locator('#step')).toHaveValue('3');
  await page.locator('#step').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#step')).toHaveValue('4');
  await page.reload();
  await expect(page.locator('#step')).toHaveValue('4');

  expect(errors).toEqual([]);
});

test.describe('small-screen routes', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('@engines mobile pages load and fit the screen', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const { path } of PAGES) {
      const response = await page.goto(path);
      expect(response.status(), path).toBe(200);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
    }
    expect(errors).toEqual([]);
  });
});
