// Keyboard and dialog contracts: design-system §10.1–10.2 (header, nav overlay),
// §10.13 (command palette), §12.1–12.5 (gallery), MF-21/22/24/27.
const { test, expect } = require('@playwright/test');
const { load, galleryIndex, runningAnimations } = require('./_support');

/* ============================================================== Gallery */
test.describe('gallery (desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { try { sessionStorage.clear(); } catch (e) { /* ignore */ } });
    await load(page, 'index.html');
    await expect(page.locator('#gallery'), 'gallery #gallery (§12.1)').toHaveCount(1);
    await page.locator('#gallery').scrollIntoViewIfNeeded();
  });

  test('ARIA: labelled carousel region, five slides all in the a11y tree, plates out of the tab order', async ({ page }) => {
    const g = page.locator('#gallery');
    await expect(g).toHaveAttribute('aria-roledescription', 'carousel');
    await expect(g).toHaveAttribute('aria-label', 'Project gallery');
    const slides = page.locator('#ring > li');
    await expect(slides).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      await expect(slides.nth(i)).toHaveAttribute('aria-roledescription', 'slide');
      await expect(slides.nth(i)).toHaveAttribute('aria-label', `${i + 1} of 5`);
      expect(await slides.nth(i).getAttribute('aria-hidden')).not.toBe('true');
    }
    const keys = await slides.evaluateAll((s) => s.map((x) => x.dataset.key));
    expect(keys.sort()).toEqual(['certivault', 'federated', 'kaaran', 'notebook', 'tutor']);
    const plateTab = await page.$$eval('#ring a', (a) => a.filter((x) => x.closest('li') && x.matches('a:not([tabindex="-1"])') && x.checkVisibility && x.checkVisibility()).length);
    expect(plateTab, 'on desktop only the deck CTA is the tabbable project link').toBe(0);
    await expect(page.locator('#gallery-live')).toHaveAttribute('aria-live', 'polite');
  });

  test('exactly four tab stops: Prev -> index (one roving stop) -> Next -> deck CTA (MF-22)', async ({ page }) => {
    const stops = await page.evaluate(() => {
      const sel = 'a[href], button, input, select, textarea, [tabindex]';
      return [...document.querySelectorAll(`#gallery :is(${sel})`)]
        .filter((e) => e.tabIndex >= 0 && !e.disabled && e.checkVisibility({ visibilityProperty: true, opacityProperty: false }) && !e.closest('[inert]'))
        .map((e) => e.id || e.textContent.trim().slice(0, 20));
    });
    expect(stops, JSON.stringify(stops)).toHaveLength(4);
    await page.locator('#prev').focus();
    const order = ['prev'];
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
      order.push(await page.evaluate(() => {
        const e = document.activeElement;
        if (e.closest('#gallery [role=group][aria-label="Jump to project"]')) return 'index';
        return e.id;
      }));
    }
    expect(order).toEqual(['prev', 'index', 'next', 'deck-link']);
  });

  test('arrow keys, Home/End move the selection and focus the deck CTA; nothing bound outside (MF-21, MF-27)', async ({ page }) => {
    expect(await galleryIndex(page)).toBe(0);
    await page.locator('#next').focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => galleryIndex(page)).toBe(1);
    await expect(page.locator('#deck-link')).toBeFocused();
    await expect(page.locator('#gallery-live')).toHaveText(/Project 2 of 5/);
    await page.keyboard.press('End');
    await expect.poll(() => galleryIndex(page)).toBe(4);
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => galleryIndex(page), 'clamped, no wrap-around (MF-05)').toBe(4);
    await expect(page.locator('#next')).toHaveAttribute('aria-disabled', 'true');
    await page.keyboard.press('Home');
    await expect.poll(() => galleryIndex(page)).toBe(0);
    await expect(page.locator('#prev')).toHaveAttribute('aria-disabled', 'true');
    // keys outside the gallery are not hijacked
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press('ArrowRight');
    expect(await galleryIndex(page)).toBe(0);
  });

  test('index stops: one roving tab stop with aria-current on the active plate', async ({ page }) => {
    const stops = page.locator('#gallery [role=group][aria-label="Jump to project"] button');
    await expect(stops).toHaveCount(5);
    await stops.nth(3).click();
    await expect.poll(() => galleryIndex(page)).toBe(3);
    const tabbable = await stops.evaluateAll((b) => b.map((x) => x.tabIndex));
    expect(tabbable.filter((t) => t === 0)).toHaveLength(1);
    expect(tabbable[3]).toBe(0);
  });

  test('disabled Prev at the first plate is a focusable no-op', async ({ page }) => {
    const prev = page.locator('#prev');
    await expect(prev).toHaveAttribute('aria-disabled', 'true');
    await prev.click({ force: true });
    expect(await galleryIndex(page)).toBe(0);
    await prev.focus();
    await expect(prev).toBeFocused();
  });

  test('rapid Next/Prev clicks end in a consistent state (animation interruption)', async ({ page }) => {
    const next = page.locator('#next');
    const prev = page.locator('#prev');
    for (let i = 0; i < 12; i++) await next.click({ delay: 0, force: true });
    for (let i = 0; i < 3; i++) await prev.click({ delay: 0, force: true });
    for (let i = 0; i < 5; i++) { await next.click({ delay: 0, force: true }); await prev.click({ delay: 0, force: true }); }
    await page.waitForTimeout(1600);
    const idx = await galleryIndex(page);
    expect(idx).toBe(1);
    const state = await page.evaluate((idx) => {
      const slide = document.querySelectorAll('#ring > li')[idx];
      const title = slide.querySelector('h3');
      return {
        deckTitle: (document.getElementById('deck-title') || {}).textContent,
        slideTitle: title ? title.textContent : null,
        deckHref: document.getElementById('deck-link').getAttribute('href'),
        slideHref: slide.querySelector('a[href]').getAttribute('href'),
        live: document.getElementById('gallery-live').textContent,
      };
    }, idx);
    expect((state.deckTitle || '').trim()).toBe((state.slideTitle || '').trim());
    expect(state.deckHref).toBe(state.slideHref);
    expect(state.live).toMatch(/Project 2 of 5/);
    expect(await runningAnimations(page, '#gallery'), 'no gallery animation still running 1.6 s after the burst').toEqual([]);
  });

  test('1440x900: heading, active plate, counter, controls, title and CTA fit one viewport after #work scrolls to top (MF-04)', async ({ page }) => {
    await page.evaluate(() => document.getElementById('work').scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.waitForTimeout(1000);
    const boxes = await page.evaluate(() => {
      const idx = 0;
      const els = {
        heading: document.querySelector('#work h2'),
        plate: document.querySelectorAll('#ring > li')[idx].querySelector('a'),
        prev: document.getElementById('prev'),
        next: document.getElementById('next'),
        title: document.getElementById('deck-title'),
        cta: document.getElementById('deck-link'),
      };
      return Object.fromEntries(Object.entries(els).map(([k, e]) => {
        if (!e) return [k, null];
        const r = e.getBoundingClientRect();
        return [k, { top: Math.round(r.top), bottom: Math.round(r.bottom), h: innerHeight }];
      }));
    });
    for (const [k, b] of Object.entries(boxes)) {
      expect(b, `${k} exists`).not.toBeNull();
      expect(b.top, `${k} top`).toBeGreaterThanOrEqual(0);
      expect(b.bottom, `${k} bottom`).toBeLessThanOrEqual(b.h);
    }
  });
});

