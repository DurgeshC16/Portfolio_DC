// Content gates: design-system §4.2 / §14 (glyphs outside the font subsets),
// content-ledger §0, §6 and §7 (held / removed claims), JSON-LD and head metadata.
// These check what is PUBLISHED (rendered text, attributes, JSON-LD); HTML comments
// are ignored because TODO(durgesh) notes legitimately live there.
const fs = require('fs');
const { test, expect } = require('@playwright/test');
const { PAGES, FORBIDDEN_GLYPHS, load, distFiles, rel } = require('./_support');

test('no glyphs outside the font subsets in rendered text (§4.2), including open dialogs', async ({ page }) => {
  const hits = [];
  const scan = async (label) => {
    const found = await page.evaluate((src) => {
      const re = new RegExp(src, 'u');
      const out = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const p = n.parentElement;
        if (!p || p.closest('script, style, noscript, template')) continue;
        if (re.test(n.nodeValue)) out.push(`<${p.tagName.toLowerCase()}${p.id ? '#' + p.id : ''}> "${n.nodeValue.trim().slice(0, 60)}"`);
      }
      return out;
    }, FORBIDDEN_GLYPHS.source);
    hits.push(...found.map((f) => `${label}: ${f}`));
  };
  for (const p of PAGES) {
    await load(page, p.path);
    await scan(p.path);
  }
  // states that inject text: federated equation with a rounded result, open dialogs
  await load(page, 'index.html#lab/federated?counts=0,1,2');
  await scan('federated 0,1,2');
  await page.locator('[data-menu-open]').click().catch(() => {});
  await scan('nav overlay');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+k');
  await scan('palette');
  expect(hits).toEqual([]);
});

test('no forbidden glyph typed in HTML source text (CI grep, §4.2)', () => {
  const hits = [];
  for (const f of distFiles(['.html'])) {
    const html = fs.readFileSync(f, 'utf8')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
      .replace(/\s(aria-label|alt|title|content)="[^"]*"/gi, '');
    const text = html.replace(/<[^>]+>/g, ' ');
    const m = text.match(new RegExp(FORBIDDEN_GLYPHS.source, 'gu'));
    if (m) hits.push(`${rel(f)}: ${[...new Set(m)].join(' ')}`);
  }
  expect(hits).toEqual([]);
});

