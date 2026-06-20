// Lenis smooth scroll, bridged to GSAP's ticker and ScrollTrigger.
import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { REDUCED } from './util.js';

export function initSmoothScroll() {
  if (REDUCED) return null; // native scroll under reduced-motion

  const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    smoothWheel: true,
  });

  // keep ScrollTrigger in sync with Lenis' scroll position
  lenis.on('scroll', ScrollTrigger.update);

  // drive Lenis from GSAP's single ticker (one rAF loop for the whole app)
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}
