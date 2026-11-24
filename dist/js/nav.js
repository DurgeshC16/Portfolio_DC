/* =====================================================================
   DC. — nav.js  (owner CHROME · design-system §10.2)
   Full-screen index: <dialog id="nav-overlay" data-surface="night">,
   opened with showModal() from [data-menu-open] (delegated).
   - Native modal focus trap; the rest of the page is inert while open.
   - Escape / Close / a link: closes; focus returns to the opener.
   - html scroll locked while open (gutter kept, no layout shift).
   - Staggered mask lift on open (Response family, §6.3); instant
     under reduced motion.
   Public: DC.nav.open(opener?) / .close({instant, restore}) -> opener
           / .isOpen()
   Attaches to window.DC only.
   ===================================================================== */
(function () {
  'use strict';
  var DC = window.DC;
  if (!DC || DC.nav) return;

  var doc = document;
  var html = doc.documentElement;
  var CLOSE_MS = 240;   /* --d-response */

  /* ---------- shared scroll lock (palette.js defines the same helper if it runs first) ---------- */
  if (!DC.scrollLock) {
    DC.scrollLock = (function () {
      var n = 0;
      return {
        lock: function () {
          if (n++ === 0) {
            var gutter = innerWidth - html.clientWidth > 0;
            html.classList.add('dc-locked');
            html.classList.toggle('dc-locked--gutter', gutter);
          }
        },
        unlock: function () {
          if (n > 0 && --n === 0) html.classList.remove('dc-locked', 'dc-locked--gutter');
        }
      };
    })();
  }

  /* ---------- paths ---------- */
  function prefix() {
    if (DC.paletteIndex) return DC.paletteIndex.prefix;
    try {
      var rootPath = new URL(DC.root).pathname, here = location.pathname;
      if (here.indexOf(rootPath) !== 0) return '';
      return new Array(here.slice(rootPath.length).split('/').length).join('../');
    } catch (e) { return ''; }
  }
  var P = prefix();
  function u(path) { return path.charAt(0) === '#' ? path : P + path; }

  var page = doc.body.getAttribute('data-page') || '';
  var caseKey = doc.body.getAttribute('data-case') || (page === 'notebook' ? 'notebook' : '');

  /* ---------- content (titles per ledger §3; section names per §13.1) ---------- */
  var SECTIONS = [
    { n: 'I', label: 'Selected work', folio: 'Plates 01–05', href: 'index.html#work' },
    { n: 'II', label: 'Evidence', folio: 'Set in type', href: 'index.html#evidence' },
    { n: 'III', label: 'The bench', folio: 'Operable labs', href: 'index.html#bench' },
    { n: 'IV', label: 'Research & about', folio: 'Papers · education', href: 'index.html#research' },
    { n: 'V', label: 'Correspondence', folio: 'Email · profiles', href: '#contact' }
  ];
  var CASES = [
    { key: 'kaaran', no: '01', label: 'Kaaran', href: 'projects/kaaran.html' },
    { key: 'tutor', no: '02', label: 'Neuro-symbolic tree tutor', href: 'projects/tutor.html' },
    { key: 'federated', no: '03', label: 'Federated learning for ASD research', href: 'projects/federated.html' },
    { key: 'certivault', no: '04', label: 'CertiVault', href: 'projects/certivault.html' },
    { key: 'notebook', no: '05', label: 'Engineering notebook', href: 'projects/notebook.html' }
  ];
  var ENTRIES = [
    { no: '01', label: 'How tall does a tree grow?', href: 'projects/notebook.html#trees' },
    { no: '02', label: 'Which review surfaces first?', href: 'projects/notebook.html#retrieval' },
    { no: '03', label: 'AVL insertion replay', href: 'projects/notebook.html#insertion' }
  ];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- dialog ---------- */
  var dlg = doc.getElementById('nav-overlay');
  if (!dlg) {
    dlg = doc.createElement('dialog');
    dlg.id = 'nav-overlay';
    dlg.className = 'nav-overlay';
    dlg.setAttribute('data-surface', 'night');
    dlg.setAttribute('aria-label', 'Site index');
    doc.body.appendChild(dlg);
  }

  var i = 0;
  var sectionHtml = SECTIONS.map(function (s) {
    return '<li class="nav-overlay__item" style="--i:' + (i++) + '">' +
      '<a class="nav-overlay__link" href="' + esc(u(s.href)) + '">' +
        '<span class="nav-overlay__num" aria-hidden="true">' + s.n + '</span>' +
        '<span class="nav-overlay__clip"><span class="nav-overlay__word">' + esc(s.label) + '</span></span>' +
        '<span class="nav-overlay__folio" aria-hidden="true">' + esc(s.folio) + '</span>' +
        '<span class="nav-overlay__go" aria-hidden="true">' + DC.icon('arrow-right') + '</span>' +
      '</a></li>';
  }).join('');

  var caseHtml = CASES.map(function (c) {
    var here = c.key === caseKey;
    return '<li class="nav-overlay__minor" style="--i:' + (i++) + '"><a href="' + esc(u(c.href)) + '"' + (here ? ' aria-current="page"' : '') + '>' +
      '<span class="nav-overlay__pl" aria-hidden="true">Pl. ' + c.no + '</span>' +
      '<span class="nav-overlay__name">' + esc(c.label) + '</span>' +
      (here ? '<span class="nav-overlay__here">Current<span class="vh"> page</span></span>' : '') +
      '</a></li>';
  }).join('');

  var entryHtml = ENTRIES.map(function (e) {
    return '<li class="nav-overlay__minor" style="--i:' + (i++) + '"><a href="' + esc(u(e.href)) + '">' +
      '<span class="nav-overlay__pl" aria-hidden="true">' + e.no + '</span>' +
      '<span class="nav-overlay__name">' + esc(e.label) + '</span></a></li>';
  }).join('');

  dlg.innerHTML =
    '<div class="nav-overlay__frame">' +
      '<div class="nav-overlay__bar">' +
        '<a class="wordmark nav-overlay__mark" href="' + esc(u('index.html')) + '">DC<span class="wordmark__stop">.</span><span class="vh"> Durgesh Chaudhari, home</span></a>' +
        '<p class="nav-overlay__title" aria-hidden="true">Index <span class="nav-overlay__sep">·</span> The Interactive Engineering Archive</p>' +
        '<button type="button" class="site-header__btn nav-overlay__close" data-menu-close>' +
          '<span class="nav-overlay__close-label">Close</span>' + DC.icon('close') + '<span class="vh"> the site index</span></button>' +
      '</div>' +
      '<div class="nav-overlay__body">' +
        '<nav class="nav-overlay__primary" aria-labelledby="nav-ov-contents">' +
          '<h2 class="label nav-overlay__label" id="nav-ov-contents">Contents</h2>' +
          '<ol class="nav-overlay__list">' + sectionHtml + '</ol>' +
        '</nav>' +
        '<div class="nav-overlay__aside">' +
          '<nav class="nav-overlay__group" aria-labelledby="nav-ov-cases">' +
            '<h2 class="label nav-overlay__label" id="nav-ov-cases">Case studies</h2>' +
            '<ul class="nav-overlay__minors">' + caseHtml + '</ul>' +
          '</nav>' +
          '<nav class="nav-overlay__group" aria-labelledby="nav-ov-notes">' +
            '<h2 class="label nav-overlay__label" id="nav-ov-notes">Notebook</h2>' +
            '<ul class="nav-overlay__minors">' + entryHtml + '</ul>' +
          '</nav>' +
          '<div class="nav-overlay__tools" style="--i:' + (i++) + '">' +
            '<button type="button" class="btn btn--ghost btn--sm nav-overlay__search" data-palette-open aria-haspopup="dialog" aria-controls="palette">' +
              '<span class="btn__inner">' + DC.icon('search', { className: 'icon--static' }) + 'Search the archive' +
              '<span class="nav-overlay__keys" aria-hidden="true"><kbd class="kbd" data-kbd-mod>Ctrl</kbd><kbd class="kbd">K</kbd></span></span></button>' +
            '<a class="btn btn--ghost btn--sm" href="' + esc(u('assets/Durgesh-Chaudhari-Resume.pdf')) + '">' +
              '<span class="btn__inner">' + DC.icon('file', { className: 'icon--static' }) + 'Résumé <span class="btn__tag">PDF</span></span></a>' +
          '</div>' +
        '</div>' +
        '<div class="nav-overlay__foot" style="--i:' + (i++) + '">' +
          '<p class="label nav-overlay__label">Write to me</p>' +
          '<a class="nav-overlay__email" href="mailto:' + esc(DC.email) + '">' + esc(DC.email.split('@')[0]) + '<span class="nav-overlay__at">@</span>' + esc(DC.email.split('@')[1]) + '</a>' +
          '<button class="btn btn--ghost btn--sm copy nav-overlay__copy" type="button" data-copy="' + esc(DC.email) + '" data-copy-live-id="nav-ov-live">' +
            '<span class="btn__inner">' + DC.icon('copy', { className: 'copy__idle' }) + DC.icon('check', { className: 'copy__done' }) +
            '<span data-copy-label>Copy address</span></span></button>' +
          '<p class="vh" aria-live="polite" id="nav-ov-live" data-copy-live></p>' +
        '</div>' +
      '</div>' +
    '</div>';
  if (DC.bind) DC.bind(dlg);

  /* ---------- open / close ---------- */
  var opener = null, closeTimer = 0, locked = false;
  function triggers() { return doc.querySelectorAll('[data-menu-open]'); }
  function isOpen() { return dlg.open && !dlg.classList.contains('is-closing'); }

  function open(from) {
    if (isOpen()) return;
    clearTimeout(closeTimer);
    if (DC.palette && DC.palette.isOpen()) DC.palette.close({ instant: true, restore: false });
    opener = from || doc.activeElement;
    dlg.classList.remove('is-closing', 'is-open');
    if (!dlg.open) { try { dlg.showModal(); } catch (e) { dlg.setAttribute('open', ''); } }
    if (!locked) { DC.scrollLock.lock(); locked = true; }
    dlg.scrollTop = 0;
    void dlg.offsetWidth;          /* commit the start state */
    dlg.classList.add('is-open');
    triggers().forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    if (DC.header && DC.header.pin) DC.header.pin(true);
    /* first focus: the first contents link (Close stays one Shift+Tab away) */
    var first = dlg.querySelector('.nav-overlay__link');
    if (first) { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }
  }

  function finish(restore) {
    clearTimeout(closeTimer);
    dlg.classList.remove('is-open', 'is-closing');
    if (dlg.open) dlg.close();
    if (locked) { DC.scrollLock.unlock(); locked = false; }
    triggers().forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    if (DC.header && DC.header.pin) DC.header.pin(false);
    var target = opener;
    opener = null;
    if (restore !== false && target && target.isConnected && typeof target.focus === 'function') {
      try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); }
    }
    return target;
  }

  /* close({instant, restore}) -> the opener (so the palette can inherit it) */
  function close(opts) {
    opts = opts || {};
    if (!dlg.open) return null;
    var who = opener;
    if (opts.instant || DC.prefs.reduce) { finish(opts.restore); return who; }
    if (dlg.classList.contains('is-closing')) return who;
    dlg.classList.add('is-closing');
    dlg.classList.remove('is-open');
    closeTimer = setTimeout(function () { finish(opts.restore); }, CLOSE_MS);
    return who;
  }


  /* Tab wraps inside the dialog (Chromium lets Tab leave a modal for the browser UI) */
  function trapTab(e) {
    if (e.key !== 'Tab' || e.altKey || e.ctrlKey || e.metaKey) return;
    var f = Array.prototype.filter.call(
      dlg.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      function (el) { return el.getClientRects().length > 0; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1], a = doc.activeElement;
    if (e.shiftKey && (a === first || !dlg.contains(a))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (a === last || !dlg.contains(a))) { e.preventDefault(); first.focus(); }
  }

  /* ---------- events ---------- */
  doc.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-menu-open]');
    if (!t) return;
    e.preventDefault();
    if (isOpen()) close(); else open(t);
  });
  dlg.querySelector('[data-menu-close]').addEventListener('click', function () { close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !e.isComposing) { e.preventDefault(); e.stopPropagation(); close(); return; }
    trapTab(e);
  });
  dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
  dlg.addEventListener('close', function () { if (locked) finish(); });

  /* links: close, then navigate. Same-page anchors scroll explicitly (§6.4 rule 8). */
  dlg.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || !dlg.contains(a)) return;
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    var same = url.href.split('#')[0] === location.href.split('#')[0];
    if (same && url.hash) {
      var target = doc.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (target) {
        e.preventDefault();
        finish(false);
        try { history.pushState(history.state, '', url.hash); } catch (err) {}
        target.scrollIntoView({ behavior: DC.prefs.reduce ? 'auto' : 'smooth', block: 'start' });
        /* move the reading position: focus the section's heading without a jump */
        var h = target.matches('h1, h2, h3') ? target : target.querySelector('h1, h2, h3');
        if (h) {
          if (!h.hasAttribute('tabindex')) { h.setAttribute('tabindex', '-1'); h.setAttribute('data-dc-landing', ''); }
          try { h.focus({ preventScroll: true }); } catch (err) {}
        }
        return;
      }
      finish(false);       /* routed hash: let the browser + page scripts handle it */
      return;
    }
    /* cross-document: close now so the outgoing snapshot is the page, not the index */
    finish(false);
  });

  /* never return (bfcache) to an open index */
  addEventListener('pagehide', function () { if (dlg.open) finish(false); });

  DC.nav = { open: open, close: close, isOpen: isOpen };
})();
