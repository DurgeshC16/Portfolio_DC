// Lab calculations and state: audit-code.md §3.1, §3.2, §3.6 and §7 items 7–27.
// Runs against the home bench (index.html) and each case-study bench.
const { test, expect } = require('@playwright/test');
const {
  load, waitEnhanced, hash, decodedHash, kaaranState, treeState, fedState, setCounts, loadDataScript, runningAnimations,
} = require('./_support');

const LL = 'Root 30. 30 has left child 20. 20 has left child 10.';
const LR = 'Root 30. 30 has left child 10. 10 has right child 20.';
const BALANCED = 'Root 20. 20 has left child 10. 20 has right child 30.';

/* ================================================================ Kaaran */
test.describe('Kaaran evidence lab', () => {
  const evidence = loadDataScript('assets/kaaran-evidence.js', 'kaaranEvidence');
  const VALUES = { 'n.drop.08K03': ['11.6', '११.६'], 'n.mig.gap.08K11': ['14.7', '१४.७'], 'n.drop.08K07': ['7.4', '७.४'] };

  test('language toggle, details and cluster write the URL contract (items 7–9)', async ({ page }) => {
    await load(page, 'index.html#lab/kaaran');
    await waitEnhanced(page);
    const K = '[data-lab=kaaran]';
    await page.locator(`${K} [data-language=mr]`).click();
    expect(await hash(page)).toBe('#lab/kaaran?lang=mr');
    let k = await kaaranState(page);
    expect(k.bodyLang).toBe('mr');
    expect(k.pressed).toEqual({ en: 'false', mr: 'true' });
    expect(k.question).toBe('कोणत्या तालुक्याकडे सर्वाधिक लक्ष देणे आवश्यक आहे?');

    await page.locator(`${K} details > summary`).click();
    await expect.poll(() => hash(page)).toBe('#lab/kaaran?lang=mr&cluster=n.drop.08K03');
    await page.locator(`${K} select`).selectOption('n.mig.gap.08K11');
    expect(await hash(page)).toBe('#lab/kaaran?lang=mr&cluster=n.mig.gap.08K11');
    k = await kaaranState(page);
    expect(k.finding).toContain('१४.७');
    expect(k.workbooks).toEqual(['student_attendance_2023-24.xlsx', 'student_attendance_2024-25.xlsx', 'student_attendance_2025-26.xlsx']);
    expect(k.sourceHref.endsWith('id=n.mig.gap.08K11')).toBe(true);

    await page.reload();
    await waitEnhanced(page);
    k = await kaaranState(page);
    expect([k.bodyLang, k.open, k.select]).toEqual(['mr', true, 'n.mig.gap.08K11']);

    await page.locator(`${K} [data-language=en]`).click();
    expect(await hash(page)).toBe('#lab/kaaran?cluster=n.mig.gap.08K11');
    expect((await kaaranState(page)).finding).toContain('14.7');
    await page.locator(`${K} details > summary`).click();
    await expect.poll(() => hash(page)).toBe('#lab/kaaran');
  });

  for (const lang of ['en', 'mr']) {
    test(`all three records render data-file values in ${lang.toUpperCase()} (item 11)`, async ({ page }) => {
      for (const rec of evidence.records) {
        await load(page, `projects/kaaran.html#lab/kaaran?${lang === 'mr' ? 'lang=mr&' : ''}cluster=${rec.id}`);
        await waitEnhanced(page);
        const k = await kaaranState(page);
        expect(k.select).toBe(rec.id);
        expect(k.bodyLang).toBe(lang);
        expect(k.finding, `${rec.id} value`).toContain(VALUES[rec.id][lang === 'en' ? 0 : 1]);
        expect(k.workbooks).toEqual(rec.workbooks);
        expect(k.sourceHref).toBe(rec.url);
        expect(k.snapshot).toContain(evidence.captured);
        expect(k.name).toContain(lang === 'en' ? rec.name : rec.mrName);
        expect(k.period.length).toBeGreaterThan(0);
      }
    });
  }

  test('evidence data file still matches the live-API snapshot (audit §3.6)', async () => {
    expect(evidence.captured).toBe('2026-11-21');
    expect(evidence.records.map((r) => r.id)).toEqual(['n.drop.08K03', 'n.mig.gap.08K11', 'n.drop.08K07']);
    for (const r of evidence.records) expect(r.url).toBe('https://kaaran-vk5o.onrender.com/api/briefs/blocks.BPandharpur/number?id=' + r.id);
  });
});

