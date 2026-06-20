// Single source of truth for the active sound mode (0..3).
// Both the Sound-Modes cards and the Dial write through setMode(); every
// dependent (dial readout, dot-matrix, active card) subscribes via onMode().

export const state = { mode: 0 };
const subs = [];

export function setMode(i) {
  i = ((i % 4) + 4) % 4;
  if (i === state.mode) return;
  state.mode = i;
  subs.forEach((fn) => fn(i));
}

export function onMode(fn) { subs.push(fn); }

export const MODES = [
  { name: 'DRIFT', desc: 'warm pads · slow tide · for late afternoons' },
  { name: 'PULSE', desc: 'soft heartbeat · concentric · for thinking' },
  { name: 'RAIN',  desc: 'falling tones · grey light · for focus' },
  { name: 'STILL', desc: 'almost silence · barely there · for sleep' },
];
