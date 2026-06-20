// The cinematic background video is FIXED full-screen and never autoplays.
// Everything here is driven directly from window.scrollY inside the shared
// gsap.ticker loop (Lenis updates the real scroll position natively), so the
// scrub never depends on ScrollTrigger↔Lenis event wiring.
//
// NOTE: seeking a <video> needs an HTTP server with Range support (206). Vite's
// dev server provides this, so scrubbing works out of the box in `npm run dev`.
import { lerp, clamp, REDUCED } from './util.js';

export function initVideoScrub() {
  const video = document.getElementById('bgVideo');
  const stage = document.querySelector('.bg-stage');
  const hero = document.querySelector('.hero');
  // the FIRST thing after the intro/hero — the device leaves the bg the moment
  // you scroll out of the intro into the next section.
  const after = document.querySelector('.marquee') || document.querySelector('.manifesto');
  if (!video) return null;

  let current = 0;
  video.pause();

  // reduced motion: poster frame, no scrub
  if (REDUCED) return null;

  return () => {
    // read duration live each frame — avoids a race where the cached value
    // stays 0 if loadedmetadata fired before this listener (e.g. cached video).
    const dur = video.duration;
    if (!dur || !isFinite(dur) || video.readyState < 2 || !hero) return;
    const vh = window.innerHeight;
    const y = window.scrollY;

    // 1) scrub the whole film across the hero, reaching the LAST frame as the
    //    hero finishes scrolling past.
    const endY = hero.offsetTop + hero.offsetHeight - vh;
    const p = clamp(y / Math.max(1, endY), 0, 1);
    current = lerp(current, p, 0.1);
    const t = current * (dur - 0.05);
    if (Math.abs(video.currentTime - t) > 0.02) {
      try { video.currentTime = t; } catch (_) { /* seek not ready */ }
    }

    // 2) the device leaves the background entirely as the manifesto arrives, so
    //    the lower sections sit on clean black with no device behind.
    if (stage && after) {
      const f0 = after.offsetTop - vh;
      const f1 = after.offsetTop - vh * 0.5;
      const fp = clamp((y - f0) / Math.max(1, f1 - f0), 0, 1);
      stage.style.opacity = (1 - fp).toFixed(3);
    }
  };
}

// A video scrubbed by ONE section's progress through the viewport (0 as it
// enters from the bottom, 1 as it leaves the top). Used by the "One object"
// card so its film plays forward/back as you scroll past it.
export function initSectionVideoScrub(videoId, sectionSelector) {
  const video = document.getElementById(videoId);
  const section = document.querySelector(sectionSelector);
  if (!video || !section) return null;

  let current = 0;
  video.pause();
  if (REDUCED) return null;

  return () => {
    const dur = video.duration;
    if (!dur || !isFinite(dur) || video.readyState < 2) return;
    const vh = window.innerHeight;
    const start = section.offsetTop - vh;
    const end = section.offsetTop + section.offsetHeight;
    const p = clamp((window.scrollY - start) / Math.max(1, end - start), 0, 1);
    current = lerp(current, p, 0.12);
    const t = current * (dur - 0.05);
    if (Math.abs(video.currentTime - t) > 0.02) {
      try { video.currentTime = t; } catch (_) { /* seek not ready */ }
    }
  };
}
