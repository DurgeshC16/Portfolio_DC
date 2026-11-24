/* =====================================================================
   DC. — core.js  (owner A · system & shell)
   The only global this site adds is window.DC. Classic defer script,
   wrapped in an IIFE; attaches by id / data-* only.
   API (full reference: docs/handoff/A-shell.md):
     DC.root, DC.url(path), DC.email
     DC.prefs.reduce / .fine / .subscribe(fn) / .setMotion('reduce'|'auto')
     DC.watchVisibility(el, onIn[, onOut]) -> unwatch
     DC.reveal.observe(elOrList), DC.reveal.now(el)
     DC.magnetic.attach(el) -> detach, DC.magnetic.refresh()
     DC.copy(text) -> Promise<boolean>, DC.copyEmail()
     DC.header.el / .surface / .setSurface(s) / .pin(bool) / .refresh()
     DC.state.get(key[, fallback]) / .set(key, value)
     DC.icon(name[, {label, className}]) -> '<svg …>' markup string
   ===================================================================== */
(function () {
  'use strict';
  if (window.DC && window.DC.__core) return;

  var doc = document;
  var html = doc.documentElement;
  var DC = window.DC = window.DC || {};
  DC.__core = true;
  DC.version = '1.0.0';
  DC.email = 'durgesh.chaudhari24@vit.edu';

  /* ---------- Root URL (works on / and /projects/, and under any subpath) ---------- */
  var self = doc.currentScript || doc.querySelector('script[src$="js/core.js"]');
  DC.root = self ? self.src.replace(/js\/core\.js(?:[?#].*)?$/, '') : new URL('./', location.href).href;
  DC.url = function (path) { return DC.root + String(path || '').replace(/^\.?\//, ''); };

  /* ---------- Preferences ---------- */
  var mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = matchMedia('(hover: hover) and (pointer: fine)');
  var subscribers = [];
  function computePrefs() {
    DC.prefs.reduce = mqReduce.matches || html.getAttribute('data-motion') === 'reduce';
    DC.prefs.fine = mqFine.matches;
  }
  function notify() {
    computePrefs();
    for (var i = 0; i < subscribers.length; i++) {
      try { subscribers[i](DC.prefs); } catch (e) { setTimeout(function () { throw e; }); }
    }
  }
  DC.prefs = {
    reduce: false,
    fine: false,
    /* subscribe(fn): fn(prefs) runs on every change; returns an unsubscribe function */
    subscribe: function (fn) {
      subscribers.push(fn);
      return function () { subscribers = subscribers.filter(function (f) { return f !== fn; }); };
    },
    /* setMotion('reduce' | 'auto'): the palette's "Pause motion"; persisted in localStorage */
    setMotion: function (mode) {
      if (mode === 'reduce') html.setAttribute('data-motion', 'reduce');
      else html.removeAttribute('data-motion');
      html.classList.remove('intro');
      try { if (mode === 'reduce') localStorage.setItem('dc.motion', 'reduce'); else localStorage.removeItem('dc.motion'); } catch (e) {}
      notify();
    }
  };
  computePrefs();
  function onMq(mq, fn) { if (mq.addEventListener) mq.addEventListener('change', fn); else mq.addListener(fn); }
  onMq(mqReduce, notify);
  onMq(mqFine, notify);

  /* ---------- Icons ---------- */
  DC.icon = function (name, opts) {
    opts = opts || {};
    var cls = 'icon icon--' + name + (opts.className ? ' ' + opts.className : '');
    var a11y = opts.label ? 'role="img" aria-label="' + String(opts.label).replace(/"/g, '&quot;') + '"' : 'aria-hidden="true"';
    return '<svg class="' + cls + '" ' + a11y + ' focusable="false"><use href="' + DC.url('assets/icons.svg#' + name) + '"></use></svg>';
  };

  /* ---------- State (history.state first, sessionStorage fallback) ---------- */
  DC.state = {
    get: function (key, fallback) {
      var hs = history.state;
      if (hs && typeof hs === 'object' && key in hs) return hs[key];
      try {
        var raw = sessionStorage.getItem('dc.' + key);
        if (raw !== null) return JSON.parse(raw);
      } catch (e) {}
      return fallback;
    },
    set: function (key, value) {
      var hs = history.state && typeof history.state === 'object' ? history.state : {};
      var next = {};
      for (var k in hs) if (Object.prototype.hasOwnProperty.call(hs, k)) next[k] = hs[k];
      next[key] = value;
      try { history.replaceState(next, ''); } catch (e) {}   /* URL untouched: #lab/… contracts survive */
      try { sessionStorage.setItem('dc.' + key, JSON.stringify(value)); } catch (e) {}
      return value;
    }
  };

  /* ---------- Visibility: one shared IntersectionObserver + document.hidden ---------- */
  var watchers = new Map();          /* el -> [{onIn, onOut, visible}] */
  var intersecting = new WeakMap();
  var visIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      intersecting.set(en.target, en.isIntersecting);
      en.target.classList.toggle('is-offscreen', !en.isIntersecting);
      evaluate(en.target);
    });
  }) : null;
  function evaluate(el) {
    var list = watchers.get(el);
    if (!list) return;
    var vis = !doc.hidden && intersecting.get(el) !== false;
    list.forEach(function (w) {
      if (w.visible === vis) return;
      w.visible = vis;
      try {
        if (vis) { if (w.onIn) w.onIn(el); }
        else if (w.onOut) w.onOut(el);
      } catch (e) { setTimeout(function () { throw e; }); }
    });
  }
  doc.addEventListener('visibilitychange', function () { watchers.forEach(function (_, el) { evaluate(el); }); });
  /* watchVisibility(el, onIn, onOut)  — or watchVisibility(el, cb) where cb(visible:boolean, el) */
  DC.watchVisibility = function (el, onIn, onOut) {
    if (!el) return function () {};
    var single = typeof onOut !== 'function';
    var w = {
      onIn: single ? function (node) { onIn(true, node); } : onIn,
      onOut: single ? function (node) { onIn(false, node); } : onOut,
      visible: null
    };
    if (!watchers.has(el)) { watchers.set(el, []); if (visIO) visIO.observe(el); }
    watchers.get(el).push(w);
    if (!visIO) intersecting.set(el, true);
    if (intersecting.has(el)) { evaluate(el); }
    return function unwatch() {
      var list = (watchers.get(el) || []).filter(function (x) { return x !== w; });
      if (list.length) watchers.set(el, list);
      else { watchers.delete(el); if (visIO) visIO.unobserve(el); el.classList.remove('is-offscreen'); }
    };
  };

  /* ---------- Reveal (§6.2–6.3): once, threshold 0.2, observe the unclipped wrapper ---------- */
  var revealIO = null, preIO = null;
  function markIn(el) {
    el.classList.add('is-in');
    el.querySelectorAll('img[loading="lazy"]').forEach(function (img) { img.loading = 'eager'; });
  }
  function prepare(el) {
    if (el.__dcReveal) return false;
    el.__dcReveal = true;
    if (el.getAttribute('data-reveal') === 'lines') {
      var items = el.querySelectorAll('[data-reveal-item]');
      if (!items.length) {
        items = el.children;
        for (var j = 0; j < items.length; j++) items[j].setAttribute('data-reveal-item', '');
      }
      for (var i = 0; i < items.length; i++) items[i].style.setProperty('--i', i);
    }
    return true;
  }
  DC.reveal = {
    observe: function (target) {
      var list = !target ? [] : (target.nodeType === 1 ? [target] : Array.prototype.slice.call(target));
      list.forEach(function (el) {
        if (!prepare(el)) return;
        if (DC.prefs.reduce || !revealIO) { markIn(el); return; }
        revealIO.observe(el);
        if (preIO && el.querySelector('img[loading="lazy"]')) preIO.observe(el);
      });
    },
    /* now(el): reveal immediately (e.g. content swapped in by a script) */
    now: function (el) { if (el) { prepare(el); markIn(el); if (revealIO) revealIO.unobserve(el); } }
  };
  if ('IntersectionObserver' in window) {
    revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        revealIO.unobserve(en.target);
        markIn(en.target);
      });
    }, { threshold: 0.2 });
    /* promote lazy images one screen ahead so a reveal never opens onto an empty frame */
    preIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        preIO.unobserve(en.target);
        en.target.querySelectorAll('img[loading="lazy"]').forEach(function (img) { img.loading = 'eager'; });
      });
    }, { rootMargin: '100% 0px 100% 0px' });
  }
  DC.prefs.subscribe(function (p) {
    if (p.reduce) doc.querySelectorAll('[data-reveal]:not(.is-in), .running-head:not(.is-in)').forEach(function (el) { DC.reveal.now(el); });
  });

  /* ---------- Magnetic (§10.3): fine pointer, no reduced motion; inner span only ---------- */
  var magnets = [];
  var pointer = { x: 0, y: 0, pending: false };
  var rectsDirty = true;
  function innerOf(el) {
    var inner = el.querySelector(':scope > .btn__inner, :scope > [data-magnetic-inner]');
    if (!inner) {
      inner = doc.createElement('span');
      inner.className = 'btn__inner';
      while (el.firstChild) inner.appendChild(el.firstChild);
      el.appendChild(inner);
    }
    return inner;
  }
  function measure() {
    var sx = scrollX, sy = scrollY;
    magnets.forEach(function (m) {
      var r = m.el.getBoundingClientRect();
      m.cx = r.left + r.width / 2 + sx; m.cy = r.top + r.height / 2 + sy;
      m.hw = r.width / 2 + 24; m.hh = r.height / 2 + 24;          /* pull radius: box + 24 px */
      m.fixed = !!m.el.closest('.site-header, [data-fixed]');
    });
    rectsDirty = false;
  }
  function frame() {
    pointer.pending = false;
    if (rectsDirty) measure();
    var sx = scrollX, sy = scrollY;
    magnets.forEach(function (m) {
      var px = pointer.x + (m.fixed ? 0 : sx), py = pointer.y + (m.fixed ? 0 : sy);
      var cx = m.fixed ? m.cx - sx : m.cx, cy = m.fixed ? m.cy - sy : m.cy;
      var dx = px - cx, dy = py - cy;
      var inside = Math.abs(dx) <= m.hw && Math.abs(dy) <= m.hh && !m.el.matches('[aria-disabled="true"], :disabled');
      if (inside) {
        var tx = Math.max(-6, Math.min(6, dx * 0.18)), ty = Math.max(-6, Math.min(6, dy * 0.18));
        if (!m.active) { m.active = true; m.inner.style.transition = 'transform 120ms linear, scale var(--d-instant) var(--e-response)'; }
        m.inner.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px)';
      } else if (m.active) {
        m.active = false;
        m.inner.style.transition = 'transform 480ms var(--e-spring), scale var(--d-instant) var(--e-response)';
        m.inner.style.transform = '';
      }
    });
  }
  function onPointerMove(e) {
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    pointer.x = e.clientX; pointer.y = e.clientY;
    if (!pointer.pending) { pointer.pending = true; requestAnimationFrame(frame); }
  }
  function releaseAll() {
    magnets.forEach(function (m) {
      if (!m.active) return;
      m.active = false;
      m.inner.style.transition = 'transform 480ms var(--e-spring)';
      m.inner.style.transform = '';
    });
  }
  var magnetListening = false;
  function syncMagnetListeners() {
    var want = magnets.length > 0 && DC.prefs.fine && !DC.prefs.reduce;
    if (want && !magnetListening) {
      doc.addEventListener('pointermove', onPointerMove, { passive: true });
      doc.documentElement.addEventListener('pointerleave', releaseAll);
      magnetListening = true;
    } else if (!want && magnetListening) {
      doc.removeEventListener('pointermove', onPointerMove);
      doc.documentElement.removeEventListener('pointerleave', releaseAll);
      magnetListening = false;
      releaseAll();
    }
  }
  var invalidate = function () { rectsDirty = true; };
  addEventListener('resize', invalidate, { passive: true });
  addEventListener('scroll', function () { if (magnets.some(function (m) { return m.fixed; })) rectsDirty = true; }, { passive: true });
  var magnetRO = 'ResizeObserver' in window ? new ResizeObserver(invalidate) : null;
  DC.magnetic = {
    attach: function (el) {
      if (!el || magnets.some(function (m) { return m.el === el; })) return function () {};
      var m = { el: el, inner: innerOf(el), active: false };
      magnets.push(m);
      if (magnetRO) magnetRO.observe(el);
      rectsDirty = true;
      syncMagnetListeners();
      return function detach() {
        magnets = magnets.filter(function (x) { return x !== m; });
        if (magnetRO) magnetRO.unobserve(el);
        m.inner.style.transform = ''; m.inner.style.transition = '';
        syncMagnetListeners();
      };
    },
    /* refresh(): re-measure after a script moves magnetic elements */
    refresh: function () { rectsDirty = true; }
  };
  DC.prefs.subscribe(syncMagnetListeners);

  /* ---------- Copy (§10.17): the control itself confirms; no toasts ---------- */
  DC.copy = function (text) {
    text = String(text);
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  };
  function legacyCopy(text) {
    var ta = doc.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
    doc.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }
  function liveFor(btn) {
    var id = btn.getAttribute('data-copy-live-id');
    return (id && doc.getElementById(id)) ||
      (btn.parentElement && btn.parentElement.querySelector('[data-copy-live]')) ||
      doc.querySelector('[data-copy-live]');
  }
  function bindCopy(btn) {
    if (btn.__dcCopy) return;
    btn.__dcCopy = true;
    var label = btn.querySelector('[data-copy-label]');
    var idle = label ? label.textContent : '';
    var timer = 0;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var from = btn.getAttribute('data-copy-from');
      if (from) { var src = doc.querySelector(from); text = src ? src.textContent : ''; }
      var live = liveFor(btn);
      var isEmail = text === DC.email || btn.hasAttribute('data-copy-email');
      DC.copy(text).then(function (ok) {
        clearTimeout(timer);
        btn.setAttribute('data-state', ok ? 'done' : 'manual');
        if (label) {
          label.textContent = ok ? (btn.getAttribute('data-copy-done-label') || 'Copied') : (isEmail ? text : 'Copy failed');
          if (!ok && isEmail) {
            try { var range = doc.createRange(); range.selectNodeContents(label); var sel = getSelection(); sel.removeAllRanges(); sel.addRange(range); } catch (e) {}
          }
        }
        if (live) {
          live.textContent = ok
            ? (btn.getAttribute('data-copy-done') || (isEmail ? 'Email address copied' : 'Copied to clipboard'))
            : (isEmail ? 'Copy failed — the address is shown on the button' : 'Copy failed');
        }
        timer = setTimeout(function () {
          btn.removeAttribute('data-state');
          if (label) label.textContent = idle;
          if (live) live.textContent = '';
          DC.magnetic.refresh();
        }, ok ? 2000 : 6000);
        DC.magnetic.refresh();
      });
    });
  }
  /* copyEmail(): for the palette "Copy email" action; drives the footer control when present */
  DC.copyEmail = function () {
    var btn = doc.querySelector('[data-copy-email]');
    if (btn) { btn.click(); return Promise.resolve(true); }
    return DC.copy(DC.email);
  };

  /* ---------- Header: surface tracking + hide on scroll-down past 100svh ---------- */
  var header = doc.querySelector('[data-header]');
  DC.header = { el: header, surface: header ? header.getAttribute('data-surface') : 'night', pinned: false };
  DC.header.setSurface = function (s) {
    if (!header || !s || s === DC.header.surface) return;
    DC.header.surface = s;
    header.setAttribute('data-surface', s);
    var meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', s === 'paper' ? '#f7f7f3' : '#0d0e11');
  };
  /* pin(true) keeps the header shown (e.g. while the nav overlay is open) */
  DC.header.pin = function (on) { DC.header.pinned = !!on; if (on && header) header.removeAttribute('data-hidden'); };
  if (header) {
    var lineIO = null, crossing = new Set(), widths = new WeakMap();
    var pickSurface = function () {
      var best = null;
      crossing.forEach(function (el) {
        if ((widths.get(el) || 0) < innerWidth * 0.9) return;             /* only full-bleed surfaces drive the header */
        if (!best || best.contains(el)) best = el;                          /* deepest wins (dawn sheet over its night wrapper) */
      });
      DC.header.setSurface(best ? best.getAttribute('data-surface') : 'night');
    };
    var buildLine = function () {
      if (!('IntersectionObserver' in window)) return;
      if (lineIO) lineIO.disconnect();
      crossing.clear();
      var h = header.offsetHeight || 60;
      var bottom = Math.max(0, innerHeight - h - 1);
      lineIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          widths.set(en.target, en.boundingClientRect.width);
          if (en.isIntersecting) crossing.add(en.target); else crossing.delete(en.target);
        });
        pickSurface();
      }, { rootMargin: '-' + h + 'px 0px -' + bottom + 'px 0px', threshold: 0 });
      doc.querySelectorAll('[data-surface]').forEach(function (el) {
        if (el === header || header.contains(el) || el.closest('dialog') || el.hasAttribute('data-surface-local')) return;
        lineIO.observe(el);
      });
    };
    DC.header.refresh = buildLine;
    buildLine();
    var rt = 0;
    addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(buildLine, 150); }, { passive: true });

    /* hide on scroll-down after 100svh; reveal on scroll-up */
    var lastY = scrollY, ticking = false;
    var onScroll = function () {
      ticking = false;
      var y = scrollY, dy = y - lastY;
      if (Math.abs(dy) < 6) return;
      var hide = dy > 0 && y > innerHeight && !DC.header.pinned && !header.contains(doc.activeElement);
      if (hide) header.setAttribute('data-hidden', ''); else header.removeAttribute('data-hidden');
      lastY = y;
    };
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  } else {
    DC.header.refresh = function () {};
  }

  /* ---------- Scroll-spy: same-page nav links get aria-current="true" (never overrides "page") ---------- */
  function scrollSpy() {
    if (!header || !('IntersectionObserver' in window)) return;
    var here = location.href.split('#')[0];
    var links = [];
    header.querySelectorAll('.site-nav a[href*="#"]').forEach(function (a) {
      if (a.getAttribute('aria-current') === 'page') return;
      if (a.href.split('#')[0] !== here) return;
      var target = doc.getElementById(decodeURIComponent(a.hash.slice(1)));
      if (target) links.push({ a: a, t: target });
    });
    if (!links.length) return;
    var active = null;
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.__dcSpy = en.isIntersecting; });
      var hit = null;
      links.forEach(function (l) { if (l.t.__dcSpy) hit = l; });   /* last in document order wins */
      if (hit === active) return;
      if (active) active.a.removeAttribute('aria-current');
      active = hit;
      if (active) active.a.setAttribute('aria-current', 'true');
    }, { rootMargin: '-40% 0px -59% 0px' });                         /* a line at 40% of the viewport */
    links.forEach(function (l) { spy.observe(l.t); });
  }

  /* ---------- Mac keyboard label: "Ctrl" -> command glyph ---------- */
  var plat = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  DC.isMac = /mac|iphone|ipad|ipod/i.test(plat);
  function macKeys(scope) {
    if (!DC.isMac) return;
    (scope || doc).querySelectorAll('[data-kbd-mod]').forEach(function (k) {
      if (k.__dcMac) return;
      k.__dcMac = true;
      k.innerHTML = DC.icon('cmd') + '<span class="vh">Command</span>';
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    macKeys();
    scrollSpy();
    DC.reveal.observe(doc.querySelectorAll('[data-reveal], .running-head'));
    doc.querySelectorAll('[data-magnetic]').forEach(function (el) { DC.magnetic.attach(el); });
    doc.querySelectorAll('[data-copy], [data-copy-from]').forEach(bindCopy);
    doc.querySelectorAll('.scroll-cue').forEach(function (el) { DC.watchVisibility(el, function () {}); });
  }
  /* Bind late-added controls: DC.bind(scope) re-runs reveal/magnetic/copy/mac-key wiring inside scope */
  DC.bind = function (scope) {
    scope = scope || doc;
    macKeys(scope);
    var q = function (s) { return scope.querySelectorAll ? scope.querySelectorAll(s) : []; };
    DC.reveal.observe(q('[data-reveal], .running-head'));
    q('[data-magnetic]').forEach(function (el) { DC.magnetic.attach(el); });
    q('[data-copy], [data-copy-from]').forEach(bindCopy);
  };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
