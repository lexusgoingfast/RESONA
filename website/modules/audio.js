// Sound demo — plays a real ambient track per mode so visitors can hear what
// the device produces. The global Sound on/off switcher starts it (the click is
// the gesture browsers require), and the 4 modes (DRIFT/PULSE/RAIN/STILL)
// crossfade to their matching track as the dial / cards change the shared mode.
//
// Tracks are routed through a tiny Web Audio graph (one gain per track →
// master → soft compressor) so mode changes crossfade smoothly and the master
// fades on stop. Only the active track is kept playing; the rest are paused
// once their fade-out finishes.
import { onMode, state } from './state.js';

// index matches state.mode: 0 DRIFT · 1 PULSE · 2 RAIN · 3 STILL
const TRACKS = ['drift', 'pulse', 'rain', 'still'];
const src = (n) => `/assets/audio/${n}.m4a`;

let ctx, master, comp, nodes = [];
let playing = false, activeIdx = -1;

function build() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = 0;
  comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -10; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
  master.connect(comp); comp.connect(ctx.destination);

  nodes = TRACKS.map((name) => {
    const el = new Audio(src(name));
    el.loop = true; el.preload = 'auto'; el.crossOrigin = 'anonymous';
    const node = ctx.createMediaElementSource(el);
    const g = ctx.createGain(); g.gain.value = 0;
    node.connect(g); g.connect(master);
    return { el, g, off: null };
  });
}

function fade(node, to, time) {
  const p = node.gain, t = ctx.currentTime;
  p.cancelScheduledValues(t);
  p.setValueAtTime(Math.max(p.value, 0.0001), t);
  p.linearRampToValueAtTime(to, t + time);
}

// bring track `idx` up, fade the rest down (and pause them once silent).
async function activate(idx, time) {
  const cur = nodes[idx];
  clearTimeout(cur.off);
  try { await cur.el.play(); } catch (_) { /* gesture/decoding — retried on next toggle */ }
  fade(cur.g, 1, time);

  nodes.forEach((n, i) => {
    if (i === idx) return;
    fade(n.g, 0, time);
    clearTimeout(n.off);
    n.off = setTimeout(() => { if (activeIdx !== i) n.el.pause(); }, time * 1000 + 120);
  });
  activeIdx = idx;
}

async function start() {
  build();
  await ctx.resume();
  // a non-gesture trigger (e.g. wheel that didn't grant activation) leaves the
  // context suspended — report failure so the caller can retry on the next event
  if (ctx.state !== 'running') { playing = false; return false; }
  playing = true;
  fade(master, 1, 0.8);
  await activate(state.mode, 1.0);
  return true;
}

function stop() {
  if (!ctx) return;
  playing = false;
  fade(master, 0, 0.6);
  setTimeout(() => { if (!playing) nodes.forEach((n) => n.el.pause()); }, 700);
}

export function initAudio() {
  const btn = document.getElementById('soundToggle');
  if (!btn) return;

  // auto-start stays armed until the user manually silences it — then we stop
  // nudging them with sound on every scroll.
  let autoArmed = true;

  // .is-off = sound off → knob over the muted icon (mirrors the reference)
  const paint = () => {
    btn.classList.toggle('is-off', !playing);
    btn.setAttribute('aria-pressed', String(playing));
  };

  const turnOn = async () => {
    if (playing) return true;
    const ok = await start();
    paint();
    return ok;
  };

  btn.addEventListener('click', async () => {
    if (playing) { autoArmed = false; stop(); paint(); }
    else { autoArmed = true; await turnOn(); }
  });

  // Auto-start: try on the first user interaction that can unlock audio. A real
  // gesture (wheel / pointer / key / touch — i.e. the moment you start
  // scrolling) is required by browsers, so we keep listening until it actually
  // starts, then detach.
  const triggers = ['pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll', 'click'];
  const detach = () => triggers.forEach((e) => window.removeEventListener(e, tryAuto));
  async function tryAuto() {
    if (!autoArmed) { detach(); return; }
    if (playing) { detach(); return; }
    if (await turnOn()) detach();
  }
  triggers.forEach((e) => window.addEventListener(e, tryAuto, { passive: true }));

  // …and the moment the Sound-Modes section scrolls into view (by then the user
  // has already scrolled, so audio is unlocked).
  const modes = document.getElementById('modes');
  if (modes && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (autoArmed && !playing && entries.some((en) => en.isIntersecting)) tryAuto();
    }, { threshold: 0.25 });
    io.observe(modes);
  }

  // Clicking a mode card is an explicit "let me hear this" — start playback even
  // if the user had silenced it, and re-arm auto-start. (modes.js has already
  // updated the shared mode by the time this runs, so start() picks the right
  // track.)
  document.querySelectorAll('#modeCards .mode-card').forEach((card) =>
    card.addEventListener('click', () => { autoArmed = true; turnOn(); }));

  // dial / cards change the shared mode → crossfade to that track
  onMode(() => { if (playing) activate(state.mode, 0.6); });
}
