// Shared helpers for the DC. archive test suite. Not a spec file.
// Tests target stable contracts (URL formats, ids, data-attributes, roles,
// accessible names) from _research/audit-code.md §2 and docs/design-system.md,
// never styling classes, unless the class itself is a documented JS contract
// (e.g. `.study-link`, `.detail .crumb`, `.plot-row`, `.weight-plot`).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'http://127.0.0.1:8408/'; // keep in sync with playwright.config.js
const DIST = path.join(ROOT, 'dist');

/** Every page that ships. `labs` = the [data-lab] keys the page hosts. */
const PAGES = [
  { name: 'home', path: 'index.html', labs: ['kaaran', 'tutor', 'federated'] },
  { name: 'kaaran', path: 'projects/kaaran.html', labs: ['kaaran'] },
  { name: 'tutor', path: 'projects/tutor.html', labs: ['tutor'] },
  { name: 'federated', path: 'projects/federated.html', labs: ['federated'] },
  { name: 'certivault', path: 'projects/certivault.html', labs: [] },
  { name: 'notebook', path: 'projects/notebook.html', labs: [] },
  { name: '404', path: '404.html', labs: [] },
];
const LAB_KEYS = ['kaaran', 'tutor', 'federated'];
const WIDTHS = [320, 390, 768, 1024, 1440, 1920];

/** Glyphs outside the shipped font subsets (design-system §4.2). */
const FORBIDDEN_GLYPHS = /[←→↗↘✓✕₁₂⌈⌉≈≤≥⌘↵●]/u;

/* ------------------------------------------------------------------ data */

/** Evaluate a legacy data script (top-level const) and return the named binding. */
function loadDataScript(rel, name) {
  const src = fs.readFileSync(path.join(DIST, rel), 'utf8');
  const ctx = vm.createContext({});
  vm.runInContext(src + `\n;globalThis.__out = ${name};`, ctx);
  return ctx.__out;
}

/* ------------------------------------------------------------ navigation */

/** Wait for the page to be interactive: load, fonts, two frames. */
async function settle(page) {
  await page.waitForLoadState('load');
  await page.evaluate(async () => {
    try { await document.fonts.ready; } catch (e) { /* ignore */ }
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

/**
 * Real document load of `url`, even when only the fragment differs from the
 * current URL (page.goto with a new hash on the same document is a
 * same-document navigation and would not re-run the page scripts).
 */
async function load(page, url) {
  const current = page.url();
  if (current && current !== 'about:blank') {
    const strip = (u) => u.split('#')[0];
    const target = new URL(url, BASE).href;
    if (strip(target) === strip(current)) await page.goto('about:blank');
  }
  const response = await page.goto(url);
  await settle(page);
  return response;
}

/** Wait until the legacy lab scripts (site.js / notebook.js) have run. */
async function waitEnhanced(page) {
  await page.waitForFunction(() => document.documentElement.classList.contains('enhanced'), null, { timeout: 10_000 });
}

const hash = (page) => page.evaluate(() => location.hash);
const decodedHash = async (page) => decodeURIComponent(await hash(page));
const norm = (s) => (s == null ? s : String(s).replace(/\s+/g, ' ').trim());

/** Keys of the [data-lab] panels that are not hidden. */
function visibleLabs(page) {
  return page.$$eval('[data-lab]', (p) => p.filter((x) => !x.hidden).map((x) => x.dataset.lab));
}

/* ----------------------------------------------------------- lab readers */

function kaaranState(page, scope = '[data-lab=kaaran]') {
  return page.evaluate((scope) => {
    const root = document.querySelector(scope);
    const q = (s) => root.querySelector(s);
    const t = (s) => (q(s) ? q(s).textContent.replace(/\s+/g, ' ').trim() : null);
    return {
      bodyLang: q('[data-evidence-body]').lang,
      pressed: Object.fromEntries([...root.querySelectorAll('[data-language]')].map((b) => [b.dataset.language, b.getAttribute('aria-pressed')])),
      open: q('details').open,
      select: q('select').value,
      name: t('[data-record-name]'),
      finding: t('[data-record-finding]'),
      period: t('[data-record-period]'),
      workbooks: [...root.querySelectorAll('[data-workbooks] li')].map((l) => l.textContent.trim()),
      sourceHref: q('[data-record-url]').href,
      snapshot: t('[data-snapshot]'),
      question: t('[data-e-text=question]'),
      inspect: t('[data-e-text=inspect]'),
      label: t('[data-e-text=choose]'),
    };
  }, scope);
}

function treeState(page, scope = '[data-lab=tutor]') {
  return page.evaluate((scope) => {
    const root = document.querySelector(scope);
    const svg = root.querySelector('[data-nodes]').closest('svg');
    const nodes = [...root.querySelectorAll('[data-nodes] > *')].map((g) => {
      const label = g.getAttribute('aria-label') || '';
      const key = Number((label.match(/node (\d+)/i) || [])[1] || g.textContent.trim());
      const box = g.getBoundingClientRect();
      return { key, x: box.left + box.width / 2, y: box.top + box.height / 2, pressed: g.getAttribute('aria-pressed') };
    });
    return {
      svgLabel: svg.getAttribute('aria-label'),
      reading: root.querySelector('[data-tree-reading]').textContent.replace(/\s+/g, ' ').trim(),
      status: root.querySelector('[data-tree-status]').textContent.replace(/\s+/g, ' ').trim(),
      undoDisabled: root.querySelector('[data-undo]').disabled,
      sequence: root.querySelector('[data-sequence]').value,
      node: root.querySelector('[data-node]').value,
      // in-order sequence read from the drawing: keys sorted by x position
      inOrder: nodes.slice().sort((a, b) => a.x - b.x).map((n) => n.key),
      nodes,
    };
  }, scope);
}

function fedState(page, scope = '[data-lab=federated]') {
  return page.evaluate((scope) => {
    const root = document.querySelector(scope);
    const inputs = [...root.querySelectorAll('[data-client]')];
    return {
      output: root.querySelector('[data-average]').textContent.trim(),
      equation: root.querySelector('[data-equation]').textContent.replace(/\s+/g, ' ').trim(),
      counts: inputs.map((i) => i.value),
      invalid: inputs.map((i) => i.getAttribute('aria-invalid')),
      barLabels: [...root.querySelectorAll('.weight-plot small')].map((s) => s.textContent.replace(/\s+/g, ' ').trim()),
    };
  }, scope);
}

async function setCounts(page, counts, scope = '[data-lab=federated]') {
  const inputs = page.locator(scope + ' [data-client]');
  for (let i = 0; i < 3; i++) await inputs.nth(i).fill(String(counts[i]));
}

/* --------------------------------------------------------------- gallery */

/** Active plate index from the index ruler's aria-current (design-system §12.1/12.2). */
function galleryIndex(page) {
  return page.evaluate(() => {
    const group = document.querySelector('#gallery [role=group][aria-label="Jump to project"]');
    if (!group) return -1;
    return [...group.querySelectorAll('button')].findIndex((b) => b.getAttribute('aria-current') === 'true');
  });
}

/* ------------------------------------------------------------- monitors */

/** Collects console errors, page errors, failed requests and HTTP >= 400 responses. */
function watchHealth(page) {
  const out = { console: [], pageErrors: [], failed: [], http: [] };
  page.on('console', (m) => { if (m.type() === 'error') out.console.push(m.text()); });
  page.on('pageerror', (e) => out.pageErrors.push(String(e && e.stack ? e.stack.split('\n')[0] : e)));
  page.on('requestfailed', (r) => {
    const f = r.failure();
    // navigations aborted by a following navigation are not product failures
    if (f && /ERR_ABORTED/.test(f.errorText) && r.resourceType() === 'document') return;
    out.failed.push(`${r.url()} ${f ? f.errorText : ''}`);
  });
  page.on('response', (r) => { if (r.status() >= 400) out.http.push(`${r.status()} ${r.url()}`); });
  return out;
}

/** Scroll through the whole page in viewport steps (triggers reveals / lazy loads), then back to top. */
async function scrollThrough(page, { pause = 60 } = {}) {
  await page.evaluate(async (pause) => {
    const step = Math.max(200, innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, pause));
    }
    scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, pause));
  }, pause);
}

