# Memory Pendant: scroll-driven product page

A single static product page. On scroll, a landmark recedes and becomes the picture inside a square pendant. The pendant then moves aside while the product details appear. It's plain HTML, CSS and JS with no build step. GSAP, ScrollTrigger and Lenis load from CDNs with pinned versions.

## Run it

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open the printed URL.

You can also open `index.html` straight from disk and the page works. Browsers block `fetch()` on `file://`, though, so the landmark can't be inlined. It falls back to an `<img>` tinted with a CSS filter instead of the exact palette colour. Use a local server to see the real colours.

## Make a new location

1. **`js/config.js`**: change `location`, `product` and `palette`. This is the only file with place-specific text or colours.
2. **`assets/landmark.svg`**: replace it with the new landmark silhouette.
   - Use `fill="currentColor"` so the theme can recolour it.
   - Any `viewBox` works. The page reads the aspect ratio from it.
   - Set the bottom of the landmark on the bottom edge of the viewBox, because the scene anchors to the ground line.
3. **`assets/pendant-placeholder.svg`** (or whatever file `product.pendantImage` points to): replace it with the real product render.
4. **`product.pendantWindow`**: if the new image's glass window sits somewhere else, update this. It tells the page where the window is inside the image so the live scene lines up with it. All three values are fractions of the **image width**:
   - `x`: the window's left edge;
   - `y`: the window's top edge;
   - `size`: the window's side length.

   For the placeholder (300 × 500 viewBox, window at 78,318, size 144) that gives `{ x: 0.26, y: 1.06, size: 0.48 }`.

   If the window is transparent (as in the placeholder), the live landmark scene stays visible through the glass. An opaque photo simply covers it.

Palette keys per theme: `skyTop`, `skyBottom`, `accent`, `landmark`, `text`. Each key becomes a CSS variable (`--night-sky-top`, `--day-landmark`, …).

## File map

| File | Role |
|---|---|
| `index.html` | Markup for the scene. Holds generic fallback text that shows if JS fails. `data-config` attributes mark where config values go. |
| `css/style.css` | All styles, written with native CSS nesting. There are two layouts:<br>• a static stacked one (no JS, reduced motion, or a library failed to load);<br>• the animated one, scoped under `html.is-animated`. |
| `js/config.js` | `window.PENDANT_CONFIG`: every location- and product-specific value. |
| `js/theme.js` | Runs in `<head>` before first paint. It:<br>• applies the palette;<br>• picks day or night (saved choice, then `prefers-color-scheme`);<br>• handles the toggle;<br>• generates the stars and clouds. |
| `js/scene.js` | Fills the page from config, inlines the landmark SVG, builds the GSAP timelines, starts Lenis, and holds the add-to-cart hook. |
| `assets/landmark.svg` | Landmark silhouette. |
| `assets/pendant-placeholder.svg` | Placeholder product render (bezel, bail, chain, glass). |

## Scroll phases

The scene section is 450svh tall. Inside it, a sticky 100dvh stage holds one GSAP timeline scrubbed by ScrollTrigger (`scrub: 0.6`). Desktop (≥ 900px) and mobile get separate timelines with the same phases, built with `gsap.matchMedia()`.

| Progress | Phase | What happens |
|---|---|---|
| 0–8% | Hold | The landmark is large and centred, with the pulsing "Scroll" nudge. The nudge fades out within the first 3%. |
| 8–40% | Shrink away | The landmark shrinks and drifts toward its final spot in the window, and haze builds over it. The star and cloud layers move at different speeds for parallax. |
| 40–58% | Becomes the pendant | Steps overlap:<br>• 40–52%: the haze clears and the scene's clip closes from full screen to the bezel's inner square;<br>• 44–53%: the bezel scales in;<br>• 46–54%: the chain drops in;<br>• 46–56%: everything outside the window dims;<br>• 53–58%: the scene crossfades into `pendantImage`. |
| 58–100% | Reveal | **Desktop:** the pendant moves to the left half (60–80%) and the details stagger in on the right (66–90%).<br>**Mobile:** the pendant scales down and moves up (60–80%), the details slide up beneath it (68–82%), and the sticky buy bar appears after 90%. |

The layout numbers are CSS variables on `section.custom_pendant_scene`:
- `--sq`: size of the window;
- `--d-pendant-x`: final horizontal position on desktop;
- `--m-pendant-scale` and `--m-pendant-y`: final scale and vertical position on mobile.

JS reads these at every refresh, so you can tune the layout from CSS alone.

## Behaviour notes

- **Smooth scrolling:** Lenis runs only on fine-pointer devices without reduced motion. Touch devices use native scroll. `normalizeScroll` is not used.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, there's no pinned animation. The page shows a static stack: landmark, then pendant (with the scene in its window), then details.
- **Theme:** the choice is saved in `localStorage` under `pendant-theme`. It's applied in `<head>` before paint, so there's no flash. Day and night sky layers crossfade over 600ms.
- **Animated properties:** only `transform` and `opacity` are animated, plus a `--clip` variable that drives the window's `clip-path: inset()`.

## Porting to Shopify

The scene is self-contained: one `<section>` with its own CSS and JS, and no globals besides the config. To turn it into a section:

1. Move the markup into `sections/pendant-scene.liquid`.
2. Replace `window.PENDANT_CONFIG` with JSON rendered from Liquid:
   - `product.title`, `product.price | money` and `product.description`;
   - bullets from a list metafield;
   - `pendantImage` from the featured media;
   - `landmarkSvg`, `tagline`, `pendantWindow` and `palette` from product metafields (or section settings).
3. Replace the body of `onAddToCart(product)` in `js/scene.js` with a `fetch('/cart/add.js', …)` call that returns its Promise. The button already waits for the Promise before showing "Added".
4. Load GSAP, ScrollTrigger and Lenis from the theme's assets or the same pinned CDN URLs.
