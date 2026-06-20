// Generative ambient sound demo — synthesised live with the Web Audio API, so
// it literally "never repeats". A global Sound on/off switcher starts it (the
// click is the gesture browsers require), and the 4 modes (DRIFT/PULSE/RAIN/
// STILL) reshape the texture in real time as the dial / cards change the shared
// mode.
import { onMode, state } from './state.js';

// per-mode voice settings — scale (semitones), octaves, note spacing range (s),
// filter, levels, and which extra layers (pulse thump / rain noise) are on.
const CFG = [
  { scale: [0, 3, 5, 7, 10], root: 55,  oct: [0, 1, 2], every: [1.8, 3.2], cut: 720,  q: 6, gain: 0.5,  wet: 0.55, atk: 1.6, rel: 3.6, pulse: 0,   noise: 0 },
  { scale: [0, 2, 3, 7, 9],  root: 55,  oct: [1, 2],    every: [1.3, 2.4], cut: 950,  q: 5, gain: 0.5,  wet: 0.5,  atk: 0.8, rel: 2.6, pulse: 1.1, noise: 0 },
  { scale: [0, 2, 5, 7, 9, 12], root: 110, oct: [1, 2, 3], every: [0.7, 1.4], cut: 1700, q: 3, gain: 0.42, wet: 0.6, atk: 0.06, rel: 1.5, pulse: 0, noise: 1 },
  { scale: [0, 5, 7],        root: 55,  oct: [0, 1],    every: [4.5, 8],   cut: 430,  q: 8, gain: 0.3,  wet: 0.72, atk: 2.6, rel: 5,   pulse: 0,   noise: 0 },
];

let ctx, master, comp, reverb, dry, wet, noiseBuf, bed;
let playing = false, sched = null;
let nNote = 0, nPulse = 0, nDrop = 0;

function buildIR(secs = 3, decay = 2.6) {
  const len = ctx.sampleRate * secs;
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}
function buildNoise(secs = 2) {
  const len = ctx.sampleRate * secs;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function ensure() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = 0;
  comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.25;
  master.connect(comp); comp.connect(ctx.destination);

  reverb = ctx.createConvolver(); reverb.buffer = buildIR();
  dry = ctx.createGain(); wet = ctx.createGain();
  dry.connect(master); wet.connect(reverb); reverb.connect(master);
  noiseBuf = buildNoise();
}

function note(t, f, c) {
  const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = f; o1.detune.value = -6;
  const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = f; o2.detune.value = 7;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = c.cut; lp.Q.value = c.q;
  const g = ctx.createGain(); g.gain.value = 0;
  o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(dry); g.connect(wet);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.16, t + c.atk);
  g.gain.exponentialRampToValueAtTime(0.0007, t + c.atk + c.rel);
  o1.start(t); o2.start(t);
  const end = t + c.atk + c.rel + 0.1;
  o1.stop(end); o2.stop(end);
}
function thump(t) {
  const o = ctx.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(72, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.25);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.5, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0007, t + 0.5);
  o.connect(g); g.connect(dry); g.connect(wet);
  o.start(t); o.stop(t + 0.6);
}
function drop(t) {
  const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.playbackRate.value = 0.8 + Math.random() * 1.4;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1300 + Math.random() * 2600; bp.Q.value = 6 + Math.random() * 8;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.11, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0006, t + 0.18);
  src.connect(bp); bp.connect(g); g.connect(dry); g.connect(wet);
  src.start(t, Math.random() * 1.4); src.stop(t + 0.26);
}

function pickFreq(c) {
  const semi = c.scale[(Math.random() * c.scale.length) | 0];
  const oct = c.oct[(Math.random() * c.oct.length) | 0];
  return c.root * Math.pow(2, oct) * Math.pow(2, semi / 12);
}

function tick() {
  const c = CFG[state.mode];
  const ahead = ctx.currentTime + 0.25;
  while (nNote < ahead) { note(nNote, pickFreq(c), c); const [a, b] = c.every; nNote += a + Math.random() * (b - a); }
  if (c.pulse) { while (nPulse < ahead) { thump(nPulse); nPulse += c.pulse + (Math.random() * 0.1 - 0.05); } } else nPulse = ctx.currentTime;
  if (c.noise) { while (nDrop < ahead) { drop(nDrop); nDrop += 0.12 + Math.random() * 0.32; } } else nDrop = ctx.currentTime;
}

function startBed() {
  if (bed) return;
  bed = ctx.createBufferSource(); bed.buffer = noiseBuf; bed.loop = true;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 0.7;
  const g = ctx.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(0.05, ctx.currentTime, 0.5);
  bed.connect(bp); bp.connect(g); g.connect(dry); g.connect(wet); bed.start(); bed._g = g;
}
function stopBed() {
  if (!bed) return;
  const b = bed; bed = null;
  b._g.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
  setTimeout(() => { try { b.stop(); } catch (_) { /* already stopped */ } }, 800);
}

function applyMode(ramp) {
  const c = CFG[state.mode], t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
  master.gain.linearRampToValueAtTime(c.gain, t + ramp);
  wet.gain.setTargetAtTime(c.wet, t, 0.2);
  if (c.noise) startBed(); else stopBed();
}

async function start() {
  ensure();
  await ctx.resume();
  playing = true;
  applyMode(1.2);
  nNote = nPulse = nDrop = ctx.currentTime + 0.1;
  sched = setInterval(tick, 60);
}
function stop() {
  if (!ctx) return;
  playing = false;
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(0, t + 0.8);
  clearInterval(sched); sched = null;
  stopBed();
  setTimeout(() => { if (!playing && ctx) ctx.suspend(); }, 900);
}

export function initAudio() {
  const btn = document.getElementById('soundToggle');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    if (playing) { stop(); }
    else { await start(); }
    // .is-off = sound off → knob over the muted icon (mirrors the reference)
    btn.classList.toggle('is-off', !playing);
    btn.setAttribute('aria-pressed', String(playing));
  });

  onMode(() => { if (playing) applyMode(0.6); });
}
