/* js/notfound.js — owner E2. 404 page (region:notfound).
   1. Shows the requested path, escaped through textContent (design-system §13.4).
   2. Hides Fig. 404 if its static truss drawing fails to load, so the page degrades to text.
   IIFE; no globals. */
(() => {
  'use strict';
  // Keep local fragment links on the original missing address.
  for (const link of document.querySelectorAll('a[href^="#"]')) {
    if (new URL(document.baseURI).pathname === location.pathname) continue;
    const target = new URL(location.href);
    target.hash = link.getAttribute('href');
    link.href = target.href;
  }
  const line = document.querySelector('[data-nf-path-line]');
  const out = document.querySelector('[data-nf-path]');
  if (line && out) {
    let path = location.pathname + location.search + location.hash;
    try { path = decodeURI(path); } catch (e) { /* keep the encoded form */ }
    if (!/\/404\.html$/.test(location.pathname)) {
      out.textContent = path.length > 160 ? path.slice(0, 157) + '...' : path;
      line.hidden = false;
    }
  }
  const fig = document.querySelector('[data-nf-fig]');
  const img = fig && fig.querySelector('[data-nf-img]');
  if (img) {
    const fail = () => fig.classList.add('is-missing');
    if (img.complete && !img.naturalWidth) fail();
    else img.addEventListener('error', fail, { once: true });
  }
})();
