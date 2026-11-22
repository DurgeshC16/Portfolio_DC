'use strict';

const byId = (id) => document.getElementById(id);
const numberFormat = new Intl.NumberFormat('en-US');
const controls = {
  trees: [byId('order'), byId('size'), byId('metric')],
  retrieval: [byId('scenario'), byId('channel')],
  insertion: [byId('step')],
};

function saveSelection(section) {
  const params = new URLSearchParams();
  for (const field of controls[section]) params.set(field.id, field.value);
  history.replaceState(null, '', '#' + section + '?' + params.toString());
}

const orders = { ascending: 'Sorted', descending: 'Reverse Sorted', random: 'Random' };
function drawMeasurements() {
  const [order, size, metric] = controls.trees.map((field) => field.value);
  const timing = metric === 'time';
  const runs = treeBenchmarks.records.filter(
    (run) => run.workload === orders[order] && run.size === Number(size),
  );
  // The axis for each metric stays fixed across workloads and sizes.
  const minPower = timing ? -2 : 0;
  const maxPower = timing ? 1 : 4;
  document.querySelectorAll('.plot-row').forEach((row, index) => {
    const value = timing ? runs[index].batchMs : runs[index].height;
    const fraction = (Math.log10(value) - minPower) / (maxPower - minPower);
    row.querySelector('i').style.setProperty('--position', fraction * 100 + '%');
    row.querySelector('strong').textContent = timing ? value.toFixed(4) : numberFormat.format(value);
  });
  const axis = document.querySelector('.plot-axis');
  const ticks = timing ? ['0.01', '0.1', '1', '10'] : ['1', '10', '100', '1k', '10k'];
  axis.replaceChildren(
    ...ticks.map((tick) => {
      const span = document.createElement('span');
      span.textContent = tick;
      return span;
    }),
  );
  document.querySelector('.plot').style.setProperty('--interval', 100 / (ticks.length - 1) + '%');
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
}

const titles = { A: 'Two days', B: 'Commute', C: 'Quick charge' };
const rankings = {
  overlap: { keyword: ['A', 'B'], semantic: ['C', 'B'] },
  agreement: { keyword: ['A', 'B'], semantic: ['A', 'C'] },
  split: { keyword: ['A', 'B'], semantic: ['B', 'A'] },
};

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
}

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
const canvas = byId('insertion-canvas');
function drawInsertion() {
  const step = Number(byId('step').value);
  const parents = parentsAfterInsertion[step - 1];
  const root = parents.indexOf(0) + 1;
  const depth = (key) => (parents[key - 1] ? 1 + depth(parents[key - 1]) : 0);
  const levels = 1 + Math.max(...parents.map((_, index) => depth(index + 1)));
  const caption = 'Root ' + root + ' · ' + levels + (levels === 1 ? ' level' : ' levels');
  byId('step-count').textContent = step + ' / 7';
  const pivot = [0, 0, 1, 0, 3, 2, 5][step - 1];
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
  byId('step').setAttribute('aria-valuetext', step + ' keys inserted. ' + caption);
  const { width, height } = canvas.getBoundingClientRect();
  if (!width || !height) return;
  const ratio = devicePixelRatio || 1;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  const spacing = Math.min((width - 56) / 6, 53);
  const points = parents.map((parent, index) => ({
    x: width / 2 + (index - (step - 1) / 2) * spacing,
    y: height / 2 + (depth(index + 1) - (levels - 1) / 2) * Math.min(56, (height - 46) / 3),
  }));
  ctx.strokeStyle = '#9d9ace';
  ctx.lineWidth = 2;
  parents.forEach((parent, index) => {
    if (!parent) return;
    ctx.beginPath();
    ctx.moveTo(points[parent - 1].x, points[parent - 1].y);
    ctx.lineTo(points[index].x, points[index].y);
    ctx.stroke();
  });
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 15px system-ui';
  points.forEach(({ x, y }, index) => {
    const newest = index + 1 === step;
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fillStyle = newest ? '#e0f3ab' : '#292b41';
    ctx.fill();
    ctx.strokeStyle = newest ? '#e0f3ab' : '#acaaf0';
    ctx.stroke();
    ctx.fillStyle = newest ? '#1c251c' : '#f2efff';
    ctx.fillText(String(index + 1), x, y);
  });
}

const render = { trees: drawMeasurements, retrieval: drawRanking, insertion: drawInsertion };
function restoreSelection() {
  const [section, query] = location.hash.slice(1).split('?');
  if (!query || !Object.hasOwn(controls, section)) return;
  const params = new URLSearchParams(query);
  for (const field of controls[section]) {
    const value = params.get(field.id);
    const valid =
      field.type === 'range'
        ? /^[1-7]$/.test(value)
        : [...field.options].some((option) => option.value === value);
    if (valid) field.value = value;
    else if (field.type === 'range') field.value = field.defaultValue;
    else
      field.value =
        [...field.options].find((option) => option.defaultSelected)?.value || field.options[0].value;
  }
  render[section]();
  byId(section).scrollIntoView({ behavior: 'instant' });
}

document
  .querySelectorAll('[data-js-only], .insertion-drawing')
  .forEach((element) => (element.hidden = false));
for (const [section, inputs] of Object.entries(controls)) {
  render[section]();
  for (const input of inputs) {
    input.addEventListener(input.type === 'range' ? 'input' : 'change', () => {
      render[section]();
      saveSelection(section);
    });
  }
}
new ResizeObserver(drawInsertion).observe(canvas.parentElement);
restoreSelection();
window.addEventListener('hashchange', restoreSelection);
document.documentElement.classList.add('enhanced');
