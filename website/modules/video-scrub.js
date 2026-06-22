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

  // iOS/Safari won't buffer or seek a paused <video> until it has played once;
  // muted inline playback is allowed, so prime it (and again on first touch).
  primeForScrub(video);

  return () => {
    const vh = window.innerHeight;
    const y = window.scrollY;

    // 1) the device leaves the background entirely as the manifesto arrives, so
    //    the lower sections sit on clean black with no device behind. This is
    //    driven purely by scroll position, so it MUST run even when the video
    //    hasn't buffered (e.g. mobile) — keep it ahead of the video-ready guard.
    if (stage && after && hero) {
      const f0 = after.offsetTop - vh;
      const f1 = after.offsetTop - vh * 0.5;
      const fp = clamp((y - f0) / Math.max(1, f1 - f0), 0, 1);
      stage.style.opacity = (1 - fp).toFixed(3);
    }

    // 2) scrub the whole film across the hero, reaching the LAST frame as the
    //    hero finishes scrolling past. Read duration live each frame — avoids a
    //    race where a cached value stays 0 if loadedmetadata fired early.
    const dur = video.duration;
    if (!dur || !isFinite(dur) || video.readyState < 2 || !hero) return;
    const endY = hero.offsetTop + hero.offsetHeight - vh;
    const p = clamp(y / Math.max(1, endY), 0, 1);
    current = lerp(current, p, 0.1);
    const t = current * (dur - 0.05);
    if (Math.abs(video.currentTime - t) > 0.02) {
      try { video.currentTime = t; } catch (_) { /* seek not ready */ }
    }
  };
}

// Kick a muted <video> into a buffered/seekable state. Desktop browsers already
// buffer preload="auto", but iOS Safari needs an actual play() (allowed for
// muted inline video) before currentTime seeking will show frames.
function primeForScrub(video) {
  const kick = () => {
    try {
      const p = video.play();
      if (p && p.then) p.then(() => video.pause()).catch(() => {});
    } catch (_) { /* play not allowed yet */ }
  };
  kick();
  window.addEventListener('touchstart', kick, { once: true, passive: true });
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
  primeForScrub(video);

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