test.describe('gallery (mobile strip)', () => {
  test('@responsive below 760 the strip scrolls natively and Next advances the plate', async ({ page }) => {
    const vw = page.viewportSize().width;
    test.skip(vw >= 760, 'mobile strip only (< 760)');
    await page.addInitScript(() => { try { sessionStorage.clear(); } catch (e) { /* ignore */ } });
    await load(page, 'index.html');
    await expect(page.locator('#gallery'), 'gallery #gallery (§12.1)').toHaveCount(1);
    await page.locator('#gallery').scrollIntoViewIfNeeded();
    const ring = page.locator('#ring');
    const before = await ring.evaluate((r) => r.scrollLeft);
    await page.locator('#next').click();
    await expect.poll(() => ring.evaluate((r) => r.scrollLeft)).toBeGreaterThan(before + 50);
    await expect.poll(() => page.evaluate(() => Number(JSON.parse(sessionStorage.getItem('dc.plate'))))).toBe(1);
    const touch = await page.$$eval('#ring, #ring > li, #ring a', (els) => els.map((e) => getComputedStyle(e).touchAction).filter((t) => t !== 'auto'));
    expect(touch, 'no touch-action on strip plates (MF-19)').toEqual([]);
    const ctas = await page.$$eval('#ring > li', (li) => li.map((x) => [...x.querySelectorAll('a[href]')].some((a) => a.tabIndex >= 0)));
    expect(ctas, 'every slide has a tabbable case-study link').toEqual([true, true, true, true, true]);
  });
});

