'use strict';

document.documentElement.classList.add('enhanced');

const menu = document.querySelector('.mobile-menu');
const menuButton = document.querySelector('.menu-btn');
function closeMenu() {
  menu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}
menuButton.addEventListener('click', () => {
  if (!menu.hidden) return closeMenu();
  menu.hidden = false;
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'Close navigation');
});
menu.addEventListener('click', closeMenu);
window.matchMedia('(min-width: 531px)').addEventListener('change', closeMenu);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) {
    closeMenu();
    menuButton.focus();
  }
});

// All selector buttons expose their current selection and reference visible content.
function select(buttons, selected) {
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button === selected)));
}
const workButtons = document.querySelectorAll('[data-work]');
function showCollection(button) {
  select(workButtons, button);
  workButtons.forEach(item => {
    document.getElementById(item.getAttribute('aria-controls')).hidden = item !== button;
  });
}
if (workButtons.length) {
  showCollection(workButtons[0]);
  workButtons.forEach(button => button.addEventListener('click', () => showCollection(button)));
}
const studies = document.querySelectorAll('[data-study]');
studies.forEach(button => button.addEventListener('click', () => {
  select(studies, button);
  studies.forEach(item => {
    document.getElementById(item.getAttribute('aria-controls')).hidden = item !== button;
  });
  document.getElementById('study-title').textContent = button.dataset.title;
}));

const surface = document.querySelector('#study-form .hero-art');
if (surface && window.matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches) {
  surface.addEventListener('pointermove', event => {
    const rect = surface.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    surface.style.setProperty('--tilt-x', (x * 10) + 'deg');
    surface.style.setProperty('--tilt-y', (-y * 8) + 'deg');
  });
  surface.addEventListener('pointerleave', () => {
    surface.style.removeProperty('--tilt-x');
    surface.style.removeProperty('--tilt-y');
  });
}
const languages = document.querySelectorAll('[data-lang]');
languages.forEach(button => button.addEventListener('click', () => {
  select(languages, button);
  const previous = document.querySelector('[data-pane]:not([hidden])');
  const expanded = Array.from(previous.querySelectorAll('details'), detail => detail.open);
  document.querySelectorAll('[data-pane]').forEach(pane => {
    pane.hidden = pane.dataset.pane !== button.dataset.lang;
    if (!pane.hidden) pane.querySelectorAll('details').forEach((detail, index) => {
      detail.open = !!expanded[index];
    });
  });
}));
const rotateButtons = document.querySelectorAll('[data-rotate]');
rotateButtons.forEach(button => button.addEventListener('click', () => {
  const action = button.dataset.rotate;
  const balanced = action === 'right';
  const feedback = document.getElementById('tree-feedback');
  document.querySelector('[data-tree="before"]').hidden = balanced;
  document.querySelector('[data-tree="after"]').hidden = !balanced;
  document.getElementById('tree-reading').textContent = balanced
    ? 'Root 20 has left child 10 and right child 30.'
    : 'Root 30 has left child 20, which has left child 10.';
  feedback.textContent = ({
    right: 'Correct. A right rotation promotes node 20. Both subtrees now have equal height and the keys remain in order.',
    left: 'Node 30 has no right child to promote. Its heavier subtree is on the left. Try a right rotation.',
    reset: 'Select a rotation to test the structure.'
  })[action];
  rotateButtons.forEach(item => {
    if (item.dataset.rotate === 'reset') item.hidden = action === 'reset';
    else item.disabled = balanced;
  });
  if (balanced) document.querySelector('[data-rotate="reset"]').focus();
  if (action === 'reset') document.querySelector('[data-rotate="left"]').focus();
}));

const stages = [
  ['Local training', 'Each of the three clients trains a copy of the model on its own image dataset. Raw images remain at the client.'],
  ['Model updates', 'Clients return their trained model parameters to the coordinator. The exchanged parameters allow training to proceed across the three datasets.'],
  ['Aggregation', 'The coordinator combines the client updates using federated averaging. The resulting global model is shared with clients for the next training round.']
];
const stageButtons = document.querySelectorAll('[data-fed]');
stageButtons.forEach(button => button.addEventListener('click', () => {
  select(stageButtons, button);
  stageButtons.forEach(item => {
    item.classList.toggle('primary', item === button);
    item.classList.toggle('secondary', item !== button);
  });
  const stage = button.dataset.fed;
  document.querySelector('.fed-diagram').dataset.step = stage;
  const [title, description] = stages[Number(stage)];
  document.querySelector('#fed-text h3').textContent = title;
  document.querySelector('#fed-text p').textContent = description;
}));
