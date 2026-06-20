// Scroll-triggered reveals + hero headline + spec number tickers.
// Uses GSAP ScrollTrigger.batch for staggered section entrances.
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { REDUCED } from './util.js';

export function initReveals() {
  const hero = document.querySelector('.hero');
  // stagger the per-word hero reveal
  document.querySelectorAll('#headline .word > span').forEach((w, i) => {
    w.style.transitionDelay = `${0.07 * i}s`;
  });

  if (REDUCED) {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
    if (hero) hero.classList.add('reveal');
    document.querySelectorAll('[data-count]').forEach((el) => setCount(el, +el.dataset.count));
    return;
  }

  // hero headline reveals when it scrolls into view (after the intro video act).
  // IntersectionObserver is used here so it fires reliably regardless of Lenis.
  if (hero) {
    const heroIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { hero.classList.add('reveal'); heroIO.disconnect(); }
      });
    }, { threshold: 0.18 });
    heroIO.observe(hero);
  }

  // staggered reveals as each cluster enters the viewport
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 86%',
    onEnter: (batch) => batch.forEach((el, i) => setTimeout(() => el.classList.add('is-in'), i * 90)),
  });

  // number tickers count up once when scrolled in
  document.querySelectorAll('[data-count]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => tickTo(el, +el.dataset.count),
    });
  });
}

function unit(el) {
  const s = el.dataset.suffix || '';
  return s ? `<span class="u">${s}</span>` : '';
}
function setCount(el, n) { el.innerHTML = n + unit(el); }

function tickTo(el, target) {
  const start = performance.now();
  const dur = 1400;
  function step(now) {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 4); // ease-out quart
    el.innerHTML = Math.round(target * eased) + unit(el);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