// Ledger §0 and §0b (decisions), §6 (security) and §7 (required copy changes).
const HELD = [
  [/(?<![\d.])95\.2\s*%/, 'FL accuracy (HOLD §0.2)'],
  [/(?<![\d.])90\.18/, 'FL accuracy (HOLD §0.2)'],
  [/(?<![\d,.])12,?423(?!\d)/, 'FL image count (HOLD §0.2)'],
  [/round 33/i, 'FL checkpoint round (HOLD §0.2)'],
  [/\b80 rounds\b/i, 'FL rounds (HOLD §0.2)'],
  [/(?<![\d.])1\.8\s*pp/i, 'FL gap (HOLD §0.2)'],
  [/\bSouth African patent\b|\bCIPC patent\b/i, 'unconfirmed patent jurisdiction (§0b.6)'],
  [/\bMachine Learning Specialization\b/i, 'superseded Stanford credential (§0b.8)'],
  [/B95F80D40BFFDBF9/i, 'incorrect AI-900 credential ID (§0b.8)'],
  [/\b86\.2\s*%|\b0\.834\b|\b11\.7\s*%|\b96\.2\s*%/, 'Cascade-XID placeholder results (§0b.10)'],
  [/seven[- ]agent|\b7 agents\b/i, 'résumé-only tutor claim (§0.3)'],
  [/\b240 cases\b|34\.1\s*ms|23[- ]user|\b36[- ]concept/i, 'résumé-only tutor metric (§0.3)'],
  [/1\.43 s(econds)?\b.{0,40}0\.18/i, 'Redis claim contradicted by code (§7)'],
  [/co-built with Niraj/i, 'use "Team project with Niraj Chavan" (§0.3, §7)'],
  [/co-author['’]s record/i, 'removed link (§7)'],
  [/Exam Management System/i, 'omitted project (§7)'],
  [/\b3 conference (research )?papers\b|\b1 granted\b/i, 'bare counters (§0.5)'],
  [/Autism-Detection-using-FL|Niraj-Chavan\/EDI-autistic/i, 'repositories withheld for remediation (S1)'],
  [/KGAT_/, 'secret (S1)'],
  [/durgeshnc999|gmail\.com/i, 'personal e-mail (S9)'],
];

test('held, removed and private claims are not published on any page (ledger §0/§6/§7)', async ({ page }) => {
  const hits = [];
  for (const p of PAGES) {
    await load(page, p.path);
    const published = await page.evaluate(() => {
      const attrs = [...document.querySelectorAll('[href],[aria-label],[alt],[title],meta[content]')]
        .map((e) => [e.getAttribute('href'), e.getAttribute('aria-label'), e.getAttribute('alt'), e.getAttribute('title'), e.getAttribute('content')].filter(Boolean).join(' '));
      const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent);
      return [document.body.innerText, document.body.textContent, ...attrs, ...ld].join('\n');
    });
    for (const [re, why] of HELD) {
      const m = published.match(re);
      if (m) hits.push(`${p.path}: "${m[0]}" — ${why}`);
    }
  }
  expect(hits).toEqual([]);
});

test('research records and credentials match the dated evidence in ledger §0b', async ({ page }) => {
  await load(page, 'index.html');
  const records = page.locator('#research li.pub');
  await expect(records).toHaveCount(4);

  const ieee = records.filter({ hasText: 'Handwritten Character Recognition' });
  await expect(ieee.locator('.chip')).toHaveText(['Published', 'Presented']);
  await expect(ieee.getByRole('link', { name: /DOI/ })).toHaveAttribute('href', 'https://doi.org/10.1109/icnpcv69434.2026.11708952');
  const federated = records.filter({ hasText: 'Cross-Cultural ASD' });
  await expect(federated.locator('.chip')).toHaveText('Accepted');
  await expect(federated).toContainText('ICONDEEPCOM26_079');
  const tutor = records.filter({ hasText: 'Misconception Repair' });
  await expect(tutor.locator('.chip')).toHaveText('Accepted');
  await expect(tutor.locator('.pub__authors')).toContainText('Durgesh N. Chaudhari');
  const patent = records.filter({ hasText: 'Hydroponics' });
  await expect(patent.locator('.chip')).toHaveText('Granted');
  await expect(patent).toContainText('2025/09215');
  await expect(patent).toContainText('24 June 2026');
  for (const [title, path] of [
    ['Deep Learning Specialization', 'specialization/IUL2VTFTL1RV'],
    ['IBM Full Stack Software Developer Professional Certificate', 'professional-cert/IRVG1NOM9YUA'],
    ['Google AI Professional Certificate', 'professional-cert/S1MQHA14ZOTD'],
  ]) {
    await expect(page.getByRole('link', { name: title, exact: true })).toHaveAttribute('href', 'https://coursera.org/verify/' + path);
  }
  await expect(page.locator('.creds')).toContainText('B95FB0D40BFFDBF9');
});

test('JSON-LD parses, carries no email/phone, and uses https sameAs (ledger §7, S9)', async ({ page }) => {
  const problems = [];
  for (const p of PAGES) {
    await load(page, p.path);
    const blocks = await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent));
    for (const b of blocks) {
      let data;
      try { data = JSON.parse(b); } catch (e) { problems.push(`${p.path}: invalid JSON-LD (${e.message})`); continue; }
      const flat = JSON.stringify(data);
      if (/"(email|telephone)"\s*:/.test(flat)) problems.push(`${p.path}: JSON-LD exposes email/telephone`);
      if (/\+?91[\s-]?\d{5}[\s-]?\d{5}/.test(flat)) problems.push(`${p.path}: JSON-LD contains a phone number`);
      for (const u of (flat.match(/"sameAs"\s*:\s*\[[^\]]*\]/) || [''])[0].match(/https?:[^"]+/g) || []) {
        if (!u.startsWith('https://')) problems.push(`${p.path}: sameAs not https: ${u}`);
      }
    }
  }
  expect(problems).toEqual([]);
});

test('head metadata: title, description, viewport, lang, favicon; 404 is noindex', async ({ page }) => {
  const problems = [];
  const titles = new Set();
  for (const p of PAGES) {
    await load(page, p.path);
    const m = await page.evaluate(() => ({
      title: document.title.trim(),
      desc: (document.querySelector('meta[name=description]') || {}).content || '',
      viewport: !!document.querySelector('meta[name=viewport]'),
      lang: document.documentElement.lang,
      icon: !!document.querySelector('link[rel~=icon]'),
      robots: (document.querySelector('meta[name=robots]') || {}).content || '',
    }));
    if (!m.title) problems.push(`${p.path}: empty <title>`);
    if (titles.has(m.title)) problems.push(`${p.path}: duplicate <title> "${m.title}"`);
    titles.add(m.title);
    if (m.desc.length < 50) problems.push(`${p.path}: meta description missing/short`);
    if (!m.viewport) problems.push(`${p.path}: no viewport meta`);
    if (m.lang !== 'en') problems.push(`${p.path}: html lang is "${m.lang}"`);
    if (!m.icon) problems.push(`${p.path}: no favicon link`);
    if (p.name === '404' && !/noindex/.test(m.robots)) problems.push('404.html must be noindex');
    if (p.name !== '404' && /noindex/.test(m.robots)) problems.push(`${p.path} is noindex`);
  }
  expect(problems).toEqual([]);
});

test('synthetic Kaaran data is labelled wherever it is shown (§14 content)', async ({ page }) => {
  for (const p of ['index.html', 'projects/kaaran.html']) {
    await load(page, p);
    expect(await page.locator('body').innerText(), p).toMatch(/synthetic/i);
  }
});

test('404 page shows the requested path safely via textContent (§13.4)', async ({ page }) => {
  await load(page, '404.html?x=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E');
  const injected = await page.evaluate(() => document.querySelectorAll('main img[src="x"]').length);
  expect(injected).toBe(0);
  await expect(page.locator('main a[href$="index.html"]').first()).toBeVisible();
  for (const key of ['kaaran', 'tutor', 'federated', 'certivault', 'notebook']) {
    expect(await page.locator(`main a[href*="projects/${key}.html"]`).count(), key).toBeGreaterThan(0);
  }
});
