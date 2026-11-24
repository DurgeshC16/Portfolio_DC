/* =====================================================================
   js/home.js — owner: D (home paper sections)
   1. Dawn sheet fallback (§7.2): browsers without animation-timeline: view()
      play the same keyframes once with WAAPI when the sheet's top crosses
      85% of the viewport. Native browsers need no JS at all.
   2. Bento tilt (§10.8): perspective tilt <= 4° on fine pointers only,
      written to the tile's own [data-tile-card]; rAF-coalesced, no loop.
   3. Animated metadata: the rank-fusion scores ([data-count]) are computed
      up once when the worked example arrives. Static HTML holds the end values.
   Attaches by data-* only. The only global used is window.DC (core.js).
   ===================================================================== */
(function () {
  'use strict';
  var DC = window.DC;
  var doc = document;

  /* Keep a single native, responsive image for each printed brief. With scripting
     disabled, noscript renders it directly. Otherwise fetch it near the sheet. */
  var stack = doc.querySelector('.sheet__stack');
  if (stack) {
    function loadSheets() {
      stack.querySelectorAll('noscript[data-sheet-image]').forEach(function (source) {
        var template = doc.createElement('template');
        template.innerHTML = source.textContent;
        source.replaceWith(template.content);
      });
    }
    if ('IntersectionObserver' in window) {
      var sheetObserver = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        sheetObserver.disconnect();
        loadSheets();
      }, { rootMargin: '700px 0px' });
      sheetObserver.observe(stack);
    } else {
      loadSheets();
    }
    window.addEventListener('beforeprint', loadSheets, { once: true });
  }
  if (!DC || !doc.querySelector('[data-bento], [data-dawn]')) return;

  var EASE_OUT = 'cubic-bezier(.16, 1, .3, 1)';

  /* ---------- 1 · Dawn sheet fallback ---------- */
  (function dawn() {
    var sheet = doc.querySelector('[data-dawn]');
    if (!sheet) return;
    var native = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()'));
    if (native || DC.prefs.reduce || !('IntersectionObserver' in window) || typeof sheet.animate !== 'function') return;
    /* Already at or past the turn (reload mid-page, deep link): stay flat. */
    if (sheet.getBoundingClientRect().top < innerHeight * 0.85) return;

    var inner = sheet.querySelector('[data-dawn-inner]');
    var anims = [];
    sheet.classList.add('is-dawn-armed');

    var io = new IntersectionObserver(function (entries) {
      if (!entries[0] || !entries[0].isIntersecting) return;
      io.disconnect();
      play();
    }, { rootMargin: '0px 0px -15% 0px', threshold: 0 });
    io.observe(sheet);

    var unsubscribe = DC.prefs.subscribe(function (p) {
      if (!p.reduce) return;
      io.disconnect();
      anims.forEach(function (a) { a.cancel(); });
      sheet.classList.remove('is-dawn-armed');
      unsubscribe();
    });

    function play() {
      var from = getComputedStyle(sheet).clipPath;          /* resolved start shape (page-x in px) */
      var opts = { duration: 1200, easing: EASE_OUT, fill: 'both' };
      anims.push(sheet.animate([{ clipPath: from }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }], opts));
      if (inner) anims.push(inner.animate([{ transform: 'translateY(4vh)' }, { transform: 'translateY(0)' }], opts));
      sheet.classList.remove('is-dawn-armed');
      anims[0].finished.then(function () {
        anims.forEach(function (a) { a.cancel(); });          /* hand back to the flat CSS end state */
        anims = [];
        unsubscribe();
      }, function () {});
    }
  })();

  /* ---------- 2 · Bento tilt (fine pointer, motion allowed) ---------- */
  (function tilt() {
    var tiles = doc.querySelectorAll('[data-bento] [data-tile]');
    if (!tiles.length) return;
    var MAX_Y = 4, MAX_X = 3;                                 /* degrees; §10.8 caps tilt at 4° */
    var enabled = false;
    var scrolled = false;
    addEventListener('scroll', function () { scrolled = true; }, { passive: true });

    function bind(tile) {
      var card = tile.querySelector('[data-tile-card]');
      if (!card) return;
      var rect = null, x = 0, y = 0, raf = 0;
      function frame() {
        raf = 0;
        if (!enabled) return;
        if (!rect || scrolled) { rect = card.getBoundingClientRect(); scrolled = false; }
        var px = Math.max(-0.5, Math.min(0.5, (x - rect.left) / rect.width - 0.5));
        var py = Math.max(-0.5, Math.min(0.5, (y - rect.top) / rect.height - 0.5));
        card.style.transform = 'rotateX(' + (-py * 2 * MAX_X).toFixed(2) + 'deg) rotateY(' + (px * 2 * MAX_Y).toFixed(2) + 'deg)';
      }
      tile.addEventListener('pointerenter', function (e) {
        if (!enabled || e.pointerType === 'touch') return;
        rect = card.getBoundingClientRect();
      });
      tile.addEventListener('pointermove', function (e) {
        if (!enabled || e.pointerType === 'touch') return;
        x = e.clientX; y = e.clientY;
        if (!raf) raf = requestAnimationFrame(frame);
      });
      tile.addEventListener('pointerleave', function () {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        rect = null;
        card.style.transform = '';                             /* CSS transition releases it (--d-response) */
      });
    }
    for (var i = 0; i < tiles.length; i++) bind(tiles[i]);

    function sync(p) {
      enabled = p.fine && !p.reduce;
      if (!enabled) tiles.forEach(function (t) { var c = t.querySelector('[data-tile-card]'); if (c) c.style.transform = ''; });
    }
    sync(DC.prefs);
    DC.prefs.subscribe(sync);
  })();

  /* ---------- 3 · Animated metadata: rank-fusion scores ---------- */
  (function scores() {
    var nums = doc.querySelectorAll('[data-bento] [data-count]');
    if (!nums.length || !('IntersectionObserver' in window)) return;
    var host = nums[0].closest('[data-tile]') || nums[0].parentNode;
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0] || !entries[0].isIntersecting) return;
      io.disconnect();
      if (DC.prefs.reduce) return;                             /* end values are already in the HTML */
      run();
    }, { threshold: 0.35 });
    io.observe(host);

    function run() {
      var targets = Array.prototype.map.call(nums, function (el) { return parseFloat(el.getAttribute('data-count')) || 0; });
      var DELAY = 450, DUR = 1100, t0 = 0;
      function write(k) {
        for (var i = 0; i < nums.length; i++) nums[i].textContent = (targets[i] * k).toFixed(5);
      }
      write(0);
      function step(now) {
        if (!t0) t0 = now;
        var t = (now - t0 - DELAY) / DUR;
        if (t >= 1 || DC.prefs.reduce) { write(1); return; }   /* done: the loop stops itself */
        write(t <= 0 ? 0 : 1 - Math.pow(1 - t, 4));
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  })();
})();
