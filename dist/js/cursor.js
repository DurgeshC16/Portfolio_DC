/* =====================================================================
   DC. — cursor.js  (owner CHROME · design-system §10.14)
   Contextual cursor: a small mono label chip that ACCOMPANIES the
   native cursor (which is never hidden). Label = nearest [data-cursor].
   - Fine pointer only; off under reduced motion (OS or "Pause motion").
   - Position is written as a transform in rAF only while the pointer
     moves: one frame per pointermove burst, no loop at rest (0 rAF/s idle).
   - Hidden on keydown, over form fields, on window leave, while a
     button is pressed (drag), on scroll, and while a modal is open.
   - Appears 120 ms after entering a target; tone follows the surface
     under the pointer (ink chip on paper, fog chip on night).
   Attaches to window.DC only (DC.cursor.refresh()).
   ===================================================================== */
(function () {
  'use strict';
  var DC = window.DC;
  if (!DC || DC.cursor) return;

  var doc = document;
  var OFFSET = 16;
  var SHOW_DELAY = 120;   /* --d-instant */
  var FIELD = 'input:not([type=button]):not([type=submit]):not([type=reset]):not([type=checkbox]):not([type=radio]):not([type=range]), textarea, select, [contenteditable]:not([contenteditable=false])';

  var chip = null, labelEl = null;
  var on = false;
  var x = 0, y = 0, raf = 0;
  var target = null;        /* current [data-cursor] element */
  var shown = false, showTimer = 0, pressed = false;

  function build() {
    chip = doc.createElement('div');
    chip.className = 'cursor-chip';
    chip.setAttribute('aria-hidden', 'true');
    labelEl = doc.createElement('span');
    labelEl.className = 'cursor-chip__label';
    chip.appendChild(labelEl);
    doc.body.appendChild(chip);
  }

  function frame() {
    raf = 0;
    chip.style.transform = 'translate3d(' + (x + OFFSET) + 'px,' + (y + OFFSET) + 'px,0)';
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(frame); }

  function hide() {
    clearTimeout(showTimer);
    if (shown) { shown = false; chip.classList.remove('is-shown'); }
  }
  function show() {
    if (!target || pressed) return;
    shown = true;
    chip.classList.add('is-shown');
  }

  function modalOpen() { return !!doc.querySelector('dialog[open]'); }

  function resolve(el) {
    if (!el || el.nodeType !== 1) return null;
    if (el.closest(FIELD)) return null;
    var t = el.closest('[data-cursor]');
    if (!t) return null;
    var label = (t.getAttribute('data-cursor') || '').trim();
    if (!label || label === 'none') return null;
    if (t.matches('[aria-disabled="true"], :disabled')) return null;
    if (modalOpen() && !t.closest('dialog[open]')) return null;
    return t;
  }

  function setTarget(t) {
    if (t === target) return;
    target = t;
    clearTimeout(showTimer);
    if (!t) { hide(); return; }
    labelEl.textContent = t.getAttribute('data-cursor').trim();
    var surf = t.closest('[data-surface]');
    chip.setAttribute('data-tone', surf && surf.getAttribute('data-surface') === 'paper' ? 'paper' : 'night');
    if (shown) return;                       /* moving between targets: swap the label in place */
    showTimer = setTimeout(show, SHOW_DELAY);
  }

  function onMove(e) {
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    x = e.clientX; y = e.clientY;
    setTarget(resolve(e.target));
    if (target) schedule();
  }
  function onOver(e) { if (e.pointerType === 'mouse' || e.pointerType === 'pen' || !e.pointerType) setTarget(resolve(e.target)); }
  function onDown() { pressed = true; hide(); }
  function onUp(e) {
    pressed = false;
    var t = resolve(e.target);
    target = null;
    setTarget(t);
  }
  function onLeave(e) { if (!e.relatedTarget) { target = null; hide(); } }
  function onKey() { target = null; hide(); }
  function onScroll() { if (shown || target) { target = null; hide(); } }

  function enable() {
    if (on) return;
    on = true;
    if (!chip) build();
    doc.addEventListener('pointermove', onMove, { passive: true });
    doc.addEventListener('pointerover', onOver, { passive: true });
    doc.addEventListener('pointerdown', onDown, { passive: true });
    doc.addEventListener('pointerup', onUp, { passive: true });
    doc.addEventListener('pointerout', onLeave, { passive: true });
    doc.addEventListener('keydown', onKey, true);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('blur', onKey);
  }
  function disable() {
    if (!on) return;
    on = false;
    doc.removeEventListener('pointermove', onMove);
    doc.removeEventListener('pointerover', onOver);
    doc.removeEventListener('pointerdown', onDown);
    doc.removeEventListener('pointerup', onUp);
    doc.removeEventListener('pointerout', onLeave);
    doc.removeEventListener('keydown', onKey, true);
    removeEventListener('scroll', onScroll);
    removeEventListener('blur', onKey);
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    target = null;
    if (chip) hide();
  }
  function sync(p) {
    p = p || DC.prefs;
    if (p.fine && !p.reduce) enable(); else disable();
  }

  function boot() { sync(); if (DC.prefs.subscribe) DC.prefs.subscribe(sync); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();

  DC.cursor = {
    /* refresh(): re-read the label under the pointer after a script changes data-cursor */
    refresh: function () {
      if (!on || !target) return;
      var t = target; target = null;
      setTarget(resolve(t));
    }
  };
})();
