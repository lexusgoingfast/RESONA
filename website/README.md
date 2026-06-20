# RESONA — Scroll-Driven Landing Page

A premium, scroll-driven motion website for **RESONA**, a *fictional* generative
ambient sound object. The generated product film is used as a **single fixed
full-screen background** that **scrubs with scroll progress** (it never
autoplays); all page content scrolls over it on glass panels and dark gradients.

Built with **Vite + vanilla JS**, **GSAP / ScrollTrigger**, and **Lenis**. No
framework.

## Quick start

```bash
cd website
npm install
npm run dev
```

Then open the printed local URL (default **http://localhost:5173**).

```bash
npm run build     # production build → dist/
npm run preview   # serve the production build locally
```

> **Why Vite for the video?** Scrubbing a `<video>` via `currentTime` requires the
> server to answer HTTP **Range** requests (`206 Partial Content`) so the browser
> can seek. Vite's dev server (and `vite preview`) do this automatically — no extra
> server needed.

## Structure

```
website/
  index.html              # page markup, fixed video background, 10 sections
  style.css               # tokens, glass, sections, reveals, reduced-motion
  main.js                 # entry: boots Lenis+GSAP, one ticker loop
  vite.config.js
  modules/
    util.js               # lerp/clamp, shared pointer, env flags
    smooth-scroll.js      # Lenis + GSAP ticker bridge
    video-scrub.js        # fixed background video scrubbed by scroll
    cursor.js             # custom lerp-chase cursor
    magnetic.js           # magnetic buttons
    tilt.js               # 3D tilt on cards
    reveals.js            # blur-up reveals + hero headline + number tickers
    dot-matrix.js         # canvas dot-grid factory (4 mode patterns)
    state.js              # shared sound-mode state (dial ↔ cards)
    modes.js              # Sound-Modes cards
    dial.js               # interactive draggable dial
  public/
    assets/
      product/            # product renders (reused, not regenerated)
      videos/             # resona-scroll-background.mp4 (the scrub film)
```

## Sections

Hero · Marquee · Manifesto · The Object · Transparency · Sound Modes · The Dial ·
Specs Grid · CTA · Footer.

## Notes

- **Dependencies:** `gsap`, `lenis`. (The brief referenced `@studio-freight/lenis`,
  which has been **renamed to `lenis`** — this project uses the maintained package;
  the import is `import Lenis from 'lenis'`.)
- **Accent red `#FF294D`** is used only on the LED/dial indicator and the CTA hover.
- **Custom cursor** and magnetic/tilt effects are fine-pointer only; touch devices
  fall back to native interactions and stacked layouts.
- **`prefers-reduced-motion: reduce`** disables all animation, stops video
  scrubbing (shows the poster frame), and renders the dot-matrix statically.
- Media (renders + video) is reused from the project; nothing is generated here.
