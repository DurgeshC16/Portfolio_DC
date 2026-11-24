/* =====================================================================
   DC. — gallery.js  (owner C · design-system §12 "Five plates")
   Desktop (>= 760): a clamped CSS-3D arc. One integer `index` is the
   only source of truth; plates are placed by layout(pos) from it (pos is
   fractional only while dragging). CSS transitions do the travel, so
   every move is interruptible and retargets from its current value.
   Mobile (< 760): the same DOM is a native scroll-snap strip; an
   IntersectionObserver follows native swipes; scrollend reconciles
   interrupted moves with the final snap position.
   Classic defer script in an IIFE. Attaches by id / data-* only.
   Public (on window.DC, the only global): DC.gallery
     .index, .key, .keys, .go(i[, {instant}]), .indexOf(key),
     .restore() — re-applies the persisted index instantly (pagereveal)
   Event: 'dc:gallerychange' on #gallery, detail {index, key}.
   ===================================================================== */
(function () {
  'use strict';
  var doc = document;
  var root = doc.getElementById('gallery');
  var ring = doc.getElementById('ring');
  if (!root || !ring) return;
  var DC = window.DC = window.DC || {};
  if (DC.gallery) return;

  var stage = root.querySelector('[data-gallery-stage]');
  var slides = Array.prototype.slice.call(ring.querySelectorAll('.slide'));
  var N = slides.length;
  if (!N || !stage) return;

  var plates = slides.map(function (s) { return s.querySelector('.plate'); });
  var keys = slides.map(function (s) { return s.getAttribute('data-key'); });
  var names = slides.map(function (s) { return s.getAttribute('data-name') || ''; });
  var prevBtn = doc.getElementById('prev');
  var nextBtn = doc.getElementById('next');
  var stops = Array.prototype.slice.call(root.querySelectorAll('[data-gallery-stop]'));
  var marker = root.querySelector('[data-gallery-marker]');
  var roll = root.querySelector('[data-gallery-roll]');
  var live = doc.getElementById('gallery-live');
  var statusNow = root.querySelector('[data-gallery-now]');
  var statusName = root.querySelector('[data-gallery-name]');
  var statusBar = root.querySelector('[data-gallery-bar]');
  var deck = doc.getElementById('deck');
  var dk = deck ? {
    kicker: deck.querySelector('[data-deck="kicker"]'),
    title: doc.getElementById('deck-title'),
    summary: deck.querySelector('[data-deck="summary"]'),
    facts: deck.querySelector('[data-deck="facts"]'),
    link: doc.getElementById('deck-link'),
    name: deck.querySelector('[data-deck="name"]')
  } : null;

  var EOUT = 'cubic-bezier(.16, 1, .3, 1)';
  var EINOUT = 'cubic-bezier(.76, 0, .24, 1)';
  var mqDesk = matchMedia('(min-width: 760px)');
  var mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = matchMedia('(hover: hover) and (pointer: fine)');
  function reduce() { return DC.prefs ? !!DC.prefs.reduce : mqReduce.matches; }
  function fine() { return DC.prefs ? !!DC.prefs.fine : mqFine.matches; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  var index = 0;
  var mode = null;          /* '3d' | 'strip' */
  var W = 0;                /* plate width (px), cached */
  var revealed = false;

  /* ---------------------------------------------------------------
     Persistence (§12.6): DC.state = history.state + sessionStorage
     --------------------------------------------------------------- */
  function saved() {
    var v = DC.state ? DC.state.get('plate', null) : null;
    if (v === null || v === undefined) {
      try { v = JSON.parse(sessionStorage.getItem('dc.plate')); } catch (e) { v = null; }
    }
    v = Number(v);
    return isFinite(v) && v === Math.floor(v) && v >= 0 && v < N ? v : 0;
  }
  function persist() {
    if (DC.state) { DC.state.set('plate', index); return; }
    try { sessionStorage.setItem('dc.plate', JSON.stringify(index)); } catch (e) {}
  }

  /* ---------------------------------------------------------------
     Desktop geometry (§12.3)
     --------------------------------------------------------------- */
  function measure() { W = plates[0].offsetWidth || W || 560; }
  function layout(pos, instant) {
    if (mode !== '3d') return;
    if (instant) root.classList.add('is-instant');
    for (var i = 0; i < N; i++) {
      var o = i - pos, a = Math.abs(o), s = o < 0 ? -1 : o > 0 ? 1 : 0;
      var x = s * (a <= 1 ? a * 0.8 * W : 0.8 * W + (a - 1) * 0.42 * W);
      var z = -Math.min(a, 2.2) * 360;
      var ry = clamp(o, -1.3, 1.3) * -30;   /* convex: neighbours turn away like pages */
      var op = a <= 1 ? 1 : Math.max(0, 1 - (a - 1) * 0.85);
      var el = slides[i];
      el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,' + z.toFixed(1) + 'px) rotateY(' + ry.toFixed(2) + 'deg)';
      el.style.opacity = op.toFixed(3);
      el.style.visibility = op <= 0.01 ? 'hidden' : 'visible';
      el.style.zIndex = String(100 - Math.round(a * 10));
      plates[i].style.setProperty('--veil', (Math.min(a, 2) * 0.3).toFixed(3));
    }
    if (instant) { void ring.offsetWidth; root.classList.remove('is-instant'); }
  }
  function clearLayout() {
    for (var i = 0; i < N; i++) {
      var el = slides[i];
      el.style.removeProperty('transform'); el.style.removeProperty('opacity');
      el.style.removeProperty('visibility'); el.style.removeProperty('z-index');
      plates[i].style.removeProperty('--veil');
    }
    ring.style.removeProperty('transform');
  }

  /* ---------------------------------------------------------------
     Deck (desktop only): mirrors the active .slide__text; token-guarded
     WAAPI swaps that never queue (§12.4, §6.4 rule 5)
     --------------------------------------------------------------- */
  function textOf(i) {
    var t = slides[i].querySelector('.slide__text');
    return {
      kicker: t.querySelector('.kicker').textContent,
      title: t.querySelector('.slide__title').innerHTML,
      titleText: t.querySelector('.slide__title').textContent.trim(),
      summary: t.querySelector('.summary').textContent,
      facts: t.querySelector('dl').innerHTML
    };
  }
  var group = dk ? [dk.kicker, dk.summary, dk.facts] : [];
  var groupOut = null, groupIn = [], groupData = null;
  function applyGroup(d) {
    dk.kicker.textContent = d.kicker;
    dk.summary.textContent = d.summary;
    dk.facts.innerHTML = d.facts;
  }
  function stopGroup() {
    if (groupOut) { groupOut.forEach(function (a) { a.cancel(); }); groupOut = null; }
    groupIn.forEach(function (a) { a.cancel(); }); groupIn = [];
  }
  function swapGroup(d) {
    groupData = d;
    if (groupOut) return;                 /* an exit is running: it will apply the latest data */
    groupIn.forEach(function (a) { a.cancel(); }); groupIn = [];
    var outs = group.map(function (el) {
      return el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(6px)' }],
        { duration: 160, easing: EINOUT, fill: 'forwards' });
    });
    groupOut = outs;
    outs[0].finished.then(function () {
      if (groupOut !== outs) return;
      applyGroup(groupData);
      outs.forEach(function (a) { a.cancel(); });
      groupOut = null;
      groupIn = group.map(function (el, k) {
        return el.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }],
          { duration: 480, delay: k * 40, easing: EOUT, fill: 'backwards' });
      });
    }, function () { /* cancelled: the canceller applies its own data */ });
  }
  function swapTitle(html, dir, instant) {
    var h = dk.title;
    var outs = h.querySelectorAll('.deck__line.is-out');
    for (var i = 0; i < outs.length; i++) outs[i].remove();
    var old = h.querySelector('.deck__line');
    var line = doc.createElement('span');
    line.className = 'deck__line';
    line.innerHTML = html;
    if (instant || !old) { h.replaceChildren(line); return; }
    old.getAnimations().forEach(function (a) { a.cancel(); });
    old.classList.add('is-out');
    old.setAttribute('aria-hidden', 'true');
    h.appendChild(line);
    var a = old.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(' + (-70 * dir) + '%)' }],
      { duration: 240, easing: EINOUT, fill: 'forwards' });
    var done = function () { if (old.parentNode) old.remove(); };
    a.finished.then(done, done);
    line.animate([{ opacity: 0, transform: 'translateY(' + (90 * dir) + '%)' }, { opacity: 1, transform: 'none' }],
      { duration: 640, delay: 120, easing: EOUT, fill: 'backwards' });
  }
  function updateDeck(dir, instant) {
    if (!dk) return;
    var d = textOf(index);
    /* the link always matches the index immediately; only visuals animate */
    dk.link.setAttribute('href', plates[index].getAttribute('href'));
    if (dk.name) dk.name.textContent = ': ' + d.titleText;
    dk.title.setAttribute('data-vt-key', keys[index]);
    var still = instant || reduce() || mode !== '3d' || !revealed;
    if (still) {
      stopGroup();
      applyGroup(d);
      swapTitle(d.title, dir, true);
      return;
    }
    swapTitle(d.title, dir, false);
    swapGroup(d);
  }

  /* ---------------------------------------------------------------
     go(i): clamp, then §12.2 order: index, classes, aria-current +
     roving tabindex, counter, marker, deck, live text, persistence
     --------------------------------------------------------------- */
  function setDisabled(btn, on) {
    if (!btn) return;
    if (on) btn.setAttribute('aria-disabled', 'true'); else btn.removeAttribute('aria-disabled');
  }
  function render(dir, opts) {
    for (var i = 0; i < N; i++) slides[i].classList.toggle('is-active', i === index);
    stops.forEach(function (b, k) {
      if (k === index) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      b.tabIndex = k === index ? 0 : -1;
    });
    setDisabled(prevBtn, index === 0);
    setDisabled(nextBtn, index === N - 1);
    if (roll) roll.style.setProperty('--at', index);
    if (marker) marker.style.setProperty('--at', index);
    if (statusNow) statusNow.textContent = pad(index + 1);
    if (statusName) statusName.textContent = names[index];
    if (statusBar) statusBar.style.setProperty('--p', ((index + 1) / N).toFixed(3));
    if (mode === '3d') layout(revealed ? index : index + 0.5, opts.instant);
    else if (opts.scroll) scrollStrip(opts.instant);
    updateDeck(dir, opts.instant);
    if (live && !opts.silent) live.textContent = 'Project ' + (index + 1) + ' of ' + N + ': ' + names[index];
    if (!opts.silent || opts.persist) persist();
    root.dispatchEvent(new CustomEvent('dc:gallerychange', { detail: { index: index, key: keys[index] } }));
  }
  function go(i, opts) {
    opts = opts || {};
    var t = clamp(Math.round(i), 0, N - 1);
    if (t === index && !opts.force) {
      if (mode === '3d') layout(index, opts.instant);
      else if (opts.scroll) scrollStrip(opts.instant);
      return false;
    }
    var dir = t >= index ? 1 : -1;
    index = t;
    if (!revealed && !opts.silent) { revealed = true; root.classList.add('is-revealed'); }
    render(dir, opts);
    return true;
  }

  /* 120 ms, 3 px "bump" at a clamped end (Response) */
  function bump(dir) {
    if (reduce() || !ring.animate) return;
    ring.animate([{ translate: '0 0' }, { translate: (3 * dir) + 'px 0' }, { translate: '0 0' }],
      { duration: 120, easing: 'ease-out' });
  }

  /* ---------------------------------------------------------------
     Mobile strip (§12.7)
     --------------------------------------------------------------- */
  var stripTarget = null;
  function stripLeft(i) {
    var padL = parseFloat(getComputedStyle(ring).paddingLeft) || 0;
    return clamp(slides[i].offsetLeft - padL, 0, ring.scrollWidth - ring.clientWidth);
  }
  function scrollStrip(instant) {
    stripTarget = index;
    var left = stripLeft(index);
    ring.scrollTo({ left: left, behavior: instant || reduce() ? 'instant' : 'smooth' });
    if (Math.abs(ring.scrollLeft - left) < 1) stripTarget = null;
  }
  function reconcileStrip(settled) {
    if (mode !== 'strip') return;
    if (stripTarget !== null) {
      if (!settled && Math.abs(ring.scrollLeft - stripLeft(stripTarget)) >= 1) return;
      stripTarget = null;
    }
    // Observer entries may describe an earlier frame (especially after Back).
    // Read the current strip offset before selecting or persisting a project.
    var best = 0, distance = Infinity;
    slides.forEach(function (slide, i) {
      var d = Math.abs(ring.scrollLeft - stripLeft(i));
      if (d < distance) { best = i; distance = d; }
    });
    if (best !== index && (settled || distance <= slides[best].offsetWidth * 0.4)) go(best);
    if (settled && distance > 1) scrollStrip(true);
  }
  var stripIO = 'IntersectionObserver' in window ? new IntersectionObserver(function () {
    reconcileStrip(false);
  }, { root: ring, threshold: [0.6, 0.85] }) : null;
  function settleStrip() { reconcileStrip(true); }
  if ('onscrollend' in ring) ring.addEventListener('scrollend', settleStrip);
  else {
    var settleTimer;
    ring.addEventListener('scroll', function () {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settleStrip, 150);
    }, { passive: true });
  }

  /* ---------------------------------------------------------------
     Mode switch at 760 px
     --------------------------------------------------------------- */
  function setMode() {
    var m = mqDesk.matches ? '3d' : 'strip';
    if (m === mode) return;
    mode = m;
    root.setAttribute('data-mode', m);
    endDrag(null);
    if (m === 'strip') {
      clearLayout();
      scrollStrip(true);
      if (stripIO) slides.forEach(function (s) { stripIO.observe(s); });
    } else {
      if (stripIO) stripIO.disconnect();
      stripTarget = null;
      ring.scrollLeft = 0;
      measure();
      layout(revealed || reduce() ? index : index + 0.5, true);
    }
    updateDeck(1, true);
  }

  /* ---------------------------------------------------------------
     Inputs (§12.5)
     --------------------------------------------------------------- */
  function focusActive() {
    if (mode === '3d' && dk) {
      dk.link.focus({ preventScroll: true });
      deck.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    } else {
      var cta = slides[index].querySelector('.slide__cta');
      if (cta) cta.focus({ preventScroll: true });
    }
  }
  function step(dir) {
    if (!go(index + dir, { scroll: true })) bump(dir);
  }
  if (prevBtn) prevBtn.addEventListener('click', function () { step(-1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { step(1); });
  stops.forEach(function (b, k) {
    b.addEventListener('click', function () { go(k, { scroll: true }); });
  });

  root.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
    var k = e.key, t;
    if (k === 'ArrowRight') t = index + 1;
    else if (k === 'ArrowLeft') t = index - 1;
    else if (k === 'Home') t = 0;
    else if (k === 'End') t = N - 1;
    else return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    e.preventDefault();
    var moved = go(t, { scroll: true });
    if (!moved && (k === 'ArrowRight' || k === 'ArrowLeft')) bump(k === 'ArrowRight' ? 1 : -1);
    if (e.target.hasAttribute && e.target.hasAttribute('data-gallery-stop') && mode === '3d') {
      stops[index].focus({ preventScroll: true });
    } else {
      focusActive();
    }
  });

  /* Drag / swipe (desktop only; touch-action: pan-y on the stage at >= 760) */
  var drag = null, suppressClick = false, dragRaf = 0, dragPos = 0;
  function schedule(p) {
    dragPos = p;
    if (!dragRaf) dragRaf = requestAnimationFrame(function () { dragRaf = 0; if (drag && drag.active) layout(dragPos); });
  }
  stage.addEventListener('pointerdown', function (e) {
    if (mode !== '3d' || e.button !== 0) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;          /* modifier-click passes through */
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, active: false, dx: 0, hist: [[e.timeStamp, e.clientX]] };
  });
  stage.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) { lean(e); return; }
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.active) {
      if (Math.abs(dx) < 6 || Math.abs(dx) <= Math.abs(dy)) {
        if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) drag = null;   /* vertical intent: let the page scroll */
        return;
      }
      drag.active = true;
      root.classList.add('is-dragging');
      resetLean();
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    }
    drag.dx = dx;
    drag.hist.push([e.timeStamp, e.clientX]);
    if (drag.hist.length > 8) drag.hist.shift();
    var p = index - dx / (0.8 * W);
    if (p < 0) p *= 0.35;                                        /* rubber-band the clamped ends */
    else if (p > N - 1) p = N - 1 + (p - (N - 1)) * 0.35;
    schedule(p);
  });
  function endDrag(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    var d = drag;
    drag = null;
    if (dragRaf) { cancelAnimationFrame(dragRaf); dragRaf = 0; }
    if (!d.active) return;
    root.classList.remove('is-dragging');
    if (!e || e.type === 'pointercancel') { layout(index); return; }
    suppressClick = true;
    setTimeout(function () { suppressClick = false; }, 0);
    var now = e.timeStamp, v = 0;
    for (var i = 0; i < d.hist.length; i++) {
      if (now - d.hist[i][0] <= 120) {
        var dt = now - d.hist[i][0];
        v = dt > 0 ? (e.clientX - d.hist[i][1]) / dt : 0;
        break;
      }
    }
    var shift = Math.round(d.dx / (0.8 * W));
    if (shift === 0 && (Math.abs(d.dx) > 40 || Math.abs(v) > 0.35)) shift = d.dx < 0 ? -1 : 1;
    if (Math.abs(v) > 1.2 && Math.abs(shift) === 1 && (v < 0) === (d.dx < 0)) shift *= 2;   /* a hard flick carries one further */
    if (!go(index - shift, {})) layout(index);
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('lostpointercapture', function (e) { if (drag && drag.active && e.pointerId === drag.id) endDrag({ pointerId: e.pointerId, type: 'pointercancel' }); });
  stage.addEventListener('dragstart', function (e) { e.preventDefault(); });

  /* Click: a side plate selects; the front plate (and any modifier-click) navigates natively */
  stage.addEventListener('click', function (e) {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; return; }
    if (mode === 'strip') {
      var link = e.target.closest && e.target.closest('a[href]');
      if (link && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        var selected = slides.indexOf(link.closest('.slide'));
        if (selected >= 0) {
          // A visible neighbour may be activated before a swipe settles.
          // Save the case actually opened on this home history entry.
          if (!go(selected, { scroll: true, instant: true })) persist();
        }
      }
      return;
    }
    var plate = e.target.closest && e.target.closest('.plate');
    if (!plate) return;
    var i = plates.indexOf(plate);
    if (i < 0 || i === index) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    go(i, {});
  }, true);

  /* Lean (§12.3): fine pointer, not reduced, not dragging; rect cached, one rAF per move */
  var rect = null, leanRaf = 0, lx = 0, ly = 0;
  function invalidateRect() { rect = null; }
  addEventListener('scroll', invalidateRect, { passive: true });
  addEventListener('resize', invalidateRect, { passive: true });
  function lean(e) {
    if (mode !== '3d' || drag || !fine() || reduce()) return;
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    if (!rect) rect = stage.getBoundingClientRect();
    lx = clamp((e.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
    ly = clamp((e.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5);
    if (!leanRaf) leanRaf = requestAnimationFrame(function () {
      leanRaf = 0;
      if (drag && drag.active) return;
      ring.style.transform = 'rotateY(' + (lx * 10).toFixed(2) + 'deg) rotateX(' + (-ly * 6).toFixed(2) + 'deg)';
    });
  }
  function resetLean() {
    if (leanRaf) { cancelAnimationFrame(leanRaf); leanRaf = 0; }
    ring.style.removeProperty('transform');
  }
  stage.addEventListener('pointerleave', function () { if (!drag) resetLean(); });

  /* ---------------------------------------------------------------
     Reveal: the arc glides half a plate into place once, when the
     stage is a third on screen; plate draw-ins wait for it
     --------------------------------------------------------------- */
  function reveal() {
    if (revealed) return;
    revealed = true;
    root.classList.add('is-revealed');
    if (mode === '3d') layout(index);
  }
  if (reduce() || !('IntersectionObserver' in window)) {
    revealed = true;
    root.classList.add('is-revealed');
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      if (entries.some(function (en) { return en.isIntersecting; })) { revealIO.disconnect(); reveal(); }
    }, { threshold: 0.35 });
    revealIO.observe(stage);
  }
  if (DC.watchVisibility) DC.watchVisibility(root, function () {});    /* pauses plate animations offscreen */
  if (DC.prefs && DC.prefs.subscribe) DC.prefs.subscribe(function (p) {
    if (p.reduce) { resetLean(); reveal(); }
  });

  /* Resize: re-measure and re-place without transitions */
  var ro = 'ResizeObserver' in window ? new ResizeObserver(function () {
    if (mode !== '3d') return;
    var w = plates[0].offsetWidth;
    if (w && Math.abs(w - W) > 0.5) { W = w; layout(revealed ? index : index + 0.5, true); }
  }) : null;
  if (ro) ro.observe(stage);
  if (mqDesk.addEventListener) mqDesk.addEventListener('change', setMode); else mqDesk.addListener(setMode);

  /* ---------------------------------------------------------------
     Boot: restore before the gallery's first visible frame
     --------------------------------------------------------------- */
  index = saved();
  root.classList.add('is-ready');
  setMode();
  render(1, { instant: true, silent: true });

  function restore() {
    var s = saved();
    if (s === index) { if (mode === 'strip') scrollStrip(true); else layout(index, true); return; }
    index = s;
    render(1, { instant: true, silent: true, scroll: true });
  }
  addEventListener('pageshow', function (e) { if (e.persisted) restore(); });

  DC.gallery = {
    get index() { return index; },
    get key() { return keys[index]; },
    keys: keys.slice(),
    indexOf: function (key) { return keys.indexOf(key); },
    go: function (i, o) {
      o = o || {};
      return go(typeof i === 'string' ? keys.indexOf(i) : i, { instant: !!o.instant, scroll: true, silent: !!o.silent, persist: true });
    },
    restore: restore
  };
})();
