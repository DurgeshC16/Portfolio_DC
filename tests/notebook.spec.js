// Engineering notebook: audit-code.md §3.3–3.5 and §7 items 28–31.
// Benchmark values are checked against dist/assets/tree-benchmarks.js itself;
// RRF scores are recomputed independently here (score = Σ 1/(60 + rank)).
const { test, expect } = require('@playwright/test');
const { load, waitEnhanced, hash, norm, loadDataScript } = require('./_support');

const NB = 'projects/notebook.html';

const STEPS = [
  [1, 'Inserted key 1. The first key becomes the root. Root 1 · 1 level.', 'AVL tree. Node 1 is the root.'],
  [2, 'Inserted key 2. The tree stays balanced without a rotation. Root 1 · 2 levels.', 'AVL tree. Node 1 is the root. Node 2 is the right child of 1.'],
  [3, 'Inserted key 3. A left rotation at 1 restores balance. Root 2 · 2 levels.', 'AVL tree. Node 1 is the left child of 2. Node 2 is the root. Node 3 is the right child of 2.'],
  [4, 'Inserted key 4. The tree stays balanced without a rotation. Root 2 · 3 levels.', 'AVL tree. Node 1 is the left child of 2. Node 2 is the root. Node 3 is the right child of 2. Node 4 is the right child of 3.'],
  [5, 'Inserted key 5. A left rotation at 3 restores balance. Root 2 · 3 levels.', 'AVL tree. Node 1 is the left child of 2. Node 2 is the root. Node 3 is the left child of 4. Node 4 is the right child of 2. Node 5 is the right child of 4.'],
  [6, 'Inserted key 6. A left rotation at 2 restores balance. Root 4 · 3 levels.', 'AVL tree. Node 1 is the left child of 2. Node 2 is the left child of 4. Node 3 is the right child of 2. Node 4 is the root. Node 5 is the right child of 4. Node 6 is the right child of 5.'],
  [7, 'Inserted key 7. A left rotation at 5 restores balance. Root 4 · 3 levels.', 'AVL tree. Node 1 is the left child of 2. Node 2 is the left child of 4. Node 3 is the right child of 2. Node 4 is the root. Node 5 is the left child of 6. Node 6 is the right child of 4. Node 7 is the right child of 6.'],
];

test.describe('AVL insertion replay', () => {
  test('steps 1–7 match the verified replay table (item 28)', async ({ page }) => {
    await load(page, NB);
    await waitEnhanced(page);
    for (const [s, reading, label] of STEPS) {
      await page.locator('#step').fill(String(s));
      expect(await hash(page)).toBe('#insertion?step=' + s);
      expect(norm(await page.locator('#step-reading').textContent()), 'step ' + s).toBe(reading);
      await expect(page.locator('#insertion-canvas')).toHaveAttribute('aria-label', label);
      await expect(page.locator('#insertion-canvas')).toHaveAttribute('role', 'img');
    }
  });

  test('#insertion?step=3 restores; ArrowRight advances to step 4', async ({ page }) => {
    await load(page, NB + '#insertion?step=3');
    await waitEnhanced(page);
    expect(await page.inputValue('#step')).toBe('3');
    expect(norm(await page.locator('#step-reading').textContent())).toBe(STEPS[2][1]);
    await page.locator('#step').focus();
    await page.keyboard.press('ArrowRight');
    expect(await hash(page)).toBe('#insertion?step=4');
    expect(norm(await page.locator('#step-reading').textContent())).toBe(STEPS[3][1]);
  });

  test('invalid step falls back to 7', async ({ page }) => {
    await load(page, NB + '#insertion?step=9');
    await waitEnhanced(page);
    expect(await page.inputValue('#step')).toBe('7');
  });
});

