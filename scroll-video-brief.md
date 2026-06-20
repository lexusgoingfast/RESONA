# RESONA — Scroll-Driven Hero Video Brief (adapted to our real renders)

## Context
Scroll-scrubbed hero video for the RESONA landing page. The site already has a
working 4-frame image-sequence reveal in the hero; this video REPLACES it as a
`<video>` + `currentTime` scrub (serve.py already gives Range support for seeking).
Motion must be ultra-slow, smooth, premium. Every frame must stand alone as a hero
still (no motion blur, no transitional-only frames).

## Input images (our actual black-bg renders)
Primary input (image-to-video driver): `assets/product-2.jpg` — upright 3/4, shows
glowing dot-matrix display, brushed-aluminium dial, internal PCB + red knob through
the transparent shell.
Composition / material references (if the model accepts multiple):
- `assets/product-1.jpg` — reclined 3/4, dramatic floor spotlight
- `assets/product-3.jpg` — near-front
- `assets/product-4.jpg` — dead-front, display ring glow

(Originals at full res: `/Users/lexxxus/Documents/renders/`.)

## Specs
- Duration: 10s (or 2×5s stitched)
- Aspect ratio: 16:9
- Background: pure deep black #0B0B0C throughout
- Model: Kling 3.0 (camera physics) — fallback Sora 2
- Product = RESONA: squircle transparent smoke-grey polycarbonate device; upper
  circular dot-matrix display; lower brushed-aluminium flat rotary dial with ONE thin
  red indicator line; green PCB + copper traces + a tiny red LED visible inside.

## Prompt — single continuous shot
```
One continuous ultra-slow cinematic shot of a small transparent electronic device
(squircle smoke-grey polycarbonate shell) on a pure black background #0B0B0C.

PHASE 1 — WIDE HERO (0–3s):
The device sits slightly left in a wide composition with massive dark negative space
on the right and above for text overlays. Camera nearly static. The circular
dot-matrix display glows with a soft warm-white radial light, breathing slowly
outward from the centre like one calm exhale. A tiny red LED glows on the side.
Internal green PCB and copper traces faintly visible through the frosted shell.

PHASE 2 — SLOW PUSH-IN TO DETAIL (3–7s):
Extremely slow smooth dolly push-in. The transparent shell reveals structural ribs,
mounting screws, the green circuit board. The dot-matrix fills more of the frame, its
radial glow expanding and contracting once more. The brushed-aluminium dial grows
prominent — gear-toothed serrated rim catching the key light, concentric tool marks
on the metal, the thin red indicator line crisp.

PHASE 3 — CLOSE DETAIL + ATMOSPHERE (7–10s):
Push-in continues until display and dial fill most of the frame. Individual pinhole
dots faintly visible. Sparse warm-white dust particles drift extremely slowly, like
dust in a projector beam. Transparent shell glows faintly along its rim-lit edges.
Intimate, like examining a precious instrument.

MOTION RULES: one continuous ultra-slow push-in, no stops, no speed changes, perfectly
smooth mechanical dolly; display glow breathes exactly twice over the full duration;
the dial does NOT rotate; all internal parts stay still; no camera shake; black stays
pure; dust nearly frozen.

PROHIBITIONS: no people; no text/logos/branding in the video; no busy background; no
fast cuts; no shaky camera; no overdone particles; no monitor/workspace elements (pure
black void); no sound-wave visuals outside the display.

Feel: Nothing Phone launch film meets Apple product reveal. Every frame a magazine ad.
Ultra-premium, ultra-slow, ultra-quiet.
```

## Output
Save as `assets/videos/resona-scroll-background.mp4`.
Then swap the hero from the 4-frame image sequence to a single `<video>` scrubbed by
`currentTime` (the `scrubHero()` mapping stays — just drive `currentTime` instead of
frame opacity).
