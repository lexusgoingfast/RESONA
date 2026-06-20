// Shared primitives: lerp, clamp, a global pointer, and environment flags.

export const lerp = (a, b, n) => a + (b - a) * n;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// One shared pointer position, updated once for the whole app.
export const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
window.addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });

export const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
