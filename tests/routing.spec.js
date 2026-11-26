// URL state and routing contracts: audit-code.md §2.1 / §7 items 1–6, 37;
// design-system §12.6 (gallery persistence) and §13 (frozen page URLs).
const { test, expect } = require('@playwright/test');
const {
  PAGES, LAB_KEYS, load, waitEnhanced, hash, decodedHash, visibleLabs,
  kaaranState, treeState, fedState, setCounts, galleryIndex,
} = require('./_support');

test.describe('direct loads', () => {
  for (const p of PAGES) {
    test(`${p.name}: ${p.path} loads with 200, a title and one visible h1`, async ({ page }) => {
      const res = await load(page, p.path);
      expect(res.status(), 'HTTP status').toBe(200);
      expect((await page.title()).trim().length).toBeGreaterThan(0);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toBeVisible();
    });
  }

  for (const key of LAB_KEYS) {
    test(`${key}: projects/${key}.html#experiment renders lab defaults and crumb ../index.html#lab/${key} (item 6)`, async ({ page }) => {
      await load(page, `projects/${key}.html#experiment`);
      await waitEnhanced(page);
      expect(await visibleLabs(page)).toEqual([key]);
      await expect(page.locator('.detail .crumb')).toHaveAttribute('href', `../index.html#lab/${key}`);
      if (key === 'federated') expect((await fedState(page)).output).toBe('3');
      if (key === 'tutor') expect((await treeState(page)).svgLabel).toBe('Root 30. 30 has left child 20. 20 has left child 10.');
      if (key === 'kaaran') {
        const k = await kaaranState(page);
        expect([k.bodyLang, k.open, k.select]).toEqual(['en', false, 'n.drop.08K03']);
      }
    });
  }
});

test.describe('home lab router (site.js)', () => {
  test('no hash: Kaaran visible, hash empty, study link carries #lab/kaaran (item 1)', async ({ page }) => {
    await load(page, 'index.html');
    await waitEnhanced(page);
    expect(await hash(page)).toBe('');
    expect(await visibleLabs(page)).toEqual(['kaaran']);
    await expect(page.locator('[data-lab=kaaran] .study-link')).toHaveAttribute('href', 'projects/kaaran.html#lab/kaaran');
    await expect(page.locator('[data-lab=tutor] .study-link')).toHaveAttribute('href', 'projects/tutor.html');
  });

  test('picker switches labs with replaceState, aria-current and one visible panel (item 2)', async ({ page }) => {
    await load(page, 'index.html');
    await waitEnhanced(page);
    const before = await page.evaluate(() => history.length);
    for (const key of ['tutor', 'federated', 'kaaran']) {
      await page.locator(`[data-project=${key}]`).click();
      expect(await hash(page)).toBe('#lab/' + key);
      expect(await visibleLabs(page)).toEqual([key]);
      const current = await page.$$eval('[data-project]', (a) => a.filter((x) => x.getAttribute('aria-current') === 'true').map((x) => x.dataset.project));
      expect(current).toEqual([key]);
    }
    expect(await page.evaluate(() => history.length), 'picker must not add history entries').toBe(before);
  });

  test('picker no-JS hrefs are projects/<key>.html#experiment and modified clicks are not intercepted (item 3)', async ({ page }) => {
    await load(page, 'index.html');
    await waitEnhanced(page);
    expect(await page.$$eval('[data-project]', (a) => a.map((x) => x.getAttribute('href'))))
      .toEqual(['projects/kaaran.html#experiment', 'projects/tutor.html#experiment', 'projects/federated.html#experiment']);
    const prevented = await page.evaluate(() => {
      const out = [];
      const sink = (e) => { out.push(e.defaultPrevented); e.preventDefault(); };
      window.addEventListener('click', sink);
      const a = document.querySelector('[data-project=tutor]');
      for (const mod of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { button: 1 }]) {
        a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...mod }));
      }
      window.removeEventListener('click', sink);
      return out;
    });
    expect(prevented, 'site.js must leave modified clicks to the browser').toEqual([false, false, false, false]);
    expect(await visibleLabs(page)).toEqual(['kaaran']);
  });

  test('hashchange switches labs; unknown key is ignored without errors (item 4)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await load(page, 'index.html');
    await waitEnhanced(page);
    await page.evaluate(() => { location.hash = '#lab/tutor?order=lr&moves=L10.R30'; });
    await expect.poll(() => visibleLabs(page)).toEqual(['tutor']);
    expect((await treeState(page)).svgLabel).toBe('Root 20. 20 has left child 10. 20 has right child 30.');
    await page.evaluate(() => { location.hash = '#lab/unknown'; });
    await page.waitForTimeout(150);
    expect(await visibleLabs(page)).toEqual(['tutor']);
    expect(errors).toEqual([]);
  });

  test('every #lab/... fragment restores after reload', async ({ page }) => {
    const cases = [
      ['#lab/kaaran?lang=mr&cluster=n.mig.gap.08K11', 'kaaran', async () => {
        const k = await kaaranState(page);
        expect([k.bodyLang, k.open, k.select]).toEqual(['mr', true, 'n.mig.gap.08K11']);
      }],
      ['#lab/tutor?moves=R30', 'tutor', async () => {
        expect((await treeState(page)).svgLabel).toBe('Root 20. 20 has left child 10. 20 has right child 30.');
      }],
      ['#lab/tutor?order=lr&moves=L10.R30&node=20', 'tutor', async () => {
        const t = await treeState(page);
        expect([t.sequence, t.node, t.svgLabel, t.undoDisabled]).toEqual(['lr', '20', 'Root 20. 20 has left child 10. 20 has right child 30.', false]);
      }],
      ['#lab/federated?counts=1%2C1%2C2', 'federated', async () => {
        const f = await fedState(page);
        expect([f.counts, f.output]).toEqual([['1', '1', '2'], '3.5']);
      }],
      ['#lab/federated?counts=0,0,0', 'federated', async () => {
        const f = await fedState(page);
        expect([f.counts, f.output]).toEqual([['0', '0', '0'], '—']);
      }],
    ];
    for (const [frag, key, check] of cases) {
      for (const base of ['index.html', `projects/${key}.html`]) {
        await load(page, base + frag);
        await waitEnhanced(page);
        expect(await visibleLabs(page), base + frag).toEqual([key]);
        await check();
        await page.reload();
        await waitEnhanced(page);
        expect(await visibleLabs(page), 'after reload ' + base + frag).toEqual([key]);
        await check();
      }
    }
  });

  test('invalid params fall back to defaults and never throw', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await load(page, 'index.html#lab/kaaran?cluster=bogus&lang=xx');
    await waitEnhanced(page);
    const k = await kaaranState(page);
    expect([k.bodyLang, k.open, k.select]).toEqual(['en', false, 'n.drop.08K03']);

    await load(page, 'index.html#lab/tutor?moves=L30');
    await waitEnhanced(page);
    let t = await treeState(page);
    expect([t.svgLabel, t.undoDisabled]).toEqual(['Root 30. 30 has left child 20. 20 has left child 10.', true]);

    await load(page, 'index.html#lab/tutor?order=zz&node=99');
    await waitEnhanced(page);
    t = await treeState(page);
    expect([t.sequence, t.node]).toEqual(['ll', '30']);

    for (const bad of ['1,2', '1,1,x', '-1,1,1', '1,1,99999', '']) {
      await load(page, 'index.html#lab/federated?counts=' + bad);
      await waitEnhanced(page);
      expect((await fedState(page)).counts, 'counts=' + bad).toEqual(['1', '1', '1']);
    }

    await load(page, 'projects/tutor.html#lab/kaaran?lang=mr');
    await waitEnhanced(page);
    expect(await visibleLabs(page)).toEqual(['tutor']);
    expect(errors).toEqual([]);
  });
});

