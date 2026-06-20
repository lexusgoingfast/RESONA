// Canvas dot-matrix factory. Each instance renders one pattern field; size is
// driven by sin(time) breathing + cursor proximity (near dots turn accent red).
//
// Patterns (mode index):
//   0 DRIFT — horizontal sine wave
//   1 PULSE — concentric rings from centre
//   2 RAIN  — vertical falling columns
//   3 STILL — sparse random shimmer
import { lerp, pointer } from './util.js';

const FIELDS = [
  (gx, gy, t) => 0.5 + 0.5 * Math.sin(gx * 0.5 - t * 1.2 + gy * 0.15),
  (gx, gy, t, c, r) => {
    const dx = gx - c / 2, dy = gy - r / 2;
    return 0.5 + 0.5 * Math.sin(Math.sqrt(dx * dx + dy * dy) * 0.7 - t * 2.4);
  },
  (gx, gy, t) => 0.5 + 0.5 * Math.sin(gy * 0.6 - t * 3 + gx * 0.05),
  (gx, gy, t) => 0.5 + 0.5 * Math.sin(t * 0.8 + gx * gy * 0.04),
];

export function createDotMatrix(canvas, opts = {}) {
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  const gap = opts.gap || 22;
  const interactive = opts.interactive !== false;
  const getMode = opts.getMode || (() => opts.pattern || 0);

  let cols = 0, rows = 0, dots = [];

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.max(1, Math.floor(w / gap));
    rows = Math.max(1, Math.floor(h / gap));
    const ox = (w - (cols - 1) * gap) / 2;
    const oy = (h - (rows - 1) * gap) / 2;
    dots = [];
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++)
        dots.push({ x: ox + x * gap, y: oy + y * gap, gx: x, gy: y, r: 0 });
  }
  resize();
  window.addEventListener('resize', resize);

  function draw(t) {
    if (!cols) { resize(); return; }
    const f = FIELDS[getMode()] || FIELDS[0];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rect = canvas.getBoundingClientRect();
    const cxp = pointer.x - rect.left, cyp = pointer.y - rect.top;
    for (const d of dots) {
      let v = f(d.gx, d.gy, t, cols, rows);
      let near = 0;
      if (interactive) {
        const dx = d.x - cxp, dy = d.y - cyp;
        near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 160);
        v = Math.min(1, v + near * 0.9);
      }
      d.r = lerp(d.r, 0.7 + v * 3.4, 0.2);
      ctx.beginPath();
      ctx.fillStyle = near > 0.45
        ? `rgba(255,41,77,${0.5 + v * 0.5})`
        : `rgba(236,236,236,${0.1 + v * 0.5})`;
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawStatic() {
    if (!cols) resize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(236,236,236,.22)';
    for (const d of dots) { ctx.beginPath(); ctx.arc(d.x, d.y, 1.6, 0, Math.PI * 2); ctx.fill(); }
  }

  return { draw, drawStatic, resize };
}
