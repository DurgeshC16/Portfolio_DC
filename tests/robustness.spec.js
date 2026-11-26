// Robustness: console/network health, internal link crawl, external links,
// images, slow assets, no-JS fallbacks (audit §2.5, §7 items 32, 34; design-system §14).
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { PAGES, DIST, load, settle, watchHealth, scrollThrough, distFiles, rel, clsInit } = require('./_support');

/* ======================================================== console/network */
for (const p of PAGES) {
  test(`@responsive health: ${p.name} has 0 console errors, 0 page errors, 0 failed requests`, async ({ page }) => {
    const h = watchHealth(page);
    await load(page, p.path);
    await scrollThrough(page);
    await page.waitForTimeout(500);
    expect({ console: h.console, pageErrors: h.pageErrors, failed: h.failed, http: h.http })
      .toEqual({ console: [], pageErrors: [], failed: [], http: [] });
  });
}

test('health: lab interactions and dialogs raise no errors', async ({ page }) => {
  const h = watchHealth(page);
  await load(page, 'index.html');
  for (const key of ['tutor', 'federated', 'kaaran']) await page.locator(`[data-project=${key}]`).click();
  await page.locator('[data-lab=kaaran] [data-language=mr]').click();
  await page.locator('[data-menu-open]').click();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+k');
  await page.keyboard.type('kaaran');
  await page.keyboard.press('Escape');
  await load(page, 'projects/notebook.html#trees?order=random&size=1000&metric=time');
  await page.locator('#step').fill('2');
  expect({ console: h.console, pageErrors: h.pageErrors, failed: h.failed, http: h.http })
    .toEqual({ console: [], pageErrors: [], failed: [], http: [] });
});

test('no duplicate ids on any page (after scripts run)', async ({ page }) => {
  const dups = [];
  for (const p of PAGES) {
    await load(page, p.path);
    const d = await page.evaluate(() => {
      const seen = new Map();
      for (const el of document.querySelectorAll('[id]')) seen.set(el.id, (seen.get(el.id) || 0) + 1);
      return [...seen].filter(([, n]) => n > 1).map(([id, n]) => `${id} x${n}`);
    });
    dups.push(...d.map((x) => `${p.path}: ${x}`));
  }
  expect(dups).toEqual([]);
});

