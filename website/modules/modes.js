// Sound-Modes cards. Clicking a card sets the shared mode; the active class
// follows the shared state (so the dial and cards always agree).
import { setMode, state, onMode } from './state.js';

export function initModes() {
  const cards = [...document.querySelectorAll('#modeCards .mode-card')];
  if (!cards.length) return;

  cards.forEach((c) => c.addEventListener('click', () => setMode(+c.dataset.mode)));

  const paint = (i) => cards.forEach((c) => c.classList.toggle('active', +c.dataset.mode === i));
  onMode(paint);
  paint(state.mode);
}
