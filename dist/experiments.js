'use strict';

/* experiments.js — owner L (labs). The three bench factories.
   Each lab exposes its URL parameters so a case study can reopen the same example:
   factory(panel, onChange) -> { restore(URLSearchParams), params(): URLSearchParams }.
   Contracts (ids, data-*, ARIA, #lab/<key>?… formats) per _research/audit-code.md §2.
   Only these three top-level names exist (legacy; site.js calls them). Every helper is
   nested so nothing new leaks into the shared global scope. */

function evidenceLab(panel, onChange) {
  const { records, captured } = kaaranEvidence;
  const body = panel.querySelector('[data-evidence-body]');
  const details = panel.querySelector('.records');
  const choice = panel.querySelector('select');
  const languageButtons = panel.querySelectorAll('[data-language]');
  const resetButton = panel.querySelector('[data-reset]');
  const readout = panel.querySelector('[data-k-readout]');
  const ledger = panel.querySelector('[data-k-ledger]');
  const cells = [...panel.querySelectorAll('[data-k-cell]')];
  const snapshot = panel.querySelector('[data-snapshot]');
  const letters = 'abc';
  const text = {
    en: {
      type: 'Education analytics · Synthetic sample',
      question: 'Which block needs the most attention?',
      answer: 'Pandharpur has three flagged clusters in the district sample.',
      inspect: 'Inspect 3 clusters',
      choose: 'Why does this cluster need attention?',
      source: 'View source record',
      snapshot: 'Synthetic evidence captured',
      period: 'Comparison period',
    },
    mr: {
      type: 'शैक्षणिक विश्लेषण · कृत्रिम नमुना',
      question: 'कोणत्या तालुक्याकडे सर्वाधिक लक्ष देणे आवश्यक आहे?',
      answer: 'जिल्ह्याच्या नमुन्यात पंढरपूर तालुक्यातील तीन केंद्रांकडे लक्ष देणे आवश्यक आहे.',
      inspect: '३ केंद्रांच्या नोंदी तपासा',
      choose: 'या केंद्राकडे लक्ष देणे का आवश्यक आहे?',
      source: 'मूळ नोंद पहा',
      snapshot: 'कृत्रिम नमुन्याची नोंद घेतल्याची तारीख',
      period: 'तुलना कालावधी',
    },
  };
  // The headline figure of each record, read from its English finding (data stays untouched).
  function figure(record) {
    const match = /(\d+(?:\.\d+)?) percentage points/.exec(record.en);
    return match ? match[1] + ' pp' : '';
  }
  let language = 'en';
  let shown = null;
  function render(recordId) {
    const record = records.find((item) => item.id === recordId) || records[0];
    const index = records.indexOf(record);
    const strings = text[language];
    const marathi = language === 'mr';
    body.lang = language;
    languageButtons.forEach((button) =>
      button.setAttribute('aria-pressed', button.dataset.language === language),
    );
    body.querySelectorAll('[data-e-text]').forEach((element) => {
      element.textContent = strings[element.dataset.eText];
    });
    choice.replaceChildren(
      ...records.map((item) => new Option(marathi ? item.mrName : item.name, item.id)),
    );
    choice.value = record.id;
    panel.querySelector('[data-record-name]').textContent = marathi ? record.mrName : record.name;
    panel.querySelector('[data-record-finding]').textContent = record[language];
    panel.querySelector('[data-record-period]').textContent =
      strings.period + ' · ' + (marathi ? record.mrPeriod : record.period);
    panel.querySelector('[data-workbooks]').replaceChildren(
      ...record.workbooks.map((filename) => {
        const item = document.createElement('li');
        item.textContent = filename;
        return item;
      }),
    );
    const source = panel.querySelector('[data-record-url]');
    source.href = record.url;
    const sourceLabel = source.querySelector('[data-record-url-label]');
    if (sourceLabel) sourceLabel.textContent = strings.source;
    else source.textContent = strings.source;
    if (snapshot) {
      snapshot.lang = language;
      snapshot.textContent = strings.snapshot + ' · ' + captured;
    }
    // The ledger: one row per source record, aligned under the count; the open record is marked.
    if (ledger) {
      ledger.replaceChildren(
        ...records.map((item, i) => {
          const row = document.createElement('li');
          row.className = 'kledger__row';
          row.dataset.kPick = item.id;
          if (details.open && i === index) row.setAttribute('aria-current', 'true');
          const key = document.createElement('span');
          key.className = 'kledger__key';
          key.textContent = letters[i];
          const name = document.createElement('span');
          name.className = 'kledger__name';
          name.textContent = marathi ? item.mrName : item.name;
          const value = document.createElement('span');
          value.className = 'kledger__value';
          value.lang = 'en';
          value.textContent = figure(item);
          row.append(key, name, value);
          return row;
        }),
      );
    }
    cells.forEach((cell, i) => {
      cell.classList.toggle('is-current', details.open && i === index);
      cell.classList.toggle('is-muted', details.open && i !== index);
    });
    if (readout) {
      readout.textContent =
        (details.open ? 'Record ' + letters[index] + ' of 3 · ' + record.id : '3 flagged clusters') +
        ' · ' + language.toUpperCase();
    }
    const extract = panel.querySelector('.source-extract');
    if (extract && shown !== null && shown !== record.id + language) {
      extract.classList.remove('is-swapping');
      void extract.offsetWidth;
      extract.classList.add('is-swapping');
    }
    shown = record.id + language;
  }
  languageButtons.forEach((button) =>
    button.addEventListener('click', () => {
      language = button.dataset.language;
      render(choice.value);
      onChange();
    }),
  );
  choice.addEventListener('change', () => {
    render(choice.value);
    onChange();
  });
  details.addEventListener('toggle', () => {
    render(choice.value);
    onChange();
  });
  // Pointer shortcut: a ledger row or a chart cell picks that record (the select stays the
  // keyboard and screen-reader control, so these are not separate tab stops).
  panel.addEventListener('click', (event) => {
    const pick = event.target.closest('[data-k-pick]');
    if (!pick || !panel.contains(pick)) return;
    const id = pick.dataset.kPick;
    if (!details.open) details.open = true;
    render(id);
    onChange();
  });
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      language = 'en';
      const wasOpen = details.open;
      details.open = false;
      render(records[0].id);
      if (!wasOpen) onChange();
    });
  }
  const extract = panel.querySelector('.source-extract');
  if (extract) extract.addEventListener('animationend', () => extract.classList.remove('is-swapping'));
  return {
    restore(params) {
      language = params.get('lang') === 'mr' ? 'mr' : 'en';
      const id = params.get('cluster');
      details.open = records.some((record) => record.id === id);
      shown = null;
      render(id);
    },
    params() {
      const params = new URLSearchParams();
      if (language === 'mr') params.set('lang', language);
      if (details.open) params.set('cluster', choice.value);
      return params;
    },
  };
}

