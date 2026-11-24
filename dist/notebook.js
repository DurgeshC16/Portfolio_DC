/* notebook.js — Engineering notebook (owner E2).
   Three benches: AVL insertion replay (#insertion?step=), C++ tree benchmark
   (#trees?order=&size=&metric=) and reciprocal rank fusion (#retrieval?scenario=&channel=).
   Contracts: audit-code.md §2.1–2.3 and §3.3–3.5. The readings, the parent table, the
   benchmark filter and the fusion arithmetic are the verified logic, kept verbatim.
   New: the hash carries the other two sections' non-default settings too, so one link
   restores the whole page; old single-section fragments still work.
   Everything lives in this IIFE: legacy scripts share the global lexical scope. */
(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  if (!byId('step') || !byId('order') || !byId('scenario')) return;
  const DC = window.DC || null;
  const root = document.documentElement;
  const reduced = () =>
    DC ? DC.prefs.reduce : root.dataset.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const numberFormat = new Intl.NumberFormat('en-US');
  const controls = {
    trees: [byId('order'), byId('size'), byId('metric')],
    retrieval: [byId('scenario'), byId('channel')],
    insertion: [byId('step')],
  };
  const sections = Object.keys(controls);

  /* ------------------------------------------------------------------ URL state */
  function fieldDefault(field) {
    if (field.type === 'range') return field.defaultValue;
    return [...field.options].find((option) => option.defaultSelected)?.value || field.options[0].value;
  }
  function serialize(active) {
    const params = new URLSearchParams();
    for (const field of controls[active]) params.set(field.id, field.value);
    for (const section of sections) {
      if (section === active) continue;
      for (const field of controls[section]) if (field.value !== fieldDefault(field)) params.set(field.id, field.value);
    }
    return '#' + active + '?' + params.toString();
  }
  function saveSelection(section) {
    history.replaceState(history.state, '', serialize(section));
  }
  function applyField(field, value) {
    const valid =
      field.type === 'range'
        ? /^[1-7]$/.test(value)
        : [...field.options].some((option) => option.value === value);
    field.value = valid ? value : fieldDefault(field);
  }

  /* ------------------------------------------------------------------ small helpers */
  const SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs, text) {
    const node = document.createElementNS(SVGNS, tag);
    if (attrs) for (const key in attrs) if (attrs[key] != null) node.setAttribute(key, attrs[key]);
    if (text != null) node.textContent = text;
    return node;
  }
  function setText(selector, text) {
    document.querySelectorAll(selector).forEach((node) => (node.textContent = text));
  }
  const easeOut = (t) => 1 - Math.pow(1 - t, 4); // close to --e-out for short tweens

  /* ================================================================== Entry 02: trees */
  const orders = { ascending: 'Sorted', descending: 'Reverse Sorted', random: 'Random' };
  const rowNames = { AVL: 'AVL', 'Red-Black': 'Red-black', Splay: 'Splay' };
  const plot = document.querySelector('.nb-plot');
  const plotRows = [...document.querySelectorAll('.plot-row')];
  const plotGrid = document.querySelector('[data-plot-grid]');

  function record(tree, workload, size) {
    return treeBenchmarks.records.find((run) => run.tree === tree && run.workload === workload && run.size === size);
  }

  function drawMeasurements() {
    const [order, size, metric] = controls.trees.map((field) => field.value);
    const timing = metric === 'time';
    const runs = treeBenchmarks.records.filter(
      (run) => run.workload === orders[order] && run.size === Number(size),
    );
    // The axis for each metric stays fixed across workloads and sizes.
    const minPower = timing ? -2 : 0;
    const maxPower = timing ? 1 : 4;
    const fractionOf = (value) => (Math.log10(value) - minPower) / (maxPower - minPower);
    const format = (value) => (timing ? value.toFixed(4) : numberFormat.format(value));
    const valueOf = (run) => (timing ? run.batchMs : run.height);

    // The highlighted datum: the quickest batch for time, the tallest tree for height.
    const datum = timing
      ? runs.reduce((best, run) => (run.batchMs < best.batchMs ? run : best))
      : runs.reduce((best, run) => (run.height > best.height ? run : best));

    plotRows.forEach((row, index) => {
      const run = runs[index];
      const value = valueOf(run);
      const fraction = fractionOf(value);
      row.querySelector('i').style.setProperty('--position', fraction * 100 + '%');
      row.querySelector('.nb-bar').style.setProperty('--fraction', String(fraction));
      row.querySelector('strong').textContent = format(value);
      row.classList.toggle('is-datum', run === datum);
      const others = treeBenchmarks.sizes.filter((other) => other !== Number(size));
      row.querySelectorAll('.nb-ghost').forEach((ghost, k) => {
        ghost.style.setProperty('--position', fractionOf(valueOf(record(run.tree, run.workload, others[k]))) * 100 + '%');
      });
      row.dataset.tip = treeBenchmarks.sizes
        .map((s) => numberFormat.format(s) + ' keys: ' + format(valueOf(record(run.tree, run.workload, s))))
        .join('\n');
    });

    // Gridlines: one per power of ten plus hairline minors at 2–9.
    const decades = maxPower - minPower;
    const lines = [];
    for (let d = 0; d <= decades; d++) {
      lines.push(['is-major', (d / decades) * 100]);
      if (d < decades) for (let m = 2; m <= 9; m++) lines.push(['', ((d + Math.log10(m)) / decades) * 100]);
    }
    plotGrid.replaceChildren(
      ...lines.map(([cls, x]) => {
        const span = document.createElement('span');
        if (cls) span.className = cls;
        span.style.setProperty('--x', x.toFixed(4) + '%');
        return span;
      }),
    );
    const axis = document.querySelector('.plot-axis');
    const ticks = timing ? ['0.01', '0.1', '1', '10'] : ['1', '10', '100', '1,000', '10,000'];
    axis.replaceChildren(
      ...ticks.map((tick) => {
        const span = document.createElement('span');
        span.textContent = tick;
        span.dataset.short = tick.replace(/,000$/, 'k'); // shown on very narrow stages
        return span;
      }),
    );
    plot.style.setProperty('--interval', 100 / (ticks.length - 1) + '%');
    plot.dataset.metric = metric;
    byId('plot-caption').textContent =
      (timing ? 'Batch time in milliseconds' : 'Final height in levels') + ' · Logarithmic scale';

    const batch = numberFormat.format(size) + ' ' + order + ' insertions';
    const [avl, redBlack, splay] = runs;
    let reading;
    if (timing) {
      const quickest = runs.reduce((best, run) => (run.batchMs < best.batchMs ? run : best));
      reading =
        'For ' +
        batch +
        ', ' +
        quickest.tree +
        ' recorded the shortest batch time at ' +
        quickest.batchMs.toFixed(4) +
        ' ms. Each timing comes from a single run.';
    } else if (order === 'random') {
      reading =
        'After ' +
        batch +
        ', AVL and red-black reach ' +
        (avl.height === redBlack.height
          ? avl.height + ' levels each'
          : avl.height + ' and ' + redBlack.height + ' levels respectively') +
        '. Splay reaches ' +
        splay.height +
        '.';
    } else {
      reading =
        'At ' +
        batch +
        ', the splay tree has one level per key. The AVL tree reaches ' +
        avl.height +
        ' levels.';
    }
    byId('tree-reading').textContent = reading;

    // Results table: the selected order across all three sizes.
    const tableCaption = document.querySelector('[data-trees-table-caption]');
    if (tableCaption) {
      tableCaption.textContent =
        (timing ? 'Batch time in milliseconds, ' : 'Final height in levels, ') + order + ' keys';
      document.querySelectorAll('[data-size-col]').forEach((th) =>
        th.classList.toggle('is-current', th.dataset.sizeCol === size),
      );
      const body = document.querySelector('[data-trees-table-body]');
      body.replaceChildren(
        ...treeBenchmarks.trees.map((tree) => {
          const tr = document.createElement('tr');
          const th = document.createElement('th');
          th.scope = 'row';
          th.textContent = rowNames[tree] || tree;
          tr.append(th);
          for (const s of treeBenchmarks.sizes) {
            const td = tr.insertCell();
            td.textContent = format(valueOf(record(tree, orders[order], s)));
            if (s === Number(size)) td.className = 'is-current';
          }
          return tr;
        }),
      );
    }
    setText('[data-bench-state="trees"]', 'order=' + order + ' · size=' + size + ' · metric=' + metric);
    setText('[data-toc-state="trees"]', order + ' · ' + numberFormat.format(size) + ' · ' + metric);
  }

  // Hover layer (fine pointers): every size for the hovered tree. The table is the keyboard equivalent.
  (function plotTooltip() {
    const frame = plot && plot.querySelector('.nb-plot__frame');
    if (!frame) return;
    const tip = document.createElement('div');
    tip.className = 'nb-tip';
    tip.setAttribute('aria-hidden', 'true');
    frame.append(tip);
    const fine = () => (DC ? DC.prefs.fine : matchMedia('(hover: hover) and (pointer: fine)').matches);
    plotRows.forEach((row) => {
      row.addEventListener('pointerenter', (event) => {
        if (!fine() || event.pointerType === 'touch') return;
        const name = document.createElement('b');
        name.textContent = row.querySelector('.nb-row__name').textContent;
        const lines = row.dataset.tip.split('\n').map((line) => {
          const span = document.createElement('span');
          span.textContent = line;
          return span;
        });
        tip.replaceChildren(name, ...lines);
        const dot = row.querySelector('i');
        const track = row.querySelector('.nb-track').getBoundingClientRect();
        const box = frame.getBoundingClientRect();
        const x = track.left - box.left + (parseFloat(dot.style.getPropertyValue('--position')) / 100) * track.width;
        tip.style.setProperty('--tip-x', Math.max(70, Math.min(box.width - 70, x)) + 'px');
        tip.style.setProperty('--tip-y', track.top - box.top + 'px');
        tip.classList.add('is-on');
      });
      row.addEventListener('pointerleave', () => tip.classList.remove('is-on'));
    });
  })();

  /* ================================================================== Entry 03: retrieval */
  const titles = { A: 'Two days', B: 'Commute', C: 'Quick charge' };
  const rankings = {
    overlap: { keyword: ['A', 'B'], semantic: ['C', 'B'] },
    agreement: { keyword: ['A', 'B'], semantic: ['A', 'C'] },
    split: { keyword: ['A', 'B'], semantic: ['B', 'A'] },
  };
  const rrfBox = document.querySelector('[data-rrf]');
  let rrfLast = null; // previous row positions, for the reorder travel
  let rrfModel = null;

  function drawRanking() {
    const [scenario, channel] = controls.retrieval.map((field) => field.value);
    const lists = rankings[scenario];
    // Match the project's stable tie order: semantic candidates enter the map first.
    const channels = channel === 'hybrid' ? ['semantic', 'keyword'] : [channel];
    const scores = new Map();
    for (const name of channels) {
      lists[name].forEach((key, index) => scores.set(key, (scores.get(key) || 0) + 1 / (61 + index)));
    }
    const ordered = [...scores].sort((left, right) => right[1] - left[1]);
    function rank(name, key) {
      return channels.includes(name) ? lists[name].indexOf(key) + 1 : 0;
    }
    const rows = ordered.map(([key, score]) => {
      const row = document.createElement('tr');
      const name = document.createElement('th');
      name.scope = 'row';
      name.textContent = titles[key];
      row.append(name);
      for (const value of [rank('keyword', key) || '—', rank('semantic', key) || '—', score.toFixed(5)]) {
        const cell = row.insertCell();
        cell.textContent = value;
      }
      return row;
    });
    byId('rank-results').replaceChildren(...rows);
    const [leader, score] = ordered[0];
    const terms = channels
      .map((name) => rank(name, leader))
      .filter(Boolean)
      .map((position) => '1/' + (60 + position));
    const tied = ordered.filter((entry) => entry[1] === score);
    const finding =
      tied.length > 1
        ? titles[tied[0][0]] +
          ' and ' +
          titles[tied[1][0]] +
          ' tie for first. Semantic candidate order breaks the tie.'
        : titles[leader] + ' leads.';
    byId('rank-reading').textContent =
      finding + ' ' + titles[leader] + ' receives ' + terms.join(' + ') + ' = ' + score.toFixed(5) + '.';

    rrfModel = { lists, channels, ordered, rank, tied: tied.length > 1 };
    drawFusion(true);
    setText('[data-bench-state="retrieval"]', 'scenario=' + scenario + ' · channel=' + channel);
    setText('[data-toc-state="retrieval"]', scenario + ' · ' + channel);
  }

  // Fig. 3: two ranked lists feeding one fused list. Rendered at the stage's pixel width so
  // SVG text stays at its CSS size (never below 12 px).
  function drawFusion(animate) {
    if (!rrfBox || !rrfModel) return;
    const { lists, channels, ordered, rank, tied } = rrfModel;
    const W = Math.round(rrfBox.clientWidth);
    if (!W) return;
    const wide = W >= 560;
    const H = wide ? 300 : 404;
    const maxScore = 2 / 61;
    const svg = svgEl('svg', {
      class: 'nb-rrf__svg' + (wide ? ' is-wide' : ' is-narrow'),
      width: W,
      height: H,
      viewBox: '0 0 ' + W + ' ' + H,
      role: 'img',
    });
    const label =
      'Fusion diagram. ' +
      ['keyword', 'semantic']
        .map(
          (name) =>
            (name === 'keyword' ? 'Keyword list' : 'Semantic list') +
            (channels.includes(name) ? ': ' : ' (not used): ') +
            lists[name].map((key, i) => i + 1 + ' ' + titles[key]).join(', '),
        )
        .join('. ') +
      '. Fused order: ' +
      ordered.map(([key, score], i) => i + 1 + ' ' + titles[key] + ' ' + score.toFixed(5)).join(', ') +
      '.';
    svg.setAttribute('aria-label', label);

    const defs = svgEl('defs');
    for (const [id, cls] of [['nb-hatch-ink', 'nb-hatch'], ['nb-hatch-mark', 'nb-hatch nb-hatch--mark']]) {
      const pattern = svgEl('pattern', { id, width: 4, height: 4, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' });
      pattern.append(svgEl('rect', { class: 'nb-hatch-bg', width: 4, height: 4 }), svgEl('line', { class: cls, x1: 1, y1: 0, x2: 1, y2: 4 }));
      defs.append(pattern);
    }
    svg.append(defs);

    const leaderKey = ordered[0][0];
    const cardH = 40;
    const cards = {}; // key -> {keyword:{x,y,w}, semantic:{...}}
    const layers = { links: svgEl('g', { class: 'nb-rrf__links' }), cards: svgEl('g'), rows: svgEl('g') };

    function listBlock(name, x, y, w) {
      const active = channels.includes(name);
      const g = svgEl('g', { class: 'nb-rrf__list' + (active ? '' : ' is-off') });
      g.append(
        svgEl('text', { class: 'nb-rrf__label', x, y }, (name === 'keyword' ? 'Keyword' : 'Semantic') + (W >= 420 ? (name === 'keyword' ? ' · BM25' : ' · E5') : '') + (active ? '' : ' · not used')),
      );
      lists[name].forEach((key, i) => {
        const cy = y + 12 + i * (cardH + 8);
        const card = svgEl('g', { class: 'nb-rrf__card', 'data-doc': key });
        const tight = w < 150; // narrow columns: a slimmer rank cell so titles fit
        card.append(
          svgEl('rect', { class: 'nb-rrf__box', x: x + 0.5, y: cy + 0.5, width: w - 1, height: cardH - 1, rx: 2 }),
          svgEl('text', { class: 'nb-rrf__rank', x: x + (tight ? 11 : 14), y: cy + 25, 'text-anchor': 'middle' }, String(i + 1)),
          svgEl('line', { class: 'nb-rrf__sep', x1: x + (tight ? 22 : 28), y1: cy + 8, x2: x + (tight ? 22 : 28), y2: cy + cardH - 8 }),
          svgEl('text', { class: 'nb-rrf__title', x: x + (tight ? 29 : 38), y: cy + 25 }, titles[key]),
        );
        if (active && wide) card.append(svgEl('text', { class: 'nb-rrf__term', x: x + w - 10, y: cy + 25, 'text-anchor': 'end' }, '1/' + (61 + i)));
        g.append(card);
        (cards[key] = cards[key] || {})[name] = { x, y: cy, w, active };
      });
      layers.cards.append(g);
    }

    let rowX, rowW, rowY0, rowStep;
    if (wide) {
      const leftW = Math.round(W * 0.34);
      rowX = leftW + Math.round(W * 0.12);
      rowW = W - rowX;
      listBlock('keyword', 0, 14, leftW);
      listBlock('semantic', 0, 142, leftW);
      rowY0 = 26;
      rowStep = 76;
      layers.rows.append(svgEl('text', { class: 'nb-rrf__label', x: rowX, y: 14 }, 'Fused · k = 60'));
    } else {
      const colW = (W - 12) / 2;
      listBlock('keyword', 0, 14, colW);
      listBlock('semantic', colW + 12, 14, colW);
      rowX = 0;
      rowW = W;
      rowY0 = 146;
      rowStep = 68;
      layers.rows.append(svgEl('text', { class: 'nb-rrf__label', x: 0, y: 134 }, 'Fused · k = 60'));
    }

    const positions = {};
    const barX = rowX + 36;
    const scoreW = 64;
    const barMax = Math.max(40, rowW - 36 - scoreW - 8);
    ordered.forEach(([key, score], i) => {
      const y = rowY0 + i * rowStep;
      positions[key] = y;
      const lead = key === leaderKey;
      const outer = svgEl('g', { class: 'nb-rrf__row' + (lead ? ' is-lead' : ''), 'data-doc': key });
      const g = svgEl('g');
      g.append(
        svgEl('rect', { class: 'nb-rrf__pos', x: rowX + 0.5, y: y + 0.5, width: 25, height: 25, rx: 2 }),
        svgEl('text', { class: 'nb-rrf__rank', x: rowX + 13, y: y + 18, 'text-anchor': 'middle' }, String(i + 1)),
        svgEl('text', { class: 'nb-rrf__title nb-rrf__title--fused', x: barX, y: y + 18 }, titles[key]),
        svgEl('text', { class: 'nb-rrf__score', x: rowX + rowW, y: y + 18, 'text-anchor': 'end' }, score.toFixed(5)),
      );
      // Bar = keyword term then semantic term, on a linear 0 → 2/61 scale.
      let x = barX;
      const termText = [];
      for (const name of ['keyword', 'semantic']) {
        const r = rank(name, key);
        if (!r) continue;
        const width = (barMax * (1 / (60 + r))) / maxScore;
        const gap = x > barX ? 2 : 0; // 2 px surface gap between the two terms
        g.append(
          svgEl('rect', {
            class: 'nb-rrf__seg nb-rrf__seg--' + name,
            x: x + gap,
            y: y + 28,
            width: Math.max(1, width - gap),
            height: 10,
            fill: name === 'semantic' ? 'url(#' + (lead ? 'nb-hatch-mark' : 'nb-hatch-ink') + ')' : null,
          }),
        );
        x += width;
        termText.push((name === 'keyword' ? 'keyword ' : 'semantic ') + '1/' + (60 + r));
      }
      g.append(svgEl('text', { class: 'nb-rrf__terms', x: W < 300 ? rowX : barX, y: y + 58 }, termText.join(' + ')));
      outer.append(g);
      layers.rows.append(outer);

      // Connectors from each active list position to this fused row (wide layout).
      if (wide) {
        for (const name of ['keyword', 'semantic']) {
          const c = cards[key] && cards[key][name];
          if (!c || !c.active) continue;
          const x1 = c.x + c.w;
          const y1 = c.y + cardH / 2;
          const x2 = rowX - 6;
          const y2 = y + 13;
          const mid = (x1 + x2) / 2;
          layers.links.append(
            svgEl('path', {
              class: 'nb-rrf__link' + (lead ? ' is-lead' : ''),
              'data-doc': key,
              d: 'M' + x1 + ' ' + y1 + ' C' + mid + ' ' + y1 + ' ' + mid + ' ' + y2 + ' ' + x2 + ' ' + y2,
            }),
          );
        }
      }
    });

    if (tied) {
      // Ties only arise with two fused rows here, so the third slot is free for the note.
      const y = rowY0 + ordered.length * rowStep + (wide ? 4 : 16);
      layers.rows.append(svgEl('text', { class: 'nb-rrf__note', x: rowX, y }, 'Tie: semantic order decides.'));
    }

    // Legend: identity never rides on tone alone.
    const ly = wide ? H - 14 : H - 30;
    const legend = svgEl('g', { class: 'nb-rrf__legend' });
    legend.append(
      svgEl('rect', { class: 'nb-rrf__seg nb-rrf__seg--keyword', x: 0, y: ly - 9, width: 18, height: 10 }),
      svgEl('text', { class: 'nb-rrf__legend-text', x: 26, y: ly }, 'Keyword term'),
      svgEl('rect', { class: 'nb-rrf__seg nb-rrf__seg--semantic', x: wide ? 150 : 0, y: (wide ? ly : ly + 20) - 9, width: 18, height: 10, fill: 'url(#nb-hatch-ink)' }),
      svgEl('text', { class: 'nb-rrf__legend-text', x: wide ? 176 : 26, y: wide ? ly : ly + 20 }, 'Semantic term'),
    );
    svg.append(layers.links, layers.cards, layers.rows, legend);

    // Hover a review anywhere to trace it through the fusion.
    svg.addEventListener('pointerover', (event) => {
      const hit = event.target.closest('[data-doc]');
      const doc = hit ? hit.getAttribute('data-doc') : null;
      svg.querySelectorAll('[data-doc]').forEach((node) => node.classList.toggle('is-dim', !!doc && node.getAttribute('data-doc') !== doc));
    });
    svg.addEventListener('pointerleave', () => svg.querySelectorAll('.is-dim').forEach((node) => node.classList.remove('is-dim')));

    rrfBox.replaceChildren(svg);

    // Reorder travel (Response family): rows glide from their previous slot.
    if (animate && rrfLast && rrfLast.wide === wide && !reduced()) {
      svg.querySelectorAll('.nb-rrf__row').forEach((row) => {
        const key = row.getAttribute('data-doc');
        const from = rrfLast.positions[key];
        const inner = row.firstChild;
        if (from == null) {
          inner.style.opacity = '0';
        } else if (from !== positions[key]) {
          inner.style.transform = 'translateY(' + (from - positions[key]) + 'px)';
        }
      });
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          svg.classList.add('is-moving');
          svg.querySelectorAll('.nb-rrf__row > g').forEach((inner) => {
            inner.style.transform = '';
            inner.style.opacity = '';
          });
        }),
      );
    }
    rrfLast = { wide, positions };
  }

  /* ================================================================== Entry 01: insertion */
  // Parent of each key after each ascending AVL insertion; zero marks the root.
  const parentsAfterInsertion = [
    [0],
    [0, 1],
    [2, 0, 2],
    [2, 0, 2, 3],
    [2, 0, 4, 2, 4],
    [2, 4, 2, 0, 4, 5],
    [2, 4, 2, 0, 6, 4, 6],
  ];
  const pivots = [0, 0, 1, 0, 3, 2, 5];
  const canvas = byId('insertion-canvas');
  const stepField = byId('step');

  function depthsOf(parents) {
    const depth = (key) => (parents[key - 1] ? 1 + depth(parents[key - 1]) : 0);
    return parents.map((_, index) => depth(index + 1));
  }
  // Before rebalancing, an ascending key is the right child of the previous maximum (key − 1).
  function parentsBeforeRotation(step) {
    if (step < 2) return parentsAfterInsertion[0];
    return parentsAfterInsertion[step - 2].concat([step - 1]);
  }

  function describeInsertion() {
    const step = Number(stepField.value);
    const parents = parentsAfterInsertion[step - 1];
    const root = parents.indexOf(0) + 1;
    const depth = (key) => (parents[key - 1] ? 1 + depth(parents[key - 1]) : 0);
    const levels = 1 + Math.max(...parents.map((_, index) => depth(index + 1)));
    const caption = 'Root ' + root + ' · ' + levels + (levels === 1 ? ' level' : ' levels');
    byId('step-count').textContent = step + ' / 7';
    const pivot = pivots[step - 1];
    const change = pivot
      ? 'A left rotation at ' + pivot + ' restores balance.'
      : step === 1
        ? 'The first key becomes the root.'
        : 'The tree stays balanced without a rotation.';
    byId('step-reading').textContent = 'Inserted key ' + step + '. ' + change + ' ' + caption + '.';
    canvas.setAttribute(
      'aria-label',
      'AVL tree. ' +
        parents
          .map((parent, i) =>
            parent
              ? 'Node ' +
                (i + 1) +
                ' is the ' +
                (i + 1 < parent ? 'left' : 'right') +
                ' child of ' +
                parent
              : 'Node ' + (i + 1) + ' is the root',
          )
          .join('. ') +
        '.',
    );
    stepField.setAttribute('aria-valuetext', step + ' keys inserted. ' + caption);
    setText('[data-bench-state="insertion"]', 'step=' + step + ' · root ' + root + ' · ' + levels + (levels === 1 ? ' level' : ' levels'));
    setText('[data-toc-state="insertion"]', 'step ' + step + ' / 7');
    if (!replayTimer) setReplayLabel('idle');
    document.querySelectorAll('[data-step-table] tbody tr').forEach((tr, i) => {
      tr.classList.toggle('is-current', i === step - 1);
    });
    document.querySelectorAll('[data-step-by]').forEach((button) => {
      const by = Number(button.dataset.stepBy);
      const off = (by < 0 && step <= 1) || (by > 0 && step >= 7);
      if (off) button.setAttribute('aria-disabled', 'true');
      else button.removeAttribute('aria-disabled');
    });
  }

  /* Canvas scene. Node positions live in layout units (column = key − 1, depth), so a resize
     redraws without disturbing an in-flight tween. The rAF loop runs only while a tween is
     active and stops itself when it lands (0 rAF at idle). */
  const scene = {
    shown: {}, // key -> {col, depth, alpha}
    edges: parentsAfterInsertion[6],
    pivot: 0,
    newest: 7,
    count: 7,
    tween: null,
    queue: [],
    raf: 0,
    visible: true,
  };
  (function initScene() {
    const depths = depthsOf(parentsAfterInsertion[6]);
    for (let k = 1; k <= 7; k++) scene.shown[k] = { col: k - 1, depth: depths[k - 1], alpha: 1 };
  })();

  function targetFor(parents) {
    const depths = depthsOf(parents);
    const target = {};
    parents.forEach((_, i) => (target[i + 1] = { col: i, depth: depths[i], alpha: 1 }));
    return target;
  }
  function stopTween() {
    if (scene.raf) cancelAnimationFrame(scene.raf);
    scene.raf = 0;
    scene.tween = null;
    scene.queue = [];
  }
  function startPhase(phase) {
    const from = {};
    for (const key in scene.shown) from[key] = { ...scene.shown[key] };
    for (const key in phase.target) if (!from[key]) from[key] = { col: Number(key) - 1, depth: 4.2, alpha: 0 };
    scene.edges = phase.edges;
    scene.pivot = phase.pivot;
    scene.newest = phase.newest;
    scene.count = phase.count;
    scene.tween = { from, to: phase.target, start: 0, duration: phase.duration, hold: phase.hold || 0 };
    if (!scene.raf) scene.raf = requestAnimationFrame(tick);
  }
  function tick(now) {
    scene.raf = 0;
    const tween = scene.tween;
    if (!tween) return;
    if (!tween.start) tween.start = now;
    const t = Math.min(1, Math.max(0, (now - tween.start - tween.hold) / tween.duration));
    const e = easeOut(t);
    const shown = {};
    for (const key in tween.to) {
      const a = tween.from[key] || tween.to[key];
      const b = tween.to[key];
      shown[key] = { col: b.col, depth: a.depth + (b.depth - a.depth) * e, alpha: a.alpha + (b.alpha - a.alpha) * e };
    }
    scene.shown = shown;
    paint();
    if (t < 1) {
      scene.raf = requestAnimationFrame(tick);
    } else if (scene.queue.length) {
      startPhase(scene.queue.shift());
    } else {
      scene.tween = null;
    }
  }
  function settle(step) {
    stopTween();
    const parents = parentsAfterInsertion[step - 1];
    scene.shown = targetFor(parents);
    scene.edges = parents;
    scene.pivot = pivots[step - 1];
    scene.newest = step;
    scene.count = step;
    paint();
  }
  function showStep(step, previous) {
    const animate = !reduced() && scene.visible && previous != null && previous !== step;
    if (!animate) return settle(step);
    stopTween();
    const after = parentsAfterInsertion[step - 1];
    const pivot = pivots[step - 1];
    if (step === previous + 1 && pivot) {
      // Phase 1: the key lands as a plain BST insert. Phase 2: the left rotation at the pivot.
      const before = parentsBeforeRotation(step);
      startPhase({ target: targetFor(before), edges: before, pivot: 0, newest: step, count: step, duration: 520 });
      scene.queue.push({ target: targetFor(after), edges: after, pivot, newest: step, count: step, duration: 620, hold: 160 });
    } else {
      startPhase({ target: targetFor(after), edges: after, pivot, newest: step, count: step, duration: 560 });
    }
  }

  let palette = null;
  function readPalette() {
    const style = getComputedStyle(canvas);
    const v = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
    palette = {
      fg: v('--fg', '#1b1e26'),
      fg2: v('--fg-2', '#575a64'),
      fg3: v('--fg-3', '#575a64'),
      rule: v('--rule', '#d6d2c4'),
      ruleStrong: v('--rule-strong', 'rgba(27,30,38,.32)'),
      mark: v('--mark', '#284ad5'),
      onAccent: v('--on-accent', '#f7f7f3'),
      ground: v('--nb-stage', '#f7f7f3'),
      mono: v('--f-mono', 'monospace'),
    };
  }

  function paint() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    if (!palette) readPalette();
    const ratio = window.devicePixelRatio || 1;
    const pw = Math.round(width * ratio);
    const ph = Math.round(height * ratio);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const narrow = width < 480;
    const gutter = narrow ? 30 : 52;
    const colW = (width - gutter - 6) / 7;
    const r = Math.max(13, Math.min(19, colW * 0.36));
    const top = r + 14;
    const tapeY = height - 18;
    const rowH = (tapeY - 34 - top) / 3;
    const X = (col) => gutter + colW * (col + 0.5);
    const Y = (depth) => top + depth * rowH;
    const mono = (size, weight) => (weight || 400) + ' ' + size + 'px ' + palette.mono;

    // Level guides (depth rows) with mono labels.
    ctx.lineWidth = 1;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.font = mono(12);
    for (let d = 0; d < 4; d++) {
      const y = Math.round(Y(d)) + 0.5;
      ctx.strokeStyle = palette.rule;
      ctx.beginPath();
      ctx.moveTo(gutter - 4, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.fillStyle = palette.fg3;
      ctx.fillText(narrow ? String(d + 1) : 'L' + (d + 1), 0, y);
    }

    // The key tape: insertion order on the in-order columns. Pending keys are outlined.
    ctx.strokeStyle = palette.ruleStrong;
    ctx.beginPath();
    ctx.moveTo(gutter - 4, Math.round(tapeY - 14) + 0.5);
    ctx.lineTo(width, Math.round(tapeY - 14) + 0.5);
    ctx.stroke();
    ctx.textAlign = 'left';
    ctx.fillStyle = palette.fg3;
    ctx.font = mono(12);
    ctx.fillText(narrow ? 'key' : 'keys', 0, tapeY);
    ctx.textAlign = 'center';
    for (let k = 1; k <= 7; k++) {
      const inserted = k <= scene.count;
      ctx.fillStyle = inserted ? palette.fg2 : palette.fg3;
      ctx.font = mono(12, inserted ? 500 : 400);
      ctx.fillText(String(k), X(k - 1), tapeY);
      if (!inserted) {
        ctx.setLineDash([2, 3]);
        ctx.strokeStyle = palette.fg3;
        ctx.strokeRect(Math.round(X(k - 1) - 10) + 0.5, Math.round(tapeY - 10) + 0.5, 20, 20);
        ctx.setLineDash([]);
      }
    }

    const shown = scene.shown;
    const point = (key) => {
      const node = shown[key];
      return node ? { x: X(node.col), y: Y(node.depth), a: node.alpha } : null;
    };

    // Edges.
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = palette.fg2;
    scene.edges.forEach((parent, index) => {
      if (!parent) return;
      const a = point(parent);
      const b = point(index + 1);
      if (!a || !b) return;
      ctx.globalAlpha = Math.min(a.a, b.a);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Pivot ring (dashed) and its label.
    if (scene.pivot && shown[scene.pivot]) {
      const p = point(scene.pivot);
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = palette.fg;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Nodes.
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const key in shown) {
      const p = point(key);
      const newest = Number(key) === scene.newest;
      ctx.globalAlpha = p.a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = newest ? palette.mark : palette.ground;
      ctx.fill();
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = newest ? palette.mark : palette.fg;
      ctx.stroke();
      ctx.fillStyle = newest ? palette.onAccent : palette.fg;
      ctx.font = mono(r > 15 ? 14 : 12, 500);
      ctx.fillText(String(key), p.x, p.y + 0.5);
    }
    ctx.globalAlpha = 1;
  }

  // animate=true tweens from the step on screen; false jumps (first paint, restores).
  function drawInsertion(animate) {
    describeInsertion();
    showStep(Number(stepField.value), animate ? scene.count : null);
  }

  /* Replay: steps 1 → 7 on a timer (user-started; stops at 7, on any manual input,
     when the bench leaves the viewport, or when the tab is hidden). */
  const replayButton = document.querySelector('[data-replay]');
  let replayTimer = 0;
  function setReplayLabel(state) {
    if (!replayButton) return;
    replayButton.removeAttribute('aria-pressed');
    replayButton.dataset.state = state;
    const label = replayButton.querySelector('[data-replay-label]');
    const step = Number(stepField.value);
    label.textContent = state === 'playing' ? 'Pause replay' : step >= 7 ? 'Replay from key 1' : 'Play from key ' + (step + 1);
    const use = replayButton.querySelector('[data-replay-icon] use');
    if (use) use.setAttribute('href', use.getAttribute('href').replace(/#(play|pause)$/, state === 'playing' ? '#pause' : '#play'));
  }
  function stopReplay(state) {
    clearTimeout(replayTimer);
    replayTimer = 0;
    setReplayLabel(state || (Number(stepField.value) >= 7 ? 'idle' : 'paused'));
  }
  function replayStep() {
    const previous = Number(stepField.value);
    if (previous >= 7) return stopReplay('idle');
    stepField.value = String(previous + 1);
    drawInsertion(true);
    saveSelection('insertion');
    if (Number(stepField.value) >= 7) return stopReplay('idle');
    replayTimer = setTimeout(replayStep, reduced() ? 1100 : 1500);
  }
  function startReplay() {
    if (Number(stepField.value) >= 7) {
      stepField.value = '1';
      drawInsertion(false);
      saveSelection('insertion');
    }
    setReplayLabel('playing');
    replayTimer = setTimeout(replayStep, reduced() ? 900 : 1100);
  }
  if (replayButton) {
    replayButton.addEventListener('click', () => (replayTimer ? stopReplay('paused') : startReplay()));
  }
  document.querySelectorAll('[data-step-by]').forEach((button) =>
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-disabled') === 'true') return;
      if (replayTimer) stopReplay();
      const previous = Number(stepField.value);
      const next = Math.max(1, Math.min(7, previous + Number(button.dataset.stepBy)));
      if (next === previous) return;
      stepField.value = String(next);
      drawInsertion(true);
      saveSelection('insertion');
      if (replayButton && !replayTimer) setReplayLabel(next >= 7 ? 'idle' : 'paused');
    }),
  );

  /* ================================================================== wiring */
  const render = {
    trees: drawMeasurements,
    retrieval: drawRanking,
    insertion: () => drawInsertion(false),
  };
  function fieldDefaultsSet(section) {
    for (const field of controls[section]) field.value = fieldDefault(field);
  }
  function restoreSelection() {
    const [section, query] = location.hash.slice(1).split('?');
    if (!Object.hasOwn(controls, section)) return;
    if (!query) {
      // Bare anchor (#trees): the browser scrolls; keep any non-default state in the address.
      if (sections.some((s) => controls[s].some((field) => field.value !== fieldDefault(field)))) saveSelection(section);
      return;
    }
    const params = new URLSearchParams(query);
    for (const name of sections) {
      for (const field of controls[name]) {
        if (name === section || params.has(field.id)) applyField(field, params.get(field.id));
        else field.value = fieldDefault(field);
      }
    }
    if (replayTimer) stopReplay();
    for (const name of sections) render[name]();
    byId(section).scrollIntoView({ behavior: 'instant' });
  }

  for (const [section, inputs] of Object.entries(controls)) {
    for (const input of inputs) {
      input.addEventListener(input.type === 'range' ? 'input' : 'change', () => {
        if (section === 'insertion') {
          if (replayTimer) stopReplay();
          drawInsertion(true);
          if (replayButton) setReplayLabel(Number(input.value) >= 7 ? 'idle' : 'paused');
        } else {
          render[section]();
        }
        saveSelection(section);
      });
    }
  }

  document.querySelectorAll('[data-reset]').forEach((button) =>
    button.addEventListener('click', () => {
      const section = button.dataset.reset;
      if (section === 'insertion' && replayTimer) stopReplay('idle');
      fieldDefaultsSet(section);
      if (section === 'insertion') {
        drawInsertion(true);
        setReplayLabel('idle');
      } else render[section]();
      saveSelection(section);
    }),
  );

  // Contents: <details> below 1100 px (closed), an always-open sticky column above.
  const toc = document.querySelector('[data-toc]');
  if (toc) {
    const desktop = matchMedia('(min-width: 1100px)');
    const sync = () => (toc.open = desktop.matches);
    sync();
    desktop.addEventListener('change', sync);
    toc.addEventListener('click', (event) => {
      if (!desktop.matches && event.target.closest('a')) toc.open = false;
    });
    const links = [...document.querySelectorAll('[data-toc-link]')];
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            links.forEach((link) =>
              link.dataset.tocLink === entry.target.id ? link.setAttribute('aria-current', 'true') : link.removeAttribute('aria-current'),
            );
          }
        },
        { rootMargin: '-35% 0px -60% 0px' },
      );
      sections.forEach((id) => byId(id) && io.observe(byId(id)));
    }
  }

  // Copy a link that reopens all three benches as they are now.
  const share = document.querySelector('[data-nb-share]');
  if (share) {
    const label = share.querySelector('[data-nb-share-label]');
    const live = document.querySelector('[data-nb-share-live]');
    let resetTimer = 0;
    share.addEventListener('click', () => {
      const current = document.querySelector('[data-toc-link][aria-current]');
      const section = current ? current.dataset.tocLink : location.hash.slice(1).split('?')[0] || 'insertion';
      const url = location.href.split('#')[0] + serialize(Object.hasOwn(controls, section) ? section : 'insertion');
      const done = (ok) => {
        label.textContent = ok ? 'Link copied' : 'Copy failed: use the address bar';
        if (live) live.textContent = ok ? 'Link to this view copied.' : 'Copy failed. The address bar holds the same link.';
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => (label.textContent = 'Copy link to this view'), 2400);
      };
      const copy = DC && DC.copy ? DC.copy(url) : navigator.clipboard ? navigator.clipboard.writeText(url).then(() => true) : Promise.resolve(false);
      Promise.resolve(copy).then(done, () => done(false));
    });
  }

  // Show the interactive parts (CSS also gates them on html.js, so nothing shifts).
  document.querySelectorAll('[data-js-only], .insertion-drawing').forEach((element) => (element.hidden = false));

  // First render (no tween), then restore any state from the address.
  for (const section of sections) render[section]();
  restoreSelection();
  window.addEventListener('hashchange', restoreSelection);

  // Redraw on resize; pause tweens offscreen.
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => paint()).observe(canvas.parentElement);
    if (rrfBox) {
      let lastW = 0;
      new ResizeObserver(() => {
        const w = Math.round(rrfBox.clientWidth);
        if (w && w !== lastW) {
          lastW = w;
          drawFusion(false);
        }
      }).observe(rrfBox);
    }
  }
  if (DC && DC.watchVisibility) {
    DC.watchVisibility(canvas.parentElement, (visible) => {
      scene.visible = visible;
      if (!visible) {
        if (scene.tween) settle(Number(stepField.value));
        if (replayTimer) stopReplay();
      }
    });
  }
  if (DC && DC.prefs && DC.prefs.subscribe) {
    DC.prefs.subscribe(() => {
      if (reduced() && scene.tween) settle(Number(stepField.value));
    });
  }
  // Canvas text uses DM Mono, which loads on use: redraw once it is ready.
  if (document.fonts && document.fonts.load) {
    document.fonts.load('500 14px "DM Mono"').then(() => paint(), () => {});
  }

  root.classList.add('enhanced');
})();
