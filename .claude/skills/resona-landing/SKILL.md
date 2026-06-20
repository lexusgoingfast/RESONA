---
name: resona-landing
description: Build instructions for the RESONA premium scroll-driven product landing page — a fictional generative ambient sound device. Use when building, rebuilding, or extending the RESONA marketing site (Vite + vanilla JS + GSAP ScrollTrigger + Lenis), or when wiring its sections, motion, brand tokens, or scroll-scrub hero video.
---

# RESONA — Landing Page Build Skill

A single-page, scroll-driven product landing page for **RESONA**, a *fictional*
premium generative ambient sound object. The page should feel like visiting a
gallery, not a store: every scroll position is a composed frame. Subtraction over
features. It wants to be ignored, then admired up close.

> Reference brand kit: `copy/brand-kit.md` (canonical source for copy, specs, and
> tone). If absent, the equivalent lives at `/Users/lexxxus/Downloads/brand-kit.md`.
> These instructions encode the locked decisions; re-read the kit for long-form copy.

---

## 1. Product

**RESONA Object No.1** — a palm-sized generative ambient sound instrument. Not a
speaker, not a smart device, not a player. It generates original ambient sound in
real time — sound that never existed before and never will again.

- **Form**: squircle block, softly rounded corners, slightly taller than wide
  (~85 × 78 × 32 mm). Clear **smoke-grey transparent polycarbonate** shell with a
  soft matte frost. Internals deliberately visible: green PCB with copper traces,
  structural ribs, mounting posts, tiny screws, four corner mounting eyelets.
- **Display** (upper half): a large circular recessed **dot-matrix** panel —
  hundreds of physical pinhole LEDs that glow in organic patterns (radial ripples,
  constellations, density gradients) visualizing the sound.
- **Dial** (lower half): a large round **flat brushed-aluminum rotary dial**, flush
  mounted, concentric CNC tool marks, gear-toothed serrated rim, one thin **red**
  painted indicator line. Selects four sound modes.
- **Ports/details**: 3.5 mm headphone jack (left), tiny red LED (right), USB-C
  (bottom edge).
- **Four modes** (generative, infinite, non-repeating):
  - `DRIFT` — warm pads · slow tide · for late afternoons
  - `PULSE` — soft heartbeat · concentric · for thinking
  - `RAIN` — falling tones · grey light · for focus
  - `STILL` — almost silence · barely there · for sleep
- **Specs**: 40 h battery · 98 g · USB-C 2 h charge · built-in speaker + 3.5 mm out ·
  proprietary generative synthesis (no samples, no loops) · **repeats per lifetime: 0**.

---

## 2. Design tokens

Dark mode is the **website default**. The light palette is for product photography
only — never the site.

```css
:root{
  --bg:#0B0B0C;        /* Void — page background, hero */
  --surface:#131315;   /* Graphite — cards, elevated/glass panels */
  --hair:#232326;      /* Hairline — dividers, 1px rules, borders */
  --text:#ECECEC;      /* Ash — headlines, body */
  --muted:#6B6B70;     /* Smoke — captions, labels, secondary */
  --accent:#FF294D;    /* Signal Red — LED + dial indicator only */

  --font-display:"Space Grotesk", sans-serif;
  --font-mono:"JetBrains Mono", monospace;

  /* easing = the personality of the motion */
  --ease-out-expo:cubic-bezier(0.16,1,0.3,1);
  --ease-in-out-quint:cubic-bezier(0.83,0,0.17,1);
}
```

Light mode (photography/print only, NOT the site): Paper `#FDFDFF`, Warm Grey
`#F0F0F2`, Carbon `#1A1A1C`, same accent `#FF294D`.

---

## 3. Typography

- **Display / headlines** — **Space Grotesk** 600–700. Tight tracking `-0.04em` on
  large headlines. h1, h2, product name, hero.
- **Mono / labels** — **JetBrains Mono** 400–500. ALL-CAPS, tracking `0.12em`, size
  11–13px. Section labels, spec values, nav indices, eyebrows, technical captions.
- **Body** — Space Grotesk 400, 15–16px, line-height 1.5 (manifesto, descriptions).
- **No serifs anywhere.** The brand is engineered, not editorial.
- **Logo** — pure text `RESONA`, Space Grotesk 700, all-caps, tracking `0.28em`. No
  symbol, no icon. White on dark, never in Signal Red.

