/* =====================================================================
   DC. — transitions.js  (owner CHROME · design-system §10.16)
   Cross-document View Transitions. The CSS opt-in lives in chrome.css
   (@view-transition { navigation: auto }, off under reduced motion).
   This script decides WHICH elements share a name, per navigation:

     home -> projects/<key>.html : plate-<key> + title-<key> on the home
                                   elements for <key> that are on screen
     case -> home                : the case page's own plate/title keep
                                   their names (only if on screen); the
                                   home page names its restored plate
     case -> case, anything else : no shared names (root cross-fade only)

   Recognised markup (any of these; see docs/handoff/F-chrome.md):
     data-vt-key="<key>" [data-vt-role="plate|title"]   (headings = title)
     data-vt-plate / data-vt-title   (valueless on a case page = that
                                      page's key; or ="<key>" anywhere)
     .slide[data-key="<key>"] .plate__art   (gallery fallback)
     static CSS names plate-<key>/title-<key> on the case/notebook page
   Names are set inline only for the navigation and removed when the
   transition finishes: no offscreen morphs, no duplicate names.
   Reduced motion (OS or html[data-motion=reduce]): every transition is
   skipped. Unsupported browsers: the listeners never fire (no-op).
   Public: DC.vt.assign(key) -> bool, DC.vt.clear(), DC.vt.keyOf(url)
   Attaches to window.DC only.
   ===================================================================== */
