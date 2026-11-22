'use strict';

const menu = document.getElementById('mobile-menu');
const menuButton = document.querySelector('.menu-btn');
function setMenu(open) {
  menu.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}
menuButton.addEventListener('click', () => setMenu(menu.hidden));
menu.addEventListener('click', () => setMenu(false));
matchMedia('(min-width: 641px)').addEventListener('change', () => setMenu(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !menu.hidden) {
    setMenu(false);
    menuButton.focus();
  }
});