/* ============================================================== Palette */
test.describe('command palette', () => {
  test('Ctrl+K opens, Esc closes and focus returns to the previously focused element', async ({ page }) => {
    await load(page, 'index.html');
    const anchor = page.locator('[data-header] a[href="#main"]');
    await page.keyboard.press('Tab');
    await expect(anchor).toBeFocused();
    await page.keyboard.press('Control+k');
    const palette = page.locator('#palette');
    await expect(palette).toHaveJSProperty('open', true);
    const combo = palette.getByRole('combobox');
    await expect(combo).toBeFocused();
    await expect(combo).toHaveAttribute('aria-controls', 'palette-list');
    await expect(page.locator('#palette-list')).toHaveAttribute('role', 'listbox');
    expect(await palette.getByRole('option').count()).toBeGreaterThan(0);
    await page.keyboard.press('Escape');
    await expect(palette).toHaveJSProperty('open', false);
    await expect(anchor).toBeFocused();
  });

  test('header button opens the palette; typing filters; arrows drive aria-activedescendant; Enter navigates', async ({ page }) => {
    await load(page, 'index.html');
    const btn = page.locator('[data-header] [data-palette-open]');
    const vw = page.viewportSize().width;
    if (vw < 760) test.skip(true, 'Search moves into the overlay below 760');
    await btn.click();
    const palette = page.locator('#palette');
    await expect(palette).toHaveJSProperty('open', true);
    await page.keyboard.type('tutor');
    const options = palette.getByRole('option');
    await expect.poll(() => options.count()).toBeGreaterThan(0);
    expect(await options.count()).toBeLessThanOrEqual(8);
    await page.keyboard.press('ArrowDown');
    const active = await palette.getByRole('combobox').getAttribute('aria-activedescendant');
    expect(active).toBeTruthy();
    await expect(page.locator('#' + active)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Home');
    await page.keyboard.press('Enter');
    await page.waitForURL(/tutor/);
  });

  test('Ctrl+K is ignored while typing in a form field', async ({ page }) => {
    await load(page, 'index.html#lab/federated');
    await page.locator('[data-lab=federated] [data-client]').first().focus();
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(200);
    await expect(page.locator('#palette')).toHaveJSProperty('open', false);
  });

  test('Ctrl+K works on every page', async ({ page }) => {
    for (const p of ['projects/kaaran.html', 'projects/notebook.html', 'projects/certivault.html', '404.html']) {
      await load(page, p);
      await page.keyboard.press('Control+k');
      await expect(page.locator('#palette'), p).toHaveJSProperty('open', true);
      await page.keyboard.press('Escape');
      await expect(page.locator('#palette'), p).toHaveJSProperty('open', false);
    }
  });
});

/* ========================================================== Nav overlay */
test.describe('nav overlay', () => {
  test('@responsive Index opens a modal dialog that traps focus; Esc closes and restores focus', async ({ page }) => {
    await load(page, 'index.html');
    const opener = page.locator('[data-menu-open]');
    await expect(opener).toBeVisible();
    await expect(opener).toHaveAttribute('aria-expanded', 'false');
    await opener.focus();
    await page.keyboard.press('Enter');
    const dialog = page.locator('#nav-overlay');
    await expect(dialog).toHaveJSProperty('open', true);
    await expect(opener).toHaveAttribute('aria-expanded', 'true');
    expect(await dialog.evaluate((d) => d.matches(':modal'))).toBe(true);
    const links = await dialog.locator('a[href]').count();
    expect(links, 'overlay lists sections and case studies').toBeGreaterThanOrEqual(5);
    const escaped = [];
    for (let i = 0; i < links + 8; i++) {
      await page.keyboard.press('Tab');
      const where = await page.evaluate(() => {
        const e = document.activeElement;
        if (!e || e === document.body || e === document.documentElement) return 'body';
        return e.closest('#nav-overlay') ? 'inside' : (e.outerHTML || '').slice(0, 80);
      });
      if (where !== 'inside' && where !== 'body') escaped.push(where);
    }
    expect(escaped, 'focus never reaches the page behind the modal').toEqual([]);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveJSProperty('open', false);
    await expect(opener).toHaveAttribute('aria-expanded', 'false');
    await expect(opener).toBeFocused();
  });

  test('@responsive overlay links close the dialog and navigate', async ({ page }) => {
    await load(page, 'projects/kaaran.html');
    await page.locator('[data-menu-open]').click();
    const dialog = page.locator('#nav-overlay');
    await expect(dialog).toHaveJSProperty('open', true);
    const link = dialog.locator('a[href*="notebook.html"]').first();
    await link.click();
    await page.waitForURL(/notebook\.html/);
    await expect(page.locator('#nav-overlay')).toHaveJSProperty('open', false);
  });

  test('@responsive header keeps Work, Contact and Résumé visible at every width (MF-24)', async ({ page }) => {
    await load(page, 'index.html');
    const header = page.locator('[data-header]');
    await expect(header.getByRole('link', { name: /^Work/ })).toBeVisible();
    await expect(header.getByRole('link', { name: /^Contact/ })).toBeVisible();
    await expect(header.getByRole('link', { name: /Résumé/ })).toBeVisible();
  });
});

/* ======================================================== Copy e-mail */
test('copy email announces through the live region', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await load(page, 'index.html');
  const btn = page.locator('#contact [data-copy-email]');
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await expect(page.locator('#contact [data-copy-live]')).toHaveText(/copied/i);
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  const mail = await page.locator('#contact a[href^="mailto:"]').first().getAttribute('href');
  expect('mailto:' + clip).toBe(mail);
});