Load via Google Fonts (`Space Grotesk` 400;500;600;700 + `JetBrains Mono` 400;500)
with `preconnect`, or self-host into `public/assets/fonts/`.

---

## 4. Tech stack

- **Vite** — dev server + build (`npm create vite@latest`, vanilla template).
- **Vanilla JS** (ES modules) — no UI framework. Hand-rolled cursor, magnetic
  buttons, canvas dot-matrix, interactive dial.
- **Lenis** — smooth inertial scroll (drives the whole scroll feel).
- **GSAP + ScrollTrigger** — scroll-linked animation, pinned sections, the
  scroll-scrub hero video, blur-up reveals. Sync Lenis ↔ ScrollTrigger via
  `lenis.on('scroll', ScrollTrigger.update)` and drive `lenis.raf` from
  `gsap.ticker`.
- No jQuery, no Bootstrap, no Tailwind. Keep the bundle lean (the page must feel
  fast — it's a gallery).

---

## 5. File structure (`website/`)

```
website/
  index.html                 # single page, semantic sections
  package.json
  vite.config.js
  public/
    assets/
      product/               # black-bg product renders (stills)
      videos/                # scroll-scrub hero video (mp4)
      fonts/                 # optional self-hosted fonts
  src/
    main.js                  # entry: boot Lenis + GSAP, init modules
    styles/
      tokens.css             # :root variables (section 2)
      base.css               # reset, body, typography, .mono, cursor, glass
      sections.css           # per-section layout
    js/
      smooth-scroll.js       # Lenis setup + GSAP ticker bridge
      cursor.js              # custom lerp-chase cursor + hover states
      magnetic.js            # magnetic buttons (pointer-drift)
      reveal.js              # blur-up text + ScrollTrigger section reveals
      dot-matrix.js          # canvas glyph factory (modes/dial backgrounds)
      dial.js                # interactive draggable dial → mode state
      hero-scrub.js          # scroll-scrubbed hero video (currentTime)
      modes.js               # Sound Modes cards ↔ shared mode state
```

Keep one shared `mode` state (0–3) that both the dial and the Sound-Modes cards
write through a single `applyMode(i)` so dial, cards, readout, and every dot-matrix
canvas stay in sync.

---

## 6. Section structure

Build in this order (single scroll narrative):

1. **Hero** — full-viewport. Scroll-scrubbed product film (see §7) with the product
   sitting right-of-center; `RESONA` nav, eyebrow `Object No.1 — Ambient instrument`,
   headline **“Sound that never repeats.”**, short mono lead, scroll cue. Generous
   dark negative space on the left for the text.
2. **Manifesto** — scroll-reveal text block. Lines blur-up as they enter view.
   “Most devices want your attention. This one wants the opposite. …and answers with
   sound that has never existed and will never exist again.”
3. **The Object** — split layout: product render (left) with 3D tilt-on-hover;
   short poetic heading (right). Transparent shell is the hero of the frame.
4. **Transparency** — “Nothing to hide.” Engineering-as-aesthetic: a blueprint/
   schematic (inline SVG) or macro of the internals with callout labels that reveal
   on scroll (polycarbonate, PCB + copper, dot-matrix, aluminum dial, red indicator).
5. **Sound Modes** — “One dial. Four worlds.” Four interactive cards DRIFT / PULSE /
   RAIN / STILL over a background dot-matrix canvas; clicking a card changes the
   shared mode + the canvas pattern + (optionally) rotates the dial.
6. **The Dial** — interactive draggable circular dial. Rotating snaps between the
   four modes, updates the dot-matrix visualization and the readout text. Physical
   metaphor for the real control.
7. **Made For** — the audience, stated quietly: designers, developers, writers,
   editors — people who use sound for deep focus and are tired of screens and
   algorithms. Restrained, no personas, no stock faces.
8. **Specs** — number tickers that count up on scroll: Battery 40 hrs · Weight 98 g ·
   Charge 2 hrs (USB-C) · Repeats per lifetime 0. Mono labels, large display numerals.
9. **CTA** — large typographic closer “Play nothing. Hear everything.” Single
   pre-order / reserve button (€0, waitlist model) with magnetic hover. No price
   pressure.
10. **Footer** — minimal: brand name, year, “fictional object — built to learn
    design engineering.”

(Optional accents from the kit: a mono **marquee** strip after the hero, and an
atmospheric **In the Room** lifestyle section before the CTA.)

---

## 7. Motion & interaction rules

- **Scroll-scrub hero video** — the hero video does **not** autoplay. Pin the hero
  with ScrollTrigger; map scroll progress 0→1 to `video.currentTime`. The browser
  must be served with **HTTP Range support** or Chrome won’t seek (`206 Partial
  Content`). Every frame must be a clean still (no motion blur) — the film is a
  filmstrip where any frame is a hero image. Smooth the seek (lerp the target
  `currentTime`).
- **Smooth scroll** — Lenis everywhere; all scroll-linked motion reads Lenis’s
  scroll value (don’t mix native `scrollY`).
- **Custom cursor** — a small dot that chases the pointer via `lerp` each frame;
  grows / changes on hover over interactive elements. Hidden on coarse pointers.
- **Magnetic buttons** — interactive elements drift toward the pointer (~0.3–0.4
  pull), lerp back on leave.
- **Blur-up text reveals** — headlines reveal per word: each word clipped, rising
  from `translateY(110%)` with `blur(12px)→0`, staggered. Body lines fade + rise +
  unblur via ScrollTrigger.
- **Canvas dot-matrix** — a grid of dots driven by `sin(time)` breathing + a
  per-mode field + cursor proximity (near dots brighten / turn accent red). One
  factory, multiple instances (Sound Modes background, Dial section). Drive from a
  single `requestAnimationFrame` loop.
- **Interactive dial** — pointer angle → rotation → mode segment (4 × 90°). Updates
  the shared `mode`, the readout text, the active card, and the dot-matrix field.
- **Number tickers** — Specs count up with an ease-out-quart when scrolled into view.
- **One rAF loop, lerp everything** — cursor, magnets, tilt share a single frame
  loop; `lerp(a,b,n)=a+(b-a)*n` is the smoothness primitive.

---

## 8. Visual rules

- **Glass panels** — elevated cards use `--surface` with subtle translucency +
  `backdrop-filter: blur(8px)` and a 1px `--hair` border, `border-radius` 16–18px.
- **Accent red is rare** — Signal Red `#FF294D` appears **only** where the physical
  product has red (the LED, the dial indicator line) plus the one CTA hover. Never as
  a background, never as large text, never as a gradient. It is a pinhole of color in
  a monochrome world.
- **Hairlines** — structure with 1px `--hair` rules and generous negative space, not
  boxes and shadows.
- **Custom cursor** — replaces the native cursor on fine pointers (`body{cursor:none}`),
  native cursor restored on touch.
- **Cinematic restraint** — low-key, every frame composed; lots of black; the
  product’s own glow is the light source. No drop-shadow soup, no gradients-as-decor.
- **Voice in copy** — lowercase energy, declarative sentences, no exclamation marks,
  no “revolutionary” / “game-changing.” Speak like a friend who designs synthesizers.

---

## 9. Accessibility & performance

- **`prefers-reduced-motion: reduce`** — full fallback: disable all animations and
  transitions, show text un-blurred / in place, do not scrub the hero video (show a
  clean poster frame instead), render the dot-matrix as a static grid.
- Keep the native cursor on touch / coarse pointers; ensure the dial is usable by
  tap/drag.
- Mode cards are real `<button>`s (inherit font + color; focus-visible outline).
- Lazy-load below-the-fold media; the hero video must preload enough to seek.
- Respect color contrast: `--muted` on `--bg` for secondary text only.

---

## 10. Build checklist

1. `npm create vite@latest website -- --template vanilla`; add `lenis` and `gsap`.
2. Drop tokens (§2), fonts (§3), base + glass styles into `src/styles/`.
3. Wire Lenis ↔ GSAP ticker; init the single rAF loop (cursor, magnets, tilt).
4. Lay out the 10 sections (§6) semantically in `index.html`.
5. Implement modules (§5/§7): cursor, magnetic, reveal, dot-matrix, dial, modes,
   hero-scrub.
6. Place product renders in `public/assets/product/` and the scroll video in
   `public/assets/videos/`; serve with Range support for seeking.
7. Add the `prefers-reduced-motion` fallback (§9) and verify keyboard/touch.
8. Acceptance: dark `#0B0B0C` throughout · red only on LED/indicator/CTA-hover ·
   hero scrubs smoothly on scroll · dial and cards share one mode state · every
   hero frame looks like a magazine still.

> Existing project assets (black-bg renders, the generated scroll video) already
> live under the repo’s `assets/`. Reuse them; do not regenerate media as part of a
> build unless explicitly asked.
