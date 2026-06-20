// Click-to-enlarge: a [data-zoom] image expands into a centred lightbox with a
// FLIP-style grow (GPU transforms), a dimmed/blurred backdrop, and a single red
// scan line that sweeps over it once. Click / Esc collapses it back to place.
// Reduced-motion: instant open/close, no sweep.
import gsap from 'gsap';
import { REDUCED } from './util.js';

export function initZoom() {
  const items = [...document.querySelectorAll('[data-zoom]')];
  if (!items.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'zoom-overlay';
  overlay.innerHTML =
    '<div class="zoom-backdrop"></div>' +
    '<img class="zoom-img" alt="" draggable="false" />' +
    '<div class="zoom-line" aria-hidden="true"></div>' +
    '<span class="zoom-cap mono"></span>';
  document.body.appendChild(overlay);

  const backdrop = overlay.querySelector('.zoom-backdrop');
  const img = overlay.querySelector('.zoom-img');
  const line = overlay.querySelector('.zoom-line');
  const cap = overlay.querySelector('.zoom-cap');

  let open = false, busy = false, source = null, box = null;

  // centred target box that fits the image's aspect inside the viewport
  function target(imgEl) {
    const ar = (imgEl.naturalWidth / imgEl.naturalHeight) || 16 / 9;
    const maxW = innerWidth * 0.9, maxH = innerHeight * 0.84;
    let w = maxW, h = w / ar;
    if (h > maxH) { h = maxH; w = h * ar; }
    return { x: (innerWidth - w) / 2, y: (innerHeight - h) / 2, w, h };
  }
  // transform that maps the target box back onto the source element's rect
  function invert(rect, b) {
    return {
      scaleX: rect.width / b.w, scaleY: rect.height / b.h,
      x: (rect.left + rect.width / 2) - (b.x + b.w / 2),
      y: (rect.top + rect.height / 2) - (b.y + b.h / 2),
    };
  }

  function show(el) {
    if (busy || open) return;
    const imgEl = el.querySelector('img') || el;
    source = el;
    img.src = imgEl.currentSrc || imgEl.src;
    cap.textContent = el.dataset.cap || '';
    box = target(imgEl);
    const inv = invert(imgEl.getBoundingClientRect(), box);

    gsap.set(img, { left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: 14 });
    gsap.set(line, { left: box.x, width: box.w });
    el.style.visibility = 'hidden';
    open = true; busy = true;
    gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });

    if (REDUCED) {
      gsap.set(img, { x: 0, y: 0, scaleX: 1, scaleY: 1 });
      gsap.set([backdrop, cap], { opacity: 1 });
      busy = false; return;
    }

    gsap.set(img, { x: inv.x, y: inv.y, scaleX: inv.scaleX, scaleY: inv.scaleY, transformOrigin: '50% 50%' });
    gsap.timeline({ onComplete: () => { busy = false; } })
      .to(backdrop, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0)
      .to(img, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.8, ease: 'expo.out' }, 0)
      .fromTo(line, { top: box.y, opacity: 1 },
                    { top: box.y + box.h, duration: 0.85, ease: 'power2.inOut' }, '>-0.1')
      .set(line, { opacity: 0 })
      .to(cap, { opacity: 1, duration: 0.4 }, '<0.1');
  }

  function hide() {
    if (busy || !open) return;
    const imgEl = source.querySelector('img') || source;
    const inv = invert(imgEl.getBoundingClientRect(), box);
    busy = true;
    const done = () => {
      gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none' });
      gsap.set(img, { clearProps: 'transform' });
      source.style.visibility = '';
      open = false; busy = false; source = null;
    };
    if (REDUCED) { done(); return; }
    gsap.timeline({ onComplete: done })
      .to(cap, { opacity: 0, duration: 0.2 }, 0)
      .to(img, { x: inv.x, y: inv.y, scaleX: inv.scaleX, scaleY: inv.scaleY, duration: 0.55, ease: 'expo.inOut' }, 0)
      .to(backdrop, { opacity: 0, duration: 0.45 }, 0.1);
  }

  items.forEach((el) => {
    el.addEventListener('click', () => show(el));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(el); }
    });
  });
  backdrop.addEventListener('click', hide);
  img.addEventListener('click', hide);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
}