function rotationLab(panel, onChange) {
  const NS = 'http://www.w3.org/2000/svg';
  const sequence = panel.querySelector('[data-sequence]');
  const selection = panel.querySelector('[data-node]');
  const status = panel.querySelector('[data-tree-status]');
  const undo = panel.querySelector('[data-undo]');
  const edges = panel.querySelector('[data-edges]');
  const nodes = panel.querySelector('[data-nodes]');
  const hull = panel.querySelector('[data-hull]');
  const stage = panel.querySelector('.tree-stage svg');
  const hint = panel.querySelector('[data-tree-hint]');
  const checks = panel.querySelector('[data-tree-checks]');
  const log = panel.querySelector('[data-tree-log]');
  const rotateButtons = [...panel.querySelectorAll('[data-rotate]')];
  const keys = [10, 20, 30];
  const MINUS = '−';
  let root;
  let moves = [];
  let notes = [];

  function svg(tag, attrs) {
    const element = document.createElementNS(NS, tag);
    for (const name in attrs || {}) element.setAttribute(name, attrs[name]);
    return element;
  }
  function signed(value) {
    return value > 0 ? '+' + value : value < 0 ? MINUS + Math.abs(value) : '0';
  }
  function reduced() {
    return !!(window.DC && DC.prefs && DC.prefs.reduce) ||
      matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------- Glyphs: one <g role=button> per key, created once, moved by transform ---------- */
  const glyphs = new Map(
    keys.map((key) => {
      const group = svg('g', { class: 'tnode', role: 'button', tabindex: '-1' });
      group.dataset.key = String(key);
      const ring = svg('circle', { class: 'tnode__focus', r: '34' });
      const pick = svg('circle', { class: 'tnode__pick', r: '29' });
      const disc = svg('circle', { class: 'tnode__disc', r: '23' });
      const label = svg('text', { class: 'tnode__key', 'text-anchor': 'middle', dy: '0.35em' });
      label.textContent = String(key);
      const badge = svg('g', { class: 'tnode__bf', transform: 'translate(0 -44)' });
      const plate = svg('rect', { x: '-33', y: '-13', width: '66', height: '26', rx: '2' });
      const value = svg('text', { 'text-anchor': 'middle', dy: '0.35em' });
      badge.append(plate, value);
      group.append(ring, pick, disc, label, badge);
      function chooseNode() {
        selection.value = String(key);
        render();
        onChange();
      }
      group.addEventListener('click', () => {
        chooseNode();
        group.focus({ preventScroll: true });
      });
      group.addEventListener('keydown', (event) => {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          chooseNode();
          return;
        }
        const target = neighbour(key, event.key);
        if (target !== undefined) {
          event.preventDefault();
          if (target === null) return;
          selection.value = String(target);
          render();
          onChange();
          glyphs.get(target).group.focus({ preventScroll: true });
          return;
        }
        const letter = event.key.toLowerCase();
        if (letter === 'l' || letter === 'r') {
          event.preventDefault();
          selection.value = String(key);
          rotate(letter === 'r' ? 'right' : 'left');
        }
      });
      nodes.append(group);
      return [key, { group, value, badge }];
    }),
  );

  /* ---------- Tree model (BST insert, no balancing; heights count nodes) ---------- */
  function insert(node, key) {
    if (!node) return { key, left: null, right: null };
    const side = key < node.key ? 'left' : 'right';
    node[side] = insert(node[side], key);
    return node;
  }
  function height(node) {
    return node ? 1 + Math.max(height(node.left), height(node.right)) : 0;
  }
  function balance(node) {
    return height(node.left) - height(node.right);
  }
  function locate(key) {
    let node = root;
    let parent = null;
    let side = null;
    while (node && node.key !== key) {
      parent = node;
      side = key < node.key ? 'left' : 'right';
      node = node[side];
    }
    return { node, parent, side };
  }
  function inorder(node, out) {
    if (node) {
      inorder(node.left, out);
      out.push(node.key);
      inorder(node.right, out);
    }
    return out;
  }
  // The lowest node whose |bf| > 1 (the tutor rebalances the first unbalanced node from the bottom).
  function lowestUnbalanced(node) {
    if (!node) return null;
    return lowestUnbalanced(node.left) || lowestUnbalanced(node.right) ||
      (Math.abs(balance(node)) > 1 ? node : null);
  }
  // Case naming as in the tutor (LL, LR, RR, RL), read from the heavy child's lean.
  function diagnose() {
    const node = lowestUnbalanced(root);
    if (!node) return null;
    const bf = balance(node);
    const heavySide = bf > 0 ? 'left' : 'right';
    const child = node[heavySide];
    const childBf = balance(child);
    let kind;
    if (bf > 0) kind = childBf < 0 ? 'LR' : 'LL';
    else kind = childBf > 0 ? 'RL' : 'RR';
    const fix =
      kind === 'LL' ? ['R' + node.key]
      : kind === 'RR' ? ['L' + node.key]
      : kind === 'LR' ? ['L' + child.key, 'R' + node.key]
      : ['R' + child.key, 'L' + node.key];
    return { node, bf, heavySide, child, childBf, kind, fix };
  }
  function applyMove(move) {
    const { node, parent, side } = locate(Number(move.slice(1)));
    const rightRotation = move[0] === 'R';
    const promote = rightRotation ? 'left' : 'right';
    const opposite = rightRotation ? 'right' : 'left';
    if (!node || !node[promote]) return false;
    const pivot = node[promote];
    node[promote] = pivot[opposite];
    pivot[opposite] = node;
    if (parent) parent[side] = pivot;
    else root = pivot;
    return true;
  }
  // Describe a move in the tutor's step wording ("Right rotation at node 30 (case: LL)"),
  // judged against the state before it.
  function note(move, previousNote) {
    const before = diagnose();
    const name = (move[0] === 'R' ? 'Right' : 'Left') + ' rotation at node ' + move.slice(1);
    if (!before) return { text: name + ' (the tree was already balanced)' };
    if (before.fix.length === 2 && before.fix[0] === move) {
      return { text: name + ' (case: ' + before.kind + ', step 1 of 2)', prep: before.node.key, kind: before.kind };
    }
    if (before.fix.length === 1 && before.fix[0] === move) {
      if (previousNote && previousNote.prep === before.node.key) {
        return { text: name + ' (case: ' + previousNote.kind + ', step 2 of 2)' };
      }
      return { text: name + ' (case: ' + before.kind + ')' };
    }
    return { text: name + ' (not the rotation case ' + before.kind + ' needs)' };
  }
  function rebuild(history) {
    const order = sequence.value === 'lr' ? [30, 10, 20] : [30, 20, 10];
    root = order.reduce(insert, null);
    moves = [];
    notes = [];
    for (const move of history) {
      if (!/^[LR](10|20|30)$/.test(move)) break;
      const entry = note(move, notes[notes.length - 1]);
      if (!applyMove(move)) break;
      moves.push(move);
      notes.push(entry);
    }
  }

  /* ---------- Layout: x by in-order rank (so it never changes), y by depth ---------- */
  function layout() {
    const pos = new Map();
    const parentOf = new Map();
    (function walk(node, depth, parent) {
      if (!node) return;
      pos.set(node.key, { x: 70 + keys.indexOf(node.key) * 110, y: 64 + depth * 74 });
      parentOf.set(node.key, parent ? parent.key : null);
      walk(node.left, depth + 1, node);
      walk(node.right, depth + 1, node);
    })(root, 0, null);
    return { pos, parentOf };
  }
  function subtreeKeys(node, out) {
    if (node) {
      out.push(node.key);
      subtreeKeys(node.left, out);
      subtreeKeys(node.right, out);
    }
    return out;
  }

  /* ---------- Drawing + travel (rAF only while moving; self-stops) ---------- */
  const edgeLines = new Map();
  let shown = null; // { pos, parentOf } currently drawn at rest
  let travel = null; // { from, fromParent, to, toParent, t0 }
  let frame = 0;
  let heavy = [];
  const DURATION = 720;
  function ease(t) {
    return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }
  function lerp(a, b, t) {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }
  function edgeFor(key) {
    let line = edgeLines.get(key);
    if (!line) {
      line = svg('line', { class: 'tedge' });
      line.dataset.child = String(key);
      edgeLines.set(key, line);
    }
    if (!line.isConnected) edges.append(line);
    return line;
  }
  function setLine(line, a, b, opacity) {
    line.setAttribute('x1', a.x.toFixed(2));
    line.setAttribute('y1', a.y.toFixed(2));
    line.setAttribute('x2', b.x.toFixed(2));
    line.setAttribute('y2', b.y.toFixed(2));
    if (opacity >= 1) line.removeAttribute('opacity');
    else line.setAttribute('opacity', opacity.toFixed(3));
  }
  function drawHull(current) {
    if (!hull) return;
    hull.replaceChildren();
    if (!heavy.length) return;
    const points = heavy.map((key) => current.get(key));
    const path = points.length === 1
      ? 'M' + points[0].x + ' ' + points[0].y + 'h0.01'
      : heavy.map((key, i) => (i ? 'L' : 'M') + current.get(key).x.toFixed(2) + ' ' + current.get(key).y.toFixed(2)).join('');
    const pattern = stage.querySelector('pattern');
    hull.append(
      svg('path', { class: 'thull__edge', d: path }),
      svg('path', { class: 'thull__band', d: path, stroke: pattern ? 'url(#' + pattern.id + ')' : 'currentColor' }),
    );
  }
  function paint(t) {
    const { from, fromParent, to, toParent } = travel;
    const p = ease(t);
    const current = new Map();
    keys.forEach((key) => current.set(key, lerp(from.get(key), to.get(key), p)));
    keys.forEach((key) => {
      const at = current.get(key);
      glyphs.get(key).group.setAttribute('transform', 'translate(' + at.x.toFixed(2) + ' ' + at.y.toFixed(2) + ')');
      const oldParent = fromParent.get(key);
      const newParent = toParent.get(key);
      if (oldParent == null && newParent == null) {
        const line = edgeLines.get(key);
        if (line) line.remove();
        return;
      }
      const line = edgeFor(key);
      if (oldParent != null && newParent != null) {
        setLine(line, lerp(current.get(oldParent), current.get(newParent), p), at, 1);
      } else if (newParent != null) {
        setLine(line, lerp(at, current.get(newParent), p), at, p);
      } else {
        setLine(line, lerp(current.get(oldParent), at, p), at, 1 - p);
      }
    });
    drawHull(current);
    if (t >= 1) {
      keys.forEach((key) => {
        if (toParent.get(key) == null && edgeLines.get(key)) edgeLines.get(key).remove();
      });
    }
  }
  function tick(now) {
    const t = Math.min(1, (now - travel.t0) / DURATION);
    travel.now = t;
    paint(t);
    frame = t < 1 ? requestAnimationFrame(tick) : 0;
    if (!frame) travel = null;
  }
  function currentPositions() {
    if (!travel) return shown ? shown.pos : null;
    const p = ease(travel.now || 0);
    const out = new Map();
    keys.forEach((key) => out.set(key, lerp(travel.from.get(key), travel.to.get(key), p)));
    return out;
  }
  function place(target, animate) {
    const from = currentPositions();
    const fromParent = travel ? travel.toParent : shown ? shown.parentOf : target.parentOf;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    const moving = from && keys.some((key) => {
      const a = from.get(key);
      const b = target.pos.get(key);
      return Math.abs(a.x - b.x) > 0.01 || Math.abs(a.y - b.y) > 0.01;
    });
    travel = { from: from || target.pos, fromParent, to: target.pos, toParent: target.parentOf, t0: 0, now: 0 };
    shown = target;
    if (animate && moving && !reduced() && !document.hidden) {
      travel.t0 = performance.now();
      paint(0);
      frame = requestAnimationFrame(tick);
    } else {
      travel.fromParent = target.parentOf;
      paint(1);
      travel = null;
    }
  }

  /* ---------- Keyboard: arrows move between nodes ---------- */
  function neighbour(key, name) {
    const { node, parent } = locate(key);
    const rank = keys.indexOf(key);
    switch (name) {
      case 'ArrowLeft': return rank > 0 ? keys[rank - 1] : null;
      case 'ArrowRight': return rank < keys.length - 1 ? keys[rank + 1] : null;
      case 'ArrowUp': return parent ? parent.key : null;
      case 'ArrowDown': return node.left ? node.left.key : node.right ? node.right.key : null;
      case 'Home': return keys[0];
      case 'End': return keys[keys.length - 1];
      default: return undefined;
    }
  }

  /* ---------- Messages (modelled on the tutor's avl_validator wording) ---------- */
  function stateMessage() {
    const d = diagnose();
    if (!d) {
      return 'Balanced. Every node has a balance factor of ' + MINUS + '1, 0 or 1, and reading the keys in order still gives ' +
        inorder(root, []).join(', ') + '.';
    }
    const lean = d.childBf === 0 ? 'is level' : (d.childBf > 0) === (d.heavySide === 'left') ? 'also leans ' + d.heavySide : 'leans the other way';
    const plan = d.fix.length === 1
      ? (d.fix[0][0] === 'R' ? 'rotate right' : 'rotate left') + ' at ' + d.node.key + '.'
      : 'rotate ' + (d.fix[0][0] === 'R' ? 'right' : 'left') + ' at ' + d.child.key + ' first, then ' +
        (d.fix[1][0] === 'R' ? 'right' : 'left') + ' at ' + d.node.key + '.';
    return 'Node ' + d.node.key + ' has balance factor ' + (d.bf < 0 ? MINUS + Math.abs(d.bf) : d.bf) +
      ' (must be ' + MINUS + '1, 0 or 1). Its ' + d.heavySide + ' child ' + d.child.key + ' ' + lean +
      ' (balance factor ' + signed(d.childBf) + '), so this is the ' + d.kind + ' case: ' + plan;
  }

  function render(message, animate) {
    const target = layout();
    const d = diagnose();
    heavy = d ? subtreeKeys(d.child, []) : [];
    const selected = Number(selection.value);
    const description = [];
    (function walk(node) {
      if (!node) return;
      if (node.left) description.push(node.key + ' has left child ' + node.left.key);
      if (node.right) description.push(node.key + ' has right child ' + node.right.key);
      walk(node.left);
      walk(node.right);
    })(root);
    keys.forEach((key) => {
      const { node } = locate(key);
      const bf = balance(node);
      const glyph = glyphs.get(key);
      const isSelected = key === selected;
      glyph.group.classList.toggle('selected-node', isSelected);
      glyph.group.classList.toggle('is-violation', Math.abs(bf) > 1);
      glyph.group.classList.toggle('is-heavy', heavy.includes(key));
      glyph.group.setAttribute('aria-pressed', String(isSelected));
      glyph.group.setAttribute('tabindex', isSelected ? '0' : '-1');
      // Separate the adjacent SVG labels for voice input and screen readers.
      glyph.value.textContent = ' bf ' + signed(bf);
      glyph.group.setAttribute('aria-label', 'Select node ' + key + glyph.value.textContent);
      glyph.group.setAttribute('aria-description', 'Balance factor ' + signed(bf));
    });
    place(target, animate);
    stage.setAttribute('aria-label', 'Root ' + root.key + '. ' + description.join('. ') + '.');
    panel.querySelector('[data-tree-reading]').textContent =
      'Root ' + root.key + ' · Balance factor at node ' + selection.value + ' = ' +
      balance(locate(selected).node);
    undo.disabled = !moves.length;
    const { node } = locate(selected);
    rotateButtons.forEach((button) => {
      const promote = button.dataset.rotate === 'right' ? 'left' : 'right';
      button.toggleAttribute('data-unavailable', !node[promote]);
    });
    if (hint) {
      const parts = [];
      parts.push(node.left ? 'Rotate right at ' + selected + ' promotes ' + node.left.key + '.' : 'Node ' + selected + ' has no left child, so it cannot rotate right.');
      parts.push(node.right ? 'Rotate left at ' + selected + ' promotes ' + node.right.key + '.' : 'Node ' + selected + ' has no right child, so it cannot rotate left.');
      hint.textContent = parts.join(' ');
    }
    if (checks) {
      checks.replaceChildren(
        ...keys.map((key) => {
          const found = locate(key).node;
          const bf = balance(found);
          const row = document.createElement('tr');
          const ok = Math.abs(bf) <= 1;
          row.className = ok ? 'is-ok' : 'is-fail';
          const cells = [String(key), String(height(found)), signed(bf), ok ? 'Within range' : 'AVL-002 · out of range'];
          cells.forEach((value, i) => {
            const cell = document.createElement(i ? 'td' : 'th');
            if (!i) cell.scope = 'row';
            cell.textContent = value;
            row.append(cell);
          });
          return row;
        }),
      );
    }
    if (log) {
      log.replaceChildren(
        ...(notes.length ? notes : [{ text: 'No rotations yet. Insertion order ' + (sequence.value === 'lr' ? '30, 10, 20' : '30, 20, 10') + '.', empty: true }]).map((entry) => {
          const item = document.createElement('li');
          item.textContent = entry.text;
          if (entry.empty) item.className = 'is-empty';
          return item;
        }),
      );
    }
    status.textContent = message || stateMessage();
  }

  function rotate(direction) {
    const key = selection.value;
    const move = (direction === 'right' ? 'R' : 'L') + key;
    const entry = note(move, notes[notes.length - 1]);
    if (!applyMove(move)) {
      render('Node ' + key + ' has no ' + (direction === 'right' ? 'left' : 'right') + ' child to promote.');
      return;
    }
    moves.push(move);
    notes.push(entry);
    render(null, true);
    onChange();
  }
  // source: 'button' (the Undo button), 'node' (Ctrl/Cmd+Z on a node) or 'other'.
  function stepBack(source) {
    const previous = moves[moves.length - 1];
    if (!previous) return;
    selection.value = previous.slice(1);
    rebuild(moves.slice(0, -1));
    render('Previous structure restored. ' + stateMessage(), true);
    if (source === 'button' && undo.disabled) selection.focus();
    if (source === 'node') glyphs.get(Number(selection.value)).group.focus({ preventScroll: true });
    onChange();
  }

  sequence.addEventListener('change', () => {
    selection.value = '30';
    rebuild([]);
    render(null, true);
    onChange();
  });
  selection.addEventListener('change', () => {
    render();
    onChange();
  });
  rotateButtons.forEach((button) =>
    button.addEventListener('click', () => rotate(button.dataset.rotate)),
  );
  undo.addEventListener('click', () => stepBack('button'));
  panel.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === 'z') {
      if (event.target.closest('input, textarea, [contenteditable]')) return;
      if (!moves.length) return;
      event.preventDefault();
      stepBack(event.target.closest('[data-nodes]') ? 'node' : event.target === undo ? 'button' : 'other');
    }
  });
  panel.querySelector('[data-reset]').addEventListener('click', () => {
    selection.value = '30';
    rebuild([]);
    render(null, true);
    onChange();
  });
  return {
    restore(params) {
      sequence.value = params.get('order') === 'lr' ? 'lr' : 'll';
      selection.value = keys.includes(Number(params.get('node'))) ? params.get('node') : '30';
      rebuild((params.get('moves') || '').split('.').filter(Boolean));
      render();
    },
    params() {
      const params = new URLSearchParams();
      if (sequence.value === 'lr') params.set('order', 'lr');
      if (moves.length) params.set('moves', moves.join('.'));
      if (selection.value !== '30') params.set('node', selection.value);
      return params;
    },
  };
}

