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

const panels = [...document.querySelectorAll('[data-lab]')];
const selectors = [...document.querySelectorAll('[data-project]')];
const factories = { kaaran: evidenceLab, tutor: rotationLab, federated: averagingLab };
const instances = new Map();
let current = panels[0].dataset.lab;

function fragment(key) {
  const query = instances.get(key)?.params().toString();
  return '#lab/' + key + (query ? '?' + query : '');
}
function updateLinks(key) {
  const hash = fragment(key);
  const panel = document.getElementById('lab-' + key);
  const caseLink = panel.querySelector('.study-link');
  if (caseLink) caseLink.href = 'projects/' + key + '.html' + hash;
  const backLink = document.querySelector('.detail .crumb');
  if (backLink) backLink.href = '../index.html' + hash;
}
function remember(key) {
  if (key !== current) return;
  const hash = fragment(key);
  updateLinks(key);
  if (location.hash !== hash) history.replaceState(null, '', hash);
}
function display(key, restoredParams) {
  const panel = panels.find((item) => item.dataset.lab === key);
  if (!panel) return;
  current = key;
  panels.forEach((item) => (item.hidden = item !== panel));
  selectors.forEach((item) => {
    if (item.dataset.project === key) item.setAttribute('aria-current', 'true');
    else item.removeAttribute('aria-current');
  });
  const firstVisit = !instances.has(key);
  if (firstVisit)
    instances.set(
      key,
      factories[key](panel, () => remember(key)),
    );
  if (firstVisit || restoredParams) instances.get(key).restore(restoredParams || new URLSearchParams());
  updateLinks(key);
}
function restoreRoute() {
  const route = location.hash.match(/^#lab\/([a-z]+)(?:\?(.*))?$/);
  if (route && panels.some((item) => item.dataset.lab === route[1])) {
    display(route[1], new URLSearchParams(route[2]));
    return true;
  }
  return false;
}
selectors.forEach((item) =>
  item.addEventListener('click', (event) => {
    if (event.button || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    display(item.dataset.project);
    remember(item.dataset.project);
  }),
);
if (!restoreRoute()) {
  display(current);
} else {
  const target = document.querySelector('.showcase, .experiment');
  target.scrollIntoView({ behavior: 'instant', block: 'start' });
}
window.addEventListener('hashchange', restoreRoute);
const training = document.querySelector('[data-training]');
if (training) {
  const buttons = training.querySelectorAll('button[aria-controls]');
  function showStage(selected) {
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(selected === button));
      document.getElementById(button.getAttribute('aria-controls')).hidden = selected !== button;
    });
  }
  buttons.forEach((button) => button.addEventListener('click', () => showStage(button)));
  showStage(buttons[0]);
}
document.documentElement.classList.add('enhanced');
