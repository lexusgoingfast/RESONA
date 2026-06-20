// Custom cursor: an 8px dot that chases the pointer with lerp and grows on
// interactive targets. Fine pointers only. Returns an update fn for the loop.
import { lerp, pointer, FINE, REDUCED } from './util.js';

export function initCursor() {
  const el = document.getElementById('cursor');
  if (!el || !FINE || REDUCED) return null;

  const cur = { x: pointer.x, y: pointer.y };
  const targets = document.querySelectorAll('a, button, [data-magnetic], [data-tilt], .dial, .mode-card');
  targets.forEach((t) => {
    t.addEventListener('pointerenter', () => el.classList.add('is-hover'));
    t.addEventListener('pointerleave', () => el.classList.remove('is-hover'));
  });

  return () => {
    cur.x = lerp(cur.x, pointer.x, 0.2);
    cur.y = lerp(cur.y, pointer.y, 0.2);
    el.style.transform = `translate(${cur.x}px, ${cur.y}px) translate(-50%, -50%)`;
  };
}
