/* js/hero-truss.js — owner: B. Home hero: Fig. 1 "DC. as a graph" (design-system §11)
   plus the hero's small behaviours (smooth in-page jump, dimension label, replay).
   - Geometry is built from construction rules (51 nodes, 97 edges), never sampled from a font.
   - Seeded scatter (Park–Miller, seed 7) assembles once; edges emerge past 60 % progress.
   - Fine pointer only: nodes spring away, nearby edges light, nearest node is probed.
   - The rAF loop self-sleeps (400 ms of rest), and stops offscreen / in hidden tabs.
   - Reduced motion: final state drawn once, no loop, no pointer listeners.
   Public: DC.hero.replay() -> boolean (used by the command palette). */
(function () {
  'use strict';
  var DC = window.DC;
  var hero = document.querySelector('[data-hero]');
  if (!DC || !hero) return;
  var fig = hero.querySelector('[data-fig1]');
  var canvas = hero.querySelector('[data-fig1-canvas]');
  var readout = hero.querySelector('[data-fig1-readout]');
  var nameEl = hero.querySelector('[data-hero-name]');
  var ctx = canvas && canvas.getContext && canvas.getContext('2d');

  /* ---------- Geometry (design units, box 212 x 100) ---------- */
  var nodes = [], edges = [];
  function add(x, y, kind) { nodes.push({ x: x, y: y, kind: kind || 'n' }); return nodes.length - 1; }
  function rad(d) { return d * Math.PI / 180; }
  function contourD(off) {
    var pts = [], top = off, bot = 100 - off, k, a, r = 50 - off;
    for (k = 0; k < 5; k++) pts.push([off, bot - (bot - top) * k / 4]);   /* stem, bottom -> top */
    pts.push([(off + 30) / 2, top]);                                      /* top bar */
    for (a = -90; a <= 90; a += 30) pts.push([30 + r * Math.cos(rad(a)), 50 + r * Math.sin(rad(a))]); /* bowl */
    pts.push([(off + 30) / 2, bot]);                                      /* bottom bar */
    return pts;
  }
  function contourC(r) {
    var pts = [];
    for (var k = 0; k <= 10; k++) { var a = 320 - k * 28; pts.push([142 + r * Math.cos(rad(a)), 50 + r * Math.sin(rad(a))]); }
    return pts;
  }
  function truss(outer, inner, closed) {
    var o = outer.map(function (p) { return add(p[0], p[1]); });
    var i = inner.map(function (p) { return add(p[0], p[1]); });
    var n = o.length;
    for (var k = 0; k < n; k++) {
      if (k + 1 < n || closed) edges.push([o[k], o[(k + 1) % n]], [i[k], i[(k + 1) % n]], [o[k], i[(k + 1) % n]]);
      edges.push([o[k], i[k]]);
    }
  }
  truss(contourD(0), contourD(14), true);
  truss(contourC(50), contourC(36), false);
  var STOP = add(206, 94, 'dot');                 /* the full stop: no edges */
  var N = nodes.length, E = edges.length;         /* 51, 97 (asserted in _research/scripts/B-hero) */
  var degree = new Array(N).fill(0);
  edges.forEach(function (e) { degree[e[0]]++; degree[e[1]]++; });

  /* Seeded scatter inside the figure box +-15 %, delays ordered along the strokes */
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  nodes.forEach(function (n, k) {
    n.sx = -31.8 + rnd() * 275.6;
    n.sy = -15 + rnd() * 130;
    n.delay = k * 22 + rnd() * 220;
    n.dx = n.dy = n.vx = n.vy = 0;               /* pointer displacement + velocity (css px) */
  });

  var BASE = N + ' nodes · ' + E + ' edges';
  var ASSEMBLE = 1500, REST = 400;

  /* ---------- Canvas fallback: no 2D context -> the static SVG poster ---------- */
  if (!ctx) { if (fig) fig.classList.add('fig1--poster'); }

  /* ---------- Colours from tokens (fallbacks = §3.1 primitives) ---------- */
  function rgb(name, fb) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
    var m = /^#([0-9a-f]{6})$/i.exec(v);
    if (!m) m = /^#([0-9a-f]{6})$/i.exec(fb);
    var x = parseInt(m[1], 16);
    return [(x >> 16) & 255, (x >> 8) & 255, x & 255].join(',');
  }
  /* Read lazily inside the first ResizeObserver callback (style is clean there), never during
     script evaluation: a forced style/layout pass at init would land in this task (MF-32). */
  var FOG = '236,235,229', PERI = '183,186,255', PLO = '142,147,240', PERI_HEX = 'rgb(' + PERI + ')', toned = false;
  function tone() {
    toned = true;
    FOG = rgb('--c-fog', '#ecebe5'); PERI = rgb('--c-periwinkle', '#b7baff'); PLO = rgb('--c-periwinkle-lo', '#8e93f0');
    PERI_HEX = 'rgb(' + PERI + ')';
  }

  /* ---------- State ---------- */
  var sized = false, W = 1, H = 1, dpr = 1, scale = 1, ox = 0, oy = 0, R = 56;
  var rect = null, rectDirty = true;
  var t0 = -1;                                   /* assembly clock; -1 = start on next frame */
  var assembled = false, visible = false, running = false, raf = 0, last = 0, acc = 0, lastActive = 0;
  var pointer = { x: -1e4, y: -1e4, on: false };
  var hot = -1, pending = '', written = '', lastWrite = 0;
  var pos = new Float32Array(N * 2), prog = new Float32Array(N);
  var LEVELS = 8, buckets = [];
  for (var b = 0; b <= LEVELS; b++) buckets.push([]);
  var lit = [[], [], [], []];

  function reduce() { return !!DC.prefs.reduce; }
  function probing() { return DC.prefs.fine && !DC.prefs.reduce; }
  function ease(t) { return t >= 1 ? 1 : t <= 0 ? 0 : 1 - Math.pow(2, -10 * t); }

  function say(text, now) {
    pending = text;
    if (!readout || pending === written) return;
    if (now !== undefined && now - lastWrite < 100) return;       /* <= 10 Hz while live */
    readout.textContent = written = pending;
    lastWrite = now || performance.now();
  }

  /* ---------- Layout ---------- */
  function resize(entries) {
    if (!ctx) return;
    if (!toned) tone();
    var r = entries && entries[0] && entries[0].contentRect || canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    sized = true;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    scale = Math.min(W * 0.84 / 212, H * 0.76 / 100);
    ox = (W - 212 * scale) / 2; oy = (H - 100 * scale) / 2;
    R = Math.max(56, 0.17 * W);
    rectDirty = true;
    if (!running) draw(performance.now(), 0);
  }

  /* ---------- Simulation + draw ---------- */
  function step(now, steps) {
    var el = reduce() || t0 < 0 && assembled ? 1e9 : t0 < 0 ? 0 : now - t0;
    var done = true, residual = 0, k, n, p, x, y;
    for (k = 0; k < N; k++) {
      n = nodes[k];
      p = ease((el - n.delay) / ASSEMBLE);
      if (p < 0.999) done = false; else p = 1;
      prog[k] = p;
      x = ox + (n.sx + (n.x - n.sx) * p) * scale;
      y = oy + (n.sy + (n.y - n.sy) * p) * scale;
      var tx = 0, ty = 0;
      if (pointer.on) {
        var ddx = x - pointer.x, ddy = y - pointer.y, d = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d < R && d > 0.01) { var f = (1 - d / R) * (1 - d / R) * 22; tx = ddx / d * f; ty = ddy / d * f; }
      }
      for (var s = 0; s < steps; s++) {             /* fixed 60 Hz spring steps (dt-normalised) */
        n.vx = (n.vx + (tx - n.dx) * 0.16) * 0.72;
        n.vy = (n.vy + (ty - n.dy) * 0.16) * 0.72;
        n.dx += n.vx; n.dy += n.vy;
      }
      residual = Math.max(residual, Math.abs(tx - n.dx), Math.abs(ty - n.dy), Math.abs(n.vx), Math.abs(n.vy));
      pos[k * 2] = x + n.dx; pos[k * 2 + 1] = y + n.dy;
    }
    assembled = done;
    return residual;
  }

  function draw(now, steps) {
    if (!ctx || !sized) return assembled ? 0 : 1;
    var residual = step(now, steps);
    var k, e, a, bb, q, list, near, ax, ay, bx, by;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;

    /* sort edges into alpha buckets (neutral) and proximity buckets (lit) */
    for (q = 0; q <= LEVELS; q++) buckets[q].length = 0;
    for (q = 0; q < 4; q++) lit[q].length = 0;
    for (e = 0; e < E; e++) {
      a = edges[e][0]; bb = edges[e][1];
      var p = Math.min(prog[a], prog[bb]);
      if (p < 0.6) continue;
      var alpha = Math.pow((p - 0.6) / 0.4, 2);
      near = 0;
      if (pointer.on) {
        var mx = (pos[a * 2] + pos[bb * 2]) / 2 - pointer.x, my = (pos[a * 2 + 1] + pos[bb * 2 + 1]) / 2 - pointer.y;
        near = Math.max(0, 1 - Math.sqrt(mx * mx + my * my) / (R * 1.1));
      }
      if (near > 0 && alpha > 0.5) lit[Math.min(3, Math.floor(near * 4))].push(e);
      else buckets[Math.round(alpha * LEVELS)].push(e);
    }
    function strokeList(list2) {
      ctx.beginPath();
      for (var i = 0; i < list2.length; i++) {
        var ed = edges[list2[i]];
        ax = pos[ed[0] * 2]; ay = pos[ed[0] * 2 + 1]; bx = pos[ed[1] * 2]; by = pos[ed[1] * 2 + 1];
        ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
      }
      ctx.stroke();
    }
    for (q = 1; q <= LEVELS; q++) {
      if (!buckets[q].length) continue;
      ctx.strokeStyle = 'rgba(' + FOG + ',' + (0.28 * q / LEVELS).toFixed(3) + ')';
      strokeList(buckets[q]);
    }
    for (q = 0; q < 4; q++) {
      if (!lit[q].length) continue;
      ctx.strokeStyle = 'rgba(' + (q < 2 ? PLO : PERI) + ',' + (0.45 + q * 0.18).toFixed(2) + ')';
      strokeList(lit[q]);
    }

    /* nodes (bucketed by alpha), then the full stop */
    var nr = Math.max(1.6, scale), best = -1, bestD = 30;
    for (q = 0; q <= LEVELS; q++) buckets[q].length = 0;
    for (k = 0; k < N; k++) {
      if (k === STOP) continue;
      buckets[Math.round(prog[k] * LEVELS)].push(k);
      if (pointer.on && prog[k] === 1) {           /* probe by rest position: the push never outruns it */
        var dx = ox + nodes[k].x * scale - pointer.x, dy = oy + nodes[k].y * scale - pointer.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < bestD) { bestD = d; best = k; }
      }
    }
    for (q = 0; q <= LEVELS; q++) {
      list = buckets[q];
      if (!list.length) continue;
      ctx.fillStyle = 'rgba(' + FOG + ',' + (0.35 + 0.55 * q / LEVELS).toFixed(3) + ')';
      ctx.beginPath();
      for (var j = 0; j < list.length; j++) {
        k = list[j];
        ctx.moveTo(pos[k * 2] + nr, pos[k * 2 + 1]);
        ctx.arc(pos[k * 2], pos[k * 2 + 1], nr, 0, Math.PI * 2);
      }
      ctx.fill();
    }
    ctx.fillStyle = PERI_HEX;
    ctx.beginPath();
    ctx.arc(pos[STOP * 2], pos[STOP * 2 + 1], Math.max(4, scale * 4.2), 0, Math.PI * 2);
    ctx.fill();
    if (best >= 0) {
      ctx.strokeStyle = PERI_HEX; ctx.lineWidth = 1.25;
      ctx.beginPath(); ctx.arc(pos[best * 2], pos[best * 2 + 1], 7, 0, Math.PI * 2); ctx.stroke();
    }

    /* readout */
    if (reduce()) say(BASE + ' · static');
    else if (best >= 0) {
      hot = best;
      say('n.' + (best < 10 ? '0' : '') + best + ' · degree ' + degree[best] +
        ' · x ' + fmt(nodes[best].x / 212) + ' y ' + fmt(nodes[best].y / 100), now);
    } else {
      hot = -1;
      say(BASE + (assembled ? (pointer.on ? ' · probe' : ' · settled') : ' · assembling'), now);
    }
    return residual;
  }
  function fmt(v) { v = Math.max(0, Math.min(0.99, v)); return '.' + String(Math.round(v * 100)).padStart(2, '0'); }

  /* ---------- Loop control (§11.6) ---------- */
  function frame(now) {
    raf = 0;
    if (t0 < 0 && !assembled) t0 = now;
    var dt = last ? Math.min(100, now - last) : 16.667;
    last = now;
    acc += dt;
    var steps = Math.min(6, Math.floor(acc / 16.667));
    acc -= steps * 16.667;
    var residual = draw(now, steps);
    if (!assembled || residual > 0.05) lastActive = now;
    if (now - lastActive > REST) { sleep(); return; }
    raf = requestAnimationFrame(frame);
  }
  function wake() {
    if (running || !ctx || reduce() || !visible || document.hidden) return;
    running = true; last = 0; acc = 0; lastActive = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function sleep() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0; running = false;
    if (readout && hot < 0 && assembled && !reduce()) { readout.textContent = written = BASE + ' · at rest'; }
    else if (readout && pending !== written) readout.textContent = written = pending;
  }

  /* ---------- Pointer (fine pointer, motion allowed) ---------- */
  function localise(e) {
    if (rectDirty || !rect) { rect = canvas.getBoundingClientRect(); rectDirty = false; }
    pointer.x = e.clientX - rect.left; pointer.y = e.clientY - rect.top;
  }
  function onMove(e) {
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    localise(e); pointer.on = true; lastActive = performance.now(); wake();
  }
  function onLeave() { pointer.on = false; pointer.x = pointer.y = -1e4; lastActive = performance.now(); wake(); }
  var listening = false;
  function syncPointer() {
    var want = !!ctx && probing();
    if (want === listening) return;
    listening = want;
    var m = want ? 'addEventListener' : 'removeEventListener';
    canvas[m]('pointermove', onMove, { passive: true });
    canvas[m]('pointerenter', onMove, { passive: true });
    canvas[m]('pointerleave', onLeave, { passive: true });
    if (!want) onLeave();
  }
  addEventListener('scroll', function () { rectDirty = true; }, { passive: true });

  /* ---------- Name: dimension label (hover only, CSS) ---------- */
  var dim = hero.querySelector('[data-hero-dim]');
  function measureDim() {
    var v = Math.round(dim.getBoundingClientRect().width) + ' px';
    if (dim.getAttribute('data-dim') !== v) dim.setAttribute('data-dim', v);
  }

  /* ---------- In-page jump: smooth when motion is allowed (§6.4 rule 8) ---------- */
  var restoreT = 0;
  hero.querySelectorAll('[data-hero-jump]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || reduce()) return;
      /* Let the browser do the navigation (hash, focus start point); only its scroll is smoothed. */
      var root = document.documentElement;
      root.style.scrollBehavior = 'smooth';
      clearTimeout(restoreT);
      var restore = function () { root.style.scrollBehavior = ''; removeEventListener('scrollend', restore); };
      addEventListener('scrollend', restore);
      restoreT = setTimeout(restore, 1600);
    });
  });

  /* ---------- Replay (command palette) ---------- */
  function replayName() {
    if (!nameEl) return;
    nameEl.classList.add('is-replay', 'is-reset');
    void nameEl.offsetWidth;                         /* restart the CSS letter animation */
    nameEl.classList.remove('is-reset');
  }
  DC.hero = {
    el: hero,
    nodes: N,
    edges: E,
    /* Re-run the first-paint choreography (name lift + truss assembly). Returns false when
       motion is reduced (nothing to replay). Scrolls the hero into view if it is offscreen. */
    replay: function () {
      if (reduce()) return false;
      var r = hero.getBoundingClientRect();
      if (r.bottom < 80 || r.top > innerHeight * 0.5) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
      nodes.forEach(function (n) { n.dx = n.dy = n.vx = n.vy = 0; });
      assembled = false; t0 = -1; hot = -1;
      replayName();
      if (running) { lastActive = performance.now(); } else { draw(performance.now(), 0); wake(); }
      return true;
    }
  };

  /* ---------- Wiring ---------- */
  if (ctx) {
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    else { addEventListener('resize', function () { resize(); }, { passive: true }); setTimeout(resize, 0); }
    DC.watchVisibility(canvas, function (vis) {
      visible = vis;
      if (vis) { if (!assembled || pointer.on) wake(); } else if (running) sleep();
    });
  }
  if (dim && nameEl) nameEl.addEventListener('pointerenter', function () { measureDim(); }); /* label is hover-only */
  DC.prefs.subscribe(function () {
    syncPointer();
    if (reduce()) { if (running) sleep(); assembled = true; draw(performance.now(), 0); }
  });
  syncPointer();
  /* The first draw happens in the first resize callback; the assembly clock starts on the first
     visible frame (watchVisibility), so a figure below the fold still assembles when reached. */
  if (ctx && reduce()) assembled = true;
})();