test.describe('cross-page round trips', () => {
  test('federated: home state -> case study -> crumb -> home (item 5)', async ({ page }) => {
    await load(page, 'index.html');
    await waitEnhanced(page);
    await page.locator('[data-project=federated]').click();
    await setCounts(page, [1, 1, 2]);
    expect(await decodedHash(page)).toBe('#lab/federated?counts=1,1,2');
    const study = page.locator('[data-lab=federated] .study-link');
    expect(decodeURIComponent(await study.getAttribute('href'))).toBe('projects/federated.html#lab/federated?counts=1,1,2');
    await study.click();
    await page.waitForURL(/projects\/federated\.html/);
    await waitEnhanced(page);
    expect((await fedState(page)).output).toBe('3.5');
    const crumb = page.locator('.detail .crumb');
    expect(decodeURIComponent(await crumb.getAttribute('href'))).toBe('../index.html#lab/federated?counts=1,1,2');
    await setCounts(page, [0, 1, 2]);
    expect(decodeURIComponent(await crumb.getAttribute('href'))).toBe('../index.html#lab/federated?counts=0,1,2');
    expect(await decodedHash(page)).toBe('#lab/federated?counts=0,1,2');
    await crumb.click();
    await page.waitForURL(/index\.html#lab\/federated/);
    await waitEnhanced(page);
    expect(await visibleLabs(page)).toEqual(['federated']);
    expect((await fedState(page)).output).toBe('4.333');
  });

  test('kaaran and tutor state survive the study link and the crumb (item 5)', async ({ page }) => {
    await load(page, 'index.html#lab/kaaran?lang=mr&cluster=n.drop.08K07');
    await waitEnhanced(page);
    await expect(page.locator('[data-lab=kaaran] .study-link')).toHaveAttribute('href', 'projects/kaaran.html#lab/kaaran?lang=mr&cluster=n.drop.08K07');
    await page.locator('[data-lab=kaaran] .study-link').click();
    await page.waitForURL(/projects\/kaaran\.html/);
    await waitEnhanced(page);
    let k = await kaaranState(page);
    expect([k.bodyLang, k.open, k.select]).toEqual(['mr', true, 'n.drop.08K07']);
    await expect(page.locator('.detail .crumb')).toHaveAttribute('href', '../index.html#lab/kaaran?lang=mr&cluster=n.drop.08K07');

    await load(page, 'projects/tutor.html#lab/tutor?order=lr&moves=L10.R30&node=20');
    await waitEnhanced(page);
    await expect(page.locator('.detail .crumb')).toHaveAttribute('href', '../index.html#lab/tutor?order=lr&moves=L10.R30&node=20');
    await page.locator('.detail .crumb').click();
    await page.waitForURL(/index\.html#lab\/tutor/);
    await waitEnhanced(page);
    const t = await treeState(page);
    expect([t.sequence, t.node, t.svgLabel]).toEqual(['lr', '20', 'Root 20. 20 has left child 10. 20 has right child 30.']);
  });

  test('Back/Forward: home lab -> case study -> Back restores the lab; Forward restores the case state', async ({ page }) => {
    await load(page, 'index.html');
    await waitEnhanced(page);
    await page.locator('[data-project=tutor]').click();
    await page.locator('[data-lab=tutor] [data-rotate=right]').click({ force: true });
    expect(await hash(page)).toBe('#lab/tutor?moves=R30');
    await page.locator('[data-lab=tutor] .study-link').click();
    await page.waitForURL(/projects\/tutor\.html#lab\/tutor\?moves=R30/);
    await waitEnhanced(page);
    expect((await treeState(page)).svgLabel).toBe('Root 20. 20 has left child 10. 20 has right child 30.');
    await page.goBack();
    await page.waitForURL(/index\.html#lab\/tutor\?moves=R30/);
    await waitEnhanced(page);
    expect(await visibleLabs(page)).toEqual(['tutor']);
    expect((await treeState(page)).svgLabel).toBe('Root 20. 20 has left child 10. 20 has right child 30.');
    await page.goForward();
    await page.waitForURL(/projects\/tutor\.html/);
    await waitEnhanced(page);
    expect((await treeState(page)).svgLabel).toBe('Root 20. 20 has left child 10. 20 has right child 30.');
  });

  test('home -> case study (gallery) -> Back restores gallery plate and lab selection (§12.6)', async ({ page }) => {
    await load(page, 'index.html');
    await waitEnhanced(page);
    await page.locator('[data-project=federated]').click();
    await setCounts(page, [2, 1, 1]);
    await expect(page.locator('#gallery'), 'gallery (§12.1) must exist').toHaveCount(1);
    await page.locator('#work').scrollIntoViewIfNeeded();
    for (let i = 0; i < 2; i++) await page.locator('#next').click();
    await expect.poll(() => galleryIndex(page)).toBe(2);
    const link = page.locator('#deck-link');
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^projects\/[a-z]+\.html/);
    await link.click();
    await page.waitForURL(/projects\//);
    await page.goBack();
    await page.waitForURL(/index\.html/);
    await waitEnhanced(page);
    await expect.poll(() => galleryIndex(page), { message: 'gallery restores the plate after Back' }).toBe(2);
    expect(await visibleLabs(page)).toEqual(['federated']);
    expect((await fedState(page)).output).toBe('2.5');
  });
});

test.describe('deep links land in view', () => {
  const targets = [
    ['index.html#lab/federated?counts=1,1,2', '[data-lab=federated]'],
    ['index.html#lab/kaaran?lang=mr&cluster=n.mig.gap.08K11', '[data-lab=kaaran]'],
    ['projects/federated.html#lab/federated?counts=1,1,2', '[data-lab=federated]'],
    ['projects/tutor.html#lab/tutor?moves=R30', '[data-lab=tutor]'],
    ['projects/kaaran.html#lab/kaaran?cluster=n.drop.08K07', '[data-lab=kaaran]'],
    ['projects/notebook.html#trees?order=random&size=5000&metric=time', '#trees'],
    ['projects/notebook.html#retrieval?scenario=split&channel=hybrid', '#retrieval'],
    ['projects/notebook.html#insertion?step=3', '#insertion'],
  ];
  for (const [url, sel] of targets) {
    test(`@responsive ${url} lands with ${sel} top inside the viewport (item 37)`, async ({ page }) => {
      await load(page, url);
      await page.waitForTimeout(400); // fonts swap / late layout
      const box = await page.evaluate((sel) => {
        const r = document.querySelector(sel).getBoundingClientRect();
        const h = document.querySelector('[data-header]');
        const hb = h ? h.getBoundingClientRect() : null;
        // a sticky header that is showing must not cover the target's top edge
        const covered = hb && h.getAttribute('data-hidden') !== 'true' && hb.bottom > 0 ? hb.bottom : 0;
        return { top: r.top, h: innerHeight, covered };
      }, sel);
      expect(box.top, `top=${box.top}, header bottom=${box.covered}`).toBeGreaterThanOrEqual(Math.max(-2, box.covered - 2));
      expect(box.top).toBeLessThan(box.h * 0.5);
    });
  }
});
