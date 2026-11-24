/* site.js — owner L (labs). Lab router for the home bench and the case-study benches.
   Contracts (audit-code.md §2.1): #lab/<key>[?params] in the address bar (replaceState, no new
   history entries); the home .study-link and the case-page crumb carry the same fragment so a
   round trip restores the lab; modified clicks on the picker fall through to the case page.
   Everything lives in this IIFE: no globals (the lab factories come from experiments.js). */
(function () {
  'use strict';
  var html = document.documentElement;
  html.classList.add('enhanced');

  /* ---------- Federated case page: "Follow one training round" stepper ---------- */
  var training = document.querySelector('[data-training]');
  if (training) {
    var stageButtons = training.querySelectorAll('button[aria-controls]');
    var showStage = function (selected) {
      stageButtons.forEach(function (button) {
        button.setAttribute('aria-pressed', String(selected === button));
        var target = document.getElementById(button.getAttribute('aria-controls'));
        if (target) target.hidden = selected !== button;
      });
    };
    stageButtons.forEach(function (button) {
      button.addEventListener('click', function () { showStage(button); });
    });
    if (stageButtons.length) showStage(stageButtons[0]);
  }

  /* ---------- Lab router (only where a lab exists) ---------- */
  var panels = [].slice.call(document.querySelectorAll('[data-lab]'));
  if (!panels.length) return;
  var selectors = [].slice.call(document.querySelectorAll('[data-project]'));
  var factories = {
    kaaran: typeof evidenceLab === 'function' && typeof kaaranEvidence !== 'undefined' ? evidenceLab : null,
    tutor: typeof rotationLab === 'function' ? rotationLab : null,
    federated: typeof averagingLab === 'function' ? averagingLab : null,
  };
  var instances = new Map();
  var current = panels[0].dataset.lab;
  var live = document.querySelector('[data-bench-live]');
  var names = { kaaran: 'Kaaran evidence explorer', tutor: 'Tree rotation bench', federated: 'Federated averaging bench' };

  function reduced() {
    return !!(window.DC && DC.prefs && DC.prefs.reduce) || matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function fragment(key) {
    var instance = instances.get(key);
    var query = instance ? instance.params().toString() : '';
    return '#lab/' + key + (query ? '?' + query : '');
  }
  function decoded(value) {
    try { return decodeURIComponent(value); } catch (e) { return value; }
  }
  function replaceHash(hash) {
    // Keep history.state: DC.state stores gallery/palette state there.
    try { history.replaceState(history.state, '', hash); } catch (e) { /* file:// or sandbox */ }
  }
  function updateLinks(key) {
    var hash = fragment(key);
    var panel = document.getElementById('lab-' + key);
    var caseLink = panel && panel.querySelector('.study-link');
    if (caseLink) caseLink.href = 'projects/' + key + '.html' + hash;
    document.querySelectorAll('.detail .crumb, [data-lab-return]').forEach(function (link) {
      if (/(^|\/)index\.html#lab\//.test(link.getAttribute('href') || '')) link.href = '../index.html' + hash;
    });
  }
  function remember(key) {
    if (key !== current) return;
    var hash = fragment(key);
    updateLinks(key);
    if (location.hash !== hash) replaceHash(hash);
  }
  function display(key, restoredParams, announce) {
    var panel = panels.find(function (item) { return item.dataset.lab === key; });
    if (!panel || !factories[key]) return false;
    var switching = current !== key || panel.hidden;
    current = key;
    panels.forEach(function (item) { item.hidden = item !== panel; });
    selectors.forEach(function (item) {
      if (item.dataset.project === key) item.setAttribute('aria-current', 'true');
      else item.removeAttribute('aria-current');
    });
    var firstVisit = !instances.has(key);
    if (firstVisit) instances.set(key, factories[key](panel, function () { remember(key); }));
    if (firstVisit || restoredParams) instances.get(key).restore(restoredParams || new URLSearchParams());
    updateLinks(key);
    if (switching && announce) {
      // Response family: a short cross-fade on the incoming bench (none under reduced motion).
      if (!reduced()) {
        panel.classList.remove('is-entering');
        void panel.offsetWidth;
        panel.classList.add('is-entering');
      }
      if (live) live.textContent = (names[key] || key) + ' shown.';
    }
    return true;
  }
  panels.forEach(function (panel) {
    panel.addEventListener('animationend', function (event) {
      if (event.target === panel) panel.classList.remove('is-entering');
    });
  });

  /* Deep links land the bench under the sticky header. The first jump happens immediately;
     late font swaps and image decodes above the bench can push it down, so we re-align after
     document.fonts.ready and window load, unless the visitor has scrolled in the meantime. */
  var userMoved = false;
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (type) {
    addEventListener(type, function () { userMoved = true; }, { passive: true, once: true });
  });
  function scrollTarget() {
    return document.querySelector('.showcase, .experiment');
  }
  function align(smooth) {
    var target = scrollTarget();
    if (!target) return;
    target.scrollIntoView({ block: 'start', behavior: smooth && !reduced() ? 'smooth' : 'auto' });
  }
  function settle() {
    userMoved = false;
    align(false);
    var again = function () { if (!userMoved) align(false); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(again); });
    if (document.readyState !== 'complete') addEventListener('load', function () { requestAnimationFrame(again); }, { once: true });
  }

  function parseRoute() {
    var route = location.hash.match(/^#lab\/([a-z]+)(?:\?(.*))?$/);
    if (!route || !panels.some(function (item) { return item.dataset.lab === route[1]; })) return null;
    return { key: route[1], params: new URLSearchParams(route[2] || '') };
  }
  function restoreRoute(announce) {
    var route = parseRoute();
    if (!route || !display(route.key, route.params, announce)) return false;
    // Drop invalid or ignored params from the address bar so a shared link matches the screen.
    var canonical = fragment(route.key);
    if (decoded(location.hash) !== decoded(canonical)) replaceHash(canonical);
    return true;
  }

  selectors.forEach(function (item) {
    item.addEventListener('click', function (event) {
      if (event.button || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (!factories[item.dataset.project]) return;
      event.preventDefault();
      display(item.dataset.project, null, true);
      remember(item.dataset.project);
    });
  });

  if (restoreRoute(false)) settle();
  else display(current);

  addEventListener('hashchange', function () {
    if (restoreRoute(true)) align(true);
  });
})();
