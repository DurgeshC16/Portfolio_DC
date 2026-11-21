'use strict';

// Each lab exposes its URL parameters so a case study can reopen the same example.
function evidenceLab(panel, onChange) {
  const { records, captured } = kaaranEvidence;
  const body = panel.querySelector('[data-evidence-body]');
  const details = panel.querySelector('.records');
  const choice = panel.querySelector('select');
  const languageButtons = panel.querySelectorAll('[data-language]');
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
  let language = 'en';
  function render(recordId) {
    const record = records.find((item) => item.id === recordId) || records[0];
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
    source.textContent = strings.source;
    panel.querySelector('[data-snapshot]').textContent = strings.snapshot + ' · ' + captured;
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
  details.addEventListener('toggle', onChange);
  return {
    restore(params) {
      language = params.get('lang') === 'mr' ? 'mr' : 'en';
      const id = params.get('cluster');
      render(id);
      details.open = records.some((record) => record.id === id);
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
  const sequence = panel.querySelector('[data-sequence]');
  const selection = panel.querySelector('[data-node]');
  const status = panel.querySelector('[data-tree-status]');
  const undo = panel.querySelector('[data-undo]');
  const edges = panel.querySelector('[data-edges]');
  const nodes = panel.querySelector('[data-nodes]');
  const keys = [10, 20, 30];
  let root;
  let moves = [];

  function svg(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  }
  const glyphs = new Map(
    keys.map((key) => {
      const group = svg('g');
      const circle = svg('circle');
      circle.setAttribute('r', '15');
      const label = svg('text');
      label.textContent = String(key);
      group.append(circle, label);
      group.setAttribute('role', 'button');
      group.setAttribute('tabindex', '0');
      function chooseNode() {
        selection.value = String(key);
        render();
        onChange();
      }
      group.addEventListener('click', chooseNode);
      group.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          chooseNode();
        }
      });
      nodes.append(group);
      return [key, group];
    }),
  );
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
  function isBalanced(node) {
    return !node || (Math.abs(balance(node)) <= 1 && isBalanced(node.left) && isBalanced(node.right));
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
  function rebuild(history) {
    const order = sequence.value === 'lr' ? [30, 10, 20] : [30, 20, 10];
    root = order.reduce(insert, null);
    moves = [];
    for (const move of history) {
      if (!/^[LR](10|20|30)$/.test(move) || !applyMove(move)) break;
      moves.push(move);
    }
  }
  function render(message) {
    edges.replaceChildren();
    const description = [];
    function draw(node, depth, parentPoint) {
      if (!node) return;
      const x = 67 + keys.indexOf(node.key) * 103;
      const y = 22 + depth * 49;
      if (parentPoint) {
        const edge = svg('line');
        for (const [attr, value] of Object.entries({
          x1: parentPoint.x,
          y1: parentPoint.y,
          x2: x,
          y2: y,
        })) {
          edge.setAttribute(attr, value);
        }
        edges.append(edge);
      }
      const glyph = glyphs.get(node.key);
      glyph.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      const isSelected = node.key === Number(selection.value);
      glyph.classList.toggle('selected-node', isSelected);
      glyph.setAttribute('aria-pressed', String(isSelected));
      glyph.setAttribute('aria-label', 'Select node ' + node.key + ', balance factor ' + balance(node));
      if (node.left) description.push(node.key + ' has left child ' + node.left.key);
      if (node.right) description.push(node.key + ' has right child ' + node.right.key);
      draw(node.left, depth + 1, { x, y });
      draw(node.right, depth + 1, { x, y });
    }
    draw(root, 0, null);
    panel
      .querySelector('.tree-stage svg')
      .setAttribute('aria-label', 'Root ' + root.key + '. ' + description.join('. ') + '.');
    panel.querySelector('[data-tree-reading]').textContent =
      'Root ' +
      root.key +
      ' · Balance factor at node ' +
      selection.value +
      ' = ' +
      balance(locate(Number(selection.value)).node);
    undo.disabled = !moves.length;
    status.textContent =
      message ||
      (isBalanced(root)
        ? 'Balanced. Reading the keys in order gives 10, 20, 30.'
        : 'Inspect the heavier subtree before choosing a rotation.');
  }
  sequence.addEventListener('change', () => {
    selection.value = '30';
    rebuild([]);
    render();
    onChange();
  });
  selection.addEventListener('change', () => {
    render();
    onChange();
  });
  panel.querySelectorAll('[data-rotate]').forEach((button) =>
    button.addEventListener('click', () => {
      const direction = button.dataset.rotate;
      const key = selection.value;
      const move = (direction === 'right' ? 'R' : 'L') + key;
      if (!applyMove(move)) {
        render(
          'Node ' + key + ' has no ' + (direction === 'right' ? 'left' : 'right') + ' child to promote.',
        );
        return;
      }
      moves.push(move);
      render(
        isBalanced(root)
          ? 'Balanced. Node ' + root.key + ' is the root and both subtrees have equal height.'
          : 'Rotation applied. The root is still unbalanced. Inspect its balance factor and choose the next node.',
      );
      onChange();
    }),
  );
  undo.addEventListener('click', () => {
    const previous = moves[moves.length - 1];
    if (!previous) return;
    selection.value = previous.slice(1);
    rebuild(moves.slice(0, -1));
    render('Previous structure restored.');
    if (undo.disabled) selection.focus();
    onChange();
  });
  panel.querySelector('[data-reset]').addEventListener('click', () => {
    selection.value = '30';
    rebuild([]);
    render();
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
  const values = [1, 3, 5];
  const bars = panel.querySelectorAll('.weight-plot i');
  const number = new Intl.NumberFormat('en', { maximumFractionDigits: 3 });
  function render() {
    const counts = fields.map((input) => input.valueAsNumber);
    const valid = fields.map(
      (field, i) => Number.isInteger(counts[i]) && field.validity.valid && counts[i] >= 0,
    );
    fields.forEach((field, i) => field.setAttribute('aria-invalid', String(!valid[i])));
    const total = counts.reduce((a, b) => a + b, 0);
    const canAverage = valid.every(Boolean) && total > 0;
    const equation = panel.querySelector('[data-equation]');
    const output = panel.querySelector('[data-average]');
    if (canAverage) {
      const result = counts.reduce((sum, n, i) => sum + n * values[i], 0) / total;
      output.textContent = number.format(result);
      equation.textContent =
        '(' +
        counts.map((count, i) => values[i] + ' × ' + count).join(' + ') +
        ') ÷ ' +
        total +
        (Number.isInteger(result * 1000) ? ' = ' : ' ≈ ') +
        output.textContent;
    } else {
      output.textContent = '—';
      equation.textContent = valid.every(Boolean)
        ? 'Set at least one positive sample count to calculate a global parameter.'
        : 'Enter a whole sample count from 0 to 9,999 for each client.';
    }
    bars.forEach((bar, i) => {
      const fraction = canAverage ? counts[i] / total : 0;
      bar.style.setProperty('--height', 4 + fraction * 104 + 'px');
      bar.parentElement.querySelector('small').textContent =
        'ABC'[i] + ' · ' + (canAverage ? Math.round(fraction * 100) + '%' : '—');
    });
  }
  fields.forEach((field) =>
    field.addEventListener('input', () => {
      render();
      onChange();
    }),
  );
  panel.querySelector('[data-equal]').addEventListener('click', () => {
    fields.forEach((f) => (f.value = '1'));
    render();
    onChange();
  });
  return {
    restore(params) {
      const counts = (params.get('counts') || '').split(',');
      const valid = counts.length === 3 && counts.every((s) => /^\d{1,4}$/.test(s));
      fields.forEach((field, i) => (field.value = valid ? counts[i] : '1'));
      render();
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
