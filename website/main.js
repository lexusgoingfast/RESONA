// RESONA — entry point.
// Boots Lenis + GSAP, initialises every module, and runs ONE gsap.ticker loop
// that drives all the lerp-based motion (cursor, magnets, tilt, video scrub,
// dot-matrix canvases).
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import { REDUCED } from './modules/util.js';
import { state } from './modules/state.js';
import { initSmoothScroll } from './modules/smooth-scroll.js';
import { initReveals } from './modules/reveals.js';
import { initCursor } from './modules/cursor.js';
import { initMagnetic } from './modules/magnetic.js';
import { initTilt } from './modules/tilt.js';
import { initVideoScrub, initSectionVideoScrub } from './modules/video-scrub.js';
import { initModes } from './modules/modes.js';
import { initDial } from './modules/dial.js';
import { createDotMatrix } from './modules/dot-matrix.js';

gsap.registerPlugin(ScrollTrigger);

// scroll + reveal + interactive state
initSmoothScroll();
initReveals();
initModes();
initDial();

// per-frame updaters (return null when disabled / unsupported)
const updates = [];
const add = (fn) => { if (fn) updates.push(fn); };
add(initCursor());
add(initMagnetic());
add(initTilt());
add(initVideoScrub());
add(initSectionVideoScrub('objectVideo', '.object'));

// dot-matrix canvases: one fixed pattern per Sound-Modes card,
// plus the big Dial canvas that follows the shared mode.
const cardMatrices = [...document.querySelectorAll('.mode-canvas')]
  .map((c) => createDotMatrix(c, { pattern: +c.dataset.pattern, gap: 16 }))
  .filter(Boolean);
const dialMatrix = createDotMatrix(document.getElementById('dialMatrix'), {
  getMode: () => state.mode,
  gap: 26,
});

if (REDUCED) {
  // static, no animation loop
  cardMatrices.forEach((m) => m.drawStatic());
  if (dialMatrix) dialMatrix.drawStatic();
} else {
  gsap.ticker.add((time) => {
    for (const fn of updates) fn(time);
    for (const m of cardMatrices) m.draw(time);
    if (dialMatrix) dialMatrix.draw(time);
  });
}

// recalc ScrollTrigger once fonts/images settle
window.addEventListener('load', () => ScrollTrigger.refresh());
