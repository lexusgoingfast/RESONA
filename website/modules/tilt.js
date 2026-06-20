// 3D tilt on [data-tilt] cards: perspective + rotateX/Y driven by pointer
// position, smoothed with lerp. Returns an update fn for the loop.
import { lerp, FINE, REDUCED } from './util.js';

export function initTilt() {
  if (!FINE || REDUCED) return null;

  const items = [...document.querySelectorAll('[data-tilt]')].map((el) => ({ el, rx: 0, ry: 0, trx: 0, try: 0 }));

  items.forEach((t) => {
    t.el.addEventListener('pointermove', (e) => {
      const r = t.el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      t.try = px * 12;   // rotateY
      t.trx = -py * 12;  // rotateX
    });
    t.el.addEventListener('pointerleave', () => { t.trx = 0; t.try = 0; });
  });

  return () => {
    items.forEach((t) => {
      t.rx = lerp(t.rx, t.trx, 0.12);
      t.ry = lerp(t.ry, t.try, 0.12);
      t.el.style.transform = `perspective(900px) rotateX(${t.rx}deg) rotateY(${t.ry}deg)`;
    });
  };
}
