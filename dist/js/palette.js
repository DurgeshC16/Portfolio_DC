/* =====================================================================
   DC. — palette.js  (owner CHROME · design-system §10.13)
   Command palette: <dialog id="palette"> (top layer, showModal) with a
   combobox input + grouped listbox (aria-activedescendant).
   Triggers: [data-palette-open] (delegated), Ctrl/Cmd+K on document
   (not while typing in another field, not during IME composition).
   Index: js/palette-index.js (DC.paletteIndex). No network.
   Public: DC.palette.open(opener?) / .close() / .toggle() / .isOpen()
   Attaches to window.DC only.
   ===================================================================== */
(function () {
  'use strict';
  var DC = window.DC;
  if (!DC || DC.palette || !DC.paletteIndex) return;

  var doc = document;
  var html = doc.documentElement;
  var IDX = DC.paletteIndex;
  var MAX = 8;
  var RECENT_KEY = 'dc.palette.recent';
  var CLOSE_MS = 240;   /* --d-response */

  /* ---------- shared scroll lock (also used by nav.js) ---------- */
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

  /* ---------- dialog shell ---------- */
  var dlg = doc.getElementById('palette');
  if (!dlg) {
    dlg = doc.createElement('dialog');
    dlg.id = 'palette';
    dlg.className = 'palette';
    dlg.setAttribute('data-surface', 'night');
    dlg.setAttribute('aria-label', 'Search the archive');
    doc.body.appendChild(dlg);
  }
  function key(name, label) {
    return '<span class="kbd palette__key">' + DC.icon(name) + '<span class="vh">' + label + '</span></span>';
  }
  dlg.innerHTML =
    '<div class="palette__panel">' +
      '<div class="palette__field">' +
        DC.icon('search', { className: 'palette__glass' }) +
        '<label class="vh" for="palette-input">Search the archive</label>' +
        '<input id="palette-input" class="palette__input" type="text" role="combobox" aria-expanded="true"' +
        ' aria-controls="palette-list" aria-autocomplete="list" aria-describedby="palette-help"' +
        ' autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go"' +
        ' placeholder="Search work, labs, notes">' +
        '<button type="button" class="palette__close" data-palette-close><span class="vh">Close search </span><span class="kbd" aria-hidden="true">Esc</span></button>' +
      '</div>' +
      '<div class="palette__body" data-palette-scroll>' +
        '<div id="palette-list" class="palette__list" role="listbox" aria-label="Results"></div>' +
        '<p class="palette__empty" data-palette-empty hidden></p>' +
      '</div>' +
      '<div class="palette__foot">' +
        '<p class="vh" id="palette-help">Use the up and down arrow keys to move through results, Enter to open, Escape to close.</p>' +
        '<p class="palette__hints" aria-hidden="true">' +
          '<span>' + key('arrow-up', 'Up') + key('arrow-down', 'Down') + ' move</span>' +
          '<span>' + key('return', 'Enter') + ' open</span>' +
          '<span class="palette__hint-tab"><span class="kbd palette__key" data-kbd-mod>Ctrl</span>' + key('return', 'Enter') + ' new tab</span>' +
          '<span><span class="kbd palette__key">Esc</span> close</span>' +
        '</p>' +
        '<p class="palette__count" data-palette-count aria-hidden="true"></p>' +
      '</div>' +
      '<p class="vh" aria-live="polite" data-palette-live></p>' +
    '</div>';

  var input = dlg.querySelector('#palette-input');
  var list = dlg.querySelector('#palette-list');
  var scroller = dlg.querySelector('.palette__panel');   /* the panel scrolls; field and foot are sticky */
  var field = dlg.querySelector('.palette__field');
  var foot = dlg.querySelector('.palette__foot');
  var empty = dlg.querySelector('[data-palette-empty]');
  var live = dlg.querySelector('[data-palette-live]');
  var count = dlg.querySelector('[data-palette-count]');
  if (DC.bind) DC.bind(dlg);   /* mac key glyph */

  /* ---------- index helpers ---------- */
  var groupOrder = {};
  IDX.groups.forEach(function (g, i) { groupOrder[g.id] = i; });
  var groupLabel = {};
  IDX.groups.forEach(function (g) { groupLabel[g.id] = g.label; });

  function norm(s) {
    s = String(s || '');
    if (s.normalize) s = s.normalize('NFD');
    return s.replace(/[̀-ͯ]/g, '').toLowerCase();
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function isWordStart(text, i) { return i === 0 || /[^a-z0-9]/.test(text.charAt(i - 1)); }

  /* Score one token against one field.
     prefix (1000) > word-start (800) > contiguous (600) > subsequence (<= 400, title only) */
  function scoreToken(tok, text, allowSubseq) {
    if (!text) return null;
    var idx = text.indexOf(tok);
    if (idx === 0) return { s: 1000 - Math.min(text.length, 200) * 0.2, at: [0, tok.length] };
    if (idx > 0) {
      var ws = idx, best = -1;
      while (ws !== -1) { if (isWordStart(text, ws)) { best = ws; break; } ws = text.indexOf(tok, ws + 1); }
      if (best > 0) return { s: 800 - best * 0.5, at: [best, best + tok.length] };
      return { s: 600 - idx * 0.5, at: [idx, idx + tok.length] };
    }
    if (!allowSubseq || tok.length < 2) return null;
    var pos = [], ti = 0, gaps = 0, last = -1, bonus = 0;
    for (var i = 0; i < text.length && ti < tok.length; i++) {
      if (text.charAt(i) === tok.charAt(ti)) {
        if (last >= 0) gaps += i - last - 1;
        if (isWordStart(text, i)) bonus += 12;
        pos.push(i); last = i; ti++;
      }
    }
    if (ti < tok.length) return null;
    return { s: Math.max(50, 400 - gaps * 6 + bonus), pos: pos };
  }

  function prepare(item) {
    if (!item.__n) {
      item.__n = { title: norm(item.title), kw: norm(item.kw || ''), hint: norm(item.hint || '') };
    }
    return item.__n;
  }

  function scoreItem(item, q, toks) {
    var n = prepare(item);
    var marks = [];
    var phrase = q.indexOf(' ') > 0 ? scoreToken(q, n.title, false) : null;
    var total = 0;
    for (var i = 0; i < toks.length; i++) {
      var t = toks[i];
      var a = scoreToken(t, n.title, true);
      var b = scoreToken(t, n.kw, false);
      var c = scoreToken(t, n.hint, false);
      var sb = b ? b.s * 0.7 : -1, sc = c ? c.s * 0.5 : -1, sa = a ? a.s : -1;
      var s = Math.max(sa, sb, sc);
      if (s < 0) return null;
      total += s;
      if (a && sa >= s * 0.6) {
        if (a.at) marks.push(a.at); else a.pos.forEach(function (p) { marks.push([p, p + 1]); });
      }
    }
    if (phrase && phrase.s * toks.length > total) { total = phrase.s * toks.length; marks = [phrase.at]; }
    return { item: item, s: total, marks: marks };
  }

  var pageType = doc.body.getAttribute('data-page');
  var onDetailPage = pageType === 'case' || pageType === 'notebook';
  var currentKey = doc.body.getAttribute('data-case') || (pageType === 'notebook' ? 'notebook' : '');

  /* ---------- dynamic entries ---------- */
  function pageItems() {
    /* Sections of the current page (case studies, notebook) with real ids */
    var out = [];
    var page = doc.body.getAttribute('data-page');
    if (page !== 'case' && page !== 'notebook') return out;
    var seen = {};
    doc.querySelectorAll('main section[id], main article[id], main figure[id]').forEach(function (sec) {
      if (sec.closest('dialog') || sec.hidden) return;
      var h = sec.querySelector('h2, h3, figcaption, h1');
      if (!h) return;
      var text = (h.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text || text.length > 90 || seen[text]) return;
      seen[text] = 1;
      out.push({ id: 'p-' + sec.id, group: 'page', title: text, hint: 'This page', href: '#' + sec.id, icon: 'arrow-down', kw: sec.id.replace(/[-_]/g, ' ') });
    });
    return out.slice(0, 12);
  }

  function motionItemPatch(item) {
    if (item.action !== 'motion') return item;
    var userPaused = html.getAttribute('data-motion') === 'reduce';
    var copy = {};
    for (var k in item) if (Object.prototype.hasOwnProperty.call(item, k) && k !== '__n') copy[k] = item[k];
    if (userPaused) {
      copy.title = 'Resume motion';
      copy.hint = 'Turn site animation back on';
      copy.icon = 'play';
    }
    return copy;
  }

  function available(item) {
    if (item.action === 'replay') {
      return !!(DC.hero && typeof DC.hero.replay === 'function') && !DC.prefs.reduce;
    }
    if (item.action === 'motion') {
      /* the OS setting wins: nothing to toggle when the system asks for reduced motion */
      return !matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return true;
  }

  function allItems() {
    var base = IDX.items.filter(available).map(motionItemPatch);
    return pageItems().concat(base);
  }

  /* ---------- recent ---------- */
  function readRecent() {
    try { var r = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); return Array.isArray(r) ? r.slice(0, 3) : []; }
    catch (e) { return []; }
  }
  function remember(id) {
    if (!id || /^p-/.test(id)) return;
    try {
      var r = readRecent().filter(function (x) { return x !== id; });
      r.unshift(id);
      localStorage.setItem(RECENT_KEY, JSON.stringify(r.slice(0, 3)));
    } catch (e) {}
  }

  /* ---------- search ---------- */
  function search(raw) {
    var items = allItems();
    var q = norm(raw).replace(/\s+/g, ' ').trim();
    if (!q) {
      var byId = {};
      items.forEach(function (it) { byId[it.id] = it; });
      var recents = readRecent().map(function (id) { return byId[id]; }).filter(Boolean);
      var used = {};
      var out = recents.map(function (it) { used[it.id] = 1; return { item: it, group: 'recent', marks: [] }; });
      /* home: Sections + Case studies (§10.13). Case/notebook pages lead with their own sections. */
      var show = onDetailPage ? ['page', 'case', 'section'] : ['section', 'case'];
      show.forEach(function (g) {
        items.forEach(function (it) {
          if (used[it.id] || it.group !== g) return;
          if (g === 'page' && out.filter(function (r) { return r.group === 'page'; }).length >= 6) return;
          out.push({ item: it, group: g, marks: [] });
        });
      });
      return { rows: out, query: '' };
    }
    var toks = q.split(' ');
    var scored = [];
    items.forEach(function (it, i) {
      var r = scoreItem(it, q, toks);
      if (r) { r.order = i; scored.push(r); }
    });
    scored.sort(function (a, b) {
      return (b.s - a.s) || (groupOrder[a.item.group] - groupOrder[b.item.group]) || (a.order - b.order);
    });
    scored = scored.slice(0, MAX);
    /* group the top results; groups ordered by their best score, ties by group order */
    var groups = [], gmap = {};
    scored.forEach(function (r) {
      var g = r.item.group;
      if (!gmap[g]) { gmap[g] = { id: g, best: r.s, rows: [] }; groups.push(gmap[g]); }
      gmap[g].rows.push(r);
    });
    var rows = [];
    groups.forEach(function (g) { g.rows.forEach(function (r) { rows.push({ item: r.item, group: g.id, marks: r.marks }); }); });
    return { rows: rows, query: raw.trim() };
  }

  /* ---------- render ---------- */
  var rows = [];
  var active = -1;
  var flash = {};   /* id -> {hint, icon} temporary feedback (copy) */

  function highlight(title, marks) {
    if (!marks || !marks.length) return esc(title);
    /* marks index the normalised title; NFD may change lengths for accented letters, so map by char */
    var n = norm(title);
    if (n.length !== title.length) return esc(title);
    var on = new Array(title.length);
    marks.forEach(function (m) { for (var i = m[0]; i < m[1] && i < on.length; i++) on[i] = true; });
    var out = '', open = false;
    for (var i = 0; i < title.length; i++) {
      if (on[i] && !open) { out += '<mark>'; open = true; }
      if (!on[i] && open) { out += '</mark>'; open = false; }
      out += esc(title.charAt(i));
    }
    if (open) out += '</mark>';
    return out;
  }

  function metaFor(item) {
    if (item.key && item.key === currentKey) return 'This page';
    if (item.external) return 'External';
    if (item.action === 'copy-email') return 'Copy';
    if (item.href && /\.pdf$/i.test(item.href)) return 'PDF';
    if (item.href && /^mailto:/.test(item.href)) return 'Mail';
    if (item.group === 'lab') return 'Lab';
    if (item.group === 'case') return 'Case study';
    return '';
  }

  function render(raw) {
    var res = search(raw);
    rows = res.rows;
    var htmlOut = '', lastGroup = null, gi = 0;
    rows.forEach(function (r, i) {
      if (r.group !== lastGroup) {
        if (lastGroup !== null) htmlOut += '</div>';
        htmlOut += '<div class="palette__group" role="group" aria-labelledby="pal-g-' + gi + '">' +
          '<div class="palette__glabel" id="pal-g-' + gi + '" role="presentation">' + esc(groupLabel[r.group] || '') + '</div>';
        lastGroup = r.group; gi++;
      }
      var it = r.item;
      var f = flash[it.id];
      var meta = metaFor(it);
      htmlOut +=
        '<div class="palette__opt" role="option" id="pal-o-' + i + '" data-i="' + i + '" aria-selected="false"' +
        (f ? ' data-state="done"' : '') + '>' +
          '<span class="palette__icon">' + DC.icon(f ? f.icon : (it.icon || 'arrow-right')) + '</span>' +
          '<span class="palette__text"><span class="palette__title">' + highlight(it.title, r.marks) + '</span>' +
          (it.hint || f ? '<span class="palette__hint">' + esc(f ? f.hint : it.hint) + '</span>' : '') + '</span>' +
          (meta ? '<span class="palette__meta">' + esc(meta) + (it.external ? '<span class="vh"> site, opens in a new tab</span>' : '') + '</span>' : '') +
          '<span class="palette__enter">' + DC.icon('return') + '</span>' +
        '</div>';
    });
    if (lastGroup !== null) htmlOut += '</div>';
    list.innerHTML = htmlOut;
    var none = !rows.length;
    empty.hidden = !none;
    list.hidden = none;
    if (none) {
      empty.innerHTML = 'Nothing in the archive matches <q>' + esc(res.query) + '</q>. Try <q>lab</q>, <q>tree</q> or <q>email</q>.';
    }
    count.textContent = res.query ? (rows.length + (rows.length === 1 ? ' result' : ' results')) : '';
    setActive(rows.length ? 0 : -1, true);
    announceCount(res.query);
  }

  var liveTimer = 0;
  function announce(text) {
    clearTimeout(liveTimer);
    live.textContent = '';
    liveTimer = setTimeout(function () { live.textContent = text; }, 60);
  }
  var countTimer = 0;
  function announceCount(q) {
    clearTimeout(countTimer);
    if (!q) return;
    countTimer = setTimeout(function () {
      announce(rows.length ? rows.length + (rows.length === 1 ? ' result' : ' results') : 'No results');
    }, 450);
  }

  function setActive(i, fromRender) {
    var opts = list.querySelectorAll('[role="option"]');
    if (active >= 0 && opts[active]) opts[active].setAttribute('aria-selected', 'false');
    active = i;
    if (i < 0 || !opts[i]) { input.removeAttribute('aria-activedescendant'); active = -1; return; }
    opts[i].setAttribute('aria-selected', 'true');
    input.setAttribute('aria-activedescendant', opts[i].id);
    if (fromRender && i === 0) { scroller.scrollTop = 0; return; }
    /* keep the active row (and its group label when first in group) in view */
    var el = opts[i];
    var top = el.offsetTop, bottom = top + el.offsetHeight;
    var grp = el.parentElement;
    if (grp && grp.querySelector('[role="option"]') === el) top = grp.offsetTop;
    var viewTop = scroller.scrollTop + field.offsetHeight;
    var viewBottom = scroller.scrollTop + scroller.clientHeight - foot.offsetHeight;
    if (top < viewTop) scroller.scrollTop = top - field.offsetHeight;
    else if (bottom > viewBottom) scroller.scrollTop = bottom - scroller.clientHeight + foot.offsetHeight;
  }

  /* ---------- open / close ---------- */
  var opener = null;
  var closeTimer = 0;
  var locked = false;

  function isOpen() { return dlg.open && !dlg.classList.contains('is-closing'); }

  function open(from) {
    if (isOpen()) { input.focus(); return; }
    clearTimeout(closeTimer);
    var navOpener = null;
    if (DC.nav && DC.nav.isOpen()) navOpener = DC.nav.close({ instant: true, restore: false });
    opener = navOpener || from || doc.activeElement;
    flash = {};
    input.value = '';
    render('');
    dlg.classList.remove('is-closing', 'is-open');
    if (!dlg.open) {
      try { dlg.showModal(); } catch (e) { dlg.setAttribute('open', ''); }
    }
    if (!locked) { DC.scrollLock.lock(); locked = true; }
    void dlg.offsetWidth;   /* commit the start state so the open transition runs */
    dlg.classList.add('is-open');
    input.focus();
    doc.querySelectorAll('[data-palette-open][aria-expanded]').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
  }

  function finish(restore) {
    clearTimeout(closeTimer);
    dlg.classList.remove('is-open', 'is-closing');
    if (dlg.open) dlg.close();
    if (locked) { DC.scrollLock.unlock(); locked = false; }
    doc.querySelectorAll('[data-palette-open][aria-expanded]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    var target = opener;
    opener = null;
    if (restore !== false && target && target.isConnected && typeof target.focus === 'function') {
      try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); }
    }
  }

  /* close({instant, restore}) */
  function close(opts) {
    opts = opts || {};
    if (!dlg.open) return;
    if (opts.instant || DC.prefs.reduce) { finish(opts.restore); return; }
    if (dlg.classList.contains('is-closing')) return;
    dlg.classList.add('is-closing');
    dlg.classList.remove('is-open');
    closeTimer = setTimeout(function () { finish(opts.restore); }, CLOSE_MS);
  }

  /* ---------- activation ---------- */
  function sameDocument(url) {
    return url.href.split('#')[0] === location.href.split('#')[0];
  }

  /* focus a section's heading after an in-page jump (no ring: it is not a control) */
  function land(target) {
    if (!target) return;
    var h = target.matches('h1, h2, h3') ? target : target.querySelector('h1, h2, h3');
    if (!h) return;
    if (!h.hasAttribute('tabindex')) { h.setAttribute('tabindex', '-1'); h.setAttribute('data-dc-landing', ''); }
    try { h.focus({ preventScroll: true }); } catch (e) {}
  }

  function go(item, newTab) {
    var rel = IDX.resolve(item.href);
    var url;
    try { url = new URL(rel, location.href); } catch (e) { return; }
    remember(item.id);
    if (item.external || (newTab && !/^mailto:/.test(rel))) {
      var w = window.open(url.href, '_blank', 'noopener');
      if (w || item.external) close();
      if (!w) location.assign(url.href);
      return;
    }
    if (/^mailto:/.test(rel)) { close({ instant: true }); location.href = url.href; return; }
    if (sameDocument(url) && url.hash) {
      var id = decodeURIComponent(url.hash.slice(1));
      var target = id && doc.getElementById(id);
      if (target) {
        /* plain anchor: push the hash (keeping history.state), scroll explicitly (§6.4 rule 8),
           and move focus to the section heading (not back to the opener) */
        finish(false);
        try { history.pushState(history.state, '', url.hash); } catch (e) {}
        target.scrollIntoView({ behavior: DC.prefs.reduce ? 'auto' : 'smooth', block: 'start' });
        land(target);
        return;
      }
      close({ instant: true });
      if (location.hash === url.hash) {
        /* same route again (e.g. #lab/tutor): let the page scripts re-run it */
        try { window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL: location.href, newURL: location.href })); } catch (e) {}
      } else {
        location.hash = url.hash;     /* routed hashes (#lab/…, #trees?…) are handled by site.js / notebook.js */
      }
      return;
    }
    /* cross-document: close first so the outgoing view-transition snapshot is the page itself */
    close({ instant: true });
    location.assign(url.href);
  }

  function run(item) {
    switch (item.action) {
      case 'copy-email':
        remember(item.id);
        DC.copy(DC.email).then(function (ok) {
          flash[item.id] = ok
            ? { hint: 'Copied to clipboard', icon: 'check' }
            : { hint: 'Copy failed. The address is ' + DC.email, icon: 'mail' };
          var keep = active;
          render(input.value);
          setActive(keep);
          announce(ok ? 'Email address copied' : 'Copy failed. The address is ' + DC.email);
          setTimeout(function () { delete flash[item.id]; }, 2000);
        });
        return;
      case 'replay':
        remember(item.id);
        close({ restore: false });
        scrollTo({ top: 0, behavior: DC.prefs.reduce ? 'auto' : 'smooth' });
        try { DC.hero.replay(); } catch (e) {}
        land(doc.getElementById('hero-name') || doc.querySelector('h1'));
        return;
      case 'motion':
        var paused = html.getAttribute('data-motion') === 'reduce';
        DC.prefs.setMotion(paused ? 'auto' : 'reduce');
        var keepM = active;
        render(input.value);
        setActive(Math.min(keepM, rows.length - 1));
        announce(paused ? 'Motion resumed' : 'Motion paused');
        return;
      case 'index':
        var back = opener;
        finish(false);
        if (DC.nav) DC.nav.open(back);
        return;
    }
  }

  function activate(i, newTab) {
    var r = rows[i];
    if (!r) return;
    if (r.item.action) run(r.item);
    else if (r.item.href) go(r.item, newTab);
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
  input.addEventListener('input', function () { render(input.value); });

  input.addEventListener('keydown', function (e) {
    if (e.isComposing || e.keyCode === 229) return;
    var n = rows.length;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (n) setActive(active < n - 1 ? active + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (n) setActive(active > 0 ? active - 1 : n - 1);
        break;
      case 'Home':
        if (n && !e.shiftKey) { e.preventDefault(); setActive(0); }
        break;
      case 'End':
        if (n && !e.shiftKey) { e.preventDefault(); setActive(n - 1); }
        break;
      case 'PageDown':
        if (n) { e.preventDefault(); setActive(Math.min(n - 1, active + 5)); }
        break;
      case 'PageUp':
        if (n) { e.preventDefault(); setActive(Math.max(0, active - 5)); }
        break;
      case 'Enter':
        e.preventDefault();
        if (active >= 0) activate(active, e.ctrlKey || e.metaKey);
        break;
    }
  });

  /* pointer: hover moves the selection (pointermove, so keyboard scrolling does not fight it) */
  list.addEventListener('pointermove', function (e) {
    var o = e.target.closest('[role="option"]');
    if (!o) return;
    var i = +o.getAttribute('data-i');
    if (i !== active) setActive(i);
  });
  list.addEventListener('click', function (e) {
    var o = e.target.closest('[role="option"]');
    if (!o) return;
    activate(+o.getAttribute('data-i'), e.ctrlKey || e.metaKey || e.shiftKey);
    if (dlg.open && !dlg.classList.contains('is-closing')) input.focus();
  });
  list.addEventListener('auxclick', function (e) {
    if (e.button !== 1) return;
    var o = e.target.closest('[role="option"]');
    if (o) { e.preventDefault(); activate(+o.getAttribute('data-i'), true); }
  });
  list.addEventListener('mousedown', function (e) { if (e.target.closest('[role="option"]')) e.preventDefault(); });   /* keep focus in the input */

  dlg.querySelector('[data-palette-close]').addEventListener('click', function () { close(); });

  /* Escape: animate the close ourselves (cancel is preventable only once per activation in Chromium) */
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !e.isComposing) { e.preventDefault(); e.stopPropagation(); close(); return; }
    trapTab(e);
  });
  dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
  dlg.addEventListener('close', function () { if (locked) finish(); });
  /* click on the backdrop (the dialog box itself, outside the panel) closes */
  dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });

  /* triggers */
  doc.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-palette-open]');
    if (!t) return;
    e.preventDefault();
    open(t);
  });

  function typingElsewhere(el) {
    if (!el || el === doc.body) return false;
    if (dlg.contains(el)) return false;
    if (el.isContentEditable) return true;
    var tag = el.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (tag === 'INPUT') {
      var type = (el.getAttribute('type') || 'text').toLowerCase();
      return ['button', 'checkbox', 'radio', 'range', 'submit', 'reset', 'color', 'file', 'image'].indexOf(type) === -1;
    }
    return false;
  }
  doc.addEventListener('keydown', function (e) {
    if (e.isComposing || e.keyCode === 229) return;
    if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
    if ((e.key || '').toLowerCase() !== 'k') return;
    if (typingElsewhere(e.target) || typingElsewhere(doc.activeElement)) return;
    e.preventDefault();
    if (isOpen()) close(); else open(doc.activeElement);
  });

  /* history: never come back (bfcache) to an open palette */
  addEventListener('pagehide', function () { if (dlg.open) finish(false); });

  DC.palette = {
    open: open,
    close: close,
    toggle: function (from) { if (isOpen()) close(); else open(from); },
    isOpen: isOpen
  };
})();
