/* =====================================================================
   js/case.js: case-study page behaviour. Owner: E1.
   Spec: design-system §13.2, §10.16, §6. Classic defer script, one IIFE,
   no globals (legacy scripts share the global lexical scope).
   1. Reading mode: Quick view / Deep dive (aria-pressed segmented control,
      localStorage 'dc.caseView', html[data-case-view="quick"]).
   2. Architecture figure viewer (<dialog>) and legend <-> node highlight.
   3. CertiVault issue -> verify walkthrough ([data-walk]).
   Without JS every chapter is visible and the controls are hidden.
   ===================================================================== */
(function () {
  'use strict';
  var doc = document;
  var html = doc.documentElement;
  if (!doc.body || doc.body.getAttribute('data-page') !== 'case') return;
  var DC = window.DC || null;
  var reduce = function () { return DC && DC.prefs ? DC.prefs.reduce : matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  /* ------------------------------------------------------------------
     1. Reading mode
     ------------------------------------------------------------------ */
  var STORE = 'dc.caseView';
  var main = doc.querySelector('main.detail');
  var seg = doc.querySelector('.case-mode__seg');
  var segButtons = seg ? seg.querySelectorAll('[data-case-mode]') : [];
  var live = doc.querySelector('[data-case-mode-live]');

  function readStore() { try { return localStorage.getItem(STORE); } catch (e) { return null; } }
  function writeStore(v) { try { localStorage.setItem(STORE, v); } catch (e) { /* private mode */ } }

  function isEssential(el) { return !main || !main.contains(el) || !!el.closest('[data-case-essential]'); }

  function hashNeedsDeep() {
    var h = location.hash;
    if (!h || h.length < 2) return false;
    if (/^#lab\//.test(h) || h === '#experiment' || h === '#how-it-works') return true;
    var el;
    try { el = doc.getElementById(decodeURIComponent(h.slice(1))); } catch (e) { el = null; }
    return !!el && !isEssential(el);
  }

  function apply(mode, announce) {
    mode = mode === 'quick' ? 'quick' : 'deep';
    if (mode === 'quick') html.setAttribute('data-case-view', 'quick');
    else html.removeAttribute('data-case-view');
    each(segButtons, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-case-mode') === mode)); });
    if (seg) seg.setAttribute('data-active', mode);
    if (announce && live) {
      live.textContent = mode === 'quick' ? 'Quick view: summary, key results and links.' : 'Deep dive: every chapter is shown.';
    }
    if (DC && DC.header && DC.header.refresh) DC.header.refresh();
    if (DC && DC.magnetic) DC.magnetic.refresh();
  }

  function words(el) { return el ? (el.textContent.trim().match(/\S+/g) || []).length : 0; }
  function minutes(n) { return Math.max(1, Math.round(n / 230)) + ' min'; }
  function readingTimes() {
    if (!main) return;
    var quick = 0;
    each(main.querySelectorAll(':scope > [data-case-essential]'), function (el) { quick += words(el); });
    var deep = words(main);
    each(doc.querySelectorAll('[data-case-time]'), function (s) {
      s.textContent = minutes(s.getAttribute('data-case-time') === 'quick' ? quick : deep);
    });
  }

  if (seg) {
    readingTimes();
    apply(hashNeedsDeep() ? 'deep' : (readStore() || 'deep'), false);
    doc.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-case-mode]') : null;
      if (!btn) return;
      var mode = btn.getAttribute('data-case-mode');
      apply(mode, true);
      writeStore(mode);
      var goto = btn.getAttribute('data-case-goto');
      if (goto) {
        var target = doc.getElementById(goto);
        if (target) {
          var heading = target.querySelector('h2') || target;
          if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
          heading.focus({ preventScroll: true });
          target.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' });
        }
      }
    });
    addEventListener('hashchange', function () {
      if (html.getAttribute('data-case-view') === 'quick' && hashNeedsDeep()) {
        apply('deep', true);
        var el = null;
        try { el = doc.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e) { el = null; }
        if (el) el.scrollIntoView({ block: 'start' });
      }
    });
  }

  /* ------------------------------------------------------------------
     2a. Figure viewer: the full architecture drawing in a <dialog>
     ------------------------------------------------------------------ */
  function fillViewer(dialog) {
    var slot = dialog.querySelector('[data-viewer-slot]');
    if (!slot || slot.firstElementChild) return;
    var title = doc.getElementById(slot.getAttribute('data-viewer-slot') + '-t');
    var svg = title ? title.closest('svg') : null;
    if (!svg) return;
    var copy = svg.cloneNode(true);
    each(copy.querySelectorAll('[id]'), function (n) { n.removeAttribute('id'); });
    copy.removeAttribute('aria-labelledby');
    copy.setAttribute('aria-label', title.textContent);
    slot.appendChild(copy);
  }
  each(doc.querySelectorAll('[data-arch-open]'), function (btn) {
    var dialog = doc.getElementById(btn.getAttribute('data-arch-open'));
    if (!dialog || typeof dialog.showModal !== 'function') { btn.hidden = true; return; }
    btn.addEventListener('click', function () {
      fillViewer(dialog);
      dialog.showModal();
      var scroller = dialog.querySelector('.case-viewer__scroll');
      if (scroller) { scroller.scrollLeft = 0; scroller.focus({ preventScroll: true }); }
    });
    dialog.addEventListener('close', function () { btn.focus({ preventScroll: true }); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    each(dialog.querySelectorAll('[data-viewer-close]'), function (c) { c.addEventListener('click', function () { dialog.close(); }); });
  });

  /* ------------------------------------------------------------------
     2b. Legend <-> drawing: hovering a legend row lights its node and back
     (live pointer feedback, mouse only; no loop, no layout reads)
     ------------------------------------------------------------------ */
  each(doc.querySelectorAll('[data-legend-for]'), function (legend) {
    var scope = legend.closest('.case-ch__wide') || legend.parentNode;
    function light(n, on) {
      each(scope.querySelectorAll('[data-node="' + n + '"]'), function (el) { el.classList.toggle('is-lit', on); });
    }
    function bind(el) {
      el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') light(el.getAttribute('data-node'), true); });
      el.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') light(el.getAttribute('data-node'), false); });
    }
    each(legend.querySelectorAll('li[data-node]'), bind);
    each(scope.querySelectorAll('svg .dg-node[data-node]'), function (g) {
      if (legend.querySelector('li[data-node="' + g.getAttribute('data-node') + '"]')) bind(g);
    });
  });

  /* ------------------------------------------------------------------
     3. CertiVault walkthrough: issue, then verify (illustration)
     Order and verdicts follow Web_Tech_CP README.md:106-125.
     ------------------------------------------------------------------ */
  var walk = doc.querySelector('[data-walk]');
  if (walk) initWalk(walk);

  function initWalk(root) {
    var CERT = {
      id: 'CV-2026-000123', inst: 'Example Institute of Technology', student: 'A. Student',
      title: 'Certificate of Completion', issued: '2026-06-01', expires: '2028-05-31', file: 'example-certificate.pdf'
    };
    var EDITED = 'Certificate of Distinction';
    var VERDICT_FOR = ['INVALID', 'REVOKED', 'SUPERSEDED', 'TAMPERED', 'TAMPERED', 'TAMPERED', 'EXPIRED'];
    var input = root.querySelector('[data-walk-title]');
    var titleOut = root.querySelector('[data-walk-title-out]');
    var steps = root.querySelectorAll('[data-walk-step]');
    var seal = root.querySelector('[data-walk-verdict]');
    var sealText = root.querySelector('[data-walk-verdict-text]');
    var reading = root.querySelector('[data-walk-reading]');
    var stateOut = root.querySelector('[data-walk-state]');
    var storedOut = root.querySelector('[data-walk-stored]');
    var nowOut = root.querySelector('[data-walk-now]');
    var radios = root.querySelectorAll('input[name="cv-scenario"]');
    var fileHash = sha256(CERT.file);
    var canon = function (title) {
      return [CERT.id, CERT.inst, CERT.student, title, CERT.issued, CERT.expires, fileHash].join('|');
    };
    var stored = sha256(canon(CERT.title));
    var token = 0;

    function scenario() {
      var r = root.querySelector('input[name="cv-scenario"]:checked');
      return r ? r.value : 'valid';
    }
    function short(h) { return h.slice(0, 16) + '…'; }
    function markDiff(a, b) {
      var out = '', n = 16;
      for (var i = 0; i < n; i++) out += a[i] === b[i] ? a[i] : '<mark>' + a[i] + '</mark>';
      return out + '…';
    }

    function evaluate() {
      var s = scenario();
      var title = input ? input.value : CERT.title;
      var now = sha256(canon(title));
      var checks = [
        s !== 'unknown',            // 1 exists
        s !== 'revoked',            // 2 not revoked
        s !== 'superseded',         // 3 not superseded
        now === stored,             // 4 fingerprint matches
        s !== 'key',                // 5 key matches its pin
        s !== 'sig',                // 6 RSA signature verifies
        s !== 'expired'             // 7 not expired
      ];
      var fail = checks.indexOf(false);
      return { s: s, now: now, title: title, fail: fail, verdict: fail < 0 ? 'VALID' : VERDICT_FOR[fail] };
    }

    var REASON = [
      'No certificate has this ID, so there is nothing to check.',
      'The issuer revoked this certificate.',
      'A corrected copy replaced this certificate; the new one is the valid record.',
      'The recomputed SHA-256 fingerprint does not match the one stored at issue: a field changed after signing.',
      'The institution key does not match the fingerprint pinned outside the database.',
      'The RSA-2048 signature does not verify against the fingerprint.',
      'The certificate is past its expiry date.'
    ];

    function render(animate) {
      var r = evaluate();
      var my = ++token;
      if (titleOut) titleOut.textContent = r.title || ' ';
      if (storedOut) storedOut.textContent = short(stored);
      if (nowOut) nowOut.innerHTML = r.now === stored ? short(r.now) : markDiff(r.now, stored);
      var stepState = function (i) { return r.fail < 0 || i < r.fail ? 'pass' : (i === r.fail ? 'fail' : 'skip'); };
      var finish = function () {
        if (my !== token) return;
        seal.setAttribute('data-verdict', r.verdict);
        sealText.textContent = r.verdict;
        var why = r.fail < 0 ? 'All seven checks passed in order.' : 'Check ' + (r.fail + 1) + ' failed. ' + REASON[r.fail];
        reading.textContent = 'Verdict: ' + r.verdict + '. ' + why;
        if (stateOut) stateOut.textContent = 'Verdict · ' + r.verdict;
      };
      if (!animate || reduce()) {
        each(steps, function (li, i) { li.setAttribute('data-state', stepState(i)); });
        finish();
        return;
      }
      each(steps, function (li) { li.setAttribute('data-state', 'idle'); });
      var last = r.fail < 0 ? steps.length - 1 : r.fail;
      var i = 0;
      (function tick() {
        if (my !== token) return;
        steps[i].setAttribute('data-state', stepState(i));
        i++;
        if (i <= last) setTimeout(tick, 120);
        else {
          for (var j = last + 1; j < steps.length; j++) steps[j].setAttribute('data-state', 'skip');
          finish();
        }
      })();
    }

    each(radios, function (r) {
      r.addEventListener('change', function () {
        if (!input) return render(true);
        if (r.value === 'tampered' && input.value === CERT.title) input.value = EDITED;
        else if (r.value !== 'tampered' && r.checked && input.value === EDITED) input.value = CERT.title;
        render(true);
      });
    });
    if (input) {
      input.value = CERT.title;
      input.addEventListener('input', function () { render(false); });
    }
    var reset = root.querySelector('[data-walk-reset]');
    if (reset) reset.addEventListener('click', function () {
      if (input) input.value = CERT.title;
      if (radios[0]) radios[0].checked = true;
      render(true);
    });
    render(false);
  }

  /* Compact SHA-256 over UTF-8 (FIPS 180-4). Synchronous, so it also works
     where crypto.subtle is unavailable (plain-http previews). */
  function sha256(str) {
    var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var bytes = unescape(encodeURIComponent(str));
    var l = bytes.length, words = [], i;
    for (i = 0; i < l; i++) words[i >> 2] |= (bytes.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
    words[l >> 2] |= 0x80 << (24 - (l % 4) * 8);
    var n = ((l + 8) >> 6) * 16 + 16;
    for (i = words.length; i < n; i++) words[i] = words[i] | 0;
    words[n - 1] = l * 8;
    var w = new Array(64);
    var rotr = function (x, r) { return (x >>> r) | (x << (32 - r)); };
    for (var b = 0; b < n; b += 16) {
      var a = H[0], bb = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (var t = 0; t < 64; t++) {
        if (t < 16) w[t] = words[b + t] | 0;
        else {
          var s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
          var s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
          w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
        }
        var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[t] + w[t]) | 0;
        var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        var mj = (a & bb) ^ (a & c) ^ (bb & c);
        var t2 = (S0 + mj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + bb) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    var out = '';
    for (i = 0; i < 8; i++) out += ('00000000' + (H[i] >>> 0).toString(16)).slice(-8);
    return out;
  }
})();