/* ================================================== internal link crawl */
const htmlFiles = distFiles(['.html']);
const docCache = new Map();
function readDoc(abs) {
  if (!docCache.has(abs)) docCache.set(abs, fs.readFileSync(abs, 'utf8').replace(/<!--[\s\S]*?-->/g, ''));
  return docCache.get(abs);
}
function hasId(html, id) {
  const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\sid=["']${esc}["']`).test(html);
}
/** Check one fragment against a target document; returns an error string or null. */
function checkFragment(targetAbs, frag) {
  if (!frag || frag === 'top' && /id=["']top["']/.test(readDoc(targetAbs))) return null;
  if (!targetAbs.endsWith('.html')) {
    if (targetAbs.endsWith('.svg')) {
      const svg = fs.readFileSync(targetAbs, 'utf8');
      return new RegExp(`id=["']${frag}["']`).test(svg) ? null : `symbol #${frag} missing in ${rel(targetAbs)}`;
    }
    return null;
  }
  const html = readDoc(targetAbs);
  const lab = frag.match(/^lab\/([a-z]+)(?:\?.*)?$/);
  if (lab) return new RegExp(`data-lab=["']${lab[1]}["']`).test(html) ? null : `no [data-lab=${lab[1]}] in ${rel(targetAbs)}`;
  const id = decodeURIComponent(frag.split('?')[0]);
  return hasId(html, id) ? null : `#${id} not found in ${rel(targetAbs)}`;
}
function checkRef(fromAbs, raw, kind, problems, baseDir) {
  const url = raw.trim().replace(/&amp;/g, '&');
  if (!url || /^(https?:|mailto:|tel:|data:)/i.test(url)) return;
  const where = `${rel(fromAbs)} ${kind}="${url}"`;
  if (/^javascript:/i.test(url)) return problems.push(`${where}: javascript: URL`);
  if (url.startsWith('//')) return problems.push(`${where}: protocol-relative URL`);
  // The branded 404 is served at arbitrary depths and has a fixed document base.
  if (rel(fromAbs) === '404.html' && kind === 'href' && url === '/404.html' && fs.existsSync(path.join(DIST, '404.html'))) return;
  if (url.startsWith('/')) return problems.push(`${where}: root-relative URL (all URLs must be relative, §9)`);
  const [pathPart, frag] = url.split('#');
  const clean = pathPart.split('?')[0];
  const target = clean ? path.resolve(baseDir || path.dirname(fromAbs), decodeURIComponent(clean)) : fromAbs;
  if (!target.startsWith(DIST)) return problems.push(`${where}: escapes dist/`);
  if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) return problems.push(`${where}: file not found (${rel(target)})`);
  const fe = checkFragment(target, frag);
  if (fe) problems.push(`${where}: ${fe}`);
}

test('internal links: every href/src/srcset/url()/sprite reference in dist resolves', () => {
  const problems = [];
  for (const f of htmlFiles) {
    const html = readDoc(f);
    const attr = /\s(href|src|poster|data-src|xlink:href|action)=["']([^"']*)["']/gi; let m;
    while ((m = attr.exec(html))) checkRef(f, m[2], m[1], problems);
    const srcset = /\s(?:srcset|imagesrcset)=["']([^"']*)["']/gi;
    while ((m = srcset.exec(html))) for (const c of m[1].split(',')) checkRef(f, c.trim().split(/\s+/)[0], 'srcset', problems);
    const meta = /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*content=["']([^"']+)["']/gi;
    while ((m = meta.exec(html))) checkRef(f, m[1], 'og:image', problems);
    const style = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
    while ((m = style.exec(html))) checkRef(f, m[1], 'url()', problems);
  }
  for (const f of distFiles(['.css'])) {
    const css = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const re = /url\(\s*["']?([^"')]+)["']?\s*\)/gi; let m;
    while ((m = re.exec(css))) if (!m[1].startsWith('#')) checkRef(f, m[1], 'url()', problems);
  }
  // URL strings in the new JS modules resolve against dist/ (DC.url) – e.g. the palette index
  for (const f of distFiles(['.js'])) {
    const js = fs.readFileSync(f, 'utf8');
    const re = /['"`]((?:projects\/[\w-]+\.html|index\.html|404\.html|assets\/[\w./-]+\.\w+)(?:#[^'"`\s]*)?)['"`]/g; let m;
    while ((m = re.exec(js))) checkRef(f, m[1], 'js-string', problems, DIST);
  }
  expect(problems).toEqual([]);
});

test('every <use href> sprite icon id exists in assets/icons.svg', () => {
  const sprite = fs.readFileSync(path.join(DIST, 'assets', 'icons.svg'), 'utf8');
  const ids = new Set([...sprite.matchAll(/<symbol[^>]*\sid=["']([^"']+)["']/g)].map((m) => m[1]));
  const missing = [];
  for (const f of [...htmlFiles, ...distFiles(['.js'])]) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/icons\.svg#([\w-]+)/g)) if (!ids.has(m[1])) missing.push(`${rel(f)}: #${m[1]}`);
  }
  expect([...new Set(missing)]).toEqual([]);
});

test('nested missing pages retain HTTP 404, their artwork and a working route home', async ({ page }) => {
  const response = await page.goto('projects/missing/example');
  expect(response.status()).toBe(404);
  await expect(page.locator('[data-nf-path]')).toContainText('/projects/missing/example');
  await expect(page.locator('main h1')).toBeVisible();
  expect(await page.locator('[data-nf-img]').evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.locator('main a[href$="index.html"]').first().click();
  await expect(page.locator('#hero-name')).toBeVisible();
});

/* ======================================================== external links */
test('external links are reachable (report only; fails on 404/410)', async () => {
  test.skip(!!process.env.SKIP_EXTERNAL, 'SKIP_EXTERNAL is set');
  test.setTimeout(180_000);
  const urls = new Set();
  for (const f of htmlFiles) {
    for (const m of readDoc(f).matchAll(/\shref=["'](https?:\/\/[^"']+)["']/gi)) urls.add(m[1].replace(/&amp;/g, '&'));
  }
  for (const f of distFiles(['.js'])) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/['"`](https?:\/\/[^'"`\s]+)['"`]/g)) urls.add(m[1]);
  }
  const BOT_WALLED = /linkedin\.com|leetcode\.com/;
  const results = [];
  const list = [...urls].filter((u) => !/^https?:\/\/www\.w3\.org\/\d{4}\//.test(u)).sort(); // XML namespaces
  async function probe(u) {
    const attempt = async (method) => {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 20_000);
      try {
        const r = await fetch(u, { method, redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': 'Mozilla/5.0 (link-check)' } });
        return r.status;
      } finally { clearTimeout(t); }
    };
    try {
      let s = await attempt('HEAD');
      if ([403, 405, 429, 999].includes(s) || s >= 500) s = await attempt('GET');
      return s;
    } catch (e) { return 'ERR ' + (e.name === 'AbortError' ? 'timeout' : e.message); }
  }
  for (let i = 0; i < list.length; i += 6) {
    const batch = list.slice(i, i + 6);
    const statuses = await Promise.all(batch.map(probe));
    batch.forEach((u, j) => results.push({ url: u, status: statuses[j] }));
  }
  test.info().annotations.push({ type: 'external-links', description: results.map((r) => `${r.status} ${r.url}`).join('\n') });
  await test.info().attach('external-links.json', { body: JSON.stringify(results, null, 1), contentType: 'application/json' });
  const broken = results.filter((r) => (r.status === 404 || r.status === 410) && !BOT_WALLED.test(r.url));
  expect(broken).toEqual([]);
  // security notice S1: never link the repo that holds a leaked token
  expect(list.filter((u) => /Autism-Detection-using-FL/i.test(u))).toEqual([]);
});

/* ================================================================ images */
test('images: lazy below the fold, eager above it, intrinsic ratio matches width/height', async ({ page }) => {
  const problems = [];
  for (const p of PAGES) {
    await load(page, p.path);
    const pre = await page.evaluate(() => [...document.images].map((i) => {
      const r = i.getBoundingClientRect();
      return { src: i.getAttribute('src'), top: r.top + scrollY, loading: i.getAttribute('loading'), vh: innerHeight, shown: i.checkVisibility() };
    }));
    for (const i of pre) {
      if (!i.shown) continue;
      if (i.top > i.vh * 1.2 && i.loading !== 'lazy') problems.push(`${p.path}: ${i.src} is below the fold (top ${Math.round(i.top)}) but not loading=lazy`);
      if (i.top < i.vh * 0.8 && i.loading === 'lazy') problems.push(`${p.path}: ${i.src} is above the fold but loading=lazy`);
    }
    await scrollThrough(page);
    await page.waitForTimeout(400);
    const ratio = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth).map((i) => ({
      src: i.currentSrc || i.src, nat: i.naturalWidth / i.naturalHeight, attr: Number(i.getAttribute('width')) / Number(i.getAttribute('height')),
    })));
    for (const r of ratio) {
      if (!isFinite(r.attr)) continue;
      if (Math.abs(r.nat - r.attr) / r.attr > 0.03) problems.push(`${p.path}: ${r.src} intrinsic ratio ${r.nat.toFixed(3)} vs width/height ${r.attr.toFixed(3)}`);
    }
  }
  expect(problems).toEqual([]);
});

test('images in dist are web formats and not oversized (> 400 KB)', () => {
  const big = [];
  for (const f of distFiles(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif'])) {
    const kb = fs.statSync(f).size / 1024;
    if (kb > 400) big.push(`${rel(f)} ${Math.round(kb)} KB`);
  }
  expect(big).toEqual([]);
});

/* ========================================================== slow assets */
// Fonts and images are delayed separately so a failure names its cause:
// font swaps must not move layout (metric-matched fallbacks) and images must reserve their box.
const SLOW = {
  images: /\.(webp|png|jpe?g|avif|gif|svg)(\?.*)?$/i,
  fonts: /\.woff2(\?.*)?$/i,
};
for (const [kind, pattern] of Object.entries(SLOW)) {
  for (const p of PAGES) {
    test(`@responsive slow ${kind}: ${p.name} is readable before ${kind} arrive and shifts < 0.01`, async ({ page }) => {
      await page.addInitScript(clsInit);
      await page.route(pattern, async (route) => {
        await new Promise((r) => setTimeout(r, 1500));
        await route.continue().catch(() => {});
      });
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);
      const early = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        let o = 1;
        for (let e = h1; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity);
        const r = h1.getBoundingClientRect();
        return { opacity: o, visible: h1.checkVisibility({ visibilityProperty: true }), w: r.width, h: r.height, text: h1.textContent.trim() };
      });
      expect(early.visible, 'h1 rendered at first paint').toBe(true);
      expect(early.opacity, 'h1 readable at first paint (MF-01: never opacity 0)').toBeGreaterThanOrEqual(0.35);
      expect(early.w * early.h).toBeGreaterThan(0);
      expect(early.text.length).toBeGreaterThan(3);
      await page.waitForLoadState('load', { timeout: 20_000 });
      await settle(page);
      await page.waitForTimeout(800);
      const { cls, shifts } = await page.evaluate(() => ({ cls: window.__cls, shifts: window.__shifts }));
      expect(cls, JSON.stringify(shifts.slice(0, 4))).toBeLessThan(0.01);
    });
  }
}

/* ================================================================= no-JS */
test.describe('without JavaScript (item 34)', () => {
  test.use({ javaScriptEnabled: false });

  for (const p of PAGES) {
    test(`${p.name}: content visible, primary links present, no dead controls`, async ({ page }) => {
      await page.goto(p.path);
      await expect(page.locator('h1')).toBeVisible();
      const header = page.locator('header').first();
      for (const name of [/^Work/, /^Contact/, /Résumé/]) await expect(header.getByRole('link', { name }).first()).toBeVisible();
      const dead = await page.$$eval('button, select, input, textarea', (els) => els.filter((e) => e.checkVisibility({ visibilityProperty: true })).map((e) => e.outerHTML.slice(0, 100)));
      expect(dead, 'controls that need JS must be hidden without it').toEqual([]);
      const dim = await page.$$eval('h1, h2, h3, p', (els) => els.filter((e) => e.checkVisibility() && parseFloat(getComputedStyle(e).opacity) < 0.99).map((e) => e.outerHTML.slice(0, 80)));
      expect(dim, 'no reveal start state applies without JS').toEqual([]);
    });
  }

  test('home: Kaaran noscript evidence, tutor sentence, equal federated bars, five gallery links', async ({ page }) => {
    await page.goto('index.html');
    // the noscript evidence sits inside the native <details> disclosure: reachable, not necessarily open
    await expect(page.locator('[data-lab=kaaran] details > summary')).toBeVisible();
    const evidence = await page.locator('[data-lab=kaaran]').textContent();
    for (const v of ['11.6', '14.7', '7.4']) expect(evidence).toContain(v);
    expect(await page.locator('a[href*="api/home?role=beo&block=BPandharpur"]').count()).toBeGreaterThan(0);
    // the tutor panel is hidden until picked; without JS the picker links to the case page,
    // so the sentence only has to exist in the home DOM (it is checked visible on tutor.html)
    expect(await page.locator('[data-lab=tutor]').textContent()).toMatch(/right rotation at 30 promotes node 20/);
    const bars = await page.$$eval('[data-lab=federated] .weight-plot i', (i) => i.map((x) => getComputedStyle(x).getPropertyValue('--height').trim() || x.style.getPropertyValue('--height')));
    expect(new Set(bars).size, `static bars must match the equal default counts: ${bars}`).toBe(1);
    for (const key of ['kaaran', 'tutor', 'federated', 'certivault', 'notebook']) {
      expect(await page.locator(`#work a[href^="projects/${key}.html"]`).count(), key).toBeGreaterThan(0);
    }
  });

  test('case pages and notebook keep their static evidence', async ({ page }) => {
    await page.goto('projects/kaaran.html');
    await expect(page.locator('[data-lab=kaaran] details > summary')).toBeVisible();
    let text = await page.locator('[data-lab=kaaran]').textContent();
    for (const v of ['11.6', '14.7', '7.4']) expect(text).toContain(v);
    await page.goto('projects/tutor.html');
    expect(await page.locator('body').innerText()).toMatch(/right rotation at 30 promotes node 20/);
    await page.goto('projects/notebook.html');
    const plot = await page.$$eval('.plot-row strong', (s) => s.map((x) => x.textContent.trim()));
    expect(plot).toEqual(['14', '24', '10,000']);
    text = await page.locator('#rank-results').innerText();
    expect(text).toContain('0.03226');
  });
});
