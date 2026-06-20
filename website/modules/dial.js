// Interactive draggable dial → selects a sound mode (pointer-driven, NOT
// scroll-driven). Drag to rotate; the nearest 90° segment becomes the mode.
// Readout name/desc fade on change. Keyboard accessible (arrow keys).
import { setMode, state, onMode, MODES } from './state.js';

export function initDial() {
  const dial = document.getElementById('dial');
  if (!dial) return;
  const tick = dial.querySelector('.dial-tick');
  const nameEl = document.getElementById('modeName');
  const descEl = document.getElementById('modeDesc');

  let angle = 0;
  let dragging = false;
  let startA = 0;
  let startAngle = 0;

  function paintTick(a) {
    if (tick) tick.style.transform = `translateX(-50%) rotate(${a}deg)`;
  }
  function render(i) {
    if (nameEl) nameEl.style.opacity = 0;
    if (descEl) descEl.style.opacity = 0;
    setTimeout(() => {
      if (nameEl) { nameEl.textContent = MODES[i].name; nameEl.style.opacity = 1; }
      if (descEl) { descEl.textContent = MODES[i].desc; descEl.style.opacity = 1; }
    }, 180);
    dial.setAttribute('aria-valuenow', i);
  }

  function setAngle(a) {
    angle = a;
    paintTick(a);
    setMode(Math.round((((a % 360) + 360) % 360) / 90) % 4);
  }

  // keep dial in sync when cards change the mode
  onMode((i) => {
    render(i);
    if (!dragging) { angle = i * 90; paintTick(angle); }
  });
  render(state.mode);

  const angleFrom = (e) => {
    const r = dial.getBoundingClientRect();
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI + 90;
  };

  dial.addEventListener('pointerdown', (e) => {
    dragging = true; dial.setPointerCapture(e.pointerId);
    startA = angleFrom(e); startAngle = angle;
  });
  dial.addEventListener('pointermove', (e) => { if (dragging) setAngle(startAngle + (angleFrom(e) - startA)); });
  dial.addEventListener('pointerup', () => { dragging = false; });
  dial.addEventListener('lostpointercapture', () => { dragging = false; });

  dial.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { setAngle(angle + 90); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { setAngle(angle - 90); e.preventDefault(); }
  });
}