test.describe('tree benchmark', () => {
  const data = loadDataScript('assets/tree-benchmarks.js', 'treeBenchmarks');
  const workload = { ascending: 'Sorted', descending: 'Reverse Sorted', random: 'Random' };
  const READINGS = {
    'ascending/10000/height': 'At 10,000 ascending insertions, the splay tree has one level per key. The AVL tree reaches 14 levels.',
    'random/5000/height': 'After 5,000 random insertions, AVL and red-black reach 15 levels each. Splay reaches 30.',
    'random/1000/height': 'After 1,000 random insertions, AVL and red-black reach 12 and 13 levels respectively. Splay reaches 23.',
    'random/1000/time': 'For 1,000 random insertions, Red-Black recorded the shortest batch time at 0.0833 ms. Each timing comes from a single run.',
    'ascending/1000/time': 'For 1,000 ascending insertions, Splay recorded the shortest batch time at 0.0318 ms. Each timing comes from a single run.',
  };

  test('data file is the pinned 27-record source (b80db89)', () => {
    expect(data.records).toHaveLength(27);
    expect(data.revision.startsWith('b80db89')).toBe(true);
    expect(data.source).toContain('/blob/b80db89');
  });

  test('all 18 configurations render the values in tree-benchmarks.js (item 29)', async ({ page }) => {
    await load(page, NB);
    await waitEnhanced(page);
    for (const order of ['ascending', 'random', 'descending']) {
      for (const size of ['1000', '5000', '10000']) {
        for (const metric of ['height', 'time']) {
          await page.selectOption('#order', order);
          await page.selectOption('#size', size);
          await page.selectOption('#metric', metric);
          const key = `${order}/${size}/${metric}`;
          expect(await hash(page)).toBe(`#trees?order=${order}&size=${size}&metric=${metric}`);
          const rows = await page.$$eval('.plot-row', (r) => r.map((x) => ({ text: x.textContent.replace(/\s+/g, ' ').trim(), value: x.querySelector('strong').textContent.trim() })));
          expect(rows, key).toHaveLength(3);
          for (const row of rows) {
            const tree = data.trees.find((t) => row.text.toLowerCase().startsWith(t.toLowerCase()));
            expect(tree, `row "${row.text}" names a tree`).toBeTruthy();
            const rec = data.records.find((r) => r.tree === tree && r.workload === workload[order] && r.size === Number(size));
            const expected = metric === 'time' ? rec.batchMs.toFixed(4) : new Intl.NumberFormat('en-US').format(rec.height);
            expect(row.value, `${key} ${tree}`).toBe(expected);
          }
          const reading = norm(await page.locator('#tree-reading').textContent());
          if (READINGS[key]) expect(reading, key).toBe(READINGS[key]);
          if (metric === 'time') {
            const runs = data.records.filter((r) => r.workload === workload[order] && r.size === Number(size));
            const best = runs.reduce((a, b) => (b.batchMs < a.batchMs ? b : a));
            expect(reading, key).toContain(best.batchMs.toFixed(4) + ' ms');
          }
        }
      }
    }
  });

  test('#trees?… restores after reload; invalid fields fall back per field', async ({ page }) => {
    await load(page, NB + '#trees?order=random&size=5000&metric=time');
    await waitEnhanced(page);
    const vals = () => Promise.all(['#order', '#size', '#metric'].map((s) => page.inputValue(s)));
    expect(await vals()).toEqual(['random', '5000', 'time']);
    await page.reload();
    await waitEnhanced(page);
    expect(await vals()).toEqual(['random', '5000', 'time']);
    await load(page, NB + '#trees?order=bogus&size=7&metric=time');
    await waitEnhanced(page);
    expect(await vals()).toEqual(['ascending', '10000', 'time']);
  });

  test('source links are pinned to b80db89 and 68d0c0a (item 31)', async ({ page }) => {
    await load(page, NB);
    const hrefs = await page.$$eval('a[href^="http"]', (a) => a.map((x) => x.href));
    const ds = hrefs.filter((h) => h.includes('DS_Actual_CP/blob/'));
    expect(ds.length).toBeGreaterThan(0);
    for (const h of ds) expect(h, h).toMatch(/DS_Actual_CP\/blob\/b80db89/);
    const rrf = hrefs.filter((h) => h.includes('review-summarizer/blob/'));
    expect(rrf.length).toBeGreaterThan(0);
    for (const h of rrf) expect(h, h).toMatch(/review-summarizer\/blob\/68d0c0a/);
  });
});