/** Install a requestAnimationFrame call counter (use with page.addInitScript). */
function rafCounterInit() {
  window.__raf = 0;
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => { window.__raf++; return raf(cb); };
}

/** Install a CLS accumulator (use with page.addInitScript). */
function clsInit() {
  window.__cls = 0;
  window.__shifts = [];
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue;
        window.__cls += e.value;
        window.__shifts.push({
          value: e.value,
          t: Math.round(e.startTime),
          sources: (e.sources || []).map((s) => {
            const n = s.node;
            if (!n || !n.nodeType) return '?';
            if (n.nodeType !== 1) return '#text in ' + (n.parentElement ? n.parentElement.tagName.toLowerCase() + (n.parentElement.id ? '#' + n.parentElement.id : '') : '?');
            return n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + (n.className && typeof n.className === 'string' ? '.' + n.className.trim().split(/\s+/).join('.') : '');
          }),
        });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch (e) { /* unsupported */ }
}

/**
 * Running WAAPI/CSS animations and transitions in the document, optionally only those
 * whose target is inside `scope` (a selector). Scroll-driven animations count too: under
 * reduced motion they must be off (§6.5).
 */
function runningAnimations(page, scope = null) {
  return page.evaluate((scope) =>
    document.getAnimations()
      .filter((a) => a.playState === 'running')
      .filter((a) => {
        if (!scope) return true;
        const t = a.effect && a.effect.target;
        const root = document.querySelector(scope);
        return !!(t && root && (root === t || root.contains(t)));
      })
      .map((a) => {
        const t = a.effect && a.effect.target;
        const name = a.animationName || a.transitionProperty || a.id || a.constructor.name;
        const el = t ? (t.tagName ? t.tagName.toLowerCase() : 'pseudo') + (t.id ? '#' + t.id : '') + (t.className && typeof t.className === 'string' ? '.' + t.className.trim().split(/\s+/).slice(0, 2).join('.') : '') : '?';
        return `${name} on ${el}`;
      }), scope);
}

/** List every file under dist with one of the extensions. */
function distFiles(exts) {
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (exts.includes(path.extname(e.name).toLowerCase())) out.push(p);
    }
  })(DIST);
  return out;
}
const rel = (abs) => path.relative(DIST, abs).split(path.sep).join('/');

module.exports = {
  BASE, ROOT, DIST, PAGES, LAB_KEYS, WIDTHS, FORBIDDEN_GLYPHS,
  loadDataScript, settle, load, waitEnhanced, hash, decodedHash, norm, visibleLabs,
  kaaranState, treeState, fedState, setCounts, galleryIndex,
  watchHealth, scrollThrough, rafCounterInit, clsInit, runningAnimations, distFiles, rel,
};
