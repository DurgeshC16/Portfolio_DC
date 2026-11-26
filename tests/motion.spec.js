// Motion gates: design-system §6.4–6.5 and §14 (MF-11, MF-12, MF-13).
// @motion tests run only in the reduced-motion project; the static CSS/JS scans
// and the idle rAF budget run in the desktop project.
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { PAGES, DIST, load, distFiles, rel, rafCounterInit, runningAnimations, scrollThrough } = require('./_support');

/* ------------------------------------------------- reduced motion (@motion) */
for (const p of PAGES) {
  test(`@motion reduced motion: ${p.name} has 0 running animations 300 ms after load and no .intro`, async ({ page }) => {
    await load(page, p.path);
    await page.waitForTimeout(300);
    expect(await runningAnimations(page)).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.classList.contains('intro'))).toBe(false);
    await scrollThrough(page, { pause: 40 });
    await page.waitForTimeout(300);
    expect(await runningAnimations(page), 'after scrolling (reveals)').toEqual([]);
  });
}

test('@motion reduced motion: 0 running animations 300 ms after each interaction', async ({ page }) => {
  await load(page, 'index.html');
  const check = async (label) => {
    await page.waitForTimeout(300);
    expect(await runningAnimations(page), label).toEqual([]);
  };
  if (await page.locator('#next').count()) {
    await page.locator('#gallery').scrollIntoViewIfNeeded();
    await page.locator('#next').click();
    await check('gallery next');
  }
  await page.locator('[data-menu-open]').click();
  await check('nav overlay open');
  await page.keyboard.press('Escape');
  await check('nav overlay close');
  await page.keyboard.press('Control+k');
  await check('palette open');
  await page.keyboard.type('note');
  await check('palette typing');
  await page.keyboard.press('Escape');
  await check('palette close');
  await page.locator('[data-project=tutor]').click();
  await page.locator('[data-lab=tutor] [data-rotate=right]').click({ force: true });
  await check('tree rotation');
  const copy = page.locator('#contact [data-copy-email]');
  await copy.scrollIntoViewIfNeeded();
  await copy.click();
  await check('copy email');
});

test('@motion reduced motion: no rAF activity at idle', async ({ page }) => {
  await page.addInitScript(rafCounterInit);
  await load(page, 'index.html');
  await page.waitForTimeout(500);
  const a = await page.evaluate(() => window.__raf);
  await page.waitForTimeout(1000);
  const b = await page.evaluate(() => window.__raf);
  expect(b - a, 'rAF calls per second at idle').toBe(0);
});

/* -------------------------------------------- idle budget (normal motion) */
test('normal motion: rAF loops sleep at idle on the hero and when offscreen (MF-12)', async ({ page }) => {
  await page.addInitScript(rafCounterInit);
  await load(page, 'index.html');
  await page.mouse.move(5, 500);
  await page.waitForTimeout(4000); // hero assembly ~2.9 s, then the loop sleeps
  let a = await page.evaluate(() => window.__raf);
  await page.waitForTimeout(1000);
  let b = await page.evaluate(() => window.__raf);
  expect(b - a, 'rAF/s at idle with the hero in view').toBe(0);
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1200);
  a = await page.evaluate(() => window.__raf);
  await page.waitForTimeout(1000);
  b = await page.evaluate(() => window.__raf);
  expect(b - a, 'rAF/s at idle with the hero offscreen').toBe(0);
});

test('normal motion: no CSS animation is still running 6 s after load (no infinite loops)', async ({ page }) => {
  for (const p of ['index.html', 'projects/kaaran.html', 'projects/notebook.html', '404.html']) {
    await load(page, p);
    await page.waitForTimeout(6000);
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && a.effect && a.effect.getComputedTiming().iterations === Infinity).map((a) => a.animationName || a.id || 'anim'));
    expect(running, p).toEqual([]);
  }
});

/* --------------------------------------------------------- static scans */
function stripComments(css) { return css.replace(/\/\*[\s\S]*?\*\//g, ''); }

function cssSources() {
  const files = distFiles(['.css']).map((f) => ({ file: rel(f), css: stripComments(fs.readFileSync(f, 'utf8')) }));
  for (const f of distFiles(['.html'])) {
    const html = fs.readFileSync(f, 'utf8');
    let m; const re = /<style[^>]*>([\s\S]*?)<\/style>/gi; let i = 0;
    while ((m = re.exec(html))) files.push({ file: `${rel(f)} <style #${++i}>`, css: stripComments(m[1]) });
    const attr = /style="([^"]*)"/gi;
    while ((m = attr.exec(html))) files.push({ file: `${rel(f)} style=""`, css: m[1] });
  }
  return files;
}

test('no infinite animations anywhere in shipped CSS or JS (§6.4 rule 2)', () => {
  const hits = [];
  for (const { file, css } of cssSources()) {
    const re = /(animation(?:-iteration-count)?\s*:[^;}]*\binfinite\b)/gi; let m;
    while ((m = re.exec(css))) hits.push(`${file}: ${m[1].trim()}`);
  }
  for (const f of distFiles(['.js'])) {
    const js = fs.readFileSync(f, 'utf8');
    const re = /(iterations\s*:\s*Infinity|animation(?:IterationCount)?\s*=\s*['"][^'"]*infinite)/g; let m;
    while ((m = re.exec(js))) hits.push(`${rel(f)}: ${m[1]}`);
  }
  expect(hits).toEqual([]);
});

test('transitions and keyframes animate only transform/opacity/clip-path/stroke-dashoffset (§6.4 rule 1)', () => {
  const LAYOUT = /\b(width|height|top|left|right|bottom|margin(?:-\w+)?|padding(?:-\w+)?|border-radius|letter-spacing|font-size|inset)\b/;
  const hits = [];
  for (const { file, css } of cssSources()) {
    // transition / transition-property declarations
    const re = /transition(?:-property)?\s*:\s*([^;}]+)/gi; let m;
    while ((m = re.exec(css))) {
      for (const part of m[1].split(',')) {
        const prop = part.trim().split(/\s+/)[0];
        if (LAYOUT.test(prop) && !/^(max|min)-/.test(prop)) hits.push(`${file}: transition ${part.trim()}`);
      }
    }
    // keyframe bodies
    const kf = /@keyframes\s+([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*)[^{}]*\}/gi;
    while ((m = kf.exec(css))) {
      const decls = m[2].match(/([\w-]+)\s*:/g) || [];
      for (const d of decls) {
        const prop = d.replace(':', '').trim();
        if (LAYOUT.test(prop) && prop === prop.match(LAYOUT)[0]) hits.push(`${file}: @keyframes ${m[1]} animates ${prop}`);
      }
    }
  }
  expect(hits).toEqual([]);
});

test('reduced-motion and view-transition opt-outs exist in shipped CSS (§6.5, §10.16)', () => {
  const all = cssSources().map((s) => s.css).join('\n');
  expect(all).toMatch(/prefers-reduced-motion:\s*reduce/);
  if (/@view-transition/.test(all)) {
    expect(all, 'view transitions must be disabled under reduced motion').toMatch(/@view-transition\s*\{\s*navigation:\s*none/);
  }
  expect(fs.existsSync(path.join(DIST, 'css', 'tokens.css'))).toBe(true);
});
