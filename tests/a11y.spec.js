// Accessibility gates: design-system §14 (axe 0 violations at 390 and 1440,
// one h1, landmarks, skip link) and audit §7 item 35.
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { PAGES, load, scrollThrough } = require('./_support');

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

function axe(page) {
  return new AxeBuilder({ page })
    .withTags(TAGS)
    // experimental rule the design system names explicitly (§14, MF-30)
    .options({ rules: { 'label-content-name-mismatch': { enabled: true } } });
}

function summarise(results) {
  return results.violations.map((v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
}

for (const p of PAGES) {
  test(`@responsive axe: ${p.name} has 0 violations after every section has revealed`, async ({ page }) => {
    await load(page, p.path);
    await scrollThrough(page);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(1200); // reveal transitions finish
    const results = await axe(page).analyze();
    expect(summarise(results), `${p.path}`).toEqual([]);
  });

  test(`@responsive structure: ${p.name} has one h1, banner/main/contentinfo landmarks and a labelled primary nav`, async ({ page }) => {
    await load(page, p.path);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('banner')).toHaveCount(1);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('contentinfo')).toHaveCount(1);
    await expect(page.locator('main#main')).toHaveCount(1);
    expect(await page.locator('nav[aria-label]').count()).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.lang)).toBe('en');
  });

  test(`skip link: ${p.name} first Tab stop is "Skip to content" and it moves focus past the header`, async ({ page }) => {
    await load(page, p.path);
    await page.keyboard.press('Tab');
    const first = await page.evaluate(() => ({ href: document.activeElement.getAttribute('href'), text: document.activeElement.textContent.trim() }));
    expect(first).toEqual({ href: '#main', text: 'Skip to content' });
    await expect(page.locator(':focus')).toBeVisible();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    const inMain = await page.evaluate(() => !!document.activeElement.closest('main'));
    expect(inMain, 'the next Tab after the skip link lands inside <main>').toBe(true);
  });
}

test('@responsive axe: nav overlay and command palette open states have 0 violations', async ({ page }) => {
  await load(page, 'index.html');
  const opener = page.locator('[data-menu-open]');
  await opener.click();
  await expect(page.locator('#nav-overlay')).toHaveJSProperty('open', true);
  await page.waitForTimeout(600);
  let results = await axe(page).include('#nav-overlay').analyze();
  expect(summarise(results), 'nav overlay').toEqual([]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+k');
  await expect(page.locator('#palette')).toHaveJSProperty('open', true);
  await page.keyboard.type('tree');
  await page.waitForTimeout(600);
  results = await axe(page).include('#palette').analyze();
  expect(summarise(results), 'palette').toEqual([]);
});

test('@responsive axe: Marathi evidence state has 0 violations and declares lang=mr', async ({ page }) => {
  await load(page, 'projects/kaaran.html#lab/kaaran?lang=mr&cluster=n.mig.gap.08K11');
  await page.waitForTimeout(800);
  expect(await page.locator('[data-lab=kaaran] [data-evidence-body]').getAttribute('lang')).toBe('mr');
  const results = await axe(page).include('[data-lab=kaaran]').analyze();
  expect(summarise(results)).toEqual([]);
});

test('every image has alt, width and height', async ({ page }) => {
  const missing = [];
  for (const p of PAGES) {
    await load(page, p.path);
    const bad = await page.$$eval('img', (imgs) => imgs.filter((i) => !i.hasAttribute('alt') || !i.getAttribute('width') || !i.getAttribute('height')).map((i) => i.outerHTML.slice(0, 120)));
    missing.push(...bad.map((b) => `${p.path}: ${b}`));
  }
  expect(missing).toEqual([]);
});

test('focus ring is visible (>= 3px outline or box-shadow) on header, paper and night surfaces', async ({ page }) => {
  await load(page, 'index.html');
  const targets = ['[data-header] a[href="#main"]', '[data-header] .wordmark, [data-header] a[href$="index.html"]', '#contact a[href^="mailto:"]', '#bench a, #bench button'];
  for (const sel of targets) {
    const el = page.locator(sel).first();
    if (!(await el.count())) continue;
    await el.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const ring = await page.evaluate(() => {
      const s = getComputedStyle(document.activeElement);
      return { width: parseFloat(s.outlineWidth) || 0, style: s.outlineStyle, shadow: s.boxShadow };
    });
    const ok = (ring.style !== 'none' && ring.width >= 2.9) || (ring.shadow && ring.shadow !== 'none');
    expect(ok, `${sel}: ${JSON.stringify(ring)}`).toBe(true);
  }
});
