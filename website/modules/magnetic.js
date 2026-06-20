// Magnetic buttons: [data-magnetic] elements drift toward the pointer while
// hovered, lerping back to rest on leave. Returns an update fn for the loop.
import { lerp, FINE, REDUCED } from './util.js';

export function initMagnetic() {
  if (!FINE || REDUCED) return null;

  const items = [...document.querySelectorAll('[data-magnetic]')].map((el) => ({ el, x: 0, y: 0, tx: 0, ty: 0 }));

  items.forEach((m) => {
    m.el.addEventListener('pointermove', (e) => {
      const r = m.el.getBoundingClientRect();
      m.tx = (e.clientX - (r.left + r.width / 2)) * 0.4;
      m.ty = (e.clientY - (r.top + r.height / 2)) * 0.4;
    });
    m.el.addEventListener('pointerleave', () => { m.tx = 0; m.ty = 0; });
  });

  return () => {
    items.forEach((m) => {
      m.x = lerp(m.x, m.tx, 0.15);
      m.y = lerp(m.y, m.ty, 0.15);
      m.el.style.transform = `translate(${m.x}px, ${m.y}px)`;
    });
  };
}