/* ================================================================= Tutor */
test.describe('AVL rotation lab', () => {
  const T = '[data-lab=tutor]';

  test('LL: R30 ends at root 20 with children 10/30, undo restores (items 12–14, 16, 17)', async ({ page }) => {
    await load(page, 'index.html#lab/tutor');
    await waitEnhanced(page);
    let t = await treeState(page);
    expect(t.svgLabel).toBe(LL);
    expect(t.reading).toMatch(/node 30 = 2\b/);
    expect(t.inOrder).toEqual([10, 20, 30]);

    await page.locator(`${T} [data-node]`).selectOption('10');
    expect(await hash(page)).toBe('#lab/tutor?node=10');
    await page.locator(`${T} [data-rotate=right]`).click({ force: true });
    t = await treeState(page);
    expect(t.status).toBe('Node 10 has no left child to promote.');
    expect(t.svgLabel).toBe(LL);
    expect(await hash(page)).toBe('#lab/tutor?node=10');

    await page.locator(`${T} [data-node]`).selectOption('30');
    await page.locator(`${T} [data-rotate=right]`).click({ force: true });
    t = await treeState(page);
    expect(t.svgLabel).toBe(BALANCED);
    expect(t.status).toMatch(/^Balanced\./);
    expect(t.undoDisabled).toBe(false);
    expect(await hash(page)).toBe('#lab/tutor?moves=R30');
    await page.waitForTimeout(600);
    expect((await treeState(page)).inOrder).toEqual([10, 20, 30]);

    await page.locator(`${T} [data-undo]`).click();
    t = await treeState(page);
    expect([t.svgLabel, t.undoDisabled, t.node]).toEqual([LL, true, '30']);
    expect(t.status).toMatch(/^Previous structure restored\./);
    expect(await hash(page)).toBe('#lab/tutor');
    expect(await page.evaluate(() => document.activeElement && document.activeElement.matches('[data-node]')), 'focus moves to the node select when Undo disables').toBe(true);
  });

  test('LR: L10 then R30 ends at root 20 with children 10/30 and restores on reload (item 15)', async ({ page }) => {
    await load(page, 'projects/tutor.html#lab/tutor');
    await waitEnhanced(page);
    await page.locator(`${T} [data-sequence]`).selectOption('lr');
    expect(await hash(page)).toBe('#lab/tutor?order=lr');
    let t = await treeState(page);
    expect(t.svgLabel).toBe(LR);
    expect(t.inOrder).toEqual([10, 20, 30]);
    await page.locator(`${T} [data-node]`).selectOption('10');
    expect((await treeState(page)).reading).toMatch(/node 10 = -1|node 10 = −1/);
    await page.locator(`${T} [data-rotate=left]`).click({ force: true });
    t = await treeState(page);
    expect(t.svgLabel).toBe(LL);
    expect(await hash(page)).toBe('#lab/tutor?order=lr&moves=L10&node=10');
    await page.locator(`${T} [data-node]`).selectOption('30');
    await page.locator(`${T} [data-rotate=right]`).click({ force: true });
    t = await treeState(page);
    expect(t.svgLabel).toBe(BALANCED);
    expect(await hash(page)).toBe('#lab/tutor?order=lr&moves=L10.R30');
    await page.locator(`${T} [data-node]`).selectOption('20');
    expect(await hash(page)).toBe('#lab/tutor?order=lr&moves=L10.R30&node=20');
    expect((await treeState(page)).reading).toMatch(/node 20 = 0\b/);
    await page.reload();
    await waitEnhanced(page);
    await page.waitForTimeout(400);
    t = await treeState(page);
    expect([t.sequence, t.node, t.svgLabel, t.undoDisabled]).toEqual(['lr', '20', BALANCED, false]);
    expect(t.inOrder).toEqual([10, 20, 30]);
    // Undo twice returns to the LR start; Reset returns to node 30
    await page.locator(`${T} [data-undo]`).click();
    expect((await treeState(page)).svgLabel).toBe(LL);
    await page.locator(`${T} [data-reset]`).click();
    t = await treeState(page);
    expect([t.svgLabel, t.node, t.undoDisabled]).toEqual([LR, '30', true]);
    expect(await hash(page)).toBe('#lab/tutor?order=lr');
  });

  test('moves replay stops at the first invalid token (item 18)', async ({ page }) => {
    await load(page, 'index.html#lab/tutor?moves=R30.X99.L10');
    await waitEnhanced(page);
    expect((await treeState(page)).svgLabel).toBe(BALANCED);
    await page.locator(`${T} [data-node]`).selectOption('20');
    expect(await hash(page)).toBe('#lab/tutor?moves=R30&node=20');
  });

  test('SVG nodes are focusable buttons; Enter and Space select (item 19)', async ({ page }) => {
    await load(page, 'projects/tutor.html#lab/tutor?order=lr&moves=L10.R30&node=20');
    await waitEnhanced(page);
    const nodes = page.locator(`${T} [data-nodes] > [role=button]`);
    await expect(nodes).toHaveCount(3);
    const keyOf = async (i) => Number((await nodes.nth(i).getAttribute('aria-label')).match(/node (\d+)/i)[1]);
    // either every node is a tab stop, or a roving tabindex keeps exactly one (the selected node)
    const tabs = await nodes.evaluateAll((g) => g.map((x) => x.getAttribute('tabindex')));
    expect(tabs.every((t) => t === '0') || tabs.filter((t) => t === '0').length === 1, `tabindex ${tabs}`).toBe(true);
    let idx30 = -1, idx10 = -1;
    for (let i = 0; i < 3; i++) { const k = await keyOf(i); if (k === 30) idx30 = i; if (k === 10) idx10 = i; }
    await nodes.nth(idx30).focus();
    await page.keyboard.press('Enter');
    expect((await treeState(page)).node).toBe('30');
    await expect(nodes.nth(idx30)).toHaveAttribute('aria-pressed', 'true');
    await nodes.nth(idx10).focus();
    await page.keyboard.press(' ');
    expect((await treeState(page)).node).toBe('10');
    await expect(nodes.nth(idx10)).toHaveAttribute('aria-pressed', 'true');
  });

  test('rapid rotations end in a consistent state (animation interruption)', async ({ page }) => {
    await load(page, 'index.html#lab/tutor');
    await waitEnhanced(page);
    const left = page.locator(`${T} [data-rotate=left]`);
    const right = page.locator(`${T} [data-rotate=right]`);
    const node = page.locator(`${T} [data-node]`);
    // burst: no waits between clicks so transitions are interrupted mid-flight
    for (let i = 0; i < 6; i++) {
      await node.selectOption(i % 2 ? '20' : '30');
      await right.click({ delay: 0, force: true });
      await left.click({ delay: 0, force: true });
      await right.click({ delay: 0, force: true });
    }
    await page.waitForTimeout(1200);
    const live = await treeState(page);
    expect(live.inOrder).toEqual([10, 20, 30]);
    expect(await runningAnimations(page, "[data-lab=tutor]")).toEqual([]);
    // The URL must describe exactly what is drawn: reload it and compare.
    const url = page.url();
    await page.goto('about:blank');
    await load(page, url);
    await waitEnhanced(page);
    await page.waitForTimeout(600);
    const restored = await treeState(page);
    expect(restored.svgLabel).toBe(live.svgLabel);
    const pos = (s) => Object.fromEntries(s.nodes.map((n) => [n.key, Math.round(n.y)]));
    expect(pos(restored), 'node depths after settle match a fresh render').toEqual(pos(live));
  });

  test('@motion under reduced motion tree nodes jump with no transition (item 20)', async ({ page }) => {
    await load(page, 'index.html#lab/tutor');
    await waitEnhanced(page);
    const dur = await page.$eval(`${T} [data-nodes] > *`, (g) => getComputedStyle(g).transitionDuration.split(',').map((d) => parseFloat(d) * (d.includes('ms') ? 1 : 1000)));
    expect(Math.max(...dur)).toBeLessThanOrEqual(1);
    await page.locator(`${T} [data-rotate=right]`).click({ force: true });
    await page.waitForTimeout(300);
    expect(await runningAnimations(page)).toEqual([]);
  });
});

