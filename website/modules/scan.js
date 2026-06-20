// Click-to-scan: a red scanner line sweeps top→bottom over a [data-scan] stage
// and "develops" the next layer (product photo ⇄ blueprint) behind it via an
// animated clip-path. Reversible — each activation scans to the other layer.
// Reduced-motion: instant swap, no sweep.
import gsap from 'gsap';
import { REDUCED } from './util.js';

export function initScan() {
  document.querySelectorAll('[data-scan]').forEach(setup);
}

function setup(stage) {
  const layers = [...stage.querySelectorAll('.scan-layer')];
  const line = stage.querySelector('.scan-line');
  const hint = stage.querySelector('.scan-hint');
  if (layers.length < 2) return;

  let top = 0;            // index of the layer currently on top
  let busy = false;

  // base stacking: layer 0 visible, the rest sit behind it
  layers.forEach((l, i) => { l.style.zIndex = i === 0 ? 2 : 1; l.style.clipPath = 'none'; });

  const sync = () => {
    const blueprint = top === 1;
    stage.setAttribute('aria-pressed', String(blueprint));
    stage.dataset.mode = blueprint ? 'blueprint' : 'photo';
    if (hint) hint.textContent = blueprint ? '[ restore ]' : '[ scan ]';
  };

  const activate = () => {
    if (busy) return;
    const next = (top + 1) % layers.length;
    const into = layers[next];
    const from = layers[top];

    // bring the incoming layer above, hidden (clipped away from the bottom)
    into.style.zIndex = 3;
    from.style.zIndex = 2;

    if (REDUCED) {
      into.style.clipPath = 'none';
      top = next; sync();
      return;
    }

    busy = true;
    into.style.clipPath = 'inset(0 0 100% 0)';
    gsap.set(line, { top: '0%', opacity: 1 });

    const proxy = { p: 0 };
    gsap.to(proxy, {
      p: 1, duration: 1.05, ease: 'power2.inOut',
      onUpdate: () => {
        const p = proxy.p;
        into.style.clipPath = `inset(0 0 ${(1 - p) * 100}% 0)`;
        line.style.top = `${p * 100}%`;
      },
      onComplete: () => {
        into.style.clipPath = 'none';
        into.style.zIndex = 2;
        from.style.zIndex = 1;
        top = next;
        gsap.to(line, { opacity: 0, duration: 0.28, onComplete: () => gsap.set(line, { top: '0%' }) });
        busy = false;
        sync();
      },
    });
  };

  stage.addEventListener('click', activate);
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
  });
  sync();
}