test.describe('reciprocal rank fusion', () => {
  // Independent implementation of the documented model (audit §3.5).
  const NAMES = { A: 'Two days', B: 'Commute', C: 'Quick charge' };
  const SCENARIOS = { overlap: { keyword: ['A', 'B'], semantic: ['C', 'B'] }, agreement: { keyword: ['A', 'B'], semantic: ['A', 'C'] }, split: { keyword: ['A', 'B'], semantic: ['B', 'A'] } };
  function rrf(scenario, channel) {
    const s = SCENARIOS[scenario];
    const lists = channel === 'hybrid' ? [s.semantic, s.keyword] : [s[channel]];
    const score = new Map();
    for (const list of lists) list.forEach((d, i) => score.set(d, (score.get(d) || 0) + 1 / (60 + i + 1)));
    return [...score.entries()].sort((a, b) => b[1] - a[1]).map(([d, v]) => {
      const kw = s.keyword.indexOf(d), se = s.semantic.indexOf(d);
      const show = (i, ch) => (channel === 'hybrid' || channel === ch) && i >= 0 ? String(i + 1) : '—';
      return [NAMES[d], show(kw, 'keyword'), show(se, 'semantic'), v.toFixed(5)].join(' | ');
    });
  }

  test('reference examples from the audit table', () => {
    expect(rrf('overlap', 'hybrid')).toEqual(['Commute | 2 | 2 | 0.03226', 'Quick charge | — | 1 | 0.01639', 'Two days | 1 | — | 0.01639']);
    expect(rrf('agreement', 'hybrid')).toEqual(['Two days | 1 | 1 | 0.03279', 'Quick charge | — | 2 | 0.01613', 'Commute | 2 | — | 0.01613']);
    expect(rrf('split', 'hybrid')).toEqual(['Commute | 2 | 1 | 0.03252', 'Two days | 1 | 2 | 0.03252']);
  });

  test('all 9 configurations render the computed table, including the split tie (item 30)', async ({ page }) => {
    await load(page, NB);
    await waitEnhanced(page);
    for (const scenario of Object.keys(SCENARIOS)) {
      for (const channel of ['hybrid', 'keyword', 'semantic']) {
        await page.selectOption('#scenario', scenario);
        await page.selectOption('#channel', channel);
        expect(await hash(page)).toBe(`#retrieval?scenario=${scenario}&channel=${channel}`);
        const rows = await page.$$eval('#rank-results tr', (r) => r.map((x) => [...x.cells].map((c) => c.textContent.replace(/\s+/g, ' ').trim()).join(' | ')));
        const expected = rrf(scenario, channel);
        expect(rows, `${scenario}/${channel}`).toEqual(expected);
        const reading = norm(await page.locator('#rank-reading').textContent());
        expect(reading, 'reading names the leader').toContain(expected[0].split(' | ')[0]);
        expect(reading, 'reading quotes the leading score').toContain(expected[0].split(' | ')[3]);
      }
    }
  });

  test('#retrieval?scenario=split&channel=hybrid restores after reload', async ({ page }) => {
    await load(page, NB + '#retrieval?scenario=split&channel=hybrid');
    await waitEnhanced(page);
    expect([await page.inputValue('#scenario'), await page.inputValue('#channel')]).toEqual(['split', 'hybrid']);
    await page.reload();
    await waitEnhanced(page);
    expect([await page.inputValue('#scenario'), await page.inputValue('#channel')]).toEqual(['split', 'hybrid']);
    expect(norm(await page.locator('#rank-reading').textContent())).toMatch(/tie/i);
  });

  test('invalid retrieval params fall back per field', async ({ page }) => {
    await load(page, NB + '#retrieval?scenario=nope&channel=keyword');
    await waitEnhanced(page);
    expect([await page.inputValue('#scenario'), await page.inputValue('#channel')]).toEqual(['overlap', 'keyword']);
  });
});

test.describe('plain anchors', () => {
  for (const id of ['trees', 'retrieval', 'insertion']) {
    test(`notebook.html#${id} lands on the section (item 31)`, async ({ page }) => {
      await load(page, NB + '#' + id);
      await page.waitForTimeout(300);
      const top = await page.evaluate((id) => document.getElementById(id).getBoundingClientRect().top, id);
      expect(top).toBeGreaterThanOrEqual(-2);
      expect(top).toBeLessThan(await page.evaluate(() => innerHeight * 0.5));
    });
  }
});