(function () {
  'use strict';
  var DC = window.DC = window.DC || {};
  if (DC.vt) return;

  var doc = document;
  var KEYS = ['kaaran', 'tutor', 'federated', 'certivault', 'notebook'];
  var touched = [];

  /* ---------- URLs ---------- */
  function rootPath() {
    try { return new URL(DC.root || './', location.href).pathname; } catch (e) { return '/'; }
  }
  function rel(url) {
    try {
      var u = new URL(url, location.href);
      if (u.origin !== location.origin) return null;
      var rp = rootPath();
      return u.pathname.indexOf(rp) === 0 ? u.pathname.slice(rp.length) : null;
    } catch (e) { return null; }
  }
  function keyOf(url) {
    var r = rel(url);
    var m = r && r.match(/^projects\/([a-z]+)\.html$/);
    return m && KEYS.indexOf(m[1]) !== -1 ? m[1] : null;
  }
  function isHome(url) { var r = rel(url); return r === '' || r === 'index.html'; }

  /* ---------- page facts ---------- */
  function page() { return doc.body ? doc.body.getAttribute('data-page') : ''; }
  function ownKey() {
    if (!doc.body) return null;
    return doc.body.getAttribute('data-case') || (page() === 'notebook' ? 'notebook' : null);
  }
  function reduced() {
    return (DC.prefs && DC.prefs.reduce) ||
      doc.documentElement.getAttribute('data-motion') === 'reduce' ||
      matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------- candidates ---------- */
  function roleOf(el) {
    var r = el.getAttribute('data-vt-role') || el.getAttribute('data-vt');
    if (r === 'plate' || r === 'title') return r;
    if (el.hasAttribute('data-vt-plate')) return 'plate';
    if (el.hasAttribute('data-vt-title')) return 'title';
    var n = el.__dcVtStatic || '';
    if (/^title-/.test(n)) return 'title';
    return /^H[1-6]$/.test(el.tagName) ? 'title' : 'plate';
  }
  function push(list, nodes) { for (var i = 0; i < nodes.length; i++) if (list.indexOf(nodes[i]) === -1) list.push(nodes[i]); }

  /* elements on THIS page that carry a static CSS name plate-KEY or title-KEY (case/notebook pages) */
  var staticCache = null;
  function staticNamed() {
    if (staticCache) return staticCache;
    staticCache = [];
    var main = doc.querySelector('main');
    if (!main || page() === 'home') return staticCache;
    var all = main.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      var n = getComputedStyle(all[i]).viewTransitionName;
      if (n && /^(plate|title)-/.test(n)) { all[i].__dcVtStatic = n; staticCache.push(all[i]); }
    }
    return staticCache;
  }

  /* every element that could carry a shared name for key */
  function candidates(key) {
    var list = [];
    push(list, doc.querySelectorAll('[data-vt-key="' + key + '"], [data-vt-plate="' + key + '"], [data-vt-title="' + key + '"]'));
    push(list, doc.querySelectorAll('[data-key="' + key + '"] [data-vt-plate], [data-key="' + key + '"] [data-vt-title]'));
    if (ownKey() === key) {
      push(list, doc.querySelectorAll('main [data-vt-plate=""], main [data-vt-title=""]'));
      staticNamed().forEach(function (el) { if (el.__dcVtStatic.split('-').slice(1).join('-') === key) push(list, [el]); });
    }
    var hasPlate = list.some(function (el) { return roleOf(el) === 'plate'; });
    if (!hasPlate) push(list, doc.querySelectorAll('.slide[data-key="' + key + '"] .plate__art'));
    return list;
  }
  /* everything that might hold a shared name at all (to silence) */
  function everything() {
    var list = [];
    push(list, doc.querySelectorAll('[data-vt-key], [data-vt-plate], [data-vt-title]'));
    push(list, staticNamed());
    return list;
  }

  /* fraction of the element inside the viewport (0 when hidden) */
  function onScreen(el) {
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return 0;
    var cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || +cs.opacity === 0) return 0;
    var w = Math.min(r.right, innerWidth) - Math.max(r.left, 0);
    var h = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
    if (w <= 0 || h <= 0) return 0;
    return (w * h) / (r.width * r.height);
  }

  function setName(el, name) { el.style.setProperty('view-transition-name', name); if (touched.indexOf(el) === -1) touched.push(el); }

  function clear() {
    touched.forEach(function (el) { el.style.removeProperty('view-transition-name'); });
    touched = [];
  }

  /* silence(): no shared names on this page (root cross-fade only) */
  function silence() { clear(); everything().forEach(function (el) { setName(el, 'none'); }); }

  /* assign(key): name the best on-screen plate and title for key, silence everything else */
  function assign(key) {
    if (!key || KEYS.indexOf(key) === -1) return false;
    silence();
    var best = { plate: null, title: null }, score = { plate: 0.35, title: 0.6 };
    candidates(key).forEach(function (el) {
      var role = roleOf(el), s = onScreen(el);
      if (s >= score[role]) { score[role] = s; best[role] = el; }
    });
    /* never nest a named title inside the named plate (or vice versa) */
    if (best.plate && best.title && (best.plate.contains(best.title) || best.title.contains(best.plate))) best.title = null;
    if (best.plate) setName(best.plate, 'plate-' + key);
    if (best.title) setName(best.title, 'title-' + key);
    return !!(best.plate || best.title);
  }

  /* ---------- outgoing page ---------- */
  addEventListener('pageswap', function (e) {
    var vt = e.viewTransition;
    if (!vt) return;
    if (reduced()) { vt.skipTransition(); return; }
    var to = e.activation && e.activation.entry && e.activation.entry.url;
    var mine = ownKey();
    if (to && page() === 'home' && keyOf(to)) assign(keyOf(to));
    else if (to && mine && isHome(to)) assign(mine);
    else silence();
    /* names stay until the page is hidden; pagereveal/pageshow clears them on a bfcache return */
  });

  /* ---------- incoming page ---------- */
  addEventListener('pagereveal', function (e) {
    clear();                                   /* stale inline names from a pageswap before bfcache */
    var vt = e.viewTransition;
    if (!vt) return;
    if (reduced()) { vt.skipTransition(); return; }
    var act = window.navigation && navigation.activation;
    var from = act && act.from && act.from.url;
    var mine = ownKey();
    if (from && page() === 'home' && keyOf(from)) {
      if (DC.gallery && typeof DC.gallery.restore === 'function') { try { DC.gallery.restore(); } catch (err) {} }
      assign(keyOf(from));
    } else if (from && mine && isHome(from)) {
      assign(mine);
    } else {
      silence();
    }
    vt.finished.then(clear, clear);
  });
  addEventListener('pageshow', function (e) { if (e.persisted && !('onpagereveal' in window)) clear(); });

  DC.vt = { assign: assign, clear: clear, silence: silence, keyOf: keyOf };
})();