/* ============================================================= Federated */
test.describe('Federated averaging lab', () => {
  const eq = (counts, total) => `(1 × ${counts[0]} + 3 × ${counts[1]} + 5 × ${counts[2]}) ÷ ${total}`;
  // Bar labels "A · 25%": each within 1 point of the exact share and (audit bug 9) totalling 100.
  function expectShares(labels, counts) {
    const total = counts.reduce((a, b) => a + b, 0);
    expect(labels.map((l) => l.split(' · ')[0])).toEqual(['A', 'B', 'C']);
    const pct = labels.map((l) => Number(l.split(' · ')[1].replace('%', '')));
    pct.forEach((v, i) => expect(Math.abs(v - (100 * counts[i]) / total), labels.join(', ')).toBeLessThanOrEqual(1));
    expect(pct.reduce((a, b) => a + b, 0), 'percentages total 100').toBe(100);
  }

  test('equal counts -> 3; 1,1,2 -> 3.5 with encoded hash and reload (items 21, 22)', async ({ page }) => {
    await load(page, 'index.html#lab/federated');
    await waitEnhanced(page);
    let f = await fedState(page);
    expect(f.output).toBe('3');
    expect(f.equation.startsWith(eq([1, 1, 1], 3))).toBe(true);
    expect(f.equation).toMatch(/=\s*3$/);
    expectShares(f.barLabels, [1, 1, 1]);

    await setCounts(page, [1, 1, 2]);
    f = await fedState(page);
    expect(f.output).toBe('3.5');
    expect(f.equation.startsWith(eq([1, 1, 2], 4))).toBe(true);
    expect(f.equation).toMatch(/=\s*3\.5$/);
    expectShares(f.barLabels, [1, 1, 2]);
    expect(await decodedHash(page)).toBe('#lab/federated?counts=1,1,2');
    await page.reload();
    await waitEnhanced(page);
    f = await fedState(page);
    expect([f.counts, f.output]).toEqual([['1', '1', '2'], '3.5']);
    await load(page, 'index.html#lab/federated?counts=1,1,2');
    await waitEnhanced(page);
    expect((await fedState(page)).output, 'literal comma accepted').toBe('3.5');
  });

  test('0,0,0 -> "—" with guidance, no invalid field, survives reload (item 23)', async ({ page }) => {
    await load(page, 'projects/federated.html#lab/federated');
    await waitEnhanced(page);
    await setCounts(page, [0, 0, 0]);
    let f = await fedState(page);
    expect(f.output).toBe('—');
    expect(f.equation).toMatch(/at least one positive sample count/i);
    expect(f.invalid.map((v) => v === 'true')).toEqual([false, false, false]);
    expect(await decodedHash(page)).toBe('#lab/federated?counts=0,0,0');
    await page.reload();
    await waitEnhanced(page);
    f = await fedState(page);
    expect([f.counts, f.output]).toEqual([['0', '0', '0'], '—']);
    expect(f.equation).toMatch(/at least one positive sample count/i);
  });

  test('invalid inputs flag aria-invalid and show the range message (item 24)', async ({ page }) => {
    await load(page, 'index.html#lab/federated');
    await waitEnhanced(page);
    for (const bad of ['-1', '1.5', '10000', '']) {
      await setCounts(page, [bad, 1, 1]);
      const f = await fedState(page);
      expect(f.output, `input "${bad}"`).toBe('—');
      expect(f.equation).toMatch(/whole sample count from 0 to 9,999/i);
      expect(f.invalid[0]).toBe('true');
      expect(await hash(page)).toBe('#lab/federated');
    }
  });

  test('worked examples (item 25) and Reset counts (item 26)', async ({ page }) => {
    await load(page, 'index.html#lab/federated');
    await waitEnhanced(page);
    // Exact results print as-is; rounded ones are marked approximate (the "≈" glyph is
    // outside the font subsets, so it may be an SVG with the words "approximately equals").
    const examples = [
      [[2, 1, 1], 2.5, 4],
      [[1, 0, 1], 3, 2],
      [[0, 1, 2], 13 / 3, 3],
      [[3, 0, 0], 1, 3],
      [[9999, 0, 1], 10004 / 10000, 10000],
    ];
    for (const [c, value, total] of examples) {
      await setCounts(page, c);
      const f = await fedState(page);
      const exact = Math.abs(value * 1000 - Math.round(value * 1000)) < 1e-6;
      expect(Number(f.output.replace(/,/g, '')), c.join(',')).toBeCloseTo(value, 3);
      expect(f.equation.startsWith(eq(c, total))).toBe(true);
      expect(f.equation.endsWith(f.output)).toBe(true);
      if (exact) expect(f.equation, c.join(',')).toMatch(/ = [\d.,]+$/);
      else expect(f.equation, 'rounded results must be marked approximate').toMatch(/(≈|approximately equals?)\s*[\d.,]+$/i);
    }
    await page.locator('[data-lab=federated] [data-equal]').click();
    expect((await fedState(page)).counts).toEqual(['1', '1', '1']);
    expect(await hash(page)).toBe('#lab/federated');
  });

  test('training stepper shows exactly one stage with matching aria-pressed (item 27)', async ({ page }) => {
    await load(page, 'projects/federated.html');
    await waitEnhanced(page);
    await page.evaluate(() => { const d = document.querySelector('[data-training]').closest('details'); if (d) d.open = true; });
    const buttons = page.locator('[data-training] button[aria-controls]');
    const n = await buttons.count();
    expect(n).toBe(3);
    for (let i = n - 1; i >= 0; i--) {
      await buttons.nth(i).click();
      const s = await page.evaluate(() => [...document.querySelectorAll('[data-training] button[aria-controls]')].map((b) => ({
        pressed: b.getAttribute('aria-pressed'), shown: !document.getElementById(b.getAttribute('aria-controls')).hidden,
      })));
      expect(s.filter((x) => x.shown).length).toBe(1);
      expect(s.map((x) => x.pressed === 'true')).toEqual(s.map((x) => x.shown));
      expect(s[i].shown).toBe(true);
    }
  });
});
