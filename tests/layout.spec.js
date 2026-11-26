// Layout gates: design-system §14 (no horizontal overflow at 320–1920, CLS < 0.01)
// and §13.1 page-height targets (reported, not enforced).
const { test, expect } = require('@playwright/test');
const { PAGES, WIDTHS, load, scrollThrough, clsInit } = require('./_support');

for (const p of PAGES) {
  test(`no horizontal overflow: ${p.name} at ${WIDTHS.join('/')}`, async ({ page }) => {
    const failures = [];
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: w < 760 ? 844 : 900 });
      await load(page, p.path);
      await scrollThrough(page, { pause: 30 });
      await page.waitForTimeout(150);
      const r = await page.evaluate(() => {
        const de = document.documentElement;
        const cw = de.clientWidth;
        const culprits = [];
        if (de.scrollWidth > cw) {
          for (const el of document.body.querySelectorAll('*')) {
            const b = el.getBoundingClientRect();
            if (b.width && b.right > cw + 1) {
              // report the outermost offender only
              if (!culprits.some((c) => c.el.contains(el))) culprits.push({ el, right: Math.round(b.right) });
            }
            if (culprits.length > 5) break;
          }
        }
        return {
          scrollWidth: de.scrollWidth, clientWidth: cw,
          culprits: culprits.map((c) => `${c.el.tagName.toLowerCase()}${c.el.id ? '#' + c.el.id : ''}${typeof c.el.className === 'string' && c.el.className ? '.' + c.el.className.trim().split(/\s+/).join('.') : ''} right=${c.right}`),
        };
      });
      if (r.scrollWidth > r.clientWidth) failures.push(`${w}px: scrollWidth ${r.scrollWidth} > ${r.clientWidth} (${r.culprits.join('; ')})`);
    }
    expect(failures).toEqual([]);
  });
}

for (const p of PAGES) {
  test(`@responsive CLS < 0.01 on load: ${p.name}`, async ({ page }) => {
    await page.addInitScript(clsInit);
    await load(page, p.path);
    await page.waitForTimeout(2500); // hero assembly, fonts, reveals
    const { cls, shifts } = await page.evaluate(() => ({ cls: window.__cls, shifts: window.__shifts }));
    expect(cls, JSON.stringify(shifts.slice(0, 5))).toBeLessThan(0.01);
  });
}

test('CLS < 0.01 at 320 on every page', async ({ page }) => {
  const out = [];
  await page.setViewportSize({ width: 320, height: 700 });
  await page.addInitScript(clsInit);
  for (const p of PAGES) {
    await load(page, p.path);
    await page.waitForTimeout(2000);
    const cls = await page.evaluate(() => window.__cls);
    if (cls >= 0.01) out.push(`${p.path}: ${cls.toFixed(4)} ${JSON.stringify(await page.evaluate(() => window.__shifts.slice(0, 3)))}`);
  }
  expect(out).toEqual([]);
});

test('home page height targets (§13.1: desktop <= 5200 px, mobile <= 6200 px) are reported', async ({ page }) => {
  const report = {};
  for (const [w, h, limit] of [[1440, 900, 5200], [390, 844, 6200]]) {
    await page.setViewportSize({ width: w, height: h });
    await load(page, 'index.html');
    await scrollThrough(page, { pause: 20 });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    report[w] = { height, limit, within: height <= limit };
  }
  test.info().annotations.push({ type: 'page-height', description: JSON.stringify(report) });
});
