const { test, expect } = require('@playwright/test');

async function openGallery(page) {
  await page.goto('index.html#work');
  await expect(page.locator('#gallery')).toHaveClass(/is-ready/);
  await page.locator('[data-gallery-stage]').scrollIntoViewIfNeeded();
}

async function expectMobileSelection(page, index) {
  await expect.poll(() => page.evaluate(() => {
    const ring = document.querySelector('#ring');
    const active = ring.querySelector('.slide.is-active');
    const target = ring.getBoundingClientRect().left + parseFloat(getComputedStyle(ring).paddingLeft);
    return {
      index: window.DC.gallery.index,
      nameMatches: active.dataset.name === document.querySelector('[data-gallery-name]').textContent,
      aligned: Math.abs(active.getBoundingClientRect().left - target) <= 1,
      saved: history.state?.plate,
    };
  })).toEqual({ index, nameMatches: true, aligned: true, saved: index });
}

test('desktop pointer drag selects a project without opening its link; keyboard preserves the endpoint', async ({ page }) => {
  await openGallery(page);
  const stage = await page.locator('[data-gallery-stage]').boundingBox();
  const x = stage.x + stage.width / 2;
  const y = stage.y + stage.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 90, y, { steps: 12 });
  await page.waitForTimeout(150); // release as a drag, after the flick velocity window
  await page.mouse.up();
  await expect(page).toHaveURL(/index\.html#work$/);
  await expect(page.locator('#slide-tutor')).toHaveClass(/is-active/);

  const current = page.locator('[data-gallery-stop][aria-current="true"]');
  await current.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(current).toBeFocused();
  await expect(page.locator('#slide-kaaran')).toHaveClass(/is-active/);
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#prev')).toHaveAttribute('aria-disabled', 'true');
  await expect(current).toBeFocused();
  await expect(page.locator('#deck-link')).toHaveAttribute('href', 'projects/kaaran.html');
});

test.describe('native mobile gallery', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(page.viewportSize().width >= 760, 'Native strip is used below 760 px.');
    await openGallery(page);
  });

  test('@responsive swipe from the artwork selects the project at the settled snap point', async ({ page, context }) => {
    const box = await page.locator('#slide-kaaran .plate__art').boundingBox();
    const start = Math.round(box.x + box.width * 0.87);
    const y = Math.round(box.y + box.height * 0.5);
    const cdp = await context.newCDPSession(page);
    try {
      const send = (type, x) => cdp.send('Input.dispatchTouchEvent', {
        type, touchPoints: x === undefined ? [] : [{ x, y }],
      });
      await send('touchStart', start);
      for (let step = 1; step <= 10; step++) {
        await send('touchMove', start - Math.round(box.width * 0.78 * step / 10));
      }
      await page.waitForTimeout(160); // avoid inertial travel beyond this deliberate one-project swipe
      await send('touchEnd');
      await expectMobileSelection(page, 1);
      await expect(page).toHaveURL(/index\.html#work$/);
    } finally {
      await cdp.detach();
    }
  });

  test('@responsive interrupting a smooth seek reconciles the physical snap and stored selection', async ({ page }) => {
    await page.evaluate(() => window.DC.gallery.go(4));
    await expect.poll(() => page.locator('#ring').evaluate(ring => ring.scrollLeft)).toBeGreaterThan(0);
    await page.locator('#ring').evaluate(ring => ring.scrollTo({ left: 0, behavior: 'instant' }));
    await expectMobileSelection(page, 0);
  });

  test('@responsive a peeking project link opens natively and Back restores that project and its inset', async ({ page }) => {
    const plate = await page.locator('#slide-tutor .plate').boundingBox();
    await page.touchscreen.tap(Math.ceil(plate.x + 5), Math.ceil(plate.y + 40));
    await expect(page).toHaveURL(/\/projects\/tutor\.html$/);
    await page.goBack();
    await expectMobileSelection(page, 1);
    await page.locator('#next').focus();
    await page.keyboard.press('End');
    await expect(page.locator('#slide-notebook .slide__cta')).toBeFocused();
    await expectMobileSelection(page, 4);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/projects\/notebook\.html$/);
    await page.goBack();
    await expectMobileSelection(page, 4);
  });
});
