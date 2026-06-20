import { defineConfig } from 'vite'

// Vanilla Vite. The dev server (sirv) serves files in public/ with HTTP Range
// support, which is required so the browser can SEEK the background video as it
// scrubs with scroll. No framework, no plugins.
export default defineConfig({
  server: {
    host: true,
    open: false,
    port: Number(process.env.PORT) || 5173,
  },
  build: {
    target: 'es2020',
    assetsInlineLimit: 0, // never inline the video/images
  },
})