function averagingLab(panel, onChange) {
  const fields = [...panel.querySelectorAll('[data-client]')];
  const sliders = [...panel.querySelectorAll('[data-client-range]')];
  const values = [1, 3, 5];
  const names = 'ABC';
  const bars = panel.querySelectorAll('.weight-plot i');
  const number = new Intl.NumberFormat('en', { maximumFractionDigits: 3 });
  const fixed = new Intl.NumberFormat('en', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const error = panel.querySelector('[data-fed-error]');
  const contrib = panel.querySelector('[data-contrib]');
  const figure = panel.querySelector('[data-fed-svg]');
  const links = [...panel.querySelectorAll('[data-fed-link]')];
  const counts = [...panel.querySelectorAll('[data-fed-n]')];
  const marker = panel.querySelector('[data-fed-mean]');
  const meanLabel = panel.querySelector('[data-fed-mean-label]');
  const axis = { x0: 40, x1: 360, min: 0, max: 6 };
  let drawn = null; // { shares: [..], mean }
  let target = null;
  let frame = 0;
  let t0 = 0;
  let from = null;

  function reduced() {
    return !!(window.DC && DC.prefs && DC.prefs.reduce) ||
      matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function x(value) {
    return axis.x0 + ((value - axis.min) / (axis.max - axis.min)) * (axis.x1 - axis.x0);
  }
  // Whole percentages that always total 100 (largest remainder).
  function percentages(shares) {
    const floors = shares.map((s) => Math.floor(s * 100));
    let left = 100 - floors.reduce((a, b) => a + b, 0);
    shares
      .map((s, i) => ({ i, r: s * 100 - floors[i] }))
      .sort((a, b) => b.r - a.r)
      .forEach(({ i }) => {
        if (left > 0) {
          floors[i] += 1;
          left -= 1;
        }
      });
    return floors;
  }
  function approx() {
    const NS = 'http://www.w3.org/2000/svg';
    const wrap = document.createElement('span');
    wrap.className = 'approx';
    const icon = document.createElementNS(NS, 'svg');
    icon.setAttribute('viewBox', '0 0 16 16');
    icon.setAttribute('aria-hidden', 'true');
    icon.setAttribute('focusable', 'false');
    icon.setAttribute('class', 'icon approx__glyph');
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', 'M2.5 6.2c1.6-1.6 3.2-1.6 5.5 0s3.9 1.6 5.5 0M2.5 10.8c1.6-1.6 3.2-1.6 5.5 0s3.9 1.6 5.5 0');
    icon.append(path);
    const words = document.createElement('span');
    words.className = 'vh';
    words.textContent = 'approximately equals';
    wrap.append(' ', icon, words, ' ');
    return wrap;
  }

  /* SVG: line weight = share of all samples; the marker sits at the weighted average. */
  function paintFigure(state) {
    links.forEach((link, i) => {
      const share = state.shares[i];
      const zero = !state.valid || share <= 0.0005;
      link.setAttribute('x2', x(state.mean).toFixed(2));
      link.setAttribute('stroke-width', zero ? '1.25' : (1.25 + share * 15).toFixed(2));
      link.classList.toggle('is-zero', zero);
    });
    if (marker) {
      marker.setAttribute('transform', 'translate(' + x(state.mean).toFixed(2) + ' 0)');
      marker.classList.toggle('is-off', !state.valid);
    }
  }
  function step(now) {
    const t = Math.min(1, (now - t0) / 480);
    const p = 1 - Math.pow(2, -10 * t);
    const state = {
      valid: target.valid,
      mean: from.mean + (target.mean - from.mean) * p,
      shares: target.shares.map((s, i) => from.shares[i] + (s - from.shares[i]) * p),
    };
    paintFigure(state);
    drawn = state;
    frame = t < 1 ? requestAnimationFrame(step) : 0;
  }
  function animateTo(next, animate) {
    target = next;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (!figure) return;
    if (!animate || !drawn || reduced() || document.hidden || !next.valid || !drawn.valid) {
      paintFigure(next);
      drawn = next;
      return;
    }
    from = { mean: drawn.mean, shares: drawn.shares.slice(), valid: true };
    t0 = performance.now();
    frame = requestAnimationFrame(step);
  }

  function render(animate) {
    const raw = fields.map((input) => input.valueAsNumber);
    const valid = fields.map(
      (field, i) => Number.isInteger(raw[i]) && field.validity.valid && raw[i] >= 0,
    );
    fields.forEach((field, i) => {
      field.setAttribute('aria-invalid', String(!valid[i]));
      if (error) {
        if (!valid[i]) field.setAttribute('aria-describedby', error.id);
        else field.removeAttribute('aria-describedby');
      }
      const slider = sliders[i];
      if (slider && valid[i]) {
        slider.value = String(Math.min(raw[i], Number(slider.max)));
        slider.setAttribute('aria-valuetext', raw[i] + ' samples' + (raw[i] > Number(slider.max) ? ' (above the slider range)' : ''));
      }
    });
    const total = raw.reduce((a, b) => a + b, 0);
    const allValid = valid.every(Boolean);
    const canAverage = allValid && total > 0;
    const equation = panel.querySelector('[data-equation]');
    const output = panel.querySelector('[data-average]');
    const shares = raw.map((n) => (canAverage ? n / total : 0));
    let result = null;
    if (canAverage) {
      result = raw.reduce((sum, n, i) => sum + n * values[i], 0) / total;
      const exact = Math.abs(result * 1000 - Math.round(result * 1000)) < 1e-6;
      output.textContent = exact ? number.format(result) : fixed.format(result);
      // Text stays "(1 × 1 + 3 × 1 + 5 × 2) ÷ 4 = 3.5"; the tail "÷ N = result" never wraps apart.
      const tail = document.createElement('span');
      tail.className = 'formula__tail';
      tail.append('÷ ' + total);
      if (exact) tail.append(' = ');
      else tail.append(approx());
      const value = document.createElement('b');
      value.textContent = output.textContent;
      tail.append(value);
      equation.replaceChildren('(' + raw.map((count, i) => values[i] + ' × ' + count).join(' + ') + ') ', tail);
    } else {
      output.textContent = '—';
      equation.textContent = allValid
        ? 'Set at least one positive sample count to calculate a global parameter.'
        : 'Enter a whole sample count from 0 to 9,999 for each client.';
    }
    equation.classList.toggle('is-message', !canAverage);
    if (error) error.hidden = allValid;
    panel.classList.toggle('is-empty', allValid && total === 0);
    const pct = canAverage ? percentages(shares) : [0, 0, 0];
    let cumulative = 0;
    bars.forEach((bar, i) => {
      const fraction = shares[i];
      cumulative += fraction;
      bar.style.setProperty('--height', 4 + fraction * 104 + 'px');
      bar.style.setProperty('--share', fraction.toFixed(4));
      bar.style.setProperty('--cum', (canAverage ? cumulative : 0).toFixed(4));
      bar.parentElement.querySelector('small').textContent =
        names[i] + ' · ' + (canAverage ? pct[i] + '%' : '—');
    });
    counts.forEach((label, i) => {
      label.textContent = 'n=' + (valid[i] ? raw[i] : '?');
    });
    if (contrib) {
      const rows = contrib.querySelectorAll('tbody tr');
      rows.forEach((row, i) => {
        const cells = row.querySelectorAll('td');
        cells[0].textContent = valid[i] ? String(raw[i]) : '—';
        cells[1].textContent = canAverage ? raw[i] + '/' + total : '—';
        cells[2].textContent = String(values[i]);
        cells[3].textContent = canAverage ? number.format(shares[i] * values[i]) : '—';
      });
      const foot = contrib.querySelectorAll('tfoot td');
      if (foot.length) {
        foot[0].textContent = allValid ? String(total) : '—';
        foot[1].textContent = canAverage ? '1' : '—';
        foot[3].textContent = canAverage ? output.textContent : '—';
      }
    }
    if (marker && meanLabel) meanLabel.textContent = canAverage ? output.textContent : '';
    if (figure) {
      figure.setAttribute(
        'aria-label',
        canAverage
          ? 'Clients A, B and C hold parameters 1, 3 and 5 with ' + raw.join(', ') + ' samples, shares ' +
            pct.join('%, ') + '%. The server’s weighted average is ' + output.textContent + '.'
          : 'Clients A, B and C hold parameters 1, 3 and 5. No weighted average: ' + equation.textContent,
      );
    }
    animateTo({ valid: canAverage, mean: canAverage ? result : drawn ? drawn.mean : 3, shares }, animate);
  }
  fields.forEach((field) =>
    field.addEventListener('input', () => {
      render(true);
      onChange();
    }),
  );
  sliders.forEach((slider, i) =>
    slider.addEventListener('input', () => {
      fields[i].value = slider.value;
      render(true);
      onChange();
    }),
  );
  panel.querySelector('[data-equal]').addEventListener('click', () => {
    fields.forEach((f) => (f.value = '1'));
    render(true);
    onChange();
  });
  return {
    restore(params) {
      const counts = (params.get('counts') || '').split(',');
      const valid = counts.length === 3 && counts.every((s) => /^\d{1,4}$/.test(s));
      fields.forEach((field, i) => (field.value = valid ? String(Number(counts[i])) : '1'));
      render(false);
    },
    params() {
      const params = new URLSearchParams();
      if (fields.every((f) => f.value && f.validity.valid)) {
        const counts = fields.map((f) => f.valueAsNumber).join(',');
        if (counts !== '1,1,1') params.set('counts', counts);
      }
      return params;
    },
  };
}
